// Display helpers that re-attach the short equipment codes to the plain labels
// stored in the database.
//
// The import Data Transformation Layer translates codes to long labels before
// persisting them ("PI" -> "Piping", "CA" -> "Carbon Steel"), so the stored
// value no longer carries the code. The Equipment Master grid still wants to
// show the code for engineers, so these maps reverse the backend dictionary
// (backend/app/services/equipment_import_translation.go).
//
// Limitation: the database keeps only the label, so labels that map to more
// than one code cannot be told apart. "Carbon Steel" is the clearest case
// (CA/CS both translate to it); the primary code is used and the ambiguity is
// noted for the backend rework that will persist the raw code.

const CLASS_CODE: Record<string, string> = {
  piping: 'PI',
  'heat exchangers': 'HX',
  'pressure vessels': 'VE',
  'storage tanks': 'TK',
  'filters & strainers': 'FS',
  'heaters & boilers': 'HB',
  'piping line': 'PL',
};

const TYPE_CODE: Record<string, string> = {
  'carbon steel': 'CA',
  'stainless steel': 'SS',
  'shell & tube': 'ST',
  'air cooled': 'AC',
  'heat exchanger': 'HE',
  separator: 'SE',
  scrubber: 'SB',
  'surge drum': 'SD',
  adsorber: 'AD',
  'flash drum': 'FD',
  'distillation column': 'DC',
  dryer: 'DR',
  'pig trap': 'PT',
  'cartridge filter': 'CF',
  'coalescer filter': 'CO',
  'pressure filter': 'PF',
  'basket strainer': 'BS',
  'fixed roof': 'FR',
  'direct fired heater': 'DF',
};

const normalize = (value: string) => value.trim().toLowerCase();

/** Equipment class code for a stored label, or '' when unknown. */
export const equipmentClassCode = (label: string): string =>
  CLASS_CODE[normalize(label)] ?? '';

/** Equipment type code for a stored label, or '' when unknown. */
export const equipmentTypeCode = (label: string): string =>
  TYPE_CODE[normalize(label)] ?? '';

/** "Piping" -> "Piping (PI)"; unknown labels are returned unchanged. */
export const classWithCode = (label: string): string => {
  const code = equipmentClassCode(label);
  return code ? `${label} (${code})` : label;
};

/** "Carbon Steel" -> "Carbon Steel (CA)"; unknown labels are returned unchanged. */
export const typeWithCode = (label: string): string => {
  const code = equipmentTypeCode(label);
  return code ? `${label} (${code})` : label;
};

/** "Carbon Steel" -> "Carbon Steel - CA"; unknown labels are returned unchanged. */
export const typeWithDashCode = (label: string): string => {
  const code = equipmentTypeCode(label);
  return code ? `${label} - ${code}` : label;
};
