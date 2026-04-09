package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// TaxonomyAttribute represents dynamic input fields required for specific taxonomy categories
type TaxonomyAttribute struct {
	ID            int               `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID      int               `gorm:"index;not null" db:"tenant_id" json:"tenant_id"`
	CategoryID    int               `gorm:"index;not null" db:"category_id" json:"category_id"`
	AttributeName string            `gorm:"not null;size:255" db:"attribute_name" json:"attribute_name"`
	AttributeKey  string            `gorm:"not null;size:100;index" db:"attribute_key" json:"attribute_key"` // e.g., mapping to specifications key
	DataType      string            `gorm:"size:50;not null;default:'string'" db:"data_type" json:"data_type"` // string, number, boolean, date, enum
	IsRequired    bool              `gorm:"default:false" db:"is_required" json:"is_required"`
	UnitOfMeasure string            `gorm:"size:50" db:"unit_of_measure" json:"unit_of_measure,omitempty"`
	DefaultValue  *string           `gorm:"size:255" db:"default_value" json:"default_value,omitempty"`
	Options       JSONBMap          `gorm:"type:jsonb" db:"options" json:"options,omitempty"` // For enum/drop-down types
	DisplayOrder  int               `gorm:"default:0" db:"display_order" json:"display_order"`
	IsActive      bool              `gorm:"default:true" db:"is_active" json:"is_active"`
	CreatedAt     time.Time         `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time         `db:"updated_at" json:"updated_at"`
	CreatedBy     *int              `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy     *int              `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`

	// Relationships
	Tenant   *Tenant           `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Category *TaxonomyCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

// Data type constants
const (
	AttributeTypeString  = "string"
	AttributeTypeNumber  = "number"
	AttributeTypeBoolean = "boolean"
	AttributeTypeDate    = "date"
	AttributeTypeEnum    = "enum"
)

// Table name
func (TaxonomyAttribute) TableName() string {
	return "taxonomy_attributes"
}

// ToMap converts attribute to map for audit logging
func (a *TaxonomyAttribute) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":              a.ID,
		"tenant_id":       a.TenantID,
		"category_id":     a.CategoryID,
		"attribute_name":  a.AttributeName,
		"attribute_key":   a.AttributeKey,
		"data_type":       a.DataType,
		"is_required":     a.IsRequired,
		"unit_of_measure": a.UnitOfMeasure,
		"default_value":   a.DefaultValue,
		"options":         a.Options,
		"display_order":   a.DisplayOrder,
		"is_active":       a.IsActive,
		"created_at":      a.CreatedAt,
		"updated_at":      a.UpdatedAt,
		"created_by":      a.CreatedBy,
		"updated_by":      a.UpdatedBy,
	}
}

// Validate taxonomy attribute
func (a *TaxonomyAttribute) Validate() error {
	if a.AttributeName == "" {
		return fmt.Errorf("attribute name is required")
	}
	if a.AttributeKey == "" {
		return fmt.Errorf("attribute key is required")
	}
	if a.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}
	if a.CategoryID <= 0 {
		return fmt.Errorf("category ID is required")
	}
	if a.DataType == "" {
		a.DataType = AttributeTypeString
	}
	return nil
}

// BeforeCreate hook
func (a *TaxonomyAttribute) BeforeCreate(tx *gorm.DB) error {
	if a.Options == nil {
		a.Options = make(JSONBMap)
	}
	return a.Validate()
}

// BeforeUpdate hook
func (a *TaxonomyAttribute) BeforeUpdate(tx *gorm.DB) error {
	return a.Validate()
}
