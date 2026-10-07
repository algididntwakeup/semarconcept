import { Flame, Layers, Wrench } from 'lucide-react';
import ManageAssetAccordion from './ManageAssetAccordion';

export interface ManageAssetRiskAnalysisTabProps {
  /** Tag number shown alongside the linked-data header. */
  tag: string;
}

/**
 * Risk Analysis tab (Fase 4): read-only linked data from other entities plus a
 * small inspection form. Values are placeholders until the relational queries
 * are wired.
 */

/** Read-only properties shown by the Design & Material card. */
const DESIGN_MATERIAL_PROPERTIES: Array<{ label: string; value: string }> = [
  { label: 'Corrosion Allowance', value: '1.6' },
  { label: 'Pipe Schedule', value: 'SCH160' },
  { label: 'Rating Class', value: '150#RF' },
  { label: 'Nominal Pipe Size', value: '1' },
];

const EQUIPMENT_STATUS_OPTIONS = [
  'In Service',
  'Out of Service',
  'Standby',
  'Under Maintenance',
  'Decommissioned',
] as const;

const ManageAssetRiskAnalysisTab = ({ tag }: ManageAssetRiskAnalysisTabProps) => (
  <section aria-label="Risk Analysis" className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Layers size={16} className="text-emerald-600" aria-hidden="true" />
        Available Linked Data
      </h3>
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
        12 field(s) available
      </span>
    </header>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article className="overflow-hidden rounded-xl border border-slate-200">
        <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <Flame size={16} className="text-amber-500" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-slate-800">
            Operating Conditions (Stream INSTRUMENT AIR • daily)
          </h4>
        </header>
        <div className="space-y-3 px-4 py-4">
          <div className="space-y-1 rounded-lg bg-slate-100 px-3 py-3 text-sm">
            <p className="font-bold text-slate-800">System: Corrosion System #02-63…</p>
            <p className="font-bold text-slate-800">Circuit: CC #07-02-63…</p>
          </div>
          <p className="text-xs italic text-slate-500">
            No operating parameters available for this scenario.
          </p>
        </div>
      </article>

      <article className="overflow-hidden rounded-xl border border-slate-200">
        <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <Wrench size={16} className="text-blue-600" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-slate-800">Design &amp; Material</h4>
        </header>
        <div className="space-y-3 px-4 py-4">
          <p className="text-sm text-slate-600">
            Source: <span className="font-semibold text-slate-800">Piping Class Master</span>
          </p>
          <dl className="grid grid-cols-2 gap-3">
            {DESIGN_MATERIAL_PROPERTIES.map((property) => (
              <div key={property.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {property.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">{property.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </div>

    <ManageAssetAccordion title="Equipment Inspection">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-xs font-medium text-slate-600">
          Equipment Status
          <select
            aria-label="Equipment Status"
            defaultValue=""
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Select equipment status…</option>
            {EQUIPMENT_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="space-y-1 text-xs font-medium text-slate-600">
          <legend>Enable Interval Based Inspection</legend>
          <div className="mt-1 flex gap-4">
            {['YES', 'NO'].map((option) => (
              <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name={`interval-based-inspection-${tag}`}
                  value={option}
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </ManageAssetAccordion>
  </section>
);

export default ManageAssetRiskAnalysisTab;
