#!/bin/bash
#
# The AI Counsel - macOS launcher (double-clickable)
# Starts backend + frontend, waits until ready, then opens the browser.
# Close this Terminal window (or press Ctrl+C) to stop both servers.

# --- make tools reachable when launched from Finder (no shell rc is sourced) ---
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
# pick up a user-installed uv/node if defined in a login profile
[ -f "$HOME/.zprofile" ] && source "$HOME/.zprofile" >/dev/null 2>&1
[ -f "$HOME/.profile" ]  && source "$HOME/.profile"  >/dev/null 2>&1

REPO="/Users/zvika/dev/the-ai-counsel"
BACKEND_URL="http://localhost:8001"
FRONTEND_URL="http://localhost:5173"

cd "$REPO" || { echo "Repo not found at $REPO"; read -r -p "Press Enter to close..."; exit 1; }

# --- sanity checks ---
command -v uv  >/dev/null 2>&1 || { echo "ERROR: 'uv' not found in PATH. Install it or add it to PATH."; read -r -p "Press Enter to close..."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: 'npm' not found in PATH. Install Node.js first."; read -r -p "Press Enter to close..."; exit 1; }

echo "Starting The AI Counsel..."
echo ""

# --- backend (loopback only) ---
echo "Starting backend on $BACKEND_URL ..."
LLM_COUNCIL_BIND_HOST="127.0.0.1" uv run python -m backend.main &
BACKEND_PID=$!

# --- frontend ---
echo "Starting frontend on $FRONTEND_URL ..."
( cd frontend && npm run dev ) &
FRONTEND_PID=$!

# --- clean up both servers on exit ---
cleanup() {
  echo ""
  echo "Stopping servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- wait until the frontend is actually serving, then open the browser ---
echo ""
echo "Waiting for the app to be ready..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null "$FRONTEND_URL"; then
    echo "Ready - opening browser."
    open "$FRONTEND_URL"
    break
  fi
  # if the frontend process died, bail out
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Frontend failed to start. See messages above."
    break
  fi
  sleep 1
done

echo ""
echo "The AI Counsel is running:"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo ""
echo "Keep this window open. Close it or press Ctrl+C to stop."

# keep running until the servers exit (or Ctrl+C)
wait
