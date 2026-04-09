// platform/backend/app/middleware/auth_middleware.go
package middleware

import (
	"net/http"
	"os"
	"strings"

	"backend/app/utils"

	"github.com/gin-gonic/gin"
)

// Claims structure for JWT validation
type Claims struct {
	UserID      int    `json:"user_id"`
	Username    string `json:"username"`
	IsSuperuser bool   `json:"is_superuser"`
	TenantID    *int   `json:"tenant_id,omitempty"`
	JTI         string `json:"jti"`
}

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware(jwtService utils.TokenGenerator) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip authentication for certain routes
		if shouldSkipAuth(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Development mode bypass via special headers
		if isDevelopmentMode() {
			devMode := c.GetHeader("X-Development-Mode")
			mockToken := c.GetHeader("X-Mock-Token")

			if devMode == "true" || mockToken != "" {
				mockUserID := 1
				mockTenantID := 1

				c.Set(string(ContextUserIDKey), mockUserID)
				c.Set(string(ContextUsernameKey), "dev-user")
				c.Set(string(ContextIsSuperuserKey), true)
				c.Set(string(ContextTenantIDKey), mockTenantID)
				c.Set(string(ContextAuthenticatedKey), true)
				c.Set(string(ContextClaimsKey), &Claims{
					UserID:      mockUserID,
					Username:    "dev-user",
					IsSuperuser: true,
					TenantID:    &mockTenantID,
					JTI:         "dev-mock-jti",
				})
				c.Next()
				return
			}
		}

		// Extract token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Authorization header required",
				"code":    "MISSING_AUTH_HEADER",
			})
			c.Abort()
			return
		}

		// Check Bearer token format
		tokenParts := strings.SplitN(authHeader, " ", 2)
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Invalid authorization header format. Expected 'Bearer <token>'",
				"code":    "INVALID_AUTH_FORMAT",
			})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Handle mock tokens in development
		if isDevelopmentMode() && (strings.HasPrefix(tokenString, "mock-") || strings.HasPrefix(tokenString, "dev-mock-")) {
			mockUserID := 1
			mockTenantID := 1

			c.Set(string(ContextUserIDKey), mockUserID)
			c.Set(string(ContextUsernameKey), "mock-user")
			c.Set(string(ContextIsSuperuserKey), true)
			c.Set(string(ContextTenantIDKey), mockTenantID)
			c.Set(string(ContextAuthenticatedKey), true)
			c.Set(string(ContextClaimsKey), &Claims{
				UserID:      mockUserID,
				Username:    "mock-user",
				IsSuperuser: true,
				TenantID:    &mockTenantID,
				JTI:         tokenString,
			})
			c.Next()
			return
		}

		// Validate real JWT token
		claims, err := jwtService.ValidateToken(tokenString)
		if err != nil {
			utils.Warnf("AUTH: Token validation failed for %s: %v", c.Request.URL.Path, err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Invalid or expired token",
				"code":    "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// Check if token is blacklisted
		if jwtService.IsTokenBlacklisted(claims.JTI) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Token has been revoked",
				"code":    "TOKEN_REVOKED",
			})
			c.Abort()
			return
		}

		// Set user context
		c.Set(string(ContextUserIDKey), claims.UserID)
		c.Set(string(ContextUsernameKey), claims.Username)
		c.Set(string(ContextIsSuperuserKey), claims.IsSuperuser)
		c.Set(string(ContextAuthenticatedKey), true)

		var tenantID int
		if claims.TenantID != nil {
			tenantID = *claims.TenantID
		}
		c.Set(string(ContextTenantIDKey), tenantID)
		c.Set(string(ContextClaimsKey), claims)

		c.Next()
	}
}

// NOTE: CORSMiddleware is defined in routes/router.go using config-based origins.
// Do NOT add a duplicate here.

// shouldSkipAuth returns true for routes that don't require authentication
func shouldSkipAuth(path string) bool {
	skipPaths := []string{
		"/api/v1/auth/login",
		"/api/v1/auth/register",
		"/api/v1/auth/forgot-password",
		"/api/v1/auth/reset-password",
		"/api/v1/auth/refresh",
		"/api/v1/health",
		"/api/v1/logs",
		"/health",
		"/docs",
		"/swagger",
	}

	for _, skipPath := range skipPaths {
		if strings.HasPrefix(path, skipPath) {
			return true
		}
	}

	return false
}

// isDevelopmentMode checks if we're running in development mode
func isDevelopmentMode() bool {
	env := os.Getenv("NODE_ENV")
	ginMode := gin.Mode()
	debugFlag := os.Getenv("DEBUG_AUTH")
	appEnv := os.Getenv("APP_ENV")

	return env == "development" ||
		appEnv == "development" ||
		ginMode == gin.DebugMode ||
		gin.IsDebugging() ||
		debugFlag == "true"
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

//  RENAMED: Helper functions for getting user information from context (renamed to avoid conflicts)
func GetAuthUserFromContext(c *gin.Context) (int, bool) {
	if userID, exists := c.Get(string(ContextUserIDKey)); exists {
		if id, ok := userID.(int); ok {
			return id, true
		}
	}
	return 0, false
}

func GetAuthUsernameFromContext(c *gin.Context) (string, bool) {
	if username, exists := c.Get(string(ContextUsernameKey)); exists {
		if name, ok := username.(string); ok {
			return name, true
		}
	}
	return "", false
}

func GetAuthTenantFromContext(c *gin.Context) (int, bool) {
	if tenantID, exists := c.Get(string(ContextTenantIDKey)); exists {
		if id, ok := tenantID.(int); ok {
			return id, true
		}
	}
	return 0, false
}

func IsAuthenticated(c *gin.Context) bool {
	if authenticated, exists := c.Get(string(ContextAuthenticatedKey)); exists {
		if auth, ok := authenticated.(bool); ok {
			return auth
		}
	}
	return false
}

func IsSuperuser(c *gin.Context) bool {
	if isSuperuser, exists := c.Get(string(ContextIsSuperuserKey)); exists {
		if superuser, ok := isSuperuser.(bool); ok {
			return superuser
		}
	}
	return false
}

func GetClaimsFromContext(c *gin.Context) (*Claims, bool) {
	if claims, exists := c.Get(string(ContextClaimsKey)); exists {
		if claimsObj, ok := claims.(*Claims); ok {
			return claimsObj, true
		}
	}
	return nil, false
}

// LogAuthContext logs the current authentication context for debugging
func LogAuthContext(c *gin.Context) {
	if !isDevelopmentMode() {
		return
	}

	userID, hasUser := GetAuthUserFromContext(c)
	username, hasUsername := GetAuthUsernameFromContext(c)
	tenantID, hasTenant := GetAuthTenantFromContext(c)
	isAuth := IsAuthenticated(c)
	isSuperuser := IsSuperuser(c)

	utils.Infof("🔍 AUTH CONTEXT: UserID=%d (%t), Username=%s (%t), TenantID=%d (%t), Auth=%t, Superuser=%t",
		userID, hasUser, username, hasUsername, tenantID, hasTenant, isAuth, isSuperuser)
}
