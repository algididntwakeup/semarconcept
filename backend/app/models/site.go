// platform/backend/app/models/site.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Site represents the top-level asset hierarchy (plants, facilities, refineries)
type Site struct {
	ID                   int        `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID             int        `gorm:"index;not null" db:"tenant_id" json:"tenant_id"`
	Name                 string     `gorm:"not null;size:255" db:"name" json:"name"`
	Code                 *string    `gorm:"size:50" db:"code" json:"code"`
	SiteType             *string    `gorm:"size:100" db:"site_type" json:"site_type"`
	Location             *string    `gorm:"size:500" db:"location" json:"location"`
	Slug                 *string    `gorm:"size:100" db:"slug" json:"slug"`
	Address              JSONBMap   `gorm:"type:jsonb" db:"address" json:"address,omitempty"`
	Coordinates          JSONBMap   `gorm:"type:jsonb" db:"coordinates" json:"coordinates,omitempty"`
	CommissionDate       *time.Time `db:"commission_date" json:"commission_date,omitempty"`
	DecommissionDate     *time.Time `db:"decommission_date" json:"decommission_date,omitempty"`
	Description          *string    `gorm:"type:text" db:"description" json:"description,omitempty"`
	ContactInfo          JSONBMap   `gorm:"type:jsonb" db:"contact_info" json:"contact_info,omitempty"`
	OperatingConditions  JSONBMap   `gorm:"type:jsonb" db:"operating_conditions" json:"operating_conditions,omitempty"`
	EnvironmentalFactors JSONBMap   `gorm:"type:jsonb" db:"environmental_factors" json:"environmental_factors,omitempty"`
	Status               *string    `gorm:"size:50;default:active" db:"status" json:"status"`
	Metadata             JSONBMap   `gorm:"type:jsonb" db:"metadata" json:"metadata,omitempty"`
	CreatedAt            time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt            time.Time  `db:"updated_at" json:"updated_at"`
	CreatedBy            *int       `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy            *int       `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`
	Settings             JSONBMap   `gorm:"type:jsonb" db:"settings" json:"settings,omitempty"`

	// Relationships
	Tenant *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Units  []Unit  `gorm:"foreignKey:SiteID" json:"units,omitempty"`
}

// Site status constants
const (
	SiteStatusActive         = "active"
	SiteStatusInactive       = "inactive"
	SiteStatusCommissioning  = "commissioning"
	SiteStatusDecommissioned = "decommissioned"
	SiteStatusMaintenance    = "maintenance"
)

// Site type constants
const (
	SiteTypeRefinery      = "refinery"
	SiteTypeChemicalPlant = "chemical_plant"
	SiteTypePowerPlant    = "power_plant"
	SiteTypeOffshore      = "offshore_platform"
	SiteTypeOnshore       = "onshore_facility"
	SiteTypeTerminal      = "terminal"
	SiteTypeWarehouse     = "warehouse"
)

// Table name
func (Site) TableName() string {
	return "sites"
}

// ToMap converts site to map for audit logging
func (s *Site) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":                    s.ID,
		"tenant_id":             s.TenantID,
		"name":                  s.Name,
		"code":                  s.Code,
		"site_type":             s.SiteType,
		"location":              s.Location,
		"address":               s.Address,
		"coordinates":           s.Coordinates,
		"commission_date":       s.CommissionDate,
		"decommission_date":     s.DecommissionDate,
		"description":           s.Description,
		"contact_info":          s.ContactInfo,
		"operating_conditions":  s.OperatingConditions,
		"environmental_factors": s.EnvironmentalFactors,
		"status":                s.Status,
		"metadata":              s.Metadata,
		"created_at":            s.CreatedAt,
		"updated_at":            s.UpdatedAt,
		"created_by":            s.CreatedBy,
		"updated_by":            s.UpdatedBy,
		"settings":              s.Settings,
		"slug":                  s.Slug,
	}
}

// Helper methods
func (s *Site) IsActive() bool {
	return s.Status != nil && *s.Status == SiteStatusActive
}

func (s *Site) IsCommissioned() bool {
	return s.IsActive() && (s.CommissionDate == nil || time.Now().After(*s.CommissionDate))
}

func (s *Site) IsDecommissioned() bool {
	return (s.Status != nil && *s.Status == SiteStatusDecommissioned) || (s.DecommissionDate != nil && time.Now().After(*s.DecommissionDate))
}

func (s *Site) SetMetadata(key string, value interface{}) {
	if s.Metadata == nil {
		s.Metadata = make(JSONBMap)
	}
	s.Metadata[key] = value
}

func (s *Site) GetMetadata(key string) interface{} {
	if s.Metadata == nil {
		return nil
	}
	return s.Metadata[key]
}

func (s *Site) GenerateCode() {
	if (s.Code == nil || *s.Code == "") && s.Name != "" {
		// Generate a simple code from name (first 3 chars + ID)
		name := s.Name
		if len(name) > 3 {
			name = name[:3]
		}
		code := fmt.Sprintf("%s-%d", name, s.ID)
		s.Code = &code
	}
}

func (s *Site) Validate() error {
	if s.Name == "" {
		return fmt.Errorf("site name is required")
	}

	if s.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}

	if s.Status == nil || *s.Status == "" {
		status := SiteStatusActive
		s.Status = &status
	}

	return nil
}

// BeforeCreate hook
func (s *Site) BeforeCreate(tx *gorm.DB) error {
	if s.Metadata == nil {
		s.Metadata = make(JSONBMap)
	}
	return s.Validate()
}

// BeforeUpdate hook
func (s *Site) BeforeUpdate(tx *gorm.DB) error {
	return s.Validate()
}

// AfterCreate hook
func (s *Site) AfterCreate(tx *gorm.DB) error {
	if s.Code == nil || *s.Code == "" {
		s.GenerateCode()
		return tx.Model(s).Update("code", s.Code).Error
	}
	return nil
}
