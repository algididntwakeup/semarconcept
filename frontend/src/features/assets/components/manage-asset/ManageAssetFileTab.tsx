import { useState } from 'react';
import { ChevronDown, ExternalLink, FileText, Link2, LoaderCircle, Trash2 } from 'lucide-react';
import {
  useEquipmentDocuments,
  useUploadEquipmentDocument,
} from '../../api/assetQueries';
import { assetService } from '../../../../services/assetServices';
import UploadDropzone from './UploadDropzone';
import {
  FILE_CATEGORIES,
  categoryBadgeClass,
  formatFileSize,
  formatUploadDate,
  type FileCategory,
} from './manageAssetDocuments';

export interface ManageAssetFileTabProps {
  /** Asset id the files belong to. */
  assetId: string | number;
  /** Reports each accepted batch so the page can toast it. */
  onFilesAdded: (files: File[]) => void;
  /** Reports local-only actions (external link added, spec applied). */
  onNotify?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * File tab (Fase 3): category picker, "Add External Link" action, a dashed
 * dropzone, and the Files accordion list. Dropped files are held in local state
 * only — no upload yet.
 */
const ManageAssetFileTab = ({ assetId, onFilesAdded, onNotify, onError }: ManageAssetFileTabProps) => {
  const [category, setCategory] = useState<FileCategory>('Document');
  const [listOpen, setListOpen] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);

  const documentsQuery = useEquipmentDocuments(assetId);
  const upload = useUploadEquipmentDocument(assetId);
  const documents = documentsQuery.data ?? [];

  const handleFiles = async (dropped: File[]) => {
    setProgress(0);
    try {
      for (const file of dropped) {
        await upload.mutateAsync({ file, category });
      }
      setListOpen(true);
      onFilesAdded(dropped);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unable to upload file');
    } finally {
      setProgress(null);
    }
  };

  const handleDelete = async (documentId: number, fileName: string) => {
    if (!window.confirm(`Remove ${fileName}?`)) return;
    try {
      await assetService.deleteEquipmentDocument(assetId, documentId);
      await documentsQuery.refetch();
      onNotify?.(`Removed ${fileName}.`);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unable to remove file');
    }
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
            disabled={upload.isPending}
            onClick={() => onNotify?.('External links are not stored on the server yet.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <Link2 size={14} aria-hidden="true" />
            Add External Link
          </button>
        </div>

        {upload.isPending ? (
          <p className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 px-6 py-10 text-sm font-medium text-emerald-700">
            <LoaderCircle size={16} className="animate-spin" /> Uploading… {progress ?? 0}%
          </p>
        ) : (
          <UploadDropzone
            title="Drop files here"
            description="Upload documents for this asset (PDF, DOCX, XLSX)"
            hint="Click or drag & drop to upload"
            accept=".pdf,.docx,.xlsx"
            onFiles={(dropped) => void handleFiles(dropped)}
          />
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <button
          type="button"
          aria-expanded={listOpen}
          onClick={() => setListOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-200/70"
        >
          Files ({documents.length})
          <ChevronDown
            size={16}
            className={`transition-transform ${listOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {listOpen && (
          <ul className="divide-y divide-slate-100">
            {documentsQuery.isLoading ? (
              <li className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
                <LoaderCircle size={15} className="animate-spin" /> Loading files…
              </li>
            ) : documents.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                No files uploaded yet.
              </li>
            ) : (
              documents.map((document) => (
                <li key={document.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                    aria-hidden="true"
                  >
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-medium text-emerald-700 hover:underline"
                      title={document.file_name}
                    >
                      {document.file_name}
                    </a>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatFileSize(document.file_size)} · {formatUploadDate(document.uploaded_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${categoryBadgeClass(
                      document.file_type
                    )}`}
                  >
                    {document.file_type}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(document.id, document.file_name)}
                    aria-label={`Delete ${document.file_name}`}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
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
