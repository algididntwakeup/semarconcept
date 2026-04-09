import apiClient from './apiClient'; // Assuming the configured Axios instance
import { Permission } from '../types/permission'; // Adjust path if needed

// Define the expected API response structure for a list of permissions
interface PermissionsApiResponse {
  // Assuming the API returns an array directly, or adjust if nested e.g., data: Permission[]
  data: Permission[]; // Example: Adjust if the key is different or if it's not nested
  // Add other potential response fields if applicable
}

/**
 * Fetches a list of all available permissions from the backend.
 */
export const getPermissions = async (): Promise<Permission[]> => {
  try {
    // Adjust the endpoint '/api/v1/permissions' if your backend uses a different path
    const response = await apiClient.get<PermissionsApiResponse>('/api/v1/permissions');
    // Adjust data access based on the actual API response structure
    return response.data.data; // Example: Accessing permissions nested under 'data'
  } catch (error) {
    console.error('Error fetching permissions:', error);
    // Re-throw or handle error appropriately for the UI
    throw error;
  }
};

// Define the expected API response structure for a single permission
interface PermissionApiResponse {
  data: Permission;
}

/**
 * Fetches a single permission by its ID.
 */
export const getPermissionById = async (id: string): Promise<Permission> => {
  try {
    const response = await apiClient.get<PermissionApiResponse>(`/api/v1/permissions/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching permission with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new permission.
 */
export const createPermission = async (data: Omit<Permission, 'id'>): Promise<Permission> => {
  try {
    const response = await apiClient.post<PermissionApiResponse>('/api/v1/permissions', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw error;
  }
};

/**
 * Updates an existing permission.
 */
export const updatePermission = async (
  id: string,
  data: Omit<Permission, 'id'>
): Promise<Permission> => {
  try {
    const payload = { ...data };
    const response = await apiClient.put<PermissionApiResponse>(
      `/api/v1/permissions/${id}`,
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating permission with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a permission by its ID.
 */
export const deletePermission = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/permissions/${id}`);
  } catch (error) {
    console.error(`Error deleting permission with ID ${id}:`, error);
    throw error;
  }
};
