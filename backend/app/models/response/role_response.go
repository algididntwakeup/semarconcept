// platform/backend/app/models/response/role_response.go

package response

import "time"

// PermissionBase represents basic permission information
type PermissionBase struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Resource string `json:"resource"`
	Action   string `json:"action"`
	Scope    string `json:"scope"`
}

// RoleResponse represents detailed role information
type RoleResponse struct {
	ID          int              `json:"id"`
	TenantID    *int             `json:"tenant_id,omitempty"`
	Name        string           `json:"name"`
	Code        string           `json:"code"`
	Description *string          `json:"description,omitempty"`
	Level       int              `json:"level"`
	IsSystem    bool             `json:"is_system"`
	IsDefault   bool             `json:"is_default"`
	IsActive    bool             `json:"is_active"`
	Color       *string          `json:"color,omitempty"`
	Icon        *string          `json:"icon,omitempty"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Permissions []PermissionBase `json:"permissions,omitempty"`
}

// RoleListResponse represents a list of roles
type RoleListResponse struct {
	Roles      []RoleResponse     `json:"roles"`
	Pagination PaginationResponse `json:"pagination"`
}

// CreateRoleResponse represents the response after creating a role
type CreateRoleResponse struct {
	Role    RoleResponse `json:"role"`
	Message string       `json:"message"`
}

// UpdateRoleResponse represents the response after updating a role
type UpdateRoleResponse struct {
	Role    RoleResponse `json:"role"`
	Message string       `json:"message"`
}

// DeleteRoleResponse represents the response after deleting a role
type DeleteRoleResponse struct {
	Message string `json:"message"`
}

// RoleStatsResponse represents role statistics
type RoleStatsResponse struct {
	TotalRoles    int            `json:"total_roles"`
	SystemRoles   int            `json:"system_roles"`
	TenantRoles   int            `json:"tenant_roles"`
	ActiveRoles   int            `json:"active_roles"`
	InactiveRoles int            `json:"inactive_roles"`
	RolesByLevel  map[string]int `json:"roles_by_level"`
	RecentRoles   []RoleResponse `json:"recent_roles"`
}

// RoleValidationResponse represents role name validation result
type RoleValidationResponse struct {
	IsValid bool     `json:"is_valid"`
	Errors  []string `json:"errors"`
}
