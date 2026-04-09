// platform/backend/app/api/handlers/error_handler.go
package handlers

import (
	"github.com/gin-gonic/gin"
)

// ErrorResponse is a generic structure for API error responses.
type ErrorResponse struct {
	Error   string      `json:"error"`
	Details interface{} `json:"details,omitempty"`
}

// HandleError is the MAIN error handler function used across all handlers
// This prevents the duplicate declaration compilation error
func HandleError(c *gin.Context, statusCode int, errMsg string, details interface{}) {
	// Force JSON content type to ensure JSON response
	c.Header("Content-Type", "application/json")

	response := ErrorResponse{
		Error:   errMsg,
		Details: details,
	}

	c.JSON(statusCode, response)
}
