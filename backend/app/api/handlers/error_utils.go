// platform/backend/app/api/handlers/error_utils.go
package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ValidationErrorResponse represents validation error details with consistent format
type ValidationErrorResponse struct {
	Status  string                 `json:"status"`
	Error   string                 `json:"error"`
	Details map[string]interface{} `json:"details"`
}

// SuccessResponse represents a standardized success response
type SuccessResponse struct {
	Status  string      `json:"status"`
	Data    interface{} `json:"data"`
	Message string      `json:"message,omitempty"`
	Count   int         `json:"count,omitempty"`
}

// FormatValidationErrorsDetailed converts validator.ValidationErrors into a more readable format.
func FormatValidationErrorsDetailed(ve validator.ValidationErrors) map[string]string {
	errs := make(map[string]string)
	for _, fe := range ve {
		field := strings.ToLower(fe.Field()) // Use JSON field name if available via fe.StructNamespace() or similar
		switch fe.Tag() {
		case "required":
			errs[field] = fmt.Sprintf("The %s field is required.", field)
		case "email":
			errs[field] = fmt.Sprintf("The %s field must be a valid email address.", field)
		case "min":
			errs[field] = fmt.Sprintf("The %s field must be at least %s characters long.", field, fe.Param())
		case "max":
			errs[field] = fmt.Sprintf("The %s field may not be greater than %s characters.", field, fe.Param())
		case "gte":
			errs[field] = fmt.Sprintf("The %s field must be greater than or equal to %s.", field, fe.Param())
		case "lte":
			errs[field] = fmt.Sprintf("The %s field must be less than or equal to %s.", field, fe.Param())
		case "url":
			errs[field] = fmt.Sprintf("The %s field must be a valid URL.", field)
		case "oneof":
			errs[field] = fmt.Sprintf("The %s field must be one of: %s.", field, fe.Param())
		default:
			errs[field] = fmt.Sprintf("The %s field is invalid (tag: %s).", field, fe.Tag())
		}
	}
	return errs
}

// HandleValidationError processes validation errors and returns consistent JSON
func HandleValidationError(c *gin.Context, err error) {
	// Force JSON content type to ensure JSON response
	c.Header("Content-Type", "application/json")

	var validationErrors map[string]interface{}

	if ve, ok := err.(validator.ValidationErrors); ok {
		// Handle go-playground/validator errors
		validationErrors = make(map[string]interface{})
		details := FormatValidationErrorsDetailed(ve)

		for field, message := range details {
			validationErrors[field] = []string{message}
		}
	} else {
		// Handle other types of validation errors (JSON unmarshal, custom validation, etc.)
		validationErrors = map[string]interface{}{
			"general": []string{err.Error()},
		}
	}

	response := ValidationErrorResponse{
		Status:  "error",
		Error:   "Invalid request format",
		Details: validationErrors,
	}

	c.JSON(http.StatusBadRequest, response)
}

// HandleNotFound returns a standardized 404 response
func HandleNotFound(c *gin.Context, resource string) {
	HandleError(c, http.StatusNotFound, fmt.Sprintf("%s not found", resource), nil)
}

// HandleUnauthorized returns a standardized 401 response
func HandleUnauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized access"
	}
	HandleError(c, http.StatusUnauthorized, message, nil)
}

// HandleForbidden returns a standardized 403 response
func HandleForbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Forbidden access"
	}
	HandleError(c, http.StatusForbidden, message, nil)
}

// HandleSuccess returns a standardized success response
func HandleSuccess(c *gin.Context, statusCode int, data interface{}, message string) {
	c.Header("Content-Type", "application/json")

	response := SuccessResponse{
		Status:  "success",
		Data:    data,
		Message: message,
	}

	c.JSON(statusCode, response)
}

// HandleSuccessWithCount returns a standardized success response with count
func HandleSuccessWithCount(c *gin.Context, statusCode int, data interface{}, count int, message string) {
	c.Header("Content-Type", "application/json")

	response := SuccessResponse{
		Status:  "success",
		Data:    data,
		Count:   count,
		Message: message,
	}

	c.JSON(statusCode, response)
}

// JSONResponseMiddleware ensures all responses have JSON content type
func JSONResponseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		c.Next()
	}
}

// CustomRecoveryMiddleware ensures panic recovery returns JSON
func CustomRecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, err interface{}) {
		c.Header("Content-Type", "application/json")

		response := ErrorResponse{
			Error: "Internal server error",
		}

		// Log the error for debugging
		fmt.Printf("Recovery from panic: %v\n", err)

		c.JSON(http.StatusInternalServerError, response)
	})
}
