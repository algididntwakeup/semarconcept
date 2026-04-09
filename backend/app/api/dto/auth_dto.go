// platform/backend/app/api/dto/auth_dto.go
package dto

import "time"

// RegisterUserRequest defines the structure for a user registration request.
type RegisterUserRequest struct {
	Username        string `json:"username" binding:"required,min=3,max=100"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8,max=100"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=Password"`
	FirstName       string `json:"first_name" binding:"required"`
	LastName        string `json:"last_name" binding:"required"`
	FullName        string `json:"full_name,omitempty"`
}

// UserResponse defines the structure for a user response, excluding sensitive data.
type UserResponse struct {
	ID          int        `json:"id"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	FirstName   string     `json:"first_name"`
	LastName    string     `json:"last_name"`
	FullName    string     `json:"full_name,omitempty"`
	IsActive    bool       `json:"is_active"`
	IsAdmin     bool       `json:"is_admin"`
	IsSuperuser bool       `json:"is_superuser"`
	LastLogin   *time.Time `json:"last_login,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// LoginRequest defines the structure for a user login request.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"` // Or Username
	Password string `json:"password" binding:"required"`
}

// LoginResponse defines the structure for a successful login response.
type LoginResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"` // Consider sending this via httpOnly cookie
	User         UserResponse `json:"user"`
}

// TokenResponse defines the structure for a token refresh response.
type TokenResponse struct {
	AccessToken string `json:"access_token"`
}

// RefreshTokenRequest defines the structure for a refresh token request.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// ForgotPasswordRequest defines the structure for a forgot password request.
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest defines the structure for a reset password request.
type ResetPasswordRequest struct {
	Token           string `json:"token" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=100"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}
