import { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, Network, Search, X } from 'lucide-react';
import type { EquipmentAssetRow } from './AssetDataGrid';

/** Actions that place the asset into the hierarchy and need a location pick. */
export type LifecyclePlacementAction = 'Install' | 'Relocate';

export interface LifecycleActionModalProps {
  open: boolean;
  action: LifecyclePlacementAction;
  asset: EquipmentAssetRow | null;
  onClose: () => void;
  /** Called with the chosen location code once the user confirms. */
  onConfirm: (action: LifecyclePlacementAction, asset: EquipmentAssetRow, location: string) => void;
}

const TITLES: Record<LifecyclePlacementAction, string> = {
  Install: 'Install Equipment to Hierarchy',
  Relocate: 'Relocate Equipment',
};

const DESCRIPTIONS: Record<LifecyclePlacementAction, string> = {
  Install: 'Choose the functional location where this equipment will be installed.',
  Relocate: 'Choose the functional location this equipment will move to.',
};

// Placeholder location list until the hierarchy picker is wired to the API.
// Selecting a node only fills the active selection; no request is sent yet.
const PLACEHOLDER_LOCATIONS = [
  { code: 'JI-JL-AG-11-PW', description: 'Produced Water System' },
  { code: 'JI-JL-AG-11-IS', description: 'Inlet Separation' },
  { code: 'JI-JL-AG-12-ECTB', description: 'Electrical Control Building' },
  { code: 'JI-JL-AG-68-WS', description: 'Well Site' },
];

const LifecycleActionModal = ({
  open,
  action,
  asset,
  onClose,
  onConfirm,
}: LifecycleActionModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedLocation('');
    }
  }, [open, action]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  const tag = asset?.tag_number ?? asset?.tagNumber ?? asset?.id ?? '';
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PLACEHOLDER_LOCATIONS;
    return PLACEHOLDER_LOCATIONS.filter(
      (node) =>
        node.code.toLowerCase().includes(query) || node.description.toLowerCase().includes(query)
    );
  }, [search]);

  if (!open || !asset) return null;

  const ActionIcon = action === 'Install' ? MapPin : Network;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lifecycle-action-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="lifecycle-action-title"
              className="flex items-center gap-2 text-lg font-semibold text-slate-900"
            >
              <ActionIcon size={18} className="text-emerald-600" aria-hidden="true" />
              {TITLES[action]}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{tag}</p>
            <p className="mt-1 text-xs text-slate-500">{DESCRIPTIONS[action]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto px-6 py-5">
          <label className="relative block">
            <span className="sr-only">Search Functional Location</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Functional Location..."
              aria-label="Search Functional Location"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </label>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active Selection
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {selectedLocation ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                  <Check size={14} aria-hidden="true" />
                  {selectedLocation}
                </span>
              ) : (
                'Click a node below to select'
              )}
            </p>
          </div>

          <ul className="max-h-56 divide-y divide-slate-100 overflow-auto rounded-xl border border-slate-200">
            {matches.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                No functional locations match “{search.trim()}”.
              </li>
            ) : (
              matches.map((node) => {
                const isActive = selectedLocation === node.code;
                return (
                  <li key={node.code}>
                    <button
                      type="button"
                      onClick={() => setSelectedLocation(node.code)}
                      aria-pressed={isActive}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                        isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>
                        <span className="block font-mono text-xs font-semibold text-slate-700">
                          {node.code}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {node.description}
                        </span>
                      </span>
                      {isActive && <Check size={16} className="text-emerald-600" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(action, asset, selectedLocation)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Confirm {action}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default LifecycleActionModal;
