// platform/frontend-mui/src/config.ts
/**
 * Application Configuration
 * 
 * This file contains global configuration settings for the application.
 * It includes API endpoints, feature flags, and other environment-specific settings.
 */

// ✅ FIXED: Use import.meta.env instead of process.env for Vite
// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication Configuration
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_USER_KEY = 'auth_user';
export const AUTH_TOKEN_EXPIRY_KEY = 'auth_token_expiry';
export const AUTH_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// WebSocket Configuration
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
export const WS_RECONNECT_INTERVAL = 5000; // 5 seconds
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

// Feature Flags
export const FEATURES = {
  REAL_TIME_UPDATES: true,
  DARK_MODE: true,
  NOTIFICATIONS: true,
  ANALYTICS: import.meta.env.MODE === 'production',
  DEBUG_MODE: import.meta.env.MODE === 'development'
};

// Security Configuration
export const SECURITY = {
  CSRF_ENABLED: true,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  SESSION_TIMEOUT_WARNING: 5 * 60 * 1000, // 5 minutes in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRES_SPECIAL_CHAR: true,
  PASSWORD_REQUIRES_NUMBER: true,
  PASSWORD_REQUIRES_UPPERCASE: true
};

// UI Configuration
export const UI = {
  THEME_KEY: 'app_theme',
  DEFAULT_THEME: 'light',
  ANIMATION_DURATION: 300, // milliseconds
  SNACKBAR_AUTO_HIDE_DURATION: 5000, // 5 seconds
  TABLE_PAGE_SIZES: [10, 25, 50, 100],
  DEFAULT_PAGE_SIZE: 25
};

// Date and Time Configuration
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Localization
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja'];

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  RECENT_SEARCHES: 'recent_searches',
  NOTIFICATION_SETTINGS: 'notification_settings'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.'
};

// Analytics
export const ANALYTICS = {
  ENABLED: import.meta.env.MODE === 'production',
  TRACKING_ID: import.meta.env.VITE_ANALYTICS_ID || '',
  TRACK_PAGEVIEWS: true,
  TRACK_EVENTS: true,
  TRACK_ERRORS: true
};

// Cache Configuration
export const CACHE = {
  ENABLED: true,
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  STORAGE_PREFIX: 'app_cache_'
};

// Export default configuration object
export default {
  API_BASE_URL,
  API_TIMEOUT,
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_TOKEN_EXPIRY_KEY,
  AUTH_REFRESH_THRESHOLD,
  WS_BASE_URL,
  WS_RECONNECT_INTERVAL,
  WS_MAX_RECONNECT_ATTEMPTS,
  FEATURES,
  SECURITY,
  UI,
  DATE_FORMAT,
  TIME_FORMAT,
  DATETIME_FORMAT,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  ANALYTICS,
  CACHE
};