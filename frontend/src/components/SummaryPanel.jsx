/**
 * SummaryPanel.jsx
 * Shows Groq AI summary (3 bullet points) at the top.
 * "View Full Details" expands the annotated image + object cards.
 */

import { useState } from 'react';
import ObjectCard from './ObjectCard';

function SummaryPanel({ result, originalPreview, summaryPoints, onReset }) {
  const [showDetails, setShowDetails] = useState(false);
  const { detections = [], total_objects = 0, annotated_image, image_size, summary } = result;

  return (
    <div className="preview-section">

      {/* ── AI Summary Card ── */}
      <div className="ai-summary-card">
        <div className="ai-summary-header">
          <div className="ai-summary-title">
            <span className="ai-badge">🤖 AI</span>
            Object Scene Summary
          </div>
          <span className="ai-obj-count">{total_objects} object{total_objects !== 1 ? 's' : ''} detected</span>
        </div>

        {summaryPoints && summaryPoints.length > 0 ? (
          <ul className="summary-points">
            {summaryPoints.map((point, i) => (
              <li key={i} className="summary-point" style={{ animationDelay: `${i * 120}ms` }}>
                <span className="summary-bullet">▸</span>
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{summary}</p>
        )}

        <button
          className="view-details-btn"
          onClick={() => setShowDetails(v => !v)}
        >
          {showDetails ? '▲ Hide Full Details' : '▼ View Full Details'}
        </button>
      </div>

      {/* ── Full Details (collapsible) ── */}
      {showDetails && (
        <div className="full-details-section">

          {/* Before / After */}
          <div className="image-grid">
            <div className="image-panel">
              <div className="panel-header">
                <div className="panel-dot" style={{ background: '#6b7280' }} />
                Original Image
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
                  {image_size?.width}×{image_size?.height}px
                </span>
              </div>
              <img src={originalPreview} alt="Original" className="panel-image" />
            </div>

            <div className="image-panel">
              <div className="panel-header">
                <div className="panel-dot" style={{ background: 'var(--accent-green)' }} />
                Detected Objects
                <span style={{ marginLeft: 'auto', color: 'var(--accent-green)', fontSize: 11 }}>
                  {total_objects} found
                </span>
              </div>
              <img src={annotated_image} alt="Annotated" className="panel-image" />
            </div>
          </div>

          {/* Object Cards */}
          {detections.length > 0 && (
            <div>
              <div className="detections-header" style={{ marginTop: 8 }}>
                <h2 className="detections-title">🔍 Objects Identified</h2>
                <span className="detections-count">{total_objects} found</span>
              </div>
              <div className="detections-grid">
                {detections.map((det, i) => (
                  <ObjectCard key={det.id} detection={det} index={i} />
                ))}
              </div>
            </div>
          )}
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

export default SummaryPanel;
