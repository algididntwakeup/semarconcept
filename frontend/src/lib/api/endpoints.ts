// platform/frontend-mui/src/lib/api/endpoints.ts
import apiClient, { apiUtils } from '../../services/apiClient';

// 🔥 ENHANCED: Type definitions for API responses with complete GORM support
export interface APIResponse<T> {
  status: string;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pagination?: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    query?: any;
    timestamp?: string;
  };
  error?: string;
}

export interface PaginatedResponse<T> {
  users?: T[]; // Backend returns { data: { users: [...] } }
  items?: T[];  // Generic items array
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// 🔥 ENHANCED: User related types with complete role support
export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  role_type?: string;
  is_system_role?: boolean;
  level?: number;
  permissions?: Permission[];
  user_count?: number;
}

export interface Permission {
  id: number;
  name: string;
  action: string;
  resource: string;
  scope: string;
  description: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  parent_id?: number;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  parent_id?: number | null;
  title: string;
  menu_type: string;
  icon?: string;
  route?: string;
  order_index: number;
  is_active: boolean;
  is_visible: boolean;
  permissions?: string[];
  children?: MenuItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  tenant_id: number;
  department_id?: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  department?: Department;
  tenant?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  superusers: number;
  by_role: Record<string, number>;
  by_department: Record<string, number>;
  recent_logins: number;
  never_logged_in: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_admin?: boolean;
  tenant_id?: number;
  department_id?: number;
  role_ids?: number[];
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_admin?: boolean;
  department_id?: number;
  password?: string;
  role_ids?: number[];
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'admin' | 'superuser';
  role?: string;
  department?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 🔥 ENHANCED: Authentication API with comprehensive features
export class AuthAPI {
  static async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post<APIResponse<{
      user: User;
      token: string;
      expires_in: number;
      token_type: string;
    }>>('/auth/login', credentials);
    
    // Store auth data automatically
    if (response.data.data.token) {
      apiUtils.setAuthToken(response.data.data.token);
    }
    if (response.data.data.user) {
      apiUtils.setCurrentUser(response.data.data.user);
      if (response.data.data.user.tenant_id) {
        apiUtils.setTenantId(response.data.data.user.tenant_id.toString());
      }
    }
    
    return response;
  }

  static async logout() {
    try {
      const response = await apiClient.post<APIResponse<any>>('/auth/logout');
      return response;
    } finally {
      // Always clear auth data, even if logout request fails
      apiUtils.clearAuthToken();
    }
  }

  static async refresh(refreshToken?: string) {
    const response = await apiClient.post<APIResponse<{
      token: string;
      expires_in: number;
    }>>('/auth/refresh', refreshToken ? { refresh_token: refreshToken } : {});
    
    // Update stored token
    if (response.data.data.token) {
      apiUtils.setAuthToken(response.data.data.token);
    }
    
    return response;
  }

  static async getProfile() {
    const response = await apiClient.get<APIResponse<User>>('/auth/me');
    
    // Update stored user data
    if (response.data.data) {
      apiUtils.setCurrentUser(response.data.data);
    }
    
    return response;
  }

  static async register(userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirmation: string;
  }) {
    return apiClient.post<APIResponse<User>>('/auth/register', userData);
  }

  static async forgotPassword(email: string) {
    return apiClient.post<APIResponse<any>>('/auth/forgot-password', { email });
  }

  static async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return apiClient.post<APIResponse<any>>('/auth/reset-password', data);
  }
}

// 🔥 ENHANCED: Users API with complete GORM role support
export class UsersAPI {
  static async getUsers(filters: UserFilters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<APIResponse<{
      users: User[];
      pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>>(url);
    
    return response;
  }

  static async getUser(id: number | string) {
    const response = await apiClient.get<APIResponse<User>>(`/users/${id}`);
    return response;
  }

  static async createUser(userData: CreateUserRequest) {
    const response = await apiClient.post<APIResponse<User>>('/users', userData);
    return response;
  }

  static async updateUser(id: number | string, userData: UpdateUserRequest) {
    const response = await apiClient.put<APIResponse<User>>(`/users/${id}`, userData);
    return response;
  }

  static async deleteUser(id: number | string) {
    const response = await apiClient.delete<APIResponse<{
      deleted_user: {
        id: number;
        username: string;
        email: string;
      };
    }>>(`/users/${id}`);
    return response;
  }

  static async getUserStats() {
    const response = await apiClient.get<APIResponse<UserStats>>('/users/stats');
    return response;
  }

  static async getManagers() {
    const response = await apiClient.get<APIResponse<User[]>>('/users/managers');
    return response;
  }

  // 🔥 NEW: Bulk operations
  static async bulkUpdateUsers(userIds: number[], updates: Partial<UpdateUserRequest>) {
    const response = await apiClient.put<APIResponse<{
      updated_count: number;
      updated_users: User[];
    }>>('/users/bulk/update', {
      user_ids: userIds,
      updates
    });
    return response;
  }

  static async bulkDeleteUsers(userIds: number[]) {
    return apiClient.post<APIResponse<any>>('/users/bulk-delete', { ids: userIds });
  }

  // 🔥 NEW: User role management
  static async assignRoleToUser(userId: number, roleId: number) {
    const response = await apiClient.post<APIResponse<any>>(`/users/${userId}/roles/${roleId}`);
    return response;
  }

  static async removeRoleFromUser(userId: number, roleId: number) {
    const response = await apiClient.delete<APIResponse<any>>(`/users/${userId}/roles/${roleId}`);
    return response;
  }

  static async replaceUserRoles(userId: number, roleIds: number[]) {
    const response = await apiClient.put<APIResponse<User>>(`/users/${userId}/roles`, {
      role_ids: roleIds
    });
    return response;
  }
}

// 🔥 ENHANCED: Roles API with complete management features
export class RolesAPI {
  static async getRoles(filters: {
    page?: number;
    limit?: number;
    search?: string;
    role_type?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<APIResponse<{
      roles: Role[];
      pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>>(url);
    return response;
  }

  static async getRole(id: number | string) {
    const response = await apiClient.get<APIResponse<Role>>(`/roles/${id}`);
    return response;
  }

  static async createRole(roleData: {
    name: string;
    code: string;
    description: string;
    role_type?: string;
    is_system_role?: boolean;
    level?: number;
    permission_ids?: number[];
  }) {
    const response = await apiClient.post<APIResponse<Role>>('/roles', roleData);
    return response;
  }

  static async updateRole(id: number | string, roleData: Partial<{
    name: string;
    code: string;
    description: string;
    role_type: string;
    level: number;
    permission_ids: number[];
  }>) {
    const response = await apiClient.put<APIResponse<Role>>(`/roles/${id}`, roleData);
    return response;
  }

  static async deleteRole(id: number | string) {
    const response = await apiClient.delete<APIResponse<void>>(`/roles/${id}`);
    return response;
  }

  // 🔥 NEW: Role permission management
  static async getRolePermissions(roleId: number) {
    const response = await apiClient.get<APIResponse<Permission[]>>(`/roles/${roleId}/permissions`);
    return response;
  }

  static async assignPermissionToRole(roleId: number, permissionId: number) {
    const response = await apiClient.post<APIResponse<any>>(`/roles/${roleId}/permissions/${permissionId}`);
    return response;
  }

  static async removePermissionFromRole(roleId: number, permissionId: number) {
    const response = await apiClient.delete<APIResponse<any>>(`/roles/${roleId}/permissions/${permissionId}`);
    return response;
  }

  static async replaceRolePermissions(roleId: number, permissionIds: number[]) {
    const response = await apiClient.put<APIResponse<Role>>(`/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
    return response;
  }

  static async bulkDeleteRoles(roleIds: number[]) {
    return apiClient.post<APIResponse<any>>('/roles/bulk-delete', { ids: roleIds });
  }
}

// 🔥 ENHANCED: Departments API
export class DepartmentsAPI {
  static async getDepartments(filters: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: number;
    is_active?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<APIResponse<{
      departments: Department[];
      pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>>(url);
    return response;
  }

  static async getDepartment(id: number | string) {
    const response = await apiClient.get<APIResponse<Department>>(`/departments/${id}`);
    return response;
  }

  static async createDepartment(departmentData: {
    name: string;
    code: string;
    description: string;
    parent_id?: number;
    is_active?: boolean;
  }) {
    const response = await apiClient.post<APIResponse<Department>>('/departments', departmentData);
    return response;
  }

  static async updateDepartment(id: number | string, departmentData: Partial<{
    name: string;
    code: string;
    description: string;
    parent_id: number;
    is_active: boolean;
  }>) {
    const response = await apiClient.put<APIResponse<Department>>(`/departments/${id}`, departmentData);
    return response;
  }

  static async deleteDepartment(id: number | string) {
    const response = await apiClient.delete<APIResponse<void>>(`/departments/${id}`);
    return response;
  }

  // 🔥 NEW: Department hierarchy
  static async getDepartmentHierarchy() {
    const response = await apiClient.get<APIResponse<Department[]>>('/departments/hierarchy');
    return response;
  }

  static async getDepartmentUsers(departmentId: number, filters: UserFilters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/departments/${departmentId}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<APIResponse<User[]>>(url);
    return response;
  }
}

// 🔥 ENHANCED: Permissions API
export class PermissionsAPI {
  static async getPermissions(filters: {
    page?: number;
    limit?: number;
    search?: string;
    resource?: string;
    action?: string;
    scope?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<APIResponse<{
      permissions: Permission[];
      pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>>(url);
    return response;
  }

  static async getPermission(id: number | string) {
    const response = await apiClient.get<APIResponse<Permission>>(`/permissions/${id}`);
    return response;
  }

  static async createPermission(permissionData: {
    name: string;
    action: string;
    resource: string;
    scope?: string;
    description: string;
  }) {
    const response = await apiClient.post<APIResponse<Permission>>('/permissions', permissionData);
    return response;
  }

  static async updatePermission(id: number | string, permissionData: Partial<{
    name: string;
    action: string;
    resource: string;
    scope: string;
    description: string;
  }>) {
    const response = await apiClient.put<APIResponse<Permission>>(`/permissions/${id}`, permissionData);
    return response;
  }

  static async deletePermission(id: number | string) {
    const response = await apiClient.delete<APIResponse<void>>(`/permissions/${id}`);
    return response;
  }

  // 🔥 NEW: Permission organization
  static async getPermissionsByResource(resource: string) {
    const response = await apiClient.get<APIResponse<Permission[]>>(`/permissions/by-resource/${resource}`);
    return response;
  }

  static async getPermissionsByScope(scope: string) {
    const response = await apiClient.get<APIResponse<Permission[]>>(`/permissions/by-scope/${scope}`);
    return response;
  }

  static async bulkDeletePermissions(permissionIds: number[]) {
    return apiClient.post<APIResponse<any>>('/permissions/bulk-delete', { ids: permissionIds });
  }
}

// 🔥 ENHANCED: Menus API
export class MenusAPI {
  static async getMenus(filters: { admin?: boolean; include_inactive?: boolean } = {}) {
    const queryParams = new URLSearchParams();
    if (filters.admin) queryParams.append('admin', 'true');
    if (filters.include_inactive) queryParams.append('include_inactive', 'true');
    
    const url = `/menu${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<APIResponse<MenuItem[]>>(url);
    return response;
  }

  static async getMenuHierarchy(filters: { admin?: boolean; include_inactive?: boolean } = {}) {
    const queryParams = new URLSearchParams();
    if (filters.admin) queryParams.append('admin', 'true');
    if (filters.include_inactive) queryParams.append('include_inactive', 'true');
    
    const url = `/menu/hierarchy${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<APIResponse<MenuItem[]>>(url);
    return response;
  }

  static async getMenu(id: number | string) {
    const response = await apiClient.get<APIResponse<MenuItem>>(`/menu/${id}`);
    return response;
  }

  static async createMenu(menuData: Partial<MenuItem>) {
    const response = await apiClient.post<APIResponse<MenuItem>>('/menu', menuData);
    return response;
  }

  static async updateMenu(id: number | string, menuData: Partial<MenuItem>) {
    const response = await apiClient.put<APIResponse<MenuItem>>(`/menu/${id}`, menuData);
    return response;
  }

  static async deleteMenu(id: number | string) {
    const response = await apiClient.delete<APIResponse<void>>(`/menu/${id}`);
    return response;
  }

  static async toggleMenuStatus(id: number | string, isActive: boolean) {
    const response = await apiClient.put<APIResponse<void>>(`/menu/${id}/toggle`, { is_active: isActive });
    return response;
  }

  static async reorderMenus(menuOrders: Array<{ id: number; order_index: number; parent_id?: number | null }>) {
    const response = await apiClient.put<APIResponse<void>>('/menu/reorder', { items: menuOrders });
    return response;
  }

  static async getUserMenuTree() {
    const response = await apiClient.get<APIResponse<MenuItem[]>>('/menu/user-tree');
    return response;
  }

  static async getAccessibleMenus() {
    const response = await apiClient.get<APIResponse<MenuItem[]>>('/menu/accessible');
    return response;
  }
}

// 🔥 ENHANCED: Health API with diagnostics
export class HealthAPI {
  static async getHealth() {
    const response = await apiClient.get<APIResponse<{ 
      status: string; 
      timestamp: string;
      version: string;
      service: string;
    }>>('/health');
    return response;
  }

  static async getDetailedHealth() {
    const response = await apiClient.get<APIResponse<{
      status: string;
      timestamp: string;
      version: string;
      service: string;
      database: { status: string; response_time_ms: number };
      cache: { status: string; response_time_ms: number };
      external_services: Array<{ name: string; status: string; response_time_ms: number }>;
    }>>('/health/detailed');
    return response;
  }
}

// 🔥 ENHANCED: Error handling utility
export const handleAPIError = (error: any): {
  message: string;
  code?: string;
  details?: any;
  status?: number;
} => {
  // Handle network errors
  if (error.name === 'NetworkError') {
    return {
      message: error.message,
      code: 'NETWORK_ERROR'
    };
  }

  // Handle axios errors
  if (error.response) {
    const data = error.response.data;
    
    return {
      message: data?.message || data?.error || error.message || 'An error occurred',
      code: data?.code || `HTTP_${error.response.status}`,
      details: data?.details || data?.errors,
      status: error.response.status
    };
  }

  // Handle other errors
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

// 🔥 ENHANCED: React hook for easier API usage
export const useAPI = () => {
  const handleError = (error: any) => {
    const errorInfo = handleAPIError(error);
    console.error('API Error:', errorInfo);
    return errorInfo;
  };

  return {
    auth: AuthAPI,
    users: UsersAPI,
    roles: RolesAPI,
    departments: DepartmentsAPI,
    permissions: PermissionsAPI,
    menus: MenusAPI,
    health: HealthAPI,
    handleError,
    utils: apiUtils
  };
};

// 🔥 ENHANCED: Batch operations utility
export const batchAPI = {
  async batchRequest<T>(requests: Array<() => Promise<T>>): Promise<Array<T | Error>> {
    const results = await Promise.allSettled(requests.map(req => req()));
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : new Error(result.reason)
    );
  },

  async sequentialRequests<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    const results: T[] = [];
    
    for (const request of requests) {
      try {
        const result = await request();
        results.push(result);
      } catch (error) {
        console.error('Sequential request failed:', error);
        throw error;
      }
    }
    
    return results;
  }
};

// 🔥 FIXED: No duplicate exports - classes are already exported when declared with "export class"