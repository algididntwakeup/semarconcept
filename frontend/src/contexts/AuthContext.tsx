// platform/frontend-mui/src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginUser, logoutUser } from '../store/slices/authSlice';
import logger from '../utils/logger';

// AuthContext now works WITH Redux instead of against it
interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  tenantInfo: { id: string; name?: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use Redux state as single source of truth
  const { user, isAuthenticated, loading: isLoading } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);

  // Login now uses Redux dispatch
  const login = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      const result = await dispatch(loginUser(credentials)).unwrap();
      
      // Dispatch login event for other components
      window.dispatchEvent(new CustomEvent('auth:login', { 
        detail: { user: result.user } 
      }));
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED: Logout now uses Redux logoutUser action
  const logout = async () => {
    try {
      setLoading(true);
      await dispatch(logoutUser()).unwrap(); // 🔥 FIXED: Use logoutUser instead of logoutAction
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh authentication status
  const refreshAuth = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Dispatch auth changed event
      window.dispatchEvent(new CustomEvent('auth:changed', { 
        detail: { user } 
      }));
      
    } catch (error) {
      logger.error('Auth refresh failed, logging out', { error });
      await logout();
      throw error;
    }
  };

  // Permission checks using Redux user state
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.is_admin || user.is_superuser) return true;
    
    // Check specific permission
    return user.permissions?.includes(permission) || user.permissions?.includes('*') || false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    // Check exact role match
    if (user.role === role) return true;
    
    // Check role variations
    const normalizedRole = role.toLowerCase().replace(/[\s_-]/g, '');
    const userRole = user.role?.toLowerCase().replace(/[\s_-]/g, '') || '';
    
    return userRole === normalizedRole;
  };

  // Get tenant info from localStorage or user
  const getTenantInfo = (): { id: string; name?: string } | null => {
    if (!user) return null;
    
    // Try to get tenant from localStorage first
    const tenantData = localStorage.getItem('tenant_data');
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData);
        return {
          id: tenant.id?.toString(),
          name: tenant.name
        };
      } catch (error) {
        console.error('Failed to parse tenant data:', error);
      }
    }
    
    // Fallback to user tenant info
    return {
      id: (user.tenantId || user.tenant_id)?.toString() || '',
      name: user.tenantName
    };
  };

  const contextValue: AuthContextType = {
    user,
    loading: loading || isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
    hasPermission,
    hasRole,
    tenantInfo: getTenantInfo(),
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protecting routes
export interface WithAuthProps {
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ComponentType;
}

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: WithAuthProps
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, hasPermission, hasRole, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (options?.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    // Check permission if required
    if (options?.requiredPermission && !hasPermission(options.requiredPermission)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    // Check role if required
    if (options?.requiredRole && !hasRole(options.requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have the required role to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
};

// Route guard component
interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, hasPermission, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have the required role to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};