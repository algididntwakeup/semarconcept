// platform/frontend-mui/src/hooks/useDebugAwareAPI.ts
import { useState, useEffect, useCallback } from 'react';
import { getDebugManager } from '../utils/debug-manager';
import { getAuthToken, getCurrentUser, hasPermission } from '../utils/auth';

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface APIOptions {
  immediate?: boolean;
  permission?: string;
  mockData?: any;
  endpoints?: string[];
}

/**
 * Debug-aware API hook that automatically tracks all API calls
 */
export function useDebugAwareAPI<T>(
  defaultEndpoint: string,
  options: APIOptions = {}
): APIState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debugManager = getDebugManager();

  const fetchData = useCallback(async () => {
    const startTime = performance.now();
    setLoading(true);
    setError(null);

    // Check permissions first
    if (options.permission && !hasPermission(options.permission)) {
      const permissionError = `Missing permission: ${options.permission}`;
      setError(permissionError);
      debugManager.log('error', permissionError, { endpoint: defaultEndpoint });
      setLoading(false);
      return;
    }

    // Get auth token
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || !user) {
      const authError = 'Authentication required';
      setError(authError);
      debugManager.log('error', authError, { endpoint: defaultEndpoint });
      setLoading(false);
      return;
    }

    // Try multiple endpoints if provided
    const endpoints = options.endpoints || [defaultEndpoint];
    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        debugManager.log('info', `Attempting API call: ${endpoint}`);

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        // Track the API call
        const debugQuery = {
          id: `${Date.now()}-${Math.random()}`,
          endpoint,
          method: 'GET',
          status: response.status,
          duration,
          timestamp: new Date().toISOString(),
          binding: endpoint.split('/').pop() || 'unknown',
        };

        window.__DEBUG_QUERIES__?.push(debugQuery);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data || result);
        setError(null);
        
        debugManager.log('info', `API call successful: ${endpoint}`, {
          status: response.status,
          duration,
          dataSize: JSON.stringify(result).length,
        });

        break; // Success, exit loop

      } catch (err: any) {
        lastError = err;
        debugManager.log('error', `API call failed: ${endpoint}`, {
          error: err.message,
          stack: err.stack,
        });

        // If this is the last endpoint, set the error
        if (endpoint === endpoints[endpoints.length - 1]) {
          setError(err.message);
        }
      }
    }

    setLoading(false);
  }, [defaultEndpoint, options.permission, options.endpoints]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

