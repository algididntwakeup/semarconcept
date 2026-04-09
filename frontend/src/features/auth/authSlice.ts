// platform/frontend-mui/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, register, logout, refreshToken } from './authThunks';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  // Add aliases for compatibility
  isActive?: boolean;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || sessionStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      
      // Store in localStorage or sessionStorage based on rememberMe
      if (localStorage.getItem('rememberMe')) {
        localStorage.setItem('token', action.payload);
      } else {
        sessionStorage.setItem('token', action.payload);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      
      // Map API response to our User interface
      const user = {
        ...action.payload.user,
        // Add aliases for compatibility
        isActive: action.payload.user.is_active,
        isAdmin: action.payload.user.is_admin,
      };
      
      state.user = user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      
      // Store tokens based on rememberMe
      if (localStorage.getItem('rememberMe')) {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      } else {
        sessionStorage.setItem('token', action.payload.token);
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
    });
    
    // Refresh token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      
      // Update token in storage
      if (localStorage.getItem('rememberMe')) {
        localStorage.setItem('token', action.payload.token);
      } else {
        sessionStorage.setItem('token', action.payload.token);
      }
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
    });
  },
});

export const { clearErrors, setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;