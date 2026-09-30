import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import { assetService } from './assetServices';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('Equipment Master asset service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches lifecycle statistics from the assets stats endpoint', async () => {
    const stats = [{ asset_type: 'pump', lifecycle_status: 'Installed', count: 3 }];
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, message: 'ok', data: stats },
    });

    await expect(assetService.getEquipmentAssetStats()).resolves.toEqual(stats);
    expect(apiClient.get).toHaveBeenCalledWith('/assets/stats');
  });

  it('requests paginated, searched, lifecycle-filtered assets and unwraps the API envelope', async () => {
    const params = {
      page: 2,
      limit: 10,
      search: 'P-10',
      lifecycle_status: 'Installed',
    };
    const result = {
      assets: [{ id: 10, tag_number: 'P-10', lifecycle_status: 'Installed' }],
      total: 11,
      page: 2,
      limit: 10,
    };
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, message: 'ok', data: result },
    });

    await expect(assetService.getEquipmentAssets(params)).resolves.toEqual(result);
    expect(apiClient.get).toHaveBeenCalledWith('/assets', { params });
  });

  it('calls maintenance utility endpoints using their backend request contracts', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, data: { duplicate_count: 1, duplicates: [] } },
    });
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        data: { success: true, data: { affected_links: 3, dry_run: false } },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            checked_assets: 10,
            valid_components: 8,
            orphaned_components: 2,
            broken_floc_links: 1,
            cleared_floc_links: 0,
          },
        },
      });

    await expect(assetService.diagnoseEquipmentDuplicates()).resolves.toMatchObject({
      duplicate_count: 1,
    });
    await expect(assetService.fixEquipmentComponentLinks()).resolves.toMatchObject({
      affected_links: 3,
    });
    await expect(assetService.syncEquipmentComponentsToFLOC()).resolves.toMatchObject({
      checked_assets: 10,
    });

    expect(apiClient.get).toHaveBeenCalledWith('/assets/diagnose-duplicates');
    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/assets/fix-links', { dry_run: false });
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/assets/sync-floc', { dry_run: false });
  });

  it('sends lifecycle, edit, and delete requests to the Asset routes', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { success: true, data: { id: 5 } } });
    vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

    await assetService.updateEquipmentLifecycle(5, 'Retire');
    await assetService.updateAsset('5', { name: 'Pump 5' } as never);
    await assetService.deleteEquipmentAsset(5);

    expect(apiClient.put).toHaveBeenNthCalledWith(1, '/assets/5/lifecycle', { action: 'Retire' });
    expect(apiClient.put).toHaveBeenNthCalledWith(2, '/assets/Asset/5', { name: 'Pump 5' });
    expect(apiClient.delete).toHaveBeenCalledWith('/assets/Asset/5');
  });

  it('uploads XLSX as multipart and downloads the XLSX export response', async () => {
    const file = new File(['xlsx-content'], 'equipment.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const importResult = {
      created_count: 1,
      updated_count: 0,
      imported_count: 1,
      total_count: 1,
      errors: [],
      validate_only: false,
    };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true, data: importResult } });
    const blob = new Blob(['xlsx-content']);
    vi.mocked(apiClient.get).mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="equipment.xlsx"' },
    });

    await expect(assetService.importEquipmentAssets(file)).resolves.toEqual(importResult);
    const [url, formData, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe('/assets/import');
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get('file')).toBe(file);
    expect((formData as FormData).get('skip_errors')).toBe('true');
    expect((formData as FormData).has('batch_size')).toBe(false);
    expect(config).toMatchObject({
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000,
    });
    expect(config).toHaveProperty('onUploadProgress', expect.any(Function));

    await expect(assetService.exportEquipmentAssets()).resolves.toEqual({
      blob,
      filename: 'equipment.xlsx',
    });
    expect(apiClient.get).toHaveBeenCalledWith('/assets/export', {
      params: { asset_type: 'Asset', export_type: 'full', file_format: 'xlsx', format: 'xlsx' },
      responseType: 'blob',
    });
  });
});
