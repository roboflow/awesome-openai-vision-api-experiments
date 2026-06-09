import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Memory storage: the image is immediately base64-encoded and forwarded to
// Roboflow, so there's no need for temp files on disk (and nothing to clean up).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json());

// Model v1: deluxeviper/fridge-ingredients/2 -- disabled: apple-dominated dataset
// Model v2: james-elcock/fridge-detection-ojugs/6 -- active
const ROBOFLOW_DETECT_URL = 'https://serverless.roboflow.com/fridge-detection-ojugs/6';

const RECIPE_SYSTEM_PROMPT =
  'You are a helpful recipe assistant. Given a list of detected ingredients, ' +
  'suggest 2-3 recipes the user can make. For each recipe, provide: name, ' +
  'estimated cook time, ingredients needed (mark which ones were detected vs ' +
  'which are common pantry staples), and brief step-by-step instructions (4-6 ' +
  'steps). Be practical -- suggest recipes that actually use most of the ' +
  'detected ingredients.';

app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64Image = req.file.buffer.toString('base64');

    const roboflowResponse = await axios.post(ROBOFLOW_DETECT_URL, base64Image, {
      params: { api_key: process.env.ROBOFLOW_API_KEY },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = roboflowResponse.data;

    if (!data.predictions || data.predictions.length === 0) {
      return res.json({ predictions: [], message: 'No food items detected' });
    }

    return res.json(data);
  } catch (err) {
    console.error('Detection error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to detect ingredients' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'No ingredients provided' });
    }

    // Confidence-based filtering already happens on the client (predictions
    // carry confidence scores; this endpoint only receives plain class-name
    // strings). Here we just deduplicate, case-insensitively.
    const seen = new Set();
    const uniqueIngredients = [];
    for (const ingredient of ingredients) {
      const key = String(ingredient).trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueIngredients.push(String(ingredient).trim());
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `I have these ingredients visible: ${uniqueIngredients.join(', ')}. What can I make?`,
        },
      ],
    });

    const recipesText = completion.choices[0]?.message?.content || '';

    return res.json({ recipes: recipesText });
  } catch (err) {
    console.error('Recipe generation error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to generate recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`PantryChef server listening on http://localhost:${PORT}`);
});
