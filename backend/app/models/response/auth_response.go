// platform/backend/app/models/response/auth_response.go
package response

import "time"

// LoginResponse represents the response for login requests
type LoginResponse struct {
	Token        string          `json:"token"`
	AccessToken  string          `json:"access_token"`
	RefreshToken string          `json:"refresh_token,omitempty"`
	ExpiresAt    time.Time       `json:"expires_at"`
	TokenType    string          `json:"token_type"`
	User         *UserResponse   `json:"user"`
	Tenant       *TenantResponse `json:"tenant"` // ← EXISTING: Tenant field for login response
}

// RefreshTokenResponse represents the response for token refresh requests
type RefreshTokenResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	TokenType string    `json:"token_type"`
}

// AuthValidationResponse represents the response for auth validation
type AuthValidationResponse struct {
	Valid bool          `json:"valid"`
	User  *UserResponse `json:"user,omitempty"`
}

// TokenResponse represents a token response
type TokenResponse struct {
	Token       string    `json:"token"`
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
	TokenType   string    `json:"token_type"`
}

//  NOTE: Enhanced auth response types are now in enhanced_auth_response.go
// This ensures backward compatibility while adding session support
