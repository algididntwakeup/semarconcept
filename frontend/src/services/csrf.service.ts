/**
 * CSRF Token Service
 * 
 * This service handles CSRF token management for the application.
 * It provides functions to fetch, store, and include CSRF tokens in API requests.
 */

import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';

// CSRF token storage key
const CSRF_TOKEN_KEY = 'X-CSRF-TOKEN';

/**
 * CSRF Token Service
 */
class CSRFService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;

  /**
   * Initialize the CSRF service
   * This should be called when the application starts
   */
  public async initialize(): Promise<void> {
    try {
      await this.refreshToken();
      this.setupInterceptors();
      console.log('CSRF protection initialized');
    } catch (error) {
      console.error('Failed to initialize CSRF protection:', error);
    }
  }

  /**
   * Get the current CSRF token
   * If the token is expired or doesn't exist, it will fetch a new one
   */
  public async getToken(): Promise<string> {
    // If a token refresh is already in progress, return that promise
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // If token exists and is not expired, return it
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    // Otherwise, refresh the token
    return this.refreshToken();
  }

  /**
   * Refresh the CSRF token
   */
  public async refreshToken(): Promise<string> {
    // Create a promise to fetch a new token
    this.tokenRefreshPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Fetch a new token from the server
        const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
          withCredentials: true
        });

        // Extract token and expiry from response
        const token = response.data.token;
        const expiresIn = response.data.expiresIn || 3600; // Default to 1 hour

        // Store the token and calculate expiry time
        this.token = token;
        this.tokenExpiry = Date.now() + expiresIn * 1000;

        // Store token in localStorage for persistence across page reloads
        localStorage.setItem(CSRF_TOKEN_KEY, token);

        resolve(token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        reject(error);
      } finally {
        this.tokenRefreshPromise = null;
      }
    });

    return this.tokenRefreshPromise;
  }

  /**
   * Clear the stored CSRF token
   * This should be called when the user logs out
   */
  public clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem(CSRF_TOKEN_KEY);
  }

  /**
   * Setup axios interceptors to automatically include CSRF token in requests
   */
  private setupInterceptors(): void {
    // Request interceptor
    axios.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // Only add CSRF token to requests to our API
        if (config.url?.startsWith(API_BASE_URL)) {
          // Only add CSRF token to non-GET requests
          if (config.method !== 'get') {
            try {
              const token = await this.getToken();
              if (token && config.headers) {
                config.headers[CSRF_TOKEN_KEY] = token;
              }
            } catch (error) {
              console.error('Error adding CSRF token to request:', error);
            }
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle CSRF token errors
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If error is due to CSRF token validation failure
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data?.error === 'invalid_csrf_token'
        ) {
          try {
            // Refresh the token
            await this.refreshToken();

            // Retry the original request with the new token
            const originalRequest = error.config;
            if (originalRequest.headers) {
              originalRequest.headers[CSRF_TOKEN_KEY] = this.token;
            }
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh CSRF token:', refreshError);
            // If token refresh fails, redirect to login or show error
            // This could be handled by a global error handler
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get CSRF token from localStorage (used when restoring app state)
   */
  public loadTokenFromStorage(): void {
    const storedToken = localStorage.getItem(CSRF_TOKEN_KEY);
    if (storedToken) {
      this.token = storedToken;
      // Set expiry to 1 hour from now as a fallback
      // The token will be refreshed on the next request if needed
      this.tokenExpiry = Date.now() + 3600 * 1000;
    }
  }
}

// Create and export a singleton instance
const csrfService = new CSRFService();
export default csrfService;