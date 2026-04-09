// platform/backend/app/utils/validation_helpers.go
package utils

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
)

// FormatValidationErrors formats validator errors into a readable format
func FormatValidationErrors(errs validator.ValidationErrors) map[string]string {
	errors := make(map[string]string)

	for _, err := range errs {
		field := strings.ToLower(err.Field())
		tag := err.Tag()
		param := err.Param()

		switch tag {
		case "required":
			errors[field] = fmt.Sprintf("%s is required", field)
		case "email":
			errors[field] = fmt.Sprintf("%s must be a valid email address", field)
		case "min":
			errors[field] = fmt.Sprintf("%s must be at least %s characters long", field, param)
		case "max":
			errors[field] = fmt.Sprintf("%s must be at most %s characters long", field, param)
		case "alphanum":
			errors[field] = fmt.Sprintf("%s must contain only alphanumeric characters", field)
		case "oneof":
			errors[field] = fmt.Sprintf("%s must be one of: %s", field, param)
		case "url":
			errors[field] = fmt.Sprintf("%s must be a valid URL", field)
		case "fqdn":
			errors[field] = fmt.Sprintf("%s must be a valid domain name", field)
		case "hexcolor":
			errors[field] = fmt.Sprintf("%s must be a valid hex color", field)
		case "eqfield":
			errors[field] = fmt.Sprintf("%s must match %s", field, param)
		case "omitempty":
			// Skip omitempty as it's not really an error
			continue
		default:
			errors[field] = fmt.Sprintf("%s is invalid", field)
		}
	}

	return errors
}

// Custom validation functions
func IsValidSubdomain(subdomain string) bool {
	if len(subdomain) < 3 || len(subdomain) > 63 {
		return false
	}

	// Check for valid characters (alphanumeric and hyphens)
	for _, char := range subdomain {
		if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-') {
			return false
		}
	}

	// Cannot start or end with hyphen
	if strings.HasPrefix(subdomain, "-") || strings.HasSuffix(subdomain, "-") {
		return false
	}

	// Reserved subdomains
	reserved := []string{"www", "api", "admin", "app", "mail", "ftp", "blog", "shop", "store", "support", "help"}
	for _, r := range reserved {
		if subdomain == r {
			return false
		}
	}

	return true
}

// IsValidTenantStatus checks if a tenant status is valid
func IsValidTenantStatus(status string) bool {
	validStatuses := []string{"active", "inactive", "suspended", "deleted"}
	for _, validStatus := range validStatuses {
		if status == validStatus {
			return true
		}
	}
	return false
}

// IsValidSubscriptionPlan checks if a subscription plan is valid
func IsValidSubscriptionPlan(plan string) bool {
	validPlans := []string{"basic", "professional", "enterprise", "custom"}
	for _, validPlan := range validPlans {
		if plan == validPlan {
			return true
		}
	}
	return false
}

// IsValidRole checks if a role is valid
func IsValidRole(role string) bool {
	validRoles := []string{"owner", "admin", "member", "viewer"}
	for _, validRole := range validRoles {
		if role == validRole {
			return true
		}
	}
	return false
}

// IsValidTheme checks if a theme is valid
func IsValidTheme(theme string) bool {
	validThemes := []string{"default", "dark", "light", "custom"}
	for _, validTheme := range validThemes {
		if theme == validTheme {
			return true
		}
	}
	return false
}

// ValidateHexColor validates a hex color string
func ValidateHexColor(color string) bool {
	if len(color) != 7 || !strings.HasPrefix(color, "#") {
		return false
	}

	for i := 1; i < len(color); i++ {
		char := color[i]
		if !((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F')) {
			return false
		}
	}

	return true
}

// ParseIncludeQuery parses comma-separated include relations
func ParseIncludeQuery(include string) []string {
	if include == "" {
		return []string{}
	}

	relations := strings.Split(include, ",")
	var result []string
	for _, relation := range relations {
		trimmed := strings.TrimSpace(relation)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// ParseStringArray parses comma-separated string values
func ParseStringArray(value string) []string {
	if value == "" {
		return []string{}
	}

	items := strings.Split(value, ",")
	var result []string
	for _, item := range items {
		trimmed := strings.TrimSpace(item)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// ParseIntOrDefault parses an integer with a default value
func ParseIntOrDefault(value string, defaultValue int) int {
	if value == "" {
		return defaultValue
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}

	return parsed
}

// ParseIntArrayOrDefault parses comma-separated integers with default
func ParseIntArrayOrDefault(value string, defaultValue []int) []int {
	if value == "" {
		return defaultValue
	}

	items := strings.Split(value, ",")
	var result []int
	for _, item := range items {
		trimmed := strings.TrimSpace(item)
		if trimmed != "" {
			if parsed, err := strconv.Atoi(trimmed); err == nil {
				result = append(result, parsed)
			}
		}
	}

	if len(result) == 0 {
		return defaultValue
	}

	return result
}

// BuildPaginationResponse builds pagination metadata
func BuildPaginationResponse(page, limit int, total int64) map[string]interface{} {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	if totalPages < 1 {
		totalPages = 1
	}

	return map[string]interface{}{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
		"has_next":    page < totalPages,
		"has_prev":    page > 1,
	}
}

// NOTE: SuccessResponseWithPagination is defined in app/utils/asset_errors.go
// to avoid duplication. Use that version for asset-related responses.
