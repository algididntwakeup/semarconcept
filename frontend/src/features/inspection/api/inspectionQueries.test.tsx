// platform/frontend-mui/src/features/inspection/api/inspectionQueries.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useInspectionPlans,
  useInspectionPlan,
  useInspectionTasks,
  useInspectionFindings,
  useInspectionFinding,
  useCreateInspectionFinding,
  useDeleteInspectionFinding,
} from './inspectionQueries';
import { inspectionService } from '../../../services/inspectionService';

vi.mock('../../../services/inspectionService', () => ({
  inspectionService: {
    getPlans: vi.fn(),
    getPlanById: vi.fn(),
    createPlan: vi.fn(),
    getTasks: vi.fn(),
    getFindings: vi.fn(),
    getFindingById: vi.fn(),
    createFinding: vi.fn(),
    updateFinding: vi.fn(),
    deleteFinding: vi.fn(),
    getStatistics: vi.fn(),
  },
}));

describe('Inspection Query Hooks', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useInspectionPlans', () => {
    it('fetches inspection plans successfully', async () => {
      const mockResponse = {
        data: [
          { id: 'PLN-01', title: 'Plan 1', assetTag: 'AST-1', status: 'Active' as const },
        ],
        total: 1,
      };

      vi.mocked(inspectionService.getPlans).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useInspectionPlans({ search: 'Plan 1' }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(inspectionService.getPlans).toHaveBeenCalledWith({ search: 'Plan 1' });
    });

    it('handles query error gracefully', async () => {
      vi.mocked(inspectionService.getPlans).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInspectionPlans({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('useInspectionFindings', () => {
    it('fetches inspection findings with filters', async () => {
      const mockResponse = {
        data: [
          { id: 'FND-01', title: 'Corrosion', severity: 'critical' as const, status: 'open' as const },
        ],
        total: 1,
      };

      vi.mocked(inspectionService.getFindings).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useInspectionFindings({ severity: 'critical' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(inspectionService.getFindings).toHaveBeenCalledWith({ severity: 'critical' });
    });
  });

  describe('useInspectionTasks', () => {
    it('fetches inspection tasks', async () => {
      const mockResponse = {
        data: [
          { id: 'TSK-01', title: 'Task 1', status: 'In Progress' as const },
        ],
        total: 1,
      };

      vi.mocked(inspectionService.getTasks).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useInspectionTasks({ status: 'In Progress' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useCreateInspectionFinding', () => {
    it('creates finding and triggers cache invalidation', async () => {
      const newFinding = { id: 'FND-99', title: 'Leakage', severity: 'high' as const };
      vi.mocked(inspectionService.createFinding).mockResolvedValue(newFinding as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateInspectionFinding(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ title: 'Leakage', severity: 'high' } as any);

      expect(inspectionService.createFinding).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('useDeleteInspectionFinding', () => {
    it('deletes finding and invalidates cache', async () => {
      vi.mocked(inspectionService.deleteFinding).mockResolvedValue();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteInspectionFinding(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('FND-99');

      expect(inspectionService.deleteFinding).toHaveBeenCalledWith('FND-99');
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
