// platform/frontend-mui/src/services/apiClient.ts
/**
 * @deprecated Use imports from '@/shared/api' or '../shared/api' instead.
 * This file serves as a backward-compatibility bridge during the FE-02 migration.
 */
export {
  apiClient as default,
  apiClient,
  API_BASE_URL,
  getBaseURL,
  getApiBaseUrl,
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  clearAuthToken,
  getTenantId,
  setTenantId,
  getCurrentUser,
  setCurrentUser,
  getCurrentTenant,
  setCurrentTenant,
  getCsrfToken,
  setCsrfToken,
  normalizeApiError,
  apiUtils,
} from '../shared/api/client';

export type {
  ApiResponse,
  ApiPaginatedResponse,
  NormalizedApiError,
  AuthTokens,
} from '../shared/api/types';