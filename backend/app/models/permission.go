// platform/backend/app/models/permission.go

package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// Permission represents a permission in the RBAC system
type Permission struct {
	ID          int            `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string         `json:"name" gorm:"not null;index"`
	Description string         `json:"description"`
	Resource    string         `json:"resource" gorm:"not null;index"`
	Action      string         `json:"action" gorm:"not null;index"`
	Scope       string         `json:"scope" gorm:"not null;default:'tenant'"`
	TenantID    int            `json:"tenant_id" gorm:"not null;index"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	// Relationships
	Tenant *Tenant `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for the Permission model
func (Permission) TableName() string {
	return "permissions"
}

//  CRITICAL FIX: BeforeCreate hook - validate name only on creation
func (p *Permission) BeforeCreate(tx *gorm.DB) error {
	// Only validate required fields on creation
	if p.Name == "" {
		return errors.New("permission name cannot be empty")
	}
	if p.Resource == "" {
		return errors.New("permission resource cannot be empty")
	}
	if p.Action == "" {
		return errors.New("permission action cannot be empty")
	}
	if p.TenantID == 0 {
		return errors.New("permission tenant_id cannot be zero")
	}
	return nil
}

//  CRITICAL FIX: BeforeUpdate hook - REMOVED name validation for updates
func (p *Permission) BeforeUpdate(tx *gorm.DB) error {
	// For updates, only validate tenant_id if it's being changed
	// Do NOT validate name, resource, action as they may not be present in partial updates
	if tx.Statement.Changed("tenant_id") && p.TenantID == 0 {
		return errors.New("permission tenant_id cannot be zero")
	}
	return nil
}

//  CRITICAL FIX: Validate method - context-aware validation
func (p *Permission) Validate() error {
	// This method should only be called for full validation (e.g., creation)
	if p.Name == "" {
		return errors.New("permission name is required")
	}
	if p.Resource == "" {
		return errors.New("permission resource is required")
	}
	if p.Action == "" {
		return errors.New("permission action is required")
	}
	if p.TenantID == 0 {
		return errors.New("permission tenant_id is required")
	}
	if p.Scope == "" {
		p.Scope = "tenant" // Set default scope
	}
	return nil
}

//  NEW: ValidateForUpdate method - validation for partial updates
func (p *Permission) ValidateForUpdate(updateData map[string]interface{}) error {
	// Only validate fields that are being updated
	if name, exists := updateData["name"]; exists {
		if nameStr, ok := name.(string); ok && nameStr == "" {
			return errors.New("permission name cannot be empty when provided")
		}
	}
	if resource, exists := updateData["resource"]; exists {
		if resourceStr, ok := resource.(string); ok && resourceStr == "" {
			return errors.New("permission resource cannot be empty when provided")
		}
	}
	if action, exists := updateData["action"]; exists {
		if actionStr, ok := action.(string); ok && actionStr == "" {
			return errors.New("permission action cannot be empty when provided")
		}
	}
	if tenantID, exists := updateData["tenant_id"]; exists {
		if tenantIDInt, ok := tenantID.(int); ok && tenantIDInt == 0 {
			return errors.New("permission tenant_id cannot be zero")
		}
	}
	return nil
}

// GetPermissionKey returns a unique key for the permission
func (p *Permission) GetPermissionKey() string {
	return p.Resource + ":" + p.Action
}

// IsSystemPermission checks if this is a system-level permission
func (p *Permission) IsSystemPermission() bool {
	return p.Scope == "system" || p.Scope == "global"
}

// IsTenantPermission checks if this is a tenant-level permission
func (p *Permission) IsTenantPermission() bool {
	return p.Scope == "tenant"
}
