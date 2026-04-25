# 🔍 WhoMi — AI Object Detection System

> **"Tell me what's in this image"** — An intelligent, humanoid image analysis system powered by YOLOv8

---

## 🧠 What This Project Does

WhoMi is an AI-powered object detection system that:
- Accepts an uploaded image from the user
- Runs it through a pretrained YOLOv8 neural network
- Detects all objects, draws bounding boxes, shows confidence scores
- Returns a friendly, conversational response like *"I found 3 objects in your image!"*

---

## 📁 Project Structure

```
WhoMi/
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # API server entry point
│   ├── detector.py             # YOLOv8 detection logic
│   ├── utils.py                # Helper functions
│   ├── requirements.txt        # Python dependencies
│   └── uploads/                # Temporary uploaded images
│
├── frontend/                   # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.jsx  # Drag & drop upload
│   │   │   ├── ResultPanel.jsx # Detection results display
│   │   │   └── ObjectCard.jsx  # Individual object info card
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| AI Model | YOLOv8 (Ultralytics) | Best real-time detection model |
| Backend | FastAPI (Python) | Fast, async, auto-docs |
| Computer Vision | OpenCV | Image processing |
| Frontend | React.js + Vite | You already know MERN! |

---

## 🚀 Setup Instructions

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # On Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 📚 Learning Phases

- [x] Phase 1: Fundamentals (CV concepts, bounding boxes, confidence)
- [ ] Phase 2: First working model
- [ ] Phase 3: Deep understanding of model output
- [ ] Phase 4: Full application build
- [ ] Phase 5: Humanoid UI experience
- [ ] Phase 6: Advanced features (webcam, history)
