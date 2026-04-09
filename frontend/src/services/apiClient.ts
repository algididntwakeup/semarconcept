// platform/frontend-mui/src/services/apiClient.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return 'https://breksolindo.opuschamber.com/api/v1';
  }
  let url = envUrl.trim().replace(/\/+$/, '');
  if (url.endsWith('/api/v1')) return url;
  if (url.endsWith('/api')) return url + '/v1';
  return url + '/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 400,
});

// ---------------------------------------------------------------------------
// Auth token helpers — single canonical storage key
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const TENANT_KEY = 'tenant_data';
const TENANT_ID_KEY = 'tenant_id';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (!token?.trim()) return;
  localStorage.setItem(TOKEN_KEY, token.trim());
};

export const clearAuthToken = (): void => {
  [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, TENANT_KEY, TENANT_ID_KEY, 'token_expires_at'].forEach(
    (key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  );
};

export const getTenantId = (): string | null => {
  return localStorage.getItem(TENANT_ID_KEY) || sessionStorage.getItem(TENANT_ID_KEY);
};

export const setTenantId = (tenantId: string): void => {
  if (!tenantId?.trim()) return;
  localStorage.setItem(TENANT_ID_KEY, tenantId.trim());
};

export const getCurrentUser = (): any | null => {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: any): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
};

export const getCurrentTenant = (): any | null => {
  try {
    const data = localStorage.getItem(TENANT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCurrentTenant = (tenant: any): void => {
  try {
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
  } catch {
    /* ignore */
  }
};

// ---------------------------------------------------------------------------
// Request interceptor — attach token & tenant
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    config.headers = config.headers || {};

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }

    const tenantId = getTenantId();
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle login data storage & 401 redirect
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

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
    // Auto-store auth data from login response
    if (response.config.url?.includes('/auth/login') && response.data?.data) {
      const authData = response.data.data;
      const primaryToken = authData.access_token || authData.token;
      const refreshToken = authData.refresh_token;
      const user = authData.user;
      const tenant = authData.tenant;

      if (primaryToken) setAuthToken(primaryToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      if (user) {
        setCurrentUser(user);
        if (user.tenant_id) setTenantId(user.tenant_id.toString());
      }
      if (tenant) setCurrentTenant(tenant);
      if (authData.expires_at) localStorage.setItem('token_expires_at', authData.expires_at);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 — attempt silent token refresh, then redirect
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      // If we have a refresh token and aren't already refreshing, try refresh
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newToken =
            refreshResponse.data?.data?.access_token || refreshResponse.data?.data?.token;
          if (newToken) {
            setAuthToken(newToken);
            processQueue(null, newToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      // Refresh failed or no refresh token — redirect to login
      clearAuthToken();
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
        sessionStorage.setItem('redirect_after_login', currentPath);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Exports
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
};

export const getBaseURL = (): string => API_BASE_URL;

export default apiClient;