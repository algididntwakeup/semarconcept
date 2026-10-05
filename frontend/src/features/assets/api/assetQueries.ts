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
import type {
  EquipmentAssetListParams,
  EquipmentAssetListResponse,
  EquipmentAssetStats,
} from '../../../services/assetServices';

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

export const useEquipmentAssetStats = () => {
  return useQuery({
    queryKey: assetKeys.equipmentMaster.stats(),
    queryFn: (): Promise<EquipmentAssetStats> => assetService.getEquipmentAssetStats(),
  });
};

export const useEquipmentAssets = (params: EquipmentAssetListParams, enabled = true) => {
  return useQuery({
    queryKey: assetKeys.equipmentMaster.list(params),
    queryFn: (): Promise<EquipmentAssetListResponse> => assetService.getEquipmentAssets(params),
    enabled,
  });
};

export const useUpdateEquipmentLifecycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, action }: { assetId: string | number; action: string }) =>
      assetService.updateEquipmentLifecycle(assetId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: assetKeys.equipmentMaster.all() });
    },
  });
};

export const useDeleteEquipmentAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string | number) => assetService.deleteEquipmentAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.equipmentMaster.all() });
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
    },
  });
};

export const useEquipmentMaintenanceActions = () => {
  const queryClient = useQueryClient();
  const invalidateAssetData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: assetKeys.equipmentMaster.all() }),
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() }),
    ]);
  };

  const diagnoseDuplicates = useMutation({
    mutationFn: () => assetService.diagnoseEquipmentDuplicates(),
  });
  const fixComponentLinks = useMutation({
    mutationFn: (dryRun: boolean) => assetService.fixEquipmentComponentLinks(dryRun),
    onSuccess: invalidateAssetData,
  });
  const syncComponentsToFLOC = useMutation({
    mutationFn: (dryRun: boolean) => assetService.syncEquipmentComponentsToFLOC(dryRun),
    onSuccess: invalidateAssetData,
  });
  const importAssets = useMutation({
    mutationFn: ({
      file,
      onUploadProgress,
    }: {
      file: File;
      onUploadProgress?: (progress: number) => void;
    }) => assetService.importEquipmentAssets(file, onUploadProgress),
    onSuccess: invalidateAssetData,
  });
	const exportAssets = useMutation({
		mutationFn: (format: 'xlsx' | 'csv' = 'xlsx') => assetService.exportEquipmentAssets(format),
	});
  const purgeAllAssets = useMutation({
    mutationFn: () => assetService.purgeAllEquipmentAssets(),
    onSuccess: invalidateAssetData,
  });

  return {
    diagnoseDuplicates,
    fixComponentLinks,
    syncComponentsToFLOC,
    importAssets,
    exportAssets,
    purgeAllAssets,
  };
};

export const usePurgeAllEquipmentAssets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assetService.purgeAllEquipmentAssets(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.equipmentMaster.all() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.statistics() }),
      ]);
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AssetFormData>;
    }): Promise<Asset> => {
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
