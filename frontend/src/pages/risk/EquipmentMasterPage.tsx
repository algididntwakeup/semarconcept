import { useMemo, useRef, useState } from 'react';
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
import { assetKeys } from '../../shared/api/queryKeys';
import type { Asset } from '../../types/asset';
import { useNotification } from '../../hooks/useNotification';

const PAGE_SIZE = 10;

const statusKey = (status: string) => status.trim().toLowerCase().replace(/_/g, ' ');

const EquipmentMasterPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('');
  const [selectedStat, setSelectedStat] = useState<{
    title: string;
    count: number;
    status?: string;
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
  const maintenance = useEquipmentMaintenanceActions();

  const list = assetsQuery.data ?? { assets: [], total: 0, page, limit: PAGE_SIZE };
  const cards = useMemo(() => {
    const byStatus = new Map<string, number>();
    const stats = statsQuery.data ?? [];
    stats.forEach((item) => {
      const key = statusKey(item.lifecycle_status || 'Unknown');
      byStatus.set(key, (byStatus.get(key) ?? 0) + item.count);
    });
    const total = stats.reduce((sum, item) => sum + item.count, 0);
    return [
      { title: 'Total Assets', count: total, status: undefined },
      { title: 'Installed Assets', count: byStatus.get('installed') ?? 0, status: 'Installed' },
      {
        title: 'Sent to Repair',
        count: byStatus.get('sent to repair') ?? 0,
        status: 'Sent to repair',
      },
      { title: 'Retired Assets', count: byStatus.get('retired') ?? 0, status: 'Retired' },
      { title: 'Condemned Assets', count: byStatus.get('condemned') ?? 0, status: 'Condemned' },
    ];
  }, [statsQuery.data]);

  const totalPages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const errorMessage = assetsQuery.error instanceof Error ? assetsQuery.error.message : null;
  const handleRowAction = async (action: AssetRowAction, asset: EquipmentAssetRow) => {
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
          await deleteAsset.mutateAsync(asset.id);
          showNotification('Asset deleted successfully.', 'success');
        } catch (error) {
          showNotification(
            error instanceof Error ? error.message : 'Unable to delete asset',
            'error'
          );
        }
        break;
    }
  };

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
      const { blob, filename } = await maintenance.exportAssets.mutateAsync();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      showNotification('Asset Excel export downloaded.', 'success');
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Unable to export assets.',
        'error'
      );
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

  const handleImportFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      showNotification('Choose an .xlsx file to import.', 'error');
      return;
    }
    try {
      await maintenance.importAssets.mutateAsync(file);
      showNotification(`${file.name} imported successfully.`, 'success');
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Unable to import assets.',
        'error'
      );
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };
  const pagination = (
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
  );

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
            onChange={(event) => void handleImportFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={maintenance.importAssets.isPending}
            onClick={() => importInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
          >
            <FileUp size={16} />
            {maintenance.importAssets.isPending ? 'Importing…' : 'Import XLSX'}
          </button>
          <button
            type="button"
            disabled={maintenance.exportAssets.isPending}
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-60"
          >
            <FileDown size={16} />
            {maintenance.exportAssets.isPending ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
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
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            count={card.count}
            isActive={selectedStat?.title === card.title}
            onClick={() => setSelectedStat(card)}
            description={statsQuery.isLoading ? 'Loading metrics…' : 'Click to view metric details'}
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
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          lifecycleFilter={lifecycleFilter}
          onLifecycleFilterChange={(status) => {
            setLifecycleFilter(status);
            setPage(1);
          }}
          onView={setSelectedAsset}
          onAction={handleRowAction}
          onLifecycleChange={async (asset, action) => {
            try {
              await updateLifecycle.mutateAsync({ assetId: asset.id, action });
              showNotification(`Lifecycle updated: ${action}.`, 'success');
            } catch (error) {
              showNotification(
                error instanceof Error ? error.message : 'Unable to update lifecycle.',
                'error'
              );
              throw error;
            }
          }}
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
          lifecycleStatus={selectedStat.status}
          onClose={() => setSelectedStat(null)}
          onSelectAsset={setSelectedAsset}
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
