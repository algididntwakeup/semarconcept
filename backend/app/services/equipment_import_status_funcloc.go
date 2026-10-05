package services

import "strings"

// Data Transformation Layer for Equipment Status and Functional Location.
//
// The source system exports an installation status token and a free-text
// functional location that may embed a description in parentheses, for example
// `JI-JL-AG-11-PW (INLET SEPARATION)`. The import normalizes the status to the
// values the UI and statistics use (`Installed`/`Available`), flags whether a
// valid functional location exists, and splits the code from its description.

// Installation status values persisted by the Equipment Master import.
const (
	InstallationStatusInstalled = "Installed"
	InstallationStatusAvailable = "Available"
)

// NormalizeInstallationStatus maps the imported Equipment Status cell to the
// installation status used across the application:
//
//   - "Active" or "In Service" (case-insensitive, trimmed) becomes "Installed";
//   - a blank or dummy value (9999, N/A, NULL, …) becomes "Available";
//   - any other value is preserved verbatim.
func NormalizeInstallationStatus(value string) string {
	sanitized := sanitizeValue(value)
	if sanitized == nil {
		return InstallationStatusAvailable
	}
	trimmed := strings.TrimSpace(sanitized.(string))
	switch strings.ToUpper(trimmed) {
	case "ACTIVE", "IN SERVICE":
		return InstallationStatusInstalled
	default:
		return trimmed
	}
}

// ParseEquipmentImportFuncloc splits a functional location cell into its code
// and description and reports whether the cell carries a usable value.
//
// `JI-JL-AG-11-PW (INLET SEPARATION)` yields code `JI-JL-AG-11-PW` and
// description `INLET SEPARATION`. Every parenthesized group is joined with a
// single space, so `A-B (INLET) (SEPARATION)` yields `INLET SEPARATION`. A value
// without parentheses is treated as a bare code with no description. Blank or
// dummy values (9999, N/A, NULL, …) yield an empty code/description and false.
func ParseEquipmentImportFuncloc(value string) (code string, description string, hasFuncloc bool) {
	sanitized := sanitizeValue(value)
	if sanitized == nil {
		return "", "", false
	}
	raw := strings.TrimSpace(sanitized.(string))
	if raw == "" {
		return "", "", false
	}

	code = raw
	if open := strings.Index(raw, "("); open >= 0 {
		code = strings.TrimSpace(raw[:open])
	}
	description = strings.Join(extractParenthesizedGroups(raw), " ")
	return code, description, true
}

// extractParenthesizedGroups returns the trimmed content of every top-level
// parenthesized group in value, in the order they appear.
func extractParenthesizedGroups(value string) []string {
	groups := make([]string, 0)
	depth := 0
	start := -1
	for index, r := range value {
		switch r {
		case '(':
			if depth == 0 {
				start = index + 1
			}
			depth++
		case ')':
			if depth > 0 {
				depth--
				if depth == 0 && start >= 0 {
					if group := strings.TrimSpace(value[start:index]); group != "" {
						groups = append(groups, group)
					}
					start = -1
				}
			}
		}
	}
	return groups
}
