import { useState } from 'react';
import { ChevronDown, FileText, Link2 } from 'lucide-react';
import UploadDropzone from './UploadDropzone';
import {
  FILE_CATEGORIES,
  SAMPLE_DOCUMENTS,
  categoryBadgeClass,
  formatFileSize,
  formatUploadDate,
  type FileCategory,
  type ManageAssetDocument,
} from './manageAssetDocuments';

export interface ManageAssetFileTabProps {
  /** Reports each accepted batch so the page can toast it. */
  onFilesAdded: (files: File[]) => void;
  /** Reports local-only actions (external link added, spec applied). */
  onNotify?: (message: string) => void;
}

/**
 * File tab (Fase 3): category picker, "Add External Link" action, a dashed
 * dropzone, and the Files accordion list. Dropped files are held in local state
 * only — no upload yet.
 */
const ManageAssetFileTab = ({ onFilesAdded, onNotify }: ManageAssetFileTabProps) => {
  const [category, setCategory] = useState<FileCategory>('Document');
  const [files, setFiles] = useState<ManageAssetDocument[]>(SAMPLE_DOCUMENTS);
  const [listOpen, setListOpen] = useState(true);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');

  const handleFiles = (dropped: File[]) => {
    const added: ManageAssetDocument[] = dropped.map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      name: file.name,
      category,
      kind: 'file',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    setFiles((current) => [...current, ...added]);
    setListOpen(true);
    onFilesAdded(dropped);
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setLinkError('Enter a URL.');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setLinkError('URL must start with http:// or https://');
      return;
    }
    setFiles((current) => [
      ...current,
      {
        id: `link-${Date.now()}`,
        name: url,
        category,
        kind: 'link',
        uploadedAt: new Date().toISOString(),
      },
    ]);
    setListOpen(true);
    onNotify?.(`External link added: ${url}`);
    setLinkOpen(false);
    setLinkUrl('');
    setLinkError('');
  };

  return (
    <section aria-label="File" className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            Category
            <select
              aria-label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value as FileCategory)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {FILE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setLinkOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Link2 size={14} aria-hidden="true" />
            Add External Link
          </button>
        </div>

        <UploadDropzone
          title="Drop files here"
          description="Upload documents for this asset (PDF, DOCX, XLSX)"
          hint="Click or drag & drop to upload"
          accept=".pdf,.docx,.xlsx"
          onFiles={handleFiles}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <button
          type="button"
          aria-expanded={listOpen}
          onClick={() => setListOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-200/70"
        >
          Files ({files.length})
          <ChevronDown
            size={16}
            className={`transition-transform ${listOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {listOpen && (
          <ul className="divide-y divide-slate-100">
            {files.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                No files uploaded yet.
              </li>
            ) : (
              files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      file.kind === 'link'
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                    aria-hidden="true"
                  >
                    {file.kind === 'link' ? <Link2 size={16} /> : <FileText size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800" title={file.name}>
                      {file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatFileSize(file.sizeBytes)} · {formatUploadDate(file.uploadedAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${categoryBadgeClass(
                      file.category
                    )}`}
                  >
                    {file.category}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {linkOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLinkOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-link-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 id="add-link-title" className="text-base font-semibold text-slate-900">
              Add External Link
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Link a document hosted elsewhere (DMS, SharePoint, vendor portal).
            </p>
            <label className="mt-4 block space-y-1 text-xs font-medium text-slate-600">
              URL
              <input
                aria-label="External link URL"
                value={linkUrl}
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  setLinkError('');
                }}
                placeholder="https://dms.example.com/…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </label>
            {linkError && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {linkError}
              </p>
            )}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(false);
                  setLinkUrl('');
                  setLinkError('');
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLink}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Add Link
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default ManageAssetFileTab;
