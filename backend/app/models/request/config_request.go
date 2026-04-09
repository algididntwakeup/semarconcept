// platform/backend/app/models/request/config_request.go

package request

import (
	"errors"
	"strings"
)

// CreateConfigRequest represents the request structure for creating a new configuration
type CreateConfigRequest struct {
	ConfigKey   string  `json:"config_key" binding:"required" validate:"required,min=1,max=100"`
	ConfigValue string  `json:"config_value" binding:"required" validate:"required"`
	DataType    string  `json:"data_type" binding:"required" validate:"required,oneof=string integer boolean float json"`
	IsEncrypted bool    `json:"is_encrypted,omitempty"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	CategoryID  *int    `json:"category_id,omitempty"`
	TenantID    *int    `json:"tenant_id,omitempty"`
}

// UpdateConfigRequest represents the request structure for updating an existing configuration
type UpdateConfigRequest struct {
	ConfigValue string  `json:"config_value,omitempty" validate:"omitempty"`
	DataType    string  `json:"data_type,omitempty" validate:"omitempty,oneof=string integer boolean float json"`
	IsEncrypted *bool   `json:"is_encrypted,omitempty"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	CategoryID  *int    `json:"category_id,omitempty"`
}

// Validate validates the CreateConfigRequest
func (r *CreateConfigRequest) Validate() error {
	if strings.TrimSpace(r.ConfigKey) == "" {
		return errors.New("config_key cannot be empty")
	}

	if strings.TrimSpace(r.ConfigValue) == "" {
		return errors.New("config_value cannot be empty")
	}

	// Validate data_type
	validDataTypes := map[string]bool{
		"string":  true,
		"integer": true,
		"boolean": true,
		"float":   true,
		"json":    true,
	}

	if !validDataTypes[r.DataType] {
		return errors.New("data_type must be one of: string, integer, boolean, float, json")
	}

	// Validate config_key format (alphanumeric, dots, underscores only)
	if !isValidConfigKey(r.ConfigKey) {
		return errors.New("config_key can only contain letters, numbers, dots, and underscores")
	}

	return nil
}

// Validate validates the UpdateConfigRequest
func (r *UpdateConfigRequest) Validate() error {
	if r.ConfigValue != "" && strings.TrimSpace(r.ConfigValue) == "" {
		return errors.New("config_value cannot be empty if provided")
	}

	// Validate data_type if provided
	if r.DataType != "" {
		validDataTypes := map[string]bool{
			"string":  true,
			"integer": true,
			"boolean": true,
			"float":   true,
			"json":    true,
		}

		if !validDataTypes[r.DataType] {
			return errors.New("data_type must be one of: string, integer, boolean, float, json")
		}
	}

	return nil
}

// isValidConfigKey checks if the config key contains only allowed characters
func isValidConfigKey(key string) bool {
	for _, char := range key {
		if !((char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') ||
			char == '.' || char == '_') {
			return false
		}
	}
	return true
}
