package services

import "strings"

// Data Transformation Layer for the Equipment Master Excel import.
//
// The source system exports short abbreviation codes in the "Equipment Class"
// and "Equipment Type" columns (for example "PI" and "CA"). The database stores
// the long human-readable names ("Piping", "Carbon Steel") so that list filters,
// statistics, and reports read consistently. These dictionaries translate a
// code into its canonical name; any value that is not a known key is persisted
// unchanged, so a workbook that already carries long names keeps working.

// equipmentClassTranslations maps Equipment Class abbreviations to the
// canonical class names used across the application.
var equipmentClassTranslations = map[string]string{
	"PI": "Piping",
	"HX": "Heat Exchangers",
	"VE": "Pressure Vessels",
	"TK": "Storage Tanks",
	"TA": "Storage Tanks",
	"FS": "Filters & Strainers",
	"HB": "Heaters & Boilers",
	"PL": "Piping Line",
}

// equipmentTypeTranslations maps Equipment Type and material abbreviations to
// the canonical type names. For piping rows the type column carries a material
// code (CA/CS/SS), so those material codes are translated here as well.
var equipmentTypeTranslations = map[string]string{
	// Piping materials.
	"CA": "Carbon Steel",
	"CS": "Carbon Steel",
	"SS": "Stainless Steel",
	// Heat exchangers.
	"ST": "Shell & Tube",
	"AC": "Air Cooled",
	"HE": "Heat Exchanger",
	// Pressure vessels.
	"SE": "Separator",
	"SB": "Scrubber",
	"SD": "Surge Drum",
	"AD": "Adsorber",
	"FD": "Flash Drum",
	"DC": "Distillation Column",
	"DR": "Dryer",
	"PT": "Pig Trap",
	// Filters & strainers.
	"CF": "Cartridge Filter",
	"CO": "Coalescer Filter",
	"PF": "Pressure Filter",
	"BS": "Basket Strainer",
	// Storage tanks.
	"FR": "Fixed Roof",
	// Heaters & boilers.
	"DF": "Direct Fired Heater",
}

// TranslateEquipmentImportClass resolves an Equipment Class cell value to its
// canonical name. Codes are matched case-insensitively after trimming; a value
// with no dictionary entry is returned unchanged.
func TranslateEquipmentImportClass(value string) string {
	return translateEquipmentImportCode(equipmentClassTranslations, value)
}

// TranslateEquipmentImportType resolves an Equipment Type cell value to its
// canonical name. Codes are matched case-insensitively after trimming; a value
// with no dictionary entry is returned unchanged.
func TranslateEquipmentImportType(value string) string {
	return translateEquipmentImportCode(equipmentTypeTranslations, value)
}

func translateEquipmentImportCode(dictionary map[string]string, value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return value
	}
	if translated, ok := dictionary[strings.ToUpper(trimmed)]; ok {
		return translated
	}
	return value
}
