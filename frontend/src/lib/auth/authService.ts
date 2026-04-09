// platform/frontend-mui/src/lib/auth/authService.ts
import apiClient from '../../services/apiClient';

export interface User {
  id: string | number;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  roles: string[];
  permissions: string[];
  tenantId: string | number;
  tenant_id?: string | number;
  tenantName?: string;
  is_active: boolean;
  is_admin: boolean;
  is_superuser?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
  tenantId?: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tenant?: {
    id: string | number;
    name: string;
    subdomain: string;
  };
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);

    if (response?.data?.data) {
      const backendData = response.data.data;
      const authData: AuthResponse = {
        user: backendData.user,
        accessToken: backendData.access_token,
        refreshToken: backendData.refresh_token,
        expiresIn: 3600,
        tenant: backendData.tenant,
      };
      this.currentUser = authData.user;
      return authData;
    }
    throw new Error('Invalid response format from server');
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (token) await apiClient.post('/auth/logout');
    } catch {
      // Continue with local cleanup regardless
    } finally {
      this.currentUser = null;
    }
  }

  async refreshAuth(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await apiClient.post('/auth/refresh', { refreshToken });

    if (response?.data?.data) {
      const { user } = response.data.data;
      this.currentUser = user;
    } else {
      throw new Error('Token refresh failed');
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
          return this.currentUser;
        } catch {
          /* ignore */
        }
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!(this.getAuthToken() && this.getCurrentUser());
  }

  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    return token?.trim() || null;
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
    return token?.trim() || null;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.roles?.includes('admin') || user.is_admin || user.is_superuser) return true;
    return user.permissions?.includes(permission) || user.permissions?.includes('*') || false;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  getTenantInfo(): { id: string; name?: string } | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const tenantData = localStorage.getItem('tenant_data');
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData);
        return { id: tenant.id?.toString(), name: tenant.name };
      } catch {
        /* ignore */
      }
    }

    return {
      id: (user.tenantId || user.tenant_id)?.toString() || '',
      name: user.tenantName,
    };
  }

  initializeAuth(): void {
    this.getCurrentUser();
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    tenantId?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);
    if (response?.data?.data) return response.data.data;
    throw new Error('Registration failed');
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password: newPassword });
  }
}

export const authService = new AuthService();
export default authService;