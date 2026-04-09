// platform/frontend-mui/src/hooks/useApi.ts
import { useState, useCallback, useEffect } from 'react';
import { enhancedApi as api } from '../utils/api';
import logger from '../utils/logger';
import { API_CONFIG, getApiHeaders } from '../config/api.config';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (params?: Record<string, string>) => Promise<T | null>;
  reset: () => void;
}

/**
 * 🔥 PRODUCTION-READY: Custom hook for making API requests with real backend authentication
 * 
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - API endpoint
 * @param body - Request body (for POST, PUT, etc.)
 * @param options - Additional options including auth and tenant settings
 * @returns API request state and control functions
 */
function useApi<T = any>(
  method: string,
  url: string,
  body?: any,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  // Extract options
  const { 
    onSuccess, 
    onError, 
    immediate = false, 
    params: initialParams,
    headers: customHeaders = {},
    skipAuth = false 
  } = options;

  // Request state
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  // Function to execute the API request
  const execute = useCallback(
    async (params?: Record<string, string>): Promise<T | null> => {
      // Start loading
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // 🔥 PRODUCTION-READY: Get clean headers (no mock headers)
      const defaultHeaders = getApiHeaders();
      const requestHeaders = { ...defaultHeaders, ...customHeaders };

      // Log the request start
      if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
        logger.debug(`🚀 API Request: ${method} ${url}`, {
          method,
          url,
          body,
          params: params || initialParams,
          headers: requestHeaders,
          timestamp: new Date().toISOString(),
        });
      }

      try {
        // Configure request parameters
        const requestParams = params || initialParams;
        const requestConfig = {
          params: requestParams,
          headers: requestHeaders,
          timeout: API_CONFIG.TIMEOUT,
        };

        let response;

        // Make the API request based on method
        switch (method.toUpperCase()) {
          case 'GET':
            response = await api.get<T>(url, requestConfig);
            break;
          case 'POST':
            response = await api.post<T>(url, body, requestConfig);
            break;
          case 'PUT':
            response = await api.put<T>(url, body, requestConfig);
            break;
          case 'DELETE':
            response = await api.delete<T>(url, requestConfig);
            break;
          case 'PATCH':
            response = await api.patch<T>(url, body, requestConfig);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        // Extract data from response
        const { data } = response;

        // Update state with successful response
        setState({
          data,
          loading: false,
          error: null,
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data);
        }

        // Log successful response
        if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
          logger.debug(`✅ API Request successful: ${method} ${url}`, {
            method,
            url,
            status: response.status,
            dataSize: JSON.stringify(data).length,
            timestamp: new Date().toISOString(),
          });
        }

        return data;
      } catch (error) {
        // Convert to Error type if needed
        const errorObj = error instanceof Error ? error : new Error(String(error));

        // Enhanced error logging
        logger.error(`❌ API Request failed: ${method} ${url}`, {
          method,
          url,
          error: errorObj.message,
          stack: errorObj.stack,
          headers: requestHeaders,
          body,
          timestamp: new Date().toISOString(),
        });

        // Handle specific error cases
        if ((error as any).response) {
          const { status, data: errorData } = (error as any).response;
          
          logger.error(`🌐 HTTP error: ${status}`, {
            status,
            errorData,
            url,
            method,
          });

          // Handle authentication errors - redirect to login
          if (status === 401) {
            logger.warn('🔐 Authentication failed - token expired or invalid');
            
            // Clear stored tokens
            localStorage.removeItem(API_CONFIG.AUTH.TOKEN_STORAGE_KEY);
            sessionStorage.removeItem(API_CONFIG.AUTH.TOKEN_STORAGE_KEY);
            localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
            
            // Redirect to login automatically
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
              sessionStorage.setItem('redirect_after_login', currentPath);
              logger.info('Redirecting to login due to 401 error');
              window.location.href = '/login';
            }
          }
          
          // Handle forbidden errors
          if (status === 403) {
            logger.error('🚫 Access forbidden - insufficient permissions');
          }
          
          // Handle tenant errors
          if (status === 404 && (errorData as any)?.message?.includes('tenant')) {
            logger.error('🏢 Tenant not found or inactive');
          }
        } else if ((error as any).request) {
          // 🔥 PRODUCTION-READY: Network error handling (no mock fallbacks)
          logger.error('🔌 Network error - unable to connect to backend', {
            url,
            method,
            timeout: API_CONFIG.TIMEOUT,
            baseUrl: API_CONFIG.BASE_URL,
          });
          
          // Enhanced network error message
          const networkError = new Error(
            'Unable to connect to the server. Please check your internet connection and try again.'
          );
          networkError.name = 'NetworkError';
          
          // Update state with network error
          setState({
            data: null,
            loading: false,
            error: networkError,
          });

          // Call onError callback
          if (onError) {
            onError(networkError);
          }

          return null;
        }

        // Update state with error
        setState({
          data: null,
          loading: false,
          error: errorObj,
        });

        // Call onError callback if provided
        if (onError) {
          onError(errorObj);
        }

        return null;
      }
    },
    [method, url, body, initialParams, customHeaders, skipAuth, onSuccess, onError]
  );

  // Function to reset the state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Execute the request immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  // Return state and control functions
  return {
    ...state,
    execute,
    reset,
  };
}

// Convenience hooks for common HTTP methods
export function useGet<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  return useApi<T>('GET', url, undefined, options);
}

export function usePost<T = any>(
  url: string,
  body?: any,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  return useApi<T>('POST', url, body, options);
}

export function usePut<T = any>(
  url: string,
  body?: any,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  return useApi<T>('PUT', url, body, options);
}

export function useDelete<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  return useApi<T>('DELETE', url, undefined, options);
}

export function usePatch<T = any>(
  url: string,
  body?: any,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  return useApi<T>('PATCH', url, body, options);
}

// Authentication-aware hooks
export function useAuthenticatedGet<T = any>(
  url: string,
  options: Omit<UseApiOptions, 'skipAuth'> = {}
): UseApiReturn<T> {
  return useApi<T>('GET', url, undefined, { ...options, skipAuth: false });
}

export function usePublicGet<T = any>(
  url: string,
  options: Omit<UseApiOptions, 'skipAuth'> = {}
): UseApiReturn<T> {
  return useApi<T>('GET', url, undefined, { ...options, skipAuth: true });
}

export default useApi;