// platform/frontend-mui/src/utils/api.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import logger from './logger';
import { API_CONFIG, API_BASE_URL, getApiHeaders } from '../config/api.config';
import { 
  getAuthToken, 
  getRefreshToken, 
  setAuthToken, 
  logout, 
  isDevelopmentMode 
} from './auth';

// 🔥 ENHANCED: Keep your existing interfaces but add new ones
interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
  withCredentials?: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface StandardApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

/**
 * 🔥 ENHANCED: Your existing API client with authentication and tenant support
 * Provides a wrapper around fetch with automatic logging of requests and responses
 */
class ApiClient {
  private baseUrl: string;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || API_BASE_URL;
    
    // 🔥 NEW: Initialize Axios instance for enhanced features
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: API_CONFIG?.TIMEOUT || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupAxiosInterceptors();
    
    if (isDevelopmentMode()) {
      console.log('🔧 API Client initialized:', {
        baseUrl: this.baseUrl,
        timeout: this.axiosInstance.defaults.timeout,
      });
    }
  }

  // 🔥 NEW: Setup Axios interceptors for authentication and tenant support
  private setupAxiosInterceptors(): void {
    // Request interceptor - Add auth & tenant headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Get dynamic headers for each request
        const headers = getApiHeaders();
        config.headers = { ...config.headers, ...headers };

        // Log request in development
        if (isDevelopmentMode() && API_CONFIG?.DEVELOPMENT?.LOG_REQUESTS) {
          logger.debug(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
            params: config.params,
            baseURL: config.baseURL,
          });
        }

        return config;
      },
      (error) => {
        logger.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle auth errors & token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (isDevelopmentMode() && API_CONFIG?.DEVELOPMENT?.LOG_REQUESTS) {
          logger.debug(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Enhanced error logging
        if (isDevelopmentMode()) {
          logger.error(`❌ API Error: ${error.response?.status || 'Network'} ${originalRequest?.url}`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            message: error.message,
            code: error.code,
          });
        }

        // Handle network errors
        if (!error.response) {
          const networkError = new Error('Unable to connect to server. Please check your internet connection.');
          networkError.name = 'NetworkError';
          throw networkError;
        }

        // Handle 401 Unauthorized with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip token refresh for auth endpoints
          if (originalRequest.url?.includes('/auth/')) {
            logout();
            if (!isDevelopmentMode()) {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }

          // Handle token refresh logic
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Attempt to refresh token
            const response = await axios.post(`${this.baseUrl}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const newToken = response.data.data?.access_token || response.data.access_token;
            if (newToken) {
              setAuthToken(newToken);

              // Process failed queue
              this.failedQueue.forEach(({ resolve }) => resolve(newToken));
              this.failedQueue = [];

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.axiosInstance(originalRequest);
            } else {
              throw new Error('No access token in refresh response');
            }
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            logout();
            
            // Dispatch auth failure event
            window.dispatchEvent(new CustomEvent('auth:failed', {
              detail: { error: refreshError }
            }));
            
            if (!isDevelopmentMode()) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other error statuses
        if (error.response?.status === 403) {
          window.dispatchEvent(new CustomEvent('auth:forbidden', {
            detail: { error: error.response.data }
          }));
        }

        if (error.response?.status === 429) {
          window.dispatchEvent(new CustomEvent('api:rateLimit', {
            detail: { error: error.response.data }
          }));
        }

        if (error.response?.status >= 500) {
          window.dispatchEvent(new CustomEvent('api:serverError', {
            detail: { error: error.response.data }
          }));
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 🔥 ENHANCED: Your existing request method with tenant-aware headers
   * Make an HTTP request with logging
   */
  async request<T>(
    method: string,
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      withCredentials = true,
      headers = {},
      body,
      ...restOptions
    } = options;

    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url = `${url}?${queryParams.toString()}`;
    }

    // 🔥 ENHANCED: Get tenant-aware headers
    const apiHeaders = getApiHeaders();
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...apiHeaders,  // 🔥 NEW: Add tenant-aware headers
        ...headers,
      },
      credentials: withCredentials ? 'include' : 'same-origin',
      ...restOptions,
    };

    // Add body if provided
    if (body) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Log the request
    const requestData = body ? { body } : undefined;
    logger.logRequest(method, url, requestData);

    // Measure request duration
    const endMeasure = logger.measure(`API ${method} ${endpoint}`);

    try {
      // Make the request
      const response = await fetch(url, requestOptions);
      const responseTime = endMeasure();

      // Parse response data
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      // Log the response
      logger.logResponse(method, url, response.status, {
        data,
        duration: responseTime,
      });

      // Handle error responses
      if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        Object.assign(error, {
          status: response.status,
          data,
          url,
          method,
        });
        throw error;
      }

      // Return successful response
      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      // Log errors
      logger.error(`API Error: ${method} ${url}`, { error });
      throw error;
    }
  }

  // 🔥 KEEP: Your existing convenience methods
  async get<T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, {
      ...options,
      body: data,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, {
      ...options,
      body: data,
    });
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, {
      ...options,
      body: data,
    });
  }

  // 🔥 NEW: Enhanced Axios-based methods for advanced features
  async axiosGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  async axiosPost<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async axiosPut<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async axiosPatch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  async axiosDelete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  // 🔥 NEW: File upload with progress
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // 🔥 NEW: Health check with enhanced error handling
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosGet('/health', { timeout: 5000 });
      
      if (isDevelopmentMode()) {
        console.log('✅ Health check successful:', response.data);
      }
      
      return response.status === 200;
    } catch (error) {
      if (isDevelopmentMode()) {
        console.error('❌ Health check failed:', error);
      }
      return false;
    }
  }

  // 🔥 NEW: API endpoint testing
  async testEndpoints(): Promise<Record<string, boolean>> {
    const endpoints = [
      { name: 'health', path: '/health' },
      { name: 'users', path: '/users?limit=1' },
      { name: 'roles', path: '/roles?limit=1' },
      { name: 'departments', path: '/departments?limit=1' },
    ];

    const results: Record<string, boolean> = {};

    for (const endpoint of endpoints) {
      try {
        const response = await this.axiosGet(endpoint.path, { timeout: 10000 });
        results[endpoint.name] = response.status === 200;
      } catch (error) {
        results[endpoint.name] = false;
        if (isDevelopmentMode()) {
          console.error(`❌ Test failed for ${endpoint.name}:`, error);
        }
      }
    }

    return results;
  }

  // 🔥 NEW: Tenant operations
  async getCurrentTenant(): Promise<any> {
    try {
      const response = await this.axiosGet('/tenants/current');
      return response.data;
    } catch (error) {
      if (isDevelopmentMode()) {
        console.warn('⚠️ Could not fetch current tenant:', error);
      }
      return null;
    }
  }

  // 🔥 ENHANCED: Authentication methods
  async login(credentials: { email: string; password: string }): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPost('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<StandardApiResponse<any>> {
    try {
      const response = await this.axiosPost('/auth/logout');
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local auth
      logout();
      throw error;
    }
  }

  async refreshToken(): Promise<StandardApiResponse<any>> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.axiosPost('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    return response.data;
  }

  // 🔥 NEW: User management methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
  }): Promise<StandardApiResponse<any>> {
    const response = await this.axiosGet('/users', { params });
    return response.data;
  }

  async getUser(id: string | number): Promise<StandardApiResponse<any>> {
    const response = await this.axiosGet(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: any): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPost('/users', userData);
    return response.data;
  }

  async updateUser(id: string | number, userData: any): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPut(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string | number): Promise<StandardApiResponse<any>> {
    const response = await this.axiosDelete(`/users/${id}`);
    return response.data;
  }

  // 🔥 NEW: Role management methods
  async getRoles(params?: { page?: number; limit?: number }): Promise<StandardApiResponse<any>> {
    const response = await this.axiosGet('/roles', { params });
    return response.data;
  }

  async getRole(id: string | number): Promise<StandardApiResponse<any>> {
    const response = await this.axiosGet(`/roles/${id}`);
    return response.data;
  }

  async createRole(roleData: any): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPost('/roles', roleData);
    return response.data;
  }

  async updateRole(id: string | number, roleData: any): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPut(`/roles/${id}`, roleData);
    return response.data;
  }

  async deleteRole(id: string | number): Promise<StandardApiResponse<any>> {
    const response = await this.axiosDelete(`/roles/${id}`);
    return response.data;
  }

  // 🔥 NEW: Department management methods
  async getDepartments(params?: { page?: number; limit?: number }): Promise<StandardApiResponse<any>> {
    const response = await this.axiosGet('/departments', { params });
    return response.data;
  }

  async getDepartment(id: string | number): Promise<StandardApiResponse<any>> {
    const response = await this.axiosGet(`/departments/${id}`);
    return response.data;
  }

  async createDepartment(deptData: any): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPost('/departments', deptData);
    return response.data;
  }

  async updateDepartment(id: string | number, deptData: any): Promise<StandardApiResponse<any>> {
    const response = await this.axiosPut(`/departments/${id}`, deptData);
    return response.data;
  }

  async deleteDepartment(id: string | number): Promise<StandardApiResponse<any>> {
    const response = await this.axiosDelete(`/departments/${id}`);
    return response.data;
  }

  // 🔥 NEW: Utility methods
  getBaseURL(): string {
    return this.baseUrl;
  }

  getDefaultHeaders(): Record<string, any> {
    return this.axiosInstance.defaults.headers.common || {};
  }

  // 🔥 NEW: Error handling utilities
  handleApiError(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0] as string;
      }
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }

  isApiSuccess(response: StandardApiResponse<any>): boolean {
    return response.status === 'success';
  }

  extractApiData<T>(response: StandardApiResponse<T>): T | null {
    return this.isApiSuccess(response) ? response.data || null : null;
  }
}

// 🔥 ENHANCED: Create default API client instance with enhanced base URL
const api = new ApiClient(import.meta.env.VITE_API_BASE_URL || API_BASE_URL || '/api/v1');

// 🔥 NEW: Export utility functions
export const apiUtils = {
  handleError: (error: any) => api.handleApiError(error),
  isSuccess: (response: StandardApiResponse<any>) => api.isApiSuccess(response),
  extractData: <T>(response: StandardApiResponse<T>) => api.extractApiData(response),
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },
};



export { api as enhancedApi };
export default api;
