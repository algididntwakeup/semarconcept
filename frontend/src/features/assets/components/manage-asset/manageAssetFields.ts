// Field catalog for the Manage Asset modal (Fase 1: Data Source tab).
//
// The Excel import stores anything that is not a first-class asset column in
// the `rbi_properties` JSONB map, keyed as `Category.Header` (see the backend
// equipmentExportColumns). The Manage Asset form reuses the exact same keys so
// a value edited here round-trips with import/export instead of drifting.

import type { EquipmentAssetRow } from '../AssetDataGrid';

/** Content tabs in the modal header. */
export const MANAGE_ASSET_TABS = ['Data Source', 'Image', 'File'] as const;
export type ManageAssetTab = (typeof MANAGE_ASSET_TABS)[number];

/** Sub-navigation shown while the Data Source tab is active. */
export const DATA_SOURCE_SECTIONS = [
  'General Data',
  'Design Data',
  'Operating Data',
  'Risk Analysis',
  'Other Data',
] as const;
export type DataSourceSection = (typeof DATA_SOURCE_SECTIONS)[number];

/** Form values for the Manage Asset modal; every input is a string. */
export interface ManageAssetFormValues {
  // General Data.
  equipmentId: string;
  funcloc: string;
  description: string;
  equipmentClass: string;
  equipmentType: string;
  // Other Data > Equipment References.
  assetId: string;
  pidDrawingNo: string;
  inspectionDrawingNo: string;
  jurisdictionRegistrationNo: string;
  jurisSerialNo: string;
  latitude: string;
  longitude: string;
  elevation: string;
}

export interface ManageAssetField {
  /** Form field name. */
  name: keyof ManageAssetFormValues;
  label: string;
  /** Asset column this field reads/writes, when it is not a JSONB property. */
  column?: 'id' | 'description' | 'asset_class' | 'asset_type' | 'tag_number';
  /** rbi_properties key this field reads/writes, when it lives in JSONB. */
  rbiKey?: string;
  readOnly?: boolean;
  multiline?: boolean;
  placeholder?: string;
}

/** General Data reads real asset columns; Funcloc comes from the JSONB funcloc. */
export const GENERAL_DATA_FIELDS: ManageAssetField[] = [
  { name: 'equipmentId', label: 'Equipment ID', column: 'id', readOnly: true },
  { name: 'funcloc', label: 'Funcloc', rbiKey: 'parent_funcloc' },
  { name: 'description', label: 'Description', column: 'description', multiline: true },
  { name: 'equipmentClass', label: 'Equipment Class', column: 'asset_class' },
  { name: 'equipmentType', label: 'Equipment Type', column: 'asset_type' },
];

// Other Data > Equipment References. The rbi key is `Equipment References.<label>`,
// matching the import convention, so no per-field key literal is duplicated here.
export const EQUIPMENT_REFERENCE_FIELDS: ManageAssetField[] = [
  { name: 'assetId', label: 'Asset ID' },
  { name: 'pidDrawingNo', label: 'P&ID Drawing No.' },
  { name: 'inspectionDrawingNo', label: 'Inspection Drawing No.' },
  { name: 'jurisdictionRegistrationNo', label: 'Jurisdiction Registration No.' },
  { name: 'jurisSerialNo', label: 'Juris Serial No.' },
  { name: 'latitude', label: 'Latitude (degrees(decimal))', placeholder: '-6.123456' },
  { name: 'longitude', label: 'Longitude (degrees(decimal))', placeholder: '106.123456' },
  { name: 'elevation', label: 'Elevation (m)', placeholder: '0' },
];

const EMPTY_REFERENCES: Record<string, string> = Object.fromEntries(
  EQUIPMENT_REFERENCE_FIELDS.map((field) => [field.name, ''])
);

export const EMPTY_MANAGE_ASSET_FORM: ManageAssetFormValues = {
  equipmentId: '',
  funcloc: '',
  description: '',
  equipmentClass: '',
  equipmentType: '',
  ...EMPTY_REFERENCES,
} as ManageAssetFormValues;

// Equipment References live under the `Equipment References.<label>` rbi key,
// matching the import convention.

/** Hydrate the form from an asset row, reading columns and JSONB by key. */
export const manageAssetFormFromRow = (asset: EquipmentAssetRow): ManageAssetFormValues => {
  const properties = asset.rbi_properties ?? {};
  const normalize = (value: unknown): string =>
    value === null || value === undefined ? '' : String(value).trim();
  const form: ManageAssetFormValues = { ...EMPTY_MANAGE_ASSET_FORM };

  for (const field of GENERAL_DATA_FIELDS) {
    if (field.rbiKey) {
      form[field.name] = normalize(properties[field.rbiKey]);
    } else if (field.column === 'id') {
      form[field.name] = normalize(asset.id);
    } else if (field.column === 'description') {
      form[field.name] = normalize(asset.description);
    } else if (field.column === 'asset_class') {
      form[field.name] = normalize(asset.asset_class ?? asset.assetClass);
    } else if (field.column === 'asset_type') {
      form[field.name] = normalize(asset.asset_type ?? asset.assetType ?? asset.type);
    }
  }

  for (const field of EQUIPMENT_REFERENCE_FIELDS) {
    form[field.name] = normalize(properties[`Equipment References.${field.label}`]);
  }

  return form;
};

/** Split the form into asset columns and rbi_properties keys for saving. */
export const manageAssetPayloadFromForm = (
  values: ManageAssetFormValues
): { columns: Record<string, string>; rbiProperties: Record<string, string> } => {
  const columns: Record<string, string> = {};
  const rbiProperties: Record<string, string> = {};

  for (const field of GENERAL_DATA_FIELDS) {
    if (field.readOnly) continue;
    const value = values[field.name];
    if (field.rbiKey) rbiProperties[field.rbiKey] = value;
    else if (field.column) columns[field.column] = value;
  }

  for (const field of EQUIPMENT_REFERENCE_FIELDS) {
    rbiProperties[`Equipment References.${field.label}`] = values[field.name];
  }

  return { columns, rbiProperties };
};
