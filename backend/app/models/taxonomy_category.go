package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// TaxonomyCategory represents a category/node in the asset taxonomy tree (ISO 14224)
type TaxonomyCategory struct {
	ID          int                `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID    int                `gorm:"index;not null" db:"tenant_id" json:"tenant_id"`
	ParentID    *int               `gorm:"index" db:"parent_id" json:"parent_id,omitempty"`
	Level       int                `gorm:"not null" db:"level" json:"level"` // e.g. 1=Industry, 2=Business Category, 6=Asset Class
	Name        string             `gorm:"not null;size:255" db:"name" json:"name"`
	Code        string             `gorm:"size:100;index" db:"code" json:"code"`
	Description string             `gorm:"type:text" db:"description" json:"description,omitempty"`
	IsActive    bool               `gorm:"default:true" db:"is_active" json:"is_active"`
	CreatedAt   time.Time          `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `db:"updated_at" json:"updated_at"`
	CreatedBy   *int               `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy   *int               `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`

	// Relationships
	Tenant     *Tenant             `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Parent     *TaxonomyCategory   `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children   []TaxonomyCategory  `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Attributes []TaxonomyAttribute `gorm:"foreignKey:CategoryID" json:"attributes,omitempty"`
}

// Table name
func (TaxonomyCategory) TableName() string {
	return "taxonomy_categories"
}

// ToMap converts category to map for audit logging
func (t *TaxonomyCategory) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":          t.ID,
		"tenant_id":   t.TenantID,
		"parent_id":   t.ParentID,
		"level":       t.Level,
		"name":        t.Name,
		"code":        t.Code,
		"description": t.Description,
		"is_active":   t.IsActive,
		"created_at":  t.CreatedAt,
		"updated_at":  t.UpdatedAt,
		"created_by":  t.CreatedBy,
		"updated_by":  t.UpdatedBy,
	}
}

// Validate taxonomy category
func (t *TaxonomyCategory) Validate() error {
	if t.Name == "" {
		return fmt.Errorf("taxonomy category name is required")
	}
	if t.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}
	if t.Level <= 0 {
		return fmt.Errorf("taxonomy level must be greater than 0")
	}
	return nil
}

// BeforeCreate hook
func (t *TaxonomyCategory) BeforeCreate(tx *gorm.DB) error {
	return t.Validate()
}

// BeforeUpdate hook
func (t *TaxonomyCategory) BeforeUpdate(tx *gorm.DB) error {
	return t.Validate()
}
