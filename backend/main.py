"""
main.py — WhoMi Backend API Server

This is the entry point for our FastAPI application.

CONCEPT: FastAPI is a modern Python web framework. Think of it like Express.js
(from your MERN stack) but for Python. It handles HTTP requests, lets us define
routes, and automatically generates API documentation at /docs.

HOW IT WORKS:
  Browser (React) ──[POST /detect]──▶ FastAPI ──▶ detector.py ──▶ YOLOv8
                  ◀──[JSON response]──                          ◀── results
"""

import os
import io
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import our detection engine (detector.py)
from detector import detect_objects

# ─────────────────────────────────────────────
# APP INITIALIZATION
# ─────────────────────────────────────────────

app = FastAPI(
    title="WhoMi — AI Object Detection API",
    description="Upload an image and WhoMi will tell you what's in it using YOLOv8",
    version="1.0.0",
)

# ─────────────────────────────────────────────
# CORS MIDDLEWARE
# ─────────────────────────────────────────────
# CONCEPT: CORS (Cross-Origin Resource Sharing) is a browser security rule.
# Your React frontend runs on http://localhost:5173
# Your FastAPI backend runs on http://localhost:8000
# Without CORS config, the browser BLOCKS requests between different ports.
# This middleware tells the browser: "Yes, requests from React are allowed."

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA dev server (just in case)
    ],
    allow_credentials=True,
    allow_methods=["*"],          # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],          # Allow all headers
)

# Ensure the uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.get("/")
def root():
    """Health check — confirms the server is running."""
    return {
        "status": "online",
        "message": "👋 WhoMi API is running! POST an image to /detect",
        "docs": "http://localhost:8000/docs"
    }


@app.get("/health")
def health_check():
    """Simple health check for monitoring."""
    return {"status": "healthy", "model": "YOLOv8n"}


@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    confidence: float = 0.4
):
    """
    Main detection endpoint.
    
    Accepts:
      - file: An image (JPG, PNG, WEBP)
      - confidence: Minimum confidence threshold (default 0.4 = 40%)
    
    Returns:
      - annotated_image: Base64 encoded PNG with bounding boxes drawn
      - detections: List of detected objects with class, confidence, bbox
      - total_objects: Number of objects found
      - summary: Friendly human-readable summary
    
    CONCEPT: 'async def' means this function is asynchronous — FastAPI can
    handle many requests at once without blocking. Like how Node.js works!
    """
    
    # ── Validate file type ──
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"❌ Unsupported file type: {file.content_type}. Please upload JPG, PNG, or WEBP."
        )
    
    # ── Validate file size (max 10MB) ──
    contents = await file.read()  # Read image bytes from upload
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="❌ Image too large. Maximum size is 10MB."
        )
    
    # ── Validate confidence range ──
    if not (0.1 <= confidence <= 1.0):
        raise HTTPException(
            status_code=400,
            detail="❌ Confidence must be between 0.1 and 1.0"
        )
    
    try:
        # ── Run detection ──
        # Pass raw image bytes to our detector module
        result = detect_objects(image_bytes=contents, confidence_threshold=confidence)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            **result  # Spread all keys from detector output
        })
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"⚠️ Detection failed: {str(e)}"
        )


@app.get("/classes")
def get_supported_classes():
    """
    Returns all 80 COCO classes that YOLOv8 can detect.
    Useful for the frontend to show a reference list.
    """
    from detector import model
    return {
        "total": len(model.names),
        "classes": list(model.names.values())
    }
