// platform/backend/app/models/tenant_user.go
package models

import (
	"time"
)

// TenantUser represents the relationship between tenants and users
type TenantUser struct {
	ID           int        `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantID     int        `gorm:"index;not null" json:"tenant_id"`
	UserID       int        `gorm:"index;not null" json:"user_id"`
	Role         string     `gorm:"size:50;default:member" json:"role"`
	Status       string     `gorm:"size:20;default:active" json:"status"`
	Permissions  *string    `gorm:"type:jsonb" json:"permissions"` // Changed to *string for consistency
	JoinedAt     time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"joined_at"`
	InvitedAt    *time.Time `json:"invited_at,omitempty"`
	InvitedBy    *int       `gorm:"index" json:"invited_by,omitempty"`
	LastActivity *time.Time `json:"last_activity,omitempty"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Tenant      *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	User        *User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	InvitedUser *User   `gorm:"foreignKey:InvitedBy" json:"invited_user,omitempty"`
}

// Table name
func (TenantUser) TableName() string {
	return "tenant_users"
}

// Tenant user status constants
const (
	TenantUserStatusActive    = "active"
	TenantUserStatusInactive  = "inactive"
	TenantUserStatusSuspended = "suspended"
	TenantUserStatusPending   = "pending"
)

// Tenant user role constants
const (
	TenantUserRoleOwner       = "owner"
	TenantUserRoleAdmin       = "admin"
	TenantUserRoleMember      = "member"
	TenantUserRoleViewer      = "viewer"
	TenantUserRoleContributor = "contributor"
)

// Helper methods
func (tu *TenantUser) IsActive() bool {
	return tu.Status == TenantUserStatusActive
}

func (tu *TenantUser) IsOwner() bool {
	return tu.Role == TenantUserRoleOwner
}

func (tu *TenantUser) IsAdmin() bool {
	return tu.Role == TenantUserRoleAdmin || tu.Role == TenantUserRoleOwner
}

func (tu *TenantUser) CanManageUsers() bool {
	return tu.Role == TenantUserRoleOwner || tu.Role == TenantUserRoleAdmin
}

func (tu *TenantUser) HasPermission(permission string) bool {
	if tu.Permissions == nil {
		return false
	}

	// TODO: Implement JSON parsing for permissions
	// For now, return false as placeholder
	return false
}

func (tu *TenantUser) SetPermission(permission string, allowed bool) {
	// TODO: Implement JSON manipulation for permissions
	// For now, this is a placeholder
	if tu.Permissions == nil {
		defaultPerms := "{}"
		tu.Permissions = &defaultPerms
	}
}

func (tu *TenantUser) UpdateLastActivity() {
	now := time.Now()
	tu.LastActivity = &now
}

// GetDefaultPermissions returns default permissions JSON string
func (tu *TenantUser) GetDefaultPermissions() string {
	switch tu.Role {
	case TenantUserRoleOwner:
		return `{"*": true}`
	case TenantUserRoleAdmin:
		return `{"users.read": true, "users.create": true, "users.update": true, "assets.read": true, "assets.create": true, "assets.update": true}`
	case TenantUserRoleMember:
		return `{"assets.read": true, "assets.create": true, "inspections.read": true, "inspections.create": true}`
	case TenantUserRoleViewer:
		return `{"assets.read": true, "inspections.read": true, "reports.read": true}`
	default:
		return `{}`
	}
}
