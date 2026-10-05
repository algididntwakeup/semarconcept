// platform/backend/app/models/functional_location.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// FunctionalLocation represents a node in the ISO 14224 functional location
// hierarchy. It uses the adjacency-list pattern: every node stores a
// self-referencing ParentID, and Level captures the depth (1 = installation,
// 8 = the deepest maintainable unit) so callers can query a whole branch or a
// single level without walking the tree.
type FunctionalLocation struct {
	ID          int    `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID    int    `gorm:"index;not null;uniqueIndex:idx_floc_tenant_code,priority:1" db:"tenant_id" json:"tenant_id"`
	ParentID    *int   `gorm:"index;index:idx_floc_parent,priority:1" db:"parent_id" json:"parent_id,omitempty"`
	Code        string `gorm:"size:150;not null;uniqueIndex:idx_floc_tenant_code,priority:2" db:"code" json:"code"`
	Description string `gorm:"type:text" db:"description" json:"description,omitempty"`
	// Level is the ISO 14224 functional hierarchy depth, constrained to 1..8 by
	// a CHECK constraint added in the migration.
	Level     int       `gorm:"not null;index" db:"level" json:"level"`
	IsActive  bool      `gorm:"not null;default:true" db:"is_active" json:"is_active"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
	CreatedBy *int      `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy *int      `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`

	// Relationships (adjacency list)
	Tenant   *Tenant              `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Parent   *FunctionalLocation  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []FunctionalLocation `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// Table name
func (FunctionalLocation) TableName() string {
	return "functional_locations"
}

// Functional location hierarchy level bounds (ISO 14224 functional tree).
const (
	FunctionalLocationMinLevel = 1
	FunctionalLocationMaxLevel = 8
)

// Validate enforces the invariants the database also guards with a CHECK
// constraint, so callers get a clear error before hitting the driver.
func (f *FunctionalLocation) Validate() error {
	if f.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}
	if f.Code == "" {
		return fmt.Errorf("functional location code is required")
	}
	if f.Level < FunctionalLocationMinLevel || f.Level > FunctionalLocationMaxLevel {
		return fmt.Errorf("functional location level must be between %d and %d", FunctionalLocationMinLevel, FunctionalLocationMaxLevel)
	}
	if f.ParentID != nil && *f.ParentID == f.ID && f.ID != 0 {
		return fmt.Errorf("functional location cannot be its own parent")
	}
	return nil
}

// BeforeCreate hook
func (f *FunctionalLocation) BeforeCreate(tx *gorm.DB) error {
	return f.Validate()
}

// BeforeUpdate hook
func (f *FunctionalLocation) BeforeUpdate(tx *gorm.DB) error {
	return f.Validate()
}
