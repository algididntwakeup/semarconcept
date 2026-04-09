// platform/frontend-mui/src/config/api.config.ts

// 🔥 CORS FIX: Simplified API base URL construction - NO DOUBLE PATHS
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!envUrl) {
    console.warn('⚠️ VITE_API_BASE_URL not set, using relative fallback');
    return '/api/v1';
  }
  
  // 🔥 CRITICAL FIX: Prevent double /api/v1 by proper URL handling
  let normalizedUrl = envUrl.trim();
  
  // Remove trailing slash
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  // 🔥 FIXED: Only add /api/v1 if it's not already there
  if (normalizedUrl.endsWith('/api/v1')) {
    // Already has /api/v1, don't add it again
    return normalizedUrl;
  } else if (normalizedUrl.endsWith('/api')) {
    // Has /api but not /v1, add /v1
    return normalizedUrl + '/v1';
  } else {
    // No /api at all, add /api/v1
    return normalizedUrl + '/api/v1';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Development mode detection
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// 🔥 PRODUCTION-READY: API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // 🔥 FIXED: WebSocket URL for production
  WEBSOCKET_URL: import.meta.env.VITE_WS_BASE_URL || `ws://${typeof window !== 'undefined' ? window.location.host : 'localhost:4072'}/ws`,
  
  DEVELOPMENT: {
    ENABLED: isDevelopment,
    LOG_REQUESTS: import.meta.env.VITE_ENABLE_NETWORK_LOGGING === 'true',
    DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
  
  TENANT: {
    HEADER_NAME: 'X-Tenant-ID',
    SUBDOMAIN_HEADER: 'X-Tenant-Subdomain',
    REQUEST_ID_HEADER: 'X-Request-ID',
  },
  
  AUTH: {
    TOKEN_STORAGE_KEY: import.meta.env.VITE_AUTH_STORAGE_KEY ? 
      `${import.meta.env.VITE_AUTH_STORAGE_KEY}_token` : 'auth_token',
    USER_STORAGE_KEY: import.meta.env.VITE_AUTH_STORAGE_KEY ? 
      `${import.meta.env.VITE_AUTH_STORAGE_KEY}_user` : 'user_data',
    TENANT_STORAGE_KEY: import.meta.env.VITE_AUTH_STORAGE_KEY ? 
      `${import.meta.env.VITE_AUTH_STORAGE_KEY}_tenant` : 'tenant_data',
    REFRESH_TOKEN_KEY: import.meta.env.VITE_AUTH_STORAGE_KEY ? 
      `${import.meta.env.VITE_AUTH_STORAGE_KEY}_refresh` : 'refresh_token',
    EXPIRES_IN: Number(import.meta.env.VITE_AUTH_TOKEN_EXPIRY) || 86400,
  }
};

// API endpoints (unchanged)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    DETAIL: (id: string | number) => `/users/${id}`,
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    STATS: '/users/stats',
    BULK_ACTIONS: '/users/bulk-actions',
    EXPORT: '/users/export',
    IMPORT: '/users/import',
    MANAGERS: '/users/managers',
    STATUS: (id: string | number) => `/users/${id}/status`,
    RESET_PASSWORD: (id: string | number) => `/users/${id}/reset-password`,
    AVATAR: (id: string | number) => `/users/${id}/avatar`,
    TWO_FACTOR: (id: string | number) => `/users/${id}/two-factor`,
    ACTIVITY: (id: string | number) => `/users/${id}/activity`,
    PREFERENCES: (id: string | number) => `/users/${id}/preferences`,
  },
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    DETAIL: (id: string | number) => `/roles/${id}`,
    UPDATE: (id: string | number) => `/roles/${id}`,
    DELETE: (id: string | number) => `/roles/${id}`,
    PERMISSIONS: (id: string | number) => `/roles/${id}/permissions`,
  },
  PERMISSIONS: {
    LIST: '/permissions',
    CREATE: '/permissions',
    DETAIL: (id: string | number) => `/permissions/${id}`,
    UPDATE: (id: string | number) => `/permissions/${id}`,
    DELETE: (id: string | number) => `/permissions/${id}`,
  },
  DEPARTMENTS: {
    LIST: '/departments',
    CREATE: '/departments',
    DETAIL: (id: string | number) => `/departments/${id}`,
    UPDATE: (id: string | number) => `/departments/${id}`,
    DELETE: (id: string | number) => `/departments/${id}`,
    USERS: (id: string | number) => `/departments/${id}/users`,
  },
  TENANTS: {
    LIST: '/tenants',
    CURRENT: '/tenants/current',
    BY_SUBDOMAIN: (subdomain: string) => `/tenants/subdomain/${subdomain}`,
    CREATE: '/tenants',
    DETAIL: (id: string | number) => `/tenants/${id}`,
    UPDATE: (id: string | number) => `/tenants/${id}`,
    DELETE: (id: string | number) => `/tenants/${id}`,
    CONFIG: (id: string | number) => `/tenants/${id}/config`,
    BRANDING: (id: string | number) => `/tenants/${id}/branding`,
    USERS: (id: string | number) => `/tenants/${id}/users`,
    STATS: (id: string | number) => `/tenants/${id}/stats`,
  },
  ASSETS: {
    SITES: '/sites',
    UNITS: '/units',
    EQUIPMENT: '/equipment',
    COMPONENTS: '/components',
    HIERARCHY: '/assets/hierarchy',
    STATISTICS: '/assets/statistics',
    SEARCH: '/assets/search',
  },
  INSPECTIONS: {
    PLANS: '/inspection-plans',
    TASKS: '/inspection-tasks',
    RESULTS: '/inspection-results',
  },
  MAINTENANCE: {
    WORK_ORDERS: '/work-orders',
    PLANS: '/maintenance-plans',
  },
  COMPLIANCE: {
    STANDARDS: '/standards',
    REQUIREMENTS: '/requirements',
    AUDITS: '/audits',
  },
  CONTENT: {
    TYPES: '/content-types',
    ITEMS: '/content-items',
    CATEGORIES: '/categories',
  },
  DASHBOARDS: {
    LIST: '/dashboards',
    LAYOUT: (id: string | number) => `/dashboards/${id}/layout`,
    WIDGET_DATA: (id: string | number, widgetId: string | number) => `/dashboards/${id}/widgets/${widgetId}/data`,
  },
  HEALTH: '/health',
  LOGS: '/logs',
};

// 🔥 FIXED: Tenant detection for production
export const getTenantFromDomain = (): string => {
  if (typeof window === 'undefined') return 'reksolindo';
  
  const hostname = window.location.hostname;
  
  // Extract subdomain for multi-tenant setup
  if (hostname.includes('.opuschamber.com')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      return subdomain !== 'www' ? subdomain : 'reksolindo';
    }
  }
  
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return import.meta.env.VITE_DEFAULT_TENANT || 'reksolindo';
  }
  
  return import.meta.env.VITE_DEFAULT_TENANT || 'reksolindo'; // Default fallback
};

// 🔥 CORS FIX: Clean header generation - NO PROBLEMATIC HEADERS
export const getApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  // Add tenant headers
  const tenant = getTenantFromDomain();
  headers[API_CONFIG.TENANT.HEADER_NAME] = tenant;
  headers[API_CONFIG.TENANT.SUBDOMAIN_HEADER] = tenant;
  
  // Add request ID for tracking
  headers[API_CONFIG.TENANT.REQUEST_ID_HEADER] = 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add authentication token if available
  const token = getAuthToken();
  if (token) {
    // 🔥 FIXED: Ensure Bearer prefix
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  
  // 🔥 CORS FIX: DO NOT ADD X-Client-Type header
  // headers['X-Client-Type'] = 'web'; // ← REMOVED
  
  return headers;
};

// 🔥 FIXED: Enhanced token retrieval
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try multiple token storage keys for compatibility
  const possibleKeys = [
    API_CONFIG.AUTH.TOKEN_STORAGE_KEY,
    'auth_token',
    'authToken', 
    'token',
    'access_token',
    'jwt_token'
  ];
  
  // Check localStorage first
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token && token.trim() !== '') {
      return token.trim();
    }
  }
  
  // Check sessionStorage as fallback
  for (const key of possibleKeys) {
    const token = sessionStorage.getItem(key);
    if (token && token.trim() !== '') {
      return token.trim();
    }
  }
  
  return null;
};

// Build full URL helper
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// 🔥 ENHANCED: Validation with better error reporting
export const validateApiConfig = (): boolean => {
  const errors: string[] = [];

  if (!API_BASE_URL) {
    errors.push('API_BASE_URL is required');
  }

  if (!API_BASE_URL.includes('/api/v1')) {
    errors.push('API_BASE_URL should include /api/v1 path');
  }

  if (!API_CONFIG.AUTH.TOKEN_STORAGE_KEY) {
    errors.push('AUTH.TOKEN_STORAGE_KEY is required');
  }

  if (errors.length > 0) {
    console.error('❌ API Configuration errors:', errors);
    return false;
  }

  console.log('✅ API Configuration validated:', {
    baseUrl: API_BASE_URL,
    websocketUrl: API_CONFIG.WEBSOCKET_URL,
    timeout: API_CONFIG.TIMEOUT,
    tenant: getTenantFromDomain(),
    hasToken: !!getAuthToken(),
  });

  return true;
};

// Environment info helper
export const getEnvironmentInfo = () => {
  return {
    apiBaseUrl: API_BASE_URL,
    websocketUrl: API_CONFIG.WEBSOCKET_URL,
    isDevelopment: API_CONFIG.DEVELOPMENT.ENABLED,
    tenant: getTenantFromDomain(),
    authStorageKey: API_CONFIG.AUTH.TOKEN_STORAGE_KEY,
    hasToken: !!getAuthToken(),
    environment: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
};

// Auto-validate configuration on import
if (typeof window !== 'undefined') {
  validateApiConfig();
}

export { isDevelopment };

// Debug utilities for development
if (API_CONFIG.DEVELOPMENT.DEBUG_MODE && typeof window !== 'undefined') {
  (window as any).API_DEBUG = {
    config: API_CONFIG,
    endpoints: API_ENDPOINTS,
    headers: getApiHeaders,
    envInfo: getEnvironmentInfo,
    validate: validateApiConfig,
  };
  
  console.log('🔧 API Debug utilities available at window.API_DEBUG');
}