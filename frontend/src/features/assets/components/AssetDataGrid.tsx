import { Eye, Search, X } from 'lucide-react';
import { memo, type ChangeEvent, type ReactNode } from 'react';
import type { EquipmentAsset } from '../../../services/assetServices';
import LifecycleDropdown, { type LifecycleAction } from './LifecycleDropdown';
import RowActions, { type AssetRowAction } from './RowActions';

export type EquipmentAssetRow = EquipmentAsset;

export interface AssetDataGridProps {
  assets: EquipmentAssetRow[];
  isLoading?: boolean;
  error?: string | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onView?: (asset: EquipmentAssetRow) => void;
  onAction?: (action: AssetRowAction, asset: EquipmentAssetRow) => void;
  onLifecycleChange?: (asset: EquipmentAssetRow, action: LifecycleAction) => Promise<void> | void;
  lifecycleFilter?: string;
  onLifecycleFilterChange?: (status: string) => void;
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

const AssetDataGrid = memo(({
  assets,
  isLoading = false,
  error,
  searchValue = '',
  onSearchChange,
  onView,
  onAction,
  onLifecycleChange,
  lifecycleFilter = '',
  onLifecycleFilterChange,
  paginationSlot,
  toolbarSlot,
  bannerSlot,
  emptyMessage,
  onClearSearch,
}: AssetDataGridProps) => (
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
              <span className="sr-only">Filter equipment by lifecycle</span>
              <select
                aria-label="Filter equipment by lifecycle"
                value={lifecycleFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => onLifecycleFilterChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:w-52"
              >
                <option value="">All lifecycle statuses</option>
                <option value="Installed">Installed</option>
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {['Tag Number / Equipment', 'Description', 'Class / Type', 'Lifecycle', 'Actions'].map(
              (column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
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
                {[0, 1, 2, 3, 4].map((column) => (
                  <td key={column} className="px-5 py-5">
                    <div className={`h-4 rounded bg-slate-100 ${column === 0 ? 'w-32' : 'w-24'}`} />
                    {column === 0 && <div className="mt-2 h-3 w-24 rounded bg-slate-50" />}
                  </td>
                ))}
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={5} role="alert" className="px-5 py-12 text-center text-sm text-rose-600">
                {error}
              </td>
            </tr>
          ) : assets.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-12">
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
              const tag = field(asset.tag_number, asset.tagNumber, asset.id);
              const name = field(asset.name, tag);
              const assetClass = field(
                asset.asset_class,
                asset.assetClass,
                asset.asset_type,
                asset.assetType,
                asset.type
              );
              return (
                <tr key={asset.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{tag}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{name}</div>
                  </td>
                  <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
                    {field(asset.description) || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                      {assetClass.replace(/_/g, ' ') || 'Unclassified'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {onLifecycleChange ? (
                      <LifecycleDropdown
                        currentStatus={
                          asset.lifecycle_status ?? asset.lifecycleStatus ?? asset.status
                        }
                        onChange={(action) => onLifecycleChange(asset, action)}
                      />
                    ) : (
                      <span className="text-xs capitalize text-slate-500">
                        {(
                          asset.lifecycle_status ??
                          asset.lifecycleStatus ??
                          asset.status ??
                          '—'
                        ).replace(/_/g, ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView?.(asset)}
                        disabled={!onView}
                        aria-label={`View ${tag}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-default disabled:opacity-50"
                      >
                        <Eye size={17} />
                      </button>
                      {onAction && <RowActions asset={asset} onAction={onAction} />}
                    </div>
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
));

export default AssetDataGrid;
