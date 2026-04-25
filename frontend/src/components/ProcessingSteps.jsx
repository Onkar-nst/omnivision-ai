/**
 * ProcessingSteps.jsx
 * Animated step-by-step progress indicator shown while analyzing an uploaded image.
 * currentStep: 1 = detecting, 2 = analyzing, 3 = summarizing
 */

import { useEffect, useState } from 'react';

const STEPS = [
  { id: 1, icon: '🔍', label: 'Object found',          sub: 'Running YOLOv8 neural detection…' },
  { id: 2, icon: '📊', label: 'Object details scraping', sub: 'Processing bounding boxes & metadata…' },
  { id: 3, icon: '✨', label: 'Summary ready',           sub: 'Generating AI insights with Groq…' },
];

function Spinner() {
  return (
    <span className="ps-spinner" aria-hidden="true">
      <span /><span /><span />
    </span>
  );
}

function ProcessingSteps({ currentStep = 1 }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ps-wrapper">
      {/* Brain animation */}
      <div className="ai-brain" style={{ marginBottom: 32 }}>
        <div className="brain-ring" />
        <div className="brain-ring" />
        <div className="brain-ring" />
        <div className="brain-core" />
      </div>

      <p className="ps-title">Analyzing your image{dots}</p>

      <div className="ps-steps">
        {STEPS.map(step => {
          const isDone   = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div
              key={step.id}
              className={`ps-step ${isDone ? 'ps-done' : ''} ${isActive ? 'ps-active' : ''} ${isPending ? 'ps-pending' : ''}`}
            >
              {/* Left indicator */}
              <div className="ps-indicator">
                {isDone   && <span className="ps-check">✓</span>}
                {isActive && <Spinner />}
                {isPending && <span className="ps-num">{step.id}</span>}
              </div>

              {/* Content */}
              <div className="ps-content">
                <div className="ps-label">
                  {step.icon} {step.label}
                </div>
                {isActive && <div className="ps-sub">{step.sub}</div>}
                {isDone   && <div className="ps-sub ps-done-text">Completed ✓</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessingSteps;
