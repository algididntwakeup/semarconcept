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
}

/**
 * File tab (Fase 3): category picker, "Add External Link" action, a dashed
 * dropzone, and the Files accordion list. Dropped files are held in local state
 * only — no upload yet.
 */
const ManageAssetFileTab = ({ onFilesAdded }: ManageAssetFileTabProps) => {
  const [category, setCategory] = useState<FileCategory>('Document');
  const [files, setFiles] = useState<ManageAssetDocument[]>(SAMPLE_DOCUMENTS);
  const [listOpen, setListOpen] = useState(true);

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
    const url = window.prompt('External link URL');
    if (!url?.trim()) return;
    setFiles((current) => [
      ...current,
      {
        id: `link-${Date.now()}`,
        name: url.trim(),
        category,
        kind: 'link',
        uploadedAt: new Date().toISOString(),
      },
    ]);
    setListOpen(true);
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
            onClick={handleAddLink}
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
    </section>
  );
};

export default ManageAssetFileTab;
