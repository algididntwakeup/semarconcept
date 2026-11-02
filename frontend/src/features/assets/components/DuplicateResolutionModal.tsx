import { memo, useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  GitMerge,
  Info,
  LoaderCircle,
  X,
} from 'lucide-react';
import type { DuplicateTagGroup } from '../../../services/assetServices';

export interface DuplicateResolutionModalProps {
  open: boolean;
  groups: DuplicateTagGroup[];
  onClose: () => void;
  onResolve: (payload: { kept_asset_id: number; deleted_asset_ids: number[] }) => Promise<void>;
  onRevalidate?: () => Promise<void>;
}

const formatCreatedAt = (isoString?: string): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

const statusBadgeClass = (status?: string | null) => {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'installed' || s === 'operating') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  if (s === 'draft' || s === 'pending') {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }
  if (s === 'deleted' || s === 'decommissioned' || s === 'scrapped') {
    return 'bg-rose-100 text-rose-800 border-rose-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const DuplicateResolutionModal = memo(
  ({ open, groups, onClose, onResolve, onRevalidate }: DuplicateResolutionModalProps) => {
    const [localGroups, setLocalGroups] = useState<DuplicateTagGroup[]>(groups);
    const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});
    const [resolvingAssetId, setResolvingAssetId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Sync local groups when incoming groups change or modal opens
    useEffect(() => {
      setLocalGroups(groups);
      // Expand all groups by default
      const initialExpanded: Record<string, boolean> = {};
      groups.forEach((g) => {
        initialExpanded[g.tag_number] = true;
      });
      setExpandedTags(initialExpanded);
      setActionError(null);
      setResolvingAssetId(null);
    }, [groups, open]);

    const handleBackdropMouseDown = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && resolvingAssetId === null) {
          onClose();
        }
      },
      [onClose, resolvingAssetId]
    );

    const toggleGroup = useCallback((tagNumber: string) => {
      setExpandedTags((prev) => ({
        ...prev,
        [tagNumber]: !prev[tagNumber],
      }));
    }, []);

    const handleKeepAsset = useCallback(
      async (group: DuplicateTagGroup, keptAssetId: number) => {
        if (resolvingAssetId !== null) return;
        setActionError(null);
        setResolvingAssetId(keptAssetId);

        const deletedAssetIds = group.duplicates
          .filter((d) => d.id !== keptAssetId)
          .map((d) => d.id);

        try {
          await onResolve({
            kept_asset_id: keptAssetId,
            deleted_asset_ids: deletedAssetIds,
          });

          const remainingGroups = localGroups.filter((g) => g.tag_number !== group.tag_number);
          setLocalGroups(remainingGroups);

          if (onRevalidate) {
            await onRevalidate();
          }

          if (remainingGroups.length === 0) {
            onClose();
          }
        } catch (err) {
          setActionError(
            err instanceof Error ? err.message : 'Failed to resolve duplicate assets'
          );
        } finally {
          setResolvingAssetId(null);
        }
      },
      [localGroups, onResolve, onRevalidate, onClose, resolvingAssetId]
    );

    const totalDuplicatesCount = useMemo(() => {
      return localGroups.reduce((acc, g) => acc + g.duplicates.length, 0);
    }, [localGroups]);

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        onMouseDown={handleBackdropMouseDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-modal-title"
      >
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Copy size={14} aria-hidden="true" />
                <span>Maintenance · Duplicate Resolution</span>
              </div>
              <h2 id="duplicate-modal-title" className="mt-1 text-xl font-bold text-slate-900">
                Resolve Duplicate Equipment Tags
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {localGroups.length > 0 ? (
                  <>
                    Found{' '}
                    <span className="font-semibold text-slate-700">
                      {localGroups.length} duplicate tag group(s)
                    </span>{' '}
                    ({totalDuplicatesCount} total records). For each tag group, choose which asset
                    to retain.
                  </>
                ) : (
                  'All duplicate tag groups have been successfully resolved.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={resolvingAssetId !== null}
              aria-label="Close duplicate resolution modal"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </header>

          {/* Smart Merge Info */}
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:mx-8">
            <Info size={16} className="shrink-0 text-emerald-600" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-slate-800">Smart Merge:</strong> Missing
              properties in your kept asset will be safely filled using data from the deleted
              duplicates.
            </span>
          </div>

          {/* Error Banner */}
          {actionError && (
            <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
              <span className="font-semibold">Error:</span> {actionError}
            </div>
          )}

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
            {localGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No duplicates remaining</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  All duplicate equipment tags have been resolved cleanly. Your master equipment
                  database is up to date.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  Close Window
                </button>
              </div>
            ) : (
              localGroups.map((group) => {
                const isExpanded = expandedTags[group.tag_number] ?? true;
                return (
                  <section
                    key={group.tag_number}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
                    aria-label={`Duplicate group for tag ${group.tag_number}`}
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggleGroup(group.tag_number)}
                      className="flex w-full items-center justify-between gap-3 bg-slate-50/80 px-4 py-3.5 text-left transition hover:bg-slate-100/80"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {group.tag_number}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          {group.duplicates.length} duplicate records
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs font-medium text-slate-500">
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {/* Accordion Table Content */}
                    {isExpanded && (
                      <div className="overflow-x-auto border-t border-slate-200">
                        <table className="w-full min-w-[620px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              <th className="px-4 py-3">ID</th>
                              <th className="px-4 py-3">Asset Details</th>
                              <th className="px-4 py-3">Class / Type</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Created At</th>
                              <th className="px-4 py-3 text-right">Resolution Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.duplicates.map((asset) => {
                              const isThisResolving = resolvingAssetId === asset.id;
                              const isAnyResolving = resolvingAssetId !== null;

                              return (
                                <tr
                                  key={asset.id}
                                  className="transition-colors hover:bg-slate-50/60"
                                >
                                  {/* ID */}
                                  <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-slate-700">
                                    #{asset.id}
                                  </td>

                                  {/* Name / Description */}
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-slate-900">
                                      {asset.name || 'Unnamed Asset'}
                                    </div>
                                    {asset.description && (
                                      <div
                                        className="text-slate-500 line-clamp-1 max-w-xs text-[11px]"
                                        title={asset.description}
                                      >
                                        {asset.description}
                                      </div>
                                    )}
                                  </td>

                                  {/* Class / Type */}
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <div className="text-slate-800 font-medium">
                                      {asset.asset_class || '—'}
                                    </div>
                                    {asset.asset_type && (
                                      <div className="text-slate-500 text-[11px]">
                                        {asset.asset_type}
                                      </div>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <span
                                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${statusBadgeClass(
                                        asset.status || asset.lifecycle_status
                                      )}`}
                                    >
                                      {asset.status || asset.lifecycle_status || 'Active'}
                                    </span>
                                  </td>

                                  {/* Created At */}
                                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                    {formatCreatedAt(asset.created_at)}
                                  </td>

                                  {/* Action */}
                                  <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <button
                                      type="button"
                                      disabled={isAnyResolving}
                                      onClick={() => handleKeepAsset(group, asset.id)}
                                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
                                        isThisResolving
                                          ? 'bg-emerald-700 text-white cursor-wait'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed'
                                      }`}
                                      title="Keep this asset and safely merge missing properties from duplicates before removing them"
                                    >
                                      {isThisResolving ? (
                                        <>
                                          <LoaderCircle size={13} className="animate-spin" />
                                          <span>Merging...</span>
                                        </>
                                      ) : (
                                        <>
                                          <GitMerge size={13} strokeWidth={2.5} />
                                          <span>Keep &amp; Merge Data</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
            <p className="text-xs text-slate-500">
              * Resolving duplicates will soft-delete the unselected assets and automatically
              re-parent any attached components.
            </p>
            <button
              type="button"
              onClick={onClose}
              disabled={resolvingAssetId !== null}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
            >
              Close
            </button>
          </footer>
        </div>
      </div>
    );
  }
);

DuplicateResolutionModal.displayName = 'DuplicateResolutionModal';

export default DuplicateResolutionModal;

