#!/bin/bash

# Pretty Code - One-click launcher
# Double-click this file to start Pretty Code

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✨ Pretty Code Launcher"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Track if we hit any errors
HAS_ERROR=0

# Check for Claude Code CLI
if ! command -v claude &> /dev/null; then
    echo -e "${RED}✗ Claude Code CLI not found${NC}"
    echo "  Install it with: npm install -g @anthropic-ai/claude-code"
    echo "  Then run 'claude' once to authenticate"
    echo ""
    HAS_ERROR=1
else
    echo -e "${GREEN}✓${NC} Claude Code CLI found"
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo "  Install it from: https://www.python.org/downloads/"
    echo ""
    HAS_ERROR=1
else
    echo -e "${GREEN}✓${NC} Python 3 found"
fi

# Check for Node/npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    echo "  Install Node.js from: https://nodejs.org/"
    echo ""
    HAS_ERROR=1
else
    echo -e "${GREEN}✓${NC} npm found"
fi

# Check for backend venv
if [ ! -d "$SCRIPT_DIR/backend/venv" ]; then
    echo -e "${YELLOW}! Backend virtual environment not found${NC}"
    echo "  Setting it up now..."
    cd "$SCRIPT_DIR/backend"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo -e "${GREEN}✓${NC} Backend environment ready"
else
    echo -e "${GREEN}✓${NC} Backend environment ready"
fi

# Check for frontend node_modules
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo -e "${YELLOW}! Frontend dependencies not installed${NC}"
    echo "  Installing now..."
    cd "$SCRIPT_DIR/frontend"
    npm install
    echo -e "${GREEN}✓${NC} Frontend dependencies ready"
else
    echo -e "${GREEN}✓${NC} Frontend dependencies ready"
fi

# If we hit any errors, stop here
if [ $HAS_ERROR -eq 1 ]; then
    echo ""
    echo -e "${RED}Please fix the issues above and try again.${NC}"
    echo ""
    echo "Press any key to close..."
    read -n 1
    exit 1
fi

echo ""
echo "Starting servers..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and window close
trap cleanup SIGINT SIGTERM

# Start backend
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend starting (PID: $BACKEND_PID)"

# Start frontend
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend starting (PID: $FRONTEND_PID)"

# Wait a moment for servers to start
sleep 3

# Open browser
echo ""
echo -e "${GREEN}Opening browser...${NC}"
open http://localhost:5173

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Pretty Code is running!"
echo "  "
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  "
echo "  Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for both processes
wait
