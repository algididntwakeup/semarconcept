// platform/frontend-mui/src/shared/api/client.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  apiClient,
  getApiBaseUrl,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getTenantId,
  setTenantId,
  normalizeApiError,
} from './client';
import { NormalizedApiError } from './types';

describe('API Client & Storage Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Storage & Token Management', () => {
    it('sets and retrieves auth token', () => {
      setAuthToken('test-token-123');
      expect(getAuthToken()).toBe('test-token-123');
    });

    it('sets and retrieves tenant id', () => {
      setTenantId('42');
      expect(getTenantId()).toBe('42');
    });

    it('clears all credentials upon clearAuthToken', () => {
      setAuthToken('test-token');
      setTenantId('42');
      clearAuthToken();
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('Error Normalization', () => {
    it('normalizes standard Axios error with message', () => {
      const axiosErr = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 400',
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Invalid request data',
            code: 'VALIDATION_FAILED',
            data: {
              name: 'Name is required',
            },
          },
        },
      };
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const normalized = normalizeApiError(axiosErr);
      expect(normalized).toBeInstanceOf(NormalizedApiError);
      expect(normalized.status).toBe(400);
      expect(normalized.message).toBe('Invalid request data');
      expect(normalized.code).toBe('VALIDATION_FAILED');
      expect(normalized.errors).toEqual({ name: 'Name is required' });
    });

    it('normalizes network connection errors', () => {
      const netErr = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Network Error',
        code: 'ERR_NETWORK',
      };
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const normalized = normalizeApiError(netErr);
      expect(normalized.status).toBe(0);
      expect(normalized.message).toContain('network connection');
    });

    it('returns NormalizedApiError as is if already normalized', () => {
      const err = new NormalizedApiError(404, 'Not found');
      expect(normalizeApiError(err)).toBe(err);
    });
  });

  describe('Request Interceptor Headers', () => {
    it('injects Authorization, Tenant, and Request-ID headers', async () => {
      setAuthToken('token-abc');
      setTenantId('99');

      // Interceptor testing via internal request handler
      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
      const config = await requestInterceptor({
        headers: {},
        method: 'get',
      });

      expect(config.headers['Authorization']).toBe('Bearer token-abc');
      expect(config.headers['X-Tenant-ID']).toBe('99');
      expect(config.headers['X-Request-ID']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('attaches CSRF token for mutating requests when available', async () => {
      localStorage.setItem('X-CSRF-TOKEN', 'csrf-token-123');

      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
      const config = await requestInterceptor({
        headers: {},
        method: 'post',
      });

      expect(config.headers['X-CSRF-TOKEN']).toBe('csrf-token-123');
    });
  });
});
