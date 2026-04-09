// platform/backend/app/api/dto/user_dto.go
package dto

// CreateUserRequest defines the structure for creating a new user by an admin.
type CreateUserRequest struct {
	Username    string `json:"username" binding:"required,min=3,max=100"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8,max=100"`
	FullName    string `json:"full_name,omitempty"`
	IsActive    *bool  `json:"is_active"` // Pointer to distinguish between not set and false
	IsSuperuser *bool  `json:"is_superuser"`
	IsAdmin     *bool  `json:"is_admin"`
	RoleIDs     []int  `json:"role_ids,omitempty"` // IDs of roles to assign
}

// UpdateUserRequest defines the structure for updating an existing user by an admin.
type UpdateUserRequest struct {
	Email       *string `json:"email,omitempty,email"` // Pointer to allow partial updates
	FullName    *string `json:"full_name,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
	IsSuperuser *bool   `json:"is_superuser,omitempty"`
	IsAdmin     *bool   `json:"is_admin,omitempty"`
	RoleIDs     []int   `json:"role_ids,omitempty"`
	// Password can be updated via a separate endpoint/flow for security
}

// UserListQuery defines query parameters for listing users.
type UserListQuery struct {
	Page        int    `form:"page,default=1"`
	Limit       int    `form:"limit,default=10"`
	Search      string `form:"search"`
	IsActive    *bool  `form:"is_active"`    // Filter by active status
	IsSuperuser *bool  `form:"is_superuser"` // Filter by superuser status
	IsAdmin     *bool  `form:"is_admin"`     // Filter by admin status
	// Add other filters like RoleID, etc.
}

// UserListResponse defines the structure for a paginated list of users.
type UserListResponse struct {
	Users      []UserResponse `json:"users"`
	TotalCount int64          `json:"total_count"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
}

// Note: UserResponse is already defined in auth_dto.go
// If it becomes too generic, consider a more specific AdminUserResponse here.
