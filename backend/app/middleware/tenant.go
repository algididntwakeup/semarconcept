// platform/backend/app/middleware/tenant.go
package middleware

import (
	"backend/app/config"
	"backend/app/models"
	"backend/app/repositories"
	"backend/app/utils"
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// TenantMiddleware handles tenant detection and context injection
type TenantMiddleware struct {
	tenantRepo repositories.TenantRepository
	config     *config.Config
}

// NewTenantMiddleware creates a new tenant middleware instance
func NewTenantMiddleware(tenantRepo repositories.TenantRepository, cfg *config.Config) *TenantMiddleware {
	return &TenantMiddleware{
		tenantRepo: tenantRepo,
		config:     cfg,
	}
}

// TenantDetection middleware detects the current tenant and adds it to the context
func (tm *TenantMiddleware) TenantDetection() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tenant *models.Tenant
		var err error

		// Method 1: Extract from subdomain (primary method for web UI)
		if tenant == nil {
			if subdomain := tm.extractSubdomain(c.Request.Host); subdomain != "" {
				tenant, err = tm.tenantRepo.FindBySubdomain(c.Request.Context(), subdomain)
				if err != nil {
					utils.LogErrorf("TenantMiddleware: Error finding tenant by subdomain '%s': %v", subdomain, err)
				}
			}
		}

		// Method 2: Extract from custom domain
		if tenant == nil {
			if domain := tm.extractCustomDomain(c.Request.Host); domain != "" {
				// Note: You'll need to add this method to the repository interface
				// tenant, err = tm.tenantRepo.GetByDomain(c.Request.Context(), domain)
				if err != nil {
					utils.LogErrorf("TenantMiddleware: Error finding tenant by domain '%s': %v", domain, err)
				}
			}
		}

		// Method 3: Extract from X-Tenant-ID header (for API calls)
		if tenant == nil {
			if tenantIDHeader := c.GetHeader("X-Tenant-ID"); tenantIDHeader != "" {
				if tenantID, parseErr := strconv.Atoi(tenantIDHeader); parseErr == nil {
					tenant, err = tm.tenantRepo.FindByID(c.Request.Context(), tenantID)
					if err != nil {
						utils.LogErrorf("TenantMiddleware: Error finding tenant by ID '%d': %v", tenantID, err)
					}
				}
			}
		}

		// Method 4: Extract from X-Tenant-Subdomain header (alternative for API)
		if tenant == nil {
			if subdomainHeader := c.GetHeader("X-Tenant-Subdomain"); subdomainHeader != "" {
				tenant, err = tm.tenantRepo.FindBySubdomain(c.Request.Context(), subdomainHeader)
				if err != nil {
					utils.LogErrorf("TenantMiddleware: Error finding tenant by subdomain header '%s': %v", subdomainHeader, err)
				}
			}
		}

		// Handle tenant validation
		if tenant != nil {
			// Check if tenant is active
			if !tenant.IsActive() {
				tm.handleInactiveTenant(c, tenant)
				return
			}

			// Add tenant to context
			c.Set("tenant", tenant)
			c.Set("tenant_id", tenant.ID)

			// Add tenant context to request context
			ctx := context.WithValue(c.Request.Context(), "tenant", tenant)
			ctx = context.WithValue(ctx, "tenant_id", tenant.ID)
			c.Request = c.Request.WithContext(ctx)

			utils.LogInfof("TenantMiddleware: Detected tenant: %s (ID: %d)", tenant.Name, tenant.ID)
		} else {
			// No tenant detected - could be system/admin routes or invalid tenant
			utils.LogInfof("TenantMiddleware: No tenant detected for host: %s", c.Request.Host)
		}

		c.Next()
	}
}

// RequireTenant middleware ensures a valid tenant is present in the context
func (tm *TenantMiddleware) RequireTenant() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenant, exists := c.Get("tenant")
		if !exists || tenant == nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid tenant or tenant not found",
			})
			c.Abort()
			return
		}

		tenantModel, ok := tenant.(*models.Tenant)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid tenant context",
			})
			c.Abort()
			return
		}

		if !tenantModel.IsActive() {
			tm.handleInactiveTenant(c, tenantModel)
			return
		}

		c.Next()
	}
}

// SystemOnly middleware ensures only system-level access (no tenant required)
func (tm *TenantMiddleware) SystemOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user is a superuser
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
			})
			c.Abort()
			return
		}

		// Additional check could be added here to verify superuser status
		// For now, we'll allow access if no tenant is detected
		if _, hasTenant := c.Get("tenant"); hasTenant {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "System-only endpoint - tenant context not allowed",
			})
			c.Abort()
			return
		}

		utils.LogInfof("SystemOnly: User %v accessing system endpoint", userID)
		c.Next()
	}
}

// TenantIsolation middleware ensures all database operations are tenant-aware
func (tm *TenantMiddleware) TenantIsolation() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenant, exists := c.Get("tenant")
		if !exists {
			// If no tenant in context, this might be a system operation
			// Allow it to proceed but log for monitoring
			utils.LogInfof("TenantIsolation: No tenant context for %s %s", c.Request.Method, c.Request.URL.Path)
			c.Next()
			return
		}

		tenantModel, ok := tenant.(*models.Tenant)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid tenant context",
			})
			c.Abort()
			return
		}

		// Add tenant ID to all subsequent database operations
		c.Set("enforce_tenant_isolation", true)
		c.Set("isolation_tenant_id", tenantModel.ID)

		utils.LogDebugf("TenantIsolation: Enforcing isolation for tenant %d", tenantModel.ID)
		c.Next()
	}
}

// TenantResourceLimit middleware checks resource limits for the tenant
func (tm *TenantMiddleware) TenantResourceLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenant, exists := c.Get("tenant")
		if !exists {
			c.Next()
			return
		}

		tenantModel, ok := tenant.(*models.Tenant)
		if !ok {
			c.Next()
			return
		}

		// Check various resource limits based on the request
		method := c.Request.Method
		path := c.Request.URL.Path

		// Check user limit for user creation endpoints
		if method == "POST" && strings.Contains(path, "/users") {
			if !tenantModel.CanAddUsers() {
				c.JSON(http.StatusForbidden, gin.H{
					"error":     "User limit exceeded",
					"max_users": tenantModel.MaxUsers,
				})
				c.Abort()
				return
			}
		}

		// Check storage limit for file upload endpoints
		if method == "POST" && (strings.Contains(path, "/upload") || strings.Contains(path, "/media")) {
			// This would need integration with storage service to check current usage
			// For now, we'll just pass through
		}

		c.Next()
	}
}

// extractSubdomain extracts the subdomain from the host
func (tm *TenantMiddleware) extractSubdomain(host string) string {
	// Remove port if present
	if colonIndex := strings.Index(host, ":"); colonIndex != -1 {
		host = host[:colonIndex]
	}

	// For localhost development
	if host == "localhost" || host == "127.0.0.1" {
		return ""
	}

	// Split by dots
	parts := strings.Split(host, ".")

	// Need at least 3 parts for subdomain.domain.tld
	if len(parts) < 3 {
		return ""
	}

	// The first part is the subdomain
	subdomain := parts[0]

	// Ignore www
	if subdomain == "www" {
		return ""
	}

	// Basic validation
	if len(subdomain) < 1 || len(subdomain) > 63 {
		return ""
	}

	return subdomain
}

// extractCustomDomain checks if the host is a custom domain
func (tm *TenantMiddleware) extractCustomDomain(host string) string {
	// Remove port if present
	if colonIndex := strings.Index(host, ":"); colonIndex != -1 {
		host = host[:colonIndex]
	}

	// For localhost development
	if host == "localhost" || host == "127.0.0.1" {
		return ""
	}

	// Check if this is our main domain or subdomain
	mainDomain := tm.config.HTTPServer.Host // e.g., "yourdomain.com"
	if strings.HasSuffix(host, "."+mainDomain) || host == mainDomain {
		return "" // This is not a custom domain
	}

	// This might be a custom domain
	return host
}

// handleInactiveTenant handles requests to inactive tenants
func (tm *TenantMiddleware) handleInactiveTenant(c *gin.Context, tenant *models.Tenant) {
	var message string
	var statusCode int

	switch tenant.Status {
	case models.TenantStatusSuspended:
		message = "This account has been suspended. Please contact support."
		statusCode = http.StatusForbidden
	case models.TenantStatusInactive:
		message = "This account is currently inactive."
		statusCode = http.StatusForbidden
	case models.TenantStatusDeleted:
		message = "This account no longer exists."
		statusCode = http.StatusNotFound
	default:
		message = "This account is not available."
		statusCode = http.StatusForbidden
	}

	// Check if this is an API request
	if strings.HasPrefix(c.Request.URL.Path, "/api/") ||
		c.GetHeader("Accept") == "application/json" ||
		c.GetHeader("Content-Type") == "application/json" {
		c.JSON(statusCode, gin.H{
			"error":         message,
			"tenant_status": tenant.Status,
		})
	} else {
		// For web requests, you might want to redirect to a status page
		c.HTML(statusCode, "tenant_status.html", gin.H{
			"message":       message,
			"tenant_name":   tenant.Name,
			"tenant_status": tenant.Status,
		})
	}
	c.Abort()
}

// GetTenantFromContext retrieves the tenant from the Gin context
func GetTenantFromContext(c *gin.Context) (*models.Tenant, bool) {
	tenant, exists := c.Get("tenant")
	if !exists {
		return nil, false
	}

	tenantModel, ok := tenant.(*models.Tenant)
	if !ok {
		return nil, false
	}

	return tenantModel, true
}

// GetTenantIDFromContext retrieves the tenant ID from the Gin context
func GetTenantIDFromContext(c *gin.Context) (int, bool) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		return 0, false
	}

	id, ok := tenantID.(int)
	if !ok {
		return 0, false
	}

	return id, true
}

// GetTenantFromRequestContext retrieves the tenant from the request context
func GetTenantFromRequestContext(ctx context.Context) (*models.Tenant, bool) {
	tenant := ctx.Value("tenant")
	if tenant == nil {
		return nil, false
	}

	tenantModel, ok := tenant.(*models.Tenant)
	if !ok {
		return nil, false
	}

	return tenantModel, true
}

// GetTenantIDFromRequestContext retrieves the tenant ID from the request context
func GetTenantIDFromRequestContext(ctx context.Context) (int, bool) {
	tenantID := ctx.Value("tenant_id")
	if tenantID == nil {
		return 0, false
	}

	id, ok := tenantID.(int)
	if !ok {
		return 0, false
	}

	return id, true
}
