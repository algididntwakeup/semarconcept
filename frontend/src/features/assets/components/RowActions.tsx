import { useEffect, useRef, useState } from 'react';
import { Clock3, Component, Ellipsis, Pencil, Settings2, Trash2 } from 'lucide-react';
import type { EquipmentAssetRow } from './AssetDataGrid';

export type AssetRowAction = 'manage' | 'add-component' | 'timeline' | 'edit' | 'delete';

interface RowActionsProps {
  asset: EquipmentAssetRow;
  onAction: (action: AssetRowAction, asset: EquipmentAssetRow) => void;
}

const actionItems: Array<{
  action: AssetRowAction;
  label: string;
  Icon: typeof Settings2;
  destructive?: boolean;
}> = [
  { action: 'manage', label: 'Manage asset', Icon: Settings2 },
  { action: 'add-component', label: 'Add component', Icon: Component },
  { action: 'timeline', label: 'View timeline', Icon: Clock3 },
  { action: 'edit', label: 'Edit', Icon: Pencil },
  { action: 'delete', label: 'Delete asset', Icon: Trash2, destructive: true },
];

const RowActions = ({ asset, onAction }: RowActionsProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Actions for ${asset.tag_number ?? asset.tagNumber ?? asset.id}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Asset actions"
          className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {actionItems.map(({ action, label, Icon, destructive }) => (
            <button
              key={action}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAction(action, asset);
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${destructive ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700'}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RowActions;
