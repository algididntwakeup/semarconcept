// platform/frontend-mui/src/utils/auth.ts
import { User, Tenant } from '../store/slices/authSlice';

// Types
interface AuthTokens {
  token: string;
  refreshToken?: string;
}

// 🔥 FIXED: Enhanced getCurrentUser with better error handling
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user || null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// 🔥 FIXED: Enhanced getCurrentTenant with fallback data rejection
export const getCurrentTenant = (): Tenant | null => {
  try {
    const tenantStr = localStorage.getItem('tenant_data') || sessionStorage.getItem('tenant_data');
    if (!tenantStr) return null;
    
    const tenant = JSON.parse(tenantStr);
    
    // 🔥 REJECT FALLBACK TENANT DATA IMMEDIATELY
    if (tenant && (
      tenant.name === 'Fallback Tenant' || 
      tenant.subdomain === 'fallback'
    )) {
      console.warn('🚫 getCurrentTenant: Rejecting definitive fallback tenant data:', tenant);
      removeCurrentTenant(); // Clean up known bad data
      return null;
    }
    
    return tenant || null;
  } catch (error) {
    console.error('Error parsing stored tenant:', error);
    return null;
  }
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') || 
                localStorage.getItem('reksolindo_auth_token') ||
                sessionStorage.getItem('auth_token');
  return token;
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getCurrentUser();
  const tenant = getCurrentTenant(); // This now validates tenant data
  
  return !!(token && user && tenant);
};

// 🔥 FIXED: Enhanced setCurrentUser
export const setCurrentUser = (user: User): void => {
  try {
    const hasRemembered = localStorage.getItem('token');
    const storage = hasRemembered ? localStorage : sessionStorage;
    storage.setItem('user_data', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

// 🔥 FIXED: Enhanced setCurrentTenant with validation
export const setCurrentTenant = (tenant: Tenant): void => {
  try {
    // Validate tenant data before storing
    if (!tenant || tenant.name === 'Fallback Tenant' || tenant.subdomain === 'fallback') {
      console.warn('🚫 setCurrentTenant: Rejecting invalid tenant data:', tenant);
      return;
    }
    
    const hasRemembered = localStorage.getItem('token');
    const storage = hasRemembered ? localStorage : sessionStorage;
    storage.setItem('tenant_data', JSON.stringify(tenant));
    console.log('✅ setCurrentTenant: Stored valid tenant:', tenant.name);
  } catch (error) {
    console.error('Error storing tenant:', error);
  }
};

export const setAuthTokens = (tokens: AuthTokens, rememberMe: boolean = false): void => {
  try {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('auth_token', tokens.token);
    if (tokens.refreshToken) {
      storage.setItem('refresh_token', tokens.refreshToken);
    }
  } catch (error) {
    console.error('Error storing auth tokens:', error);
  }
};

export const setAuthToken = (token: string, rememberMe: boolean = false): void => {
  try {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('user_data');
};

// 🔥 FIXED: More thorough removeCurrentTenant cleanup
export const removeCurrentTenant = (): void => {
  // Remove from both storages
  localStorage.removeItem('tenant_data');
  sessionStorage.removeItem('tenant_data');
  
  // Also remove any fallback tenant keys that might exist
  localStorage.removeItem('fallback_tenant');
  sessionStorage.removeItem('fallback_tenant');
  localStorage.removeItem('default_tenant');
  sessionStorage.removeItem('default_tenant');
  
  console.log('🧹 removeCurrentTenant: Cleaned up all tenant data');
};

export const removeAuthTokens = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('refresh_token');
};

// 🔥 FIXED: Enhanced clearAllAuthData with comprehensive cleanup
export const clearAllAuthData = (): void => {
  // Remove all possible auth-related keys
  const authKeys = [
    'token', 'refreshToken', 'user', 'tenant',
    'auth_token', 'auth_user', 'auth_tenant',
    'fallback_tenant', 'default_tenant'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('🧹 clearAllAuthData: Cleaned up all authentication data');
};

// Permission and role checking functions
export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Super users have all permissions
  if (user.is_superuser) return true;
  
  // Check if user has the specific permission
  return user.permissions?.includes(permission) || false;
};

export const hasRole = (roleName: string): boolean => {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => role.name === roleName);
};

export const hasAnyRole = (roleNames: string[]): boolean => {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => roleNames.includes(role.name));
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.is_admin || user?.is_superuser || false;
};

export const isSuperUser = (): boolean => {
  const user = getCurrentUser();
  return user?.is_superuser || false;
};

// Specific permission checks
export const canManageUsers = (): boolean => {
  return isAdmin() || hasPermission('manage_users') || hasRole('User Manager');
};

export const canManageRoles = (): boolean => {
  return isAdmin() || hasPermission('manage_roles') || hasRole('Role Manager');
};

export const canManagePermissions = (): boolean => {
  return isSuperUser() || hasPermission('manage_permissions');
};

export const canManageSystem = (): boolean => {
  return isSuperUser() || hasPermission('manage_system');
};

export const canViewAdminPanel = (): boolean => {
  return isAdmin() || hasAnyRole(['Admin', 'Manager', 'System Administrator']);
};

// Development mode check
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.VITE_ENV === 'development';
};

// 🔥 FIXED: Enhanced logout function
export const logout = (): void => {
  console.log('🔐 Logging out user...');
  clearAllAuthData();
  
  // Optional: Call logout API endpoint
  // This should be handled by the logout thunk in most cases
  console.log('✅ Logout completed');
};

// Token validation
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Token expiration parsing error:', error);
    return null;
  }
};

// Debug functions for development
export const debugAuthState = (): void => {
  if (isDevelopmentMode()) {
    console.group('🔧 Auth Debug State');
    console.log('Token:', getAuthToken());
    console.log('User:', getCurrentUser());
    console.log('Tenant:', getCurrentTenant());
    console.log('Is Authenticated:', isAuthenticated());
    console.log('Is Admin:', isAdmin());
    console.log('Is SuperUser:', isSuperUser());
    console.groupEnd();
  }
};

// Make debug function available globally in development
if (isDevelopmentMode()) {
  (window as any).debugAuth = debugAuthState;
}

// Session management
export const getSessionInfo = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  const tenant = getCurrentTenant();
  
  return {
    isAuthenticated: isAuthenticated(),
    hasValidToken: token ? isTokenValid(token) : false,
    tokenExpiration: token ? getTokenExpiration(token) : null,
    user: user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin,
      isSuperUser: user.is_superuser
    } : null,
    tenant: tenant ? {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      status: tenant.status
    } : null
  };
};

// Initialize auth state validation
export const validateAuthState = (): boolean => {
  const token = getAuthToken();
  const user = getCurrentUser();
  const tenant = getCurrentTenant();
  
  // If we have a token but missing user or tenant, clear everything
  if (token && (!user || !tenant)) {
    console.warn('⚠️ Incomplete auth state detected, clearing all data');
    clearAllAuthData();
    return false;
  }
  
  // If we have invalid token, clear everything
  if (token && !isTokenValid(token)) {
    console.warn('⚠️ Invalid token detected, clearing all data');
    clearAllAuthData();
    return false;
  }
  
  return isAuthenticated();
};

export const setMockAuth = (token: string, user: any, tenant?: any) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_data', JSON.stringify(user));
  if (tenant) {
    localStorage.setItem('tenant_data', JSON.stringify(tenant));
  }
};

export const clearMockAuth = () => {
  clearAllAuthData();
};

export const getUserFullName = (user?: User | null): string => {
  if (!user) return '';
  if (user.full_name) return user.full_name;
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.username || user.email || '';
};

export const getUserInitials = (user?: User | null): string => {
  const name = getUserFullName(user);
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};