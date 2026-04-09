// platform/backend/app/models/role_permission.go
package models

import (
	"time"
)

// RolePermission represents the junction table for roles and permissions
// Only create this if you need explicit control over the junction table
type RolePermission struct {
	RoleID       int       `json:"role_id" gorm:"primaryKey"`
	PermissionID int       `json:"permission_id" gorm:"primaryKey"`
	TenantID     int       `json:"tenant_id" gorm:"not null;index"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`

	// Optional: Add additional fields if needed
	// GrantedBy    int       `json:"granted_by,omitempty"`
	// ExpiresAt    *time.Time `json:"expires_at,omitempty"`

	// Relationships
	Role       *Role       `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	Permission *Permission `json:"permission,omitempty" gorm:"foreignKey:PermissionID"`
}

// TableName specifies the table name for GORM
func (RolePermission) TableName() string {
	return "role_permissions"
}
