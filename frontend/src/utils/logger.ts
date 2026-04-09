// platform/frontend-mui/src/utils/logger.ts
/**
 * Enhanced logger utility for frontend application
 * Provides structured logging with environment context and log levels
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableServerLogging: boolean;
  serverLogEndpoint?: string;
  appName: string;
  environment: string;
}

// Log data interface
interface LogData {
  timestamp: string;
  level: LogLevel;
  app: string;
  environment: string;
  userAgent: string;
  url: string;
  message: string;
  [key: string]: unknown;
}

// Get configuration from environment variables
const getLogLevelFromEnv = (): LogLevel => {
  const envLevel = import.meta.env.VITE_LOG_LEVEL?.toLowerCase();
  switch (envLevel) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    default: return import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
  }
};

// FIXED: Initialize config immediately to prevent undefined access
let config: LoggerConfig = {
  minLevel: getLogLevelFromEnv(),
  enableConsole: import.meta.env.VITE_LOG_TO_CONSOLE !== 'false',
  enableServerLogging: false,
  serverLogEndpoint: import.meta.env.VITE_LOG_ENDPOINT || '/api/v1/logs',
  appName: 'reksolindo-frontend',
  environment: import.meta.env.MODE || 'development',
};

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Queue for batching logs
const logQueue: LogData[] = [];
let isProcessingQueue = false;
const MAX_QUEUE_SIZE = 10;
const FLUSH_INTERVAL = 5000; // 5 seconds

// Format log message with metadata
function formatLogMessage(level: LogLevel, message: string, data?: Record<string, unknown>): LogData {
  const timestamp = new Date().toISOString();
  const appName = config.appName;
  const environment = config.environment;
  
  const metadata = {
    timestamp,
    level,
    app: appName,
    environment: environment,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...(data || {}),
  };

  return {
    message,
    ...metadata,
  };
}

// Send log to server
async function sendLogToServer(level: LogLevel, message: string, data?: Record<string, unknown>): Promise<void> {
  if (!config.enableServerLogging || !config.serverLogEndpoint) {
    return;
  }

  const logData = formatLogMessage(level, message, data);
  
  // Add to queue for batching
  logQueue.push(logData);
  
  // If queue is full or this is an error log, flush immediately
  if (logQueue.length >= MAX_QUEUE_SIZE || level === LogLevel.ERROR) {
    flushLogQueue();
  }
}

// Flush log queue to server
async function flushLogQueue(): Promise<void> {
  if (!config.enableServerLogging || !config.serverLogEndpoint || isProcessingQueue || logQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  const logsToSend = [...logQueue];
  logQueue.length = 0; // Clear the queue
  
  try {
    // If only one log, send as single log
    if (logsToSend.length === 1) {
      await fetch(config.serverLogEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logsToSend[0]),
        credentials: 'include',
      });
    } else {
      // Send as batch
      await fetch(`${config.serverLogEndpoint}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logsToSend),
        credentials: 'include',
      });
    }
  } catch (error) {
    // Fallback to console if server logging fails
    originalConsoleError('Failed to send logs to server:', error);
  } finally {
    isProcessingQueue = false;
  }
}

// Get console style for log level
function getLogLevelStyle(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return 'color: #9E9E9E; font-weight: bold;';
    case LogLevel.INFO:
      return 'color: #2196F3; font-weight: bold;';
    case LogLevel.WARN:
      return 'color: #FF9800; font-weight: bold;';
    case LogLevel.ERROR:
      return 'color: #F44336; font-weight: bold;';
    default:
      return 'color: inherit;';
  }
}

// Log with specified level
function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  // Skip if below minimum log level
  const levels = Object.values(LogLevel);
  const minLevel = config.minLevel;
  if (levels.indexOf(level) < levels.indexOf(minLevel)) {
    return;
  }

  const logData = formatLogMessage(level, message, data);
  
  // Console logging
  if (config.enableConsole !== false) {
    if (data) {
      // Use group logging for better visualization when data is provided
      console.groupCollapsed(
        `%c${level.toUpperCase()} [${logData.timestamp}]: ${message}`,
        getLogLevelStyle(level)
      );
      console.log('Message:', message);
      console.log('Metadata:', { ...logData, message: undefined });
      if (data.error instanceof Error) {
        console.error('Error:', data.error);
      }
      console.groupEnd();
    } else {
      // Simple logging when no data is provided
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`%c${level.toUpperCase()} [${logData.timestamp}]: ${message}`, getLogLevelStyle(level));
          break;
        case LogLevel.INFO:
          console.info(`%c${level.toUpperCase()} [${logData.timestamp}]: ${message}`, getLogLevelStyle(level));
          break;
        case LogLevel.WARN:
          console.warn(`%c${level.toUpperCase()} [${logData.timestamp}]: ${message}`, getLogLevelStyle(level));
          break;
        case LogLevel.ERROR:
          console.error(`%c${level.toUpperCase()} [${logData.timestamp}]: ${message}`, getLogLevelStyle(level));
          break;
      }
    }
  }
  
  // Server logging
  if (config.enableServerLogging) {
    sendLogToServer(level, message, data);
  }
}

// Initialize logger with custom configuration
export function initLogger(customConfig: Partial<LoggerConfig> = {}): void {
  config = { ...config, ...customConfig };
  
  // Log initialization
  const initMessage = `Logger initialized for ${config.appName} in ${config.environment} environment`;
  if (config.enableConsole) {
    console.info(`%c${initMessage}`, 'color: #4CAF50; font-weight: bold;');
  }
}

// Public API
export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: Record<string, unknown>) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: Record<string, unknown>) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: Record<string, unknown>) => log(LogLevel.ERROR, message, data),

  // Log HTTP requests
  logRequest: (method: string, url: string, data?: Record<string, unknown>) => {
    log(LogLevel.DEBUG, `HTTP ${method} ${url}`, {
      type: 'request',
      method,
      url,
      data,
    });
  },

  // Log HTTP responses
  logResponse: (method: string, url: string, status: number, data?: Record<string, unknown>) => {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    log(level, `HTTP ${method} ${url} (${status})`, {
      type: 'response',
      method,
      url,
      status,
      data,
    });
  },

  // Log performance metrics
  logPerformance: (label: string, duration: number) => {
    log(LogLevel.DEBUG, `Performance: ${label} (${duration.toFixed(2)}ms)`, {
      type: 'performance',
      label,
      duration,
    });
  },

  // Log user actions
  logUserAction: (action: string, details?: Record<string, unknown>) => {
    log(LogLevel.INFO, `User Action: ${action}`, {
      type: 'user_action',
      action,
      details,
    });
  },

  // Create a performance measurement
  measure: (label: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      logger.logPerformance(label, duration);
      return duration;
    };
  },
};

// FIXED: Override console methods after logger is fully initialized
const setupConsoleOverrides = () => {
  // Force console output for all logs
  console.log = function(...args: any[]) {
    // Call original method
    originalConsoleLog.apply(console, args);
    
    // Also send to server if it's a string message
    if (typeof args[0] === 'string') {
      sendLogToServer(LogLevel.DEBUG, args[0], { consoleLog: true, args: args.slice(1) });
    }
  };

  // Force console error for all errors
  console.error = function(...args: any[]) {
    // Call original method
    originalConsoleError.apply(console, args);
    
    // Also send to server
    if (typeof args[0] === 'string') {
      sendLogToServer(LogLevel.ERROR, args[0], { consoleError: true, args: args.slice(1) });
    }
  };
};

// Set up interval to flush logs periodically
setInterval(flushLogQueue, FLUSH_INTERVAL);

// Ensure logs are sent before page unload
window.addEventListener('beforeunload', () => {
  if (logQueue.length > 0 && config.serverLogEndpoint) {
    // Use sendBeacon for more reliable delivery during page unload
    const endpoint = logQueue.length === 1
      ? config.serverLogEndpoint
      : `${config.serverLogEndpoint}/batch`;
    
    const data = logQueue.length === 1
      ? JSON.stringify(logQueue[0])
      : JSON.stringify(logQueue);
    
    // Create a Blob for sendBeacon
    const blob = new Blob([data], { type: 'application/json' });
    
    // Use original console.log to avoid recursion
    originalConsoleLog('Sending logs before page unload', {
      endpoint,
      logCount: logQueue.length
    });
    
    navigator.sendBeacon(endpoint, blob);
    logQueue.length = 0; // Clear the queue
  }
});

// Initialize with default config and set up console overrides
initLogger();
setupConsoleOverrides();

// Log initialization message
originalConsoleLog('Logger initialized with config:', {
  minLevel: config.minLevel,
  enableConsole: config.enableConsole,
  enableServerLogging: config.enableServerLogging,
  serverLogEndpoint: config.serverLogEndpoint,
  environment: config.environment,
});

export default logger;