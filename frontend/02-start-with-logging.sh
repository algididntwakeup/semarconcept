#!/bin/bash

# Script to start the frontend with enhanced logging

# Set environment variables for logging
export VITE_LOG_LEVEL=debug
export VITE_ENABLE_SERVER_LOGGING=true
export VITE_LOG_TO_CONSOLE=true
export VITE_LOG_TO_FILE=true
export VITE_LOG_FILE_PATH="./logs/frontend.log"
export VITE_LOG_ROTATION=true
export VITE_LOG_MAX_SIZE=10485760  # 10MB
export VITE_LOG_MAX_FILES=5
export VITE_ENABLE_PERFORMANCE_LOGGING=true
export VITE_ENABLE_NETWORK_LOGGING=true
export VITE_ENABLE_REDUX_LOGGING=true
export VITE_ENABLE_COMPONENT_LOGGING=true

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Log start of script
echo "Starting frontend with enhanced logging at $(date)"
echo "Log level: $VITE_LOG_LEVEL"
echo "Log file: $VITE_LOG_FILE_PATH"

# Start the application with Vite
echo "Starting Vite development server..."
npm run dev -- --host 0.0.0.0