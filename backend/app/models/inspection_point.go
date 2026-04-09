// platform/backend/app/models/inspection_point.go
package models

import (
	"gorm.io/gorm"
	"fmt"
	"time"

)

// InspectionPoint represents specific locations within components that require inspection
type InspectionPoint struct {
	ID                        int            `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantID                  int            `gorm:"index;not null" json:"tenant_id"`
	ComponentID               int            `gorm:"index;not null" json:"component_id"`
	PointIdentifier           string         `gorm:"not null;size:100" json:"point_identifier"`
	LocationDescription       *string        `gorm:"type:text" json:"location_description,omitempty"`
	InspectionMethod          string         `gorm:"size:100" json:"inspection_method"`
	Accessibility             string         `gorm:"size:100" json:"accessibility"`
	Orientation               string         `gorm:"size:50" json:"orientation"`
	Coordinates               JSONBMap       `gorm:"type:jsonb" json:"coordinates,omitempty"`
	GridReference             string         `gorm:"size:50" json:"grid_reference"`
	SurfaceCondition          string         `gorm:"size:100" json:"surface_condition"`
	InspectionFrequencyMonths int            `gorm:"default:12" json:"inspection_frequency_months"`
	LastInspectionDate        *time.Time     `json:"last_inspection_date,omitempty"`
	NextInspectionDate        *time.Time     `json:"next_inspection_date,omitempty"`
	BaselineThicknessMM       *float64       `gorm:"type:decimal(10,3)" json:"baseline_thickness_mm,omitempty"`
	MinimumThicknessMM        *float64       `gorm:"type:decimal(10,3)" json:"minimum_thickness_mm,omitempty"`
	CurrentThicknessMM        *float64       `gorm:"type:decimal(10,3)" json:"current_thickness_mm,omitempty"`
	CorrosionRateMMPY         *float64       `gorm:"type:decimal(10,6)" json:"corrosion_rate_mmpy,omitempty"`
	RemainingLifeYears        float64        `json:"remaining_life_years"`
	Status                    string         `gorm:"size:50;default:active" json:"status"`
	Notes                     *string        `gorm:"type:text" json:"notes,omitempty"`
	Metadata                  JSONBMap       `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt                 time.Time      `json:"created_at"`
	UpdatedAt                 time.Time      `json:"updated_at"`
	CreatedBy                 *int           `gorm:"index" json:"created_by,omitempty"`
	UpdatedBy                 *int           `gorm:"index" json:"updated_by,omitempty"`

	// Relationships
	Tenant    *Tenant    `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Component *Component `gorm:"foreignKey:ComponentID" json:"component,omitempty"`
}

// Inspection method constants
const (
	InspectionMethodUT       = "ultrasonic_testing"
	InspectionMethodRT       = "radiographic_testing"
	InspectionMethodMT       = "magnetic_particle"
	InspectionMethodPT       = "penetrant_testing"
	InspectionMethodET       = "eddy_current"
	InspectionMethodVisual   = "visual"
	InspectionMethodPIGS     = "intelligent_pigging"
	InspectionMethodAcoustic = "acoustic_emission"
)

// Table name
func (InspectionPoint) TableName() string {
	return "inspection_points"
}

// ToMap converts inspection point to map for audit logging
func (ip *InspectionPoint) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":                          ip.ID,
		"tenant_id":                   ip.TenantID,
		"component_id":                ip.ComponentID,
		"point_identifier":            ip.PointIdentifier,
		"location_description":        ip.LocationDescription,
		"inspection_method":           ip.InspectionMethod,
		"accessibility":               ip.Accessibility,
		"orientation":                 ip.Orientation,
		"coordinates":                 ip.Coordinates,
		"grid_reference":              ip.GridReference,
		"surface_condition":           ip.SurfaceCondition,
		"inspection_frequency_months": ip.InspectionFrequencyMonths,
		"last_inspection_date":        ip.LastInspectionDate,
		"next_inspection_date":        ip.NextInspectionDate,
		"baseline_thickness_mm":       ip.BaselineThicknessMM,
		"minimum_thickness_mm":        ip.MinimumThicknessMM,
		"current_thickness_mm":        ip.CurrentThicknessMM,
		"corrosion_rate_mmpy":         ip.CorrosionRateMMPY,
		"remaining_life_years":        ip.RemainingLifeYears,
		"status":                      ip.Status,
		"notes":                       ip.Notes,
		"metadata":                    ip.Metadata,
		"created_at":                  ip.CreatedAt,
		"updated_at":                  ip.UpdatedAt,
		"created_by":                  ip.CreatedBy,
		"updated_by":                  ip.UpdatedBy,
	}
}

// Helper methods
func (ip *InspectionPoint) IsActive() bool {
	return ip.Status == "active"
}

func (ip *InspectionPoint) RequiresInspection() bool {
	if ip.NextInspectionDate == nil {
		return true
	}
	return time.Now().After(*ip.NextInspectionDate)
}

func (ip *InspectionPoint) CalculateRemainingLife() {
	if ip.CurrentThicknessMM != nil && ip.MinimumThicknessMM != nil && ip.CorrosionRateMMPY != nil && *ip.CorrosionRateMMPY > 0 {
		remainingThickness := *ip.CurrentThicknessMM - *ip.MinimumThicknessMM
		ip.RemainingLifeYears = remainingThickness / *ip.CorrosionRateMMPY
	}
}

func (ip *InspectionPoint) CalculateNextInspectionDate() {
	if ip.LastInspectionDate != nil {
		nextDate := ip.LastInspectionDate.AddDate(0, ip.InspectionFrequencyMonths, 0)
		ip.NextInspectionDate = &nextDate
	}
}

func (ip *InspectionPoint) Validate() error {
	if ip.PointIdentifier == "" {
		return fmt.Errorf("point identifier is required")
	}

	if ip.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}

	if ip.ComponentID <= 0 {
		return fmt.Errorf("component ID is required")
	}

	if ip.InspectionFrequencyMonths <= 0 {
		ip.InspectionFrequencyMonths = 12
	}

	if ip.Status == "" {
		ip.Status = "active"
	}

	return nil
}

// BeforeCreate hook
func (ip *InspectionPoint) BeforeCreate(tx *gorm.DB) error {
	if ip.Metadata == nil {
		ip.Metadata = make(JSONBMap)
	}
	ip.CalculateRemainingLife()
	ip.CalculateNextInspectionDate()
	return ip.Validate()
}

// BeforeUpdate hook
func (ip *InspectionPoint) BeforeUpdate(tx *gorm.DB) error {
	ip.CalculateRemainingLife()
	ip.CalculateNextInspectionDate()
	return ip.Validate()
}
