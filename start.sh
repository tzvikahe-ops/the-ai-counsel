#!/bin/bash

# The AI Counsel - Start script

echo "Starting The AI Counsel..."
echo ""

# Start backend
echo "Starting backend on http://localhost:8001..."
LLM_COUNCIL_BIND_HOST="${LLM_COUNCIL_BIND_HOST:-0.0.0.0}" uv run python -m backend.main &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "Starting frontend on http://localhost:5173..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "✓ The AI Counsel is running!"
echo "  Backend:  http://localhost:8001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
