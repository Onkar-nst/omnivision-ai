/**
 * UploadZone.jsx
 *
 * A drag-and-drop + click-to-upload image input.
 *
 * CONCEPT: This component has two interaction modes:
 * 1. Click: Opens the OS file picker (hidden <input type="file">)
 * 2. Drag & Drop: User drags image from desktop directly into the zone
 *
 * Both modes call the same onImageSelect handler in the parent.
 */

import { useState, useRef, useCallback } from 'react';

function UploadZone({ onImageSelect, confidence, onConfidenceChange }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── Handle file selection (from either drag or click) ──
  const handleFile = useCallback((file) => {
    if (!file) return;

    // Only accept image types
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    // Create a local preview URL using browser's URL API
    // This shows the original image instantly — no server trip needed yet
    const previewUrl = URL.createObjectURL(file);
    onImageSelect(file, previewUrl);
  }, [onImageSelect]);

  // ── Drag Events ──
  const onDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // ── Click to open file picker ──
  const onFileInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  return (
    <div>
      {/* Drop zone area */}
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image for object detection"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {/* Hidden file input — triggered by click on drop zone */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInputChange}
          id="file-upload-input"
        />

        <span className="upload-icon">
          {dragging ? '📥' : '🖼️'}
        </span>

        <div className="upload-title">
          {dragging ? 'Drop it here!' : 'Drop an image or click to upload'}
        </div>
        <div className="upload-sub">
          JPG, PNG, WEBP · Max 10MB
        </div>

        <button className="upload-btn" type="button">
          <span>📁</span> Browse Files
        </button>
      </div>

      {/* Confidence threshold slider */}
      <div className="controls">
        <label className="control-label" htmlFor="confidence-slider">
          🎯 Confidence Threshold:
        </label>
        <input
          id="confidence-slider"
          type="range"
          min="0.1"
          max="0.95"
          step="0.05"
          value={confidence}
          onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
          className="confidence-slider"
        />
        <span className="confidence-value">{Math.round(confidence * 100)}%</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
        Only detections above this threshold will be shown
      </div>
    </div>
  );
}

export default UploadZone;
