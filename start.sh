#!/bin/bash

# Exit on any error
set -e

echo "Starting FileSync application..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "${POSTGRES_HOST:-postgres}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-filesync}"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is ready!"

# Run database migrations (this will handle Prisma schema)
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it's not generated)
echo "Generating Prisma client..."
npx prisma generate

# Start WebSocket server in background if it exists
if [ -f "webSocketServer.js" ]; then
    echo "Starting WebSocket server..."
    node webSocketServer.js &
    WS_PID=$!
    echo "WebSocket server started with PID: $WS_PID"
fi

# Function to handle shutdown gracefully
cleanup() {
    echo "Shutting down..."
    if [ ! -z "$WS_PID" ]; then
        kill $WS_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Start the main React Router application
echo "Starting main application..."
npm start &
APP_PID=$!

# Wait for the main process
wait $APP_PID