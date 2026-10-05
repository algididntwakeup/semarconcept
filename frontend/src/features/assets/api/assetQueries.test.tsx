// platform/frontend-mui/src/features/assets/api/assetQueries.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAssets,
  useAsset,
  useDeleteAsset,
  useEquipmentAssetStats,
  useEquipmentAssets,
  usePurgeAllEquipmentAssets,
} from './assetQueries';
import { assetService } from '../../../services/assetServices';
import { assetKeys } from '../../../shared/api/queryKeys';

// Mock assetService
vi.mock('../../../services/assetServices', () => ({
  assetService: {
    getAssets: vi.fn(),
    getAssetById: vi.fn(),
    createAsset: vi.fn(),
    updateAsset: vi.fn(),
    deleteAsset: vi.fn(),
    getAssetStatistics: vi.fn(),
    getEquipmentAssetStats: vi.fn(),
    getEquipmentAssets: vi.fn(),
    purgeAllEquipmentAssets: vi.fn(),
  },
}));

describe('Asset Query Hooks', () => {
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

  describe('useAssets', () => {
    it('fetches and returns asset list successfully', async () => {
      const mockData = {
        assets: [
          { id: 'ast-1', name: 'Pump A', type: 'pump', status: 'active', criticality: 3 },
          { id: 'ast-2', name: 'Vessel B', type: 'vessel', status: 'active', criticality: 4 },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(assetService.getAssets).mockResolvedValue(mockData as never);

      const { result } = renderHook(() => useAssets({ page: 1, limit: 10 }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(assetService.getAssets).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('handles query error state gracefully', async () => {
      vi.mocked(assetService.getAssets).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useAssets({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Server error');
    });
  });

  describe('useAsset', () => {
    it('fetches single asset by id', async () => {
      const mockAsset = { id: 'ast-1', name: 'Pump A', type: 'pump' };
      vi.mocked(assetService.getAssetById).mockResolvedValue(mockAsset as never);

      const { result } = renderHook(() => useAsset('ast-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAsset);
      expect(assetService.getAssetById).toHaveBeenCalledWith('ast-1');
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useAsset(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(assetService.getAssetById).not.toHaveBeenCalled();
    });
  });

  describe('Equipment Master queries', () => {
    it('loads grouped lifecycle statistics', async () => {
      const stats = {
        classes: [
          { class: 'Piping', count: 4 },
          { class: 'Storage Tanks', count: 2 },
        ],
        funcloc: { with: 5, without: 1 },
      };
      vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue(stats);

      const { result } = renderHook(() => useEquipmentAssetStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(stats);
      expect(assetService.getEquipmentAssetStats).toHaveBeenCalledOnce();
    });

    it('passes pagination, search, and lifecycle filters to the asset list service', async () => {
      const params = {
        page: 2,
        limit: 10,
        search: 'P-10',
        lifecycle_status: 'Installed',
      };
      const response = { assets: [{ id: 10, tag_number: 'P-10' }], total: 11, page: 2, limit: 10 };
      vi.mocked(assetService.getEquipmentAssets).mockResolvedValue(response);

      const { result } = renderHook(() => useEquipmentAssets(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(response);
      expect(assetService.getEquipmentAssets).toHaveBeenCalledWith(params);
    });
  });

  describe('useDeleteAsset', () => {
    it('calls deleteAsset and invalidates asset lists cache', async () => {
      vi.mocked(assetService.deleteAsset).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteAsset(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('ast-1');

      expect(assetService.deleteAsset).toHaveBeenCalledWith('ast-1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: assetKeys.lists() });
    });
  });

  describe('usePurgeAllEquipmentAssets', () => {
    it('calls purgeAllEquipmentAssets and invalidates equipment, list, and statistics caches', async () => {
      vi.mocked(assetService.purgeAllEquipmentAssets).mockResolvedValue({ deleted_count: 1537 });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => usePurgeAllEquipmentAssets(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      expect(assetService.purgeAllEquipmentAssets).toHaveBeenCalledOnce();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: assetKeys.equipmentMaster.all() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: assetKeys.lists() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: assetKeys.statistics() });
    });
  });
});
