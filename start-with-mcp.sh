#!/bin/bash

# Start Claude Chat App with MCP Integration
echo "🚀 Starting Claude Chat App with MCP Integration..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $CHAT_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Claude Chat App
echo "💬 Starting Claude Chat App..."
cd /Users/ishankorde/Projects/claude-sonnet-chat
npm run dev &
CHAT_PID=$!

echo "✅ Chat app is starting..."
echo "💬 Claude Chat: http://localhost:8080"
echo "🔧 MCP Tools: Connected directly to Supabase database"
echo ""
echo "Press Ctrl+C to stop the service"

# Wait for process to exit
wait
