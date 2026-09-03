// platform/backend/app/utils/asset_errors.go
package utils

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ===== ASSET MANAGEMENT ERROR DEFINITIONS =====

// Site-related errors
var (
	ErrSiteNotFound       = errors.New("site not found")
	ErrSiteDuplicateCode  = errors.New("site code already exists")
	ErrSiteDuplicateName  = errors.New("site name already exists")
	ErrSiteHasActiveUnits = errors.New("site has active units and cannot be deleted")
	ErrSiteInvalidStatus  = errors.New("invalid site status")
	ErrSiteCodeRequired   = errors.New("site code is required")
	ErrSiteNameRequired   = errors.New("site name is required")
)

// Unit-related errors
var (
	ErrUnitNotFound           = errors.New("unit not found")
	ErrUnitDuplicateCode      = errors.New("unit code already exists in this site")
	ErrUnitDuplicateName      = errors.New("unit name already exists in this site")
	ErrUnitHasActiveAsset = errors.New("unit has active Asset and cannot be deleted")
	ErrUnitInvalidStatus      = errors.New("invalid unit status")
	ErrUnitCodeRequired       = errors.New("unit code is required")
	ErrUnitNameRequired       = errors.New("unit name is required")
	ErrUnitSiteRequired       = errors.New("unit must belong to a site")
	ErrUnitInvalidCriticality = errors.New("unit criticality must be between 1 and 5")
)

// Asset-related errors
var (
	ErrAssetNotFound             = errors.New("Asset not found")
	ErrAssetDuplicateTag         = errors.New("Asset tag number already exists in this unit")
	ErrAssetDuplicateName        = errors.New("Asset name already exists in this unit")
	ErrAssetHasActiveComponents  = errors.New("Asset has active components and cannot be deleted")
	ErrAssetInvalidStatus        = errors.New("invalid Asset status")
	ErrAssetTagRequired          = errors.New("Asset tag number is required")
	ErrAssetNameRequired         = errors.New("Asset name is required")
	ErrAssetUnitRequired         = errors.New("Asset must belong to a unit")
	ErrAssetInvalidCriticality   = errors.New("Asset criticality must be between 1 and 5")
	ErrAssetInvalidLifeYears     = errors.New("Asset design life years must be positive")
	ErrAssetInvalidRemainingLife = errors.New("Asset remaining life years cannot be negative")
)

// Component-related errors
var (
	ErrComponentNotFound               = errors.New("component not found")
	ErrComponentDuplicateCode          = errors.New("component code already exists in this Asset")
	ErrComponentDuplicateName          = errors.New("component name already exists in this Asset")
	ErrComponentHasActiveDegradation   = errors.New("component has active degradation mechanisms and cannot be deleted")
	ErrComponentInvalidStatus          = errors.New("invalid component status")
	ErrComponentCodeRequired           = errors.New("component code is required")
	ErrComponentNameRequired           = errors.New("component name is required")
	ErrComponentAssetRequired      = errors.New("component must belong to Asset")
	ErrComponentInvalidCriticality     = errors.New("component criticality must be between 1 and 5")
	ErrComponentInvalidThickness       = errors.New("component thickness values must be positive")
	ErrComponentInvalidPressure        = errors.New("component pressure values must be positive")
	ErrComponentInvalidTemperature     = errors.New("component temperature values are invalid")
	ErrComponentInvalidIntegrityStatus = errors.New("invalid component integrity status")
	ErrComponentInvalidFrequency       = errors.New("inspection frequency must be positive")
	ErrComponentThicknessLogic         = errors.New("current thickness cannot be less than minimum thickness")
	ErrComponentPressureLogic          = errors.New("operating pressure cannot exceed design pressure")
	ErrComponentTemperatureLogic       = errors.New("operating temperature cannot exceed design temperature")
	ErrComponentInvalidRemainingLife   = errors.New("remaining life years cannot be negative")
)

// Inspection Point-related errors
var (
	ErrInspectionPointNotFound       = errors.New("inspection point not found")
	ErrInspectionPointDuplicateID    = errors.New("inspection point identifier already exists in this component")
	ErrInspectionPointComponentReq   = errors.New("inspection point must belong to a component")
	ErrInspectionPointInvalidFreq    = errors.New("inspection frequency must be positive")
	ErrInspectionPointInvalidThick   = errors.New("inspection point thickness values must be positive")
	ErrInspectionPointThicknessLogic = errors.New("current thickness cannot be less than minimum thickness")
)

// Degradation Mechanism-related errors
var (
	ErrDegradationMechNotFound     = errors.New("degradation mechanism not found")
	ErrDegradationMechComponentReq = errors.New("degradation mechanism must belong to a component")
	ErrDegradationMechInvalidRate  = errors.New("degradation rate must be positive")
	ErrDegradationMechInvalidSusc  = errors.New("susceptibility must be between 0 and 1")
)

// Asset hierarchy errors
var (
	ErrAssetHierarchyInvalid   = errors.New("invalid asset hierarchy")
	ErrAssetTypeNotSupported   = errors.New("asset type not supported")
	ErrAssetCrossReferenceMiss = errors.New("asset cross-reference mismatch")
	ErrAssetParentNotFound     = errors.New("asset parent not found")
	ErrAssetChildrenExist      = errors.New("asset has children and cannot be deleted")
	ErrAssetCircularReference  = errors.New("circular reference detected in asset hierarchy")
)

// Bulk operation errors
var (
	ErrBulkOperationTooLarge    = errors.New("bulk operation exceeds maximum allowed size")
	ErrBulkOperationEmpty       = errors.New("bulk operation cannot be empty")
	ErrBulkOperationPartialFail = errors.New("bulk operation completed with partial failures")
	ErrBulkOperationValidation  = errors.New("bulk operation validation failed")
	ErrBulkOperationFailed      = errors.New("bulk operation failed")
	ErrBulkOperationPartial     = errors.New("bulk operation partially completed")
	ErrBulkOperationNoItems     = errors.New("no items specified for bulk operation")
)

// Import/Export errors
var (
	ErrImportFormatNotSupported = errors.New("import format not supported")
	ErrImportDataInvalid        = errors.New("import data is invalid")
	ErrImportFileTooBig         = errors.New("import file is too large")
	ErrImportFileEmpty          = errors.New("import file is empty")
	ErrImportFileInvalid        = errors.New("invalid import file format")
	ErrExportFormatNotSupported = errors.New("export format not supported")
	ErrExportDataNotFound       = errors.New("no data available for export")
	ErrExportPermissionDenied   = errors.New("export permission denied")
	ErrExportFailed             = errors.New("failed to export assets")
)

// Statistics and analytics errors
var (
	ErrStatisticsNotAvailable = errors.New("statistics not available")
	ErrAnalyticsDataInsuff    = errors.New("insufficient data for analytics")
	ErrMetricsCalculationFail = errors.New("metrics calculation failed")
)

// Validation errors
var (
	ErrValidationFailed   = errors.New("validation failed")
	ErrInvalidDateRange   = errors.New("invalid date range")
	ErrInvalidCriticality = errors.New("invalid criticality level")
	ErrInvalidStatus      = errors.New("invalid status")
)

// ===== ASSET OPERATION RESULT TYPES =====

// ImportError represents an error during import operations
type ImportError struct {
	Row     int         `json:"row"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ImportResult represents the result of an import operation
type ImportResult struct {
	TotalRecords   int           `json:"total_records"`
	SuccessRecords int           `json:"success_records"`
	FailedRecords  int           `json:"failed_records"`
	Errors         []ImportError `json:"errors,omitempty"`
}

// ImportOptions represents options for import operations
type ImportOptions struct {
	ContinueOnError bool `json:"continue_on_error"`
	ValidateOnly    bool `json:"validate_only"`
	UpdateExisting  bool `json:"update_existing"`
}

// BulkOperationResult represents result of bulk operations
type BulkOperationResult struct {
	TotalItems   int      `json:"total_items"`
	SuccessItems int      `json:"success_items"`
	FailedItems  int      `json:"failed_items"`
	Errors       []string `json:"errors,omitempty"`
	ProcessedIDs []int    `json:"processed_ids,omitempty"`
}

// ===== ASSET VALIDATION HELPER FUNCTIONS =====

// ValidateAssetID validates asset ID format and range
func ValidateAssetID(id int) error {
	if id <= 0 {
		return fmt.Errorf("asset ID must be positive, got %d", id)
	}
	return nil
}

// ValidateAssetCode validates asset code format
func ValidateAssetCode(code string, assetType string) error {
	if code == "" {
		return fmt.Errorf("%s code cannot be empty", assetType)
	}

	if len(code) < 2 {
		return fmt.Errorf("%s code must be at least 2 characters long", assetType)
	}

	if len(code) > 50 {
		return fmt.Errorf("%s code must be at most 50 characters long", assetType)
	}

	// Check for valid characters (alphanumeric, dash, underscore)
	for _, char := range code {
		if !((char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') ||
			char == '-' || char == '_') {
			return fmt.Errorf("%s code contains invalid character: %c", assetType, char)
		}
	}

	return nil
}

// ValidateAssetName validates asset name format
func ValidateAssetName(name string, assetType string) error {
	if name == "" {
		return fmt.Errorf("%s name cannot be empty", assetType)
	}

	if len(name) < 2 {
		return fmt.Errorf("%s name must be at least 2 characters long", assetType)
	}

	if len(name) > 255 {
		return fmt.Errorf("%s name must be at most 255 characters long", assetType)
	}

	return nil
}

// ValidateCriticality validates criticality level
func ValidateCriticality(criticality int, assetType string) error {
	if criticality < 1 || criticality > 5 {
		return fmt.Errorf("%s criticality must be between 1 and 5, got %d", assetType, criticality)
	}
	return nil
}

// ValidateStatus validates asset status
func ValidateStatus(status string, validStatuses []string, assetType string) error {
	if status == "" {
		return fmt.Errorf("%s status cannot be empty", assetType)
	}

	for _, validStatus := range validStatuses {
		if status == validStatus {
			return nil
		}
	}

	return fmt.Errorf("invalid %s status: %s", assetType, status)
}

// ValidateThickness validates thickness measurements
func ValidateThickness(design, current, minimum float64) error {
	if design <= 0 {
		return fmt.Errorf("design thickness must be positive, got %f", design)
	}

	if current <= 0 {
		return fmt.Errorf("current thickness must be positive, got %f", current)
	}

	if minimum <= 0 {
		return fmt.Errorf("minimum thickness must be positive, got %f", minimum)
	}

	if current < minimum {
		return fmt.Errorf("current thickness (%f) cannot be less than minimum thickness (%f)", current, minimum)
	}

	if minimum > design {
		return fmt.Errorf("minimum thickness (%f) cannot be greater than design thickness (%f)", minimum, design)
	}

	return nil
}

// ValidatePressure validates pressure measurements
func ValidatePressure(design, operating float64) error {
	if design <= 0 {
		return fmt.Errorf("design pressure must be positive, got %f", design)
	}

	if operating < 0 {
		return fmt.Errorf("operating pressure cannot be negative, got %f", operating)
	}

	if operating > design {
		return fmt.Errorf("operating pressure (%f) cannot exceed design pressure (%f)", operating, design)
	}

	return nil
}

// ValidateTemperature validates temperature measurements
func ValidateTemperature(design, operating float64) error {
	// Allow negative temperatures (for cryogenic applications)
	if design < -273.15 {
		return fmt.Errorf("design temperature cannot be below absolute zero, got %f", design)
	}

	if operating < -273.15 {
		return fmt.Errorf("operating temperature cannot be below absolute zero, got %f", operating)
	}

	if operating > design {
		return fmt.Errorf("operating temperature (%f) cannot exceed design temperature (%f)", operating, design)
	}

	return nil
}

// ValidateInspectionFrequency validates inspection frequency
func ValidateInspectionFrequency(months int) error {
	if months <= 0 {
		return fmt.Errorf("inspection frequency must be positive, got %d months", months)
	}

	if months > 120 { // 10 years max
		return fmt.Errorf("inspection frequency cannot exceed 120 months, got %d months", months)
	}

	return nil
}

// ValidateRemainingLife validates remaining life calculation
func ValidateRemainingLife(years float64) error {
	if years < 0 {
		return fmt.Errorf("remaining life cannot be negative, got %f years", years)
	}

	if years > 200 { // Reasonable upper bound
		return fmt.Errorf("remaining life seems unrealistic, got %f years", years)
	}

	return nil
}

// ===== ASSET ERROR CHECKING HELPER FUNCTIONS =====

// IsAssetNotFoundError checks if error is an asset not found error
func IsAssetNotFoundError(err error) bool {
	return err == ErrSiteNotFound ||
		err == ErrUnitNotFound ||
		err == ErrAssetNotFound ||
		err == ErrComponentNotFound ||
		err == ErrInspectionPointNotFound ||
		err == ErrDegradationMechNotFound
}

// IsAssetDuplicateError checks if error is an asset duplicate error
func IsAssetDuplicateError(err error) bool {
	return err == ErrSiteDuplicateCode ||
		err == ErrSiteDuplicateName ||
		err == ErrUnitDuplicateCode ||
		err == ErrUnitDuplicateName ||
		err == ErrAssetDuplicateTag ||
		err == ErrAssetDuplicateName ||
		err == ErrComponentDuplicateCode ||
		err == ErrComponentDuplicateName ||
		err == ErrInspectionPointDuplicateID
}

// IsAssetValidationError checks if error is an asset validation error
func IsAssetValidationError(err error) bool {
	return err == ErrSiteInvalidStatus ||
		err == ErrUnitInvalidStatus ||
		err == ErrAssetInvalidStatus ||
		err == ErrComponentInvalidStatus ||
		err == ErrUnitInvalidCriticality ||
		err == ErrAssetInvalidCriticality ||
		err == ErrComponentInvalidCriticality ||
		err == ErrComponentInvalidThickness ||
		err == ErrComponentInvalidPressure ||
		err == ErrComponentInvalidTemperature ||
		err == ErrComponentThicknessLogic ||
		err == ErrComponentPressureLogic ||
		err == ErrComponentTemperatureLogic ||
		err == ErrValidationFailed ||
		err == ErrInvalidDateRange ||
		err == ErrInvalidCriticality ||
		err == ErrInvalidStatus
}

// IsAssetHierarchyError checks if error is an asset hierarchy error
func IsAssetHierarchyError(err error) bool {
	return err == ErrAssetHierarchyInvalid ||
		err == ErrAssetCrossReferenceMiss ||
		err == ErrAssetParentNotFound ||
		err == ErrAssetChildrenExist ||
		err == ErrAssetCircularReference
}

// IsAssetDependencyError checks if error is due to asset dependencies
func IsAssetDependencyError(err error) bool {
	return err == ErrSiteHasActiveUnits ||
		err == ErrUnitHasActiveAsset ||
		err == ErrAssetHasActiveComponents ||
		err == ErrComponentHasActiveDegradation ||
		err == ErrAssetChildrenExist
}

// ===== ASSET UTILITY FUNCTIONS =====

// GetAssetTypeFromError returns the asset type based on the error
func GetAssetTypeFromError(err error) string {
	switch err {
	case ErrSiteNotFound, ErrSiteDuplicateCode, ErrSiteDuplicateName, ErrSiteHasActiveUnits:
		return "site"
	case ErrUnitNotFound, ErrUnitDuplicateCode, ErrUnitDuplicateName, ErrUnitHasActiveAsset:
		return "unit"
	case ErrAssetNotFound, ErrAssetDuplicateTag, ErrAssetDuplicateName, ErrAssetHasActiveComponents:
		return "Asset"
	case ErrComponentNotFound, ErrComponentDuplicateCode, ErrComponentDuplicateName, ErrComponentHasActiveDegradation:
		return "component"
	case ErrInspectionPointNotFound, ErrInspectionPointDuplicateID:
		return "inspection_point"
	case ErrDegradationMechNotFound:
		return "degradation_mechanism"
	default:
		return "unknown"
	}
}

// GetHTTPStatusCodeForAssetError returns appropriate HTTP status code for asset errors
func GetHTTPStatusCodeForAssetError(err error) int {
	switch {
	case IsAssetNotFoundError(err):
		return 404 // Not Found
	case IsAssetDuplicateError(err):
		return 409 // Conflict
	case IsAssetValidationError(err):
		return 400 // Bad Request
	case IsAssetHierarchyError(err):
		return 400 // Bad Request
	case IsAssetDependencyError(err):
		return 409 // Conflict
	case err == ErrBulkOperationTooLarge:
		return 413 // Payload Too Large
	case err == ErrBulkOperationEmpty:
		return 400 // Bad Request
	case err == ErrBulkOperationPartialFail:
		return 207 // Multi-Status
	case err == ErrImportFormatNotSupported || err == ErrExportFormatNotSupported:
		return 415 // Unsupported Media Type
	case err == ErrImportFileTooBig:
		return 413 // Payload Too Large
	case err == ErrExportPermissionDenied:
		return 403 // Forbidden
	default:
		return 500 // Internal Server Error
	}
}

// ===== ASSET RESPONSE HELPER FUNCTIONS =====

// AssetErrorResponse creates a standardized error response for asset operations
func AssetErrorResponse(err error) map[string]interface{} {
	assetType := GetAssetTypeFromError(err)
	statusCode := GetHTTPStatusCodeForAssetError(err)

	return map[string]interface{}{
		"error": map[string]interface{}{
			"message":    err.Error(),
			"asset_type": assetType,
			"code":       statusCode,
			"type":       getErrorType(err),
		},
	}
}

// getErrorType returns the error type category
func getErrorType(err error) string {
	switch {
	case IsAssetNotFoundError(err):
		return "not_found"
	case IsAssetDuplicateError(err):
		return "duplicate"
	case IsAssetValidationError(err):
		return "validation"
	case IsAssetHierarchyError(err):
		return "hierarchy"
	case IsAssetDependencyError(err):
		return "dependency"
	default:
		return "unknown"
	}
}

// ===== PAGINATION AND QUERY HELPER FUNCTIONS =====

// ValidatePaginationParams validates pagination parameters
func ValidatePaginationParams(page, limit int) error {
	if page < 1 {
		return fmt.Errorf("page must be positive, got %d", page)
	}

	if limit < 1 {
		return fmt.Errorf("limit must be positive, got %d", limit)
	}

	if limit > 1000 {
		return fmt.Errorf("limit cannot exceed 1000, got %d", limit)
	}

	return nil
}

// ValidateSortParam validates sort parameter format
func ValidateSortParam(sort string, validFields []string) error {
	if sort == "" {
		return nil // Empty sort is allowed
	}

	// Handle multiple sort fields (comma-separated)
	fields := strings.Split(sort, ",")

	for _, field := range fields {
		field = strings.TrimSpace(field)

		// Handle descending sort (prefix with -)
		if strings.HasPrefix(field, "-") {
			field = field[1:]
		}

		// Check if field is valid
		isValid := false
		for _, validField := range validFields {
			if field == validField {
				isValid = true
				break
			}
		}

		if !isValid {
			return fmt.Errorf("invalid sort field: %s", field)
		}
	}

	return nil
}

// ===== RESPONSE HELPER FUNCTIONS =====

// SuccessResponseWithPagination sends success response with pagination
func SuccessResponseWithPagination(c *gin.Context, statusCode int, message string, data interface{}, pagination map[string]interface{}) {
	c.JSON(statusCode, gin.H{
		"status":     "success",
		"message":    message,
		"data":       data,
		"pagination": pagination,
		"timestamp":  time.Now().UTC(),
	})
}

// ===== ASSET CONSTANTS =====

// Valid asset statuses
var (
	ValidSiteStatuses      = []string{"active", "inactive", "under_construction", "decommissioned"}
	ValidUnitStatuses      = []string{"active", "inactive", "maintenance", "shutdown", "startup"}
	ValidAssetStatuses = []string{"active", "inactive", "maintenance", "repair", "standby", "decommissioned"}
	ValidComponentStatuses = []string{"active", "inactive", "maintenance", "repair", "replaced", "retired"}
	ValidIntegrityStatuses = []string{"excellent", "good", "fair", "poor", "critical"}
)

// Valid asset types for search and operations
var (
	ValidAssetTypes = []string{"site", "unit", "Asset", "component", "inspection_point", "degradation_mechanism"}
)

// Maximum limits for various operations
const (
	MaxBulkOperationSize = 1000
	MaxImportFileSize    = 50 * 1024 * 1024 // 50MB
	MaxExportRecords     = 10000
	MaxSearchResults     = 10000
	DefaultPageSize      = 20
	MaxPageSize          = 1000
)
