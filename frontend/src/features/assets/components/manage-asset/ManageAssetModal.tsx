import { useEffect, useState } from 'react';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { ChevronDown, FileText, Image as ImageIcon, LoaderCircle, X } from 'lucide-react';
import type { EquipmentAssetRow } from '../AssetDataGrid';
import {
  DATA_SOURCE_SECTIONS,
  EMPTY_MANAGE_ASSET_FORM,
  EQUIPMENT_REFERENCE_FIELDS,
  GENERAL_DATA_FIELDS,
  MANAGE_ASSET_TABS,
  manageAssetFormFromRow,
  manageAssetPayloadFromForm,
  type DataSourceSection,
  type ManageAssetField,
  type ManageAssetFormValues,
  type ManageAssetTab,
} from './manageAssetFields';

export interface ManageAssetModalProps {
  open: boolean;
  asset: EquipmentAssetRow | null;
  onClose: () => void;
  /** Receives the split payload (asset columns + rbi_properties) on save. */
  onSave?: (
    payload: { columns: Record<string, string>; rbiProperties: Record<string, string> },
    asset: EquipmentAssetRow
  ) => Promise<void> | void;
  isSaving?: boolean;
}

const TAB_ICONS: Record<ManageAssetTab, typeof FileText> = {
  'Data Source': FileText,
  Image: ImageIcon,
  File: FileText,
};

const labelClass = 'block space-y-1 text-xs font-medium text-slate-600';
const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-slate-100 disabled:text-slate-500';

/** A single labelled input driven by the field catalog. */
const FieldInput = ({
  field,
  register,
}: {
  field: ManageAssetField;
  register: UseFormRegister<ManageAssetFormValues>;
}) => (
  <label className={field.multiline ? `${labelClass} sm:col-span-2` : labelClass}>
    {field.label}
    {field.multiline ? (
      <textarea
        rows={3}
        readOnly={field.readOnly}
        placeholder={field.placeholder}
        className={inputClass}
        {...register(field.name)}
      />
    ) : (
      <input
        readOnly={field.readOnly}
        placeholder={field.placeholder}
        className={inputClass}
        {...register(field.name)}
      />
    )}
  </label>
);

const ManageAssetModal = ({
  open,
  asset,
  onClose,
  onSave,
  isSaving = false,
}: ManageAssetModalProps) => {
  const [activeTab, setActiveTab] = useState<ManageAssetTab>('Data Source');
  const [activeSection, setActiveSection] = useState<DataSourceSection>('General Data');
  const [referencesOpen, setReferencesOpen] = useState(true);

  const { register, handleSubmit, reset } = useForm<ManageAssetFormValues>({
    defaultValues: EMPTY_MANAGE_ASSET_FORM,
  });

  // Re-hydrate whenever the modal opens for a (different) asset.
  useEffect(() => {
    if (open && asset) reset(manageAssetFormFromRow(asset));
  }, [open, asset, reset]);

  useEffect(() => {
    if (open) {
      setActiveTab('Data Source');
      setActiveSection('General Data');
      setReferencesOpen(true);
    }
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

  const tag = asset.tag_number ?? asset.tagNumber ?? asset.id;

  const submit = handleSubmit(async (values) => {
    await onSave?.(manageAssetPayloadFromForm(values), asset);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-asset-title"
        className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Manage Asset
            </p>
            <h2 id="manage-asset-title" className="mt-1 text-lg font-semibold text-slate-900">
              Manage Asset — {tag}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close manage asset"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </header>

        {/* Level 1 navigation: content type. */}
        <nav
          aria-label="Content type"
          className="flex flex-wrap gap-1 border-b border-slate-100 px-6 pt-3"
        >
          {MANAGE_ASSET_TABS.map((tab) => {
            const Icon = TAB_ICONS[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'Data Source' ? (
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon size={15} aria-hidden="true" />
                )}
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Level 2 navigation: only for Data Source. */}
        {activeTab === 'Data Source' && (
          <nav aria-label="Data category" className="flex flex-wrap gap-2 px-6 py-3">
            {DATA_SOURCE_SECTIONS.map((section) => (
              <button
                key={section}
                type="button"
                aria-pressed={activeSection === section}
                onClick={() => setActiveSection(section)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeSection === section
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        )}

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
            {activeTab !== 'Data Source' ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                {activeTab} uploads are planned for a later phase.
              </p>
            ) : activeSection === 'General Data' ? (
              <section aria-label="General Data" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {GENERAL_DATA_FIELDS.map((field) => (
                  <FieldInput key={field.name} field={field} register={register} />
                ))}
              </section>
            ) : activeSection === 'Other Data' ? (
              <section aria-label="Other Data" className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <button
                    type="button"
                    aria-expanded={referencesOpen}
                    onClick={() => setReferencesOpen((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    Equipment References
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${referencesOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {referencesOpen && (
                    <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2">
                      {EQUIPMENT_REFERENCE_FIELDS.map((field) => (
                        <FieldInput key={field.name} field={field} register={register} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                {activeSection} fields are planned for a later phase.
              </p>
            )}
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
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSaving && <LoaderCircle size={15} className="animate-spin" />}
              Save
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default ManageAssetModal;
