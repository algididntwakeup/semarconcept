// platform/backend/app/utils/asset_helpers.go
package utils

import (
	"fmt"
)

// Asset validation utilities (no error redeclarations!)
func ValidateAssetStatus(status string) error {
	validStatuses := map[string]bool{
		"active":         true,
		"inactive":       true,
		"maintenance":    true,
		"decommissioned": true,
		"planned":        true,
	}

	if !validStatuses[status] {
		return ErrInvalidStatus
	}
	return nil
}

func ValidateAssetCriticality(criticality int) error {
	if criticality < 1 || criticality > 5 {
		return ErrInvalidCriticality
	}
	return nil
}

// Asset type validation
func ValidateAssetType(assetType, hierarchyLevel string) error {
	validTypes := map[string][]string{
		"site": {
			"refinery", "chemical_plant", "power_plant",
			"offshore_platform", "onshore_facility", "terminal", "warehouse",
		},
		"unit": {
			"distillation", "reactor", "compressor", "turbine",
			"boiler", "heat_exchanger", "separation", "treatment", "utility",
		},
		"Asset": {
			"pressure_vessel", "heat_exchanger", "pump", "compressor",
			"turbine", "tank", "piping", "valve", "instrumentation",
		},
		"component": {
			"shell", "head", "nozzle", "tube_bundle", "internals",
			"piping", "support", "insulation", "foundation",
		},
	}

	validTypesForLevel, exists := validTypes[hierarchyLevel]
	if !exists {
		return fmt.Errorf("invalid hierarchy level: %s", hierarchyLevel)
	}

	for _, validType := range validTypesForLevel {
		if validType == assetType {
			return nil
		}
	}

	return fmt.Errorf("invalid asset type '%s' for hierarchy level '%s'", assetType, hierarchyLevel)
}

// Asset-specific helper functions
func FormatAssetCode(prefix string, id int) string {
	return fmt.Sprintf("%s-%05d", prefix, id)
}

func GetAssetTypePrefix(assetType string) string {
	prefixes := map[string]string{
		// Sites
		"refinery":          "REF",
		"chemical_plant":    "CHE",
		"power_plant":       "PWR",
		"offshore_platform": "OFF",
		"onshore_facility":  "ONS",
		"terminal":          "TER",
		"warehouse":         "WAR",

		// Units
		"distillation":   "DIS",
		"reactor":        "REA",
		"compressor":     "COM",
		"turbine":        "TUR",
		"boiler":         "BOI",
		"heat_exchanger": "HEX",
		"separation":     "SEP",
		"treatment":      "TRE",
		"utility":        "UTI",

		// Asset
		"pressure_vessel": "PV",
		"pump":            "P",
		"tank":            "TK",
		"piping":          "PIP",
		"valve":           "V",
		"instrumentation": "INS",

		// Components
		"shell":       "SH",
		"head":        "HD",
		"nozzle":      "NZ",
		"tube_bundle": "TB",
		"internals":   "INT",
		"support":     "SUP",
		"insulation":  "ISL",
		"foundation":  "FND",
	}

	if prefix, exists := prefixes[assetType]; exists {
		return prefix
	}
	return "AST" // Default prefix
}

// Calculate asset health score
func CalculateAssetHealthScore(factors map[string]float64) float64 {
	if len(factors) == 0 {
		return 0.0
	}

	var total float64
	for _, score := range factors {
		total += score
	}

	return total / float64(len(factors))
}

// Determine criticality level from score
func GetCriticalityLevel(score float64) int {
	switch {
	case score >= 90:
		return 5 // Critical
	case score >= 70:
		return 4 // High
	case score >= 50:
		return 3 // Medium
	case score >= 30:
		return 2 // Low
	default:
		return 1 // Very Low
	}
}

// Convert integrity status to health score
func IntegrityStatusToScore(status string) float64 {
	scores := map[string]float64{
		"excellent": 95.0,
		"good":      80.0,
		"fair":      60.0,
		"poor":      40.0,
		"critical":  20.0,
	}

	if score, exists := scores[status]; exists {
		return score
	}
	return 50.0 // Default medium score
}

// Asset hierarchy path builder
func BuildHierarchyPath(siteName, unitName, AssetName, componentName string) string {
	var path string

	if siteName != "" {
		path = siteName
	}

	if unitName != "" {
		if path != "" {
			path += " / "
		}
		path += unitName
	}

	if AssetName != "" {
		if path != "" {
			path += " / "
		}
		path += AssetName
	}

	if componentName != "" {
		if path != "" {
			path += " / "
		}
		path += componentName
	}

	return path
}
