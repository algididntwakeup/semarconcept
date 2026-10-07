import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Ban, ChevronDown, Network, Package, MapPin, Wrench, X } from 'lucide-react';
import type { EquipmentAssetRow } from './AssetDataGrid';

export type AssetRowAction = 'manage' | 'add-component' | 'timeline' | 'edit' | 'delete';

/** Every lifecycle transition the row menu can offer. */
export const ASSET_LIFECYCLE_MENU_ACTIONS = [
  'Install',
  'Relocate',
  'Uninstall',
  'Send to repair',
  'Retire',
  'Condemn',
] as const;

export type AssetLifecycleMenuAction = (typeof ASSET_LIFECYCLE_MENU_ACTIONS)[number];

type LifecycleTone = 'green' | 'orange' | 'red' | 'blue';

const lifecycleToneClass: Record<LifecycleTone, string> = {
  green: 'text-emerald-600',
  orange: 'text-amber-600',
  red: 'text-rose-600',
  blue: 'text-blue-600',
};

// Available equipment can be installed; installed equipment can be relocated
// or removed. The menu is built from these lists so the options always match
// the asset's current status.
const lifecycleOptionsByState = {
  available: [
    { action: 'Install', icon: MapPin, tone: 'green' },
    { action: 'Send to repair', icon: Wrench, tone: 'orange' },
    { action: 'Retire', icon: Package, tone: 'orange' },
    { action: 'Condemn', icon: Ban, tone: 'red' },
  ],
  installed: [
    { action: 'Relocate', icon: Network, tone: 'blue' },
    { action: 'Uninstall', icon: X, tone: 'red' },
    { action: 'Send to repair', icon: Wrench, tone: 'orange' },
    { action: 'Retire', icon: Package, tone: 'orange' },
    { action: 'Condemn', icon: Ban, tone: 'red' },
  ],
} as const satisfies Record<
  'available' | 'installed',
  ReadonlyArray<{ action: AssetLifecycleMenuAction; icon: typeof MapPin; tone: LifecycleTone }>
>;

interface RowActionsProps {
  asset: EquipmentAssetRow;
  onManage?: (action: AssetRowAction, asset: EquipmentAssetRow) => void;
  onLifecycle?: (action: AssetLifecycleMenuAction, asset: EquipmentAssetRow) => void;
}

const manageItems: Array<{ action: AssetRowAction; label: string; destructive?: boolean }> = [
  { action: 'manage', label: 'Manage Asset' },
  { action: 'add-component', label: 'Add Component' },
  { action: 'timeline', label: 'View Timeline' },
  { action: 'edit', label: 'Edit Asset' },
  { action: 'delete', label: 'Delete', destructive: true },
];

const RowDropdown = ({
  label,
  ariaLabel,
  children,
}: {
  label: string;
  ariaLabel: string;
  children: (close: () => void) => ReactNode;
}) => {
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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {label}
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

const RowActions = ({ asset, onManage, onLifecycle }: RowActionsProps) => {
  const tag = asset.tag_number ?? asset.tagNumber ?? asset.id;
  const status = (asset.lifecycle_status ?? asset.lifecycleStatus ?? asset.status ?? '')
    .toString()
    .trim()
    .toLowerCase();
  const lifecycleOptions =
    status === 'installed' ? lifecycleOptionsByState.installed : lifecycleOptionsByState.available;

  return (
    <div className="flex items-center justify-end gap-2">
      <RowDropdown label="Manage" ariaLabel={`Manage ${tag}`}>
        {(close) => (
          <>
            {manageItems.map(({ action, label, destructive }) => (
              <button
                key={action}
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onManage?.(action, asset);
                }}
                className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${destructive ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </>
        )}
      </RowDropdown>
      <RowDropdown label="Lifecycle" ariaLabel={`Lifecycle ${tag}`}>
        {(close) => (
          <>
            {lifecycleOptions.map(({ action, icon: Icon, tone }) => (
              <button
                key={action}
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onLifecycle?.(action, asset);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Icon size={15} className={lifecycleToneClass[tone]} aria-hidden="true" />
                {action}
              </button>
            ))}
          </>
        )}
      </RowDropdown>
    </div>
  );
};

export default RowActions;
