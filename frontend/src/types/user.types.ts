// platform/frontend-mui/src/types/user.types.ts

export interface User {
  id: string;
  tenant_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  last_login?: string;
  join_date: string;
  permissions: string[];
  two_factor_enabled: boolean;
  location: string;
  manager?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  admins: number;
  two_factor_enabled: number;
  by_department: Record<string, number>;
  by_role: Record<string, number>;
  recent_logins: number; // Users logged in last 7 days
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  employee_id: string;
  role: string;
  department: string;
  location: string;
  manager_id?: string;
  two_factor_enabled: boolean;
  send_welcome_email: boolean;
  permissions?: string[];
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  role?: string;
  department?: string;
  location?: string;
  manager_id?: string;
  two_factor_enabled?: boolean;
  permissions?: string[];
  avatar?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  department?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserFilters {
  search: string;
  status: string;
  role: string;
  department: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface UserActionRequest {
  user_ids: string[];
  action: 'activate' | 'suspend' | 'delete' | 'reset_password';
  reason?: string;
}

export interface UserStatusChangeRequest {
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export interface PasswordResetRequest {
  send_email: boolean;
  temporary_password?: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager_id?: string;
  location?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Form validation types
export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  role: string;
  department: string;
  location: string;
  manager_id: string;
  two_factor_enabled: boolean;
  send_welcome_email: boolean;
}

export interface UserFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  role?: string;
  department?: string;
  location?: string;
  general?: string;
}

// Component props types
export interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDelete: (userId: string) => void;
  onStatusChange: (userId: string, status: string) => void;
}

export interface UserFormProps {
  user?: User;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  loading: boolean;
}

export interface UserStatsProps {
  stats: UserStats;
  loading: boolean;
}

// Hook return types
export interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<User>['pagination'] | null;
  refetch: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseUserMutationsReturn {
  createUser: (data: CreateUserRequest) => Promise<User>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  changeStatus: (id: string, data: UserStatusChangeRequest) => Promise<void>;
  resetPassword: (id: string, data: PasswordResetRequest) => Promise<void>;
  bulkAction: (data: UserActionRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}