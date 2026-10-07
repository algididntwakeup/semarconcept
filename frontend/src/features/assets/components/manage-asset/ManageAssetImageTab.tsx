import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import UploadDropzone from './UploadDropzone';

export interface ManageAssetImageTabProps {
  /** Tag number shown in the header. */
  tag: string;
  /** Reports each accepted batch so the page can toast it. */
  onFilesAdded: (files: File[]) => void;
}

/**
 * Image tab (Fase 3): the annotation header, action bar, and the dashed
 * dropzone. Dropped images are held in local state only — no upload yet.
 */
const ManageAssetImageTab = ({ tag, onFilesAdded }: ManageAssetImageTabProps) => {
  const [images, setImages] = useState<File[]>([]);

  const handleFiles = (files: File[]) => {
    setImages((current) => [...current, ...files]);
    onFilesAdded(files);
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
          <ImageIcon size={15} aria-hidden="true" />
          Upload Image
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              if (selected.length > 0) handleFiles(selected);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <UploadDropzone
          title="No images yet"
          description="Upload P&ID drawings, maps, or photos to annotate and link with asset locations"
          hint="Click or drag & drop to upload"
          accept="image/*"
          onFiles={handleFiles}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={`${image.name}-${index}`}
              className="truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
            >
              {image.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ManageAssetImageTab;
