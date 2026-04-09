// platform/frontend-mui/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import logger from './utils/logger';
import ErrorBoundary from './components/common/ErrorBoundary';
import { store } from './store';
import { initializeAuth } from './store/slices/authSlice';

// ✅ FIXED: Updated imports to match actual exports
import { initializeDebugSystem, getDebugManager } from './utils/debug-manager';
import { isDevelopmentMode } from './utils/auth';

// Initialize logger with app information
logger.info('Application initializing', {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
});

// ✅ ENHANCED: Initialize debug system in development
if (import.meta.env.DEV || isDevelopmentMode()) {
  console.log('🐛 Initializing Debug System...');
  initializeDebugSystem(); // ✅ This now works
  
  const debugManager = getDebugManager();
  debugManager.log('info', 'Debug system initialized in main.tsx', {
    environment: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  });
  
  console.log('✅ Debug system ready - look for the red bug icon!');
}

// ✅ FIXED: Initialize auth state from storage BEFORE rendering
// This prevents unwanted redirects to /login on page refresh
store.dispatch(initializeAuth());

// Performance measurement for app startup
const startupMeasure = logger.measure('App Startup');

// Find root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  logger.error('Root element not found!');
  
  if (import.meta.env.DEV) {
    const debugManager = getDebugManager();
    debugManager.log('error', 'Root element not found during app initialization');
  }
  
  throw new Error('Root element not found!');
}

// Render the application
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Log successful render and complete startup measurement
window.addEventListener('load', () => {
  const startupTime = startupMeasure();
  logger.info('Application rendered successfully', {
    startupTime,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  if (import.meta.env.DEV) {
    const debugManager = getDebugManager();
    debugManager.log('info', 'Application load completed', {
      startupTime,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      memory: (performance as any)?.memory ? {
        used: Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
        total: Math.round(((performance as any).memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
        limit: Math.round(((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100,
      } : null,
    });
  }

  logger.debug('Browser information', {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
  });
  
  if (performance && 'memory' in performance) {
    const memory = (performance as any).memory;
    if (memory) {
      logger.debug('Memory usage', {
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });
    }
  }
});

// Enhanced error boundary for global error logging with debug integration
window.addEventListener('error', (event) => {
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
  };
  
  logger.error('Unhandled error', errorInfo);
  
  if (import.meta.env.DEV && window.__DEBUG_EXCEPTIONS__) {
    window.__DEBUG_EXCEPTIONS__.push({
      id: `global-error-${Date.now()}-${Math.random()}`,
      message: event.message,
      stack: event.error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      component: 'Global Error Handler',
      type: 'javascript',
      severity: 'high',
      props: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
    
    const debugManager = getDebugManager();
    debugManager.log('error', 'Global error caught', errorInfo);
  }
});

// Enhanced unhandled promise rejection handler with debug integration
window.addEventListener('unhandledrejection', (event) => {
  const rejectionInfo = {
    reason: event.reason,
    timestamp: new Date().toISOString(),
  };
  
  logger.error('Unhandled promise rejection', rejectionInfo);
  
  if (import.meta.env.DEV && window.__DEBUG_EXCEPTIONS__) {
    window.__DEBUG_EXCEPTIONS__.push({
      id: `promise-rejection-${Date.now()}-${Math.random()}`,
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      component: 'Promise Rejection Handler',
      type: 'promise',
      severity: 'high',
    });
    
    const debugManager = getDebugManager();
    debugManager.log('error', 'Unhandled promise rejection', rejectionInfo);
  }
});

// Log page visibility changes with debug integration
document.addEventListener('visibilitychange', () => {
  const isVisible = document.visibilityState === 'visible';
  const visibilityInfo = {
    visibilityState: document.visibilityState,
    timestamp: new Date().toISOString(),
  };
  
  logger.info(`Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`, visibilityInfo);
  
  if (import.meta.env.DEV) {
    const debugManager = getDebugManager();
    debugManager.log('info', `Page visibility: ${isVisible ? 'visible' : 'hidden'}`, visibilityInfo);
    
    if (window.__DEBUG_EVENTS__) {
      window.__DEBUG_EVENTS__.push({
        id: `visibility-${Date.now()}-${Math.random()}`,
        type: 'visibility_change',
        target: 'document',
        timestamp: new Date().toISOString(),
        data: visibilityInfo,
      });
    }
  }
});

// Development mode indicators
if (import.meta.env.DEV) {
  console.log('%c🐛 DEBUG MODE ACTIVE', 'background: #ff4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
  console.log('%c📊 Enhanced logging and debugging enabled', 'color: #4285f4; font-weight: bold;');
  console.log('%c🔍 Look for the red bug icon to open debug console', 'color: #34a853; font-weight: bold;');
}
