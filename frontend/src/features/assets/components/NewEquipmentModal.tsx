import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  EQUIPMENT_LIFECYCLE_STATES,
  equipmentTypesForClass,
  type EquipmentClassOption,
} from '../data/equipmentTaxonomy';

export interface NewEquipmentPayload {
  tag_number: string;
  description?: string;
  serial_number?: string;
  manufacturer?: string;
  asset_class: string;
  asset_type?: string;
  commissioning_date?: string;
  lifecycle_status?: string;
  installation_date?: string;
  warranty_expiry?: string;
  last_major_overhaul?: string;
  drawings_references?: Record<string, string>;
}

export interface NewEquipmentModalProps {
  open: boolean;
  classes: EquipmentClassOption[];
  onClose: () => void;
  onSubmit: (payload: NewEquipmentPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

interface FormState {
  tagNumber: string;
  description: string;
  serialNumber: string;
  manufacturer: string;
  equipmentClass: string;
  equipmentType: string;
  commissionDate: string;
  lifecycleState: string;
  installationDate: string;
  warrantyExpiry: string;
  lastMajorOverhaul: string;
  drawingReference: string;
}

const EMPTY_FORM: FormState = {
  tagNumber: '',
  description: '',
  serialNumber: '',
  manufacturer: '',
  equipmentClass: '',
  equipmentType: '',
  commissionDate: '',
  lifecycleState: '',
  installationDate: '',
  warrantyExpiry: '',
  lastMajorOverhaul: '',
  drawingReference: '',
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const labelClass = 'block text-xs font-medium text-slate-600';
const inputClass =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15';

const NewEquipmentModal = ({
  open,
  classes,
  onClose,
  onSubmit,
  isSubmitting = false,
}: NewEquipmentModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setError('');
  }, [open]);

  const typeOptions = useMemo(
    () => equipmentTypesForClass(form.equipmentClass),
    [form.equipmentClass]
  );

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleClassChange = (value: string) => {
    setForm((current) => ({ ...current, equipmentClass: value, equipmentType: '' }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.tagNumber.trim()) {
      setError('Asset ID / Tag Number is required.');
      return;
    }
    if (!form.equipmentClass) {
      setError('Equipment Class is required.');
      return;
    }
    setError('');
    const drawingReference = form.drawingReference.trim();
    await onSubmit({
      tag_number: form.tagNumber.trim(),
      description: form.description.trim() || undefined,
      serial_number: form.serialNumber.trim() || undefined,
      manufacturer: form.manufacturer.trim() || undefined,
      asset_class: form.equipmentClass,
      asset_type: form.equipmentType || undefined,
      commissioning_date: form.commissionDate || undefined,
      lifecycle_status: form.lifecycleState || undefined,
      installation_date: form.installationDate || undefined,
      warranty_expiry: form.warrantyExpiry || undefined,
      last_major_overhaul: form.lastMajorOverhaul || undefined,
      drawings_references: drawingReference ? { pid_reference: drawingReference } : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-equipment-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Equipment Master
            </p>
            <h2 id="new-equipment-title" className="mt-1 text-xl font-bold text-slate-900">
              New Equipment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new equipment form"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {error && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <Section title="General Info">
              <label className={labelClass}>
                Asset ID / Tag Number <span className="text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={form.tagNumber}
                  onChange={(event) => update('tagNumber', event.target.value)}
                  placeholder="e.g. 12-V-1104"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Serial Number
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(event) => update('serialNumber', event.target.value)}
                  placeholder="e.g. SN-0098231"
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Brief functional description of this equipment…"
                  className={`${inputClass} min-h-[80px]`}
                />
              </label>
              <label className={labelClass}>
                Manufacturer
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(event) => update('manufacturer', event.target.value)}
                  placeholder="e.g. Sulzer"
                  className={inputClass}
                />
              </label>
            </Section>

            <Section title="Equipment Taxonomy">
              <label className={labelClass}>
                Equipment Class <span className="text-rose-500">*</span>
                <select
                  required
                  value={form.equipmentClass}
                  onChange={(event) => handleClassChange(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select equipment class…</option>
                  {classes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Equipment Type
                <select
                  value={form.equipmentType}
                  onChange={(event) => update('equipmentType', event.target.value)}
                  disabled={!form.equipmentClass || typeOptions.length === 0}
                  className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">
                    {form.equipmentClass
                      ? typeOptions.length > 0
                        ? 'Select equipment type…'
                        : 'No types for this class'
                      : 'Select a class first'}
                  </option>
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </Section>

            <Section title="Lifecycle & Status">
              <label className={labelClass}>
                Commission Date
                <input
                  type="date"
                  value={form.commissionDate}
                  onChange={(event) => update('commissionDate', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Lifecycle State
                <select
                  value={form.lifecycleState}
                  onChange={(event) => update('lifecycleState', event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select lifecycle state…</option>
                  {EQUIPMENT_LIFECYCLE_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Installation Date
                <input
                  type="date"
                  value={form.installationDate}
                  onChange={(event) => update('installationDate', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Warranty Expiry
                <input
                  type="date"
                  value={form.warrantyExpiry}
                  onChange={(event) => update('warrantyExpiry', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Last Major Overhaul
                <input
                  type="date"
                  value={form.lastMajorOverhaul}
                  onChange={(event) => update('lastMajorOverhaul', event.target.value)}
                  className={inputClass}
                />
              </label>
            </Section>

            <Section title="References">
              <label className={`${labelClass} sm:col-span-2`}>
                P&amp;ID Ref / Drawing No.
                <input
                  type="text"
                  value={form.drawingReference}
                  onChange={(event) => update('drawingReference', event.target.value)}
                  placeholder="e.g. P&ID-1200-A"
                  className={inputClass}
                />
              </label>
            </Section>
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save Equipment'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default NewEquipmentModal;
