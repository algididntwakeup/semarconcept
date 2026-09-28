import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ClipboardList, X } from 'lucide-react';
import {
  useAssets,
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

const PAGE_SIZE = 10;

const unwrapList = (value: unknown): { assets: EquipmentAssetRow[]; total: number } => {
  const outer = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const payload =
    outer.data && typeof outer.data === 'object' ? (outer.data as Record<string, unknown>) : outer;
  const items = Array.isArray(payload.assets)
    ? payload.assets
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
  return {
    assets: items as EquipmentAssetRow[],
    total: typeof payload.total === 'number' ? payload.total : items.length,
  };
};

const statusKey = (status: string) => status.trim().toLowerCase().replace(/_/g, ' ');

const EquipmentMasterPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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
  const [actionError, setActionError] = useState('');
  const assetsQuery = useAssets({ page, limit: PAGE_SIZE, search });
  const statsQuery = useEquipmentAssetStats();
  const updateLifecycle = useUpdateEquipmentLifecycle();

  const list = useMemo(() => unwrapList(assetsQuery.data), [assetsQuery.data]);
  const cards = useMemo(() => {
    const byStatus = new Map<string, number>();
    const stats = statsQuery.data ?? [];
    stats.forEach((item) => {
      const key = statusKey(item.lifecycle_status || item.status || 'Unknown');
      byStatus.set(key, (byStatus.get(key) ?? 0) + item.count);
    });
    const total = stats.reduce((sum, item) => sum + item.count, 0);
    return [
      { title: 'Total Assets', count: total },
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
          await assetService.deleteAsset(String(asset.id));
          await queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
          await queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
          await queryClient.invalidateQueries({ queryKey: [...assetKeys.all, 'equipment-stats'] });
        } catch (error) {
          setActionError(error instanceof Error ? error.message : 'Unable to delete asset');
        }
        break;
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
          onView={setSelectedAsset}
          onAction={handleRowAction}
          onLifecycleChange={(asset, action) =>
            updateLifecycle.mutateAsync({ assetId: asset.id, action }).then(() => undefined)
          }
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
        onSaved={() => {
          setEditingAsset(null);
          queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
          queryClient.invalidateQueries({ queryKey: assetKeys.statistics() });
          queryClient.invalidateQueries({ queryKey: [...assetKeys.all, 'equipment-stats'] });
        }}
      />
    </main>
  );
};

export default EquipmentMasterPage;
