import cv2
import numpy as np
from ultralytics import YOLO
import base64
import os
from deepface import DeepFace

# Disable TensorFlow logging spam
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

model = YOLO("yolov8n.pt")

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
    
    img_h, img_w = image.shape[:2]
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
        "image_size": {"width": img_w, "height": img_h},
    }

def _analyze_expression(image, x1, y1, x2, y2):
    try:
        h, w = image.shape[:2]
        face_img = image[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
        # We only analyze a small crop to save speed
        analysis = DeepFace.analyze(face_img, actions=['emotion'], enforce_detection=False, silent=True)
        return analysis[0]['dominant_emotion']
    except:
        return None

def _draw_boxes(image, detections):
    img_h, img_w = image.shape[:2]
    for det in detections:
        x1, y1, x2, y2 = det['bbox']['x1'], det['bbox']['y1'], det['bbox']['x2'], det['bbox']['y2']
        color = COLORS[hash(det['class']) % len(COLORS)]
        
        # Thinner Bounding Box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        
        # Label String
        label = f"{det['class']}"
        if det['expression']: label += f" | {det['expression']}"
        label += f" {det['confidence_percent']}"
        
        # Very Small Elegant Font
        font_scale = 0.28
        thickness = 1
        (tw, th), bl = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
        
        # BOUNDARY PROTECTION: If label goes off top, move it inside the box
        label_y = y1 - 8
        if label_y - th < 0:
            label_y = y1 + th + 8
            
        # Draw Label Background
        cv2.rectangle(image, (x1, label_y - th - 5), (x1 + tw + 6, label_y + 2), color, -1)
        
        # Draw Text
        cv2.putText(image, label, (x1 + 3, label_y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)
        
    return image

def _generate_summary(detections):
    humans = [d for d in detections if d["class"] == "person"]
    count = len(humans)
    exprs = [h["expression"] for h in humans if h["expression"]]
    msg = f"I found **{len(detections)} objects**."
    if count > 0:
        msg += f" {count} human(s) detected."
        if exprs: msg += f" Expressions: {', '.join(set(exprs))}."
    return msg
