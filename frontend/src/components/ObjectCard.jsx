/**
 * ObjectCard.jsx
 *
 * Displays information for a single detected object:
 * - Emoji icon representing the class
 * - Class name
 * - Confidence bar (animated)
 * - Bounding box coordinates
 *
 * CONCEPT: Each detection result from the backend is rendered
 * as a card. The confidence bar visually encodes how sure the
 * model is — a filled bar = high confidence.
 */

import { getEmoji, getConfidenceLabel, formatBbox } from '../utils';

function ObjectCard({ detection, index }) {
  const { label, color } = getConfidenceLabel(detection.confidence);
  const emoji = getEmoji(detection.class);

  return (
    <div
      className="object-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Emoji representing the object class */}
      <span className="card-emoji">{emoji}</span>

      {/* Class name (e.g. "car", "person") */}
      <div className="card-class">{detection.class}</div>

      {/* Confidence score with animated bar */}
      <div className="card-confidence">
        <div className="confidence-label">
          <span>{label} confidence</span>
          <span className="confidence-pct">{detection.confidence_percent}</span>
        </div>
        <div className="confidence-bar-track">
          <div
            className="confidence-bar-fill"
            style={{ width: `${detection.confidence * 100}%`, background: `linear-gradient(90deg, ${color}, #63b3ff)` }}
          />
        </div>
      </div>

      {/* Bounding box coordinates — these are the pixel coordinates
          of the rectangle drawn on the image */}
      <div className="card-bbox">
        {formatBbox(detection.bbox)}
      </div>
    </div>
  );
}

export default ObjectCard;
