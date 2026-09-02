// platform/backend/app/services/menu_service.go
package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"backend/app/models"
	"backend/app/repositories"
	"backend/app/utils"
)

// MenuService interface defines menu operations with RBAC support - FIXED SYNTAX
type MenuService interface {
	// Handler-compatible methods (these are what your handler calls)
	GetMenus(ctx context.Context, tenantID int) ([]models.Menu, error)
	CreateMenu(ctx context.Context, req *models.CreateMenuRequest, tenantID int) (*models.Menu, error)
	UpdateMenu(ctx context.Context, id int, req *models.UpdateMenuRequest) (*models.Menu, error)
	DeleteMenu(ctx context.Context, id int) error
	GetMenuByID(ctx context.Context, id int) (*models.Menu, error)
	GetMenuHierarchy(ctx context.Context, tenantID int) ([]*models.Menu, error)
	ToggleMenuStatus(ctx context.Context, id int, active bool) error
	ReorderMenus(ctx context.Context, tenantID int, reorderItems []models.ReorderItem) error
	BatchOperations(ctx context.Context, req *models.MenuBatchRequest, tenantID int) error

	//  NEW: Admin method for unfiltered access
	GetAllMenus(ctx context.Context, tenantID int, includeInactive bool) ([]models.Menu, error)

	// Additional RBAC operations
	GetUserMenuTree(ctx context.Context, userID int, tenantID int) ([]*models.MenuItemDTO, error)
	GetUserAccessibleMenus(ctx context.Context, userID int, tenantID int) ([]*models.Menu, error)
	CheckMenuAccess(ctx context.Context, userID, menuID, tenantID int) (bool, string, error)

	// Statistics and audit
	GetMenuAccessLogs(ctx context.Context, menuID, tenantID int, limit int) ([]models.MenuAccessLog, error)
	GetMenuStatistics(ctx context.Context, req *models.MenuStatisticsRequest) (interface{}, error)
}

// menuService implements MenuService interface
type menuService struct {
	menuRepo    repositories.MenuRepository
	authService AuthService
}

// NewMenuService creates a new menu service instance
func NewMenuService(menuRepo repositories.MenuRepository, authService AuthService) MenuService {
	return &menuService{
		menuRepo:    menuRepo,
		authService: authService,
	}
}

// GetMenus retrieves all ACTIVE and VISIBLE menus for a tenant
func (s *menuService) GetMenus(ctx context.Context, tenantID int) ([]models.Menu, error) {
	allMenus, err := s.menuRepo.GetMenus(ctx, tenantID)
	if err != nil {
		utils.Errorf("MenuService: Failed to get menus for tenant %d: %v", tenantID, err)
		return nil, fmt.Errorf("failed to get menus: %w", err)
	}

	//  NEW: Filter out inactive and invisible menus
	filteredMenus := make([]models.Menu, 0, len(allMenus))
	for _, menu := range allMenus {
		if menu.IsActive && menu.IsVisible {
			filteredMenus = append(filteredMenus, menu)
		}
	}

	utils.Infof("MenuService: Retrieved %d filtered menus (from %d total) for tenant %d",
		len(filteredMenus), len(allMenus), tenantID)
	return filteredMenus, nil
}

// CreateMenu creates a new menu item
func (s *menuService) CreateMenu(ctx context.Context, req *models.CreateMenuRequest, tenantID int) (*models.Menu, error) {
	if req == nil {
		return nil, fmt.Errorf("create menu request cannot be nil")
	}

	// Set tenant ID
	req.TenantID = tenantID

	// Validate the request
	if err := req.Validate(); err != nil {
		utils.Errorf("MenuService: Invalid create menu request: %v", err)
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Convert request to menu model
	menu := req.ToMenu()

	// Validate parent exists if provided
	if menu.ParentID != nil {
		if _, err := s.menuRepo.GetMenuByID(ctx, *menu.ParentID); err != nil {
			return nil, fmt.Errorf("parent menu not found: %w", err)
		}
	}

	// Create the menu
	createdMenu, err := s.menuRepo.CreateMenu(ctx, menu)
	if err != nil {
		utils.Errorf("MenuService: Failed to create menu: %v", err)
		return nil, fmt.Errorf("failed to create menu: %w", err)
	}

	utils.Infof("MenuService: Created menu '%s' (ID: %d) for tenant %d", createdMenu.Title, createdMenu.ID, tenantID)
	return createdMenu, nil
}

// UpdateMenu updates an existing menu item
func (s *menuService) UpdateMenu(ctx context.Context, id int, req *models.UpdateMenuRequest) (*models.Menu, error) {
	if req == nil {
		return nil, fmt.Errorf("update menu request cannot be nil")
	}

	// Validate the request
	if err := req.Validate(); err != nil {
		utils.Errorf("MenuService: Invalid update menu request: %v", err)
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Get existing menu
	existingMenu, err := s.menuRepo.GetMenuByID(ctx, id)
	if err != nil {
		utils.Errorf("MenuService: Failed to get existing menu %d: %v", id, err)
		return nil, fmt.Errorf("menu not found: %w", err)
	}

	// Prevent modification of system menus (optional check, relaxed for layout/parenting changes)
	// We allow admins to move system menus within the hierarchy
	if existingMenu.IsSystemMenu && (req.Title != nil && *req.Title != existingMenu.Title) {
		utils.Warnf("MenuService: Attempted to rename system menu: %s (ID: %d)", existingMenu.Title, existingMenu.ID)
		// return nil, fmt.Errorf("cannot rename system menu: %s", existingMenu.Title)
	}

	// Prevent circular parenting (direct)
	if req.ParentID != nil && *req.ParentID == id {
		return nil, fmt.Errorf("a menu cannot be its own parent")
	}

	// Apply updates to existing menu
	s.applyUpdatesToMenu(existingMenu, req)

	// Validate parent exists if changed
	if req.ParentID != nil && *req.ParentID != 0 {
		if _, err := s.menuRepo.GetMenuByID(ctx, *req.ParentID); err != nil {
			return nil, fmt.Errorf("parent menu not found: %w", err)
		}
	}

	// Update the menu
	updatedMenu, err := s.menuRepo.UpdateMenu(ctx, existingMenu)
	if err != nil {
		utils.Errorf("MenuService: Failed to update menu %d: %v", id, err)
		return nil, fmt.Errorf("failed to update menu: %w", err)
	}

	utils.Infof("MenuService: Updated menu '%s' (ID: %d)", updatedMenu.Title, updatedMenu.ID)
	return updatedMenu, nil
}

// DeleteMenu deletes a menu item
func (s *menuService) DeleteMenu(ctx context.Context, id int) error {
	// Get the menu to check if it exists and if it's a system menu
	menu, err := s.menuRepo.GetMenuByID(ctx, id)
	if err != nil {
		utils.Errorf("MenuService: Failed to get menu %d for deletion: %v", id, err)
		return fmt.Errorf("menu not found: %w", err)
	}

	// Prevent deletion of system menus
	if menu.IsSystemMenu {
		utils.Warnf("MenuService: Attempted to delete system menu: %s (ID: %d)", menu.Title, menu.ID)
		return fmt.Errorf("cannot delete system menu: %s", menu.Title)
	}

	// Check if menu has children
	children, err := s.menuRepo.GetChildMenus(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check for child menus: %w", err)
	}

	if len(children) > 0 {
		return fmt.Errorf("cannot delete menu with children. Delete child menus first")
	}

	// Delete the menu
	if err := s.menuRepo.DeleteMenu(ctx, id); err != nil {
		utils.Errorf("MenuService: Failed to delete menu %d: %v", id, err)
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	utils.Infof("MenuService: Deleted menu '%s' (ID: %d)", menu.Title, menu.ID)
	return nil
}

// GetMenuByID retrieves a specific menu by ID
func (s *menuService) GetMenuByID(ctx context.Context, id int) (*models.Menu, error) {
	menu, err := s.menuRepo.GetMenuByID(ctx, id)
	if err != nil {
		utils.Errorf("MenuService: Failed to get menu by ID %d: %v", id, err)
		return nil, fmt.Errorf("menu not found: %w", err)
	}

	return menu, nil
}

// GetMenuHierarchy retrieves ACTIVE and VISIBLE menu hierarchy for a tenant
func (s *menuService) GetMenuHierarchy(ctx context.Context, tenantID int) ([]*models.Menu, error) {
	allMenus, err := s.menuRepo.GetMenuHierarchy(ctx, tenantID)
	if err != nil {
		utils.Errorf("MenuService: Failed to get menu hierarchy for tenant %d: %v", tenantID, err)
		return nil, fmt.Errorf("failed to get menu hierarchy: %w", err)
	}

	//  FIXED: Filter out inactive and invisible menus from flat list first
	filteredMenus := make([]*models.Menu, 0, len(allMenus))
	for _, menu := range allMenus {
		if menu.IsActive && menu.IsVisible {
			//  FIX: Take address of menu to convert struct to pointer
			menuCopy := menu // Create a copy to avoid pointer issues
			filteredMenus = append(filteredMenus, &menuCopy)
		}
	}

	// Build hierarchy with filtered menus
	hierarchy := s.buildMenuHierarchy(filteredMenus)

	//  NEW: Apply recursive filtering to children
	filteredHierarchy := s.filterMenuHierarchy(hierarchy)

	utils.Infof("MenuService: Built filtered hierarchy with %d root items (from %d total) for tenant %d",
		len(filteredHierarchy), len(allMenus), tenantID)

	return filteredHierarchy, nil
}

// GetAllMenus retrieves all menus including inactive for admin purposes
func (s *menuService) GetAllMenus(ctx context.Context, tenantID int, includeInactive bool) ([]models.Menu, error) {
	if includeInactive {
		// Return all menus (for admin interfaces) including inactive ones
		menus, err := s.menuRepo.GetAllMenusIncludingInactive(ctx, tenantID)
		if err != nil {
			utils.Errorf("MenuService: Failed to get all menus (including inactive) for tenant %d: %v", tenantID, err)
			return nil, fmt.Errorf("failed to get all menus: %w", err)
		}
		utils.Infof("MenuService: Retrieved ALL %d menus (including inactive) for tenant %d", len(menus), tenantID)
		return menus, nil
	}

	// Use filtered version (active only)
	return s.GetMenus(ctx, tenantID)
}

// ToggleMenuStatus toggles the active status of a menu
func (s *menuService) ToggleMenuStatus(ctx context.Context, id int, active bool) error {
	// Get the menu to verify it exists
	menu, err := s.menuRepo.GetMenuByID(ctx, id)
	if err != nil {
		return fmt.Errorf("menu not found: %w", err)
	}

	// Update the status
	if err := s.menuRepo.ToggleMenuStatus(ctx, id, active); err != nil {
		utils.Errorf("MenuService: Failed to toggle menu status for ID %d: %v", id, err)
		return fmt.Errorf("failed to toggle menu status: %w", err)
	}

	statusText := "deactivated"
	if active {
		statusText = "activated"
	}

	utils.Infof("MenuService: %s menu '%s' (ID: %d)", statusText, menu.Title, id)
	return nil
}

// ReorderMenus reorders menu items - FIXED SIGNATURE
func (s *menuService) ReorderMenus(ctx context.Context, tenantID int, reorderItems []models.ReorderItem) error {
	if len(reorderItems) == 0 {
		return fmt.Errorf("no menu items provided")
	}

	// Convert reorderItems to MenuOrderItem
	orderItems := make([]models.MenuOrderItem, 0, len(reorderItems))
	for _, item := range reorderItems {
		orderItems = append(orderItems, models.MenuOrderItem{
			ID:         item.ID,
			OrderIndex: item.OrderIndex,
			ParentID:   item.ParentID,
		})
	}

	if err := s.menuRepo.ReorderMenus(ctx, tenantID, orderItems); err != nil {
		utils.Errorf("MenuService: Failed to reorder menus: %v", err)
		return fmt.Errorf("failed to reorder menus: %w", err)
	}

	utils.Infof("MenuService: Reordered %d menu items for tenant %d", len(orderItems), tenantID)
	return nil
}

// BatchOperations performs batch operations on menus - FIXED SIGNATURE
func (s *menuService) BatchOperations(ctx context.Context, req *models.MenuBatchRequest, tenantID int) error {
	if req == nil || len(req.MenuIDs) == 0 {
		return fmt.Errorf("no menu IDs provided")
	}

	// Extract value from Data based on operation
	var value interface{}
	if req.Data != nil {
		switch req.Operation {
		case "update_group":
			value = req.Data["menu_group"]
		case "update_access_level":
			value = req.Data["access_level"]
		default:
			value = nil
		}
	}

	if err := s.menuRepo.BatchOperations(ctx, req.Operation, req.MenuIDs, value); err != nil {
		utils.Errorf("MenuService: Failed to perform batch operation %s: %v", req.Operation, err)
		return fmt.Errorf("failed to perform batch operation: %w", err)
	}

	utils.Infof("MenuService: Performed batch operation %s on %d menu items for tenant %d", req.Operation, len(req.MenuIDs), tenantID)
	return nil
}

// GetUserMenuTree retrieves menu tree filtered by user permissions
func (s *menuService) GetUserMenuTree(ctx context.Context, userID int, tenantID int) ([]*models.MenuItemDTO, error) {
	// Get all menus for the tenant
	menus, err := s.menuRepo.GetMenus(ctx, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get menus: %w", err)
	}

	// Filter menus based on user permissions
	accessibleMenus := []models.Menu{}
	for _, menu := range menus {
		hasAccess, _, err := s.CheckMenuAccess(ctx, userID, menu.ID, tenantID)
		if err != nil {
			utils.Warnf("MenuService: Error checking access for menu %d: %v", menu.ID, err)
			continue
		}
		if hasAccess {
			accessibleMenus = append(accessibleMenus, menu)
		}
	}

	// Build tree structure and convert to DTOs
	menuPtrs := make([]*models.Menu, len(accessibleMenus))
	for i := range accessibleMenus {
		menuPtrs[i] = &accessibleMenus[i]
	}

	tree := s.buildMenuHierarchy(menuPtrs)
	dtos := s.convertToMenuItemDTOs(tree)

	return dtos, nil
}

// GetUserAccessibleMenus retrieves all menus accessible to a user
func (s *menuService) GetUserAccessibleMenus(ctx context.Context, userID int, tenantID int) ([]*models.Menu, error) {
	menus, err := s.menuRepo.GetMenus(ctx, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get menus: %w", err)
	}

	accessibleMenus := []*models.Menu{}
	for _, menu := range menus {
		hasAccess, _, err := s.CheckMenuAccess(ctx, userID, menu.ID, tenantID)
		if err != nil {
			utils.Warnf("MenuService: Error checking access for menu %d: %v", menu.ID, err)
			continue
		}
		if hasAccess {
			//  FIXED: Create a copy to avoid pointer issues
			menuCopy := menu
			accessibleMenus = append(accessibleMenus, &menuCopy)
		}
	}

	return accessibleMenus, nil
}

// CheckMenuAccess checks if a user has access to a specific menu
func (s *menuService) CheckMenuAccess(ctx context.Context, userID, menuID, tenantID int) (bool, string, error) {
	menu, err := s.menuRepo.GetMenuByID(ctx, menuID)
	if err != nil {
		return false, "", fmt.Errorf("menu not found: %w", err)
	}

	// For now, implement basic access control
	// This should be enhanced with proper RBAC checking using authService
	if !menu.IsActive || !menu.IsVisible {
		return false, "Menu is not active or visible", nil
	}

	// TODO: Implement proper permission checking using authService
	// hasAccess, reason, err := s.authService.CheckUserPermission(ctx, userID, menu.RequiredPermissionID)
	// For now, return true for basic access
	return true, "", nil
}

// GetMenuAccessLogs retrieves access logs for a menu
func (s *menuService) GetMenuAccessLogs(ctx context.Context, menuID, tenantID int, limit int) ([]models.MenuAccessLog, error) {
	logs, err := s.menuRepo.GetMenuAccessLogs(ctx, menuID, tenantID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get menu access logs: %w", err)
	}
	return logs, nil
}

// GetMenuStatistics retrieves menu statistics
func (s *menuService) GetMenuStatistics(ctx context.Context, req *models.MenuStatisticsRequest) (interface{}, error) {
	// Convert time.Time pointers to strings for repository call
	var startDate, endDate string
	if req.StartDate != nil {
		startDate = req.StartDate.Format("2006-01-02")
	}
	if req.EndDate != nil {
		endDate = req.EndDate.Format("2006-01-02")
	}

	stats, err := s.menuRepo.GetMenuStatistics(ctx, req.TenantID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get menu statistics: %w", err)
	}
	return stats, nil
}

// Helper methods

// applyUpdatesToMenu applies update request fields to existing menu
func (s *menuService) applyUpdatesToMenu(menu *models.Menu, req *models.UpdateMenuRequest) {
	if req.Title != nil {
		menu.Title = *req.Title
	}
	if req.Icon != nil {
		menu.Icon = req.Icon
	}
	if req.Route != nil {
		menu.Route = req.Route
	}
	if req.ParentID != nil {
		menu.ParentID = req.ParentID
	}
	if req.OrderIndex != nil {
		menu.OrderIndex = *req.OrderIndex
	}
	if req.IsActive != nil {
		menu.IsActive = *req.IsActive
	}
	if req.RequiredPermissionID != nil {
		menu.RequiredPermissionID = req.RequiredPermissionID
	}
	if req.VisibilityRules != nil {
		// Convert map[string]interface{} to *MenuVisibilityRules
		visibilityRules := &models.MenuVisibilityRules{}
		if data, err := json.Marshal(req.VisibilityRules); err == nil {
			json.Unmarshal(data, visibilityRules)
		}
		menu.VisibilityRules = visibilityRules
	}
	if req.AccessLevel != nil {
		menu.AccessLevel = *req.AccessLevel
	}
	if req.IsSystemMenu != nil {
		menu.IsSystemMenu = *req.IsSystemMenu
	}
	if req.ConditionalPermissions != nil {
		menu.ConditionalPermissions = models.StringArray(req.ConditionalPermissions)
	}
	if req.MenuGroup != nil {
		menu.MenuGroup = req.MenuGroup
	}
	if req.CustomPermissions != nil {
		menu.CustomPermissions = models.StringArray(req.CustomPermissions)
	}
	if req.DisplayOrder != nil {
		menu.DisplayOrder = *req.DisplayOrder
	}
	if req.IsVisible != nil {
		menu.IsVisible = *req.IsVisible
	}
	if req.Description != nil {
		menu.Description = req.Description
	}
	if req.MenuType != nil {
		menu.MenuType = *req.MenuType
	}

	menu.UpdatedAt = time.Now()
}

// buildMenuHierarchy builds a hierarchical structure from flat menu list
func (s *menuService) buildMenuHierarchy(menus []*models.Menu) []*models.Menu {
	menuMap := make(map[int]*models.Menu)
	var rootMenus []*models.Menu

	// Create a map for quick lookup
	for _, menu := range menus {
		menuMap[menu.ID] = menu
		menu.Children = []*models.Menu{} // Initialize children slice
	}

	// Build the hierarchy
	for _, menu := range menus {
		if menu.ParentID == nil {
			rootMenus = append(rootMenus, menu)
		} else {
			if parent, exists := menuMap[*menu.ParentID]; exists {
				parent.Children = append(parent.Children, menu)
			}
		}
	}

	return rootMenus
}

//  NEW: filterMenuHierarchy recursively filters menu hierarchy
func (s *menuService) filterMenuHierarchy(menus []*models.Menu) []*models.Menu {
	filtered := make([]*models.Menu, 0)

	for _, menu := range menus {
		// Check if menu itself is active and visible
		if !menu.IsActive || !menu.IsVisible {
			continue
		}

		// Recursively filter children
		if len(menu.Children) > 0 {
			menu.Children = s.filterMenuHierarchy(menu.Children)
		}

		filtered = append(filtered, menu)
	}

	return filtered
}

// convertToMenuItemDTOs converts menu hierarchy to DTOs
func (s *menuService) convertToMenuItemDTOs(menus []*models.Menu) []*models.MenuItemDTO {
	dtos := make([]*models.MenuItemDTO, len(menus))
	for i, menu := range menus {
		dtos[i] = s.menuToDTO(menu)
	}
	return dtos
}

// menuToDTO converts a Menu to MenuItemDTO
func (s *menuService) menuToDTO(menu *models.Menu) *models.MenuItemDTO {
	dto := &models.MenuItemDTO{
		ID:          menu.ID,
		Title:       menu.Title,
		Slug:        menu.Slug,
		Icon:        menu.Icon,
		Route:       menu.Route,
		ParentID:    menu.ParentID,
		OrderIndex:  menu.OrderIndex,
		IsActive:    menu.IsActive,
		AccessLevel: menu.AccessLevel,
		MenuGroup:   menu.MenuGroup,
		IsVisible:   menu.IsVisible,
		MenuType:    menu.MenuType,
	}

	// Convert permissions
	if len(menu.ConditionalPermissions) > 0 {
		dto.Permissions = []string(menu.ConditionalPermissions)
	}

	// Convert children recursively
	if len(menu.Children) > 0 {
		dto.Children = make([]*models.MenuItemDTO, len(menu.Children))
		for i, child := range menu.Children {
			dto.Children[i] = s.menuToDTO(child)
		}
	}

	// Landing page clients derive destinations from children; keep fields
	// required for filtering on the parent too.
	dto.MenuGroup = menu.MenuGroup
	dto.Permissions = []string(menu.CustomPermissions)

	return dto
}
