// platform/backend/app/utils/jwt.go
package utils

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenOptions represents additional options for token generation
type TokenOptions struct {
	TokenType string
	DeviceID  string
	Scope     string
}

// JWTClaims represents the claims in a JWT token
type JWTClaims struct {
	UserID      int    `json:"user_id"`
	Username    string `json:"username"`
	IsSuperuser bool   `json:"is_superuser"`
	TenantID    *int   `json:"tenant_id,omitempty"`
	TokenType   string `json:"token_type,omitempty"`
	DeviceID    string `json:"device_id,omitempty"`
	Scope       string `json:"scope,omitempty"`
	SessionID   string `json:"session_id,omitempty"`
	JTI         string `json:"jti,omitempty"`
	jwt.RegisteredClaims
}

// JWTService provides JWT token generation and validation
type JWTService struct {
	secretKey       string
	issuer          string
	blacklistedJTIs map[string]time.Time
}

// NewJWTService creates a new JWT service
func NewJWTService(secretKey, issuer string) *JWTService {
	return &JWTService{
		secretKey:       secretKey,
		issuer:          issuer,
		blacklistedJTIs: make(map[string]time.Time),
	}
}

// GenerateToken generates a JWT token with basic claims
func (j *JWTService) GenerateToken(userID int, username string, isSuperuser bool, tenantID *int, duration time.Duration) (string, error) {
	now := time.Now()
	expiresAt := now.Add(duration)

	claims := JWTClaims{
		UserID:      userID,
		Username:    username,
		IsSuperuser: isSuperuser,
		TenantID:    tenantID,
		TokenType:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   strconv.Itoa(userID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secretKey))
}

// GenerateTokenWithOptions generates a token with additional options
func (j *JWTService) GenerateTokenWithOptions(
	userID int,
	username string,
	isSuperuser bool,
	tenantID *int,
	duration time.Duration,
	options TokenOptions,
) (string, error) {
	now := time.Now()
	expiresAt := now.Add(duration)

	// Generate JTI for token tracking
	jti, err := GenerateSecureToken(16)
	if err != nil {
		return "", fmt.Errorf("failed to generate JTI: %w", err)
	}

	claims := JWTClaims{
		UserID:      userID,
		Username:    username,
		IsSuperuser: isSuperuser,
		TenantID:    tenantID,
		TokenType:   options.TokenType,
		DeviceID:    options.DeviceID,
		Scope:       options.Scope,
		JTI:         jti,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   strconv.Itoa(userID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secretKey))
}

// GenerateRefreshToken generates a refresh token
func (j *JWTService) GenerateRefreshToken(userID int, username string, duration time.Duration) (string, error) {
	now := time.Now()
	expiresAt := now.Add(duration)

	// Generate JTI for refresh token tracking
	jti, err := GenerateSecureToken(16)
	if err != nil {
		return "", fmt.Errorf("failed to generate JTI: %w", err)
	}

	claims := JWTClaims{
		UserID:    userID,
		Username:  username,
		TokenType: "refresh",
		JTI:       jti,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   strconv.Itoa(userID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secretKey))
}

// ValidateToken validates a JWT token and returns claims
func (j *JWTService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	// Check if token is blacklisted
	if claims.JTI != "" {
		if _, isBlacklisted := j.blacklistedJTIs[claims.JTI]; isBlacklisted {
			return nil, errors.New("token has been revoked")
		}
	}

	return claims, nil
}

// RefreshToken refreshes an access token using a refresh token
func (j *JWTService) RefreshToken(refreshTokenString string, userID int) (string, string, error) {
	claims, err := j.ValidateToken(refreshTokenString)
	if err != nil {
		return "", "", fmt.Errorf("invalid refresh token: %w", err)
	}

	if claims.TokenType != "refresh" {
		return "", "", errors.New("token is not a refresh token")
	}

	if claims.UserID != userID {
		return "", "", errors.New("token user ID mismatch")
	}

	// Generate new access token
	accessToken, err := j.GenerateToken(
		claims.UserID,
		claims.Username,
		claims.IsSuperuser,
		claims.TenantID,
		30*time.Minute,
	)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate new refresh token
	newRefreshToken, err := j.GenerateRefreshToken(
		claims.UserID,
		claims.Username,
		72*time.Hour,
	)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Blacklist the old refresh token
	if claims.JTI != "" {
		j.blacklistedJTIs[claims.JTI] = claims.ExpiresAt.Time
	}

	return accessToken, newRefreshToken, nil
}

// BlacklistToken blacklists a token by its JTI
func (j *JWTService) BlacklistToken(jti string, userID int, reason string, expiration time.Duration) error {
	if jti == "" {
		return errors.New("JTI is required for blacklisting")
	}

	j.blacklistedJTIs[jti] = time.Now().Add(expiration)
	return nil
}

// InvalidateSession invalidates a session (placeholder for future implementation)
func (j *JWTService) InvalidateSession(sessionID string) error {
	// Placeholder for session invalidation logic
	// In a real implementation, this would remove the session from storage
	return nil
}

// InvalidateAllUserTokens invalidates all tokens for a user (placeholder)
func (j *JWTService) InvalidateAllUserTokens(userID int, reason string) error {
	// Placeholder for invalidating all user tokens
	// In a real implementation, this would blacklist all active tokens for the user
	return nil
}

// CanRefreshToken checks if a token can be refreshed
func (j *JWTService) CanRefreshToken(tokenString string) (bool, time.Duration, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return false, 0, err
	}

	if claims.TokenType != "refresh" {
		return false, 0, errors.New("token is not a refresh token")
	}

	timeLeft := time.Until(claims.ExpiresAt.Time)
	canRefresh := timeLeft > 0

	return canRefresh, timeLeft, nil
}

// GetBlacklistStats returns the count of blacklisted tokens
func (j *JWTService) GetBlacklistStats() (int, error) {
	// Clean up expired blacklisted tokens first
	j.cleanupBlacklist()
	return len(j.blacklistedJTIs), nil
}

// CleanupBlacklist removes expired blacklisted tokens
func (j *JWTService) CleanupBlacklist() error {
	j.cleanupBlacklist()
	return nil
}

// cleanupBlacklist removes expired entries from the blacklist
func (j *JWTService) cleanupBlacklist() {
	now := time.Now()
	for jti, expiry := range j.blacklistedJTIs {
		if now.After(expiry) {
			delete(j.blacklistedJTIs, jti)
		}
	}
}

// IsTokenBlacklisted checks if a token is blacklisted
func (j *JWTService) IsTokenBlacklisted(jti string) bool {
	if jti == "" {
		return false
	}

	_, exists := j.blacklistedJTIs[jti]
	return exists
}

// Interface implementation - ensure JWTService implements TokenGenerator
var _ TokenGenerator = (*JWTService)(nil)
