// Document/image catalog for the Manage Asset modal Image and File tabs.
//
// Fase 3 is the UI only: files dropped into the dropzones are kept in local
// React state and never uploaded. The seed rows below stand in for a real
// document service so the list, badges, and formatting can be reviewed.

/** Categories offered by the File tab upload section. */
export const FILE_CATEGORIES = [
  'Document',
  'Drawing',
  'Report',
  'Datasheet',
  'Certificate',
] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];

/** Badge tone per category, matching the legacy colour coding. */
const CATEGORY_TONE: Record<string, string> = {
  DRAWING: 'bg-purple-100 text-purple-700',
  REPORT: 'bg-blue-100 text-blue-700',
  CERTIFICATE: 'bg-emerald-100 text-emerald-700',
  DATASHEET: 'bg-amber-100 text-amber-700',
  DOCUMENT: 'bg-slate-100 text-slate-600',
  LINK: 'bg-teal-100 text-teal-700',
};

export const categoryBadgeClass = (category: string): string =>
  CATEGORY_TONE[category.toUpperCase()] ?? 'bg-slate-100 text-slate-600';

/** One row in the Files list: an uploaded file or an external link. */
export interface ManageAssetDocument {
  id: string;
  /** Display name; for links this is the URL. */
  name: string;
  category: FileCategory;
  kind: 'file' | 'link';
  /** Bytes for files; omitted for links. */
  sizeBytes?: number;
  /** ISO date string. */
  uploadedAt: string;
}

/** Format bytes as the list shows them, e.g. 3.3 MB. */
export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};

/** Format an ISO date as the list shows it, e.g. 30 Sept 2026. */
export const formatUploadDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

/** Placeholder rows until the document service is wired. */
export const SAMPLE_DOCUMENTS: ManageAssetDocument[] = [
  {
    id: 'sample-1',
    name: 'P&ID-1200-Rev-C.pdf',
    category: 'Drawing',
    kind: 'file',
    sizeBytes: 3_460_000,
    uploadedAt: '2026-09-30',
  },
  {
    id: 'sample-2',
    name: 'Inspection-Report-2026-Q3.docx',
    category: 'Report',
    kind: 'file',
    sizeBytes: 812_000,
    uploadedAt: '2026-09-18',
  },
  {
    id: 'sample-3',
    name: 'Material-Certificate-3.1.pdf',
    category: 'Certificate',
    kind: 'file',
    sizeBytes: 245_000,
    uploadedAt: '2026-08-02',
  },
  {
    id: 'sample-4',
    name: 'Vendor-Datasheet-Pump-P101.xlsx',
    category: 'Datasheet',
    kind: 'file',
    sizeBytes: 1_180_000,
    uploadedAt: '2026-07-21',
  },
  {
    id: 'sample-5',
    name: 'https://dms.example.com/assets/P-101/overview',
    category: 'Document',
    kind: 'link',
    uploadedAt: '2026-07-05',
  },
];
