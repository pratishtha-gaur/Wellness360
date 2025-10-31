#!/usr/bin/env bash

set -euo pipefail

# Start backend
(
  cd backend
  npm run dev
) &
BACKEND_PID=$!

# Start frontend (Vite)
npm run dev &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID >/dev/null 2>&1 || true' EXIT

wait $BACKEND_PID $FRONTEND_PID


