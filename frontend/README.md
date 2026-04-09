# Reksolindo Frontend

## Environment Configuration

The frontend application uses environment variables for configuration. These can be set in a `.env` file in the root directory of the frontend application.

### Setting Up Environment Variables

1. Copy the provided `.env` file to the root directory of the frontend application.
2. Modify the values as needed for your environment.

### Key Environment Variables

- `VITE_APP_NAME`: The name of the application.
- `VITE_APP_VERSION`: The version of the application.
- `VITE_APP_ENV`: The environment the application is running in (development, staging, production).
- `VITE_APP_PORT`: The port the application will listen on.
- `VITE_API_BASE_URL`: The base URL for API requests.
- `VITE_API_TIMEOUT`: The timeout for API requests in milliseconds.
- `VITE_AUTH_*`: Authentication settings.
- `VITE_LOG_*`: Logging configuration settings.
- `VITE_FEATURE_*`: Feature flags for enabling/disabling features.
- `VITE_UI_*`: UI configuration settings.

## Logging Configuration

The frontend application has enhanced logging capabilities that can be configured through environment variables:

- `VITE_LOG_LEVEL`: The minimum log level to output (debug, info, warn, error).
- `VITE_LOG_TO_CONSOLE`: Whether to log to the browser console.
- `VITE_ENABLE_SERVER_LOGGING`: Whether to send logs to the backend server.
- `VITE_LOG_ENDPOINT`: The endpoint to send logs to.
- `VITE_LOG_BATCH_SIZE`: The number of logs to batch before sending to the server.
- `VITE_LOG_FLUSH_INTERVAL`: The interval in milliseconds to flush the log queue.
- `VITE_ENABLE_PERFORMANCE_LOGGING`: Whether to log performance metrics.
- `VITE_ENABLE_NETWORK_LOGGING`: Whether to log network requests.
- `VITE_ENABLE_REDUX_LOGGING`: Whether to log Redux actions and state changes.
- `VITE_ENABLE_COMPONENT_LOGGING`: Whether to log component lifecycle events.

## Starting the Application

### Using Environment Variables from .env File

```bash
./start-with-env.sh
```

This script will:
1. Load environment variables from the `.env` file
2. Start the frontend development server with the configured port

## Testing Logging

The application includes a dedicated page for testing the logging functionality:

1. Navigate to the homepage
2. Click on "Test Logging (Server Console)"
3. Use the test page to generate different types of logs
4. Check both the browser console and the server console to see the logs

## Available Log Types

The logger utility provides several methods for logging:

- `logger.debug()`: For debug information
- `logger.info()`: For general information
- `logger.warn()`: For warnings
- `logger.error()`: For errors
- `logger.logUserAction()`: For tracking user actions
- `logger.logApiRequest()`: For logging API requests
- `logger.logApiResponse()`: For logging API responses
- `logger.logPerformance()`: For logging performance metrics
- `logger.logNavigation()`: For logging navigation events

## Console Overrides

The logger utility overrides the default console methods to capture all logs:

- `console.log()`: Captured and sent to the server as debug logs
- `console.error()`: Captured and sent to the server as error logs

This ensures that all logs, even those from third-party libraries, are captured and sent to the server.
