/**
 * LoadingView.jsx
 *
 * Shown while the backend is processing the image.
 *
 * CONCEPT: Object detection takes a few seconds on CPU.
 * A good UX communicates what's happening so the user doesn't think
 * the app froze. We simulate "steps" to make it feel intelligent and alive.
 */

import { useState, useEffect } from 'react';

const STEPS = [
  { icon: '📤', text: 'Uploading your image...' },
  { icon: '🔍', text: 'Preprocessing pixels...' },
  { icon: '🧠', text: 'Running YOLOv8 neural network...' },
  { icon: '📦', text: 'Extracting bounding boxes...' },
  { icon: '🎨', text: 'Drawing annotations...' },
  { icon: '✅', text: 'Preparing results...' },
];

function LoadingView() {
  const [activeStep, setActiveStep] = useState(0);

  // Advance through the visual steps every ~700ms to simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      {/* Animated AI brain loader */}
      <div className="ai-brain">
        <div className="brain-ring" />
        <div className="brain-ring" />
        <div className="brain-ring" />
        <div className="brain-core" />
      </div>

      <div className="loading-title">🤖 Analyzing your image...</div>

      <ul className="loading-steps">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className={`loading-step ${i <= activeStep ? 'active' : ''}`}
          >
            <span className="step-icon">
              {i < activeStep ? '✅' : i === activeStep ? step.icon : '⬜'}
            </span>
            {step.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LoadingView;
