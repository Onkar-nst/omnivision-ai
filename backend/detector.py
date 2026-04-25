import cv2
import numpy as np
from ultralytics import YOLO
import base64
import os
from deepface import DeepFace

# Disable TensorFlow logging spam
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

# 'yolov8n.pt' is the nano (smallest, fastest) variant.
model = YOLO("yolov8n.pt")

# Colors for bounding boxes (BGR format)
COLORS = [
    (255, 100, 100), (100, 255, 100), (100, 100, 255),
    (255, 255, 100), (255, 100, 255), (100, 255, 255),
    (200, 150, 255), (255, 200, 100), (100, 200, 255),
    (200, 255, 150),
]

def detect_objects(image_bytes: bytes, confidence_threshold: float = 0.4) -> dict:
    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Could not decode image.")
    
    img_height, img_width = image.shape[:2]
    results = model(image, conf=confidence_threshold, verbose=False)
    
    detections = []
    result = results[0]
    boxes = result.boxes
    
    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        confidence = float(box.conf[0])
        class_index = int(box.cls[0])
        class_name = model.names[class_index]
        
        expression = None
        if class_name == "person":
            expression = _analyze_expression(image, x1, y1, x2, y2)
        
        detections.append({
            "id": i,
            "class": class_name,
            "expression": expression,
            "confidence": round(confidence, 4),
            "confidence_percent": f"{confidence * 100:.1f}%",
            "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
        })
    
    annotated_image = _draw_boxes(image.copy(), detections)
    _, buffer = cv2.imencode(".png", annotated_image)
    image_base64 = base64.b64encode(buffer).decode("utf-8")
    
    return {
        "annotated_image": f"data:image/png;base64,{image_base64}",
        "detections": detections,
        "total_objects": len(detections),
        "summary": _generate_summary(detections),
    }

def _analyze_expression(image, x1, y1, x2, y2):
    try:
        h, w = image.shape[:2]
        pad = 20
        face_img = image[max(0, y1-pad):min(h, y2+pad), max(0, x1-pad):min(w, x2+pad)]
        # analyze emotion
        analysis = DeepFace.analyze(face_img, actions=['emotion'], enforce_detection=False, silent=True)
        return analysis[0]['dominant_emotion']
    except:
        return None

def _draw_boxes(image, detections):
    for det in detections:
        x1, y1, x2, y2 = det['bbox']['x1'], det['bbox']['y1'], det['bbox']['x2'], det['bbox']['y2']
        color = COLORS[hash(det['class']) % len(COLORS)]
        
        # Thicker bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
        
        # Prepare the label
        label = f"{det['class']}"
        if det['expression']: label += f" | {det['expression']}"
        label += f" {det['confidence_percent']}"
        
        # Larger font and more padding for the label box
        font_scale = 0.6
        thickness = 2
        (tw, th), bl = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
        
        # The background rectangle for the label (Now bigger and offset slightly)
        cv2.rectangle(image, (x1, y1 - th - 15), (x1 + tw + 10, y1), color, -1)
        
        # Drawing the text with high contrast (white or black depending on brightness)
        cv2.putText(image, label, (x1 + 5, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)
    return image

def _generate_summary(detections):
    humans = [d for d in detections if d["class"] == "person"]
    count = len(humans)
    exprs = [h["expression"] for h in humans if h["expression"]]
    
    msg = f"I found **{len(detections)} objects**."
    if count > 0:
        msg += f" I see **{count} human(s)**."
        if exprs: msg += f" Expressions detected: **{', '.join(set(exprs))}**."
    return msg
