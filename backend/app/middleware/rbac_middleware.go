// platform/backend/app/middleware/rbac_middleware.go
package middleware

import (
	"backend/app/api/handlers"
	"backend/app/models"
	"backend/app/utils"
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
) // Triggers reload for air

// RBACRoleProvider defines the minimal interface needed by the RBAC middleware
// to look up a user's roles and the permissions attached to each role.
type RBACRoleProvider interface {
	FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error)
	GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error)
}

// permissionCache stores user permissions with TTL to avoid repeated DB hits.
type permissionCache struct {
	mu      sync.RWMutex
	entries map[int]*cacheEntry
}

type cacheEntry struct {
	permissions map[string]bool
	expiresAt   time.Time
}

const permissionCacheTTL = 5 * time.Minute

var globalPermCache = &permissionCache{
	entries: make(map[int]*cacheEntry),
}

func (pc *permissionCache) get(userID int) (map[string]bool, bool) {
	pc.mu.RLock()
	defer pc.mu.RUnlock()
	entry, ok := pc.entries[userID]
	if !ok || time.Now().After(entry.expiresAt) {
		return nil, false
	}
	return entry.permissions, true
}

func (pc *permissionCache) set(userID int, permissions map[string]bool) {
	pc.mu.Lock()
	defer pc.mu.Unlock()
	pc.entries[userID] = &cacheEntry{
		permissions: permissions,
		expiresAt:   time.Now().Add(permissionCacheTTL),
	}
}

func (pc *permissionCache) invalidate(userID int) {
	pc.mu.Lock()
	defer pc.mu.Unlock()
	delete(pc.entries, userID)
}

// getUserPermissions fetches all permissions for a user via their roles.
func getUserPermissions(ctx context.Context, provider RBACRoleProvider, userID int) (map[string]bool, error) {
	if cached, ok := globalPermCache.get(userID); ok {
		return cached, nil
	}

	roles, err := provider.FindRolesByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	permissions := make(map[string]bool)
	for _, role := range roles {
		perms, err := provider.GetRolePermissions(ctx, role.ID)
		if err != nil {
			utils.Warnf("RBAC: failed to fetch permissions for role %d: %v", role.ID, err)
			continue
		}
		for _, perm := range perms {
			permissions[perm.GetPermissionKey()] = true
		}
	}

	globalPermCache.set(userID, permissions)
	return permissions, nil
}

// RBACMiddleware checks if the authenticated user has the required permission.
// requiredPermission uses "resource:action" format, e.g. "user:create".
func RBACMiddleware(provider RBACRoleProvider, requiredPermission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get(string(ContextUserIDKey))
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, handlers.ErrorResponse{Error: "Access denied: user identity not found."})
			return
		}

		userID, ok := userIDVal.(int)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, handlers.ErrorResponse{Error: "Error processing user identity."})
			return
		}

		// Superusers bypass all permission checks
		isSuperuserVal, _ := c.Get(string(ContextIsSuperuserKey))
		if isSuperuser, ok := isSuperuserVal.(bool); ok && isSuperuser {
			c.Next()
			return
		}

		// Fetch real permissions from DB (cached per request cycle)
		permissions, err := getUserPermissions(c.Request.Context(), provider, userID)
		if err != nil {
			utils.Warnf("RBAC: permission lookup failed for user %d: %v", userID, err)
			c.AbortWithStatusJSON(http.StatusForbidden, handlers.ErrorResponse{Error: "Access denied: unable to verify permissions."})
			return
		}

		// Check wildcard
		if permissions["*:*"] || permissions["*"] {
			c.Next()
			return
		}

		if !permissions[requiredPermission] {
			c.AbortWithStatusJSON(http.StatusForbidden, handlers.ErrorResponse{Error: "Access denied: you do not have the required permission."})
			return
		}

		c.Next()
	}
}

// InvalidatePermissionCache clears cached permissions for a user.
// Call this when user roles or permissions are modified.
func InvalidatePermissionCache(userID int) {
	globalPermCache.invalidate(userID)
}
