// platform/backend/app/models/response/user_response.go
package response

import "time"

// UserResponse represents the standardized user response structure
type UserResponse struct {
	ID          int        `json:"id"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	FirstName   *string    `json:"first_name"`
	LastName    *string    `json:"last_name"`
	FullName    string     `json:"full_name"`
	IsActive    bool       `json:"is_active"`
	IsSuperuser bool       `json:"is_superuser"`
	IsAdmin     bool       `json:"is_admin"`
	LastLogin   *time.Time `json:"last_login"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Roles       []RoleBase `json:"roles"`
}

// RoleBase represents basic role information
type RoleBase struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Code string `json:"code"`
}

// UserListResponse represents the response for listing users
type UserListResponse struct {
	Users      []UserResponse     `json:"users"`
	Pagination PaginationResponse `json:"pagination"`
}

// ManagerResponse represents a manager's information
type ManagerResponse struct {
	ID           int        `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	FirstName    *string    `json:"first_name"`
	LastName     *string    `json:"last_name"`
	FullName     string     `json:"full_name"`
	DepartmentID *int       `json:"department_id"`
	Department   string     `json:"department"`
	CreatedAt    time.Time  `json:"created_at"`
	LastLogin    *time.Time `json:"last_login"`
}

// ManagerListResponse represents the response for listing managers
type ManagerListResponse struct {
	Managers   []ManagerResponse  `json:"managers"`
	Pagination PaginationResponse `json:"pagination"`
}

// UserActivitySummary represents recent user activity
type UserActivitySummary struct {
	UserID       int       `json:"user_id"`
	Username     string    `json:"username"`
	FullName     string    `json:"full_name"`
	ActivityType string    `json:"activity_type"`
	Timestamp    time.Time `json:"timestamp"`
}

// RoleDistribution represents role distribution statistics
type RoleDistribution struct {
	RoleID    int    `json:"role_id"`
	RoleName  string `json:"role_name"`
	UserCount int    `json:"user_count"`
}

// CreateUserResponse represents the response after creating a user
type CreateUserResponse struct {
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

// UpdateUserResponse represents the response after updating a user
type UpdateUserResponse struct {
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

// DeleteUserResponse represents the response after deleting a user
type DeleteUserResponse struct {
	Message string `json:"message"`
}

// UserProfileResponse represents the current user's profile
type UserProfileResponse struct {
	ID          int        `json:"id"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	FirstName   *string    `json:"first_name"`
	LastName    *string    `json:"last_name"`
	FullName    string     `json:"full_name"`
	IsActive    bool       `json:"is_active"`
	IsSuperuser bool       `json:"is_superuser"`
	IsAdmin     bool       `json:"is_admin"`
	LastLogin   *time.Time `json:"last_login"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Roles       []RoleBase `json:"roles"`
	Permissions []string   `json:"permissions"`
}

// UserBase represents basic user information (for department references)
type UserBase struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	FullName  string `json:"full_name"`
}
