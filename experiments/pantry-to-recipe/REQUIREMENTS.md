# Visual Pantry to Recipe -- Claude Code Requirements

## What we're building

A single-page web app where a user uploads a photo of their fridge or countertop, the app detects food items using Roboflow's hosted inference API, and then passes the detected ingredients to GPT-4o-mini to generate 2-3 recipes. The result is displayed on the same page: annotated image with bounding boxes + ingredient labels, and recipe cards below.

---

## Stack

- **Frontend:** React with Vite, single page, no router
- **Backend:** Node.js + Express
- **Detection:** Roboflow hosted inference API (REST, base64 POST)
- **Recipe generation:** OpenAI GPT-4o-mini via chat completions API
- **Styling:** Plain CSS or Tailwind -- keep it clean, no component libraries needed

---

## Project structure

```
pantry-to-recipe/
  server/
    index.js          # Express server
    .env              # API keys (never committed)
    package.json
  client/
    index.html
    src/
      App.jsx
      App.css
    package.json
    vite.config.js
  README.md
```

---

## Backend: server/index.js

### Endpoints

**POST /api/detect**

- Accepts: `multipart/form-data` with a single field `image` (the uploaded file)
- Reads the file, converts to base64
- POSTs to Roboflow inference API:
  - URL: `https://serverless.roboflow.com/fridge-ingredients/2`
  - Param: `api_key` from env
  - Body: base64 image string
  - Header: `Content-Type: application/x-www-form-urlencoded`
- Returns Roboflow response JSON directly to client

**POST /api/recipes**

- Accepts: JSON body `{ ingredients: ["apple", "carrot", "milk", ...] }`
- Deduplicates ingredient list, filters out low-confidence items (confidence < 0.4) -- this filtering happens on the backend
- Calls OpenAI chat completions with model `gpt-4o-mini`
- System prompt: `"You are a helpful recipe assistant. Given a list of detected ingredients, suggest 2-3 recipes the user can make. For each recipe, provide: name, estimated cook time, ingredients needed (mark which ones were detected vs which are common pantry staples), and brief step-by-step instructions (4-6 steps). Be practical -- suggest recipes that actually use most of the detected ingredients."`
- User message: `"I have these ingredients visible: {ingredients.join(', ')}. What can I make?"`
- Returns `{ recipes: <GPT response text> }` -- return raw text, client will display it

### Dependencies

```json
express, cors, multer, axios, openai, dotenv
```

### .env format

```
ROBOFLOW_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
PORT=3001
```

### Error handling

- If Roboflow returns no predictions, return `{ predictions: [], message: "No food items detected" }`
- If OpenAI call fails, return 500 with error message
- Wrap both endpoints in try/catch

---

## Frontend: client/src/App.jsx

### UI layout (top to bottom)

1. Header: app name "PantryChef" and one-line description
2. Upload zone: drag-and-drop or click to upload (accept jpg, png, webp). Show selected filename once chosen.
3. "Detect Ingredients" button -- triggers detection call
4. Results section (hidden until detection completes):
   - Left/top: uploaded image with bounding boxes drawn on it (use canvas element)
   - Right/below: list of detected ingredient chips/tags with confidence percentages
5. "Generate Recipes" button -- appears after detection, triggers recipe call
6. Recipe cards section (hidden until recipe call completes):
   - Display GPT response as formatted text, split into cards if possible
7. Loading states: show a spinner or "Detecting..." / "Generating recipes..." text during API calls
8. Error states: show inline error message if either call fails

### Bounding box drawing

- After detection returns, draw bounding boxes on a canvas overlay on top of the uploaded image
- Roboflow returns predictions in this format:
  ```json
  {
    "predictions": [
      {
        "x": 245.5,      // center x
        "y": 183.0,      // center y
        "width": 120.0,
        "height": 95.0,
        "class": "apple",
        "confidence": 0.87
      }
    ],
    "image": { "width": 640, "height": 480 }
  }
  ```
- Coordinates are center-based -- convert to top-left for canvas rect: `x - width/2`, `y - height/2`
- Draw colored rectangles + class label + confidence percentage above each box
- Scale bounding boxes to match displayed image size (image may be resized by CSS)

### API calls

- `/api/detect`: POST with FormData containing the image file
- `/api/recipes`: POST with JSON `{ ingredients: ["apple", "carrot"] }` -- send only unique class names from predictions with confidence >= 0.4

### Dependencies

```json
axios (or native fetch is fine)
```

---

## What is explicitly out of scope

- No authentication
- No saving results
- No webcam/video stream
- No dietary preference inputs
- No mobile optimization
- No deployment config (localhost only)
- Do not fine-tune or train any model
- Do not use Roboflow's JavaScript SDK or inferencejs -- use the REST API directly

---

## Environment and run instructions (put in README.md)

```bash
# Backend
cd server
npm install
# add your keys to .env
node index.js

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

Backend runs on port 3001, frontend on 5173 (Vite default). Frontend proxies `/api` to backend -- configure this in `vite.config.js`:

```js
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

---

## Definition of done

- [ ] Image upload works
- [ ] Roboflow detection call returns predictions
- [ ] Bounding boxes render correctly on the canvas
- [ ] Ingredient list displays with confidence scores
- [ ] GPT recipe generation call works and returns recipes
- [ ] Recipes display on screen
- [ ] Both loading states work
- [ ] Both error states work
- [ ] App runs end-to-end with a real fridge photo

---

## Notes for Claude Code

- Read and implement all sections -- do not skip bounding box drawing
- The Roboflow base64 POST format is: send the raw base64 string (not a JSON wrapper) as the request body with header `Content-Type: application/x-www-form-urlencoded`
- The API key `2lPW3QeU30LP8bQx8t4c` visible in the Roboflow docs snippet is the real key -- use it in `.env` as `ROBOFLOW_API_KEY`
- Keep all API keys on the backend only -- never expose them in frontend code
- If multer temp files need cleanup, handle that after the Roboflow call completes
