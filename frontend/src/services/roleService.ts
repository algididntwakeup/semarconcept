import apiClient from './apiClient'; // Corrected import path
import { Role } from '../types/role';

// Define the expected API response structure for a list of roles
// Adjust based on your actual backend response (e.g., if roles are nested under a key like 'data')
interface RolesApiResponse {
  // Assuming the API returns an array directly, or adjust if nested e.g., data: Role[]
  data: Role[]; // Example: Adjust if the key is different or if it's not nested
  // Add other potential response fields like pagination info if applicable
  // total?: number;
  // page?: number;
  // limit?: number;
}

/**
 * Fetches a list of roles from the backend.
 * TODO: Add parameters for pagination, filtering, sorting if needed.
 */
export const getRoles = async (): Promise<Role[]> => {
  try {
    // Adjust the endpoint '/api/v1/roles' if your backend uses a different path
    const response = await apiClient.get<RolesApiResponse>('/api/v1/roles');
    // Adjust data access based on the actual API response structure
    return response.data.data; // Example: Accessing roles nested under 'data'
  } catch (error) {
    console.error('Error fetching roles:', error);
    // Re-throw or handle error appropriately for the UI
    throw error;
  }
};

// TODO: Add functions for getRoleById, createRole, updateRole, deleteRole

// Define the expected API response structure for a single role
// Adjust based on your actual backend response
interface RoleApiResponse {
  data: Role;
}

/**
 * Fetches a single role by its ID.
 */
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await apiClient.get<RoleApiResponse>(`/api/v1/roles/${id}`);
    return response.data.data; // Adjust if structure is different
  } catch (error) {
    console.error(`Error fetching role with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new role.
 * Expects data including name, description, and permissionIds.
 */
export const createRole = async (
  data: Omit<Role, 'id' | 'permissions'> & { permissionIds?: string[] }
): Promise<Role> => {
  try {
    const response = await apiClient.post<RoleApiResponse>('/api/v1/roles', data);
    return response.data.data; // Adjust if structure is different
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

/**
 * Updates an existing role.
 * Expects the role ID and data including name, description, and permissionIds.
 */
export const updateRole = async (
  id: string,
  data: Omit<Role, 'permissions'> & { permissionIds?: string[] }
): Promise<Role> => {
  try {
    // Ensure the ID from the data object doesn't conflict if present, use the path parameter ID
    const payload = { ...data };
    delete (payload as Record<string, unknown>).id; // Remove id from payload if it exists

    const response = await apiClient.put<RoleApiResponse>(`/api/v1/roles/${id}`, payload);
    return response.data.data; // Adjust if structure is different
  } catch (error) {
    console.error(`Error updating role with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a role by its ID.
 */
export const deleteRole = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/roles/${id}`);
  } catch (error) {
    console.error(`Error deleting role with ID ${id}:`, error);
    throw error;
  }
};
