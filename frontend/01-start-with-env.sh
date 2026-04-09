#!/bin/bash

# Script to start the frontend with environment variables from .env file

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file with the required configuration."
  exit 1
fi

# Load environment variables from .env file
echo "Loading environment variables from .env file..."
export $(grep -v '^#' .env | xargs)

# Log start of script
echo "Starting frontend with environment variables from .env file at $(date)"
echo "Environment: $VITE_APP_ENV"
echo "API Base URL: $VITE_API_BASE_URL"
echo "Log level: $VITE_LOG_LEVEL"
echo "Server logging enabled: $VITE_ENABLE_SERVER_LOGGING"

# Start the frontend development server
echo "Starting frontend development server..."
npm run dev -- --host 0.0.0.0 --port ${VITE_APP_PORT:-4071}