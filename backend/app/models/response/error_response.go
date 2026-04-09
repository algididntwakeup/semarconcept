// platform/backend/app/models/response/error_response.go
package response

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string                 `json:"error" example:"Invalid request"`
	Message string                 `json:"message,omitempty" example:"Validation failed"`
	Details map[string]interface{} `json:"details,omitempty"`
	Code    string                 `json:"code,omitempty" example:"VALIDATION_ERROR"`
}

// ValidationErrorResponse represents validation error details
type ValidationErrorResponse struct {
	Error   string            `json:"error" example:"Validation failed"`
	Details map[string]string `json:"details"`
}

// SuccessResponse represents a generic success response
type SuccessResponse struct {
	Status  string      `json:"status" example:"success"`
	Message string      `json:"message,omitempty" example:"Operation successful"`
	Data    interface{} `json:"data,omitempty"`
}
