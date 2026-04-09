# Reksolindo Backend

## Environment Configuration

The backend application uses environment variables for configuration. These can be set in a `.env` file in the root directory of the backend application.

### Setting Up Environment Variables

1. Copy the provided `.env` file to the root directory of the backend application.
2. Modify the values as needed for your environment.

### Generating Security Keys

The application requires several security keys for encryption and authentication. You can generate these keys using the provided scripts:

```bash
# Generate only the encryption key
./generate-encryption-key.sh

# Generate all required security keys (encryption key, JWT secret, session secret)
./generate-all-keys.sh
```

These scripts will:
1. Generate secure random keys using OpenSSL
2. Update the `.env` file with the new keys
3. Create backup files with the generated keys
4. Display the generated keys in the console

### Key Environment Variables

- `REKSOLINDO_ENCRYPTION_KEY`: Used for encrypting sensitive data. **Required to avoid warnings.**
- `JWT_SECRET`: Used for signing JWT tokens. **Required for authentication.**
- `SESSION_SECRET`: Used for securing session cookies. **Required for session management.**
- `APP_ENV`: The environment the application is running in (development, staging, production).
- `APP_PORT`: The port the application will listen on.
- `DB_*`: Database connection settings.
- `REKSOLINDO_LOG_*`: Logging configuration settings.
- `CORS_*`: CORS settings for handling cross-origin requests.

## Logging Configuration

The backend application has enhanced logging capabilities that can be configured through environment variables:

- `REKSOLINDO_LOG_LEVEL`: The minimum log level to output (debug, info, warn, error).
- `REKSOLINDO_LOG_FORMAT`: The format of the logs (json, text).
- `REKSOLINDO_LOG_COLORS`: Whether to use colors in the console output.
- `REKSOLINDO_LOG_CALLER`: Whether to include the caller information in the logs.
- `REKSOLINDO_LOG_FILE`: Whether to write logs to a file.
- `REKSOLINDO_LOG_FILE_PATH`: The path to the log file.
- `REKSOLINDO_LOG_STDOUT`: Whether to write logs to stdout.
- `REKSOLINDO_LOG_REQUEST_BODY`: Whether to log request bodies.
- `REKSOLINDO_LOG_RESPONSE_BODY`: Whether to log response bodies.

## Starting the Application

### Using Environment Variables from .env File

```bash
./start-with-env.sh
```

This script will:
1. Load environment variables from the `.env` file
2. Kill any existing backend processes
3. Create the logs directory if it doesn't exist
4. Start the backend application

### With Enhanced Logging for Debugging

```bash
./kill-and-restart.sh
```

This script will:
1. Kill all existing backend processes
2. Set environment variables for enhanced logging
3. Create the logs directory if it doesn't exist
4. Start the backend application with detailed logging

## Detailed OPTIONS Request Logging

The application has been configured to provide detailed logging for OPTIONS requests to auth endpoints. This is particularly useful for debugging CORS issues.

When an OPTIONS request is made to an auth endpoint, you will see detailed logs in the console showing:
- The request path and method
- All request headers
- CORS-related headers (Origin, Access-Control-Request-Method, Access-Control-Request-Headers)
- Client IP address
- Response headers being set
- Status code being returned

## Frontend Logging

The backend also provides endpoints for receiving logs from the frontend:
- `/api/v1/logs`: For single log entries
- `/api/v1/logs/batch`: For batch log entries

These endpoints will display the logs in the backend console with special formatting for high visibility.