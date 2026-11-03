// Field catalog for the Manage Asset modal (Data Source tab).
//
// The Excel import stores anything that is not a first-class asset column in
// the `rbi_properties` JSONB map, keyed as `Category.Header` (see the backend
// equipmentExportColumns). The Manage Asset form reuses the exact same keys so
// a value edited here round-trips with import/export instead of drifting.
//
// Fields that already have an export key (Design Code/Pressure/Temperature)
// override `rbiKey` to that key; the rest derive `Category.Label` from their
// group, which is the same convention the import uses for unknown columns.

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

/** Every input kind the modal renders. */
export type ManageAssetInput = 'text' | 'number' | 'date' | 'select' | 'radio';

export interface ManageAssetField {
  /** Form field name. */
  name: keyof ManageAssetFormValues;
  label: string;
  input: ManageAssetInput;
  /** Choices for `select` and `radio` inputs. */
  options?: readonly string[];
  /** Asset column this field reads/writes, when it is not a JSONB property. */
  column?: 'id' | 'description' | 'asset_class' | 'asset_type';
  /** Explicit rbi_properties key; otherwise derived from the group category. */
  rbiKey?: string;
  readOnly?: boolean;
  /** Renders read-only once the value is already set (Equipment Type). */
  disabledWhenFilled?: boolean;
  multiline?: boolean;
  placeholder?: string;
}

/** A collapsible group of fields that share one rbi category prefix. */
export interface ManageAssetFieldGroup {
  id: string;
  title: string;
  category?: string;
  fields: ManageAssetField[];
}

/** Form values for the Manage Asset modal; every input is a string. */
export interface ManageAssetFormValues {
  // General Data.
  equipmentId: string;
  funcloc: string;
  description: string;
  equipmentClass: string;
  equipmentType: string;
  // Design Data > Equipment Design.
  designEquipmentType: string;
  designCode: string;
  equipmentStartDate: string;
  designPressure: string;
  designTemperature: string;
  weldEfficiency: string;
  postWeldHeatTreatment: string;
  // Operating Data > Fluid Inventory.
  vaporVolume: string;
  liquidVolume: string;
  totalMass: string;
  // Operating Data > Equipment Fluid Definition.
  processFluid: string;
  // Operating Data > Fluid Definition.
  consequenceModel: string;
  // Risk Analysis > Equipment Inspection.
  inspectionEquipmentStatus: string;
  intervalBasedInspection: string;
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

/** General Data reads real asset columns; Funcloc comes from the JSONB funcloc. */
export const GENERAL_DATA_FIELDS: ManageAssetField[] = [
  { name: 'equipmentId', label: 'Equipment ID', input: 'text', column: 'id', readOnly: true },
  { name: 'funcloc', label: 'Funcloc', input: 'text', rbiKey: 'parent_funcloc' },
  { name: 'description', label: 'Description', input: 'text', column: 'description', multiline: true },
  { name: 'equipmentClass', label: 'Equipment Class', input: 'text', column: 'asset_class' },
  { name: 'equipmentType', label: 'Equipment Type', input: 'text', column: 'asset_type' },
];

// Other Data > Equipment References. Keys follow the import convention
// `Equipment References.<label>`.
export const EQUIPMENT_REFERENCE_FIELDS: ManageAssetField[] = [
  { name: 'assetId', label: 'Asset ID', input: 'text' },
  { name: 'pidDrawingNo', label: 'P&ID Drawing No.', input: 'text' },
  { name: 'inspectionDrawingNo', label: 'Inspection Drawing No.', input: 'text' },
  { name: 'jurisdictionRegistrationNo', label: 'Jurisdiction Registration No.', input: 'text' },
  { name: 'jurisSerialNo', label: 'Juris Serial No.', input: 'text' },
  { name: 'latitude', label: 'Latitude (degrees(decimal))', input: 'number', placeholder: '-6.123456' },
  { name: 'longitude', label: 'Longitude (degrees(decimal))', input: 'number', placeholder: '106.123456' },
  { name: 'elevation', label: 'Elevation (m)', input: 'number', placeholder: '0' },
];

/** Design Code options (placeholder list until the master data lands). */
export const DESIGN_CODE_OPTIONS = [
  'ASME VIII Div. 1',
  'ASME VIII Div. 2',
  'ASME B31.3',
  'API 650',
  'API 620',
  'Other',
] as const;

/** Design Data > Equipment Design. */
export const EQUIPMENT_DESIGN_FIELDS: ManageAssetField[] = [
  {
    name: 'designEquipmentType',
    label: 'Equipment Type',
    input: 'text',
    disabledWhenFilled: true,
  },
  { name: 'designCode', label: 'Design Code', input: 'select', options: DESIGN_CODE_OPTIONS, rbiKey: 'Component Design.Design Code' },
  { name: 'equipmentStartDate', label: 'Equipment Start Date', input: 'date' },
  { name: 'designPressure', label: 'Design Pressure (psig)', input: 'number', rbiKey: 'Component Design.Design Pressure' },
  { name: 'designTemperature', label: 'Design Temperature (°F)', input: 'number', rbiKey: 'Component Design.Design Temperature' },
  { name: 'weldEfficiency', label: 'Weld Efficiency', input: 'number', placeholder: '0.85' },
  { name: 'postWeldHeatTreatment', label: 'Post Weld Heat Treatment', input: 'radio', options: ['YES', 'NO'] },
];

/** Operating Data > Fluid Inventory. */
export const FLUID_INVENTORY_FIELDS: ManageAssetField[] = [
  { name: 'vaporVolume', label: 'Equipment Vapor Volume (m³)', input: 'number' },
  { name: 'liquidVolume', label: 'Equipment Liquid Volume (m³)', input: 'number' },
  { name: 'totalMass', label: 'Total Equipment Mass (kg)', input: 'number' },
];

/** Process Fluid options (placeholder list until the master data lands). */
export const PROCESS_FLUID_OPTIONS = [
  'Crude Oil',
  'Natural Gas',
  'Produced Water',
  'Multiphase',
  'Steam',
  'Condensate',
  'Other',
] as const;

/** Operating Data > Equipment Fluid Definition. */
export const EQUIPMENT_FLUID_DEFINITION_FIELDS: ManageAssetField[] = [
  { name: 'processFluid', label: 'Process Fluid', input: 'select', options: PROCESS_FLUID_OPTIONS },
];

/** Consequence Model options (placeholder list until the RBI engine lands). */
export const CONSEQUENCE_MODEL_OPTIONS = ['Simple', 'Intermediate', 'Advanced'] as const;

/** Operating Data > Fluid Definition. */
export const FLUID_DEFINITION_FIELDS: ManageAssetField[] = [
  {
    name: 'consequenceModel',
    label: 'Consequence Model',
    input: 'select',
    options: CONSEQUENCE_MODEL_OPTIONS,
  },
];

/** Placeholder thickness properties offered by the Detail Specs card. */
export const DETAIL_SPEC_PROPERTIES = [
  'Furnished Thickness',
  'Corrosion Allowance',
  'Pipe Schedule',
] as const;

/** Equipment Status options for the inspection form. */
export const EQUIPMENT_STATUS_OPTIONS = [
  'In Service',
  'Out of Service',
  'Standby',
  'Under Maintenance',
  'Decommissioned',
] as const;

/** Risk Analysis > Equipment Inspection. */
export const EQUIPMENT_INSPECTION_FIELDS: ManageAssetField[] = [
  {
    name: 'inspectionEquipmentStatus',
    label: 'Equipment Status',
    input: 'select',
    options: EQUIPMENT_STATUS_OPTIONS,
  },
  {
    name: 'intervalBasedInspection',
    label: 'Enable Interval Based Inspection',
    input: 'radio',
    options: ['YES', 'NO'],
  },
];

const EMPTY_FIELD_VALUES = (fields: ManageAssetField[]): Record<string, string> =>
  Object.fromEntries(fields.map((field) => [field.name, '']));

export const EMPTY_MANAGE_ASSET_FORM: ManageAssetFormValues = {
  ...EMPTY_FIELD_VALUES(GENERAL_DATA_FIELDS),
  ...EMPTY_FIELD_VALUES(EQUIPMENT_DESIGN_FIELDS),
  ...EMPTY_FIELD_VALUES(FLUID_INVENTORY_FIELDS),
  ...EMPTY_FIELD_VALUES(EQUIPMENT_FLUID_DEFINITION_FIELDS),
  ...EMPTY_FIELD_VALUES(FLUID_DEFINITION_FIELDS),
  ...EMPTY_FIELD_VALUES(EQUIPMENT_INSPECTION_FIELDS),
  ...EMPTY_FIELD_VALUES(EQUIPMENT_REFERENCE_FIELDS),
} as unknown as ManageAssetFormValues;

// Every field that lives in rbi_properties, paired with its category so the
// key can be derived as `Category.Label` exactly like the import does.
const RBI_FIELD_GROUPS: Array<{ category: string; fields: ManageAssetField[] }> = [
  { category: 'Equipment Design', fields: EQUIPMENT_DESIGN_FIELDS },
  { category: 'Fluid Inventory', fields: FLUID_INVENTORY_FIELDS },
  { category: 'Equipment Fluid Definition', fields: EQUIPMENT_FLUID_DEFINITION_FIELDS },
  { category: 'Fluid Definition', fields: FLUID_DEFINITION_FIELDS },
  { category: 'Equipment Inspection', fields: EQUIPMENT_INSPECTION_FIELDS },
  { category: 'Equipment References', fields: EQUIPMENT_REFERENCE_FIELDS },
];

/** rbi_properties key for a field, honouring an explicit override. */
export const manageAssetRbiKey = (field: ManageAssetField, category?: string): string =>
  field.rbiKey ?? (category ? `${category}.${field.label}` : '');

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

  for (const { category, fields } of RBI_FIELD_GROUPS) {
    for (const field of fields) {
      form[field.name] = normalize(properties[manageAssetRbiKey(field, category)]);
    }
  }

  // The Design tab mirrors the General Data Equipment Type so an operator sees
  // the same value in both places.
  form.designEquipmentType = form.equipmentType;

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

  for (const { category, fields } of RBI_FIELD_GROUPS) {
    for (const field of fields) {
      // The Design Equipment Type is a mirror of the asset column, not its own key.
      if (field.name === 'designEquipmentType') continue;
      const key = manageAssetRbiKey(field, category);
      if (key) rbiProperties[key] = values[field.name];
    }
  }

  return { columns, rbiProperties };
};
