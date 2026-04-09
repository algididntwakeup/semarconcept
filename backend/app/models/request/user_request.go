// platform/backend/app/models/request/user_request.go
package request

import (
	"fmt"
	"strings"
)

// CreateUserRequest defines the structure for creating a new user by an admin.
type CreateUserRequest struct {
	Username     string `json:"username" binding:"required,min=3,max=50" validate:"required"`
	Email        string `json:"email" binding:"required,email" validate:"required,email"`
	Password     string `json:"password" binding:"required,min=8" validate:"required,min=8"`
	FirstName    string `json:"first_name" binding:"required,min=1,max=100" validate:"required"`
	LastName     string `json:"last_name" binding:"required,min=1,max=100" validate:"required"`
	IsActive     *bool  `json:"is_active,omitempty"`
	IsAdmin      *bool  `json:"is_admin,omitempty"` // 🚨 FIX: Add IsAdmin field
	IsSuperuser  *bool  `json:"is_superuser,omitempty"`
	DepartmentID *int   `json:"department_id,omitempty"` // 🚨 FIX: Add DepartmentID field (optional)
	RoleIDs      []int  `json:"role_ids,omitempty"`
	TenantID     int    `json:"-"` // 🚨 CRITICAL: Set from context, not from request body
}

// UpdateUserRequest defines the structure for updating an existing user by an admin.
type UpdateUserRequest struct {
	Username     *string `json:"username,omitempty" binding:"omitempty,min=3,max=50"`
	Email        *string `json:"email,omitempty" binding:"omitempty,email"`
	Password     *string `json:"password,omitempty" binding:"omitempty,min=8"`
	FirstName    *string `json:"first_name,omitempty" binding:"omitempty,min=1,max=100"`
	LastName     *string `json:"last_name,omitempty" binding:"omitempty,min=1,max=100"`
	IsActive     *bool   `json:"is_active,omitempty"`
	IsAdmin      *bool   `json:"is_admin,omitempty"` // 🚨 FIX: Add IsAdmin field
	IsSuperuser  *bool   `json:"is_superuser,omitempty"`
	DepartmentID *int    `json:"department_id,omitempty"` // 🚨 FIX: Add DepartmentID field
	RoleIDs      []int   `json:"role_ids,omitempty"`
}

// ChangePasswordRequest represents the request to change user password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=100"`
}

// UserListQuery defines query parameters for listing users.
type UserListQuery struct {
	Page        int    `form:"page,default=1" binding:"min=1"`
	Limit       int    `form:"limit,default=10" binding:"min=1,max=100"`
	Search      string `form:"search"`
	TenantID    *int   `form:"tenant_id"`
	IsActive    *bool  `form:"is_active"`
	IsAdmin     *bool  `form:"is_admin"`
	IsSuperuser *bool  `form:"is_superuser"`
}

// UserSearchRequest represents the request to search users
type UserSearchRequest struct {
	Search      string `json:"search,omitempty"`
	TenantID    *int   `json:"tenant_id,omitempty"`
	IsActive    *bool  `json:"is_active,omitempty"`
	IsAdmin     *bool  `json:"is_admin,omitempty"`
	IsSuperuser *bool  `json:"is_superuser,omitempty"`
	Page        int    `json:"page,omitempty" binding:"min=1"`
	PerPage     int    `json:"per_page,omitempty" binding:"min=1,max=100"`
}

func (r *CreateUserRequest) Validate() error {
	var errors []string

	if strings.TrimSpace(r.Username) == "" {
		errors = append(errors, "username is required")
	}

	if strings.TrimSpace(r.Email) == "" {
		errors = append(errors, "email is required")
	}

	if strings.TrimSpace(r.FirstName) == "" {
		errors = append(errors, "first_name is required")
	}

	if strings.TrimSpace(r.LastName) == "" {
		errors = append(errors, "last_name is required")
	}

	if strings.TrimSpace(r.Password) == "" {
		errors = append(errors, "password is required")
	}

	if r.TenantID <= 0 {
		errors = append(errors, "tenant_id is required and must be greater than 0")
	}

	// 🚨 SURGICAL ADD: Validate department_id if provided
	if r.DepartmentID != nil && *r.DepartmentID <= 0 {
		errors = append(errors, "department_id must be greater than 0 when provided")
	}

	if len(errors) > 0 {
		return fmt.Errorf("validation failed: %s", strings.Join(errors, ", "))
	}

	return nil
}
