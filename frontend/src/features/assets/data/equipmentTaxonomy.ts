// Equipment taxonomy catalog for the Equipment Master "New Equipment" modal.
//
// The canonical labels mirror the backend import dictionary
// (backend/app/services/equipment_import_translation.go) so manually created
// equipment stays consistent with imported rows and with the class/type
// breakdown shown in the statistics cards.

export interface EquipmentClassOption {
  /** Canonical class label stored in the database, e.g. "Piping (PI)". */
  value: string;
  /** Equipment types offered once this class is selected. */
  types: string[];
}

export const EQUIPMENT_TAXONOMY: EquipmentClassOption[] = [
  {
    value: 'Piping (PI)',
    types: [
      'Carbon Steel (Ca) (CA)',
      'Carbon Steel (Cs) (CS)',
      'Stainless Steel (Ss) (SS)',
    ],
  },
  {
    value: 'Heat Exchangers (HX)',
    types: ['Shell And Tube (St) (ST)', 'Air Cooled (Ac) (AC)', 'Heat Exchanger (He) (HE)'],
  },
  {
    value: 'Pressure Vessels (VE)',
    types: [
      'Separator (Se) (SE)',
      'Scrubber (Sb) (SB)',
      'Surge Drum (Sd) (SD)',
      'Adsorber (Ad) (AD)',
      'Flash Drum (Fd) (FD)',
      'Distillation Column (Dc) (DC)',
      'Dryer (Dr) (DR)',
      'Pig Trap (Pt) (PT)',
    ],
  },
  {
    value: 'Filters And Strainers (FS)',
    types: [
      'Cartridge Filter (Cf) (CF)',
      'Coalescer Filter (Co) (CO)',
      'Pressure Filter (Pf) (PF)',
      'Basket Strainer (Bs) (BS)',
    ],
  },
  { value: 'Storage Tanks (TK)', types: ['Fixed Roof (Fr) (FR)'] },
  { value: 'Storage Tanks (TA)', types: ['Fixed Roof (Fr) (FR)'] },
  { value: 'Heaters And Boilers (HB)', types: ['Direct Fired Heater (Df) (DF)'] },
  {
    value: 'Piping Line (PL)',
    types: [
      'Carbon Steel (Ca) (CA)',
      'Carbon Steel (Cs) (CS)',
      'Stainless Steel (Ss) (SS)',
    ],
  },
];

/** Equipment types available for a class; empty when the class is unknown. */
export const equipmentTypesForClass = (equipmentClass: string): string[] =>
  EQUIPMENT_TAXONOMY.find((option) => option.value === equipmentClass)?.types ?? [];

/**
 * Merges classes discovered from the statistics API into the static catalog so
 * tenant-specific classes remain selectable. Unknown classes are appended
 * without a type list, which keeps the form usable while the catalog grows.
 */
export const withDiscoveredClasses = (discovered: string[]): EquipmentClassOption[] => {
  const merged: Record<string, EquipmentClassOption> = {};
  for (const option of EQUIPMENT_TAXONOMY) merged[option.value] = option;
  for (const label of discovered) {
    const trimmed = label.trim();
    if (trimmed && !merged[trimmed]) merged[trimmed] = { value: trimmed, types: [] };
  }
  return Object.values(merged);
};

/** Lifecycle states offered by the New Equipment form. */
export const EQUIPMENT_LIFECYCLE_STATES = [
  'Installed',
  'Available',
  'Sent to repair',
  'Retired',
  'Condemned',
] as const;

export type EquipmentLifecycleState = (typeof EQUIPMENT_LIFECYCLE_STATES)[number];
