import { useEffect, useState } from 'react';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { FileText, Image as ImageIcon, LoaderCircle, X } from 'lucide-react';
import type { EquipmentAssetRow } from '../AssetDataGrid';
import ManageAssetAccordion from './ManageAssetAccordion';
import {
  DATA_SOURCE_SECTIONS,
  DETAIL_SPEC_PROPERTIES,
  EMPTY_MANAGE_ASSET_FORM,
  EQUIPMENT_DESIGN_FIELDS,
  EQUIPMENT_FLUID_DEFINITION_FIELDS,
  EQUIPMENT_REFERENCE_FIELDS,
  FLUID_DEFINITION_FIELDS,
  FLUID_INVENTORY_FIELDS,
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

/** A single labelled control driven by the field catalog. */
const FieldControl = ({
  field,
  register,
  value,
  disabled = false,
}: {
  field: ManageAssetField;
  register: UseFormRegister<ManageAssetFormValues>;
  /** Current value, used by disabledWhenFilled and the radio group. */
  value?: string;
  disabled?: boolean;
}) => {
  const isDisabled = field.readOnly || disabled || (field.disabledWhenFilled && !!value?.trim());
  const spanClass = field.multiline || field.input === 'radio' ? 'sm:col-span-2' : '';

  if (field.input === 'radio') {
    return (
      <fieldset className={`${labelClass} ${spanClass}`}>
        <legend className="text-xs font-medium text-slate-600">{field.label}</legend>
        <div className="mt-1 flex gap-4">
          {(field.options ?? []).map((option) => (
            <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                value={option}
                disabled={isDisabled}
                className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register(field.name)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.input === 'select') {
    return (
      <label className={`${labelClass} ${spanClass}`}>
        {field.label}
        <select disabled={isDisabled} className={inputClass} {...register(field.name)}>
          <option value="">Select {field.label.toLowerCase()}…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.multiline) {
    return (
      <label className={`${labelClass} ${spanClass}`}>
        {field.label}
        <textarea
          rows={3}
          disabled={isDisabled}
          placeholder={field.placeholder}
          className={inputClass}
          {...register(field.name)}
        />
      </label>
    );
  }

  return (
    <label className={`${labelClass} ${spanClass}`}>
      {field.label}
      <input
        type={field.input === 'number' ? 'number' : field.input === 'date' ? 'date' : 'text'}
        disabled={isDisabled}
        placeholder={field.placeholder}
        className={inputClass}
        {...register(field.name)}
      />
    </label>
  );
};

/** Grid of fields bound to the form. */
const FieldGrid = ({
  fields,
  register,
  values,
}: {
  fields: ManageAssetField[];
  register: UseFormRegister<ManageAssetFormValues>;
  values: ManageAssetFormValues;
}) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {fields.map((field) => (
      <FieldControl
        key={field.name}
        field={field}
        register={register}
        value={values[field.name]}
        disabled={field.name === 'designEquipmentType'}
      />
    ))}
  </div>
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

  const { register, handleSubmit, reset, watch } = useForm<ManageAssetFormValues>({
    defaultValues: EMPTY_MANAGE_ASSET_FORM,
  });
  const values = watch();

  // Re-hydrate whenever the modal opens for a (different) asset.
  useEffect(() => {
    if (open && asset) reset(manageAssetFormFromRow(asset));
  }, [open, asset, reset]);

  useEffect(() => {
    if (open) {
      setActiveTab('Data Source');
      setActiveSection('General Data');
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

  const submit = handleSubmit(async (formValues) => {
    await onSave?.(manageAssetPayloadFromForm(formValues), asset);
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
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
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
              <section aria-label="General Data">
                <FieldGrid fields={GENERAL_DATA_FIELDS} register={register} values={values} />
              </section>
            ) : activeSection === 'Design Data' ? (
              <section aria-label="Design Data">
                <ManageAssetAccordion title="Equipment Design">
                  <FieldGrid
                    fields={EQUIPMENT_DESIGN_FIELDS}
                    register={register}
                    values={values}
                  />
                </ManageAssetAccordion>
              </section>
            ) : activeSection === 'Operating Data' ? (
              <section aria-label="Operating Data" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-5">
                  <ManageAssetAccordion title="Fluid Inventory">
                    <FieldGrid
                      fields={FLUID_INVENTORY_FIELDS}
                      register={register}
                      values={values}
                    />
                  </ManageAssetAccordion>
                  <ManageAssetAccordion title="Equipment Fluid Definition">
                    <FieldGrid
                      fields={EQUIPMENT_FLUID_DEFINITION_FIELDS}
                      register={register}
                      values={values}
                    />
                  </ManageAssetAccordion>
                </div>
                <div className="space-y-5">
                  <ManageAssetAccordion title="Fluid Definition">
                    <FieldGrid
                      fields={FLUID_DEFINITION_FIELDS}
                      register={register}
                      values={values}
                    />
                  </ManageAssetAccordion>
                  <ManageAssetAccordion title="Detail Specs">
                    <ul className="divide-y divide-slate-100">
                      {DETAIL_SPEC_PROPERTIES.map((property) => (
                        <li
                          key={property}
                          className="flex items-center justify-between gap-3 py-2"
                        >
                          <span className="text-sm text-slate-700">{property}</span>
                          <button
                            type="button"
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Apply
                          </button>
                        </li>
                      ))}
                    </ul>
                  </ManageAssetAccordion>
                </div>
              </section>
            ) : activeSection === 'Other Data' ? (
              <section aria-label="Other Data">
                <ManageAssetAccordion title="Equipment References">
                  <FieldGrid
                    fields={EQUIPMENT_REFERENCE_FIELDS}
                    register={register}
                    values={values}
                  />
                </ManageAssetAccordion>
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
