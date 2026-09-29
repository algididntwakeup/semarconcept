// platform/backend/app/utils/asset_handler_utils.go
package utils

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// APIResponse represents a standard API response structure
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Code    string      `json:"code,omitempty"`
}

// Response helper functions
func SuccessResponse(message string, data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
}

func ErrorResponse(message, error string) APIResponse {
	if error == "" {
		error = message
	}
	return APIResponse{
		Success: false,
		Message: message,
		Error:   error,
		Code:    "API_ERROR",
	}
}

func ValidationErrorResponse(err error) APIResponse {
	// Check if it's a validator.ValidationErrors
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		errorMap := FormatValidationErrors(validationErrors)
		return APIResponse{
			Success: false,
			Message: "Validation failed",
			Data:    errorMap,
			Code:    "VALIDATION_ERROR",
		}
	}

	return APIResponse{
		Success: false,
		Message: "Validation failed",
		Error:   err.Error(),
		Code:    "VALIDATION_ERROR",
	}
}

// Context helper functions with zero-trust tenant enforcement (no fallback to default tenant)
func GetTenantID(c *gin.Context) int {
	if c == nil {
		return 0
	}

	// 1. Primary: check canonical "tenant_id" key (set by AuthMiddleware)
	if val, exists := c.Get("tenant_id"); exists && val != nil {
		if id := coerceToInt(val); id > 0 {
			return id
		}
	}

	// 2. Secondary: check alternative "tenantID" key (set by TenantResolver)
	if val, exists := c.Get("tenantID"); exists && val != nil {
		if id := coerceToInt(val); id > 0 {
			return id
		}
	}

	// 3. Tertiary: check "isolation_tenant_id" key
	if val, exists := c.Get("isolation_tenant_id"); exists && val != nil {
		if id := coerceToInt(val); id > 0 {
			return id
		}
	}

	return 0
}

func GetUserID(c *gin.Context) int {
	if c == nil {
		return 0
	}

	// Check canonical "user_id" key
	if val, exists := c.Get("user_id"); exists && val != nil {
		if id := coerceToInt(val); id > 0 {
			return id
		}
	}

	return 0
}

// RequireTenantID extracts the verified tenant ID or returns an error.
func RequireTenantID(c *gin.Context) (int, error) {
	id := GetTenantID(c)
	if id <= 0 {
		return 0, errors.New("tenant identity not found in authenticated context")
	}
	return id, nil
}

// RequireUserID extracts the verified user ID or returns an error.
func RequireUserID(c *gin.Context) (int, error) {
	id := GetUserID(c)
	if id <= 0 {
		return 0, errors.New("user identity not found in authenticated context")
	}
	return id, nil
}

func coerceToInt(val interface{}) int {
	switch v := val.(type) {
	case int:
		return v
	case int64:
		return int(v)
	case int32:
		return int(v)
	case uint:
		return int(v)
	case uint64:
		return int(v)
	case uint32:
		return int(v)
	case float64:
		return int(v)
	case float32:
		return int(v)
	case string:
		if parsed, err := strconv.Atoi(v); err == nil {
			return parsed
		}
	case *int:
		if v != nil {
			return *v
		}
	}
	return 0
}

// ValidateStruct validates a struct using go-playground/validator
func ValidateStruct(s interface{}) error {
	validate := validator.New()
	return validate.Struct(s)
}

// Parameter parsing helpers
func GetPathParamAsInt(c *gin.Context, key string) (int, error) {
	param := c.Param(key)
	return strconv.Atoi(param)
}

func ParsePage(c *gin.Context) int {
	return ParseIntOrDefault(c.DefaultQuery("page", "1"), 1)
}

func ParseLimit(c *gin.Context) int {
	limit := ParseIntOrDefault(c.DefaultQuery("limit", "20"), 20)
	if limit > 100 {
		return 100
	}
	if limit < 1 {
		return 20
	}
	return limit
}

func GetQueryParam(c *gin.Context, key string) string {
	return c.Query(key)
}

// Error checking functions
func IsValidationError(err error) bool {
	if errors.Is(err, ErrValidation) {
		return true
	}
	// Check against your asset-specific validation errors from asset_errors.go
	return err == ErrSiteNameRequired ||
		err == ErrUnitNameRequired ||
		err == ErrAssetNameRequired ||
		err == ErrComponentNameRequired ||
		err == ErrUnitSiteRequired ||
		err == ErrAssetUnitRequired ||
		err == ErrComponentAssetRequired ||
		err == ErrInvalidCriticality ||
		err == ErrInvalidStatus ||
		err == ErrSiteDuplicateCode ||
		err == ErrSiteDuplicateName ||
		err == ErrSiteHasActiveUnits ||
		err == ErrUnitHasActiveAsset ||
		err == ErrAssetHasActiveComponents ||
		err == ErrValidation
}

func IsNotFoundError(err error) bool {
	if errors.Is(err, ErrAssetNotFound) || errors.Is(err, ErrSiteNotFound) || errors.Is(err, ErrUnitNotFound) || errors.Is(err, ErrComponentNotFound) || errors.Is(err, ErrNotFound) || errors.Is(err, ErrResourceNotFound) {
		return true
	}
	// Check against your asset-specific not found errors from asset_errors.go
	return err == ErrSiteNotFound ||
		err == ErrUnitNotFound ||
		err == ErrAssetNotFound ||
		err == ErrComponentNotFound ||
		err == ErrNotFound ||
		err == ErrResourceNotFound
}
