import { useState } from 'react';
import { Check, ChevronDown, LoaderCircle } from 'lucide-react';

const lifecycleActions = [
  { value: 'Install', label: 'Install' },
  { value: 'Send to repair', label: 'Send to repair' },
  { value: 'Retire', label: 'Retire' },
  { value: 'Condemn', label: 'Condemn' },
] as const;

export type LifecycleAction = (typeof lifecycleActions)[number]['value'];

interface LifecycleDropdownProps {
  currentStatus?: string | null;
  disabled?: boolean;
  onChange: (action: LifecycleAction) => Promise<void> | void;
}

const LifecycleDropdown = ({
  currentStatus,
  disabled = false,
  onChange,
}: LifecycleDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAction = async (action: LifecycleAction) => {
    setPending(true);
    setError('');
    setSuccess('');
    try {
      await onChange(action);
      setSuccess(`${action} status saved`);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update lifecycle status');
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="relative inline-flex flex-col items-start"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled || pending}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex max-w-40 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium capitalize text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60"
      >
        {pending && <LoaderCircle size={13} className="animate-spin" />}
        <span className="truncate">{currentStatus || 'Lifecycle'}</span>
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Change lifecycle"
          className="absolute left-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {lifecycleActions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="menuitem"
              disabled={pending}
              onClick={() => void handleAction(value)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50"
            >
              {label}
              {currentStatus?.toLowerCase() === label.toLowerCase() && (
                <Check size={14} aria-label="Current status" />
              )}
            </button>
          ))}
        </div>
      )}
      {error && (
        <span
          role="alert"
          className="absolute top-full mt-1 w-48 rounded bg-rose-50 p-1.5 text-left text-[11px] text-rose-700"
        >
          {error}
        </span>
      )}
      {success && (
        <span role="status" className="sr-only">
          {success}
        </span>
      )}
    </div>
  );
};

export default LifecycleDropdown;
