// platform/backend/app/models/response/permission_response.go

package response

import "time"

type PermissionResponse struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Resource    string    `json:"resource"`
	Action      string    `json:"action"`
	Scope       string    `json:"scope"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PermissionListResponse struct {
	Permissions []PermissionResponse `json:"permissions"`
	Pagination  PaginationResponse   `json:"pagination"`
}

type CreatePermissionResponse struct {
	Permission PermissionResponse `json:"permission"`
	Message    string             `json:"message"`
}

type UpdatePermissionResponse struct {
	Permission PermissionResponse `json:"permission"`
	Message    string             `json:"message"`
}

type DeletePermissionResponse struct {
	Message string `json:"message"`
}

// Permission statistics response
type PermissionStatsResponse struct {
	TotalPermissions    int                  `json:"total_permissions"`
	PermissionsByScope  map[string]int       `json:"permissions_by_scope"`
	PermissionsByAction map[string]int       `json:"permissions_by_action"`
	RecentPermissions   []PermissionResponse `json:"recent_permissions"`
}

// Permission validation response
type PermissionValidationResponse struct {
	IsValid bool     `json:"is_valid"`
	Errors  []string `json:"errors,omitempty"`
}
