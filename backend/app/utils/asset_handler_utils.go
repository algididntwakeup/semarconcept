// platform/backend/app/utils/asset_handler_utils.go
package utils

import (
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
	return APIResponse{
		Success: false,
		Message: message,
		Error:   error,
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

// Context helper functions
func GetTenantID(c *gin.Context) int {
	// TODO: Update this to match your actual middleware implementation
	// Example patterns:
	// if tenantID, exists := c.Get("tenant_id"); exists {
	//     return tenantID.(int)
	// }

	// Fallback for now - update this!
	return 1
}

func GetUserID(c *gin.Context) int {
	// TODO: Update this to match your actual auth middleware implementation
	// Example patterns:
	// if userID, exists := c.Get("user_id"); exists {
	//     return userID.(int)
	// }

	// Fallback for now - update this!
	return 1
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
	// Check against your asset-specific not found errors from asset_errors.go
	return err == ErrSiteNotFound ||
		err == ErrUnitNotFound ||
		err == ErrAssetNotFound ||
		err == ErrComponentNotFound ||
		err == ErrNotFound ||
		err == ErrResourceNotFound
}
