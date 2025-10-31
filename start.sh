#!/bin/bash

# Protega CloudPay - Quick Start Script

echo "🚀 Starting Protega CloudPay..."
echo ""

# Kill any existing processes
pkill -9 node 2>/dev/null
sleep 2

# Navigate to frontend
cd frontend || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the dev server
echo ""
echo "✅ Starting development server on port 3000..."
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev




