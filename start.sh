#!/bin/bash
# ──────────────────────────────────────────────
# Ommni Vision Startup Script
# Starts both backend (FastAPI) and frontend (Vite) servers
# Usage: bash start.sh
# ──────────────────────────────────────────────

echo ""
echo "🚀 Starting Ommni Vision — AI Object Detection System"
echo "────────────────────────────────────────────"

# Kill any leftover processes on our ports
echo "🧹 Clearing ports 8000 and 5173..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend
echo ""
echo "🐍 Starting FastAPI backend on http://localhost:8000 ..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 3

# Start frontend
echo ""
echo "⚛️  Starting React frontend on http://localhost:5173 ..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers running!"
echo "   Backend  → http://localhost:8000"
echo "   Frontend → http://localhost:5173"
echo "   API Docs → http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "────────────────────────────────────────────"

# Wait and clean up on exit
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
