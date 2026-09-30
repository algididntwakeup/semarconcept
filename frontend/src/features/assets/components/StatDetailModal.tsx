import { memo, useCallback, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle, Search, X } from 'lucide-react';
import { useEquipmentAssets } from '../api/assetQueries';
import type { EquipmentAssetRow } from './AssetDataGrid';

const MODAL_PAGE_SIZE = 8;

const getMaterialProperties = (asset: EquipmentAssetRow) => {
  const properties = { ...(asset.rbi_properties ?? {}), ...(asset.materials ?? {}) };
  const materialEntries = Object.entries(properties).filter(([key]) => /material|base metal/i.test(key));
  const shown = materialEntries.length > 0 ? Object.fromEntries(materialEntries) : properties;
  return Object.keys(shown).length > 0 ? JSON.stringify(shown) : '—';
};

interface StatDetailModalProps {
  open: boolean;
  title: string;
  count: number;
  lifecycleStatus?: string;
  equipmentClass?: string;
  onClose: () => void;
  onSelectAsset?: (asset: EquipmentAssetRow) => void;
}

const unpackAssets = (response: unknown): { assets: EquipmentAssetRow[]; total: number } => {
  const outer =
    response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
  const payload =
    outer.data && typeof outer.data === 'object' ? (outer.data as Record<string, unknown>) : outer;
  const rows = Array.isArray(payload.assets)
    ? payload.assets
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
  return {
    assets: rows as EquipmentAssetRow[],
    total: typeof payload.total === 'number' ? payload.total : rows.length,
  };
};

const StatDetailModal = memo(({
  open,
  title,
  count,
  lifecycleStatus,
  equipmentClass,
  onClose,
  onSelectAsset,
}: StatDetailModalProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(lifecycleStatus ?? '');
  const [sortBy, setSortBy] = useState<'tag_number' | 'asset_class' | 'asset_type' | 'materials' | 'parent_floc' | 'status'>('tag_number');
  const [searchField, setSearchField] = useState<'tag_number' | 'class' | 'type' | 'material' | 'parent_floc' | 'status'>('tag_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const assetsQuery = useEquipmentAssets(
    {
      page,
      limit: MODAL_PAGE_SIZE,
      search,
      search_field: searchField,
      lifecycle_status: statusFilter || undefined,
      equipment_class: equipmentClass || undefined,
      sort_by: sortBy,
      sort_order: sortDirection,
    },
    open
  );
  const result = useMemo(() => unpackAssets(assetsQuery.data), [assetsQuery.data]);
  const assets = result.assets;
  const totalPages = Math.max(1, Math.ceil(result.total / MODAL_PAGE_SIZE));
  const handleBackdropMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  }, [onClose]);
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  }, []);
  const handleStatusChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPage(1);
  }, []);
  const handleSortByChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => setSortBy(event.target.value as typeof sortBy), []);
  const handleSearchFieldChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSearchField(event.target.value as typeof searchField);
    setPage(1);
  }, []);
  const handleSortDirectionToggle = useCallback(() => {
    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
  }, []);
  const handlePreviousPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);
  const handleNextPage = useCallback(() => {
    setPage((current) => Math.min(totalPages, current + 1));
  }, [totalPages]);
  const handleSelectAsset = useCallback((asset: EquipmentAssetRow) => {
    onSelectAsset?.(asset);
  }, [onSelectAsset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stat-detail-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Equipment Master metric
            </p>
            <h2 id="stat-detail-title" className="mt-1 text-xl font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{count.toLocaleString()} matching assets</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close asset details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4 sm:grid-cols-[minmax(220px,1fr)_160px_180px_180px] sm:px-8">
          <label className="relative">
          <span className="sr-only">Search matching assets</span>
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tag, type, material, FLOC, status..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>
          <label>
            <span className="sr-only">Search within column</span>
            <select value={searchField} onChange={handleSearchFieldChange} aria-label="Search within column" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option value="tag_number">Search: Tag Number</option><option value="class">Search: Class</option><option value="type">Search: Type</option><option value="material">Search: Material / Properties</option><option value="parent_floc">Search: Parent Funcloc</option><option value="status">Search: Status / Availability</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter lifecycle status</span>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="">All lifecycle statuses</option>
              <option value="Installed">Installed</option>
              <option value="Sent to repair">Sent to repair</option>
              <option value="Retired">Retired</option>
              <option value="Condemned">Condemned</option>
            </select>
          </label>
          <div className="flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Sort assets by</span>
              <select
                value={sortBy}
                onChange={handleSortByChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="tag_number">Sort: Tag Number</option>
                <option value="asset_class">Sort: Class</option>
                <option value="asset_type">Sort: Type</option>
                <option value="materials">Sort: Material / Properties</option>
                <option value="parent_floc">Sort: Parent Funcloc</option>
                <option value="status">Sort: Status</option>
              </select>
            </label>
            <button
              type="button"
              onClick={handleSortDirectionToggle}
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              className="rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              {sortDirection === 'asc' ? 'A–Z' : 'Z–A'}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
              <tr>
                {['Tag Number', 'Class', 'Type', 'Material / Properties', 'Parent Funcloc', 'Status / Availability'].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assetsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-500">
                    <LoaderCircle
                      className="mx-auto mb-2 animate-spin text-emerald-600"
                      size={22}
                    />
                    Loading matching assets…
                  </td>
                </tr>
              ) : assetsQuery.isError ? (
                <tr>
                  <td
                    colSpan={6}
                    role="alert"
                    className="px-6 py-14 text-center text-sm text-rose-600"
                  >
                    Unable to load matching assets.
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-500">
                    No assets match these filters.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className={`hover:bg-slate-50 ${onSelectAsset ? 'cursor-pointer' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{asset.tag_number ?? asset.tagNumber ?? asset.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.asset_class ?? asset.assetClass ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.asset_type ?? asset.assetType ?? asset.type ?? '—'}</td>
                    <td className="max-w-64 px-6 py-4 text-sm text-slate-600">{getMaterialProperties(asset)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.parent_floc ?? asset.functional_location_id ?? '—'}</td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-600">{(asset.lifecycle_status ?? asset.lifecycleStatus ?? asset.status ?? '—').replace(/_/g, ' ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 sm:px-8">
          <span className="text-xs text-slate-500">
            Showing {assets.length} of {result.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous modal page"
              disabled={page <= 1}
              onClick={handlePreviousPage}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next modal page"
              disabled={page >= totalPages}
              onClick={handleNextPage}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
});

export default StatDetailModal;
