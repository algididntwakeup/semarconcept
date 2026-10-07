// Component type catalog for the Equipment Master "Add Component" modal.
//
// A component is a child of an equipment asset (Hierarchy Level 7 in the SEMAR
// tree: equipment -> components -> inspection points). The type list is derived
// from the parent's equipment class so the operator only sees the components
// that make sense for that equipment — a heat exchanger offers Shell/Channel/
// Tube Bundle, a storage tank offers Shell/Roof/Bottom, and so on.
//
// `code` is the canonical value persisted as `component_type`; it mirrors the
// lowercase constants in backend/app/models/component.go so downstream
// integrity logic can compare against them. `label` is the human-readable text
// shown in the dropdown.

export interface ComponentTypeOption {
  /** Text shown in the dropdown, e.g. "Tube Bundle". */
  label: string;
  /** Canonical value persisted as component_type, e.g. "tube_bundle". */
  code: string;
}

const option = (label: string, code: string): ComponentTypeOption => ({ label, code });

const HEAT_EXCHANGER_TYPES: ComponentTypeOption[] = [
  option('Shell', 'shell'),
  option('Channel', 'channel'),
  option('Tube Bundle', 'tube_bundle'),
  option('Tube', 'tube'),
  option('Head', 'head'),
  option('Nozzle', 'nozzle'),
  option('Baffle', 'baffle'),
  option('Tubesheet', 'tubesheet'),
];

const PRESSURE_VESSEL_TYPES: ComponentTypeOption[] = [
  option('Shell', 'shell'),
  option('Head', 'head'),
  option('Nozzle', 'nozzle'),
  option('Internals', 'internals'),
  option('Manway', 'manway'),
  option('Saddle', 'saddle'),
  option('Skirt', 'skirt'),
];

const STORAGE_TANK_TYPES: ComponentTypeOption[] = [
  option('Shell', 'shell'),
  option('Shell Course', 'shell_course'),
  option('Roof', 'roof'),
  option('Bottom', 'bottom'),
  option('Nozzle', 'nozzle'),
  option('Foundation', 'foundation'),
];

const PIPING_TYPES: ComponentTypeOption[] = [
  option('Pipe', 'pipe'),
  option('Elbow', 'elbow'),
  option('Tee', 'tee'),
  option('Reducer', 'reducer'),
  option('Flange', 'flange'),
  option('Valve', 'valve'),
  option('Support', 'support'),
];

const FILTER_TYPES: ComponentTypeOption[] = [
  option('Shell', 'shell'),
  option('Basket', 'basket'),
  option('Cartridge', 'cartridge'),
  option('Element', 'element'),
  option('Nozzle', 'nozzle'),
  option('Support', 'support'),
];

const HEATER_TYPES: ComponentTypeOption[] = [
  option('Tube', 'tube'),
  option('Header', 'header'),
  option('Burner', 'burner'),
  option('Refractory', 'refractory'),
  option('Stack', 'stack'),
  option('Support', 'support'),
];

/** Fallback list: every distinct type, in catalog order. */
const ALL_TYPES: ComponentTypeOption[] = (() => {
  const seen = new Set<string>();
  const merged: ComponentTypeOption[] = [];
  for (const list of [
    HEAT_EXCHANGER_TYPES,
    PRESSURE_VESSEL_TYPES,
    STORAGE_TANK_TYPES,
    PIPING_TYPES,
    FILTER_TYPES,
    HEATER_TYPES,
  ]) {
    for (const entry of list) {
      if (seen.has(entry.code)) continue;
      seen.add(entry.code);
      merged.push(entry);
    }
  }
  return merged;
})();

/** Strips a trailing "(HX)" style code and normalises for matching. */
const normalizeClass = (value: string): string =>
  value
    .replace(/\([^)]*\)/g, '')
    .trim()
    .toLowerCase();

/**
 * Component types offered for a parent equipment class. Unknown classes fall
 * back to the full catalog so the form is never blocked while the class list
 * keeps growing.
 */
export const componentTypesForClass = (equipmentClass: string): ComponentTypeOption[] => {
  const normalized = normalizeClass(equipmentClass);
  if (normalized.includes('heat exchanger')) return HEAT_EXCHANGER_TYPES;
  if (normalized.includes('pressure vessel')) return PRESSURE_VESSEL_TYPES;
  if (normalized.includes('storage tank')) return STORAGE_TANK_TYPES;
  if (normalized.includes('filter') || normalized.includes('strainer')) return FILTER_TYPES;
  if (normalized.includes('heater') || normalized.includes('boiler')) return HEATER_TYPES;
  if (normalized.includes('piping')) return PIPING_TYPES;
  return ALL_TYPES;
};

/** Every component type, de-duplicated. Useful for lookups and tests. */
export const ALL_COMPONENT_TYPES: ComponentTypeOption[] = ALL_TYPES;

/** Human-readable label for a stored component type code, or the code itself. */
export const componentTypeLabel = (code: string): string =>
  ALL_TYPES.find((entry) => entry.code === code)?.label ?? code;
