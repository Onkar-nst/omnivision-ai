import { useState, useCallback } from 'react';
import UploadZone from './components/UploadZone';
import LoadingView from './components/LoadingView';
import ResultPanel from './components/ResultPanel';
import LiveCamera from './components/LiveCamera'; // Re-adding the import
import './index.css';

const API_URL = 'http://localhost:8000';

const STATE = {
  IDLE:    'idle',
  LOADING: 'loading',
  RESULT:  'result',
  ERROR:   'error',
};

function App() {
  const [appState, setAppState]           = useState(STATE.IDLE);
  const [mode, setMode]                   = useState('upload'); // 'upload' or 'live'
  const [result, setResult]               = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [errorMessage, setErrorMessage]   = useState('');
  const [confidence, setConfidence]       = useState(0.4);

  const handleImageSelect = useCallback(async (file, previewUrl = null) => {
    if (previewUrl) setOriginalPreview(previewUrl);
    if (mode === 'upload') setAppState(STATE.LOADING);
    
    setErrorMessage('');

    try {
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
      setAppState(STATE.RESULT);

    } catch (err) {
      if (mode === 'upload') {
        setErrorMessage(err.message || 'Unknown error occurred');
        setAppState(STATE.ERROR);
      }
    }
  }, [confidence, mode]);

  const handleReset = useCallback(() => {
    setAppState(STATE.IDLE);
    setResult(null);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setOriginalPreview(null);
    setErrorMessage('');
  }, [originalPreview]);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">👁️</div>
              <div>
                <div className="logo-text">WhoMi</div>
                <div className="logo-tagline">AI Humanoid Vision</div>
              </div>
            </div>
            
            {/* NEW: MODE TOGGLE */}
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
              YOLOv8 + Emotion
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {appState === STATE.IDLE && (
            <div className="hero">
              <h1 className="hero-title">
                Experience <span className="gradient">Humanoid</span><br />
                Vision
              </h1>
              <p className="hero-subtitle">
                {mode === 'upload' 
                  ? "Upload a photo and I'll analyze every object and expression I see."
                  : "Connect your camera for real-time human counting and emotion detection."
                }
              </p>
            </div>
          )}

          {mode === 'upload' && appState === STATE.IDLE && (
            <UploadZone
              onImageSelect={handleImageSelect}
              confidence={confidence}
              onConfidenceChange={setConfidence}
            />
          )}

          {mode === 'live' && (
            <div style={{ marginBottom: '40px' }}>
              <LiveCamera 
                onFrame={handleImageSelect} 
                confidence={confidence} 
              />
            </div>
          )}

          {appState === STATE.LOADING && <LoadingView />}

          {(appState === STATE.RESULT || (mode === 'live' && result)) && result && (
            <ResultPanel
              result={result}
              originalPreview={originalPreview}
              onReset={handleReset}
              hideImages={mode === 'live'}
            />
          )}

          {appState === STATE.ERROR && (
            <div className="error-box">
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <div>{errorMessage}</div>
              <button className="reset-btn" onClick={handleReset} style={{ marginTop: '20px' }}>Try Again</button>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          Built with <span>YOLOv8</span> · <span>FastAPI</span> · <span>React</span> — WhoMi AI
        </div>
      </footer>
    </div>
  );
}

export default App;
