// platform/backend/app/middleware/error_middleware.go

package middleware

import (
	"errors"
	"net/http"

	"backend/app/models"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ErrorResponse is a wrapper for models.ErrorResponse to ensure consistent error responses
type ErrorResponse = models.ErrorResponse

// FormatValidationErrorsSimple converts validator.ValidationErrors into a map format
func FormatValidationErrorsSimple(ve validator.ValidationErrors) map[string]string {
	errs := make(map[string]string)
	for _, fe := range ve {
		errs[fe.Field()] = fe.Tag()
	}
	return errs
}

// ErrorHandlerMiddleware is a middleware that handles errors and returns standardized error responses.
func ErrorHandlerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Process the request
		c.Next()

		// If there are no errors, return
		if len(c.Errors) == 0 {
			return
		}

		// Get the last error
		err := c.Errors.Last().Err

		// Default status code and error message
		statusCode := http.StatusInternalServerError
		errorMessage := "Internal server error"
		var details interface{}

		// Check for specific error types
		switch {
		case errors.Is(err, utils.ErrValidation):
			statusCode = http.StatusBadRequest
			errorMessage = "Validation failed"

			// Check if it's a validator.ValidationErrors
			var validationErrors validator.ValidationErrors
			if errors.As(err, &validationErrors) {
				details = FormatValidationErrorsSimple(validationErrors)
			}

		case errors.Is(err, utils.ErrUnauthorized):
			statusCode = http.StatusUnauthorized
			errorMessage = "Unauthorized"

		case errors.Is(err, utils.ErrForbidden):
			statusCode = http.StatusForbidden
			errorMessage = "Forbidden"

		case errors.Is(err, utils.ErrNotFound):
			statusCode = http.StatusNotFound
			errorMessage = "Not found"

		case errors.Is(err, utils.ErrConflict):
			statusCode = http.StatusConflict
			errorMessage = "Conflict"

		case errors.Is(err, utils.ErrRateLimitExceeded):
			statusCode = http.StatusTooManyRequests
			errorMessage = "Rate limit exceeded"
		}

		// If the error has a specific message, use it
		if err.Error() != "" && err.Error() != errorMessage {
			errorMessage = err.Error()
		}

		// Log the error
		utils.Errorf("Error: %v", err)

		// Return the error response
		c.JSON(statusCode, ErrorResponse{
			Error:   errorMessage,
			Details: details,
		})
	}
}
