# 🚀 Deployment Guide: FlashDeck AI

To achieve a "push-to-deploy" workflow where both your frontend and backend update automatically when you push to GitHub, the best approach is to use **Vercel** for the frontend and **Render** (or Railway) for the backend.

Both services connect directly to your GitHub repository and will trigger a new build every time you push to the `main` branch.

---

## 1. Backend Deployment (FastAPI on Render)

Since Vercel has short timeouts for Python functions, **Render** is recommended for the AI backend because it supports long-running processes (perfect for PDF analysis).

1.  **Create an Account**: Sign up at [render.com](https://render.com).
2.  **New Web Service**: Click "New" > "Web Service" and connect your GitHub repository.
3.  **Configure**:
    -   **Name**: `flashdeck-backend`
    -   **Root Directory**: `backend`
    -   **Runtime**: `Python 3`
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4.  **Environment Variables**: Click "Advanced" and add your keys from `.env`:
    -   `GROQ_API_KEY`
    -   `GOOGLE_API_KEY`
    -   `OPENROUTER_API_KEY`
    -   `AI_MODEL`: `llama-3.3-70b-versatile`
5.  **Deploy**: Render will give you a URL like `https://flashdeck-backend.onrender.com`.

---

## 2. Frontend Deployment (React on Vercel)

1.  **Create an Account**: Sign up at [vercel.com](https://vercel.com).
2.  **New Project**: Click "Add New" > "Project" and import your GitHub repository.
3.  **Configure**:
    -   **Framework Preset**: `Vite`
    -   **Root Directory**: `frontend`
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
4.  **Environment Variables**:
    -   Add `VITE_API_URL` and set it to your **Render URL** (e.g., `https://flashdeck-backend.onrender.com`).
5.  **Deploy**: Vercel will give you your live website URL!

---

## 3. Critical Production Steps

### A. Update Frontend API Calls
In your frontend code, ensure you are using an environment variable for the API base URL instead of a hardcoded `localhost`. 

*Example in `DeckContext.jsx`:*
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// Change fetch('http://127.0.0.1:8000/chat') to fetch(`${API_BASE}/chat`)
```

### B. Update Backend CORS
In `backend/main.py`, update the `allow_origins` to include your Vercel URL so the backend accepts requests from your live site.

```python
origins = [
    "http://localhost:5173",
    "https://your-app-name.vercel.app", # Add this!
]
```

---

## 🔄 The "Seamless" Workflow
Once set up:
1.  **Code**: Make changes to your frontend or backend on your laptop.
2.  **Push**: `git add .` -> `git commit -m "Update"` -> `git push origin main`.
3.  **Auto-Update**: Vercel will detect the push and update your website. Render will detect the push and update your API. 

**Total time to live: ~2 minutes.**
