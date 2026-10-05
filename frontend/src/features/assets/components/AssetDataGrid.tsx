import { Search, X } from 'lucide-react';
import { memo, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import type { EquipmentAsset } from '../../../services/assetServices';
import { classWithCode, typeWithCode, typeWithDashCode } from '../data/equipmentDisplayCodes';
import RowActions, {
  type AssetLifecycleMenuAction,
  type AssetRowAction,
} from './RowActions';

export type EquipmentAssetRow = EquipmentAsset;

export interface AssetDataGridProps {
  assets: EquipmentAssetRow[];
  isLoading?: boolean;
  error?: string | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAction?: (action: AssetRowAction, asset: EquipmentAssetRow) => void;
  onLifecycleAction?: (
    action: AssetLifecycleMenuAction,
    asset: EquipmentAssetRow
  ) => Promise<void> | void;
  lifecycleFilter?: string;
  onLifecycleFilterChange?: (status: string) => void;
  /** Download only the checked rows. */
  onExportSelected?: (assetIds: Array<string | number>) => void;
  /** Soft-delete the checked rows. */
  onDeleteSelected?: (assetIds: Array<string | number>) => void;
  isExportingSelected?: boolean;
  isDeletingSelected?: boolean;
  paginationSlot?: ReactNode;
  toolbarSlot?: ReactNode;
  bannerSlot?: ReactNode;
  emptyMessage?: string;
  onClearSearch?: () => void;
}

const field = (...values: Array<string | number | null | undefined>) =>
  values
    .find((value) => value !== undefined && value !== null && String(value).trim() !== '')
    ?.toString() ?? '';

const rowKey = (asset: EquipmentAssetRow) => String(asset.id);

const AssetDataGrid = memo(({
  assets,
  isLoading = false,
  error,
  searchValue = '',
  onSearchChange,
  onAction,
  onLifecycleAction,
  lifecycleFilter = '',
  onLifecycleFilterChange,
  onExportSelected,
  onDeleteSelected,
  isExportingSelected = false,
  isDeletingSelected = false,
  paginationSlot,
  toolbarSlot,
  bannerSlot,
  emptyMessage,
  onClearSearch,
}: AssetDataGridProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Only keep selections that are still visible on the current page.
  const visibleIds = useMemo(() => assets.map(rowKey), [assets]);
  const selectedVisible = useMemo(
    () => selectedIds.filter((id) => visibleIds.includes(id)),
    [selectedIds, visibleIds]
  );
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  const toggleOne = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const hasSelection = selectedVisible.length > 0;
  const showSelectionBar = hasSelection && (onExportSelected || onDeleteSelected);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-label="Equipment register"
    >
      {bannerSlot && <div className="space-y-3 border-b border-slate-100 p-4">{bannerSlot}</div>}
      {(onSearchChange || onLifecycleFilterChange || toolbarSlot) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {onSearchChange && (
              <label className="relative block max-w-md flex-1">
                <span className="sr-only">Search equipment by tag number</span>
                <Search
                  aria-hidden="true"
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchValue}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
                  placeholder="Search tag number..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </label>
            )}
            {onLifecycleFilterChange && (
              <label>
                <span className="sr-only">Filter equipment by status</span>
                <select
                  aria-label="Filter equipment by status"
                  value={lifecycleFilter}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => onLifecycleFilterChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:w-52"
                >
                  <option value="">All statuses</option>
                  <option value="Installed">Installed</option>
                  <option value="Available">Available</option>
                  <option value="Sent to repair">Sent to repair</option>
                  <option value="Retired">Retired</option>
                  <option value="Condemned">Condemned</option>
                </select>
              </label>
            )}
          </div>
          {toolbarSlot && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{toolbarSlot}</div>}
        </div>
      )}
      {showSelectionBar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-emerald-100 bg-emerald-50/70 px-4 py-2.5">
          <span className="text-sm font-medium text-emerald-900">
            {selectedVisible.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {onExportSelected && (
              <button
                type="button"
                disabled={isExportingSelected}
                onClick={() => onExportSelected(selectedVisible)}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                {isExportingSelected ? 'Exporting…' : 'Download selected'}
              </button>
            )}
            {onDeleteSelected && (
              <button
                type="button"
                disabled={isDeletingSelected}
                onClick={() => onDeleteSelected(selectedVisible)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
              >
                {isDeletingSelected ? 'Removing…' : 'Remove selected'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th scope="col" className="w-12 px-5 py-4">
                <input
                  type="checkbox"
                  aria-label="Select all equipment on this page"
                  checked={allSelected}
                  disabled={visibleIds.length === 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              {['Tag Number / Equipment', 'Description', 'Class / Type', 'Status', 'Action'].map(
                (column) => (
                  <th
                    key={column}
                    scope="col"
                    className={`px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 ${column === 'Action' ? 'text-right' : ''}`}
                  >
                    {column}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index} className="animate-pulse" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((column) => (
                    <td key={column} className="px-5 py-5">
                      <div className={`h-4 rounded bg-slate-100 ${column === 1 ? 'w-32' : 'w-24'}`} />
                      {column === 1 && <div className="mt-2 h-3 w-24 rounded bg-slate-50" />}
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} role="alert" className="px-5 py-12 text-center text-sm text-rose-600">
                  {error}
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12">
                  <div className="mx-auto flex max-w-md flex-col items-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Search size={26} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      {emptyMessage ?? (searchValue.trim() ? 'No matching equipment found' : 'No equipment registered yet')}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchValue.trim()
                        ? `We couldn't find equipment matching “${searchValue.trim()}”. Check the tag number or clear your search.`
                        : 'Equipment matching the selected filters will appear here.'}
                    </p>
                    {searchValue.trim() && onClearSearch && (
                      <button
                        type="button"
                        onClick={onClearSearch}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <X size={15} aria-hidden="true" />
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const key = rowKey(asset);
                const tag = field(asset.tag_number, asset.tagNumber, asset.id);
                const assetClass = field(asset.asset_class, asset.assetClass);
                const assetType = field(asset.asset_type, asset.assetType, asset.type);
                const status = field(
                  asset.lifecycle_status,
                  asset.lifecycleStatus,
                  asset.status
                ).replace(/_/g, ' ');
                const isInstalled = status.toLowerCase() === 'installed';
                return (
                  <tr key={asset.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${tag}`}
                        checked={selectedIds.includes(key)}
                        onChange={() => toggleOne(key)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{tag}</div>
                      {assetType && (
                        <div className="mt-0.5 text-xs text-emerald-700">
                          {typeWithDashCode(assetType)}
                        </div>
                      )}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
                      {field(asset.description) || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-700">
                        {assetClass ? classWithCode(assetClass) : 'Unclassified'}
                      </div>
                      {assetType && (
                        <div className="mt-0.5 text-xs text-slate-400">{typeWithCode(assetType)}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {status ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isInstalled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {status}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <RowActions
                        asset={asset}
                        onManage={onAction}
                        onLifecycle={onLifecycleAction}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {paginationSlot && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">{paginationSlot}</div>
      )}
    </section>
  );
});

export default AssetDataGrid;
