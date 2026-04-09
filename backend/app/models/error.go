// platform/backend/app/models/error.go
package models

import "fmt"

// ErrorResponse is a generic structure for API error responses.
type ErrorResponse struct {
	Error   string      `json:"error"`
	Details interface{} `json:"details,omitempty"` // Can be string, map[string]string, etc.
}

// GeneralResponse is a generic structure for simple API responses.
type GeneralResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ValidationError represents a validation error for a specific field.
type ValidationError struct {
	Field   string
	Message string
}

// Error returns the formatted error message.
func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error on field '%s': %s", e.Field, e.Message)
}

// NewValidationError creates a new validation error
func NewValidationError(field, message string) *ValidationError {
	return &ValidationError{
		Field:   field,
		Message: message,
	}
}
