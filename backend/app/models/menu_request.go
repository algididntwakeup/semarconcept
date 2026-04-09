// platform/backend/app/models/menu_request.go
package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

//  CRITICAL FIX: Complete menu request structs for backend compilation

// CreateMenuRequest represents the request structure for creating a new menu item
type CreateMenuRequest struct {
	Title                  string                 `json:"title" validate:"required,min=1,max=255"`
	Icon                   *string                `json:"icon,omitempty"`
	Route                  *string                `json:"route,omitempty"`
	ParentID               *int                   `json:"parent_id,omitempty"`
	OrderIndex             int                    `json:"order_index" validate:"min=0"`
	IsActive               *bool                  `json:"is_active,omitempty"`
	RequiredPermissionID   *int                   `json:"required_permission_id,omitempty"`
	AccessLevel            string                 `json:"access_level" validate:"required,oneof=user manager admin system"`
	MenuGroup              *string                `json:"menu_group,omitempty"`
	IsVisible              *bool                  `json:"is_visible,omitempty"`
	MenuType               string                 `json:"menu_type" validate:"required,oneof=item collapse group standard system dynamic external"`
	Slug                   string                 `json:"slug" validate:"required,min=1,max=100"`
	Description            *string                `json:"description,omitempty"`
	VisibilityRules        map[string]interface{} `json:"visibility_rules,omitempty"`
	ConditionalPermissions []string               `json:"conditional_permissions,omitempty"`
	CustomPermissions      []string               `json:"custom_permissions,omitempty"`
	TenantID               int                    `json:"tenant_id" validate:"min=1"`
}

// UpdateMenuRequest represents the request structure for updating an existing menu item
type UpdateMenuRequest struct {
	ID                     int                    `json:"id" validate:"required,min=1"`
	Title                  *string                `json:"title,omitempty" validate:"omitempty,min=1,max=255"`
	Icon                   *string                `json:"icon,omitempty"`
	Route                  *string                `json:"route,omitempty"`
	ParentID               *int                   `json:"parent_id,omitempty"`
	OrderIndex             *int                   `json:"order_index,omitempty" validate:"omitempty,min=0"`
	IsActive               *bool                  `json:"is_active,omitempty"`
	RequiredPermissionID   *int                   `json:"required_permission_id,omitempty"`
	AccessLevel            *string                `json:"access_level,omitempty" validate:"omitempty,oneof=user manager admin system"`
	MenuGroup              *string                `json:"menu_group,omitempty"`
	IsVisible              *bool                  `json:"is_visible,omitempty"`
	MenuType               *string                `json:"menu_type,omitempty" validate:"omitempty,oneof=item collapse group standard system dynamic external"`
	Slug                   *string                `json:"slug,omitempty" validate:"omitempty,min=1,max=100"`
	Description            *string                `json:"description,omitempty"`
	VisibilityRules        map[string]interface{} `json:"visibility_rules,omitempty"`
	ConditionalPermissions []string               `json:"conditional_permissions,omitempty"`
	CustomPermissions      []string               `json:"custom_permissions,omitempty"`
	IsSystemMenu           *bool                  `json:"is_system_menu,omitempty"`
	DisplayOrder           *int                   `json:"display_order,omitempty" validate:"omitempty,min=0"`
}

// ToggleStatusRequest represents the request structure for toggling menu item status
type ToggleStatusRequest struct {
	IsActive bool `json:"is_active"`
}

// ReorderMenuRequest represents the request structure for reordering menu items
type ReorderMenuRequest struct {
	Items []ReorderItem `json:"items" validate:"required,min=1"`
}

// ReorderItem represents a single item in the reorder request
type ReorderItem struct {
	ID         int  `json:"id" validate:"required,min=1"`
	OrderIndex int  `json:"order_index" validate:"min=0"`
	ParentID   *int `json:"parent_id,omitempty"`
}

// BatchOperationRequest represents the request structure for batch operations
type BatchOperationRequest struct {
	Operation string                 `json:"operation" validate:"required,oneof=delete activate deactivate move update_group update_access_level"`
	MenuIDs   []int                  `json:"menu_ids" validate:"required,min=1"`
	NewParent *int                   `json:"new_parent,omitempty"` // For move operation
	IsActive  *bool                  `json:"is_active,omitempty"`  // For activate/deactivate
	Data      map[string]interface{} `json:"data,omitempty"`       // For update operations
}

// MenuStatisticsRequest represents the request structure for menu statistics
type MenuStatisticsRequest struct {
	TenantID  int        `json:"tenant_id" validate:"required,min=1"`
	StartDate *time.Time `json:"start_date,omitempty"`
	EndDate   *time.Time `json:"end_date,omitempty"`
}

// MenuOrderItem represents a menu item order for reordering operations
type MenuOrderItem struct {
	ID         int  `json:"id"`
	OrderIndex int  `json:"order_index"`
	ParentID   *int `json:"parent_id,omitempty"`
}

// MenuBatchRequest is an alias for BatchOperationRequest for backward compatibility
type MenuBatchRequest = BatchOperationRequest

//  CRITICAL FIX: ToMenu method for CreateMenuRequest
func (r *CreateMenuRequest) ToMenu() *Menu {
	menu := &Menu{
		Title:       r.Title,
		OrderIndex:  r.OrderIndex,
		AccessLevel: r.AccessLevel,
		MenuType:    r.MenuType,
		Slug:        r.Slug,
		TenantID:    r.TenantID,
	}

	// Handle optional string fields
	if r.Icon != nil {
		menu.Icon = r.Icon
	}
	if r.Route != nil {
		menu.Route = r.Route
	}
	if r.MenuGroup != nil {
		menu.MenuGroup = r.MenuGroup
	}
	if r.Description != nil {
		menu.Description = r.Description
	}

	// Handle optional pointer fields
	if r.ParentID != nil {
		menu.ParentID = r.ParentID
	}
	if r.RequiredPermissionID != nil {
		menu.RequiredPermissionID = r.RequiredPermissionID
	}

	// Handle boolean fields with defaults
	if r.IsActive != nil {
		menu.IsActive = *r.IsActive
	} else {
		menu.IsActive = true // Default to active
	}

	if r.IsVisible != nil {
		menu.IsVisible = *r.IsVisible
	} else {
		menu.IsVisible = true // Default to visible
	}

	//  CRITICAL FIX: Handle JSONB fields properly
	if r.VisibilityRules != nil {
		// Convert map[string]interface{} to *MenuVisibilityRules
		visibilityRules := &MenuVisibilityRules{}
		if data, err := json.Marshal(r.VisibilityRules); err == nil {
			json.Unmarshal(data, visibilityRules)
		}
		menu.VisibilityRules = visibilityRules
	} else {
		menu.VisibilityRules = nil // Default to nil
	}

	if r.ConditionalPermissions != nil {
		menu.ConditionalPermissions = r.ConditionalPermissions
	} else {
		menu.ConditionalPermissions = make([]string, 0) // Default to empty array
	}

	if r.CustomPermissions != nil {
		menu.CustomPermissions = r.CustomPermissions
	} else {
		menu.CustomPermissions = make([]string, 0) // Default to empty array
	}

	return menu
}

//  CRITICAL FIX: ToMenu method for UpdateMenuRequest
func (r *UpdateMenuRequest) ToMenu() *Menu {
	menu := &Menu{
		ID: r.ID,
	}

	// Only update fields that are provided
	if r.Title != nil {
		menu.Title = *r.Title
	}
	if r.Icon != nil {
		menu.Icon = r.Icon
	}
	if r.Route != nil {
		menu.Route = r.Route
	}
	if r.ParentID != nil {
		menu.ParentID = r.ParentID
	}
	if r.OrderIndex != nil {
		menu.OrderIndex = *r.OrderIndex
	}
	if r.IsActive != nil {
		menu.IsActive = *r.IsActive
	}
	if r.RequiredPermissionID != nil {
		menu.RequiredPermissionID = r.RequiredPermissionID
	}
	if r.AccessLevel != nil {
		menu.AccessLevel = *r.AccessLevel
	}
	if r.MenuGroup != nil {
		menu.MenuGroup = r.MenuGroup
	}
	if r.IsVisible != nil {
		menu.IsVisible = *r.IsVisible
	}
	if r.MenuType != nil {
		menu.MenuType = *r.MenuType
	}
	if r.Slug != nil {
		menu.Slug = *r.Slug
	}
	if r.Description != nil {
		menu.Description = r.Description
	}

	// Handle JSONB fields
	if r.VisibilityRules != nil {
		// Convert map[string]interface{} to *MenuVisibilityRules
		visibilityRules := &MenuVisibilityRules{}
		if data, err := json.Marshal(r.VisibilityRules); err == nil {
			json.Unmarshal(data, visibilityRules)
		}
		menu.VisibilityRules = visibilityRules
	}
	if r.ConditionalPermissions != nil {
		menu.ConditionalPermissions = r.ConditionalPermissions
	}
	if r.CustomPermissions != nil {
		menu.CustomPermissions = r.CustomPermissions
	}
	if r.IsSystemMenu != nil {
		menu.IsSystemMenu = *r.IsSystemMenu
	}
	if r.DisplayOrder != nil {
		menu.DisplayOrder = *r.DisplayOrder
	}

	return menu
}

//  CRITICAL FIX: Validate method for CreateMenuRequest
func (r *CreateMenuRequest) Validate() error {
	var errors []string

	// Required field validation
	if strings.TrimSpace(r.Title) == "" {
		errors = append(errors, "title is required")
	}
	if len(r.Title) > 255 {
		errors = append(errors, "title must be less than 255 characters")
	}

	// Order index validation
	if r.OrderIndex < 0 {
		errors = append(errors, "order_index must be non-negative")
	}

	// Access level validation
	validAccessLevels := []string{"user", "manager", "admin", "system"}
	if !contains(validAccessLevels, r.AccessLevel) {
		errors = append(errors, "access_level must be one of: user, manager, admin, system")
	}

	// Menu type validation
	validMenuTypes := []string{"item", "collapse", "group", "standard", "system", "dynamic", "external"}
	if !contains(validMenuTypes, r.MenuType) {
		errors = append(errors, "menu_type must be one of: item, collapse, group, standard, system, dynamic, external")
	}
	
	if strings.TrimSpace(r.Slug) == "" {
		errors = append(errors, "slug is required")
	}

	// Route validation
	if r.Route != nil && *r.Route != "" && !strings.HasPrefix(*r.Route, "/") {
		errors = append(errors, "route must start with /")
	}

	// Parent ID validation
	if r.ParentID != nil && *r.ParentID <= 0 {
		errors = append(errors, "parent_id must be a positive integer")
	}

	// JSONB field validation (ensure they can be marshaled)
	if r.VisibilityRules != nil {
		if _, err := json.Marshal(r.VisibilityRules); err != nil {
			errors = append(errors, "visibility_rules must be valid JSON")
		}
	}

	if len(errors) > 0 {
		return createValidationError(errors)
	}

	return nil
}

//  CRITICAL FIX: Validate method for UpdateMenuRequest
func (r *UpdateMenuRequest) Validate() error {
	var errors []string

	// ID validation
	if r.ID <= 0 {
		errors = append(errors, "id must be a positive integer")
	}

	// Optional field validation
	if r.Title != nil {
		if strings.TrimSpace(*r.Title) == "" {
			errors = append(errors, "title cannot be empty if provided")
		}
		if len(*r.Title) > 255 {
			errors = append(errors, "title must be less than 255 characters")
		}
	}

	if r.OrderIndex != nil && *r.OrderIndex < 0 {
		errors = append(errors, "order_index must be non-negative")
	}

	if r.AccessLevel != nil {
		validAccessLevels := []string{"user", "manager", "admin", "system"}
		if !contains(validAccessLevels, *r.AccessLevel) {
			errors = append(errors, "access_level must be one of: user, manager, admin, system")
		}
	}

	if r.MenuType != nil {
		validMenuTypes := []string{"item", "collapse", "group", "standard", "system", "dynamic", "external"}
		if !contains(validMenuTypes, *r.MenuType) {
			errors = append(errors, "menu_type must be one of: item, collapse, group, standard, system, dynamic, external")
		}
	}

	if r.Route != nil && *r.Route != "" && !strings.HasPrefix(*r.Route, "/") {
		errors = append(errors, "route must start with /")
	}

	if r.ParentID != nil && *r.ParentID <= 0 {
		errors = append(errors, "parent_id must be a positive integer")
	}

	// JSONB field validation
	if r.VisibilityRules != nil {
		if _, err := json.Marshal(r.VisibilityRules); err != nil {
			errors = append(errors, "visibility_rules must be valid JSON")
		}
	}

	if len(errors) > 0 {
		return createValidationError(errors)
	}

	return nil
}

//  CRITICAL FIX: Validate method for ToggleStatusRequest
func (r *ToggleStatusRequest) Validate() error {
	// IsActive is a boolean, so no validation needed
	// (it can only be true or false)
	return nil
}

//  CRITICAL FIX: Validate method for ReorderMenuRequest
func (r *ReorderMenuRequest) Validate() error {
	var errors []string

	if len(r.Items) == 0 {
		errors = append(errors, "items array cannot be empty")
	}

	// Validate each item
	for i, item := range r.Items {
		if item.ID <= 0 {
			errors = append(errors, fmt.Sprintf("item %d: id must be a positive integer", i))
		}
		if item.OrderIndex < 0 {
			errors = append(errors, fmt.Sprintf("item %d: order_index must be non-negative", i))
		}
		if item.ParentID != nil && *item.ParentID <= 0 {
			errors = append(errors, fmt.Sprintf("item %d: parent_id must be a positive integer", i))
		}
	}

	if len(errors) > 0 {
		return createValidationError(errors)
	}

	return nil
}

//  CRITICAL FIX: Validate method for BatchOperationRequest
func (r *BatchOperationRequest) Validate() error {
	var errors []string

	validOperations := []string{"delete", "activate", "deactivate", "move"}
	if !contains(validOperations, r.Operation) {
		errors = append(errors, "operation must be one of: delete, activate, deactivate, move")
	}

	if len(r.MenuIDs) == 0 {
		errors = append(errors, "menu_ids cannot be empty")
	}

	for i, id := range r.MenuIDs {
		if id <= 0 {
			errors = append(errors, fmt.Sprintf("menu_ids[%d] must be a positive integer", i))
		}
	}

	// Operation-specific validation
	if r.Operation == "move" && r.NewParent == nil {
		errors = append(errors, "new_parent is required for move operation")
	}

	if r.Operation == "move" && r.NewParent != nil && *r.NewParent <= 0 {
		errors = append(errors, "new_parent must be a positive integer")
	}

	if len(errors) > 0 {
		return createValidationError(errors)
	}

	return nil
}

// Helper functions

// contains checks if a slice contains a specific string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// createValidationError creates a formatted validation error
func createValidationError(errorList []string) error {
	if len(errorList) == 1 {
		return errors.New("validation failed: " + errorList[0])
	}
	return errors.New("validation failed: " + strings.Join(errorList, "; "))
}
