import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEquipmentAsset } from '../../api/assetQueries';
import { FileText, Image as ImageIcon, LoaderCircle, X } from 'lucide-react';
import type { EquipmentAssetRow } from '../AssetDataGrid';
import ManageAssetAccordion from './ManageAssetAccordion';
import ManageAssetImageTab from './ManageAssetImageTab';
import ManageAssetFileTab from './ManageAssetFileTab';
import ManageAssetRiskAnalysisTab from './ManageAssetRiskAnalysisTab';
import { FieldGrid } from './ManageAssetFieldControl';
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
  /**
   * Reports files dropped into the Image/File tabs so the page can toast them.
   * Fase 3 keeps them in local state only; nothing is uploaded.
   */
  onFilesAdded?: (files: File[], message: string) => void;
  /** Reports a Detail Specs "Apply" click (local-only, no request). */
  onSpecApplied?: (message: string) => void;
  /** Reports local-only actions from the File tab (external link added). */
  onNotify?: (message: string) => void;
}

const TAB_ICONS: Record<ManageAssetTab, typeof FileText> = {
  'Data Source': FileText,
  Image: ImageIcon,
  File: FileText,
};



const ManageAssetModal = ({
  open,
  asset,
  onClose,
  onSave,
  isSaving = false,
  onFilesAdded,
  onSpecApplied,
  onNotify,
}: ManageAssetModalProps) => {
  const [activeTab, setActiveTab] = useState<ManageAssetTab>('Data Source');
  const [activeSection, setActiveSection] = useState<DataSourceSection>('General Data');

  const { register, handleSubmit, reset, watch } = useForm<ManageAssetFormValues>({
    defaultValues: EMPTY_MANAGE_ASSET_FORM,
  });
  const values = watch();
  // Tracks which asset the detail prefill already applied, so a late response
  // cannot overwrite what the user has started typing.
  const prefilledAssetRef = useRef<string | number | null>(null);

  // Load the authoritative record when the modal opens so the form pre-fills
  // from the API (all columns plus parsed rbi_properties) rather than the row
  // snapshot the grid already holds.
  const detailQuery = useEquipmentAsset(open && asset ? asset.id : null);

  // Seed immediately from the row so the form is never blank.
  useEffect(() => {
    if (open && asset) {
      reset(manageAssetFormFromRow(asset));
      prefilledAssetRef.current = null;
    }
  }, [open, asset, reset]);

  // Overwrite with the fetched detail exactly once per opened asset.
  useEffect(() => {
    if (!open || !asset || !detailQuery.data) return;
    if (prefilledAssetRef.current === asset.id) return;
    prefilledAssetRef.current = asset.id;
    reset(manageAssetFormFromRow(detailQuery.data));
  }, [open, asset, detailQuery.data, reset]);

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
        <header className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4">
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
            {activeTab === 'Image' ? (
              <ManageAssetImageTab
                assetId={asset.id}
                tag={String(tag)}
                onFilesAdded={(added) =>
                  onFilesAdded?.(added, `Image added to ${tag}: ${added.length} file(s).`)
                }
                onError={onNotify}
              />
            ) : activeTab === 'File' ? (
              <ManageAssetFileTab
                assetId={asset.id}
                onFilesAdded={(added) =>
                  onFilesAdded?.(added, `File added to ${tag}: ${added.length} file(s).`)
                }
                onNotify={onNotify}
                onError={onNotify}
              />
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
                            onClick={() =>
                              onSpecApplied?.(
                                `${property} applied to ${tag} from the piping class master (staged locally).`
                              )
                            }
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
            ) : activeSection === 'Risk Analysis' ? (
              <ManageAssetRiskAnalysisTab
                tag={String(tag)}
                register={register}
                values={values}
                linkedData={detailQuery.data?.linked_data}
                isLoading={detailQuery.isLoading}
              />
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

          <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSaving && <LoaderCircle size={15} className="animate-spin" />}
              Save Data Source
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default ManageAssetModal;
