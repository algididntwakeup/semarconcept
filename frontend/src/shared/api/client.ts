// platform/frontend-mui/src/shared/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NormalizedApiError } from './types';

// ---------------------------------------------------------------------------
// Storage Keys
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const TENANT_KEY = 'tenant_data';
const TENANT_ID_KEY = 'tenant_id';
const CSRF_KEY = 'X-CSRF-TOKEN';
const TOKEN_EXPIRES_KEY = 'token_expires_at';

// ---------------------------------------------------------------------------
// Base URL Construction (prevents double /api/v1)
// ---------------------------------------------------------------------------
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (!envUrl) {
    return '/api/v1';
  }
  const clean = envUrl.trim().replace(/\/+$/, '');
  if (clean.endsWith('/api/v1')) return clean;
  if (clean.endsWith('/api')) return `${clean}/v1`;
  return `${clean}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();

// ---------------------------------------------------------------------------
// Storage & Identity Helpers
// ---------------------------------------------------------------------------
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const possibleKeys = [TOKEN_KEY, 'authToken', 'token', 'access_token', 'jwt_token'];
  for (const k of possibleKeys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v && v.trim()) return v.trim();
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (!token?.trim()) return;
  localStorage.setItem(TOKEN_KEY, token.trim());
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  if (!token?.trim()) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token.trim());
};

export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, TENANT_KEY, TENANT_ID_KEY, CSRF_KEY, TOKEN_EXPIRES_KEY].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const getTenantId = (): string | null => {
  if (typeof window === 'undefined') return '1';
  return localStorage.getItem(TENANT_ID_KEY) || sessionStorage.getItem(TENANT_ID_KEY) || '1';
};

export const setTenantId = (tenantId: string | number): void => {
  if (tenantId === undefined || tenantId === null) return;
  localStorage.setItem(TENANT_ID_KEY, String(tenantId).trim());
};

export const getCurrentUser = <T = any>(): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: any): void => {
  if (typeof window === 'undefined' || !user) return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
};

export const getCurrentTenant = <T = any>(): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(TENANT_KEY) || sessionStorage.getItem(TENANT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCurrentTenant = (tenant: any): void => {
  if (typeof window === 'undefined' || !tenant) return;
  try {
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
  } catch {
    /* ignore */
  }
};

export const getCsrfToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CSRF_KEY) || sessionStorage.getItem(CSRF_KEY);
};

export const setCsrfToken = (token: string): void => {
  if (!token?.trim()) return;
  localStorage.setItem(CSRF_KEY, token.trim());
};

// ---------------------------------------------------------------------------
// Error Normalization
// ---------------------------------------------------------------------------
export const normalizeApiError = (err: unknown): NormalizedApiError => {
  if (err instanceof NormalizedApiError) {
    return err;
  }

  if (axios.isAxiosError(err)) {
    const status = err.response?.status || (err.code === 'ECONNABORTED' ? 408 : 0);
    const data = err.response?.data as any;

    let message = 'An unexpected error occurred';
    let code: string | undefined = undefined;
    let errors: Record<string, string[] | string> | undefined = undefined;

    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (typeof data === 'object') {
        message = data.message || data.error || err.message || message;
        code = data.code;
        if (data.errors && typeof data.errors === 'object') {
          errors = data.errors;
        } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          errors = data.data;
        }
      }
    } else if (err.message) {
      message = err.message;
    }

    if (!err.response && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
      message = 'Unable to connect to server. Please check your network connection.';
    }

    return new NormalizedApiError(status, message, code, errors, err);
  }

  if (err instanceof Error) {
    return new NormalizedApiError(0, err.message, undefined, undefined, err);
  }

  return new NormalizedApiError(0, String(err || 'Unknown error'), undefined, undefined, err);
};

// ---------------------------------------------------------------------------
// Axios Instance Creation
// ---------------------------------------------------------------------------
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env?.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  validateStatus: (status) => status >= 200 && status < 400,
});

// ---------------------------------------------------------------------------
// Request Interceptor: Attach Auth, Tenant, CSRF, and Request Tracking
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: any) => {
    config.headers = config.headers || {};

    // 1. Auth Header
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // 2. Tenant Header
    const tenantId = getTenantId();
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    // 3. CSRF Token (for state-changing methods)
    const method = config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrf = getCsrfToken();
      if (csrf) {
        config.headers['X-CSRF-TOKEN'] = csrf;
      }
    }

    // 4. Request ID
    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(normalizeApiError(error))
);

// ---------------------------------------------------------------------------
// Response Interceptor: Silent Token Refresh Queue & Normalization
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Automatically capture and store auth session on successful login
    if (response.config.url?.includes('/auth/login') && response.data?.data) {
      const authData = response.data.data;
      const primaryToken = authData.access_token || authData.token;
      const refreshToken = authData.refresh_token;
      const user = authData.user;
      const tenant = authData.tenant;

      if (primaryToken) setAuthToken(primaryToken);
      if (refreshToken) setRefreshToken(refreshToken);
      if (user) {
        setCurrentUser(user);
        if (user.tenant_id) setTenantId(user.tenant_id);
      }
      if (tenant) setCurrentTenant(tenant);
      if (authData.expires_at) localStorage.setItem(TOKEN_EXPIRES_KEY, String(authData.expires_at));
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || '';

      // Do not attempt refresh on auth endpoints to avoid infinite loops
      if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout')) {
        clearAuthToken();
        return Promise.reject(normalizeApiError(error));
      }

      const refreshToken = getRefreshToken();

      // If already refreshing, join wait queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeApiError(err)));
      }

      // If refresh token exists, attempt refresh
      if (refreshToken) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken, refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newToken =
            refreshRes.data?.data?.access_token ||
            refreshRes.data?.data?.token ||
            refreshRes.data?.access_token;

          if (newToken) {
            setAuthToken(newToken);
            processQueue(null, newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          } else {
            throw new Error('No access token received from refresh endpoint');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          clearAuthToken();
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
              sessionStorage.setItem('redirect_after_login', currentPath);
              window.location.href = '/login';
            }
          }
          return Promise.reject(normalizeApiError(refreshErr));
        } finally {
          isRefreshing = false;
        }
      }

      // No refresh token available: clear and redirect
      clearAuthToken();
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
          sessionStorage.setItem('redirect_after_login', currentPath);
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

// ---------------------------------------------------------------------------
// Backward-Compatibility Object Export
// ---------------------------------------------------------------------------
export const apiUtils = {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getTenantId,
  setTenantId,
  getCurrentUser,
  setCurrentUser,
  getCurrentTenant,
  setCurrentTenant,
  getCsrfToken,
  setCsrfToken,
  normalizeApiError,
};

export const getBaseURL = (): string => API_BASE_URL;

export default apiClient;
