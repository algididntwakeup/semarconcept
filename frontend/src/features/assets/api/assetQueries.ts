// platform/frontend-mui/src/features/assets/api/assetQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '../../../services/assetServices';
import { assetKeys } from '../../../shared/api/queryKeys';
import {
  Asset,
  AssetSearchParams,
  AssetListResponse,
  AssetFormData,
  AssetStatistics,
} from '../types';

/**
 * Hook to query assets with pagination, search, and filtering
 */
export const useAssets = (params: AssetSearchParams = {}) => {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: async (): Promise<AssetListResponse> => {
      const response = await assetService.getAssets(params);
      return response;
    },
  });
};

/**
 * Hook to query a single asset by its ID
 */
export const useAsset = (assetId?: string | number | null) => {
  const idStr = assetId !== undefined && assetId !== null ? String(assetId) : '';

  return useQuery({
    queryKey: assetKeys.detail(idStr),
    queryFn: async (): Promise<Asset> => {
      return assetService.getAssetById(idStr);
    },
    enabled: Boolean(idStr),
  });
};

/**
 * Hook to query asset statistics
 */
export const useAssetStatistics = (filters?: AssetSearchParams) => {
  return useQuery({
    queryKey: assetKeys.statistics(filters),
    queryFn: async (): Promise<AssetStatistics> => {
      return assetService.getAssetStatistics(filters);
    },
  });
};

/**
 * Mutation hook to create a new asset
 */
export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetData: AssetFormData): Promise<Asset> => {
      return assetService.createAsset(assetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
    },
  });
};

/**
 * Mutation hook to update an existing asset
 */
export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AssetFormData> }): Promise<Asset> => {
      return assetService.updateAsset(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
    },
  });
};

/**
 * Mutation hook to delete an asset
 */
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string): Promise<void> => {
      return assetService.deleteAsset(assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
    },
  });
};
