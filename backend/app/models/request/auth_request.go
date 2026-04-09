// platform/backend/app/models/request/auth_request.go
package request

import (
	"encoding/json"
)

// RegisterUserRequest defines the structure for user registration.
type RegisterUserRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=100" validate:"required,min=3,max=50" example:"newuser"`
	Email     string `json:"email" binding:"required,email" validate:"required,email" example:"user@example.com"`
	Password  string `json:"password" binding:"required,min=8,max=100" validate:"required,min=8,max=100" example:"password123"`
	FirstName string `json:"first_name" binding:"required" validate:"required,max=50" example:"John"`
	LastName  string `json:"last_name" binding:"required" validate:"required,max=50" example:"Doe"`
	FullName  string `json:"full_name,omitempty"`
	Phone     string `json:"phone,omitempty" binding:"omitempty"`
}

// LoginRequest defines the structure for user login.
type LoginRequest struct {
	// Simplified to just use username
	Username string `json:"username" binding:"required" validate:"required,min=3,max=50" example:"admin"`
	Password string `json:"password" binding:"required" validate:"required,min=8,max=100" example:"admin123"`
	DeviceID string `json:"device_id,omitempty"` // Added DeviceID field for session management

	// Internal field for service use
	Identifier string `json:"-"` // Used internally after unmarshaling
}

// UnmarshalJSON custom unmarshaler to handle field variations
func (l *LoginRequest) UnmarshalJSON(data []byte) error {
	// Create an alias type to avoid infinite recursion
	type Alias LoginRequest
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(l),
	}

	// Unmarshal into the auxiliary struct
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Set the identifier field based on username
	l.Identifier = l.Username

	return nil
}

// RefreshTokenRequest defines the structure for refreshing a token.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required" validate:"required" example:"eyJhbGciOiJIUzI1NiIs..."`
	DeviceID     string `json:"device_id,omitempty"` // Added for device tracking
}

// ForgotPasswordRequest defines the structure for initiating password reset.
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest defines the structure for completing password reset.
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8,max=100"`
}
