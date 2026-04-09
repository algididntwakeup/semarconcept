// platform/backend/app/models/request/permission_request.go
package request

// CreatePermissionRequest defines the structure for creating a new permission.
type CreatePermissionRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Resource    string `json:"resource" binding:"required,min=2,max=50"`
	Action      string `json:"action" binding:"required,min=2,max=50"`
	Scope       string `json:"scope" binding:"required"` // Required in DB with default 'tenant'
	Description string `json:"description"`
}

// UpdatePermissionRequest defines the structure for updating an existing permission.
type UpdatePermissionRequest struct {
	Name        string `json:"name,omitempty"`
	Resource    string `json:"resource,omitempty"`
	Action      string `json:"action,omitempty"`
	Scope       string `json:"scope,omitempty"`
	Description string `json:"description,omitempty"`
}

// PermissionListQuery defines query parameters for listing permissions.
type PermissionListQuery struct {
	Page   int    `form:"page,default=1"`
	Limit  int    `form:"limit,default=10"`
	Search string `form:"search"` // Search by name, resource, or action
}
