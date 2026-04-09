// platform/backend/app/utils/string_helpers.go
package utils

// StringPtr returns a pointer to the string value
func StringPtr(s string) *string {
	return &s
}

// GetStringValue safely gets string value from pointer, returns empty string if nil
func GetStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// GetStringPointer returns a pointer to the string, or nil if empty
func GetStringPointer(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// GetStringValueOrDefault safely dereferences a string pointer with a default value
func GetStringValueOrDefault(s *string, defaultValue string) string {
	if s == nil {
		return defaultValue
	}
	return *s
}
