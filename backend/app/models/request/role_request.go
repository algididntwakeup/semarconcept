// platform/backend/app/models/request/role_request.go
package request

// CreateRoleRequest defines the structure for creating a new role.
type CreateRoleRequest struct {
	Name          string   `json:"name" binding:"required,min=2,max=50"`
	Code          string   `json:"code" binding:"required,min=2,max=50"`
	Description   string   `json:"description"`
	Level         int      `json:"level" binding:"required,min=1"`
	PermissionIDs []uint64 `json:"permission_ids"`
}

// UpdateRoleRequest defines the structure for updating an existing role.
type UpdateRoleRequest struct {
	Name          string   `json:"name,omitempty"`
	Code          string   `json:"code,omitempty"`
	Description   string   `json:"description,omitempty"`
	Level         int      `json:"level,omitempty"`
	PermissionIDs []uint64 `json:"permission_ids"`
}

// RoleListQuery defines query parameters for listing roles.
type RoleListQuery struct {
	Page   int    `form:"page,default=1"`
	Limit  int    `form:"limit,default=10"`
	Search string `form:"search"`
}
