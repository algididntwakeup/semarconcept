import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Ban,
  ChevronDown,
  History,
  MapPin,
  Network,
  Package,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
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

interface ManageItemConfig {
  action: AssetRowAction;
  label: string;
  icon: typeof Settings;
  iconColor: string;
  destructive?: boolean;
}

const manageItems: ManageItemConfig[] = [
  { action: 'manage', label: 'Manage Asset', icon: Settings, iconColor: 'text-slate-500' },
  { action: 'add-component', label: 'Add Component', icon: Plus, iconColor: 'text-slate-500' },
  { action: 'timeline', label: 'View Timeline', icon: History, iconColor: 'text-slate-500' },
  { action: 'edit', label: 'Edit Asset', icon: Pencil, iconColor: 'text-blue-500' },
  { action: 'delete', label: 'Delete Asset', icon: Trash2, iconColor: 'text-rose-500', destructive: true },
];

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface MenuCoordinates {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  isDropUp: boolean;
}

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
  const [coords, setCoords] = useState<MenuCoordinates>({ isDropUp: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1200;

    const menuHeight = menuRef.current?.offsetHeight || 220;
    const menuWidth = menuRef.current?.offsetWidth || 192;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Dynamic Positioning:
    // If not enough space below (< menuHeight + 12px) and more space above, open upwards (drop-up).
    const isDropUp = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

    // Horizontal bounds: align right edge of menu to right edge of button.
    let right: number | undefined = viewportWidth - rect.right;
    let left: number | undefined = undefined;

    if (right < 8) {
      right = 8;
    } else if (rect.right < menuWidth + 8) {
      // If aligning to right causes menu to clip on the left, align left
      left = Math.max(8, rect.left);
      right = undefined;
    }

    if (isDropUp) {
      setCoords({
        bottom: viewportHeight - rect.top + 6,
        right,
        left,
        isDropUp: true,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        right,
        left,
        isDropUp: false,
      });
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, updatePosition]);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          open
            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
        }`}
      >
        {label}
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={ariaLabel}
            data-placement={coords.isDropUp ? 'top' : 'bottom'}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
            }}
            className="z-[100] w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5"
          >
            {children(() => setOpen(false))}
          </div>,
          document.body
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
            {manageItems.map(({ action, label, icon: Icon, iconColor, destructive }, index) => (
              <div key={action}>
                {destructive && index > 0 && <div className="my-1 border-t border-slate-100" />}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    close();
                    onManage?.(action, asset);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                    destructive
                      ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:outline-none'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:outline-none'
                  }`}
                >
                  <Icon size={15} className={iconColor} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              </div>
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
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:outline-none"
              >
                <Icon size={15} className={lifecycleToneClass[tone]} aria-hidden="true" />
                <span>{action}</span>
              </button>
            ))}
          </>
        )}
      </RowDropdown>
    </div>
  );
};

export default RowActions;
