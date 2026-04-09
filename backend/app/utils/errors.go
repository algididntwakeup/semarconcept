// platform/backend/app/utils/errors.go
package utils

import "errors"

// Common application errors
var (
	// Tenant related errors
	ErrTenantNotFound          = errors.New("tenant not found")
	ErrSubdomainTaken          = errors.New("subdomain is already taken")
	ErrDomainTaken             = errors.New("domain is already taken")
	ErrTenantUserLimitExceeded = errors.New("tenant user limit exceeded")
	ErrBrandingNotFound        = errors.New("tenant branding not found")
	ErrBillingNotFound         = errors.New("tenant billing not found")
	ErrTenantUserNotFound      = errors.New("tenant user not found")
	ErrTenantConfigNotFound    = errors.New("tenant config not found")

	// User related errors
	ErrUserNotFound          = errors.New("user not found")
	ErrInvalidCredentials    = errors.New("invalid credentials")
	ErrAccountLocked         = errors.New("account is locked")
	ErrAccountInactive       = errors.New("account is inactive")
	ErrEmailAlreadyExists    = errors.New("email already exists")
	ErrUsernameAlreadyExists = errors.New("username already exists")
	ErrWeakPassword          = errors.New("password does not meet requirements")
	ErrInvalidEmailFormat    = errors.New("invalid email format")

	// Role and Permission errors
	ErrRoleNotFound       = errors.New("role not found")
	ErrPermissionNotFound = errors.New("permission not found")
	ErrPermissionDenied   = errors.New("permission denied")
	ErrInvalidRole        = errors.New("invalid role")

	// Authentication and Authorization errors
	ErrInvalidToken               = errors.New("invalid token")
	ErrTokenExpired               = errors.New("token expired")
	ErrUnauthorized               = errors.New("unauthorized")
	ErrForbidden                  = errors.New("forbidden")
	ErrPasswordResetTokenNotFound = errors.New("password reset token not found")

	// General errors (NON-ASSET SPECIFIC)
	ErrNotFound          = errors.New("resource not found")
	ErrResourceNotFound  = errors.New("resource not found")
	ErrDuplicateResource = errors.New("duplicate resource")
	ErrInvalidInput      = errors.New("invalid input")
	ErrConflict          = errors.New("resource conflict")

	// System errors
	ErrDatabaseError      = errors.New("database error")
	ErrInternalServer     = errors.New("internal server error")
	ErrServiceUnavailable = errors.New("service unavailable")
	ErrRateLimitExceeded  = errors.New("rate limit exceeded")

	// File and Storage errors
	ErrInvalidFileType      = errors.New("invalid file type")
	ErrFileSizeExceeded     = errors.New("file size exceeded")
	ErrStorageQuotaExceeded = errors.New("storage quota exceeded")

	// Dashboard errors
	ErrDashboardNotFound      = errors.New("dashboard not found")
	ErrDashboardShareNotFound = errors.New("dashboard share not found")
	ErrDashboardAccessDenied  = errors.New("dashboard access denied")

	ErrBadRequest = errors.New("bad request")
)

var ErrValidation = errors.New("validation error")

// Additional general errors (NON-ASSET SPECIFIC)
var (
	ErrDuplicateTagNumber    = errors.New("duplicate tag number")
	ErrDuplicateSerialNumber = errors.New("duplicate serial number")
	ErrInvalidParent         = errors.New("invalid parent resource")
)

var ErrCrossTenantOperation = errors.New("cross-tenant operation not allowed")

// NOTE: All asset-specific errors (ErrSiteNotFound, ErrSiteDuplicateCode, etc.)
// are now defined in app/utils/asset_errors.go to avoid duplication
// NOTE: ErrValidationFailed is defined in app/utils/asset_errors.go
// NOTE: LogInfof, LogErrorf, LogDebugf functions are defined in app/utils/logger.go
