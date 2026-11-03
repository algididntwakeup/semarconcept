import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { LoaderCircle, Pencil, Plus, RefreshCw, Tag, Trash2, X } from 'lucide-react';
import {
  useCreateEquipmentTaxonomyValue,
  useDeleteEquipmentTaxonomyValue,
  useEquipmentTaxonomy,
  useReapplyEquipmentTaxonomy,
  useUpdateEquipmentTaxonomyValue,
} from '../api/assetQueries';
import type { EquipmentTaxonomyValue } from '../../../services/assetServices';

export interface EquipmentTaxonomyModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Raw workbook values from the last import that matched no dictionary entry,
   * so the operator can map them without hunting through the file.
   */
  suggestedUnmapped?: { class: string[]; type: string[] };
  onNotify?: (message: string, tone: 'success' | 'error' | 'info') => void;
}

type Kind = 'class' | 'type';

interface FormState {
  id: number | null;
  kind: Kind;
  code: string;
  name: string;
  aliases: string;
  isActive: boolean;
}

const emptyForm = (kind: Kind): FormState => ({
  id: null,
  kind,
  code: '',
  name: '',
  aliases: '',
  isActive: true,
});

const splitAliases = (value: string): string[] =>
  value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30';
const labelClass = 'block space-y-1 text-xs font-semibold text-slate-600';

const KIND_LABEL: Record<Kind, string> = { class: 'Equipment Class', type: 'Equipment Type' };

const EquipmentTaxonomyModal = ({
  open,
  onClose,
  suggestedUnmapped,
  onNotify,
}: EquipmentTaxonomyModalProps) => {
  const taxonomyQuery = useEquipmentTaxonomy();
  const createValue = useCreateEquipmentTaxonomyValue();
  const updateValue = useUpdateEquipmentTaxonomyValue();
  const deleteValue = useDeleteEquipmentTaxonomyValue();
  const reapply = useReapplyEquipmentTaxonomy();

  const [activeKind, setActiveKind] = useState<Kind>('class');
  const [form, setForm] = useState<FormState>(emptyForm('class'));

  const values = taxonomyQuery.data ?? [];
  const classValues = useMemo(
    () => values.filter((value) => value.kind === 'class'),
    [values]
  );
  const typeValues = useMemo(
    () => values.filter((value) => value.kind === 'type'),
    [values]
  );
  const visibleValues = activeKind === 'class' ? classValues : typeValues;

  const suggestions = useMemo(() => {
    if (!suggestedUnmapped) return [] as { kind: Kind; raw: string }[];
    const known = new Set(
      values.flatMap((value) => value.aliases.map((alias) => alias.trim().toLowerCase()))
    );
    const pending: { kind: Kind; raw: string }[] = [];
    (['class', 'type'] as const).forEach((kind) => {
      const list = kind === 'class' ? suggestedUnmapped.class : suggestedUnmapped.type;
      list.forEach((raw) => {
        if (!known.has(raw.trim().toLowerCase())) pending.push({ kind, raw });
      });
    });
    return pending;
  }, [suggestedUnmapped, values]);

  useEffect(() => {
    if (open) {
      setForm(emptyForm('class'));
      setActiveKind('class');
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

  if (!open) return null;

  const startEdit = (value: EquipmentTaxonomyValue) => {
    setActiveKind(value.kind);
    setForm({
      id: value.id,
      kind: value.kind,
      code: value.canonical_code,
      name: value.canonical_name,
      aliases: value.aliases.join(', '),
      isActive: value.is_active,
    });
  };

  const startAdd = (kind: Kind, raw?: string) => {
    setActiveKind(kind);
    setForm({
      ...emptyForm(kind),
      // An unmapped code is a sensible starting point for the new mapping.
      code: kind === 'type' ? raw ?? '' : '',
      aliases: raw ? raw : '',
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const aliases = splitAliases(form.aliases);
    try {
      if (form.id === null) {
        await createValue.mutateAsync({
          kind: form.kind,
          canonical_code: form.code.trim(),
          canonical_name: form.name.trim(),
          aliases,
          is_active: form.isActive,
        });
        onNotify?.(`Added ${KIND_LABEL[form.kind]} ${form.code.trim().toUpperCase()}.`, 'success');
      } else {
        await updateValue.mutateAsync({
          id: form.id,
          payload: { canonical_name: form.name.trim(), aliases, is_active: form.isActive },
        });
        onNotify?.(`Updated ${KIND_LABEL[form.kind]} ${form.code}.`, 'success');
      }
      setForm(emptyForm(form.kind));
    } catch (error) {
      onNotify?.(error instanceof Error ? error.message : 'Unable to save mapping.', 'error');
    }
  };

  const handleDelete = async (value: EquipmentTaxonomyValue) => {
    const confirmed = window.confirm(
      `Remove ${KIND_LABEL[value.kind]} mapping ${value.canonical_code}? Imported assets keep their stored label.`
    );
    if (!confirmed) return;
    try {
      await deleteValue.mutateAsync(value.id);
      if (form.id === value.id) setForm(emptyForm(value.kind));
      onNotify?.(`Removed mapping ${value.canonical_code}.`, 'success');
    } catch (error) {
      onNotify?.(error instanceof Error ? error.message : 'Unable to remove mapping.', 'error');
    }
  };

  const saving = createValue.isPending || updateValue.isPending;

  const handleReapply = async () => {
    const confirmed = window.confirm(
      'Re-apply the dictionary to imported equipment? Stored class and type labels will be recomputed from each asset’s original workbook value.'
    );
    if (!confirmed) return;
    try {
      const result = await reapply.mutateAsync(false);
      const unmapped = result.unmapped_class.length + result.unmapped_type.length;
      onNotify?.(
        `Dictionary re-applied to ${result.updated_count} of ${result.checked_count} imported asset(s).` +
          (unmapped > 0 ? ` ${unmapped} value(s) still unmapped.` : ''),
        unmapped > 0 ? 'info' : 'success'
      );
    } catch (error) {
      onNotify?.(error instanceof Error ? error.message : 'Unable to re-apply the dictionary.', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="taxonomy-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="taxonomy-title" className="text-lg font-semibold text-slate-900">
              Import dictionary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Teach SEMAR how your workbook spells each class and type. Values are matched
              case-insensitively; anything not listed is kept as-is and reported after import.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import dictionary"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
          {suggestions.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Unmapped values from the last import
              </p>
              <p className="mt-1 text-xs text-amber-800">
                These cells were stored as-is. Map them so the next import groups them correctly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map(({ kind, raw }) => (
                  <button
                    key={`${kind}:${raw}`}
                    type="button"
                    onClick={() => startAdd(kind, raw)}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100"
                  >
                    <Plus size={12} />
                    {raw}
                    <span className="text-amber-600">({kind})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {(['class', 'type'] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    setActiveKind(kind);
                    setForm(emptyForm(kind));
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activeKind === kind
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {KIND_LABEL[kind]} ({(kind === 'class' ? classValues : typeValues).length})
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void handleReapply()}
              disabled={reapply.isPending}
              title="Recompute the class/type labels of imported equipment from their original workbook values"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {reapply.isPending ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Apply to equipment
            </button>
          </div>

          {taxonomyQuery.isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <LoaderCircle size={16} className="animate-spin" /> Loading dictionary…
            </div>
          ) : taxonomyQuery.isError ? (
            <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load the import dictionary.
            </p>
          ) : visibleValues.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              No {KIND_LABEL[activeKind].toLowerCase()} mappings yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visibleValues.map((value) => (
                <li key={value.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                        <Tag size={11} />
                        {value.canonical_code}
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        {value.canonical_name}
                      </span>
                      {!value.is_active && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {value.aliases.map((alias) => (
                        <span
                          key={alias}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(value)}
                      aria-label={`Edit ${value.canonical_code}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(value)}
                      aria-label={`Delete ${value.canonical_code}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-100 bg-slate-50/60 px-6 py-4"
        >
          <p className="mb-3 text-sm font-semibold text-slate-800">
            {form.id === null
              ? `Add ${KIND_LABEL[form.kind].toLowerCase()}`
              : `Edit ${form.code}`}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className={labelClass}>
              Code
              <input
                aria-label="Canonical code"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                disabled={form.id !== null}
                required
                maxLength={50}
                placeholder="e.g. PG"
                className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500`}
              />
            </label>
            <label className={labelClass}>
              Canonical name
              <input
                aria-label="Canonical name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                maxLength={255}
                placeholder="e.g. Process Gas"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Aliases (comma separated)
              <input
                aria-label="Aliases"
                value={form.aliases}
                onChange={(event) => setForm((prev) => ({ ...prev, aliases: event.target.value }))}
                placeholder="e.g. PG, Process Gas"
                className={inputClass}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Active
            </label>
            <div className="flex gap-2">
              {form.id !== null && (
                <button
                  type="button"
                  onClick={() => setForm(emptyForm(form.kind))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving && <LoaderCircle size={15} className="animate-spin" />}
                {form.id === null ? 'Add mapping' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EquipmentTaxonomyModal;
