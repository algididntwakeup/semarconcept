// platform/frontend-mui/src/store/slices/auth/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';
import logger from '../../utils/logger';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    is_active: boolean;
    is_admin: boolean;
  };
}

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    // Start performance measurement
    const endMeasure = logger.measure('Login API Call');
    
    logger.info('Login attempt', {
      action: 'login',
      username: credentials.username,
      // Don't log the actual password
    });
    
    try {
      const response = await axios.post<{ data: LoginResponse }>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      // Log successful login
      const userData = response.data.data.user;
      logger.info('Login successful', {
        action: 'login_success',
        userId: userData.id,
        username: userData.username,
        isAdmin: userData.is_admin,
        duration: endMeasure(),
      });
      
      return response.data.data;
    } catch (error: any) {
      // Log login failure
      const errorMessage = error.response?.data?.error || 'Failed to login';
      logger.error('Login failed', {
        action: 'login_failure',
        username: credentials.username,
        error: errorMessage,
        status: error.response?.status,
        duration: endMeasure(),
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

export const register = createAsyncThunk<any, RegisterData>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    // Start performance measurement
    const endMeasure = logger.measure('Register API Call');
    
    logger.info('Registration attempt', {
      action: 'register',
      username: data.username,
      email: data.email,
      // Don't log the password
    });
    
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
      
      // Log successful registration
      logger.info('Registration successful', {
        action: 'register_success',
        username: data.username,
        duration: endMeasure(),
      });
      
      return response.data.data;
    } catch (error: any) {
      // Log registration failure
      const errorMessage = error.response?.data?.error || 'Failed to register';
      logger.error('Registration failed', {
        action: 'register_failure',
        username: data.username,
        error: errorMessage,
        status: error.response?.status,
        duration: endMeasure(),
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  logger.info('User logout', {
    action: 'logout',
    timestamp: new Date().toISOString(),
  });
  
  // Clear local storage
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('token');
  return null;
});

export const refreshToken = createAsyncThunk<any, string>(
  'auth/refresh',
  async (refreshToken, { rejectWithValue }) => {
    // Start performance measurement
    const endMeasure = logger.measure('Token Refresh API Call');
    
    logger.debug('Token refresh attempt', {
      action: 'refresh_token',
    });
    
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });
      
      // Log successful token refresh
      logger.debug('Token refresh successful', {
        action: 'refresh_token_success',
        duration: endMeasure(),
      });
      
      return response.data.data;
    } catch (error: any) {
      // Log token refresh failure
      const errorMessage = error.response?.data?.error || 'Failed to refresh token';
      logger.error('Token refresh failed', {
        action: 'refresh_token_failure',
        error: errorMessage,
        status: error.response?.status,
        duration: endMeasure(),
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);