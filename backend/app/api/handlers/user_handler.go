// platform/backend/app/api/handlers/user_handler.go
// User handler with tenant context extraction

package handlers

import (
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/pagination"
	"backend/app/services"
	"backend/app/utils"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// UserHandler handles user management related HTTP requests.
type UserHandler struct {
	userService services.UserService
}

// NewUserHandler creates a new UserHandler instance.
func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetUsers godoc
// @Summary List all users
// @Description Retrieves a paginated list of all users with filtering options
// @Tags users
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Number of items per page" default(10)
// @Param search query string false "Search term for user name, email, or username"
// @Param status query string false "Filter by status: active, inactive, admin, superuser"
// @Param role query string false "Filter by role name"
// @Success 200 {object} response.UserListResponse "List of users"
// @Failure 400 {object} ErrorResponse "Invalid query parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users [get]
// @Security BearerAuth
func (h *UserHandler) GetUsers(c *gin.Context) {
	// Get pagination from context (set by PaginationMiddleware)
	paginationObj := pagination.Get(c)

	// Create query with pagination and search parameters
	var query request.UserListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid query parameters: " + err.Error(),
		})
		return
	}

	// Override query pagination with middleware pagination
	query.Page = paginationObj.GetPage()
	query.Limit = paginationObj.GetPageSize()

	//  FIXED: Extract tenant_id from context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		utils.Warn("UserHandler.GetUsers: tenant_id not found in context.")
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Tenant context not found",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.GetUsers: tenant_id in context is not of type int. Value: %v", tenantIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant context",
		})
		return
	}

	//  FIXED: Use GetAllUsers with proper parameters and pagination
	userListResponse, err := h.userService.GetAllUsers(
		c.Request.Context(),
		tenantID,
		query.Page,
		query.Limit,
		query.Search,
		"", // status filter - can be enhanced later
		"", // role filter - can be enhanced later
	)
	if err != nil {
		utils.Errorf("UserHandler.GetUsers: Error listing users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve users.",
		})
		return
	}

	//  FIXED: Return proper nested structure with pagination metadata
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"users":      userListResponse.Users,
			"pagination": userListResponse.Pagination,
		},
	})
}

// CreateUser godoc
// @Summary Create a new user (Admin)
// @Description Allows an administrator to create a new user account.
// @Tags users
// @Accept json
// @Produce json
// @Param user body request.CreateUserRequest true "User creation details"
// @Success 201 {object} response.UserResponse "User created successfully"
// @Failure 400 {object} ErrorResponse "Invalid request payload or validation error"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden - Insufficient permissions"
// @Failure 409 {object} ErrorResponse "Username or email already exists"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users [post]
// @Security BearerAuth
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req request.CreateUserRequest
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

	// 🚨 CRITICAL FIX: Extract tenant_id from JWT context
	tenantIDVal, exists := c.Get("tenant_id")
	if !exists {
		utils.Warn("UserHandler.CreateUser: tenant_id not found in context.")
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Tenant context not found",
		})
		return
	}
	tenantID, ok := tenantIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.CreateUser: tenant_id in context is not of type int. Value: %v", tenantIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing tenant context",
		})
		return
	}

	// 🚨 CRITICAL FIX: Set tenant_id in request
	req.TenantID = tenantID

	//  FIXED: Changed from "userID" to "user_id" to match middleware
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("UserHandler.CreateUser: actorID (user_id) not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.CreateUser: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	// 🚨 SURGICAL ADD: Log the context for debugging
	utils.Infof("UserHandler.CreateUser: Creating user with tenant_id=%d, actor_id=%d, username=%s",
		tenantID, actorID, req.Username)

	userResponse, err := h.userService.CreateUser(c.Request.Context(), req, actorID)
	if err != nil {
		// 🚨 SURGICAL ADD: Enhanced error handling for foreign key constraints
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			if strings.Contains(err.Error(), "fk_users_tenant_id") {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"error":   "Tenant validation failed",
					"details": fmt.Sprintf("Tenant ID %d is invalid", tenantID),
				})
				return
			}
			if strings.Contains(err.Error(), "department") {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"error":   "Department validation failed",
					"details": "Selected department does not exist or is not accessible",
				})
				return
			}
		}

		if errors.Is(err, utils.ErrConflict) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		utils.Errorf("UserHandler.CreateUser: Error creating user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to create user.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"data":    userResponse,
		"message": "User created successfully",
	})
}

// GetUser godoc
// @Summary Get user by ID
// @Description Retrieves details of a specific user by their ID.
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} response.UserResponse "User details"
// @Failure 400 {object} ErrorResponse "Invalid User ID"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "User not found"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/{id} [get]
// @Security BearerAuth
func (h *UserHandler) GetUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid user ID format.",
		})
		return
	}

	userResponse, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "User not found.",
			})
			return
		}
		utils.Errorf("UserHandler.GetUser: Error fetching user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve user.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   userResponse,
	})
}

// UpdateUser godoc
// @Summary Update user by ID
// @Description Updates details of a specific user by their ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body request.UpdateUserRequest true "User update details"
// @Success 200 {object} response.UserResponse "User updated successfully"
// @Failure 400 {object} ErrorResponse "Invalid User ID or request payload"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "User not found"
// @Failure 409 {object} ErrorResponse "Username or email already exists"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/{id} [put]
// @Security BearerAuth
func (h *UserHandler) UpdateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid user ID format.",
		})
		return
	}

	var req request.UpdateUserRequest
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

	// Extract actor_id from JWT context
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("UserHandler.UpdateUser: actorID (user_id) not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.UpdateUser: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	userResponse, err := h.userService.UpdateUser(c.Request.Context(), userID, req, actorID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "User not found.",
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
		utils.Errorf("UserHandler.UpdateUser: Error updating user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to update user.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    userResponse,
		"message": "User updated successfully",
	})
}

// DeleteUser godoc
// @Summary Delete user by ID
// @Description Deletes a specific user by their ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} map[string]interface{} "User deleted successfully"
// @Failure 400 {object} ErrorResponse "Invalid User ID"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 404 {object} ErrorResponse "User not found"
// @Failure 409 {object} ErrorResponse "Cannot delete user with active associations"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/{id} [delete]
// @Security BearerAuth
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid user ID format.",
		})
		return
	}

	// Extract actor_id from JWT context
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("UserHandler.DeleteUser: actorID (user_id) not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.DeleteUser: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	err = h.userService.DeleteUser(c.Request.Context(), userID, actorID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "User not found.",
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
		utils.Errorf("UserHandler.DeleteUser: Error deleting user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to delete user.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User deleted successfully",
	})
}

// BulkDeleteUsers godoc
// @Summary Bulk delete users
// @Description Deletes multiple users by their IDs
// @Tags users
// @Accept json
// @Produce json
// @Param bulk body request.BulkDeleteRequest true "Bulk delete request"
// @Success 200 {object} map[string]interface{} "Users deleted successfully"
// @Failure 400 {object} ErrorResponse "Invalid request payload"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/bulk-delete [post]
// @Security BearerAuth
func (h *UserHandler) BulkDeleteUsers(c *gin.Context) {
	var req request.BulkDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid request payload: " + err.Error(),
		})
		return
	}

	// Extract tenant_id from context
	tenantIDVal, _ := c.Get("tenant_id")
	tenantID, _ := tenantIDVal.(int)

	err := h.userService.BulkDelete(c.Request.Context(), req.IDs, tenantID)
	if err != nil {
		utils.Errorf("UserHandler.BulkDeleteUsers: Error bulk deleting users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to bulk delete users.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("%d users deleted successfully", len(req.IDs)),
	})
}

// GetCurrentUserProfile godoc
// @Summary Get current user profile
// @Description Retrieves the profile of the currently authenticated user
// @Tags users
// @Produce json
// @Success 200 {object} response.UserResponse "Current user profile"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 404 {object} ErrorResponse "User not found"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/profile [get]
// @Security BearerAuth
func (h *UserHandler) GetCurrentUserProfile(c *gin.Context) {
	//  FIXED: Changed from "userID" to "user_id" to match middleware
	userIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("UserHandler.GetCurrentUserProfile: user_id not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: User identity not found.",
		})
		return
	}
	userID, ok := userIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.GetCurrentUserProfile: user_id in context is not of type int. Value: %v", userIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing user identity.",
		})
		return
	}

	userResponse, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "error",
				"error":  "User not found.",
			})
			return
		}
		utils.Errorf("UserHandler.GetCurrentUserProfile: Error fetching current user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve user profile.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   userResponse,
	})
}

// GetUserStats godoc
// @Summary Get user statistics
// @Description Retrieves statistics about users in the system
// @Tags users
// @Produce json
// @Param period query string false "Time period for statistics (day, week, month, year)"
// @Param include_inactive query bool false "Include inactive users in statistics"
// @Success 200 {object} map[string]interface{} "User statistics"
// @Failure 400 {object} ErrorResponse "Invalid query parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/stats [get]
// @Security BearerAuth
func (h *UserHandler) GetUserStats(c *gin.Context) {
	var query request.UserStatsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid query parameters: " + err.Error(),
		})
		return
	}

	// Extract tenant_id from context
	tenantID := 0
	if tenantIDVal, exists := c.Get("tenant_id"); exists {
		tenantID, _ = tenantIDVal.(int)
	}

	utils.Infof("UserHandler.GetUserStats: Fetching stats for tenantID=%d", tenantID)

	stats, err := h.userService.GetUserStatistics(c.Request.Context(), query, tenantID)
	if err != nil {
		utils.Errorf("UserHandler.GetUserStats: Error getting user statistics for tenant %d: %v", tenantID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve user statistics.",
		})
		return
	}

	if stats == nil {
		utils.Warnf("UserHandler.GetUserStats: Service returned nil stats for tenant %d", tenantID)
		stats = &response.UserStatsResponse{
			GeneratedAt: time.Now(),
		}
	}

	utils.Infof("UserHandler.GetUserStats: Stats retrieved successfully for tenant %d. Total: %d", tenantID, stats.Total)

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   stats,
	})
}

// GetManagers godoc
// @Summary Get list of managers
// @Description Retrieves a paginated list of users who are managers
// @Tags users
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Number of items per page" default(10)
// @Param search query string false "Search term for manager name or email"
// @Param department_id query int false "Filter by department ID"
// @Success 200 {object} response.ManagerListResponse "List of managers"
// @Failure 400 {object} ErrorResponse "Invalid query parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 403 {object} ErrorResponse "Forbidden"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /users/managers [get]
// @Security BearerAuth
func (h *UserHandler) GetManagers(c *gin.Context) {
	// Get pagination from context (set by PaginationMiddleware)
	paginationObj := pagination.Get(c)

	// Create query with pagination and search parameters
	var query request.GetManagersQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid query parameters: " + err.Error(),
		})
		return
	}

	// Override query pagination with middleware pagination
	query.Page = paginationObj.GetPage()
	query.Limit = paginationObj.GetPageSize()

	//  FIXED: Changed from "userID" to "user_id" to match middleware
	actorIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Warn("UserHandler.GetManagers: actorID not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "Unauthorized: Actor identity not found.",
		})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("UserHandler.GetManagers: actorID in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Error processing actor identity.",
		})
		return
	}

	managerListResponse, err := h.userService.GetManagers(c.Request.Context(), query, actorID)
	if err != nil {
		utils.Errorf("UserHandler.GetManagers: Error getting managers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to retrieve managers.",
		})
		return
	}

	// Return standardized response format
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   managerListResponse,
	})
}
