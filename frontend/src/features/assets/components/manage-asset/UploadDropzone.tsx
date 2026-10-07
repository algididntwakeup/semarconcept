import { useRef, useState, type DragEvent } from 'react';
import { Upload } from 'lucide-react';

export interface UploadDropzoneProps {
  /** Headline shown inside the dropzone, e.g. "No images yet". */
  title: string;
  /** Supporting copy under the title. */
  description: string;
  /** Green call-to-action line, e.g. "Click or drag & drop to upload". */
  hint: string;
  /** `accept` attribute for the hidden file input. */
  accept?: string;
  multiple?: boolean;
  /** Receives the dropped/selected files. */
  onFiles: (files: File[]) => void;
}

/**
 * Dashed dropzone shared by the Image and File tabs: an upload arrow, a title,
 * supporting copy, and a green "click or drag" hint. Selecting or dropping files
 * hands them to the caller, which owns the placeholder state.
 */
const UploadDropzone = ({
  title,
  description,
  hint,
  accept,
  multiple = true,
  onFiles,
}: UploadDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (dropped.length > 0) onFiles(dropped);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={hint}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
        dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50/60 hover:border-emerald-400'
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
        <Upload size={20} aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="max-w-md text-xs text-slate-500">{description}</p>
      <p className="text-xs font-semibold text-emerald-600">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          if (selected.length > 0) onFiles(selected);
          event.target.value = '';
        }}
      />
    </div>
  );
};

export default UploadDropzone;
