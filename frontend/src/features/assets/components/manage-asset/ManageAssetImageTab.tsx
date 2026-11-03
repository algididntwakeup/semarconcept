import { useState } from 'react';
import { Image as ImageIcon, LoaderCircle } from 'lucide-react';
import {
  useEquipmentDocuments,
  useUploadEquipmentDocument,
} from '../../api/assetQueries';
import UploadDropzone from './UploadDropzone';

export interface ManageAssetImageTabProps {
  /** Asset id the images belong to. */
  assetId: string | number;
  /** Tag number shown in the header. */
  tag: string;
  /** Reports each accepted batch so the page can toast it. */
  onFilesAdded: (files: File[]) => void;
  onError?: (message: string) => void;
}

/**
 * Image tab: annotation header, action bar, and the dashed dropzone. Images are
 * uploaded through the documents API and listed from the server.
 */
const ManageAssetImageTab = ({ assetId, tag, onFilesAdded, onError }: ManageAssetImageTabProps) => {
  const documentsQuery = useEquipmentDocuments(assetId);
  const upload = useUploadEquipmentDocument(assetId);
  const [progress, setProgress] = useState<number | null>(null);

  const images = (documentsQuery.data ?? []).filter((document) => document.file_type === 'Image');

  const handleFiles = async (files: File[]) => {
    setProgress(0);
    try {
      for (const file of files) {
        await upload.mutateAsync({ file });
      }
      onFilesAdded(files);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unable to upload image');
    } finally {
      setProgress(null);
    }
  };

  return (
    <section aria-label="Image" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">[{tag}] Image</h3>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Save Data Source
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">
          Image Annotations ({images.length} images)
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
          {upload.isPending ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <ImageIcon size={15} aria-hidden="true" />
          )}
          {upload.isPending ? `Uploading… ${progress ?? 0}%` : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={upload.isPending}
            className="hidden"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              if (selected.length > 0) void handleFiles(selected);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {documentsQuery.isLoading ? (
        <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <LoaderCircle size={15} className="animate-spin" /> Loading images…
        </p>
      ) : images.length === 0 ? (
        <UploadDropzone
          title="No images yet"
          description="Upload P&ID drawings, maps, or photos to annotate and link with asset locations"
          hint="Click or drag & drop to upload"
          accept="image/*"
          onFiles={(files) => void handleFiles(files)}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-slate-200">
              <a
                href={image.file_url}
                target="_blank"
                rel="noreferrer"
                className="block truncate px-3 py-2 text-xs font-medium text-emerald-700 hover:underline"
                title={image.file_name}
              >
                {image.file_name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ManageAssetImageTab;
