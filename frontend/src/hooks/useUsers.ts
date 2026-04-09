// platform/frontend-mui/src/hooks/useUsers.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '../services/userService';
import {
  User,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams,
  UserActionRequest,
  UserStatusChangeRequest,
  PasswordResetRequest,
  UserFilters,
  UseUsersReturn,
  UseUserStatsReturn,
  UseUserMutationsReturn,
  UserRole,
  Department
} from '../types/user.types';
import { useNotification } from './useNotification';

// Main users hook with filtering and pagination
export const useUsers = (params: GetUsersParams = {}): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    hasNextPage: pagination?.has_next || false,
    hasPrevPage: pagination?.has_prev || false,
  };
};

// User statistics hook
export const useUserStats = (): UseUserStatsReturn => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserStats();
      setStats(response);
    } catch (err: any) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Single user hook
export const useUser = (id: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserById(id);
      setUser(response);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};

// User mutations hook
export const useUserMutations = (): UseUserMutationsReturn => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (data: CreateUserRequest): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const user = await userService.createUser(data);
      showNotification('User created successfully', 'success');
      return user;
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const user = await userService.updateUser(id, data);
      showNotification('User updated successfully', 'success');
      return user;
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await userService.deleteUser(id);
      showNotification('User deleted successfully', 'success');
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const changeStatus = useCallback(async (id: string, data: UserStatusChangeRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await userService.changeUserStatus(id, data);
      showNotification('User status updated successfully', 'success');
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const resetPassword = useCallback(async (id: string, data: PasswordResetRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await userService.resetPassword(id, data);
      showNotification('Password reset successfully', 'success');
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const bulkAction = useCallback(async (data: UserActionRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await userService.bulkAction(data);
      showNotification('Bulk action completed successfully', 'success');
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    createUser,
    updateUser,
    deleteUser,
    changeStatus,
    resetPassword,
    bulkAction,
    loading,
    error,
  };
};

// Supporting data hooks
export const useRoles = () => {
  const [data, setData] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const roles = await userService.getRoles();
        setData(roles);
      } catch (err: any) {
        setError(err.message);
        // Fallback data for development
        setData([
          { id: '1', name: 'Admin', description: 'Administrator', permissions: [], is_system_role: true },
          { id: '2', name: 'Manager', description: 'Manager', permissions: [], is_system_role: true },
          { id: '3', name: 'Engineer', description: 'Engineer', permissions: [], is_system_role: true },
          { id: '4', name: 'Supervisor', description: 'Supervisor', permissions: [], is_system_role: true },
          { id: '5', name: 'Operator', description: 'Operator', permissions: [], is_system_role: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { data, isLoading, error };
};

export const useDepartments = () => {
  const [data, setData] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const departments = await userService.getDepartments();
        setData(departments);
      } catch (err: any) {
        setError(err.message);
        // Fallback data for development
        setData([
          { id: '1', name: 'IT', description: 'Information Technology' },
          { id: '2', name: 'Operations', description: 'Operations' },
          { id: '3', name: 'Engineering', description: 'Engineering' },
          { id: '4', name: 'Maintenance', description: 'Maintenance' },
          { id: '5', name: 'Safety', description: 'Safety' },
          { id: '6', name: 'Quality', description: 'Quality Assurance' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { data, isLoading, error };
};

export const useManagers = () => {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const managers = await userService.getManagers();
        setData(managers);
      } catch (err: any) {
        setError(err.message);
        setData([]); // Empty fallback for managers
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagers();
  }, []);

  return { data, isLoading, error };
};

// Advanced filtering hook
export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    department: 'all',
  });

  const updateFilter = useCallback(<K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      role: 'all',
      department: 'all',
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
           filters.status !== 'all' ||
           filters.role !== 'all' ||
           filters.department !== 'all';
  }, [filters]);

  const apiParams = useMemo((): GetUsersParams => {
    const params: GetUsersParams = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.role !== 'all') params.role = filters.role;
    if (filters.department !== 'all') params.department = filters.department;
    
    return params;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    apiParams,
  };
};

// Pagination hook
export const useUserPagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const goToNextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    goToPage,
    goToNextPage,
    goToPrevPage,
    changeLimit,
    resetPagination,
  };
};

// Selection hook for bulk operations
export const useUserSelection = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const selectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => [...prev, userId]);
  }, []);

  const deselectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  }, []);

  const toggleUser = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAll = useCallback((userIds: string[]) => {
    setSelectedUsers(userIds);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const isSelected = useCallback((userId: string) => {
    return selectedUsers.includes(userId);
  }, [selectedUsers]);

  const isAllSelected = useCallback((userIds: string[]) => {
    return userIds.length > 0 && userIds.every(id => selectedUsers.includes(id));
  }, [selectedUsers]);

  const isIndeterminate = useCallback((userIds: string[]) => {
    const selectedCount = userIds.filter(id => selectedUsers.includes(id)).length;
    return selectedCount > 0 && selectedCount < userIds.length;
  }, [selectedUsers]);

  return {
    selectedUsers,
    selectUser,
    deselectUser,
    toggleUser,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedUsers.length,
  };
};

// Export hook
export const useUserExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { showNotification } = useNotification();

  const exportUsers = useCallback(async (
    params: GetUsersParams = {},
    format: 'csv' | 'xlsx' = 'csv'
  ) => {
    try {
      setIsExporting(true);
      const blob = await userService.exportUsers(params, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('Users exported successfully', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [showNotification]);

  return {
    exportUsers,
    isExporting,
  };
};