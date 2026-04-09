// platform/backend/app/api/handlers/menu_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"backend/app/models"
	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
)

// MenuHandler handles menu-related HTTP requests (matching database schema)
type MenuHandler struct {
	menuService services.MenuService
}

// NewMenuHandler creates a new menu handler
func NewMenuHandler(menuService services.MenuService) *MenuHandler {
	return &MenuHandler{
		menuService: menuService,
	}
}

//  FIXED: String-to-ID mapping based on YOUR ACTUAL DATABASE
var primaryMenuStringMap = map[string]int{
	// Primary identifiers
	"primary":     1,  // Default primary menu -> Dashboard
	"dashboard":   1,  // Dashboard
	"analytics":   2,  // Analytics
	"assets":      3,  // Asset Management -> /asset
	"asset":       3,  // Asset Management (alternative)
	"inspection":  4,  // Inspection Management
	"risk":        5,  // Risk Management
	"maintenance": 6,  // Maintenance Management
	"compliance":  7,  // Compliance Management
	"content":     8,  // Content Management
	"admin":       9,  // Administration
	"templates":   10, // Templates/Starter
	"starter":     10, // Templates/Starter (alternative)

	// Lowercase versions for flexibility
	"template": 10, // Template (singular)
}

//  FIXED: Enhanced parameter parsing that accepts both string and numeric IDs
func (h *MenuHandler) parseMenuID(idParam string) (int, error) {
	// First try to parse as integer
	if id, err := strconv.Atoi(idParam); err == nil {
		return id, nil
	}

	// If not numeric, try string mapping
	idParam = strings.ToLower(strings.TrimSpace(idParam))
	if id, exists := primaryMenuStringMap[idParam]; exists {
		utils.Infof("MenuHandler: Mapped string '%s' to ID %d", idParam, id)
		return id, nil
	}

	// If neither works, return error with helpful message
	validStrings := []string{}
	for key := range primaryMenuStringMap {
		validStrings = append(validStrings, key)
	}

	return 0, fmt.Errorf("invalid menu ID '%s' - must be numeric (1-10) or valid string (%s)",
		idParam, strings.Join(validStrings, ", "))
}

// GetMenus handles GET /api/v1/menu with filtering options
func (h *MenuHandler) GetMenus(c *gin.Context) {
	// Extract tenant ID from context (should be set by auth middleware)
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1 // Default fallback
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1 // Default fallback
	}

	//  NEW: Check for admin mode query parameter
	includeInactive := c.Query("include_inactive") == "true"
	adminMode := c.Query("admin") == "true"

	var menus []models.Menu
	var err error

	if adminMode || includeInactive {
		//  NEW: Get all menus including inactive for admin
		menus, err = h.menuService.GetAllMenus(c.Request.Context(), tenantIDInt, true)
		utils.Infof("MenuHandler: Retrieved ALL menus (including inactive) for admin: %d items", len(menus))
	} else {
		//  ENHANCED: Get filtered menus (active and visible only)
		menus, err = h.menuService.GetMenus(c.Request.Context(), tenantIDInt)
		utils.Infof("MenuHandler: Retrieved FILTERED menus for tenant %d: %d items", tenantIDInt, len(menus))
	}

	if err != nil {
		utils.Errorf("MenuHandler: Failed to get menus: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to retrieve menus", err)
		return
	}

	response := gin.H{
		"success": true,
		"data":    menus,
		"count":   len(menus),
		"message": "Menus retrieved successfully",
	}

	//  NEW: Add filtering info to response
	if adminMode || includeInactive {
		response["admin_mode"] = true
		response["includes_inactive"] = true
		response["filter_applied"] = "none"
	} else {
		response["admin_mode"] = false
		response["includes_inactive"] = false
		response["filter_applied"] = "active_and_visible_only"
	}

	c.JSON(http.StatusOK, response)
}

// GetMenuHierarchy handles GET /api/v1/menu/hierarchy with filtering options
func (h *MenuHandler) GetMenuHierarchy(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	//  NEW: Check for admin mode
	includeInactive := c.Query("include_inactive") == "true"
	adminMode := c.Query("admin") == "true"

	var hierarchy []*models.Menu
	var err error

	if adminMode || includeInactive {
		//  NEW: For admin mode, get all menus and build unfiltered hierarchy
		allMenus, err := h.menuService.GetAllMenus(c.Request.Context(), tenantIDInt, true)
		if err != nil {
			utils.Errorf("MenuHandler: Failed to get all menus for admin hierarchy: %v", err)
			HandleError(c, http.StatusInternalServerError, "Failed to retrieve menu hierarchy", err)
			return
		}

		// Convert to pointers and build hierarchy
		menuPtrs := make([]*models.Menu, len(allMenus))
		for i := range allMenus {
			menuPtrs[i] = &allMenus[i]
		}
		hierarchy = h.buildMenuHierarchy(menuPtrs)
		utils.Infof("MenuHandler: Built ADMIN hierarchy with %d root menus for tenant %d", len(hierarchy), tenantIDInt)
	} else {
		//  ENHANCED: Get filtered hierarchy
		hierarchy, err = h.menuService.GetMenuHierarchy(c.Request.Context(), tenantIDInt)
		utils.Infof("MenuHandler: Built FILTERED hierarchy with %d root menus for tenant %d", len(hierarchy), tenantIDInt)
	}

	if err != nil {
		utils.Errorf("MenuHandler: Failed to get menu hierarchy: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to retrieve menu hierarchy", err)
		return
	}

	response := gin.H{
		"success": true,
		"data":    hierarchy,
		"count":   len(hierarchy),
		"message": "Menu hierarchy retrieved successfully",
	}

	//  NEW: Add filtering info
	if adminMode || includeInactive {
		response["admin_mode"] = true
		response["filter_applied"] = "none"
	} else {
		response["admin_mode"] = false
		response["filter_applied"] = "active_and_visible_only"
	}

	c.JSON(http.StatusOK, response)
}

//  FIXED: GetMenu now accepts both string and numeric IDs
func (h *MenuHandler) GetMenu(c *gin.Context) {
	idParam := c.Param("id")
	id, err := h.parseMenuID(idParam)
	if err != nil {
		utils.Warnf("MenuHandler: Invalid menu ID parameter: %s - %v", idParam, err)
		HandleError(c, http.StatusBadRequest, "Invalid menu ID", err)
		return
	}

	utils.Infof("MenuHandler: Getting menu by ID %d (original param: %s)", id, idParam)

	menu, err := h.menuService.GetMenuByID(c.Request.Context(), id)
	if err != nil {
		utils.Errorf("MenuHandler: Failed to get menu by ID %d: %v", id, err)
		if err.Error() == "menu not found" {
			HandleError(c, http.StatusNotFound, "Menu not found", err)
		} else {
			HandleError(c, http.StatusInternalServerError, "Failed to retrieve menu", err)
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    menu,
		"message": fmt.Sprintf("Menu '%s' retrieved successfully", menu.Title),
	})
}

//  NEW: GetMenuChildren handles GET /api/v1/menu/:id/children
func (h *MenuHandler) GetMenuChildren(c *gin.Context) {
	idParam := c.Param("id")
	id, err := h.parseMenuID(idParam)
	if err != nil {
		utils.Warnf("MenuHandler: Invalid menu ID parameter for children: %s - %v", idParam, err)
		HandleError(c, http.StatusBadRequest, "Invalid menu ID", err)
		return
	}

	utils.Infof("MenuHandler: Getting children for menu ID %d (original param: %s)", id, idParam)

	// Get the parent menu first to ensure it exists
	parentMenu, err := h.menuService.GetMenuByID(c.Request.Context(), id)
	if err != nil {
		utils.Errorf("MenuHandler: Parent menu not found for children request: %d", id)
		if err.Error() == "menu not found" {
			HandleError(c, http.StatusNotFound, "Parent menu not found", err)
		} else {
			HandleError(c, http.StatusInternalServerError, "Failed to retrieve parent menu", err)
		}
		return
	}

	// Get tenant ID
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	// Get the hierarchy and extract children for this parent
	hierarchy, err := h.menuService.GetMenuHierarchy(c.Request.Context(), tenantIDInt)
	if err != nil {
		utils.Errorf("MenuHandler: Failed to get menu hierarchy for children: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to retrieve menu children", err)
		return
	}

	// Find the parent menu in hierarchy and return its children
	var children []*models.Menu
	for _, menu := range hierarchy {
		if menu.ID == id {
			children = menu.Children
			break
		}
		// Also check nested children
		if found := h.findChildrenInHierarchy(menu, id); found != nil {
			children = found
			break
		}
	}

	if children == nil {
		children = []*models.Menu{} // Return empty array instead of nil
	}

	utils.Infof("MenuHandler: Found %d children for menu '%s' (ID: %d)", len(children), parentMenu.Title, id)

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"data":         children,
		"count":        len(children),
		"parent_id":    id,
		"parent_name":  parentMenu.Title,
		"parent_route": parentMenu.Route,
		"message":      fmt.Sprintf("Found %d children for menu '%s'", len(children), parentMenu.Title),
	})
}

//  NEW: Helper method to find children in nested hierarchy
func (h *MenuHandler) findChildrenInHierarchy(menu *models.Menu, parentID int) []*models.Menu {
	if menu.ID == parentID {
		return menu.Children
	}

	for _, child := range menu.Children {
		if result := h.findChildrenInHierarchy(child, parentID); result != nil {
			return result
		}
	}

	return nil
}

// CreateMenu handles POST /api/v1/menu
func (h *MenuHandler) CreateMenu(c *gin.Context) {
	var req models.CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Warnf("MenuHandler: Invalid create menu request: %v", err)
		HandleError(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		utils.Warnf("MenuHandler: Create menu validation failed: %v", err)
		HandleError(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Extract tenant ID from context
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	menu, err := h.menuService.CreateMenu(c.Request.Context(), &req, tenantIDInt)
	if err != nil {
		utils.Errorf("MenuHandler: Failed to create menu: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to create menu", err)
		return
	}

	utils.Infof("MenuHandler: Created menu '%s' (ID: %d) for tenant %d", menu.Title, menu.ID, tenantIDInt)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    menu,
		"message": fmt.Sprintf("Menu '%s' created successfully", menu.Title),
	})
}

//  FIXED: UpdateMenu now accepts both string and numeric IDs
func (h *MenuHandler) UpdateMenu(c *gin.Context) {
	idParam := c.Param("id")
	id, err := h.parseMenuID(idParam)
	if err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid menu ID", err)
		return
	}

	var req models.UpdateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		HandleError(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	menu, err := h.menuService.UpdateMenu(c.Request.Context(), id, &req)
	if err != nil {
		utils.Errorf("MenuHandler: Failed to update menu %d: %v", id, err)
		if err.Error() == "menu not found" || strings.Contains(err.Error(), "not found") {
			HandleError(c, http.StatusNotFound, "Menu not found", err.Error())
		} else if strings.Contains(err.Error(), "validation") || strings.Contains(err.Error(), "parent") {
			HandleError(c, http.StatusBadRequest, err.Error(), nil)
		} else {
			HandleError(c, http.StatusInternalServerError, "Failed to update menu", err.Error())
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    menu,
		"message": fmt.Sprintf("Menu '%s' updated successfully", menu.Title),
	})
}

//  FIXED: DeleteMenu now accepts both string and numeric IDs
func (h *MenuHandler) DeleteMenu(c *gin.Context) {
	idParam := c.Param("id")
	id, err := h.parseMenuID(idParam)
	if err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid menu ID", err)
		return
	}

	if err := h.menuService.DeleteMenu(c.Request.Context(), id); err != nil {
		utils.Errorf("MenuHandler: Failed to delete menu: %v", err)
		if err.Error() == "menu not found" {
			HandleError(c, http.StatusNotFound, "Menu not found", err)
		} else {
			HandleError(c, http.StatusInternalServerError, "Failed to delete menu", err)
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Menu deleted successfully",
	})
}

//  FIXED: ToggleStatus now accepts both string and numeric IDs
func (h *MenuHandler) ToggleStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := h.parseMenuID(idParam)
	if err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid menu ID", err)
		return
	}

	var req models.ToggleStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	if err := h.menuService.ToggleMenuStatus(c.Request.Context(), id, req.IsActive); err != nil {
		utils.Errorf("MenuHandler: Failed to toggle menu status: %v", err)
		if err.Error() == "menu not found" {
			HandleError(c, http.StatusNotFound, "Menu not found", err)
		} else {
			HandleError(c, http.StatusInternalServerError, "Failed to toggle menu status", err)
		}
		return
	}

	statusText := "deactivated"
	if req.IsActive {
		statusText = "activated"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Menu %s successfully", statusText),
	})
}

// ReorderMenus handles PUT /api/v1/menu/reorder
func (h *MenuHandler) ReorderMenus(c *gin.Context) {
	var req models.ReorderMenuRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	if len(req.Items) == 0 {
		HandleError(c, http.StatusBadRequest, "Menu items cannot be empty", nil)
		return
	}

	// Extract tenant ID from context
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	if err := h.menuService.ReorderMenus(c.Request.Context(), tenantIDInt, req.Items); err != nil {
		utils.Errorf("MenuHandler: Failed to reorder menus: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to reorder menus", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Reordered %d menus successfully", len(req.Items)),
	})
}

// BatchOperations handles POST /api/v1/menu/batch
func (h *MenuHandler) BatchOperations(c *gin.Context) {
	var req models.MenuBatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	if len(req.MenuIDs) == 0 {
		HandleError(c, http.StatusBadRequest, "Menu IDs cannot be empty", nil)
		return
	}

	// Extract tenant ID from context
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	if err := h.menuService.BatchOperations(c.Request.Context(), &req, tenantIDInt); err != nil {
		utils.Errorf("MenuHandler: Failed to perform batch operation: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to perform batch operation", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Batch operation '%s' completed successfully on %d menus", req.Operation, len(req.MenuIDs)),
	})
}

// GetUserMenuTree handles GET /api/v1/menu/user-tree
func (h *MenuHandler) GetUserMenuTree(c *gin.Context) {
	// Extract user and tenant information from context
	userID, exists := c.Get("user_id")
	if !exists {
		HandleError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userIDInt, ok := userID.(int)
	if !ok {
		HandleError(c, http.StatusInternalServerError, "Invalid user ID in context", nil)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	tree, err := h.menuService.GetUserMenuTree(c.Request.Context(), userIDInt, tenantIDInt)
	if err != nil {
		utils.Errorf("MenuHandler: Failed to get user menu tree: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to retrieve user menu tree", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tree,
		"count":   len(tree),
		"user_id": userIDInt,
		"message": fmt.Sprintf("User menu tree retrieved successfully (%d items)", len(tree)),
	})
}

// GetAccessibleMenus handles GET /api/v1/menu/accessible
func (h *MenuHandler) GetAccessibleMenus(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		HandleError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userIDInt, ok := userID.(int)
	if !ok {
		HandleError(c, http.StatusInternalServerError, "Invalid user ID in context", nil)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	menus, err := h.menuService.GetUserAccessibleMenus(c.Request.Context(), userIDInt, tenantIDInt)
	if err != nil {
		utils.Errorf("MenuHandler: Failed to get accessible menus: %v", err)
		HandleError(c, http.StatusInternalServerError, "Failed to retrieve accessible menus", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    menus,
		"count":   len(menus),
		"user_id": userIDInt,
		"message": fmt.Sprintf("Found %d accessible menus for user", len(menus)),
	})
}

//  NEW: buildMenuHierarchy builds a hierarchical structure from flat menu list
func (h *MenuHandler) buildMenuHierarchy(menus []*models.Menu) []*models.Menu {
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

//  NEW: GetMenuStats handles GET /api/v1/menu/debug/stats - Debug endpoint for checking filter status
func (h *MenuHandler) GetMenuStats(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		tenantID = 1
	}

	tenantIDInt, ok := tenantID.(int)
	if !ok {
		tenantIDInt = 1
	}

	// Get all menus (unfiltered)
	allMenus, err := h.menuService.GetAllMenus(c.Request.Context(), tenantIDInt, true)
	if err != nil {
		HandleError(c, http.StatusInternalServerError, "Failed to get menu stats", err)
		return
	}

	// Get filtered menus
	filteredMenus, err := h.menuService.GetMenus(c.Request.Context(), tenantIDInt)
	if err != nil {
		HandleError(c, http.StatusInternalServerError, "Failed to get filtered menu stats", err)
		return
	}

	// Calculate stats
	var activeCount, inactiveCount, visibleCount, invisibleCount int
	for _, menu := range allMenus {
		if menu.IsActive {
			activeCount++
		} else {
			inactiveCount++
		}

		if menu.IsVisible {
			visibleCount++
		} else {
			invisibleCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"tenant_id":      tenantIDInt,
			"total_menus":    len(allMenus),
			"filtered_menus": len(filteredMenus),
			"filtered_out":   len(allMenus) - len(filteredMenus),
			"breakdown": gin.H{
				"active":    activeCount,
				"inactive":  inactiveCount,
				"visible":   visibleCount,
				"invisible": invisibleCount,
			},
			"filter_rules": gin.H{
				"requires_active":        true,
				"requires_visible":       true,
				"admin_bypass_available": true,
			},
		},
		"message": "Menu statistics retrieved successfully",
	})
}
