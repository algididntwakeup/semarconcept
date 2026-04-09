// platform/backend/app/models/response/session_response.go
package response

import "time"

// SessionValidationResponse represents the response for session validation
type SessionValidationResponse struct {
	Valid       bool         `json:"valid"`
	SessionData *SessionData `json:"session_data,omitempty"`
	Status      string       `json:"status"`
	Message     string       `json:"message,omitempty"`
	ExpiresAt   *time.Time   `json:"expires_at,omitempty"`
	Health      string       `json:"health"` // "healthy", "stale", "expired", "needs_sync", "jwt_only"
}

// SessionInfoResponse represents detailed session information
type SessionInfoResponse struct {
	SessionID    string                 `json:"session_id"`
	UserID       int                    `json:"user_id"`
	Username     string                 `json:"username"`
	Email        string                 `json:"email"`
	TenantID     int                    `json:"tenant_id"`
	LastActivity time.Time              `json:"last_activity"`
	CreatedAt    time.Time              `json:"created_at"`
	ExpiresAt    time.Time              `json:"expires_at"`
	DeviceInfo   string                 `json:"device_info,omitempty"`
	IPAddress    string                 `json:"ip_address,omitempty"`
	UserAgent    string                 `json:"user_agent,omitempty"`
	IsActive     bool                   `json:"is_active"`
	Health       string                 `json:"health"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// SessionData represents the core session data stored in Redis
type SessionData struct {
	UserID      int                    `json:"user_id"`
	Username    string                 `json:"username"`
	Email       string                 `json:"email"`
	TenantID    int                    `json:"tenant_id"`
	IsSuperuser bool                   `json:"is_superuser"`
	LoginTime   time.Time              `json:"login_time"`
	LastSeen    time.Time              `json:"last_seen"`
	IPAddress   string                 `json:"ip_address"`
	UserAgent   string                 `json:"user_agent"`
	Permissions []string               `json:"permissions,omitempty"`
	Roles       []string               `json:"roles,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	Status      string                 `json:"status"` // "active", "idle", "expired"
}

// SessionRefreshResponse represents the response for session refresh
type SessionRefreshResponse struct {
	SessionID    string    `json:"session_id"`
	Status       string    `json:"status"`
	Health       string    `json:"health"`
	ExpiresAt    time.Time `json:"expires_at"`
	LastActivity time.Time `json:"last_activity"`
	Message      string    `json:"message,omitempty"`
}

// SessionHealthResponse represents session health status
type SessionHealthResponse struct {
	SessionID string    `json:"session_id"`
	Health    string    `json:"health"`
	Score     int       `json:"score"`  // 0-100 health score
	Issues    []string  `json:"issues"` // List of health issues
	LastSync  time.Time `json:"last_sync"`
}
