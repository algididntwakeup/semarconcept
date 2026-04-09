// features/auth/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';

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
    try {
      // Create the correct payload format for the backend
      // The backend expects both username and usernameoremail fields
      const payload = {
        username: credentials.username,
        password: credentials.password
      };

      console.log('Sending login request with payload:', payload);
      
      const response = await axios.post<{ data: LoginResponse }>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload
      );
      
      console.log('Login response:', response.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.error || 'Failed to login'
      );
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
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to register'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear local storage
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('token');
  return null;
});

export const refreshToken = createAsyncThunk<any, string>(
  'auth/refresh',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to refresh token'
      );
    }
  }
);