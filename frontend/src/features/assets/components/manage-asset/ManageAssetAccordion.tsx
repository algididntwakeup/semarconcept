import { useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';

export interface ManageAssetAccordionProps {
  title: string;
  /** Opens expanded by default. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Collapsible section for the Manage Asset form: light grey header with a green
 * minus/plus toggle on the right.
 */
const ManageAssetAccordion = ({
  title,
  defaultOpen = true,
  children,
}: ManageAssetAccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-200/70"
      >
        {title}
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
          aria-hidden="true"
        >
          {open ? <Minus size={13} /> : <Plus size={13} />}
        </span>
      </button>
      {open && <div className="px-4 py-4">{children}</div>}
    </section>
  );
};

export default ManageAssetAccordion;
