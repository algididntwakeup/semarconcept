// platform/backend/app/models/tenant.go
package models

import (
	"time"

	"gorm.io/gorm"
)

// Tenant represents a tenant in the multi-tenant system
type Tenant struct {
	ID               int        `json:"id" gorm:"primaryKey"`
	Name             string     `json:"name" gorm:"type:varchar(100);not null"`
	Subdomain        string     `json:"subdomain" gorm:"type:varchar(50);not null;uniqueIndex"`
	Domain           *string    `json:"domain" gorm:"type:varchar(100);uniqueIndex"`
	Slug             string     `json:"slug" gorm:"type:varchar(100);not null;uniqueIndex"`
	Status           string     `json:"status" gorm:"type:varchar(20);default:'active';index"`
	SubscriptionPlan string     `json:"subscription_plan" gorm:"type:varchar(50);default:'basic';index"`
	MaxUsers         int        `json:"max_users" gorm:"default:10"`
	MaxStorageGB     int        `json:"max_storage_gb" gorm:"default:5"`
	Settings         *string    `json:"settings" gorm:"type:jsonb;default:'{}'"`
	Metadata         *string    `json:"metadata" gorm:"type:jsonb;default:'{}'"`
	CreatedAt        time.Time  `json:"created_at" gorm:"autoCreateTime;index"`
	UpdatedAt        time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy        *int       `json:"created_by" gorm:"index"`
	UpdatedBy        *int       `json:"updated_by" gorm:"index"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	// Relationships
	Users    []User          `json:"users,omitempty" gorm:"foreignKey:TenantID"`
	Branding *TenantBranding `json:"branding,omitempty" gorm:"foreignKey:TenantID"`
	Billing  *TenantBilling  `json:"billing,omitempty" gorm:"foreignKey:TenantID"`
	Configs  []TenantConfig  `json:"configs,omitempty" gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for GORM
func (Tenant) TableName() string {
	return "tenants"
}

// BeforeCreate GORM hook
func (t *Tenant) BeforeCreate(tx *gorm.DB) error {
	// Set default settings if empty
	if t.Settings == nil {
		defaultSettings := GetDefaultTenantSettings()
		t.Settings = &defaultSettings
	}
	// Set default metadata if empty
	if t.Metadata == nil {
		defaultMetadata := "{}"
		t.Metadata = &defaultMetadata
	}
	// Generate slug from subdomain if not provided
	if t.Slug == "" {
		t.Slug = t.Subdomain
	}
	return nil
}

// BeforeUpdate GORM hook
func (t *Tenant) BeforeUpdate(tx *gorm.DB) error {
	return nil
}

// SetSetting sets a specific setting in the settings JSON
func (t *Tenant) SetSetting(key string, value interface{}) error {
	// TODO: Implement proper JSON manipulation using encoding/json
	// For now, this is a placeholder that doesn't cause compilation errors
	return nil
}

// GetSetting gets a specific setting from the settings JSON
func (t *Tenant) GetSetting(key string) (interface{}, error) {
	// TODO: Implement proper JSON manipulation using encoding/json
	return nil, nil
}

// CanAddUsers checks if tenant can add more users based on subscription limits
func (t *Tenant) CanAddUsers() bool {
	// TODO: Implement actual user counting logic
	// This method is used in tenant_service.go
	return true
}

// IsActive checks if tenant is in active status
func (t *Tenant) IsActive() bool {
	return t.Status == TenantStatusActive && t.DeletedAt == nil
}

// IsSoftDeleted checks if tenant is soft deleted
func (t *Tenant) IsSoftDeleted() bool {
	return t.DeletedAt != nil
}

// GetDefaultTenantSettings returns default tenant settings JSON
func GetDefaultTenantSettings() string {
	return `{"theme":"light","timezone":"UTC","language":"en","notifications":true,"two_factor_auth":false}`
}

// Tenant status constants
const (
	TenantStatusActive    = "active"
	TenantStatusInactive  = "inactive"
	TenantStatusSuspended = "suspended"
	TenantStatusDeleted   = "deleted"
)
