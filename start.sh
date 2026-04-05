#!/bin/sh

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

# Function to handle shutdown gracefully
cleanup() {
    echo "Shutting down..."
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Start the main React Router application in dev mode
echo "Starting main application in development mode..."
npm run dev &
APP_PID=$!

# Wait for the main process
wait $APP_PID