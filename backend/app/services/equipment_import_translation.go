package services

import "strings"

// Data Transformation Layer for the Equipment Master Excel import.
//
// The source system exports short abbreviation codes in the "Equipment Class"
// and "Equipment Type" columns (for example "PI" and "CA"). The database stores
// the long human-readable label together with the code so that list filters,
// statistics, and reports read consistently with the legacy system:
//
//	Class: "FS"  -> "Filters And Strainers (FS)"
//	Type:  "CF"  -> "Cartridge Filter (Cf) (CF)"
//
// Any value that is not a known key is persisted unchanged, so a workbook that
// already carries long names keeps working.

// equipmentClassTranslations maps Equipment Class abbreviations to the
// canonical "Name (CODE)" label used across the application.
var equipmentClassTranslations = map[string]string{
	"PI": "Piping (PI)",
	"HX": "Heat Exchangers (HX)",
	"VE": "Pressure Vessels (VE)",
	"TK": "Storage Tanks (TK)",
	"TA": "Storage Tanks (TA)",
	"FS": "Filters And Strainers (FS)",
	"HB": "Heaters And Boilers (HB)",
	"PL": "Piping Line (PL)",
}

// equipmentTypeTranslations maps Equipment Type and material abbreviations to
// the canonical "Name (Title Code) (CODE)" label. The parenthesised code is
// rendered twice: once in title case ("Cf") and once upper case ("CF"), which
// is the format the legacy system returns. For piping rows the type column
// carries a material code (CA/CS/SS), so those material codes are translated
// here as well.
var equipmentTypeTranslations = map[string]string{
	// Piping materials.
	"CA": "Carbon Steel (Ca) (CA)",
	"CS": "Carbon Steel (Cs) (CS)",
	"SS": "Stainless Steel (Ss) (SS)",
	// Heat exchangers.
	"ST": "Shell And Tube (St) (ST)",
	"AC": "Air Cooled (Ac) (AC)",
	"HE": "Heat Exchanger (He) (HE)",
	// Pressure vessels.
	"SE": "Separator (Se) (SE)",
	"SB": "Scrubber (Sb) (SB)",
	"SD": "Surge Drum (Sd) (SD)",
	"AD": "Adsorber (Ad) (AD)",
	"FD": "Flash Drum (Fd) (FD)",
	"DC": "Distillation Column (Dc) (DC)",
	"DR": "Dryer (Dr) (DR)",
	"PT": "Pig Trap (Pt) (PT)",
	// Filters & strainers.
	"CF": "Cartridge Filter (Cf) (CF)",
	"CO": "Coalescer Filter (Co) (CO)",
	"PF": "Pressure Filter (Pf) (PF)",
	"BS": "Basket Strainer (Bs) (BS)",
	// Storage tanks.
	"FR": "Fixed Roof (Fr) (FR)",
	// Heaters & boilers.
	"DF": "Direct Fired Heater (Df) (DF)",
}

// TranslateEquipmentImportClass resolves an Equipment Class cell value to its
// canonical "Name (CODE)" label. Codes are matched case-insensitively after
// trimming; a value with no dictionary entry is returned unchanged.
func TranslateEquipmentImportClass(value string) string {
	return translateEquipmentImportCode(equipmentClassTranslations, value)
}

// TranslateEquipmentImportType resolves an Equipment Type cell value to its
// canonical "Name (Title Code) (CODE)" label. Codes are matched
// case-insensitively after trimming; a value with no dictionary entry is
// returned unchanged.
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
