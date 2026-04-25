# 🔍 Ommni Vision — AI Object Detection System

> **Real-time object detection + AI scene summaries** — powered by YOLOv8, Groq (LLaMA 3.1), FastAPI & React

[![GitHub](https://img.shields.io/badge/GitHub-omnivision--ai-black?logo=github)](https://github.com/Onkar-nst/omnivision-ai)

---

## 🧠 What This Project Does

Ommni Vision is an AI-powered vision system with two modes:

| Mode | Description |
|------|-------------|
| 📁 **Upload** | Upload any image → YOLOv8 detects all objects → Groq AI generates a 3-point scene summary |
| 🎥 **Live Cam** | Real-time webcam stream with canvas-overlay bounding boxes — zero freeze, completion-based processing |

**Upload flow steps (animated):**
1. 🔍 Object found — YOLOv8 neural detection
2. 📊 Object details scraping — processing bounding boxes
3. ✨ Summary ready — Groq LLaMA 3.1 generates 3 AI bullet points

---

## 📁 Project Structure

```
omnivision-ai/
├── backend/                      # Python FastAPI backend
│   ├── main.py                   # API server + /detect + /summarize endpoints
│   ├── detector.py               # YOLOv8 + OpenCV + DeepFace emotion analysis
│   ├── utils.py                  # Helper functions
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # 🔒 API keys (NOT committed to git)
│   └── uploads/                  # Temp storage (gitignored)
│
├── frontend/                     # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── UploadZone.jsx    # Drag & drop image upload
│       │   ├── LiveCamera.jsx    # Webcam + canvas overlay (lag-free)
│       │   ├── ProcessingSteps.jsx # Animated 3-step progress indicator
│       │   ├── SummaryPanel.jsx  # Groq AI summary + collapsible details
│       │   ├── ResultPanel.jsx   # Full detection grid (used inside SummaryPanel)
│       │   └── ObjectCard.jsx    # Individual detection card
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── start.sh                      # One-command launcher for both servers
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Detection | YOLOv8n (Ultralytics) |
| AI Summary | Groq — LLaMA 3.1 8B Instant |
| Emotion Analysis | DeepFace |
| Backend | FastAPI (Python 3.11+) |
| Computer Vision | OpenCV |
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Dark glassmorphism) |

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1 — Clone & enter project
```bash
git clone https://github.com/Onkar-nst/omnivision-ai.git
cd omnivision-ai
```

### Step 2 — Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

Create your `.env` file in `backend/`:
```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > backend/.env
```
> Get a free Groq key at https://console.groq.com

### Step 3 — Frontend setup
```bash
cd ../frontend
npm install
```

### Step 4 — Start everything (one command)
```bash
# From project root:
bash start.sh
```
Or manually:
```bash
# Terminal 1 — backend
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

### Step 5 — Open
```
Frontend  → http://localhost:5173
API Docs  → http://localhost:8000/docs
```

---

## 🌐 Deployment Guide

### Backend → Render (Free tier)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo: `Onkar-nst/omnivision-ai`
3. Set **Root Directory**: `backend`
4. Set **Build Command**:
   ```
   pip install -r requirements.txt
   ```
5. Set **Start Command**:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Under **Environment Variables**, add:
   ```
   GROQ_API_KEY = your_groq_api_key_here
   ```
7. Click **Deploy** — Render gives you a URL like `https://omnivision-api.onrender.com`

> ⚠️ Free Render instances spin down after inactivity. Use a paid plan or UptimeRobot to keep it warm.

---

### Frontend → Vercel (Free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `Onkar-nst/omnivision-ai` from GitHub
3. Set **Root Directory**: `frontend`
4. Framework preset will auto-detect **Vite** ✅
5. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://omnivision-api.onrender.com
   ```
6. Click **Deploy**

**Important:** Update `frontend/src/App.jsx` and `frontend/src/components/LiveCamera.jsx` to use the env variable:
```js
// Replace:
const API_URL = 'http://localhost:8000';

// With:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Then add to your backend `main.py` CORS config the Vercel URL:
```python
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app",   # ← add this
]
```

Commit and push — Vercel auto-deploys on every push to `main`.

---

## 🔒 Environment Variables Reference

| Variable | Where | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | `backend/.env` + Render dashboard | Groq LLaMA API key |
| `VITE_API_URL` | Vercel dashboard | Production backend URL |

---

## 📚 Features

- [x] YOLOv8 object detection with bounding boxes
- [x] Emotion detection via DeepFace
- [x] Groq AI — 3-bullet scene summary per image
- [x] Animated 3-step processing indicator
- [x] Live webcam mode (canvas overlay, lag-free)
- [x] Confidence threshold slider
- [x] Dark glassmorphism UI
- [x] Collapsible full details panel
