// platform/backend/app/models/tenant_config.go
package models

import (
	"time"

)

// TenantConfig represents configuration settings for a tenant
type TenantConfig struct {
	ID          int            `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantID    int            `gorm:"index;not null" json:"tenant_id"`
	ConfigKey   string         `gorm:"size:100;not null" json:"config_key"`
	ConfigValue string         `gorm:"type:text;not null" json:"config_value"`
	DataType    string         `gorm:"size:20;default:string" json:"data_type"`
	Category    string         `gorm:"size:50;default:general" json:"category"`
	IsEncrypted bool           `gorm:"default:false" json:"is_encrypted"`
	Description string         `gorm:"size:500" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`

	// Relationships
	Tenant *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// Table name
func (TenantConfig) TableName() string {
	return "tenant_configs"
}

// Unique constraint
func (TenantConfig) UniqueIndex() string {
	return "idx_tenant_configs_tenant_key"
}

// Data type constants
const (
	ConfigDataTypeString  = "string"
	ConfigDataTypeInteger = "integer"
	ConfigDataTypeFloat   = "float"
	ConfigDataTypeBoolean = "boolean"
	ConfigDataTypeJSON    = "json"
	ConfigDataTypeArray   = "array"
)

// Category constants
const (
	ConfigCategoryGeneral      = "general"
	ConfigCategorySecurity     = "security"
	ConfigCategoryIntegration  = "integration"
	ConfigCategoryNotification = "notification"
	ConfigCategoryBranding     = "branding"
	ConfigCategoryBilling      = "billing"
)

// Helper methods
func (tc *TenantConfig) IsBoolean() bool {
	return tc.DataType == ConfigDataTypeBoolean
}

func (tc *TenantConfig) IsNumeric() bool {
	return tc.DataType == ConfigDataTypeInteger || tc.DataType == ConfigDataTypeFloat
}

func (tc *TenantConfig) GetBoolValue() bool {
	return tc.ConfigValue == "true" || tc.ConfigValue == "1"
}
