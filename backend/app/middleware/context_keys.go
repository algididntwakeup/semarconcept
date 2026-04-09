// platform/backend/app/middleware/context_keys.go
package middleware

// ContextKey represents a key for storing values in Gin context
type ContextKey string

const (
	// ContextUserIDKey is used to store user ID in Gin context
	ContextUserIDKey ContextKey = "user_id"

	// ContextUsernameKey is used to store username in Gin context
	ContextUsernameKey ContextKey = "username"

	// ContextIsSuperuserKey is used to store superuser status in Gin context
	ContextIsSuperuserKey ContextKey = "is_superuser"

	// ContextTenantIDKey is used to store tenant ID in Gin context
	ContextTenantIDKey ContextKey = "tenant_id"

	// ContextClaimsKey is used to store JWT claims in Gin context
	ContextClaimsKey ContextKey = "claims"

	// ContextAuthenticatedKey is used to store authentication status in Gin context
	ContextAuthenticatedKey ContextKey = "authenticated"

	// ContextUserKey is used to store full user object in Gin context
	ContextUserKey ContextKey = "user"

	// ContextTenantKey is used to store full tenant object in Gin context
	ContextTenantKey ContextKey = "tenant"

	// ContextRolesKey is used to store user roles in Gin context
	ContextRolesKey ContextKey = "user_roles"

	// ContextPermissionsKey is used to store user permissions in Gin context
	ContextPermissionsKey ContextKey = "user_permissions"
)
