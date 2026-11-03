import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FileText, LoaderCircle, X } from 'lucide-react';
import type { EquipmentAssetRow } from './AssetDataGrid';
import { componentTypesForClass } from '../data/componentTypes';

export interface AddComponentPayload {
  /** Parent asset ID the component belongs to. */
  asset_id: string | number;
  /** Required tag name, e.g. "01" — the component identity suffix. */
  name: string;
  /** Optional functional location, e.g. "TUBE-SECTION". */
  functional_location?: string;
  /** Optional free-text description. */
  description?: string;
  /** Required component type code, e.g. "shell", "tube_bundle". */
  component_type: string;
  /** Human-readable type label, mirrored into specifications for the UI. */
  component_type_label?: string;
  /**
   * Equipment class inherited from the parent asset. The component is a
   * Hierarchy Level 7 child and does not carry its own class, so it descends
   * the parent's class by default.
   */
  component_class?: string;
}

export interface AddComponentModalProps {
  open: boolean;
  /** Parent asset the component is attached to. */
  asset: EquipmentAssetRow | null;
  onClose: () => void;
  onSubmit: (payload: AddComponentPayload, asset: EquipmentAssetRow) => Promise<void> | void;
  isSubmitting?: boolean;
}

interface FormState {
  functionalLocation: string;
  tagName: string;
  description: string;
  componentType: string;
}

const EMPTY_FORM: FormState = {
  functionalLocation: '',
  tagName: '',
  description: '',
  componentType: '',
};

const labelClass = 'block text-xs font-medium text-slate-600';
const inputClass =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15';

const AddComponentModal = ({
  open,
  asset,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddComponentModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const parentTag = asset
    ? String(asset.tag_number ?? asset.tagNumber ?? asset.id)
    : '';
  const parentClass = String(
    asset?.asset_class ?? asset?.assetClass ?? asset?.asset_type ?? asset?.assetType ?? ''
  );

  const typeOptions = useMemo(() => componentTypesForClass(parentClass), [parentClass]);

  // Reset on open so a second component starts from a clean form.
  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setError('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open || !asset) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.tagName.trim()) {
      setError('Tag Name is required.');
      return;
    }
    if (!form.componentType) {
      setError('Component Type is required.');
      return;
    }
    setError('');
    const selectedType = typeOptions.find((option) => option.code === form.componentType);
    await onSubmit(
      {
        asset_id: asset.id,
        name: form.tagName.trim(),
        functional_location: form.functionalLocation.trim() || undefined,
        description: form.description.trim() || undefined,
        component_type: form.componentType,
        component_type_label: selectedType?.label,
        component_class: parentClass || undefined,
      },
      asset
    );
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
        aria-labelledby="add-component-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Equipment Master
            </p>
            <h2 id="add-component-title" className="mt-1 text-xl font-bold text-slate-900">
              Add Component to {parentTag}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add component form"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        {/* noValidate: the required attributes stay for semantics/AT, but the
            modal owns the messages so both missing fields report consistently. */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </p>
            )}

            <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileText size={15} aria-hidden="true" />
                </span>
                Component Identity
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Functional Location (Optional)
                  <input
                    type="text"
                    value={form.functionalLocation}
                    onChange={(event) => update('functionalLocation', event.target.value)}
                    placeholder="e.g., TUBE-SECTION"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Tag Name <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    required
                    value={form.tagName}
                    onChange={(event) => update('tagName', event.target.value)}
                    placeholder="e.g., 01"
                    className={inputClass}
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) => update('description', event.target.value)}
                    placeholder="Brief description of this component…"
                    className={`${inputClass} min-h-[80px]`}
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  Component Type (Asset Type Mapping) <span className="text-rose-500">*</span>
                  <select
                    required
                    value={form.componentType}
                    onChange={(event) => update('componentType', event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select component type…</option>
                    {typeOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {parentClass && (
                    <span className="mt-1 block text-[11px] font-normal text-slate-500">
                      Types for the parent class {parentClass}. The component inherits this class.
                    </span>
                  )}
                </label>
              </div>
            </section>
          </div>

          <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={15} className="animate-spin" />}
              Save Component
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default AddComponentModal;
