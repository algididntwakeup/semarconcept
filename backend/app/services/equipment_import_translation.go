package services

import (
	"sort"
	"strings"

	"backend/app/models"
)

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

// EquipmentTaxonomyResolver translates raw workbook Equipment Class/Type cells
// to the tenant's canonical label using the tenant-scoped dictionary, so a
// tenant can teach SEMAR its own vocabulary without a code change.
//
// It also falls back to the built-in dictionary when the tenant has no entry,
// which keeps imports working for a tenant whose dictionary has not been seeded
// yet, and remembers any value it could not map so the import can report it.
type EquipmentTaxonomyResolver struct {
	classByAlias map[string]string
	typeByAlias  map[string]string
	unmapped     map[string]map[string]struct{}
}

// NewEquipmentTaxonomyResolver builds a resolver from the tenant dictionary.
// The built-in dictionary is always consulted as a fallback.
func NewEquipmentTaxonomyResolver(values []models.EquipmentTaxonomyValue) *EquipmentTaxonomyResolver {
	resolver := &EquipmentTaxonomyResolver{
		classByAlias: make(map[string]string),
		typeByAlias:  make(map[string]string),
		unmapped:     map[string]map[string]struct{}{},
	}
	for _, value := range values {
		if !value.IsActive {
			continue
		}
		label := value.Label()
		aliases := value.AliasList()
		// The code and canonical name always resolve, even if an operator forgot
		// to list them as aliases.
		aliases = append(aliases, value.CanonicalCode, value.CanonicalName, label)
		switch value.Kind {
		case models.EquipmentTaxonomyKindClass:
			resolver.register(resolver.classByAlias, aliases, label)
		case models.EquipmentTaxonomyKindType:
			resolver.register(resolver.typeByAlias, aliases, label)
		}
	}
	// Built-in fallback, registered last so a tenant entry always wins. The
	// parenthesised code is stripped as an extra alias so a workbook that
	// already carries the long name ("Piping") resolves as well as the code.
	for raw, label := range equipmentClassTranslations {
		resolver.register(resolver.classByAlias, []string{raw, label, stripTrailingCode(label)}, label)
	}
	for raw, label := range equipmentTypeTranslations {
		resolver.register(resolver.typeByAlias, []string{raw, label, stripTrailingCode(label)}, label)
	}
	return resolver
}

// stripTrailingCode removes every trailing " (…)" group so both
// "Piping (PI)" and "Adsorber (Ad) (AD)" also register their plain long name
// ("Piping", "Adsorber").
func stripTrailingCode(label string) string {
	trimmed := strings.TrimSpace(label)
	for {
		open := strings.LastIndex(trimmed, "(")
		if open <= 0 || !strings.HasSuffix(trimmed, ")") {
			break
		}
		next := strings.TrimSpace(trimmed[:open])
		if next == "" {
			break
		}
		trimmed = next
	}
	if trimmed == strings.TrimSpace(label) {
		return ""
	}
	return trimmed
}

// register maps every alias to the label without overwriting an earlier (tenant)
// mapping.
func (r *EquipmentTaxonomyResolver) register(index map[string]string, aliases []string, label string) {
	for _, alias := range aliases {
		key := normalizeTaxonomyKey(alias)
		if key == "" {
			continue
		}
		if _, exists := index[key]; !exists {
			index[key] = label
		}
	}
}

// ResolveClass returns the canonical Equipment Class label for a raw cell.
// Known values map to the tenant label; unknown values are returned unchanged
// and recorded for the import report.
func (r *EquipmentTaxonomyResolver) ResolveClass(raw string) string {
	return r.resolve(r.classByAlias, models.EquipmentTaxonomyKindClass, raw)
}

// ResolveType returns the canonical Equipment Type label for a raw cell.
func (r *EquipmentTaxonomyResolver) ResolveType(raw string) string {
	return r.resolve(r.typeByAlias, models.EquipmentTaxonomyKindType, raw)
}

func (r *EquipmentTaxonomyResolver) resolve(index map[string]string, kind, raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return raw
	}
	if label, ok := index[normalizeTaxonomyKey(trimmed)]; ok {
		return label
	}
	if r.unmapped[kind] == nil {
		r.unmapped[kind] = map[string]struct{}{}
	}
	r.unmapped[kind][trimmed] = struct{}{}
	return raw
}

// UnmappedValues returns the raw values the resolver could not map, keyed by
// kind ("class"/"type"). Both keys are always present so the import payload has
// a stable shape.
func (r *EquipmentTaxonomyResolver) UnmappedValues() map[string][]string {
	result := map[string][]string{
		models.EquipmentTaxonomyKindClass: {},
		models.EquipmentTaxonomyKindType:  {},
	}
	for kind, values := range r.unmapped {
		list := make([]string, 0, len(values))
		for value := range values {
			list = append(list, value)
		}
		sort.Strings(list)
		result[kind] = list
	}
	return result
}

// normalizeTaxonomyKey lower-cases, trims, and collapses internal whitespace so
// "Carbon  Steel" and "carbon steel" resolve to the same alias.
func normalizeTaxonomyKey(value string) string {
	return strings.ToLower(strings.Join(strings.Fields(value), " "))
}
