// platform/frontend-mui/src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../lib/auth/authService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface User {
  id: number | string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  is_superuser?: boolean;
  roles?: any[];
  permissions?: string[];
  tenant_id?: number | string;
  tenantId?: number | string;
  tenantName?: string;
  role?: string;
  password?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  settings?: any;
  subscription?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

// ---------------------------------------------------------------------------
// Canonical storage keys (must match apiClient.ts)
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const TENANT_KEY = 'tenant_data';

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  user: null,
  tenant: null,
  loading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

const getStoredRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);

const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const getStoredTenant = (): Tenant | null => {
  const raw = localStorage.getItem(TENANT_KEY) || sessionStorage.getItem(TENANT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const clearAuthData = () => {
  [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, TENANT_KEY, 'tenant_id', 'token_expires_at'].forEach(
    (key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  );
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    credentials: { username: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    try {
      clearAuthData();

      const response = await authService.login({
        username: credentials.username,
        password: credentials.password,
        remember: credentials.rememberMe,
      });

      if (!response?.accessToken) {
        throw new Error('Invalid login response format');
      }

      const { accessToken: token, refreshToken: refresh_token, user, tenant } = response;

      if (!tenant?.id || !tenant?.name) {
        throw new Error('Invalid tenant data in login response');
      }

      const finalTenant: Tenant = {
        id: tenant.id as number,
        name: tenant.name,
        subdomain: (tenant as any).subdomain || 'app',
        status: (tenant as any).status || 'active',
        settings: (tenant as any).settings,
        subscription: (tenant as any).subscription,
        created_at: (tenant as any).created_at,
        updated_at: (tenant as any).updated_at,
      };

      // Persist to storage
      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token);
      if (refresh_token) storage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      storage.setItem(USER_KEY, JSON.stringify(user));
      storage.setItem(TENANT_KEY, JSON.stringify(finalTenant));

      return { token, refreshToken: refresh_token, user, tenant: finalTenant };
    } catch (error: any) {
      clearAuthData();
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentRefresh = state.auth.refreshToken || getStoredRefreshToken();
      if (!currentRefresh) throw new Error('No refresh token available');

      await authService.refreshAuth();

      const token = authService.getAuthToken();
      const refresh = authService.getRefreshToken();
      if (!token) throw new Error('Token refresh failed');

      const hasRemembered = localStorage.getItem(TOKEN_KEY);
      const storage = hasRemembered ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token);
      if (refresh) storage.setItem(REFRESH_TOKEN_KEY, refresh);

      return { token, refreshToken: refresh };
    } catch (error: any) {
      clearAuthData();
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token || getStoredToken();
    if (token) await authService.logout();
  } catch {
    // Proceed with local cleanup regardless
  } finally {
    clearAuthData();
  }
});

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setTenant: (state, action: PayloadAction<Tenant>) => {
      state.tenant = action.payload;
      const hasRemembered = localStorage.getItem(TOKEN_KEY);
      const storage = hasRemembered ? localStorage : sessionStorage;
      storage.setItem(TENANT_KEY, JSON.stringify(action.payload));
    },

    updateTenant: (state, action: PayloadAction<Partial<Tenant>>) => {
      if (state.tenant) {
        state.tenant = { ...state.tenant, ...action.payload };
        const hasRemembered = localStorage.getItem(TOKEN_KEY);
        const storage = hasRemembered ? localStorage : sessionStorage;
        storage.setItem(TENANT_KEY, JSON.stringify(state.tenant));
      }
    },

    initializeAuth: (state) => {
      const token = getStoredToken();
      const user = getStoredUser();
      const tenant = getStoredTenant();

      if (token && user) {
        state.isAuthenticated = true;
        state.token = token;
        state.refreshToken = getStoredRefreshToken();
        state.user = user;
        state.tenant = tenant;
      } else {
        clearAuthData();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.tenant = null;
        state.error = action.payload as string;
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.tenant = null;
      })
      .addCase(logoutUser.fulfilled, () => ({ ...initialState }));
  },
});

export const { clearError, setTenant, updateTenant, initializeAuth, setLoading, setError } = authSlice.actions;
export const logout = logoutUser;
export default authSlice.reducer;