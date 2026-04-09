// platform/backend/app/models/system_config.go
package models

import (
	"time"
)

// SystemConfig represents system configuration entries matching your database schema
type SystemConfig struct {
	ID          int       `db:"id" json:"id" gorm:"primaryKey"`
	ConfigKey   string    `db:"config_key" json:"config_key" gorm:"type:varchar(100);not null;uniqueIndex"`
	ConfigValue string    `db:"config_value" json:"config_value" gorm:"type:text;not null"`
	DataType    string    `db:"data_type" json:"data_type" gorm:"type:varchar(20);not null"`
	IsEncrypted bool      `db:"is_encrypted" json:"is_encrypted" gorm:"default:false;not null"`
	Description *string   `db:"description" json:"description,omitempty" gorm:"type:text"`
	CreatedAt   time.Time `db:"created_at" json:"created_at" gorm:"default:now();not null"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at" gorm:"default:now();not null"`
	UpdatedBy   *int      `db:"updated_by" json:"updated_by,omitempty"`
	CategoryID  *int      `db:"category_id" json:"category_id,omitempty"`
	TenantID    *int      `db:"tenant_id" json:"tenant_id,omitempty"`

	// Relationships (optional - for GORM if needed)
	UpdatedByUser *User           `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Category      *ConfigCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Tenant        *Tenant         `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// TableName specifies the table name for GORM
func (SystemConfig) TableName() string {
	return "system_configs"
}

// Validate checks if the system config data is valid
func (sc *SystemConfig) Validate() error {
	if sc.ConfigKey == "" {
		return &ValidationError{Field: "config_key", Message: "Configuration key cannot be empty"}
	}
	if sc.ConfigValue == "" {
		return &ValidationError{Field: "config_value", Message: "Configuration value cannot be empty"}
	}
	if sc.DataType == "" {
		return &ValidationError{Field: "data_type", Message: "Data type cannot be empty"}
	}
	return nil
}

// GetValueAsString returns the config value as string
func (sc *SystemConfig) GetValueAsString() string {
	return sc.ConfigValue
}

// GetValueAsBool returns the config value as boolean
func (sc *SystemConfig) GetValueAsBool() bool {
	return sc.ConfigValue == "true" || sc.ConfigValue == "1"
}

// IsSystemLevel checks if this is a system-level configuration (no tenant)
func (sc *SystemConfig) IsSystemLevel() bool {
	return sc.TenantID == nil
}

// IsTenantLevel checks if this is a tenant-specific configuration
func (sc *SystemConfig) IsTenantLevel() bool {
	return sc.TenantID != nil
}

// ConfigCategory represents configuration categories (if you need this model)
type ConfigCategory struct {
	ID          int       `db:"id" json:"id" gorm:"primaryKey"`
	Name        string    `db:"name" json:"name" gorm:"type:varchar(100);not null"`
	Description *string   `db:"description" json:"description,omitempty" gorm:"type:text"`
	CreatedAt   time.Time `db:"created_at" json:"created_at" gorm:"default:now();not null"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at" gorm:"default:now();not null"`
}

// TableName specifies the table name for GORM
func (ConfigCategory) TableName() string {
	return "config_categories"
}
