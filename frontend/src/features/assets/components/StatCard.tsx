import { ArrowUpRight, Boxes } from 'lucide-react';

export interface StatCardProps {
  title: string;
  count: number;
  onClick: () => void;
  description?: string;
  isActive?: boolean;
}

const StatCard = ({ title, count, onClick, description, isActive = false }: StatCardProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${title}: ${count}`}
    className={`group w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
      isActive ? 'border-emerald-400 ring-2 ring-emerald-500/15' : 'border-slate-200'
    }`}
  >
    <span className="flex items-start justify-between gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Boxes aria-hidden="true" size={21} />
      </span>
      <ArrowUpRight
        aria-hidden="true"
        size={18}
        className="text-slate-300 transition-colors group-hover:text-emerald-600"
      />
    </span>
    <span className="mt-5 block text-sm font-semibold text-slate-500">{title}</span>
    <span className="mt-1 block text-3xl font-bold tracking-tight text-slate-900">
      {count.toLocaleString()}
    </span>
    {description && <span className="mt-2 block text-xs text-slate-400">{description}</span>}
  </button>
);

export default StatCard;
