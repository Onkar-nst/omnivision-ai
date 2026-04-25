/**
 * LiveCamera.jsx  —  Smooth, lag-free live detection
 *
 * Strategy:
 *  - Webcam video runs at full 30fps continuously (never blocked)
 *  - A transparent <canvas> overlays the video to draw bounding boxes
 *  - We capture+process one frame at a time (completion-based, not interval-based)
 *    so the queue never builds up and causes freezes
 *  - Each cycle: capture → send to /detect → draw boxes → repeat immediately
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

const API_URL = 'http://localhost:8000';

// Consistent color per class name
const CLASS_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

function getColor(className) {
  let hash = 0;
  for (let i = 0; i < className.length; i++) hash = className.charCodeAt(i) + ((hash << 5) - hash);
  return CLASS_COLORS[Math.abs(hash) % CLASS_COLORS.length];
}

const LiveCamera = ({ confidence }) => {
  const webcamRef  = useRef(null);
  const canvasRef  = useRef(null);
  const isLiveRef  = useRef(false);
  const isBusyRef  = useRef(false);

  const [isLive, setIsLive]       = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const [pingMs, setPingMs]       = useState(null);

  /* ── Draw detections onto the canvas overlay ── */
  const drawBoxes = useCallback((detections, imgW, imgH) => {
    const canvas = canvasRef.current;
    const video  = webcamRef.current?.video;
    if (!canvas || !video) return;

    const dW = video.offsetWidth;
    const dH = video.offsetHeight;
    canvas.width  = dW;
    canvas.height = dH;

    const sx = dW / (imgW || dW);
    const sy = dH / (imgH || dH);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, dW, dH);

    detections.forEach(det => {
      const { x1, y1, x2, y2 } = det.bbox;
      const color = getColor(det.class);

      const rx1 = x1 * sx, ry1 = y1 * sy;
      const rw  = (x2 - x1) * sx, rh = (y2 - y1) * sy;

      // Box
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(rx1, ry1, rw, rh);

      // Label background
      const label = `${det.class} ${det.confidence_percent}`;
      ctx.font = 'bold 10px monospace';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = color + 'CC';
      ctx.fillRect(rx1, ry1 - 16, tw + 8, 16);

      // Label text
      ctx.fillStyle = '#000';
      ctx.fillText(label, rx1 + 4, ry1 - 4);
    });
  }, []);

  /* ── Core frame processing loop (completion-based) ── */
  const processFrame = useCallback(async () => {
    if (!isLiveRef.current || isBusyRef.current) return;
    if (!webcamRef.current) return;

    isBusyRef.current = true;
    const t0 = Date.now();

    try {
      const shot = webcamRef.current.getScreenshot({ width: 640, height: 480 });
      if (!shot) return;

      const blob = await fetch(shot).then(r => r.blob());
      const file = new File([blob], 'live.jpg', { type: 'image/jpeg' });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('confidence', confidence);

      const res = await fetch(`${API_URL}/detect`, { method: 'POST', body: fd });
      if (!res.ok) return;

      const data = await res.json();
      setPingMs(Date.now() - t0);
      setLiveStats({
        total:   data.total_objects,
        classes: [...new Set(data.detections.map(d => d.class))],
      });
      drawBoxes(
        data.detections,
        data.image_size?.width  || 640,
        data.image_size?.height || 480,
      );
    } catch (_) {
      /* ignore network errors in live mode */
    } finally {
      isBusyRef.current = false;
      // Immediately schedule next frame — no fixed interval, purely completion-based
      if (isLiveRef.current) requestAnimationFrame(processFrame);
    }
  }, [confidence, drawBoxes]);

  /* ── Toggle live state ── */
  const toggleLive = useCallback(() => {
    const next = !isLive;
    setIsLive(next);
    isLiveRef.current = next;

    if (next) {
      processFrame(); // kick off the loop
    } else {
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      setLiveStats(null);
      setPingMs(null);
    }
  }, [isLive, processFrame]);

  // Cleanup on unmount
  useEffect(() => () => { isLiveRef.current = false; }, []);

  return (
    <div className="live-camera-container">
      {/* ── Camera + Canvas overlay wrapper ── */}
      <div
        style={{
          position: 'relative',
          maxWidth: '640px',
          margin: '0 auto',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: '#000',
        }}
      >
        {/* Status bar */}
        <div className="panel-header" style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid var(--border)' }}>
          <div
            className="panel-dot"
            style={{ background: isLive ? '#10b981' : '#6b7280', boxShadow: isLive ? '0 0 8px #10b981' : 'none' }}
          />
          <span style={{ fontSize: 12, fontWeight: 700 }}>
            {isLive ? '● LIVE' : 'CAMERA READY'}
          </span>
          {pingMs && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b7280' }}>
              ⚡ {pingMs}ms
            </span>
          )}
        </div>

        {/* Webcam (continuous, never blocked) */}
        <div style={{ position: 'relative' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.75}
            style={{ width: '100%', display: 'block' }}
          />

          {/* Canvas overlay — draws bounding boxes, pointer-events: none so it never blocks the video */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
            }}
          />

          {/* Live stats overlay at bottom */}
          {isLive && liveStats && (
            <div
              style={{
                position: 'absolute',
                bottom: 10, left: 10,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                color: '#fff',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#10b981', fontWeight: 700 }}>
                {liveStats.total} obj
              </span>
              {liveStats.classes.length > 0 && (
                <span style={{ color: '#aaa' }}>
                  {liveStats.classes.slice(0, 4).join(', ')}
                  {liveStats.classes.length > 4 ? ` +${liveStats.classes.length - 4}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button
          className="upload-btn"
          onClick={toggleLive}
          style={{
            background: isLive
              ? 'linear-gradient(135deg,#f97316,#ef4444)'
              : 'linear-gradient(135deg,#63b3ff,#a78bfa)',
            border: 'none',
          }}
        >
          {isLive ? '🛑 Stop Stream' : '📡 Start Live Tracking'}
        </button>
      </div>
    </div>
  );
};

export default LiveCamera;
