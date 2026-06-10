import { useEffect, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CONFIDENCE_THRESHOLD = 0.35;
const BOX_COLOR = '#22c55e';

// Roboflow returns one prediction per detected instance, so the same class
// (e.g. "Apple") can appear many times. For the chip list we want one chip per
// class, labeled with its highest confidence score among all instances.
function groupPredictionsByClass(predictions) {
  const byClass = new Map();
  for (const p of predictions) {
    const key = p.class.toLowerCase();
    const existing = byClass.get(key);
    if (!existing || p.confidence > existing.confidence) {
      byClass.set(key, { class: p.class, confidence: p.confidence });
    }
  }
  return [...byClass.values()];
}

// GPT's response is raw text (per the system prompt's contract), and its
// markdown formatting varies run to run -- sometimes "### Recipe 1: **Name**",
// sometimes a bare "**Name**". Generic markdown/numbered-line matching also
// catches section labels ("**Ingredients:**") and instruction steps
// ("1. Preheat..."), over-fragmenting the text. Instead we anchor on a phrase
// the system prompt *requires* once per recipe -- "estimated cook time" --
// which is far more reliable than guessing at heading styles. If fewer than
// two such anchors are found, the formatting wasn't predictable enough to
// split -- fall back to a single card so nothing is lost.
function splitRecipesIntoCards(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const anchorPattern = /cook(?:ing)?\s*time/i;

  const anchorIndices = [];
  lines.forEach((line, i) => {
    if (anchorPattern.test(line)) anchorIndices.push(i);
  });

  if (anchorIndices.length < 2) {
    return [text.trim()];
  }

  // Each card starts at the recipe's name line, which sits within a couple
  // lines above its "cook time" anchor (e.g. "### Recipe 1: **Name**" then
  // "**Estimated Cook Time:** 30 minutes" right below it).
  const cardStarts = anchorIndices.map((anchorIdx) => {
    for (let back = 1; back <= 2; back++) {
      const idx = anchorIdx - back;
      if (idx < 0) break;
      const trimmed = lines[idx].trim();
      if (trimmed && !anchorPattern.test(trimmed)) return idx;
    }
    return anchorIdx;
  });

  const cards = [];
  for (let i = 0; i < cardStarts.length; i++) {
    const start = cardStarts[i];
    const end = i + 1 < cardStarts.length ? cardStarts[i + 1] : lines.length;
    const chunk = lines.slice(start, end).join('\n').trim();
    if (chunk) cards.push(chunk);
  }
  return cards;
}

function cardTitleAndBody(card) {
  const [firstLine, ...rest] = card.split('\n');
  const title = firstLine
    .replace(/^[\s#*\d.)-]+/, '')
    .replace(/\*\*/g, '')
    .replace(/^Recipe\s*\d+\s*[:.-]?\s*/i, '')
    .trim();
  const body = rest.join('\n').trim();
  return { title, body };
}

// Renders **bold** markdown spans as <strong> elements. Splits on the bold
// delimiters and keeps them in the result (capturing group), then maps each
// piece to either a <strong> node or a plain text node -- avoids
// dangerouslySetInnerHTML since this is rendering raw GPT output.
function renderWithBold(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    return match ? <strong key={`${keyPrefix}-${i}`}>{match[1]}</strong> : part;
  });
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [detectMessage, setDetectMessage] = useState(null);

  const [generatingRecipes, setGeneratingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState(null);
  const [recipesText, setRecipesText] = useState(null);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Revoke the previous object URL whenever it's replaced or the app unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Draw bounding boxes on a canvas overlaid on the displayed image. Boxes are
  // scaled from the image's natural (original) pixel dimensions to whatever
  // size it's actually rendered at, and redrawn on resize so they stay aligned.
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !predictions || predictions.length === 0) return;

    const draw = () => {
      const displayWidth = img.clientWidth;
      const displayHeight = img.clientHeight;
      if (!displayWidth || !displayHeight || !img.naturalWidth || !img.naturalHeight) return;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const scaleX = displayWidth / img.naturalWidth;
      const scaleY = displayHeight / img.naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.textBaseline = 'middle';

      predictions.forEach((pred) => {
        const boxX = (pred.x - pred.width / 2) * scaleX;
        const boxY = (pred.y - pred.height / 2) * scaleY;
        const boxW = pred.width * scaleX;
        const boxH = pred.height * scaleY;

        ctx.strokeStyle = BOX_COLOR;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
        const labelHeight = 20;
        const labelWidth = ctx.measureText(label).width + 10;
        const labelY = boxY - labelHeight >= 0 ? boxY - labelHeight : boxY;

        ctx.fillStyle = BOX_COLOR;
        ctx.fillRect(boxX, labelY, labelWidth, labelHeight);

        ctx.fillStyle = '#0f172a';
        ctx.fillText(label, boxX + 5, labelY + labelHeight / 2 + 1);
      });
    };

    if (img.complete && img.naturalWidth) {
      draw();
    } else {
      img.addEventListener('load', draw);
    }

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(img);

    return () => {
      img.removeEventListener('load', draw);
      resizeObserver.disconnect();
    };
  }, [predictions, previewUrl]);

  const resetDownstreamState = () => {
    setDetectError(null);
    setPredictions(null);
    setDetectMessage(null);
    setRecipeError(null);
    setRecipesText(null);
  };

  const handleFileSelect = (selected) => {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setDetectError('Please choose a JPG, PNG, or WEBP image.');
      return;
    }
    resetDownstreamState();
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleDetect = async () => {
    if (!file || detecting) return;
    setDetecting(true);
    resetDownstreamState();

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/detect', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Detection request failed.');
      }

      if (data.message) {
        setDetectMessage(data.message);
        setPredictions([]);
      } else {
        setPredictions(data.predictions || []);
      }
    } catch (err) {
      setDetectError(err.message || 'Failed to detect ingredients.');
    } finally {
      setDetecting(false);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!predictions || predictions.length === 0 || generatingRecipes) return;
    setGeneratingRecipes(true);
    setRecipeError(null);
    setRecipesText(null);

    try {
      const uniqueIngredients = [
        ...new Set(
          predictions
            .filter((p) => p.confidence >= CONFIDENCE_THRESHOLD)
            .map((p) => p.class),
        ),
      ];

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: uniqueIngredients }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Recipe request failed.');
      }

      setRecipesText(data.recipes);
    } catch (err) {
      setRecipeError(err.message || 'Failed to generate recipes.');
    } finally {
      setGeneratingRecipes(false);
    }
  };

  const showResults = predictions !== null;
  const hasDetections = Boolean(predictions && predictions.length > 0);
  const visibleIngredients = predictions
    ? groupPredictionsByClass(predictions.filter((p) => p.confidence >= CONFIDENCE_THRESHOLD))
    : [];
  const recipeCards = recipesText ? splitRecipesIntoCards(recipesText) : [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>PantryChef</h1>
        <p>Snap a photo of your fridge or counter -- we'll spot what's in it and suggest something to cook.</p>
      </header>

      <section className="card">
        <div
          className={`dropzone${isDragging ? ' dropzone-active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
          {file ? (
            <p className="dropzone-filename">Selected: {file.name}</p>
          ) : (
            <p>Drag &amp; drop a photo here, or click to choose a file (JPG, PNG, WEBP)</p>
          )}
        </div>

        <button
          className="primary-button"
          onClick={handleDetect}
          disabled={!file || detecting}
        >
          {detecting ? 'Detecting...' : 'Detect Ingredients'}
        </button>

        {detecting && (
          <p className="status-text">
            <Spinner /> Detecting...
          </p>
        )}
        {detectError && <p className="error-banner">{detectError}</p>}
      </section>

      {showResults && (
        <section className="card results-section">
          {hasDetections ? (
            <>
              <div className="image-panel">
                <div className="image-wrapper">
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="Uploaded food for detection"
                    className="preview-image"
                  />
                  <canvas ref={canvasRef} className="bbox-canvas" />
                </div>
              </div>

              <div className="ingredient-panel">
                <h2>Detected ingredients</h2>
                <ul className="chip-list">
                  {visibleIngredients.map((item) => (
                    <li className="chip" key={item.class.toLowerCase()}>
                      <span className="chip-name">{item.class}</span>
                      <span className="chip-confidence">{Math.round(item.confidence * 100)}%</span>
                    </li>
                  ))}
                </ul>

                {visibleIngredients.length > 0 && (
                  <button
                    className="primary-button"
                    onClick={handleGenerateRecipes}
                    disabled={generatingRecipes}
                  >
                    {generatingRecipes ? 'Generating recipes...' : 'Generate Recipes'}
                  </button>
                )}

                {generatingRecipes && (
                  <p className="status-text">
                    <Spinner /> Generating recipes...
                  </p>
                )}
                {recipeError && <p className="error-banner">{recipeError}</p>}
              </div>
            </>
          ) : (
            <p className="empty-message">{detectMessage || 'No food items detected.'}</p>
          )}
        </section>
      )}

      {recipeCards.length > 0 && (
        <section className="card recipes-section">
          <h2>Recipe ideas</h2>
          <div className="recipe-cards">
            {recipeCards.map((card, i) => {
              const { title, body } = cardTitleAndBody(card);
              return (
                <article className="recipe-card" key={i}>
                  <h3>{title || `Recipe ${i + 1}`}</h3>
                  <div className="recipe-card-body">{renderWithBold(body, `card-${i}`)}</div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
