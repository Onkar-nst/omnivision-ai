import { useState, useCallback, useEffect, useRef } from 'react';
import UploadZone from './components/UploadZone';
import ProcessingSteps from './components/ProcessingSteps';
import SummaryPanel from './components/SummaryPanel';
import LiveCamera from './components/LiveCamera';
import logoUrl from './assets/logo.png';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('🔗 Ommni Vision API URL:', API_URL);

const STATE = {
  IDLE:       'idle',
  PROCESSING: 'processing',  // shows ProcessingSteps
  RESULT:     'result',
  ERROR:      'error',
};

function App() {
  const [appState, setAppState]               = useState(STATE.IDLE);
  const [mode, setMode]                       = useState('upload');
  const [result, setResult]                   = useState(null);
  const [summaryPoints, setSummaryPoints]     = useState([]);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [errorMessage, setErrorMessage]       = useState('');
  const [confidence, setConfidence]           = useState(0.4);
  const [processingStep, setProcessingStep]   = useState(1);

  const isProcessing = useRef(false);

  // Auto-scroll when result arrives
  useEffect(() => {
    if (appState === STATE.RESULT) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [appState]);

  const handleImageSelect = useCallback(async (file, previewUrl = null) => {
    // Live mode: skip if already processing
    if (mode === 'live' && isProcessing.current) return;
    isProcessing.current = true;

    if (previewUrl) setOriginalPreview(previewUrl);

    if (mode === 'upload') {
      setAppState(STATE.PROCESSING);
      setProcessingStep(1);
    }

    setErrorMessage('');

    try {
      // ── Step 1: Detect objects ──
      const formData = new FormData();
      formData.append('file', file);
      formData.append('confidence', confidence);

      const response = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (mode === 'upload') {
        // ── Step 2: Analyzing (brief UI beat) ──
        setProcessingStep(2);
        await new Promise(r => setTimeout(r, 500));

        // ── Step 3: Generate AI summary via Groq ──
        setProcessingStep(3);
        try {
          const sumRes = await fetch(`${API_URL}/summarize`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detections: data.detections }),
          });
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            setSummaryPoints(sumData.summary_points || []);
          }
        } catch (_) {
          setSummaryPoints([]);
        }

        // Small pause so user sees step 3 complete
        await new Promise(r => setTimeout(r, 400));
      }

      setAppState(STATE.RESULT);

    } catch (err) {
      if (mode === 'upload') {
        setErrorMessage(err.message || 'Unknown error occurred');
        setAppState(STATE.ERROR);
      }
    } finally {
      isProcessing.current = false;
    }
  }, [confidence, mode]);

  const handleReset = useCallback(() => {
    setAppState(STATE.IDLE);
    setResult(null);
    setSummaryPoints([]);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setOriginalPreview(null);
    setErrorMessage('');
    setProcessingStep(1);
  }, [originalPreview]);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <img src={logoUrl} alt="Ommni Vision Logo" style={{ height: '40px', width: 'auto', borderRadius: '10px' }} />
              <div>
                <div className="logo-text">Ommni Vision</div>
                <div className="logo-tagline">AI Humanoid Vision</div>
              </div>
            </div>

            {/* MODE TOGGLE */}
            <div className="model-pills" style={{ marginBottom: 0 }}>
              <button
                className={`pill ${mode === 'upload' ? 'active' : ''}`}
                onClick={() => { setMode('upload'); handleReset(); }}
                style={{ cursor: 'pointer', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', marginRight: '10px' }}
              >
                📁 Upload
              </button>
              <button
                className={`pill ${mode === 'live' ? 'active' : ''}`}
                onClick={() => { setMode('live'); handleReset(); }}
                style={{ cursor: 'pointer', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '12px' }}
              >
                🎥 Live Cam
              </button>
            </div>

            <div className="status-badge">
              <div className="status-dot" />
              YOLOv8 + Groq AI
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Hero — only in idle upload mode */}
          {appState === STATE.IDLE && mode === 'upload' && (
            <div className="hero">
              <h1 className="hero-title">
                Experience <span className="gradient">Humanoid</span><br />
                Vision
              </h1>
              <p className="hero-subtitle">
                Upload a photo and I'll analyze every object and expression — powered by YOLOv8 + Groq AI.
              </p>
            </div>
          )}

          {appState === STATE.IDLE && mode === 'live' && (
            <div className="hero" style={{ marginBottom: 32 }}>
              <h1 className="hero-title" style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
                <span className="gradient">Live</span> Object Tracking
              </h1>
              <p className="hero-subtitle">
                Real-time detection with bounding-box overlay — no freezing.
              </p>
            </div>
          )}

          {/* Upload zone */}
          {mode === 'upload' && appState === STATE.IDLE && (
            <UploadZone
              onImageSelect={handleImageSelect}
              confidence={confidence}
              onConfidenceChange={setConfidence}
            />
          )}

          {/* Live camera */}
          {mode === 'live' && (
            <div style={{ marginBottom: '40px' }}>
              <LiveCamera confidence={confidence} />
            </div>
          )}

          {/* Processing steps */}
          {mode === 'upload' && appState === STATE.PROCESSING && (
            <ProcessingSteps currentStep={processingStep} />
          )}

          {/* Result — SummaryPanel (with collapsible details) */}
          {mode === 'upload' && appState === STATE.RESULT && result && (
            <SummaryPanel
              result={result}
              originalPreview={originalPreview}
              summaryPoints={summaryPoints}
              onReset={handleReset}
            />
          )}

          {/* Error */}
          {appState === STATE.ERROR && (
            <div className="error-box">
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <div>{errorMessage}</div>
              <button className="reset-btn" onClick={handleReset} style={{ marginTop: '20px' }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          Built with <span>YOLOv8</span> · <span>Groq AI</span> · <span>FastAPI</span> · <span>React</span> — Ommni Vision
        </div>
      </footer>
    </div>
  );
}

export default App;
