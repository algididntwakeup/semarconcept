package services

import "strings"

// Master Functional Location dictionary.
//
// The Equipment Master worksheet only carries functional-location codes (for
// example `JI-JL-AG-11-PW`); the human-readable description that the legacy
// system shows in parentheses (`INLET SEPARATION & PRODUCED WATER SYSTEM …`)
// comes from a separate master-FLOC reference. That reference is maintained by
// engineering and is not yet available in this repository, so this dictionary
// is the single place to load it.
//
// Until the master list is provided, lookups fall back to the bare code, so the
// import never blocks on missing reference data. Replace the map below with the
// engineering master list when it is ready; the keys are the FLOC codes exactly
// as they appear in the worksheet.
var equipmentFunclocMaster = map[string]string{
	// Example entry (kept commented until the master list is supplied):
	// "JI-JL-AG-11-PW": "INLET SEPARATION & PRODUCED WATER SYSTEM PRODUCED WATER STORAGE TANK",
}

// lookupFunclocDescription returns the master description for a functional
// location code, or an empty string when the code is unknown.
func lookupFunclocDescription(code string) string {
	trimmed := strings.TrimSpace(code)
	if trimmed == "" {
		return ""
	}
	return strings.TrimSpace(equipmentFunclocMaster[strings.ToUpper(trimmed)])
}

// FormatParentFuncloc renders the parent functional location as
// "CODE (DESCRIPTION)". The description is resolved from the master FLOC
// dictionary first; when the code is not in the master, an inline description
// carried by the worksheet is used instead. When neither is available, the
// bare code is returned.
func FormatParentFuncloc(code, inlineDescription string) string {
	trimmed := strings.TrimSpace(code)
	if trimmed == "" {
		return ""
	}
	description := lookupFunclocDescription(trimmed)
	if description == "" {
		description = strings.TrimSpace(inlineDescription)
	}
	if description != "" {
		return trimmed + " (" + description + ")"
	}
	return trimmed
}

// FormatLevel6Funcloc renders the level-6 functional location as
// "INSTALLED (TAG)". The installed functional location is the source of truth;
// when it is missing the level-6 value is omitted (empty string) rather than
// invented from the tag. When the tag is missing it is duplicated from the
// installed code so the label keeps the legacy shape.
func FormatLevel6Funcloc(installedFuncloc, tagNumber string) string {
	installed := strings.TrimSpace(installedFuncloc)
	if installed == "" {
		return ""
	}
	tag := strings.TrimSpace(tagNumber)
	if tag == "" {
		tag = installed
	}
	return installed + " (" + tag + ")"
}
