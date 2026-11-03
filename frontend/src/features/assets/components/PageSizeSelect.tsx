// Shared "entries per page" selector used by the Equipment Master grid and the
// stat detail modal so both offer the same choices.
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface PageSizeSelectProps {
  value: number;
  onChange: (value: number) => void;
  /** Distinguishes the label when several selectors share a screen. */
  context?: string;
}

const PageSizeSelect = ({ value, onChange, context = 'table' }: PageSizeSelectProps) => (
  <label className="inline-flex items-center gap-2 text-xs text-slate-500">
    <span>Rows per page</span>
    <select
      aria-label={`Rows per page for ${context}`}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
    >
      {PAGE_SIZE_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default PageSizeSelect;
