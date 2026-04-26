"""
detector.py — YOLOv8 Object Detection Engine

WHY DeepFace was removed:
  DeepFace depends on TensorFlow. TensorFlow does NOT support Python 3.12+
  (and definitely not 3.14). Removing it makes the project deployable
  on any modern Python without 4GB+ of GPU libraries.

  Emotion detection was a nice-to-have — YOLOv8 object detection is the
  core feature and works perfectly without it.
"""

import cv2
import numpy as np
from ultralytics import YOLO
import base64
import os
from pathlib import Path

# ── Model Loading ────────────────────────────────────────────
# On first run, ultralytics auto-downloads yolov8n.pt (~6MB) if not present.
# On Render, the file is downloaded into the working directory.
# We use a try/except so a missing model gives a clear error, not a crash.

_MODEL_PATH = Path(__file__).parent / "yolov8n.pt"

try:
    model = YOLO(str(_MODEL_PATH))
    print(f"✅ YOLOv8n loaded from {_MODEL_PATH}")
except Exception as e:
    print(f"⚠️  Model not found locally, downloading yolov8n.pt... ({e})")
    model = YOLO("yolov8n.pt")   # ultralytics will auto-download

# ── Color palette (one per class) ───────────────────────────
COLORS = [
    (255, 100, 100), (100, 255, 100), (100, 100, 255),
    (255, 255, 100), (255, 100, 255), (100, 255, 255),
    (200, 150, 255), (255, 200, 100), (100, 200, 255),
    (200, 255, 150),
]


# ── Public API ───────────────────────────────────────────────

def detect_objects(image_bytes: bytes, confidence_threshold: float = 0.4) -> dict:
    """
    Run YOLOv8 detection on raw image bytes.

    Args:
        image_bytes: Raw bytes from an uploaded image file.
        confidence_threshold: Min confidence to keep a detection (0.1–1.0).

    Returns:
        dict with annotated_image (base64), detections list, total_objects,
        summary string, and image_size.
    """
    # Decode bytes → numpy array → OpenCV image
    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image — ensure it's a valid JPG/PNG/WEBP.")

    img_h, img_w = image.shape[:2]

    # Run YOLOv8 inference (CPU)
    results = model(image, conf=confidence_threshold, verbose=False)

    detections = []
    for i, box in enumerate(results[0].boxes):
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        confidence  = float(box.conf[0])
        class_index = int(box.cls[0])
        class_name  = model.names[class_index]

        detections.append({
            "id":                 i,
            "class":              class_name,
            "expression":         None,   # removed — deepface not available in prod
            "confidence":         round(confidence, 4),
            "confidence_percent": f"{confidence * 100:.1f}%",
            "bbox":               {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
        })

    # Draw bounding boxes and encode result image
    annotated = _draw_boxes(image.copy(), detections)
    _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
    image_b64 = base64.b64encode(buf).decode("utf-8")

    return {
        "annotated_image": f"data:image/jpeg;base64,{image_b64}",
        "detections":      detections,
        "total_objects":   len(detections),
        "summary":         _generate_summary(detections),
        "image_size":      {"width": img_w, "height": img_h},
    }


# ── Private helpers ──────────────────────────────────────────

def _draw_boxes(image: np.ndarray, detections: list) -> np.ndarray:
    """Draw bounding boxes + compact labels onto the image."""
    for det in detections:
        x1, y1  = det["bbox"]["x1"], det["bbox"]["y1"]
        x2, y2  = det["bbox"]["x2"], det["bbox"]["y2"]
        color   = COLORS[hash(det["class"]) % len(COLORS)]

        # Box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # Label text
        label      = f"{det['class']} {det['confidence_percent']}"
        font       = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.28
        thickness  = 1
        (tw, th), _ = cv2.getTextSize(label, font, font_scale, thickness)

        # Keep label inside image bounds
        label_y = y1 - 8 if (y1 - 8 - th) >= 0 else y1 + th + 8

        # Background rect
        cv2.rectangle(image, (x1, label_y - th - 4), (x1 + tw + 6, label_y + 2), color, -1)
        # Text
        cv2.putText(image, label, (x1 + 3, label_y), font, font_scale, (255, 255, 255), thickness)

    return image


def _generate_summary(detections: list) -> str:
    """Simple text summary of detected objects."""
    if not detections:
        return "No objects detected."

    counts: dict = {}
    for d in detections:
        counts[d["class"]] = counts.get(d["class"], 0) + 1

    parts = [f"**{v}** {k}{'s' if v > 1 else ''}" for k, v in counts.items()]
    return f"I found **{len(detections)} object{'s' if len(detections) != 1 else ''}**: " + ", ".join(parts) + "."
