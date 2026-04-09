// platform/backend/app/middleware/tenant_isolation_middleware.go
package middleware

import (
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// TenantIsolationMiddleware handles tenant detection and isolation
type TenantIsolationMiddleware struct {
	tenantService services.TenantService
}

// NewTenantIsolationMiddleware creates a new tenant isolation middleware
func NewTenantIsolationMiddleware(tenantService services.TenantService) *TenantIsolationMiddleware {
	return &TenantIsolationMiddleware{
		tenantService: tenantService,
	}
}

// TenantResolver middleware resolves tenant context from request
func (tm *TenantIsolationMiddleware) TenantResolver() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tenantID int
		var err error
		_ = err // Suppress unused variable warning

		// Method 1: Extract from subdomain (e.g., tenant1.api.domain.com)
		if tenantID == 0 {
			tenantID = tm.extractTenantFromSubdomain(c)
		}

		// Method 2: Extract from X-Tenant-ID header (for API calls)
		if tenantID == 0 {
			tenantID = tm.extractTenantFromHeader(c)
		}

		// Method 3: Extract from JWT token claims (if user is already authenticated)
		if tenantID == 0 {
			tenantID = tm.extractTenantFromToken(c)
		}

		// Method 4: Extract from query parameter (for development/testing)
		if tenantID == 0 {
			tenantID = tm.extractTenantFromQuery(c)
		}

		// If no tenant found and it's not a system/public route, check if super admin
		if tenantID == 0 && !tm.isSystemRoute(c.Request.URL.Path) {
			if !tm.isSuperAdmin(c) {
				utils.Warnf("TenantResolver: No tenant context found for path: %s", c.Request.URL.Path)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Tenant context required. Please specify tenant via subdomain, header, or ensure proper authentication.",
				})
				c.Abort()
				return
			}
		}

		// Validate tenant exists and is active (if tenant ID was found)
		if tenantID > 0 {
			tenant, err := tm.tenantService.GetTenantByID(c.Request.Context(), int(tenantID))
			if err != nil {
				utils.Errorf("TenantResolver: Error fetching tenant %d: %v", tenantID, err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant"})
				c.Abort()
				return
			}

			if tenant.Status != "active" {
				utils.Warnf("TenantResolver: Inactive tenant access attempt: %d", tenantID)
				c.JSON(http.StatusForbidden, gin.H{"error": "Tenant is suspended"})
				c.Abort()
				return
			}

			// Set tenant context for downstream middleware and handlers
			c.Set("tenantID", tenantID)
			c.Set("tenant", tenant)
			c.Set("tenantSubdomain", tenant.Subdomain)

			utils.Debugf("TenantResolver: Set tenant context - ID: %d, Name: %s", tenantID, tenant.Name)
		} else {
			// No tenant context (system routes or super admin)
			c.Set("tenantID", 0)
			utils.Debug("TenantResolver: No tenant context set (system route or super admin)")
		}

		c.Next()
	}
}

// extractTenantFromSubdomain extracts tenant from subdomain
func (tm *TenantIsolationMiddleware) extractTenantFromSubdomain(c *gin.Context) int {
	host := c.Request.Host

	// Remove port if present
	if colonIndex := strings.Index(host, ":"); colonIndex != -1 {
		host = host[:colonIndex]
	}

	// Split by dots to get subdomain
	parts := strings.Split(host, ".")
	if len(parts) < 3 {
		return 0 // No subdomain or not enough parts
	}

	subdomain := parts[0]
	if subdomain == "www" || subdomain == "api" {
		return 0 // Skip common prefixes
	}

	// Look up tenant by subdomain
	tenant, err := tm.tenantService.GetTenantBySubdomain(c.Request.Context(), subdomain)
	if err != nil {
		utils.Debugf("TenantResolver: No tenant found for subdomain: %s", subdomain)
		return 0
	}

	return int(tenant.ID)
}

// extractTenantFromHeader extracts tenant from X-Tenant-ID header
func (tm *TenantIsolationMiddleware) extractTenantFromHeader(c *gin.Context) int {
	tenantHeader := c.GetHeader("X-Tenant-ID")
	if tenantHeader == "" {
		tenantHeader = c.GetHeader("X-Tenant-Subdomain")
		if tenantHeader != "" {
			// Look up by subdomain
			tenant, err := tm.tenantService.GetTenantBySubdomain(c.Request.Context(), tenantHeader)
			if err != nil {
				return 0
			}
			return int(tenant.ID)
		}
		return 0
	}

	tenantID, err := strconv.Atoi(tenantHeader)
	if err != nil {
		utils.Debugf("TenantResolver: Invalid tenant ID header: %s", tenantHeader)
		return 0
	}

	return tenantID
}

// extractTenantFromToken extracts tenant from JWT token claims
func (tm *TenantIsolationMiddleware) extractTenantFromToken(c *gin.Context) int {
	// Get tenant ID from user context if user is authenticated
	userIDVal, exists := c.Get("user_id")
	_ = userIDVal // Suppress unused variable warning
	if !exists {
		return 0
	}

	userID, ok := userIDVal.(int)
	_ = userID // Suppress unused variable warning
	if !ok {
		return 0
	}

	// This would require getting user's tenant ID from the auth context
	// For now, we'll check if tenantID is already set in context from auth middleware
	tenantIDVal, exists := c.Get("userTenantID")
	if !exists {
		return 0
	}

	tenantID, ok := tenantIDVal.(int)
	if !ok {
		return 0
	}

	return tenantID
}

// extractTenantFromQuery extracts tenant from query parameter (for testing)
func (tm *TenantIsolationMiddleware) extractTenantFromQuery(c *gin.Context) int {
	tenantQuery := c.Query("tenant_id")
	if tenantQuery == "" {
		return 0
	}

	tenantID, err := strconv.Atoi(tenantQuery)
	if err != nil {
		return 0
	}

	return tenantID
}

// isSystemRoute checks if the route is a system route that doesn't require tenant context
func (tm *TenantIsolationMiddleware) isSystemRoute(path string) bool {
	systemRoutes := []string{
		"/api/v1/health",
		"/api/v1/auth/login",
		"/api/v1/auth/register", // If public registration is allowed
		"/api/v1/auth/forgot-password",
		"/api/v1/auth/reset-password",
		"/api/v1/system/",
		"/api/v1/super-admin/",
		"/swagger/",
		"/docs/",
	}

	for _, route := range systemRoutes {
		if strings.HasPrefix(path, route) {
			return true
		}
	}

	return false
}

// isSuperAdmin checks if the current user is a super admin
func (tm *TenantIsolationMiddleware) isSuperAdmin(c *gin.Context) bool {
	userIDVal, exists := c.Get("user_id")
	_ = userIDVal // Suppress unused variable warning
	if !exists {
		return false
	}

	// Check if user has super admin flag in context (set by auth middleware)
	isSuperVal, exists := c.Get("isSuperuser")
	if !exists {
		return false
	}

	isSuper, ok := isSuperVal.(bool)
	if !ok {
		return false
	}

	return isSuper
}

// TenantValidation middleware ensures operations are performed within tenant context
func (tm *TenantIsolationMiddleware) TenantValidation() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip validation for system routes
		if tm.isSystemRoute(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Skip validation for super admins
		if tm.isSuperAdmin(c) {
			c.Next()
			return
		}

		// Ensure tenant context exists
		tenantIDVal, exists := c.Get("tenantID")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing tenant context"})
			c.Abort()
			return
		}

		tenantID, ok := tenantIDVal.(int)
		if !ok || tenantID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant context"})
			c.Abort()
			return
		}

		// Ensure user belongs to the tenant (if user is authenticated)
		userIDVal, userExists := c.Get("user_id")
		if userExists {
			userTenantIDVal, exists := c.Get("userTenantID")
			if exists {
				userTenantID, ok := userTenantIDVal.(int)
				if ok && userTenantID != tenantID && !tm.isSuperAdmin(c) {
					utils.Warnf("TenantValidation: User %v attempting to access tenant %d but belongs to tenant %d",
						userIDVal, tenantID, userTenantID)
					c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Cross-tenant access not allowed"})
					c.Abort()
					return
				}
			}
		}

		c.Next()
	}
}

// GetTenantID helper function to get tenant ID from context
func GetTenantID(c *gin.Context) int {
	tenantIDVal, exists := c.Get("tenantID")
	if !exists {
		return 0
	}

	tenantID, ok := tenantIDVal.(int)
	if !ok {
		return 0
	}

	return tenantID
}

// GetTenantContext helper function to get full tenant context
func GetTenantContext(c *gin.Context) (tenantID int, subdomain string, exists bool) {
	tenantIDVal, tenantExists := c.Get("tenantID")
	if !tenantExists {
		return 0, "", false
	}

	tenantID, ok := tenantIDVal.(int)
	if !ok {
		return 0, "", false
	}

	subdomainVal, _ := c.Get("tenantSubdomain")
	subdomain, _ = subdomainVal.(string)

	return tenantID, subdomain, true
}

// RequireTenant middleware ensures tenant context is required for the route
func RequireTenant() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := GetTenantID(c)
		if tenantID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant context is required for this operation"})
			c.Abort()
			return
		}
		c.Next()
	}
}
