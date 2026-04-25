/**
 * ResultPanel.jsx
 *
 * Displayed after detection is complete. Shows:
 * 1. The humanoid summary message ("I found 3 objects...")
 * 2. Side-by-side: original image vs annotated image
 * 3. Grid of ObjectCards for each detection
 * 4. Reset button to analyze another image
 *
 * CONCEPT: This is purely a display component. All the hard work
 * (AI inference, drawing boxes) was done by the backend. This just
 * presents the results in a user-friendly way.
 */

import ObjectCard from './ObjectCard';

function ResultPanel({ result, originalPreview, onReset }) {
  const { summary, annotated_image, detections, total_objects, image_size } = result;

  return (
    <div className="preview-section">

      {/* ── Humanoid Summary Message ── */}
      <div
        className="summary-banner"
        dangerouslySetInnerHTML={{
          // Convert **bold** markdown to <strong> tags for display
          __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        }}
      />

      {/* ── Before / After Image Comparison ── */}
      <div className="image-grid">
        {/* Original uploaded image */}
        <div className="image-panel">
          <div className="panel-header">
            <div className="panel-dot" style={{ background: '#6b7280' }} />
            Original Image
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
              {image_size?.width}×{image_size?.height}px
            </span>
          </div>
          <img src={originalPreview} alt="Original upload" className="panel-image" />
        </div>

        {/* Annotated image with bounding boxes drawn by OpenCV */}
        <div className="image-panel">
          <div className="panel-header">
            <div className="panel-dot" style={{ background: 'var(--accent-green)' }} />
            Detected Objects
            <span style={{ marginLeft: 'auto', color: 'var(--accent-green)', fontSize: 11 }}>
              {total_objects} found
            </span>
          </div>
          <img
            src={annotated_image}
            alt="Annotated with detected objects"
            className="panel-image"
          />
        </div>
      </div>

      {/* ── Detections List ── */}
      {detections.length > 0 ? (
        <div>
          <div className="detections-header" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h2 className="detections-title" style={{ fontSize: '22px', margin: 0 }}>🔍 Objects Identified</h2>
            <span className="detections-count" style={{ fontSize: '14px', background: '#e5e7eb', padding: '5px 12px', borderRadius: '20px' }}>
              {total_objects} found
            </span>
          </div>

          <div className="detections-grid">
            {detections.map((det, i) => (
              <ObjectCard key={det.id} detection={det} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="error-box">
          😕 No objects were detected above the confidence threshold.
          Try lowering the confidence slider and re-uploading.
        </div>
      )}

      {/* ── Reset ── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="reset-btn" onClick={onReset} id="reset-button">
          ↩ Analyze Another Image
        </button>
      </div>
    </div>
  );
}

export default ResultPanel;
