import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileDown,
  FileUp,
  Link2,
  RefreshCw,
  ScanSearch,
  Trash2,
  X,
} from 'lucide-react';
import {
  useDeleteEquipmentAsset,
  useEquipmentMaintenanceActions,
  useEquipmentAssets,
  useEquipmentAssetStats,
  useUpdateEquipmentLifecycle,
} from '../../features/assets/api/assetQueries';
import AssetDataGrid, {
  type EquipmentAssetRow,
} from '../../features/assets/components/AssetDataGrid';
import type { AssetRowAction } from '../../features/assets/components/RowActions';
import StatCard from '../../features/assets/components/StatCard';
import StatDetailModal from '../../features/assets/components/StatDetailModal';
import AssetFormModal from '../../components/AssetFormModal';
import { assetService } from '../../services/assetServices';
import type { EquipmentAssetImportResult } from '../../services/assetServices';
import { assetKeys } from '../../shared/api/queryKeys';
import type { Asset } from '../../types/asset';
import { useNotification } from '../../hooks/useNotification';

const PAGE_SIZE = 10;
const EMPTY_ASSET_LIST: {
  assets: EquipmentAssetRow[];
  total: number;
  page: number;
  limit: number;
} = { assets: [], total: 0, page: 1, limit: PAGE_SIZE };


const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const EquipmentMasterPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
	const [lifecycleFilter, setLifecycleFilter] = useState('');
	const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [selectedStat, setSelectedStat] = useState<{
    title: string;
    count: number;
    equipmentClass: string;
  } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<EquipmentAssetRow | null>(null);
  const [editingAsset, setEditingAsset] = useState<EquipmentAssetRow | null>(null);
  const [timeline, setTimeline] = useState<
    { title: string; date: string; description: string }[] | null
  >(null);
  const [duplicateDiagnosis, setDuplicateDiagnosis] = useState<{
    duplicate_count: number;
    duplicates: { tag_number: string; count: number; asset_ids: number[] }[];
  } | null>(null);
  const [actionError, setActionError] = useState('');
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState<EquipmentAssetImportResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const assetsQuery = useEquipmentAssets({
    page,
    limit: PAGE_SIZE,
    search,
    lifecycle_status: lifecycleFilter || undefined,
  });
  const statsQuery = useEquipmentAssetStats();
  const updateLifecycle = useUpdateEquipmentLifecycle();
  const deleteAsset = useDeleteEquipmentAsset();
  const updateLifecycleAsync = updateLifecycle.mutateAsync;
  const deleteAssetAsync = deleteAsset.mutateAsync;
  const maintenance = useEquipmentMaintenanceActions();

  const list = assetsQuery.data ?? EMPTY_ASSET_LIST;
  const cards = useMemo(() => {
    return (statsQuery.data ?? []).filter((item) => item.count > 0)
      .map((item) => ({ title: item.class, count: item.count, equipmentClass: item.class }));
  }, [statsQuery.data]);

  const totalPages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const errorMessage = assetsQuery.error instanceof Error ? assetsQuery.error.message : null;
  const handleRowAction = useCallback(async (action: AssetRowAction, asset: EquipmentAssetRow) => {
    setActionError('');
    switch (action) {
      case 'manage':
        setSelectedAsset(asset);
        break;
      case 'add-component':
        window.location.assign('/assets/hierarchy');
        break;
      case 'timeline':
        try {
          const events = await assetService.getAssetTimeline(String(asset.id));
          setTimeline(
            events.map((event) => ({
              title: event.title,
              date: event.date,
              description: event.description,
            }))
          );
          setSelectedAsset(asset);
        } catch (error) {
          setActionError(error instanceof Error ? error.message : 'Unable to load asset timeline');
        }
        break;
      case 'edit':
        setEditingAsset(asset);
        break;
      case 'delete':
        if (!window.confirm(`Delete asset ${asset.tag_number ?? asset.tagNumber ?? asset.id}?`))
          return;
        try {
          await deleteAssetAsync(asset.id);
          showNotification('Asset deleted successfully.', 'success');
        } catch (error) {
          showNotification(
            error instanceof Error ? error.message : 'Unable to delete asset',
            'error'
          );
        }
        break;
    }
  }, [deleteAssetAsync, showNotification]);

  const handleGridSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);
  const handleClearSearch = useCallback(() => {
    setSearch('');
    setPage(1);
  }, []);
  const handleLifecycleFilterChange = useCallback((status: string) => {
    setLifecycleFilter(status);
    setPage(1);
  }, []);
  const handleLifecycleChange = useCallback(async (asset: EquipmentAssetRow, action: string) => {
    try {
      await updateLifecycleAsync({ assetId: asset.id, action });
      showNotification(`Lifecycle updated: ${action}.`, 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Unable to update lifecycle.', 'error');
      throw error;
    }
  }, [showNotification, updateLifecycleAsync]);
  const handleCloseStat = useCallback(() => setSelectedStat(null), []);
  const handleSelectAsset = useCallback((asset: EquipmentAssetRow) => setSelectedAsset(asset), []);

  const runUtility = async <T,>(
    operation: () => Promise<T>,
    successMessage: (result: T) => string
  ) => {
    try {
      const result = await operation();
      showNotification(successMessage(result), 'success');
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Equipment utility failed.',
        'error'
      );
    }
  };

  const handleExport = async () => {
    try {
		const { blob, filename } = await maintenance.exportAssets.mutateAsync(exportFormat);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
		showNotification('Equipment export downloaded.', 'success');
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Unable to export assets.',
        'error'
      );
    }
  };

  const handlePurgeAll = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete all equipment assets for this organization? This action cannot be undone.'
    );
    if (!confirmed) return;
    try {
      setIsPurging(true);
      const result = await maintenance.purgeAllAssets.mutateAsync();
      showNotification(
        `All equipment assets cleared successfully (${result.deleted_count} record(s) removed).`,
        'success'
      );
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Failed to clear equipment assets.',
        'error'
      );
    } finally {
      setIsPurging(false);
    }
  };

  const handleDiagnoseDuplicates = async () => {
    try {
      const result = await maintenance.diagnoseDuplicates.mutateAsync();
      setDuplicateDiagnosis(result);
      showNotification(
        result.duplicate_count === 0
          ? 'Duplicate tag diagnosis complete: no duplicates found.'
          : `Duplicate tag diagnosis found ${result.duplicate_count} duplicate tag(s).`,
        result.duplicate_count === 0 ? 'success' : 'warning'
      );
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Unable to diagnose duplicate assets.',
        'error'
      );
    }
  };

  const handleClearFile = useCallback(() => {
    setFile(null);
    setImportError('');
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  }, []);

  const handleSelectFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      showNotification('Choose an .xlsx file to import.', 'error');
      if (importInputRef.current) importInputRef.current.value = '';
      return;
    }
    const MAX_XLSX_SIZE = 100 * 1024 * 1024; // 100 MB
    if (selectedFile.size > MAX_XLSX_SIZE) {
      showNotification('XLSX files must be 100 MB or smaller.', 'error');
      if (importInputRef.current) importInputRef.current.value = '';
      return;
    }
    setImportError('');
    setImportResult(null);
    setFile(selectedFile);
  };

  const handleImportSubmit = async (fileToImport?: File | null) => {
    const targetFile = fileToImport || file;
    if (!targetFile) {
      showNotification('Choose an .xlsx file to import.', 'error');
      return;
    }
    setImportError('');
    setImportResult(null);
    setImportProgress(0);
    try {
      const result = await maintenance.importAssets.mutateAsync({
        file: targetFile,
        onUploadProgress: setImportProgress,
      });
      setFile(null);
      if (importInputRef.current) importInputRef.current.value = '';
      setImportResult(result);
      if (result.errors?.length) {
        showNotification(
          `Import completed with ${result.errors.length} row issue(s): ${result.imported_count} of ${result.total_count} rows imported.`,
          'warning',
          10000
        );
      } else {
        showNotification(
          `${targetFile.name}: ${result.created_count} created, ${result.updated_count} updated.`,
          'success'
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import assets.';
      setImportError(message);
      showNotification(message, 'error', 10000);
      // Fallback UI: kembalikan uploader ke state awal agar user bisa langsung upload ulang
      setFile(null);
      if (importInputRef.current) importInputRef.current.value = '';
    } finally {
      setImportProgress(null);
    }
  };
  const pagination = useMemo(() => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing {list.assets.length} of {list.total} equipment assets
      </p>
      <nav aria-label="Equipment pages" className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
        </button>
        <span className="px-2 text-xs font-medium text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={17} />
        </button>
      </nav>
    </div>
  ), [list.assets.length, list.total, page, totalPages]);

  return (
    <main
      className="mx-auto w-full max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8"
      aria-labelledby="equipment-master-title"
    >
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <ClipboardList size={15} aria-hidden="true" /> Risk Based Inspection
          </div>
          <h1
            id="equipment-master-title"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Equipment Master
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Equipment registry and lifecycle overview for RBI workflows.
          </p>
        </div>
      </header>

      <section aria-label="Equipment maintenance utilities" className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Maintenance utilities</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={maintenance.diagnoseDuplicates.isPending}
            onClick={() => void handleDiagnoseDuplicates()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <ScanSearch size={16} />
            {maintenance.diagnoseDuplicates.isPending ? 'Diagnosing…' : 'Diagnose duplicates'}
          </button>
          <button
            type="button"
            disabled={maintenance.fixComponentLinks.isPending}
            onClick={() =>
              void runUtility(
                () => maintenance.fixComponentLinks.mutateAsync(false),
                (result) => `Component links fixed: ${result.affected_links} link(s) updated.`
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Link2 size={16} />
            {maintenance.fixComponentLinks.isPending ? 'Fixing links…' : 'Fix component links'}
          </button>
          <button
            type="button"
            disabled={maintenance.syncComponentsToFLOC.isPending}
            onClick={() =>
              void runUtility(
                () => maintenance.syncComponentsToFLOC.mutateAsync(false),
                (result) =>
                  `FLOC sync complete: ${result.valid_components} valid, ${result.orphaned_components} orphaned components.`
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            {maintenance.syncComponentsToFLOC.isPending ? 'Syncing…' : 'Sync components to FLOC'}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            aria-label="Select XLSX asset import file"
            disabled={maintenance.importAssets.isPending}
            onChange={(event) => handleSelectFile(event.target.files?.[0])}
          />
          {file ? (
            <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900 shadow-sm">
              <FileUp size={16} className="text-emerald-700 shrink-0" />
              <span className="font-semibold truncate max-w-[200px]" title={file.name}>
                {file.name}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={handleClearFile}
                disabled={maintenance.importAssets.isPending}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                aria-label="Remove file"
                title="Remove file"
              >
                <X size={14} />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={() => void handleImportSubmit()}
                disabled={maintenance.importAssets.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                <FileUp size={14} />
                {maintenance.importAssets.isPending ? 'Importing…' : 'Submit Import'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={maintenance.importAssets.isPending}
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
            >
              <FileUp size={16} />
              {maintenance.importAssets.isPending ? 'Importing…' : 'Import XLSX'}
            </button>
          )}
		  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
		    Export format
		    <select
		      value={exportFormat}
		      onChange={(event) => setExportFormat(event.target.value as 'xlsx' | 'csv')}
		      className="rounded-lg border border-slate-300 bg-white px-2 py-2"
		    >
		      <option value="xlsx">XLSX</option>
		      <option value="csv">CSV</option>
		    </select>
		  </label>
          <button
            type="button"
            disabled={maintenance.exportAssets.isPending}
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-60"
          >
            <FileDown size={16} />
		    {maintenance.exportAssets.isPending ? 'Exporting…' : 'Export'}
          </button>
          <button
            type="button"
            disabled={isPurging || maintenance.importAssets.isPending}
            onClick={() => void handlePurgeAll()}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-60"
          >
            <Trash2 size={16} />
            {isPurging ? 'Clearing…' : 'Clear All Equipment'}
          </button>
        </div>
        {maintenance.importAssets.isPending && (
          <div role="status" aria-live="polite" className="space-y-2 text-sm text-blue-700">
            <p>
              {importProgress !== null && importProgress < 100
                ? `Uploading XLSX… ${importProgress}%`
                : 'Upload complete. Processing XLSX and updating equipment…'}
              {' '}Keep this page open; large workbooks may take a moment.
            </p>
            <div
              className="h-2 overflow-hidden rounded-full bg-blue-100"
              role="progressbar"
              aria-label="XLSX import progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={importProgress ?? 100}
            >
              <div
                className={`h-full rounded-full bg-blue-600 transition-all duration-300 ${importProgress === null || importProgress >= 100 ? 'w-full animate-pulse' : ''}`}
                style={importProgress !== null && importProgress < 100 ? { width: `${importProgress}%` } : undefined}
              />
            </div>
          </div>
        )}
        {importError && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p className="font-semibold">Import failed</p>
            <p className="mt-1 break-words">{importError}</p>
            <p className="mt-2 text-xs text-rose-600">
              The uploader has been reset. You can select another file or retry directly.
            </p>
          </div>
        )}
        {importResult && (
          <div
            role="region"
            aria-label="XLSX import results"
            className={`rounded-xl border p-4 text-sm ${importResult.errors.length ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
          >
            <p className="font-semibold">
              Import finished: {importResult.imported_count} of {importResult.total_count} rows imported
              ({importResult.created_count} created, {importResult.updated_count} updated).
            </p>
            {importResult.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">
                  {importResult.errors.length} row issue(s) — show details
                </summary>
                <ul className="mt-2 max-h-48 list-inside list-disc space-y-1 overflow-auto">
                  {importResult.errors.map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}
        {duplicateDiagnosis && duplicateDiagnosis.duplicate_count > 0 && (
          <div
            role="region"
            aria-label="Duplicate asset diagnosis results"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4"
          >
            <p className="text-sm font-semibold text-amber-900">
              {duplicateDiagnosis.duplicate_count} duplicate tag(s) detected
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              {duplicateDiagnosis.duplicates.map((duplicate) => (
                <li key={duplicate.tag_number}>
                  <span className="font-medium">{duplicate.tag_number}</span> · {duplicate.count}{' '}
                  records
                  {duplicate.asset_ids.length > 0 && ` · IDs: ${duplicate.asset_ids.join(', ')}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {statsQuery.isError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          Unable to load equipment metrics.
        </p>
      )}
      <section
        aria-label="Equipment metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            count={card.count}
            isLoading={statsQuery.isLoading}
            isActive={selectedStat?.equipmentClass === card.equipmentClass}
            onClick={() => setSelectedStat(card)}
            description="Equipment class · click to view assets"
          />
        ))}
      </section>

      <section aria-labelledby="equipment-register-title" className="space-y-4">
        <div>
          <h2 id="equipment-register-title" className="text-lg font-semibold text-slate-900">
            Equipment register
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse equipment by tag number, description, and class or type.
          </p>
        </div>
        <AssetDataGrid
          assets={list.assets}
          isLoading={assetsQuery.isLoading || assetsQuery.isFetching}
          error={errorMessage}
          searchValue={search}
          onSearchChange={handleGridSearchChange}
          onClearSearch={handleClearSearch}
          lifecycleFilter={lifecycleFilter}
          onLifecycleFilterChange={handleLifecycleFilterChange}
          onView={handleSelectAsset}
          onAction={handleRowAction}
          onLifecycleChange={handleLifecycleChange}
          paginationSlot={pagination}
        />
      </section>

      {actionError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {actionError}
        </p>
      )}

      {selectedStat && (
        <StatDetailModal
          key={selectedStat.title}
          open
          title={selectedStat.title}
          count={selectedStat.count}
          equipmentClass={selectedStat.equipmentClass}
          onClose={handleCloseStat}
          onSelectAsset={handleSelectAsset}
        />
      )}

      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAsset(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipment-detail-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Equipment detail
                </p>
                <h2
                  id="equipment-detail-title"
                  className="mt-1 text-xl font-semibold text-slate-900"
                >
                  {selectedAsset.name ||
                    selectedAsset.tag_number ||
                    selectedAsset.tagNumber ||
                    selectedAsset.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAsset(null);
                  setTimeline(null);
                }}
                aria-label="Close equipment details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Tag number', selectedAsset.tag_number ?? selectedAsset.tagNumber ?? '—'],
                ['Description', selectedAsset.description || '—'],
                [
                  'Class / type',
                  selectedAsset.asset_class ??
                    selectedAsset.assetClass ??
                    selectedAsset.asset_type ??
                    selectedAsset.assetType ??
                    selectedAsset.type ??
                    '—',
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-medium text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            {timeline && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-800">Asset timeline</h3>
                {timeline.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">No timeline events found.</p>
                ) : (
                  <ol className="mt-3 space-y-3">
                    {timeline.map((event, index) => (
                      <li
                        key={`${event.date}-${index}`}
                        className="border-l-2 border-emerald-200 pl-3"
                      >
                        <p className="text-sm font-medium text-slate-800">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {event.date} · {event.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <AssetFormModal
        isOpen={Boolean(editingAsset)}
        mode="edit"
        editingAsset={
          editingAsset
            ? ({
                ...editingAsset,
                id: String(editingAsset.id),
                tenantId: '',
                name: editingAsset.name ?? '',
                tagNumber: editingAsset.tagNumber ?? editingAsset.tag_number ?? '',
                type: (editingAsset.type ??
                  editingAsset.asset_type ??
                  editingAsset.assetType ??
                  editingAsset.asset_class ??
                  editingAsset.assetClass ??
                  'other') as Asset['type'],
                hierarchyLevel: 'equipment',
                status: (editingAsset.status ?? 'active') as Asset['status'],
                parentId: String(editingAsset.parentId ?? ''),
              } as unknown as Asset)
            : null
        }
        allAssets={Object.fromEntries(
          list.assets.map((asset) => [
            String(asset.id),
            {
              id: String(asset.id),
              name: asset.name ?? '',
              type: String(asset.asset_type ?? asset.assetType ?? asset.type ?? ''),
            },
          ])
        )}
        onClose={() => setEditingAsset(null)}
        onError={(message) => showNotification(message, 'error')}
        onSaved={() => {
          setEditingAsset(null);
          showNotification('Asset updated successfully.', 'success');
          queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
          queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
          queryClient.invalidateQueries({ queryKey: assetKeys.equipmentMaster.all() });
        }}
      />
    </main>
  );
};

export default EquipmentMasterPage;
