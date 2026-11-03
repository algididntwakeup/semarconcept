import { Flame, Layers, Wrench } from 'lucide-react';
import type { UseFormRegister } from 'react-hook-form';
import ManageAssetAccordion from './ManageAssetAccordion';
import { FieldGrid } from './ManageAssetFieldControl';
import { EQUIPMENT_INSPECTION_FIELDS, type ManageAssetFormValues } from './manageAssetFields';
import type { EquipmentLinkedData } from '../../../../services/assetServices';

export interface ManageAssetRiskAnalysisTabProps {
  /** Tag number shown alongside the linked-data header. */
  tag: string;
  /** Form binding so the inspection fields persist with the rest of the form. */
  register: UseFormRegister<ManageAssetFormValues>;
  values: ManageAssetFormValues;
  /**
   * Relational summary from the API. It may be null/undefined (asset has no
   * links) or carry an empty card list; both cases hide the whole area.
   */
  linkedData?: EquipmentLinkedData | null;
  /** True while the detail request is still in flight. */
  isLoading?: boolean;
}

/** Picks the header icon for a card from its key. */
const cardIcon = (key: string) => {
  if (key.includes('operating')) return <Flame size={16} className="text-amber-500" aria-hidden="true" />;
  if (key.includes('piping') || key.includes('design'))
    return <Wrench size={16} className="text-blue-600" aria-hidden="true" />;
  return <Layers size={16} className="text-slate-500" aria-hidden="true" />;
};

const ManageAssetRiskAnalysisTab = ({
  tag,
  register,
  values,
  linkedData,
  isLoading = false,
}: ManageAssetRiskAnalysisTabProps) => {
  // Null safety: the API omits linked_data entirely when nothing is linked.
  const cards = linkedData?.cards ?? [];
  const hasLinkedData = cards.length > 0;
  const fieldCount = cards.reduce((total, card) => total + (card.properties?.length ?? 0), 0);

  return (
    <section aria-label="Risk Analysis" className="space-y-5">
      {isLoading ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Loading linked data…
        </p>
      ) : hasLinkedData ? (
        <>
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Layers size={16} className="text-emerald-600" aria-hidden="true" />
              Available Linked Data
            </h3>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              {fieldCount} field(s) available
            </span>
          </header>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {cards.map((card) => (
              <article key={card.key} className="overflow-hidden rounded-xl border border-slate-200">
                <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  {cardIcon(card.key)}
                  <h4 className="text-sm font-semibold text-slate-800">{card.title}</h4>
                </header>
                <div className="space-y-3 px-4 py-4">
                  {card.subtitle && <p className="text-sm text-slate-600">{card.subtitle}</p>}
                  {card.properties.length === 0 ? (
                    <p className="text-xs italic text-slate-500">
                      No linked parameters available.
                    </p>
                  ) : (
                    <dl className="grid grid-cols-2 gap-3">
                      {card.properties.map((property) => (
                        <div key={property.label} className="rounded-lg bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {property.label}
                          </dt>
                          <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                            {property.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      <ManageAssetAccordion title="Equipment Inspection">
        <FieldGrid fields={EQUIPMENT_INSPECTION_FIELDS} register={register} values={values} />
      </ManageAssetAccordion>
    </section>
  );
};

export default ManageAssetRiskAnalysisTab;
