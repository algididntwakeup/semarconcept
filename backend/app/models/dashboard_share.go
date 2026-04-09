// platform/backend/app/models/dashboard_share.go
package models

import (
	"time"
)

type DashboardShare struct {
	ID               int        `json:"id" db:"id"`
	DashboardID      int        `json:"dashboard_id" db:"dashboard_id"`
	SharedWithUserID *int       `json:"shared_with_user_id" db:"shared_with_user_id"`
	SharedWithRoleID *int       `json:"shared_with_role_id" db:"shared_with_role_id"`
	PermissionLevel  string     `json:"permission_level" db:"permission_level"` // 'view', 'edit', 'admin'
	ShareType        string     `json:"share_type" db:"share_type"`             // 'user', 'role', 'public'
	IsActive         bool       `json:"is_active" db:"is_active"`
	ExpiresAt        *time.Time `json:"expires_at" db:"expires_at"`
	CreatedBy        int        `json:"created_by" db:"created_by"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`

	// Tenant isolation
	TenantID int `json:"tenant_id" db:"tenant_id"`

	// Related objects (populated via joins)
	Dashboard      *Dashboard `json:"dashboard,omitempty"`
	SharedWithUser *User      `json:"shared_with_user,omitempty"`
	SharedWithRole *Role      `json:"shared_with_role,omitempty"`
	Creator        *User      `json:"creator,omitempty"`
}

// DashboardSharePermission represents permission levels for dashboard sharing
type DashboardSharePermission string

const (
	DashboardPermissionView  DashboardSharePermission = "view"
	DashboardPermissionEdit  DashboardSharePermission = "edit"
	DashboardPermissionAdmin DashboardSharePermission = "admin"
)

// DashboardShareType represents different sharing types
type DashboardShareType string

const (
	DashboardShareTypeUser   DashboardShareType = "user"
	DashboardShareTypeRole   DashboardShareType = "role"
	DashboardShareTypePublic DashboardShareType = "public"
)

// Validate validates the dashboard share model
func (ds *DashboardShare) Validate() error {
	if ds.DashboardID <= 0 {
		return NewValidationError("DashboardID", "Dashboard ID is required")
	}

	if ds.ShareType == "" {
		return NewValidationError("ShareType", "Share type is required")
	}

	if ds.PermissionLevel == "" {
		return NewValidationError("PermissionLevel", "Permission level is required")
	}

	// Validate permission level
	validPermissions := []string{"view", "edit", "admin"}
	isValid := false
	for _, perm := range validPermissions {
		if ds.PermissionLevel == perm {
			isValid = true
			break
		}
	}
	if !isValid {
		return NewValidationError("PermissionLevel", "Invalid permission level")
	}

	// Validate share type constraints
	switch ds.ShareType {
	case "user":
		if ds.SharedWithUserID == nil {
			return NewValidationError("SharedWithUserID", "User ID is required for user sharing")
		}
	case "role":
		if ds.SharedWithRoleID == nil {
			return NewValidationError("SharedWithRoleID", "Role ID is required for role sharing")
		}
	case "public":
		// No additional validation needed
	default:
		return NewValidationError("ShareType", "Invalid share type")
	}

	return nil
}

// HasPermission checks if the share has the specified permission level
func (ds *DashboardShare) HasPermission(requiredLevel DashboardSharePermission) bool {
	currentLevel := DashboardSharePermission(ds.PermissionLevel)

	switch requiredLevel {
	case DashboardPermissionView:
		return currentLevel == DashboardPermissionView ||
			currentLevel == DashboardPermissionEdit ||
			currentLevel == DashboardPermissionAdmin
	case DashboardPermissionEdit:
		return currentLevel == DashboardPermissionEdit ||
			currentLevel == DashboardPermissionAdmin
	case DashboardPermissionAdmin:
		return currentLevel == DashboardPermissionAdmin
	default:
		return false
	}
}

// IsExpired checks if the share has expired
func (ds *DashboardShare) IsExpired() bool {
	if ds.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*ds.ExpiresAt)
}

// IsValidForUser checks if the share is valid for the given user
func (ds *DashboardShare) IsValidForUser(userID int) bool {
	if !ds.IsActive || ds.IsExpired() {
		return false
	}

	switch ds.ShareType {
	case "user":
		return ds.SharedWithUserID != nil && *ds.SharedWithUserID == userID
	case "public":
		return true
	case "role":
		// This would need to be checked with user's roles
		return false
	default:
		return false
	}
}
