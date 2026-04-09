// platform/frontend-mui/src/services/userService.ts

import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import {
  User,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams,
  PaginatedResponse,
  UserActionRequest,
  UserStatusChangeRequest,
  PasswordResetRequest,
  UserActivity,
  UserRole,
  Department,
  ApiResponse
} from '../types/user.types';

class UserService {
  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    // Handle both wrapped and unwrapped responses
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Wrapped response format: { success: true, data: T }
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      return response.data.data;
    } else {
      // Direct response format: T
      return response.data as T;
    }
  }

  // Helper method to handle API errors
  private handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }

  // User CRUD operations
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.role) queryParams.append('role', params.role);
      if (params.department) queryParams.append('department', params.department);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);

      const url = queryParams.toString() ? 
        `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}` : 
        API_ENDPOINTS.USERS.LIST;
      
      const response = await apiClient.get<ApiResponse<any>>(url);
      const data = this.handleResponse(response);
      
      // Standardize to PaginatedResponse<User>
      return {
        data: data.users || [],
        pagination: data.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          pages: 0,
          has_next: false,
          has_prev: false
        }
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.DETAIL(id));
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.USERS.CREATE, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.USERS.UPDATE(id), data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    } catch (error) {
      this.handleError(error);
    }
  }

  // User statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>(API_ENDPOINTS.USERS.STATS);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User status management
  async changeUserStatus(id: string, data: UserStatusChangeRequest): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.USERS.STATUS(id), data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async suspendUser(id: string, reason?: string): Promise<void> {
    return this.changeUserStatus(id, { status: 'suspended', reason });
  }

  async activateUser(id: string): Promise<void> {
    return this.changeUserStatus(id, { status: 'active' });
  }

  async deactivateUser(id: string, reason?: string): Promise<void> {
    return this.changeUserStatus(id, { status: 'inactive', reason });
  }

  // Password management
  async resetPassword(id: string, data: PasswordResetRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id), data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Bulk operations
  async bulkAction(data: UserActionRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.USERS.BULK_ACTIONS, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User activity and audit
  async getUserActivity(id: string, page = 1, limit = 20): Promise<PaginatedResponse<UserActivity>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<UserActivity>>>(
        `${API_ENDPOINTS.USERS.ACTIVITY(id)}?page=${page}&limit=${limit}`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User profile management
  async uploadAvatar(id: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post<ApiResponse<{ avatar_url: string }>>(
        API_ENDPOINTS.USERS.AVATAR(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return this.handleResponse(response).avatar_url;
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeAvatar(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.AVATAR(id));
    } catch (error) {
      this.handleError(error);
    }
  }

  // Two-factor authentication
  async enableTwoFactor(id: string): Promise<{ qr_code: string; secret: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ qr_code: string; secret: string }>>(
        `${API_ENDPOINTS.USERS.TWO_FACTOR(id)}/enable`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async disableTwoFactor(id: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.USERS.TWO_FACTOR(id)}/disable`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Supporting data services
  async getRoles(): Promise<UserRole[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.ROLES.LIST);
      const data = this.handleResponse(response);
      // Backend returns { roles: [...], pagination: {...} } or just [...]
      if (data && typeof data === 'object' && 'roles' in data) {
        return (data as any).roles || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDepartments(): Promise<Department[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.DEPARTMENTS.LIST);
      const data = this.handleResponse(response);
      // Backend returns { departments: [...], pagination: {...} } or just [...]
      if (data && typeof data === 'object' && 'departments' in data) {
        return (data as any).departments || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getManagers(): Promise<User[]> {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>(API_ENDPOINTS.USERS.MANAGERS);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Export functionality
  async exportUsers(params: GetUsersParams = {}, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      queryParams.append('format', format);

      const response = await apiClient.get(
        `${API_ENDPOINTS.USERS.EXPORT}?${queryParams.toString()}`,
        {
          responseType: 'blob',
        }
      );
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Import functionality
  async importUsers(file: File): Promise<{ imported: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<ApiResponse<{ imported: number; errors: string[] }>>(
        API_ENDPOINTS.USERS.IMPORT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Create and export a singleton instance
export const userService = new UserService();
export default userService;