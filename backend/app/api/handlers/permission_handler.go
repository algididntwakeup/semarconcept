// platform/backend/app/api/handlers/permission_handler.go

package handlers

import (
	"backend/app/models/request"
	"backend/app/services"
	"backend/app/utils"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// PermissionHandler handles permission management related HTTP requests.
type PermissionHandler struct {
	permissionService services.PermissionServiceInterface
}

// NewPermissionHandler creates a new PermissionHandler instance.
func NewPermissionHandler(permissionService services.PermissionServiceInterface) *PermissionHandler {
	return &PermissionHandler{permissionService: permissionService}
}

// CreatePermission godoc
// @Summary Create a new permission
// @Description Creates a new permission.
// @Tags permissions
// @Accept json
// @Produce json
// @Param permission body request.CreatePermissionRequest true "Permission creation details"
// @Success 201 {object} response.PermissionResponse "Permission created successfully"
// @Failure 400 {object} ErrorResponse "Invalid request payload or validation error"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden - Insufficient permissions"
// @Failure 409 {object} ErrorResponse "Permission name already exists"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions [post]
// @Security BearerAuth
func (h *PermissionHandler) CreatePermission(c *gin.Context) {
	var req request.CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"error":   "Validation failed",
				"details": utils.FormatValidationErrors(ve),
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid request payload: " + err.Error(),
		})
		return
	}

	//  FIXED: Extract user_id from JWT context
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("PermissionHandler.CreatePermission: actorID (user_id) not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("PermissionHandler.CreatePermission: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant identity.",
		})
		return
	}

	//  FIXED: Use extracted tenantID instead of hardcoded 0
	permissionResponse, err := h.permissionService.CreatePermission(c.Request.Context(), &req, tenantID, actorID)
	if err != nil {
		if errors.Is(err, utils.ErrConflict) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		utils.Errorf("PermissionHandler.CreatePermission: Error creating permission: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to create permission.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"data":    permissionResponse,
		"message": "Permission created successfully",
	})
}

// UpdatePermission godoc
// @Summary Update permission by ID
// @Description Updates details of a specific permission by its ID.
// @Tags permissions
// @Accept json
// @Produce json
// @Param id path int true "Permission ID"
// @Param permission body request.UpdatePermissionRequest true "Permission update details"
// @Success 200 {object} response.PermissionResponse "Permission updated successfully"
// @Failure 400 {object} ErrorResponse "Invalid Permission ID or request payload"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "Permission not found"
// @Failure 409 {object} ErrorResponse "Permission name already exists"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions/{id} [put]
// @Security BearerAuth
func (h *PermissionHandler) UpdatePermission(c *gin.Context) {
	permissionIDStr := c.Param("id")
	permissionID, err := strconv.Atoi(permissionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid permission ID format.",
		})
		return
	}

	var req request.UpdatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"error":   "Validation failed",
				"details": utils.FormatValidationErrors(ve),
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid request payload: " + err.Error(),
		})
		return
	}

	//  FIXED: Extract user_id from JWT context
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("PermissionHandler.UpdatePermission: actorID (user_id) not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	_, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("PermissionHandler.UpdatePermission: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant identity.",
		})
		return
	}

	//  FIXED: Use extracted tenantID instead of hardcoded 0
	permissionResponse, err := h.permissionService.UpdatePermission(c.Request.Context(), permissionID, &req, tenantID)
	if err != nil {
		if errors.Is(err, utils.ErrPermissionNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "Permission not found.",
			})
			return
		}
		if errors.Is(err, utils.ErrConflict) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		utils.Errorf("PermissionHandler.UpdatePermission: Error updating permission %d: %v", permissionID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to update permission.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    permissionResponse,
		"message": "Permission updated successfully",
	})
}

// DeletePermission godoc
// @Summary Delete permission by ID
// @Description Deletes a specific permission by its ID.
// @Tags permissions
// @Produce json
// @Param id path int true "Permission ID"
// @Success 200 {object} map[string]string "Permission deleted successfully"
// @Failure 400 {object} ErrorResponse "Invalid Permission ID"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "Permission not found"
// @Failure 409 {object} ErrorResponse "Permission is in use and cannot be deleted"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions/{id} [delete]
// @Security BearerAuth
func (h *PermissionHandler) DeletePermission(c *gin.Context) {
	permissionIDStr := c.Param("id")
	permissionID, err := strconv.Atoi(permissionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid permission ID format.",
		})
		return
	}

	//  FIXED: Extract user_id from JWT context
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("PermissionHandler.DeletePermission: actorID (user_id) not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	_, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("PermissionHandler.DeletePermission: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant identity.",
		})
		return
	}

	//  FIXED: Use extracted tenantID instead of hardcoded 0
	_, err = h.permissionService.DeletePermission(c.Request.Context(), permissionID, tenantID)
	if err != nil {
		if errors.Is(err, utils.ErrPermissionNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "Permission not found.",
			})
			return
		}
		if errors.Is(err, utils.ErrConflict) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		utils.Errorf("PermissionHandler.DeletePermission: Error deleting permission %d: %v", permissionID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to delete permission.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Permission deleted successfully",
	})
}

// BulkDeletePermissions godoc
// @Summary Bulk delete permissions
// @Description Deletes multiple permissions by their IDs
// @Tags permissions
// @Accept json
// @Produce json
// @Param bulk body request.BulkDeleteRequest true "Bulk delete request"
// @Success 200 {object} map[string]interface{} "Permissions deleted successfully"
// @Failure 400 {object} ErrorResponse "Invalid request payload"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions/bulk-delete [post]
// @Security BearerAuth
func (h *PermissionHandler) BulkDeletePermissions(c *gin.Context) {
	var req request.BulkDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid request payload: " + err.Error(),
		})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "IDs list is empty",
		})
		return
	}

	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, _ := tenantIDVal.(int)

	err := h.permissionService.BulkDeletePermissions(c.Request.Context(), req.IDs, tenantID)
	if err != nil {
		utils.Errorf("PermissionHandler.BulkDeletePermissions: Error bulk deleting permissions: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to bulk delete permissions.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("%d permissions deleted successfully", len(req.IDs)),
	})
}

// GetPermission godoc
// @Summary Get permission by ID
// @Description Retrieves details of a specific permission by its ID.
// @Tags permissions
// @Produce json
// @Param id path int true "Permission ID"
// @Success 200 {object} response.PermissionResponse "Permission details"
// @Failure 400 {object} ErrorResponse "Invalid Permission ID"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "Permission not found"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions/{id} [get]
// @Security BearerAuth
func (h *PermissionHandler) GetPermission(c *gin.Context) {
	permissionIDStr := c.Param("id")
	permissionID, err := strconv.Atoi(permissionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid permission ID format.",
		})
		return
	}

	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant identity.",
		})
		return
	}

	//  FIXED: Use extracted tenantID instead of hardcoded 0
	permissionResponse, err := h.permissionService.GetPermissionByID(c.Request.Context(), permissionID, tenantID)
	if err != nil {
		if errors.Is(err, utils.ErrPermissionNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "Permission not found.",
			})
			return
		}
		utils.Errorf("PermissionHandler.GetPermission: Error fetching permission %d: %v", permissionID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve permission.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   permissionResponse,
	})
}

// ListPermissions godoc
// @Summary List all permissions
// @Description Retrieves a list of all permissions with pagination support.
// @Tags permissions
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Number of items per page (default: 10)"
// @Param search query string false "Search term for filtering permissions"
// @Success 200 {object} response.PermissionListResponse "List of permissions"
// @Failure 400 {object} ErrorResponse "Invalid query parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions [get]
// @Security BearerAuth
func (h *PermissionHandler) ListPermissions(c *gin.Context) {
	var query request.PermissionListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid query parameters: " + err.Error(),
		})
		return
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 10
	}

	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant identity.",
		})
		return
	}

	//  FIXED: Use extracted tenantID instead of hardcoded 0
	permissionListResponse, err := h.permissionService.GetAllPermissions(c.Request.Context(), tenantID, query.Page, query.Limit, query.Search)
	if err != nil {
		utils.Errorf("PermissionHandler.ListPermissions: Error listing permissions: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve permissions.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   permissionListResponse,
	})
}

//  NEW: GetPermissionStats godoc
// @Summary Get permission statistics
// @Description Retrieves permission statistics including counts by module, action, and scope
// @Tags permissions
// @Produce json
// @Success 200 {object} map[string]interface{} "Permission statistics"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /permissions/stats [get]
// @Security BearerAuth
func (h *PermissionHandler) GetPermissionStats(c *gin.Context) {
	// Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Tenant identity not found.",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant identity.",
		})
		return
	}

	utils.Infof(" PermissionHandler.GetPermissionStats: Fetching stats for tenant %d", tenantID)

	//  Get permission statistics from service
	stats, err := h.permissionService.GetPermissionStats(c.Request.Context(), tenantID)
	if err != nil {
		utils.Errorf("PermissionHandler.GetPermissionStats: Error fetching stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve permission statistics.",
		})
		return
	}

	utils.Infof("PermissionHandler.GetPermissionStats: Stats retrieved successfully: %+v", stats)

	// Return standardized response
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   stats,
	})
}
