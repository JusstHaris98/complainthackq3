#!/bin/bash

echo "🚀 Starting Complaint Analysis System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run: python3 -m venv venv"
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while check_port $port; do
        ((port++))
    done
    echo $port
}

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null; fi
    if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
    if [ ! -z "$OLLAMA_PID" ]; then kill $OLLAMA_PID 2>/dev/null; fi
    pkill -f "uvicorn.*main:app\|vite.*frontend" 2>/dev/null
    exit 0
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM

# Check Ollama status
if check_port 11434; then
    echo "🦙 Ollama already running on port 11434"
    OLLAMA_RUNNING=true
else
    echo "🦙 Starting Ollama server..."
    ollama serve &
    OLLAMA_PID=$!
    OLLAMA_RUNNING=false
    sleep 3
fi

# Find available backend port
BACKEND_PORT=$(find_available_port 8000)
if [ $BACKEND_PORT -ne 8000 ]; then
    echo "⚠️  Port 8000 in use, using port $BACKEND_PORT for backend"
fi

# Find available frontend port
FRONTEND_PORT=$(find_available_port 5173)
if [ $FRONTEND_PORT -ne 5173 ]; then
    echo "⚠️  Port 5173 in use, using port $FRONTEND_PORT for frontend"
fi

# Activate virtual environment and start backend
echo "🐍 Starting Python backend on port $BACKEND_PORT..."
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port $BACKEND_PORT &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting React frontend on port $FRONTEND_PORT..."
cd frontend
if [ $FRONTEND_PORT -ne 5173 ]; then
    npm run dev -- --port $FRONTEND_PORT &
else
    npm run dev &
fi
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔗 Backend: http://localhost:$BACKEND_PORT"
if [ "$OLLAMA_RUNNING" = true ]; then
    echo "🦙 Ollama: http://localhost:11434 (already running)"
else
    echo "🦙 Ollama: http://localhost:11434 (started)"
fi
echo ""
echo "💡 Tip: Use 'make stop' to stop all services or press Ctrl+C"
echo ""

# Wait for any process to exit
wait