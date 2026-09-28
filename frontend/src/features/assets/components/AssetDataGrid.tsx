import { Eye, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import LifecycleDropdown, { type LifecycleAction } from './LifecycleDropdown';
import RowActions, { type AssetRowAction } from './RowActions';

export interface EquipmentAssetRow {
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
}

export interface AssetDataGridProps {
  assets: EquipmentAssetRow[];
  isLoading?: boolean;
  error?: string | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onView?: (asset: EquipmentAssetRow) => void;
  onAction?: (action: AssetRowAction, asset: EquipmentAssetRow) => void;
  onLifecycleChange?: (asset: EquipmentAssetRow, action: LifecycleAction) => Promise<void> | void;
  paginationSlot?: ReactNode;
  emptyMessage?: string;
}

const field = (...values: Array<string | number | null | undefined>) =>
  values
    .find((value) => value !== undefined && value !== null && String(value).trim() !== '')
    ?.toString() ?? '';

const AssetDataGrid = ({
  assets,
  isLoading = false,
  error,
  searchValue = '',
  onSearchChange,
  onView,
  onAction,
  onLifecycleChange,
  paginationSlot,
  emptyMessage = 'No equipment found.',
}: AssetDataGridProps) => (
  <section
    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    aria-label="Equipment register"
  >
    {onSearchChange && (
      <div className="border-b border-slate-100 p-4">
        <label className="relative block max-w-md">
          <span className="sr-only">Search equipment by tag number</span>
          <Search
            aria-hidden="true"
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tag number..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </label>
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
            Array.from({ length: 4 }, (_, index) => (
              <tr key={index} className="animate-pulse">
                <td colSpan={5} className="px-5 py-5">
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                </td>
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
              <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                {emptyMessage}
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
);

export default AssetDataGrid;
