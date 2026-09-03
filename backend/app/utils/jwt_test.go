// platform/backend/app/utils/jwt_test.go
package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const testSecret = "test-jwt-secret-key-that-is-sufficiently-long-for-hmac-sha256"
const testIssuer = "reksolindo-test"

func TestGenerateAndValidateToken(t *testing.T) {
	jwtService := NewJWTService(testSecret, testIssuer)

	userID := 123
	username := "testuser"
	isSuperuser := true
	tenantID := 456

	tokenString, err := jwtService.GenerateToken(userID, username, isSuperuser, &tenantID, 15*time.Minute)
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenString)

	claims, err := jwtService.ValidateToken(tokenString)
	assert.NoError(t, err)
	assert.NotNil(t, claims)

	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, username, claims.Username)
	assert.Equal(t, isSuperuser, claims.IsSuperuser)
	assert.NotNil(t, claims.TenantID)
	assert.Equal(t, tenantID, *claims.TenantID)
}

func TestValidateToken_InvalidSignature(t *testing.T) {
	service1 := NewJWTService(testSecret, testIssuer)
	service2 := NewJWTService("completely-different-secret-key-32chars", testIssuer)

	tokenString, err := service1.GenerateToken(1, "user1", false, nil, 15*time.Minute)
	assert.NoError(t, err)

	claims, err := service2.ValidateToken(tokenString)
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_Expired(t *testing.T) {
	jwtService := NewJWTService(testSecret, testIssuer)

	tokenString, err := jwtService.GenerateToken(1, "user1", false, nil, -15*time.Minute)
	assert.NoError(t, err)

	claims, err := jwtService.ValidateToken(tokenString)
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_Malformed(t *testing.T) {
	jwtService := NewJWTService(testSecret, testIssuer)

	claims, err := jwtService.ValidateToken("this.is.not.a.valid.jwt")
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestBlacklistToken(t *testing.T) {
	jwtService := NewJWTService(testSecret, testIssuer)

	opts := TokenOptions{
		TokenType: "access",
	}
	tokenString, err := jwtService.GenerateTokenWithOptions(1, "user1", false, nil, 15*time.Minute, opts)
	assert.NoError(t, err)

	claims, err := jwtService.ValidateToken(tokenString)
	assert.NoError(t, err)
	assert.NotEmpty(t, claims.JTI)

	assert.False(t, jwtService.IsTokenBlacklisted(claims.JTI))

	err = jwtService.BlacklistToken(claims.JTI, 1, "test logout", 15*time.Minute)
	assert.NoError(t, err)

	assert.True(t, jwtService.IsTokenBlacklisted(claims.JTI))

	// ValidateToken should now reject blacklisted token
	claimsAfterBlacklist, err := jwtService.ValidateToken(tokenString)
	assert.Error(t, err)
	assert.Nil(t, claimsAfterBlacklist)
}

