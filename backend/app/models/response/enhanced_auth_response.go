// platform/backend/app/models/response/enhanced_auth_response.go
package response

import "time"

// EnhancedLoginResponse extends LoginResponse with session information
type EnhancedLoginResponse struct {
	// Standard login fields (embedded from LoginResponse)
	Token        string          `json:"token"`
	AccessToken  string          `json:"access_token"`
	RefreshToken string          `json:"refresh_token,omitempty"`
	ExpiresAt    time.Time       `json:"expires_at"`
	TokenType    string          `json:"token_type"`
	User         *UserResponse   `json:"user"`
	Tenant       *TenantResponse `json:"tenant"`

	//  NEW: Session fields for hybrid authentication
	SessionID     string    `json:"session_id,omitempty"`
	SessionHealth string    `json:"session_health,omitempty"` // "healthy", "stale", "needs_sync"
	SessionExpiry time.Time `json:"session_expiry,omitempty"`
	LastActivity  time.Time `json:"last_activity,omitempty"`
	DeviceInfo    string    `json:"device_info,omitempty"`
}

// NewEnhancedLoginResponse creates an enhanced login response from a standard login response
func NewEnhancedLoginResponse(loginResp *LoginResponse) *EnhancedLoginResponse {
	return &EnhancedLoginResponse{
		Token:        loginResp.Token,
		AccessToken:  loginResp.AccessToken,
		RefreshToken: loginResp.RefreshToken,
		ExpiresAt:    loginResp.ExpiresAt,
		TokenType:    loginResp.TokenType,
		User:         loginResp.User,
		Tenant:       loginResp.Tenant,
		// Session fields will be populated separately
		SessionHealth: "healthy",
		LastActivity:  time.Now(),
	}
}

// AddSessionInfo adds session information to the enhanced response
func (e *EnhancedLoginResponse) AddSessionInfo(sessionID string, expiry time.Time, deviceInfo string) {
	e.SessionID = sessionID
	e.SessionExpiry = expiry
	e.SessionHealth = "healthy"
	e.LastActivity = time.Now()
	e.DeviceInfo = deviceInfo
}
