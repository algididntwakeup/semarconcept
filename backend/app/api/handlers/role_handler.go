// platform/backend/app/api/handlers/role_handler.go

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

// RoleHandler handles role management related HTTP requests.
type RoleHandler struct {
	roleService services.RoleServiceInterface
}

// NewRoleHandler creates a new RoleHandler instance.
func NewRoleHandler(roleService services.RoleServiceInterface) *RoleHandler {
	return &RoleHandler{roleService: roleService}
}

// Helper function to extract tenant_id from context
func (h *RoleHandler) extractTenantID(c *gin.Context) (int, error) {
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		return 0, errors.New("tenant identity not found")
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		return 0, errors.New("invalid tenant identity format")
	}
	return tenantID, nil
}

// Helper function to extract user_id from context
func (h *RoleHandler) extractUserID(c *gin.Context) (int, error) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		return 0, errors.New("user identity not found")
	}
	userID, ok := userIDVal.(int)
	if !ok {
		return 0, errors.New("invalid user identity format")
	}
	return userID, nil
}

// CreateRole godoc
// @Summary Create a new role
// @Description Creates a new role with specified permissions.
// @Tags roles
// @Accept json
// @Produce json
// @Param role body request.CreateRoleRequest true "Role creation details"
// @Success 201 {object} response.RoleResponse "Role created successfully"
// @Failure 400 {object} ErrorResponse "Invalid request payload or validation error"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden - Insufficient permissions"
// @Failure 409 {object} ErrorResponse "Role name already exists"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles [post]
// @Security BearerAuth
func (h *RoleHandler) CreateRole(c *gin.Context) {
	var req request.CreateRoleRequest
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

	//  FIXED: Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.CreateRole: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Extract user_id from context
	userID, err := h.extractUserID(c)
	if err != nil {
		utils.Warn("RoleHandler.CreateRole: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Pass actual tenantID instead of 0
	roleResponse, err := h.roleService.CreateRole(c.Request.Context(), &req, tenantID, userID)
	if err != nil {
		if errors.Is(err, utils.ErrConflict) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		if errors.Is(err, utils.ErrBadRequest) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		utils.Errorf("RoleHandler.CreateRole: Error creating role: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to create role.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"data":    roleResponse,
		"message": "Role created successfully",
	})
}

// UpdateRole godoc
// @Summary Update role by ID
// @Description Updates details of a specific role by its ID, including permissions.
// @Tags roles
// @Accept json
// @Produce json
// @Param id path int true "Role ID"
// @Param role body request.UpdateRoleRequest true "Role update details"
// @Success 200 {object} response.RoleResponse "Role updated successfully"
// @Failure 400 {object} ErrorResponse "Invalid Role ID or request payload"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "Role not found"
// @Failure 409 {object} ErrorResponse "Role name already exists"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles/{id} [put]
// @Security BearerAuth
func (h *RoleHandler) UpdateRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.Atoi(roleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid role ID format.",
		})
		return
	}

	var req request.UpdateRoleRequest
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

	//  FIXED: Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.UpdateRole: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Pass actual tenantID instead of 0
	roleResponse, err := h.roleService.UpdateRole(c.Request.Context(), roleID, &req, tenantID)
	if err != nil {
		if errors.Is(err, utils.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "Role not found.",
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
		if errors.Is(err, utils.ErrBadRequest) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		utils.Errorf("RoleHandler.UpdateRole: Error updating role %d: %v", roleID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to update role.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    roleResponse,
		"message": "Role updated successfully",
	})
}

// DeleteRole godoc
// @Summary Delete role by ID
// @Description Deletes a specific role by its ID.
// @Tags roles
// @Produce json
// @Param id path int true "Role ID"
// @Success 200 {object} map[string]string "Role deleted successfully"
// @Failure 400 {object} ErrorResponse "Invalid Role ID"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "Role not found"
// @Failure 409 {object} ErrorResponse "Role is in use and cannot be deleted"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles/{id} [delete]
// @Security BearerAuth
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.Atoi(roleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid role ID format.",
		})
		return
	}

	//  FIXED: Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.DeleteRole: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Pass actual tenantID instead of 0
	_, err = h.roleService.DeleteRole(c.Request.Context(), roleID, tenantID)
	if err != nil {
		if errors.Is(err, utils.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "Role not found.",
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
		utils.Errorf("RoleHandler.DeleteRole: Error deleting role %d: %v", roleID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to delete role.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Role deleted successfully",
	})
}

// BulkDeleteRoles godoc
// @Summary Bulk delete roles
// @Description Deletes multiple roles by their IDs
// @Tags roles
// @Accept json
// @Produce json
// @Param bulk body request.BulkDeleteRequest true "Bulk delete request"
// @Success 200 {object} map[string]interface{} "Roles deleted successfully"
// @Failure 400 {object} ErrorResponse "Invalid request payload"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles/bulk-delete [post]
// @Security BearerAuth
func (h *RoleHandler) BulkDeleteRoles(c *gin.Context) {
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

	tenantID, err := h.extractTenantID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	err = h.roleService.BulkDeleteRoles(c.Request.Context(), req.IDs, tenantID)
	if err != nil {
		utils.Errorf("RoleHandler.BulkDeleteRoles: Error bulk deleting roles: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to bulk delete roles.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("%d roles deleted successfully", len(req.IDs)),
	})
}

// GetRole godoc
// @Summary Get role by ID
// @Description Retrieves details of a specific role by its ID.
// @Tags roles
// @Produce json
// @Param id path int true "Role ID"
// @Success 200 {object} response.RoleResponse "Role retrieved successfully"
// @Failure 400 {object} ErrorResponse "Invalid Role ID"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "Role not found"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles/{id} [get]
// @Security BearerAuth
func (h *RoleHandler) GetRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.Atoi(roleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid role ID format.",
		})
		return
	}

	//  FIXED: Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.GetRole: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Pass actual tenantID instead of 0
	roleResponse, err := h.roleService.GetRoleByID(c.Request.Context(), roleID, tenantID)
	if err != nil {
		if errors.Is(err, utils.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "Role not found.",
			})
			return
		}
		utils.Errorf("RoleHandler.GetRole: Error fetching role %d: %v", roleID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve role.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   roleResponse,
	})
}

// ListRoles godoc
// @Summary List all roles
// @Description Retrieves a paginated list of all roles.
// @Tags roles
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search term"
// @Success 200 {object} response.RoleListResponse "Roles retrieved successfully"
// @Failure 400 {object} ErrorResponse "Invalid query parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles [get]
// @Security BearerAuth
func (h *RoleHandler) ListRoles(c *gin.Context) {
	var query request.RoleListQuery
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

	//  FIXED: Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.ListRoles: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Pass actual tenantID instead of 0
	roleListResponse, err := h.roleService.GetAllRoles(c.Request.Context(), tenantID, query.Page, query.Limit, query.Search)
	if err != nil {
		utils.Errorf("RoleHandler.ListRoles: Error listing roles: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve roles.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   roleListResponse,
	})
}

// GetRoleStats godoc
// @Summary Get role statistics
// @Description Retrieves statistics about roles for the current tenant.
// @Tags roles
// @Produce json
// @Success 200 {object} response.RoleStatsResponse "Role statistics retrieved successfully"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles/stats [get]
// @Security BearerAuth
func (h *RoleHandler) GetRoleStats(c *gin.Context) {
	//  FIXED: Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.GetRoleStats: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	//  FIXED: Call service method with tenantID
	statsResponse, err := h.roleService.GetRoleStats(c.Request.Context(), tenantID)
	if err != nil {
		utils.Errorf("RoleHandler.GetRoleStats: Error fetching role stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve role statistics.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   statsResponse,
	})
}

//  NEW: ValidateRoleCode godoc
// @Summary Validate role code availability
// @Description Checks if a role code is available for use
// @Tags roles
// @Produce json
// @Param code query string true "Role code to validate"
// @Param exclude_id query int false "Role ID to exclude from validation (for edits)"
// @Success 200 {object} map[string]interface{} "Validation result"
// @Failure 400 {object} ErrorResponse "Invalid request parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /roles/validate-code [get]
// @Security BearerAuth
func (h *RoleHandler) ValidateRoleCode(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Role code is required",
		})
		return
	}

	excludeIDStr := c.Query("exclude_id")
	var excludeID *int
	if excludeIDStr != "" {
		if id, err := strconv.Atoi(excludeIDStr); err == nil {
			excludeID = &id
		}
	}

	// Extract tenant_id from context
	tenantID, err := h.extractTenantID(c)
	if err != nil {
		utils.Warn("RoleHandler.ValidateRoleCode: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: " + err.Error(),
		})
		return
	}

	// Call service method to validate role code
	isAvailable, err := h.roleService.ValidateRoleCode(c.Request.Context(), code, tenantID, excludeID)
	if err != nil {
		utils.Errorf("RoleHandler.ValidateRoleCode: Error validating role code: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to validate role code",
		})
		return
	}

	// Return validation result
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"available": isAvailable,
			"code":      code,
		},
	})
}
