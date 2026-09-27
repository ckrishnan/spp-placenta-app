#!/usr/bin/env bash
# ---------------------------------------------------------------
#  Placenta App - local dev server on http://localhost:5000
#  Usage: ./run-dev.sh
# ---------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")"

echo "==============================================="
echo "  Placenta App - Local Dev Server"
echo "  URL: http://localhost:5000"
echo "  Press Ctrl+C to stop"
echo "==============================================="
echo

# Install dependencies on first run
if [ ! -d "node_modules" ]; then
  echo "[setup] node_modules not found - running npm install..."
  npm install
  echo
fi

echo "[run] starting Next.js dev server on localhost:5000 ..."
echo
exec npx next dev -p 5000 -H localhost
