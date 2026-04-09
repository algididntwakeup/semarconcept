// platform/backend/app/utils/jwt_interfaces.go
package utils

import (
	"time"
)

// TokenGenerator interface defines the contract for JWT token generation and validation
type TokenGenerator interface {
	// Basic token generation
	GenerateToken(userID int, username string, isSuperuser bool, tenantID *int, duration time.Duration) (string, error)

	// Enhanced token generation with options
	GenerateTokenWithOptions(userID int, username string, isSuperuser bool, tenantID *int, duration time.Duration, options TokenOptions) (string, error)

	// Refresh token generation
	GenerateRefreshToken(userID int, username string, duration time.Duration) (string, error)

	// Token validation
	ValidateToken(tokenString string) (*JWTClaims, error)

	// Token refresh
	RefreshToken(refreshTokenString string, userID int) (string, string, error)

	// Token blacklisting
	BlacklistToken(jti string, userID int, reason string, expiration time.Duration) error
	IsTokenBlacklisted(jti string) bool

	// Session management
	InvalidateSession(sessionID string) error
	InvalidateAllUserTokens(userID int, reason string) error

	// Token utilities
	CanRefreshToken(tokenString string) (bool, time.Duration, error)

	// Statistics and cleanup
	GetBlacklistStats() (int, error)
	CleanupBlacklist() error
}

// TokenClaims interface defines the contract for JWT claims
type TokenClaims interface {
	GetUserID() int
	GetUsername() string
	GetTokenType() string
	GetExpiresAt() time.Time
	IsExpired() bool
}
