import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

const LiveCamera = ({ onFrame, confidence }) => {
  const webcamRef = useRef(null);
  const [isLive, setIsLive] = useState(false);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const fetchRes = await fetch(imageSrc);
    const blob = await fetchRes.blob();
    const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
    
    onFrame(file);
  }, [onFrame]);

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        capture();
      }, 800); 
    }
    return () => clearInterval(interval);
  }, [isLive, capture]);

  return (
    <div className="live-camera-container">
      <div 
        className="image-panel" 
        style={{ 
          position: 'relative', 
          maxWidth: isLive ? '240px' : '480px', // Shrinks to 50% when live
          margin: '0 auto', 
          background: '#000', 
          borderRadius: '14px', 
          overflow: 'hidden',
          transition: 'max-width 0.4s ease-in-out' // Smooth transition
        }}
      >
        <div className="panel-header" style={{ background: '#f9fafb', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <div className="panel-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#10b981' : '#6b7280' }} />
          {isLive ? 'LIVE STREAM ACTIVE' : 'CAMERA READY'}
        </div>
        
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: '100%', display: 'block' }}
        />

        {isLive && (
          <div style={{ position: 'absolute', top: '50px', right: '20px', background: 'rgba(0,0,0,0.7)', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', color: '#10b981', border: '1px solid #10b981', fontWeight: 'bold' }}>
            📡 ANALYZING...
          </div>
        )}
      </div>

      <div className="controls" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button 
          className="upload-btn" 
          onClick={() => setIsLive(!isLive)}
          style={{ background: isLive ? '#f97316' : 'linear-gradient(135deg, #63b3ff 0%, #a78bfa 100%)', border: 'none', padding: '12px 25px', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {isLive ? '🛑 Stop Stream' : '📡 Start Live Tracking'}
        </button>

        <button 
          className="reset-btn" 
          onClick={capture}
          style={{ border: '1px solid #374151', padding: '10px 20px', borderRadius: '10px', color: '#9ca3af', cursor: 'pointer', background: 'transparent' }}
        >
          📸 Take Snapshot
        </button>
      </div>
    </div>
  );
};

export default LiveCamera;
