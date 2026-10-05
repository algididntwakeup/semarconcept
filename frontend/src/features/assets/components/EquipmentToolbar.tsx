import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, FileDown, FileUp, Plus, Trash2, Wrench } from 'lucide-react';

export interface EquipmentToolbarProps {
  onDiagnoseDuplicates: () => void;
  onFixComponentLinks: () => void;
  onSyncComponentsToFLOC: () => void;
  onClearAllEquipment: () => void;
  onImport: () => void;
  onExport: (format: 'xlsx' | 'csv') => void;
  onNewEquipment: () => void;
  isMaintenancePending?: boolean;
  isImportPending?: boolean;
  isExportPending?: boolean;
  isPurging?: boolean;
}

interface DropdownMenuProps {
  label: string;
  ariaLabel: string;
  icon: ReactNode;
  tone: 'slate' | 'blue';
  disabled?: boolean;
  children: (close: () => void) => ReactNode;
}

const toneClasses: Record<'slate' | 'blue', string> = {
  slate: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  blue: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
};

const DropdownMenu = ({
  label,
  ariaLabel,
  icon,
  tone,
  disabled = false,
  children,
}: DropdownMenuProps) => {
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
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${toneClasses[tone]}`}
      >
        {icon}
        {label}
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

const menuItemClass =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50';

const EquipmentToolbar = ({
  onDiagnoseDuplicates,
  onFixComponentLinks,
  onSyncComponentsToFLOC,
  onClearAllEquipment,
  onImport,
  onExport,
  onNewEquipment,
  isMaintenancePending = false,
  isImportPending = false,
  isExportPending = false,
  isPurging = false,
}: EquipmentToolbarProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <DropdownMenu
      label="Maintenance"
      ariaLabel="Maintenance actions"
      icon={<Wrench size={16} aria-hidden="true" />}
      tone="slate"
      disabled={isMaintenancePending || isPurging}
    >
      {(close) => (
        <>
          <button
            type="button"
            role="menuitem"
            disabled={isMaintenancePending}
            onClick={() => {
              close();
              onDiagnoseDuplicates();
            }}
            className={menuItemClass}
          >
            Diagnose duplicates
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isMaintenancePending}
            onClick={() => {
              close();
              onFixComponentLinks();
            }}
            className={menuItemClass}
          >
            Fix component links
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isMaintenancePending}
            onClick={() => {
              close();
              onSyncComponentsToFLOC();
            }}
            className={menuItemClass}
          >
            Sync components to FLOC
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isPurging}
            onClick={() => {
              close();
              onClearAllEquipment();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden="true" />
            Clear All Equipment
          </button>
        </>
      )}
    </DropdownMenu>

    <DropdownMenu
      label="Data Transfer"
      ariaLabel="Data transfer"
      icon={<FileUp size={16} aria-hidden="true" />}
      tone="blue"
      disabled={isImportPending || isExportPending}
    >
      {(close) => (
        <>
          <button
            type="button"
            role="menuitem"
            disabled={isImportPending}
            onClick={() => {
              close();
              onImport();
            }}
            className={menuItemClass}
          >
            <FileUp size={15} aria-hidden="true" />
            {isImportPending ? 'Importing…' : 'Import'}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isExportPending}
            onClick={() => {
              close();
              onExport('xlsx');
            }}
            className={menuItemClass}
          >
            <FileDown size={15} aria-hidden="true" />
            Export XLSX
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isExportPending}
            onClick={() => {
              close();
              onExport('csv');
            }}
            className={menuItemClass}
          >
            <FileDown size={15} aria-hidden="true" />
            Export CSV
          </button>
        </>
      )}
    </DropdownMenu>

    <button
      type="button"
      onClick={onNewEquipment}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <Plus size={16} aria-hidden="true" />
      New Equipment
    </button>
  </div>
);

export default EquipmentToolbar;
