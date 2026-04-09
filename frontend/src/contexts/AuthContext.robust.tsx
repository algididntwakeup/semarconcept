// platform/frontend-mui/src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User, LoginCredentials, AuthResponse } from '../lib/auth/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  // 🔥 REMOVED: mockLogin function - no longer available in production
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Initialize auth service
      authService.initializeAuth();
      
      // Get current user
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      // Try to refresh token if user exists but token might be expired
      if (currentUser && authService.getAuthToken()) {
        try {
          await authService.refreshAuth();
          setUser(authService.getCurrentUser());
        } catch (error) {
          console.warn('Token refresh failed:', error);
          // Don't clear user immediately, let them try to re-login
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      
      // Dispatch login event for other components
      window.dispatchEvent(new CustomEvent('auth:login', { 
        detail: { user: authResponse.user } 
      }));
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 REMOVED: mockLogin function
  // Mock login is no longer available in production builds
  // All authentication must go through the real backend API

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user even if logout API fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      await authService.refreshAuth();
      const refreshedUser = authService.getCurrentUser();
      setUser(refreshedUser);
      
      // Dispatch auth changed event
      window.dispatchEvent(new CustomEvent('auth:changed', { 
        detail: { user: refreshedUser } 
      }));
      
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    login,
    // 🔥 REMOVED: mockLogin is no longer available
    logout,
    refreshAuth,
    hasPermission,
    hasRole,
    tenantInfo: authService.getTenantInfo(),
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
      
      // Redirect to login or show login form
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