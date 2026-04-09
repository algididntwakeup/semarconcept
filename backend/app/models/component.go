// platform/backend/app/models/component.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Component represents inspectable components within Asset (shells, nozzles, internals)
type Component struct {
	ID                        int        `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID                  int        `gorm:"index;not null" db:"tenant_id" json:"tenant_id"`
	AssetID               int        `gorm:"index;not null" db:"equipment_id" json:"asset_id"`
	Name                      string     `gorm:"not null;size:255" db:"name" json:"name"`
	ComponentCode             *string    `gorm:"size:100" db:"component_code" json:"component_code"`
	ComponentType             *string    `gorm:"size:100" db:"component_type" json:"component_type"`
	ComponentClass            *string    `gorm:"size:100" db:"component_class" json:"component_class"`
	Material                  *string    `gorm:"size:255" db:"material" json:"material"`
	DesignThicknessMM         *float64   `gorm:"type:decimal(10,3)" db:"design_thickness_mm" json:"design_thickness_mm,omitempty"`
	CurrentThicknessMM        *float64   `gorm:"type:decimal(10,3)" db:"current_thickness_mm" json:"current_thickness_mm,omitempty"`
	MinimumThicknessMM        *float64   `gorm:"type:decimal(10,3)" db:"minimum_thickness_mm" json:"minimum_thickness_mm,omitempty"`
	DesignPressureBar         *float64   `gorm:"type:decimal(10,3)" db:"design_pressure_bar" json:"design_pressure_bar,omitempty"`
	DesignTemperatureC        *float64   `gorm:"type:decimal(10,3)" db:"design_temperature_c" json:"design_temperature_c,omitempty"`
	OperatingPressureBar      *float64   `gorm:"type:decimal(10,3)" db:"operating_pressure_bar" json:"operating_pressure_bar,omitempty"`
	OperatingTemperatureC     *float64   `gorm:"type:decimal(10,3)" db:"operating_temperature_c" json:"operating_temperature_c,omitempty"`
	InstallationDate          *time.Time `db:"installation_date" json:"installation_date,omitempty"`
	LastReplacementDate       *time.Time `db:"last_replacement_date" json:"last_replacement_date,omitempty"`
	NextReplacementDate       *time.Time `db:"next_replacement_date" json:"next_replacement_date,omitempty"`
	Specifications            JSONBMap   `gorm:"type:jsonb" db:"specifications" json:"specifications,omitempty"`
	Dimensions                JSONBMap   `gorm:"type:jsonb" db:"dimensions" json:"dimensions,omitempty"`
	LocationDescription       *string    `gorm:"type:text" db:"location_description" json:"location_description,omitempty"`
	Accessibility             *string    `gorm:"size:100" db:"accessibility" json:"accessibility"`
	InsulationType            *string    `gorm:"size:100" db:"insulation_type" json:"insulation_type"`
	CoatingType               *string    `gorm:"size:100" db:"coating_type" json:"coating_type"`
	CathodicProtection        *bool      `gorm:"default:false" db:"cathodic_protection" json:"cathodic_protection"`
	InspectionAccess          *string    `gorm:"size:100" db:"inspection_access" json:"inspection_access"`
	InspectionFrequencyMonths *int       `gorm:"default:12" db:"inspection_frequency_months" json:"inspection_frequency_months"`
	LastInspectionDate        *time.Time `db:"last_inspection_date" json:"last_inspection_date,omitempty"`
	NextInspectionDate        *time.Time `db:"next_inspection_date" json:"next_inspection_date,omitempty"`
	IntegrityStatus           *string    `gorm:"size:50;default:good" db:"integrity_status" json:"integrity_status"`
	FitnessForService         *string    `gorm:"size:50;default:fit" db:"fitness_for_service" json:"fitness_for_service"`
	RemainingLifeYears        *float64   `db:"remaining_life_years" json:"remaining_life_years"`
	ConfidenceLevel           *string    `gorm:"size:50;default:medium" db:"confidence_level" json:"confidence_level"`
	Status                    *string    `gorm:"size:50;default:active" db:"status" json:"status"`
	Criticality               *int       `gorm:"default:3" db:"criticality" json:"criticality"`
	ConsequenceOfFailure      *string    `gorm:"size:100" db:"consequence_of_failure" json:"consequence_of_failure"`
	SafetyCritical            *bool      `gorm:"default:false" db:"safety_critical" json:"safety_critical"`
	EnvironmentallyCritical   *bool      `gorm:"default:false" db:"environmentally_critical" json:"environmentally_critical"`
	Metadata                  JSONBMap   `gorm:"type:jsonb" db:"metadata" json:"metadata,omitempty"`
	CreatedAt                 time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt                 time.Time  `db:"updated_at" json:"updated_at"`
	CreatedBy                 *int       `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy                 *int       `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`

	// Relationships
	Tenant                *Tenant                `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Asset             *Asset             `gorm:"foreignKey:AssetID" json:"Asset,omitempty"`
	InspectionPoints      []InspectionPoint      `gorm:"foreignKey:ComponentID" json:"inspection_points,omitempty"`
	DegradationMechanisms []DegradationMechanism `gorm:"foreignKey:ComponentID" json:"degradation_mechanisms,omitempty"`
}

// Component status constants
const (
	ComponentStatusActive      = "active"
	ComponentStatusInactive    = "inactive"
	ComponentStatusMaintenance = "maintenance"
	ComponentStatusReplaced    = "replaced"
	ComponentStatusRetired     = "retired"
)

// Component type constants
const (
	ComponentTypeShell      = "shell"
	ComponentTypeHead       = "head"
	ComponentTypeNozzle     = "nozzle"
	ComponentTypeTubeBundle = "tube_bundle"
	ComponentTypeInternals  = "internals"
	ComponentTypePiping     = "piping"
	ComponentTypeSupport    = "support"
	ComponentTypeInsulation = "insulation"
	ComponentTypeFoundation = "foundation"
)

// Integrity status constants
const (
	IntegrityStatusExcellent = "excellent"
	IntegrityStatusGood      = "good"
	IntegrityStatusFair      = "fair"
	IntegrityStatusPoor      = "poor"
	IntegrityStatusCritical  = "critical"
)

// Fitness for service constants
const (
	FitnessForServiceFit        = "fit"
	FitnessForServiceFitReduced = "fit_reduced"
	FitnessForServiceMonitor    = "monitor"
	FitnessForServiceRepair     = "repair"
	FitnessForServiceReplace    = "replace"
)

// Accessibility constants
const (
	AccessibilityFull       = "full"
	AccessibilityLimited    = "limited"
	AccessibilityRestricted = "restricted"
	AccessibilityNo         = "no_access"
)

// Table name
func (Component) TableName() string {
	return "components"
}

// ToMap converts component to map for audit logging
func (c *Component) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":                          c.ID,
		"tenant_id":                   c.TenantID,
		"asset_id":                c.AssetID,
		"name":                        c.Name,
		"component_code":              c.ComponentCode,
		"component_type":              c.ComponentType,
		"component_class":             c.ComponentClass,
		"material":                    c.Material,
		"design_thickness_mm":         c.DesignThicknessMM,
		"current_thickness_mm":        c.CurrentThicknessMM,
		"minimum_thickness_mm":        c.MinimumThicknessMM,
		"design_pressure_bar":         c.DesignPressureBar,
		"design_temperature_c":        c.DesignTemperatureC,
		"operating_pressure_bar":      c.OperatingPressureBar,
		"operating_temperature_c":     c.OperatingTemperatureC,
		"installation_date":           c.InstallationDate,
		"last_replacement_date":       c.LastReplacementDate,
		"next_replacement_date":       c.NextReplacementDate,
		"specifications":              c.Specifications,
		"dimensions":                  c.Dimensions,
		"location_description":        c.LocationDescription,
		"accessibility":               c.Accessibility,
		"insulation_type":             c.InsulationType,
		"coating_type":                c.CoatingType,
		"cathodic_protection":         c.CathodicProtection,
		"inspection_access":           c.InspectionAccess,
		"inspection_frequency_months": c.InspectionFrequencyMonths,
		"last_inspection_date":        c.LastInspectionDate,
		"next_inspection_date":        c.NextInspectionDate,
		"integrity_status":            c.IntegrityStatus,
		"fitness_for_service":         c.FitnessForService,
		"remaining_life_years":        c.RemainingLifeYears,
		"confidence_level":            c.ConfidenceLevel,
		"status":                      c.Status,
		"criticality":                 c.Criticality,
		"consequence_of_failure":      c.ConsequenceOfFailure,
		"safety_critical":             c.SafetyCritical,
		"environmentally_critical":    c.EnvironmentallyCritical,
		"metadata":                    c.Metadata,
		"created_at":                  c.CreatedAt,
		"updated_at":                  c.UpdatedAt,
		"created_by":                  c.CreatedBy,
		"updated_by":                  c.UpdatedBy,
	}
}

// Helper methods
func (c *Component) IsActive() bool {
	return c.Status != nil && *c.Status == ComponentStatusActive
}

func (c *Component) IsCritical() bool {
	return (c.Criticality != nil && *c.Criticality >= 4) || (c.SafetyCritical != nil && *c.SafetyCritical) || (c.EnvironmentallyCritical != nil && *c.EnvironmentallyCritical)
}

func (c *Component) RequiresInspection() bool {
	if c.NextInspectionDate == nil {
		return true
	}
	return time.Now().After(*c.NextInspectionDate)
}

func (c *Component) IsOverdue() bool {
	if c.NextInspectionDate == nil {
		return false
	}
	return time.Now().After(c.NextInspectionDate.AddDate(0, 0, 30)) // 30 days grace period
}

func (c *Component) CalculateNextInspectionDate() {
	if c.LastInspectionDate != nil && c.InspectionFrequencyMonths != nil {
		nextDate := c.LastInspectionDate.AddDate(0, *c.InspectionFrequencyMonths, 0)
		c.NextInspectionDate = &nextDate
	}
}

func (c *Component) CalculateRemainingThickness() float64 {
	if c.CurrentThicknessMM != nil && c.MinimumThicknessMM != nil {
		return *c.CurrentThicknessMM - *c.MinimumThicknessMM
	}
	return 0
}

func (c *Component) CalculateThicknessUtilization() float64 {
	if c.DesignThicknessMM != nil && c.CurrentThicknessMM != nil && *c.DesignThicknessMM > 0 {
		return ((*c.DesignThicknessMM - *c.CurrentThicknessMM) / *c.DesignThicknessMM) * 100
	}
	return 0
}

func (c *Component) SetMetadata(key string, value interface{}) {
	if c.Metadata == nil {
		c.Metadata = make(JSONBMap)
	}
	c.Metadata[key] = value
}

func (c *Component) GetMetadata(key string) interface{} {
	if c.Metadata == nil {
		return nil
	}
	return c.Metadata[key]
}

func (c *Component) GenerateComponentCode() {
	if (c.ComponentCode == nil || *c.ComponentCode == "") && c.Name != "" {
		// Generate component code based on type and ID
		typePrefix := "COMP"
		if c.ComponentType != nil && *c.ComponentType != "" {
			switch *c.ComponentType {
			case ComponentTypeShell:
				typePrefix = "SH"
			case ComponentTypeHead:
				typePrefix = "HD"
			case ComponentTypeNozzle:
				typePrefix = "NZ"
			case ComponentTypeTubeBundle:
				typePrefix = "TB"
			case ComponentTypeInternals:
				typePrefix = "INT"
			case ComponentTypePiping:
				typePrefix = "PIP"
			}
		}
		tag := fmt.Sprintf("%s-%03d", typePrefix, c.ID)
		c.ComponentCode = &tag
	}
}

func (c *Component) Validate() error {
	if c.Name == "" {
		return fmt.Errorf("component name is required")
	}

	if c.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}

	if c.AssetID <= 0 {
		return fmt.Errorf("Asset ID is required")
	}

	if c.Criticality != nil && (*c.Criticality < 1 || *c.Criticality > 5) {
		return fmt.Errorf("criticality must be between 1 and 5")
	}

	if c.InspectionFrequencyMonths == nil || *c.InspectionFrequencyMonths <= 0 {
		months := 12
		c.InspectionFrequencyMonths = &months // Default to annual
	}

	if c.Status == nil || *c.Status == "" {
		active := ComponentStatusActive
		c.Status = &active
	}

	if c.IntegrityStatus == nil || *c.IntegrityStatus == "" {
		good := IntegrityStatusGood
		c.IntegrityStatus = &good
	}

	if c.FitnessForService == nil || *c.FitnessForService == "" {
		fit := FitnessForServiceFit
		c.FitnessForService = &fit
	}

	return nil
}

// BeforeCreate hook
func (c *Component) BeforeCreate(tx *gorm.DB) error {
	if c.Metadata == nil {
		c.Metadata = make(JSONBMap)
	}
	if c.Criticality == nil || *c.Criticality == 0 {
		val := 3
		c.Criticality = &val
	}
	c.CalculateNextInspectionDate()
	return c.Validate()
}

// BeforeUpdate hook
func (c *Component) BeforeUpdate(tx *gorm.DB) error {
	c.CalculateNextInspectionDate()
	return c.Validate()
}

// AfterCreate hook
func (c *Component) AfterCreate(tx *gorm.DB) error {
	if c.ComponentCode == nil || *c.ComponentCode == "" {
		c.GenerateComponentCode()
		return tx.Model(c).Update("component_code", c.ComponentCode).Error
	}
	return nil
}
