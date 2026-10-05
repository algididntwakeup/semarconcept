// platform/frontend-mui/src/services/assetService.ts
import {
  Asset,
  AssetSearchParams,
  AssetListResponse,
  AssetFormData,
  AssetStatistics,
  AssetMetrics,
  AssetTimelineEvent,
  AssetAuditLog,
  AssetExportOptions,
  AssetHierarchyNode,
} from '../types/asset';
// ✅ FIXED: Changed from named import to default import
import apiClient from './apiClient';

export interface EquipmentAssetStat {
  class: string;
  count: number;
}

export interface EquipmentAssetFunclocStats {
  with: number;
  without: number;
}

export interface EquipmentAssetStats {
  classes: EquipmentAssetStat[];
  funcloc: EquipmentAssetFunclocStats;
}

export interface EquipmentAsset {
  id: string | number;
  tag_number?: string | null;
  tagNumber?: string | null;
  name?: string | null;
  description?: string | null;
  asset_class?: string | null;
  assetClass?: string | null;
  asset_type?: string | null;
  assetType?: string | null;
  type?: string | null;
  lifecycle_status?: string | null;
  lifecycleStatus?: string | null;
  parentId?: string | number | null;
  parent_id?: string | number | null;
  status?: string | null;
  materials?: Record<string, unknown> | null;
  rbi_properties?: Record<string, unknown> | null;
  functional_location_id?: string | number | null;
  parent_floc?: string | null;
  has_funcloc?: boolean | null;
}

export interface EquipmentAssetListParams {
  page?: number;
  limit?: number;
  search?: string;
  lifecycle_status?: string;
  equipment_class?: string;
  search_field?: 'tag_number' | 'class' | 'type' | 'material' | 'parent_floc' | 'status';
  sort_by?: 'tag_number' | 'asset_class' | 'asset_type' | 'materials' | 'parent_floc' | 'status';
  sort_order?: 'asc' | 'desc';
}

export interface EquipmentAssetListResponse {
  assets: EquipmentAsset[];
  total: number;
  page: number;
  limit: number;
}

export interface EquipmentDuplicateDiagnosis {
  duplicate_count: number;
  duplicates: { tag_number: string; count: number; asset_ids: number[] }[];
}

export interface EquipmentLinkFixResult {
  affected_links: number;
  dry_run: boolean;
}

export interface EquipmentFLOCSyncResult {
  checked_assets: number;
  valid_components: number;
  orphaned_components: number;
  broken_floc_links: number;
  cleared_floc_links: number;
}

export interface EquipmentAssetImportResult {
  created_count: number;
  updated_count: number;
  imported_count: number;
  total_count: number;
  errors: string[];
  validate_only: boolean;
}

const unwrapApiData = <T,>(value: unknown): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data;
  }
  return value as T;
};

/**
 * Asset Service
 * Handles all API calls related to asset management
 */
class AssetService {
  private baseUrl = '/assets';

  /**
   * Get assets with search and filter parameters
   */
  async getAssets(params: AssetSearchParams = {}): Promise<AssetListResponse> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Get single asset by ID
   */
  async getAssetById(assetId: string): Promise<Asset> {
    const response = await apiClient.get(`${this.baseUrl}/Asset/${assetId}`);
    return response.data;
  }

  /**
   * Create new asset
   */
  async createAsset(assetData: AssetFormData): Promise<Asset> {
    const response = await apiClient.post(`${this.baseUrl}/Asset`, assetData);
    return response.data;
  }

  /**
   * Update existing asset
   */
  async updateAsset(assetId: string, assetData: Partial<AssetFormData>): Promise<Asset> {
    const response = await apiClient.put(`${this.baseUrl}/Asset/${assetId}`, assetData);
    return response.data;
  }

  /**
   * Partially update asset
   */
  async patchAsset(assetId: string, updates: Partial<Asset>): Promise<Asset> {
    const response = await apiClient.patch(`${this.baseUrl}/Asset/${assetId}`, updates);
    return response.data;
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    const idStr = String(assetId);
    if (idStr.startsWith('site-')) {
      await this.deleteSite(idStr.split('-')[1]);
      return;
    }
    if (idStr.startsWith('unit-')) {
      await this.deleteUnit(idStr.split('-')[1]);
      return;
    }
    const pureId = idStr.includes('-') ? idStr.split('-')[1] : idStr;
    await apiClient.delete(`${this.baseUrl}/Asset/${pureId}`);
  }

  /**
   * Bulk delete assets
   */
  async bulkDeleteAssets(assetIds: string[]): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/bulk`, { data: { assetIds } });
  }

  /**
   * Bulk update assets
   */
  async bulkUpdateAssets(updates: { assetId: string; data: Partial<Asset> }[]): Promise<Asset[]> {
    const response = await apiClient.put(`${this.baseUrl}/bulk`, { updates });
    return response.data;
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(filters?: AssetSearchParams): Promise<AssetStatistics> {
    const response = await apiClient.get(`${this.baseUrl}/statistics`, { params: filters });
    return response.data;
  }

  async getEquipmentAssetStats(): Promise<EquipmentAssetStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    const payload = unwrapApiData<unknown>(response.data);
    const empty: EquipmentAssetStats = { classes: [], funcloc: { with: 0, without: 0 } };
    if (!payload || typeof payload !== 'object') {
      return empty;
    }
    const candidate = payload as Partial<EquipmentAssetStats>;
    return {
      classes: Array.isArray(candidate.classes) ? candidate.classes : [],
      funcloc: {
        with: Number(candidate.funcloc?.with) || 0,
        without: Number(candidate.funcloc?.without) || 0,
      },
    };
  }

  async getEquipmentAssets(
    params: EquipmentAssetListParams = {}
  ): Promise<EquipmentAssetListResponse> {
    const response = await apiClient.get(this.baseUrl, { params });
    const payload = unwrapApiData<Partial<EquipmentAssetListResponse>>(response.data);
    return {
      assets: Array.isArray(payload?.assets) ? payload.assets : [],
      total: Number(payload?.total ?? 0),
      page: Number(payload?.page ?? params.page ?? 1),
      limit: Number(payload?.limit ?? params.limit ?? 20),
    };
  }

  async updateEquipmentLifecycle(assetId: string | number, action: string): Promise<unknown> {
    const response = await apiClient.put(`${this.baseUrl}/${assetId}/lifecycle`, { action });
    return unwrapApiData(response.data);
  }

  async deleteEquipmentAsset(assetId: string | number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/Asset/${assetId}`);
  }

  /**
   * Create a single equipment asset from the Equipment Master modal. The
   * backend requires name and asset_type, so the tag number doubles as the
   * display name and a generic "Equipment" type is used when none is chosen.
   */
  async createEquipmentAsset(payload: {
    tag_number: string;
    description?: string;
    serial_number?: string;
    manufacturer?: string;
    asset_class: string;
    asset_type?: string;
    commissioning_date?: string;
    installation_date?: string;
    warranty_expiry?: string;
    status?: string;
    lifecycle_status?: string;
    drawings_references?: Record<string, string>;
    metadata?: Record<string, unknown>;
  }): Promise<EquipmentAsset> {
    const response = await apiClient.post(`${this.baseUrl}/Asset`, {
      name: payload.tag_number,
      tag_number: payload.tag_number,
      description: payload.description,
      serial_number: payload.serial_number,
      manufacturer: payload.manufacturer,
      asset_class: payload.asset_class,
      asset_type: payload.asset_type ?? payload.asset_class,
      commissioning_date: payload.commissioning_date,
      installation_date: payload.installation_date,
      warranty_expiry: payload.warranty_expiry,
      status: payload.status ?? 'active',
      lifecycle_status: payload.lifecycle_status,
      drawings_references: payload.drawings_references,
      metadata: payload.metadata,
      safety_critical: false,
      environmentally_critical: false,
    });
    return unwrapApiData<EquipmentAsset>(response.data);
  }

  async diagnoseEquipmentDuplicates(): Promise<EquipmentDuplicateDiagnosis> {
    const response = await apiClient.get(`${this.baseUrl}/diagnose-duplicates`);
    return unwrapApiData(response.data) as EquipmentDuplicateDiagnosis;
  }

  async fixEquipmentComponentLinks(dryRun = false): Promise<EquipmentLinkFixResult> {
    const response = await apiClient.post(`${this.baseUrl}/fix-links`, { dry_run: dryRun });
    return unwrapApiData(response.data) as EquipmentLinkFixResult;
  }

  async syncEquipmentComponentsToFLOC(dryRun = false): Promise<EquipmentFLOCSyncResult> {
    const response = await apiClient.post(`${this.baseUrl}/sync-floc`, { dry_run: dryRun });
    return unwrapApiData(response.data) as EquipmentFLOCSyncResult;
  }

  async importEquipmentAssets(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<EquipmentAssetImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset_type', 'Asset');
    formData.append('import_type', 'full');
    formData.append('file_name', file.name);
    formData.append('skip_errors', 'true');
    try {
      const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
        // Axios detects FormData and lets the browser attach the boundary on the wire.
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000,
        onUploadProgress: (event) => {
          if (event.total) onUploadProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      });
      return unwrapApiData<EquipmentAssetImportResult>(response.data);
    } catch (error) {
      const apiError = error as {
        message?: string;
        raw?: { response?: { data?: { message?: string; error?: string } } };
        response?: { data?: { message?: string; error?: string } };
      };
      const body = apiError.raw?.response?.data ?? apiError.response?.data;
      const details = [body?.message, body?.error]
        .filter((message): message is string => Boolean(message?.trim()))
        .filter((message, index, messages) => messages.indexOf(message) === index);
      if (details.length > 0) {
        throw new Error(details.join(': '));
      }
      throw error;
    }
  }

  async exportEquipmentAssets(format: 'xlsx' | 'csv' = 'xlsx'): Promise<{ blob: Blob; filename: string }> {
    const response = await apiClient.get(`${this.baseUrl}/export`, {
      params: { asset_type: 'Asset', export_type: 'full', format },
      responseType: 'blob',
    });
    const disposition = response.headers?.['content-disposition'] as string | undefined;
    const filename = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    return {
      blob: response.data as Blob,
      filename: decodeURIComponent(filename?.[1] ?? filename?.[2] ?? `equipment-master.${format}`),
    };
  }

  async purgeAllEquipmentAssets(): Promise<{ deleted_count: number }> {
    const response = await apiClient.delete(`${this.baseUrl}/purge`);
    const payload = unwrapApiData<{ deleted_count?: number }>(response.data);
    return {
      deleted_count: Number(payload?.deleted_count ?? 0),
    };
  }

  /**
   * Get asset performance metrics
   */
  async getAssetMetrics(
    assetId: string,
    period?: { start: string; end: string }
  ): Promise<AssetMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/metrics`, { params: period });
    return response.data;
  }

  /**
   * Get asset timeline events
   */
  async getAssetTimeline(assetId: string): Promise<AssetTimelineEvent[]> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/timeline`);
    return response.data;
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(
    assetId: string,
    event: Omit<AssetTimelineEvent, 'id'>
  ): Promise<AssetTimelineEvent> {
    const response = await apiClient.post(`${this.baseUrl}/${assetId}/timeline`, event);
    return response.data;
  }

  /**
   * Get asset audit log
   */
  async getAssetAuditLog(assetId: string): Promise<AssetAuditLog[]> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/audit-log`);
    return response.data;
  }

  /**
   * Get assets by parent ID (hierarchy navigation)
   */
  async getAssetsByParent(parentId: string): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/by-parent/${parentId}`);
    return response.data;
  }

  /**
   * Get assets by hierarchy level
   */
  async getAssetsByLevel(level: string, filters?: AssetSearchParams): Promise<AssetListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/by-level/${level}`, { params: filters });
    return response.data;
  }

  /**
   * Search assets with full-text search
   */
  async searchAssets(query: string, filters?: AssetSearchParams): Promise<AssetListResponse> {
    const params = { ...filters, search: query };
    return this.getAssets(params);
  }

  /**
   * Get asset suggestions for autocomplete
   */
  async getAssetSuggestions(query: string, limit: number = 10): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/suggestions`, {
      params: { query, limit },
    });
    return response.data;
  }

  /**
   * Validate asset data
   */
  async validateAsset(assetData: AssetFormData): Promise<{ isValid: boolean; errors: string[] }> {
    const response = await apiClient.post(`${this.baseUrl}/validate`, assetData);
    return response.data;
  }

  /**
   * Check if tag number is available
   */
  async checkTagNumberAvailability(tagNumber: string, excludeAssetId?: string): Promise<boolean> {
    const response = await apiClient.get(`${this.baseUrl}/check-tag`, {
      params: { tagNumber, excludeAssetId },
    });
    return response.data.available;
  }

  /**
   * Import assets from file
   */
  async importAssets(formData: FormData): Promise<{
    success: number;
    failed: number;
    errors: string[];
    createdAssets: Asset[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /**
   * Export assets to file
   */
  async exportAssets(options: AssetExportOptions): Promise<Blob> {
    const response = await apiClient.post(`${this.baseUrl}/export`, options, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get export template
   */
  async getExportTemplate(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export-template`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Duplicate asset
   */
  async duplicateAsset(assetId: string, newData?: Partial<AssetFormData>): Promise<Asset> {
    const response = await apiClient.post(`${this.baseUrl}/${assetId}/duplicate`, newData);
    return response.data;
  }

  /**
   * Move asset in hierarchy
   */
  async moveAsset(assetId: string, newParentId: string): Promise<Asset> {
    const response = await apiClient.patch(`${this.baseUrl}/${assetId}/move`, { newParentId });
    return response.data;
  }

  /**
   * Get sites with search and filter parameters
   */
  async getSites(params: AssetSearchParams = {}): Promise<AssetListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/sites`, { params });
    return response.data;
  }

  /**
   * Delete site
   */
  async deleteSite(siteId: string): Promise<{ status: string }> {
    await apiClient.delete(`${this.baseUrl}/sites/${siteId}`);
    return { status: 'success' };
  }

  /**
   * Create site
   */
  async createSite(data: any): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/sites`, data);
    return response.data;
  }

  /**
   * Update site
   */
  async updateSite(siteId: string, data: any): Promise<any> {
    const response = await apiClient.put(`${this.baseUrl}/sites/${siteId}`, data);
    return response.data;
  }

  /**
   * Create unit
   */
  async createUnit(data: any): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/units`, data);
    return response.data;
  }

  /**
   * Update unit
   */
  async updateUnit(unitId: string, data: any): Promise<any> {
    const response = await apiClient.put(`${this.baseUrl}/units/${unitId}`, data);
    return response.data;
  }

  /**
   * Delete unit
   */
  async deleteUnit(unitId: string): Promise<{ status: string }> {
    await apiClient.delete(`${this.baseUrl}/units/${unitId}`);
    return { status: 'success' };
  }

  /**
   * Get asset hierarchy
   */
  async getAssetHierarchy(params?: {
    site_id?: number;
    unit_id?: number;
    equipment_id?: number;
    max_depth?: number;
    include_stats?: boolean;
    include_metadata?: boolean;
    status_filter?: string;
    active_only?: boolean;
  }): Promise<AssetHierarchyNode[]> {
    const response = await apiClient.get(`${this.baseUrl}/hierarchy`, { params });
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    return [];
  }

  /**
   * Get asset children count
   */
  async getAssetChildrenCount(assetId: string): Promise<{
    units: number;
    equipment: number;
    components: number;
    total: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/children-count`);
    return response.data;
  }

  /**
   * Upload asset document
   */
  async uploadAssetDocument(
    assetId: string,
    file: File,
    metadata?: {
      type: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<{ id: string; url: string; name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiClient.post(`${this.baseUrl}/${assetId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /**
   * Delete asset document
   */
  async deleteAssetDocument(assetId: string, documentId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${assetId}/documents/${documentId}`);
  }

  /**
   * Update asset status
   */
  async updateAssetStatus(assetId: string, status: string, reason?: string): Promise<Asset> {
    const response = await apiClient.patch(`${this.baseUrl}/${assetId}/status`, { status, reason });
    return response.data;
  }

  /**
   * Update asset criticality
   */
  async updateAssetCriticality(
    assetId: string,
    criticality: number,
    reason?: string
  ): Promise<Asset> {
    const response = await apiClient.patch(`${this.baseUrl}/${assetId}/criticality`, {
      criticality,
      reason,
    });
    return response.data;
  }

  /**
   * Schedule inspection for asset
   */
  async scheduleInspection(
    assetId: string,
    inspectionData: {
      type: string;
      scheduledDate: string;
      inspector?: string;
      notes?: string;
    }
  ): Promise<{ id: string; scheduledDate: string }> {
    const response = await apiClient.post(
      `${this.baseUrl}/${assetId}/schedule-inspection`,
      inspectionData
    );
    return response.data;
  }

  /**
   * Get asset health summary
   */
  async getAssetHealthSummary(filters?: AssetSearchParams): Promise<{
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
    averageHealth: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/health-summary`, { params: filters });
    return response.data;
  }

  /**
   * Get assets due for inspection
   */
  async getAssetsDueForInspection(daysAhead: number = 30): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/due-inspection`, {
      params: { daysAhead },
    });
    return response.data;
  }

  /**
   * Get assets due for maintenance
   */
  async getAssetsDueForMaintenance(daysAhead: number = 30): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/due-maintenance`, {
      params: { daysAhead },
    });
    return response.data;
  }

  /**
   * Get critical assets with alerts
   */
  async getCriticalAssetsWithAlerts(): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/critical-alerts`);
    return response.data;
  }

  /**
   * Update asset location
   */
  async updateAssetLocation(
    assetId: string,
    location: {
      latitude?: number;
      longitude?: number;
      address?: string;
      building?: string;
      floor?: string;
      room?: string;
    }
  ): Promise<Asset> {
    const response = await apiClient.patch(`${this.baseUrl}/${assetId}/location`, location);
    return response.data;
  }

  /**
   * Get assets near location
   */
  async getAssetsNearLocation(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/near-location`, {
      params: { latitude, longitude, radius },
    });
    return response.data;
  }

  /**
   * Add asset tag
   */
  async addAssetTag(assetId: string, tag: string): Promise<Asset> {
    const response = await apiClient.post(`${this.baseUrl}/${assetId}/tags`, { tag });
    return response.data;
  }

  /**
   * Remove asset tag
   */
  async removeAssetTag(assetId: string, tag: string): Promise<Asset> {
    const response = await apiClient.delete(`${this.baseUrl}/${assetId}/tags/${tag}`);
    return response.data;
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 20): Promise<{ tag: string; count: number }[]> {
    const response = await apiClient.get(`${this.baseUrl}/popular-tags`, { params: { limit } });
    return response.data;
  }

  /**
   * Generate asset QR code
   */
  async generateQRCode(
    assetId: string,
    options?: {
      size?: number;
      format?: 'png' | 'svg';
      includeUrl?: boolean;
    }
  ): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/qr-code`, {
      params: options,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get asset hierarchy path
   */
  async getAssetHierarchyPath(assetId: string): Promise<{
    site?: { id: string; name: string; tagNumber: string };
    unit?: { id: string; name: string; tagNumber: string };
    equipment?: { id: string; name: string; tagNumber: string };
    component?: { id: string; name: string; tagNumber: string };
    fullPath: string;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/hierarchy-path`);
    return response.data;
  }

  /**
   * Get recently viewed assets
   */
  async getRecentlyViewedAssets(limit: number = 10): Promise<Asset[]> {
    const response = await apiClient.get(`${this.baseUrl}/recently-viewed`, { params: { limit } });
    return response.data;
  }

  /**
   * Mark asset as viewed
   */
  async markAssetAsViewed(assetId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${assetId}/mark-viewed`);
  }

  /**
   * Get asset recommendations
   */
  async getAssetRecommendations(assetId: string): Promise<{
    similarAssets: Asset[];
    maintenanceRecommendations: string[];
    inspectionRecommendations: string[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/recommendations`);
    return response.data;
  }

  /**
   * Calculate asset remaining life
   */
  async calculateRemainingLife(assetId: string): Promise<{
    remainingLife: number;
    confidence: number;
    factors: string[];
    recommendations: string[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/remaining-life`);
    return response.data;
  }

  /**
   * Predict asset failure
   */
  async predictAssetFailure(assetId: string): Promise<{
    failureProbability: number;
    timeToFailure: number;
    confidenceLevel: number;
    criticalFactors: string[];
    recommendations: string[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/predict-failure`);
    return response.data;
  }

  /**
   * Get asset cost analysis
   */
  async getAssetCostAnalysis(
    assetId: string,
    period?: { start: string; end: string }
  ): Promise<{
    totalCost: number;
    acquisitionCost: number;
    operatingCost: number;
    maintenanceCost: number;
    downtimeCost: number;
    energyCost: number;
    costTrends: { date: string; cost: number; category: string }[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${assetId}/cost-analysis`, {
      params: period,
    });
    return response.data;
  }

  /**
   * Compare assets
   */
  async compareAssets(assetIds: string[]): Promise<{
    assets: Asset[];
    comparison: {
      field: string;
      values: { [assetId: string]: any };
      differences: string[];
    }[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/compare`, { assetIds });
    return response.data;
  }
}

// Create and export service instance
export const assetService = new AssetService();
export default assetService;
