import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { EquipmentAssetRow } from './AssetDataGrid';

/** Simple, non-placement lifecycle actions that only need a confirmation. */
export type LifecycleConfirmAction = 'Uninstall' | 'Send to repair' | 'Retire' | 'Condemn';

export interface LifecycleConfirmModalProps {
  open: boolean;
  action: LifecycleConfirmAction;
  asset: EquipmentAssetRow | null;
  onClose: () => void;
  onConfirm: (action: LifecycleConfirmAction, asset: EquipmentAssetRow) => void;
}

const LifecycleConfirmModal = ({
  open,
  action,
  asset,
  onClose,
  onConfirm,
}: LifecycleConfirmModalProps) => {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open || !asset) return null;

  const tag = asset.tag_number ?? asset.tagNumber ?? asset.id;

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
        aria-labelledby="lifecycle-confirm-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start gap-3 px-6 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 id="lifecycle-confirm-title" className="text-base font-semibold text-slate-900">
              Are you sure you want to {action.toLowerCase()} this asset?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{tag}</span> will be marked as{' '}
              {action.toLowerCase()}.
            </p>
          </div>
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
            onClick={() => onConfirm(action, asset)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Confirm
          </button>
        </footer>
      </section>
    </div>
  );
};

export default LifecycleConfirmModal;
