// platform/backend/app/models/degradation_mechanism.go
package models

import (
	"gorm.io/gorm"
	"fmt"
	"time"

)

// DegradationMechanism represents failure modes and degradation mechanisms affecting components
type DegradationMechanism struct {
	ID                     int            `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantID               int            `gorm:"index;not null" json:"tenant_id"`
	ComponentID            int            `gorm:"index;not null" json:"component_id"`
	MechanismType          string         `gorm:"not null;size:100" json:"mechanism_type"`
	MechanismName          string         `gorm:"not null;size:255" json:"mechanism_name"`
	Description            *string        `gorm:"type:text" json:"description,omitempty"`
	Susceptibility         float64        `gorm:"type:decimal(5,2)" json:"susceptibility"`
	DetectionMethod        string         `gorm:"size:100" json:"detection_method"`
	Rate                   float64        `gorm:"type:decimal(10,6)" json:"rate"`
	RateUnits              string         `gorm:"size:50" json:"rate_units"`
	IdentificationDate     *time.Time     `json:"identification_date,omitempty"`
	Parameters             JSONBMap       `gorm:"type:jsonb" json:"parameters,omitempty"`
	EnvironmentalFactors   JSONBMap       `gorm:"type:jsonb" json:"environmental_factors,omitempty"`
	MitigationMeasures     *string        `gorm:"type:text" json:"mitigation_measures,omitempty"`
	MonitoringRequirements string         `gorm:"size:255" json:"monitoring_requirements"`
	Status                 string         `gorm:"size:50;default:active" json:"status"`
	CreatedAt              time.Time      `json:"created_at"`
	UpdatedAt              time.Time      `json:"updated_at"`
	CreatedBy              *int           `gorm:"index" json:"created_by,omitempty"`
	UpdatedBy              *int           `gorm:"index" json:"updated_by,omitempty"`

	// Relationships
	Tenant    *Tenant    `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Component *Component `gorm:"foreignKey:ComponentID" json:"component,omitempty"`
}

// Degradation mechanism type constants
const (
	DegradationTypeCorrosion         = "corrosion"
	DegradationTypeErosion           = "erosion"
	DegradationTypeFatigue           = "fatigue"
	DegradationTypeCreep             = "creep"
	DegradationTypeBrittleFracture   = "brittle_fracture"
	DegradationTypeSCC               = "stress_corrosion_cracking"
	DegradationTypeHIC               = "hydrogen_induced_cracking"
	DegradationTypeThermalFatigue    = "thermal_fatigue"
	DegradationTypeWearAbrasion      = "wear_abrasion"
	DegradationTypePitting           = "pitting"
	DegradationTypeCreviceCorrosion  = "crevice_corrosion"
	DegradationTypeGalvanicCorrosion = "galvanic_corrosion"
)

// Detection method constants
const (
	DetectionMethodVisual          = "visual_inspection"
	DetectionMethodNDT             = "ndt_testing"
	DetectionMethodMonitoring      = "condition_monitoring"
	DetectionMethodSampling        = "sampling_analysis"
	DetectionMethodInstrumentation = "instrumentation"
)

// Table name
func (DegradationMechanism) TableName() string {
	return "degradation_mechanisms"
}

// ToMap converts degradation mechanism to map for audit logging
func (dm *DegradationMechanism) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":                      dm.ID,
		"tenant_id":               dm.TenantID,
		"component_id":            dm.ComponentID,
		"mechanism_type":          dm.MechanismType,
		"mechanism_name":          dm.MechanismName,
		"description":             dm.Description,
		"susceptibility":          dm.Susceptibility,
		"detection_method":        dm.DetectionMethod,
		"rate":                    dm.Rate,
		"rate_units":              dm.RateUnits,
		"identification_date":     dm.IdentificationDate,
		"parameters":              dm.Parameters,
		"environmental_factors":   dm.EnvironmentalFactors,
		"mitigation_measures":     dm.MitigationMeasures,
		"monitoring_requirements": dm.MonitoringRequirements,
		"status":                  dm.Status,
		"created_at":              dm.CreatedAt,
		"updated_at":              dm.UpdatedAt,
		"created_by":              dm.CreatedBy,
		"updated_by":              dm.UpdatedBy,
	}
}

// Helper methods
func (dm *DegradationMechanism) IsActive() bool {
	return dm.Status == "active"
}

func (dm *DegradationMechanism) IsHighSusceptibility() bool {
	return dm.Susceptibility >= 0.7 // 70% or higher
}

func (dm *DegradationMechanism) IsSignificantRate() bool {
	return dm.Rate > 0.1 // Depends on units, this is a placeholder
}

func (dm *DegradationMechanism) Validate() error {
	if dm.MechanismName == "" {
		return fmt.Errorf("mechanism name is required")
	}

	if dm.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}

	if dm.ComponentID <= 0 {
		return fmt.Errorf("component ID is required")
	}

	if dm.Susceptibility < 0 || dm.Susceptibility > 1 {
		return fmt.Errorf("susceptibility must be between 0 and 1")
	}

	if dm.Status == "" {
		dm.Status = "active"
	}

	return nil
}

// BeforeCreate hook
func (dm *DegradationMechanism) BeforeCreate(tx *gorm.DB) error {
	if dm.Parameters == nil {
		dm.Parameters = make(JSONBMap)
	}
	if dm.EnvironmentalFactors == nil {
		dm.EnvironmentalFactors = make(JSONBMap)
	}
	return dm.Validate()
}

// BeforeUpdate hook
func (dm *DegradationMechanism) BeforeUpdate(tx *gorm.DB) error {
	return dm.Validate()
}
