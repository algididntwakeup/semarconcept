// platform/backend/app/models/unit.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Unit represents process units within sites (distillation units, reactor units, etc.)
type Unit struct {
	ID                 int        `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID           int        `gorm:"index;not null" db:"tenant_id" json:"tenant_id"`
	SiteID             int        `gorm:"index;not null" db:"site_id" json:"site_id"`
	Name               string     `gorm:"not null;size:255" db:"name" json:"name"`
	Code               *string    `gorm:"size:50" db:"code" json:"code"`
	UnitType           *string    `gorm:"size:100" db:"unit_type" json:"unit_type"`
	ProcessDescription *string    `gorm:"type:text" db:"process_description" json:"process_description,omitempty"`
	DesignCapacity     *string    `gorm:"size:100" db:"design_capacity" json:"design_capacity,omitempty"`
	OperatingCapacity  *string    `gorm:"size:100" db:"operating_capacity" json:"operating_capacity,omitempty"`
	CommissionDate     *time.Time `db:"commission_date" json:"commission_date,omitempty"`
	DecommissionDate   *time.Time `db:"decommission_date" json:"decommission_date,omitempty"`
	ProcessConditions  JSONBMap   `gorm:"type:jsonb" db:"process_conditions" json:"process_conditions,omitempty"`
	SafetySystems      JSONBMap   `gorm:"type:jsonb" db:"safety_systems" json:"safety_systems,omitempty"`
	ControlSystems     JSONBMap   `gorm:"type:jsonb" db:"control_systems" json:"control_systems,omitempty"`
	Status             *string    `gorm:"size:50;default:active" db:"status" json:"status"`
	Criticality        *int       `gorm:"default:3" db:"criticality" json:"criticality"`
	Metadata           JSONBMap   `gorm:"type:jsonb" db:"metadata" json:"metadata,omitempty"`
	CreatedAt          time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time  `db:"updated_at" json:"updated_at"`
	CreatedBy          *int       `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy          *int       `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`
	DesignParameters   JSONBMap   `gorm:"type:jsonb" db:"design_parameters" json:"design_parameters,omitempty"`

	// Relationships
	Tenant    *Tenant     `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Site      *Site       `gorm:"foreignKey:SiteID" json:"site,omitempty"`
	Asset []Asset `gorm:"foreignKey:UnitID" json:"Asset,omitempty"`
}

// Unit status constants
const (
	UnitStatusActive         = "active"
	UnitStatusInactive       = "inactive"
	UnitStatusCommissioning  = "commissioning"
	UnitStatusDecommissioned = "decommissioned"
	UnitStatusMaintenance    = "maintenance"
	UnitStatusShutdown       = "shutdown"
)

// Unit type constants
const (
	UnitTypeDistillation  = "distillation"
	UnitTypeReactor       = "reactor"
	UnitTypeCompressor    = "compressor"
	UnitTypeTurbine       = "turbine"
	UnitTypeBoiler        = "boiler"
	UnitTypeHeatExchanger = "heat_exchanger"
	UnitTypeSeparation    = "separation"
	UnitTypeTreatment     = "treatment"
	UnitTypeUtility       = "utility"
)

// Table name
func (Unit) TableName() string {
	return "units"
}

// ToMap converts unit to map for audit logging
func (u *Unit) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":                  u.ID,
		"tenant_id":           u.TenantID,
		"site_id":             u.SiteID,
		"name":                u.Name,
		"code":                u.Code,
		"unit_type":           u.UnitType,
		"process_description": u.ProcessDescription,
		"design_capacity":     u.DesignCapacity,
		"operating_capacity":  u.OperatingCapacity,
		"commission_date":     u.CommissionDate,
		"decommission_date":   u.DecommissionDate,
		"process_conditions":  u.ProcessConditions,
		"safety_systems":      u.SafetySystems,
		"control_systems":     u.ControlSystems,
		"status":              u.Status,
		"criticality":         u.Criticality,
		"metadata":            u.Metadata,
		"created_at":          u.CreatedAt,
		"updated_at":          u.UpdatedAt,
		"created_by":          u.CreatedBy,
		"updated_by":          u.UpdatedBy,
		"design_parameters":   u.DesignParameters,
	}
}

// Helper methods
func (u *Unit) IsActive() bool {
	return u.Status != nil && *u.Status == UnitStatusActive
}

func (u *Unit) IsOperational() bool {
	return u.IsActive() && (u.CommissionDate == nil || time.Now().After(*u.CommissionDate))
}

func (u *Unit) IsCritical() bool {
	return u.Criticality != nil && *u.Criticality >= 4
}

func (u *Unit) SetMetadata(key string, value interface{}) {
	if u.Metadata == nil {
		u.Metadata = make(JSONBMap)
	}
	u.Metadata[key] = value
}

func (u *Unit) GetMetadata(key string) interface{} {
	if u.Metadata == nil {
		return nil
	}
	return u.Metadata[key]
}

func (u *Unit) GenerateCode() {
	if (u.Code == nil || *u.Code == "") && u.Name != "" {
		name := u.Name
		if len(name) > 3 {
			name = name[:3]
		}
		code := fmt.Sprintf("%s-%d", name, u.ID)
		u.Code = &code
	}
}

func (u *Unit) Validate() error {
	if u.Name == "" {
		return fmt.Errorf("unit name is required")
	}

	if u.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}

	if u.SiteID <= 0 {
		return fmt.Errorf("site ID is required")
	}

	if u.Criticality != nil && (*u.Criticality < 1 || *u.Criticality > 5) {
		return fmt.Errorf("criticality must be between 1 and 5")
	}

	if u.Status == nil || *u.Status == "" {
		status := UnitStatusActive
		u.Status = &status
	}

	return nil
}

// BeforeCreate hook
func (u *Unit) BeforeCreate(tx *gorm.DB) error {
	if u.Metadata == nil {
		u.Metadata = make(JSONBMap)
	}
	if u.Criticality == nil {
		criticality := 3
		u.Criticality = &criticality
	}
	return u.Validate()
}

// BeforeUpdate hook
func (u *Unit) BeforeUpdate(tx *gorm.DB) error {
	return u.Validate()
}

// AfterCreate hook
func (u *Unit) AfterCreate(tx *gorm.DB) error {
	if u.Code == nil || *u.Code == "" {
		u.GenerateCode()
		return tx.Model(u).Update("code", u.Code).Error
	}
	return nil
}
