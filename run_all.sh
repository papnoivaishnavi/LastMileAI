#!/bin/bash

echo "🚀 Starting LastMileAI System..."

cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $VITE_PID
    exit
}

trap cleanup SIGINT SIGTERM

echo "📦 Starting Dashboard..."
npm run dev &
VITE_PID=$!

echo "🧠 Starting LSTM Model..."
if [ -d "env" ]; then
    source env/bin/activate
    python3 lstm_model/src/main.py
else
    python3 lstm_model/src/main.py
fi

wait $VITE_PID
