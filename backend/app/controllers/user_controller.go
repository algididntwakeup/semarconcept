// platform/backend/app/controllers/user_controller.go

package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"backend/app/models"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	userService    *services.UserService
	rbacRepository repositories.UserRoleRepository //  ADDED: RBAC repository for role assignment
	db             *gorm.DB
}

//  UPDATED: Constructor now accepts rbac repository
func NewUserController(userService *services.UserService, rbacRepository repositories.UserRoleRepository, db *gorm.DB) *UserController {
	return &UserController{
		userService:    userService,
		rbacRepository: rbacRepository, //  ADDED: Store rbac repository
		db:             db,
	}
}

// GetUsers handles GET /api/v1/users with complete GORM role loading
func (uc *UserController) GetUsers(c *gin.Context) {
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")
	role := c.Query("role")

	utils.Infof("UserController.GetUsers called - page: %d, limit: %d, search: '%s', status: '%s', role: '%s'",
		page, limit, search, status, role)

	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Calculate offset
	offset := (page - 1) * limit

	//  ENHANCED: Query users with GORM including complete role relationships
	var users []models.User
	var total int64

	// Start with base query including role preloading
	query := uc.db.Model(&models.User{}).Preload("Roles").Preload("Roles.Permissions")

	// Add search filter if provided
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where(
			"first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ? OR username ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Add status filter if provided
	if status != "" && status != "all" {
		switch status {
		case "active":
			query = query.Where("is_active = ?", true)
		case "inactive":
			query = query.Where("is_active = ?", false)
		case "admin":
			query = query.Where("is_admin = ?", true)
		case "superuser":
			query = query.Where("is_superuser = ?", true)
		}
	}

	// Add role filter if provided
	if role != "" && role != "all" {
		query = query.Joins("JOIN user_roles ON user_roles.user_id = users.id").
			Joins("JOIN roles ON roles.id = user_roles.role_id").
			Where("roles.name = ?", role)
	}

	// Get total count before applying pagination
	countQuery := query.Session(&gorm.Session{})
	if err := countQuery.Count(&total).Error; err != nil {
		utils.Errorf("Error counting users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to count users",
			"error":   err.Error(),
		})
		return
	}

	// Get users with pagination and ensure distinct results (in case of joins)
	if err := query.Distinct("users.*").Limit(limit).Offset(offset).Order("users.created_at DESC").Find(&users).Error; err != nil {
		utils.Errorf("Error fetching users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch users",
			"error":   err.Error(),
		})
		return
	}

	//  FIXED: Convert to detailed response format with role information
	userResponses := make([]response.UserResponse, len(users))
	for i, user := range users {
		// Convert roles to response format
		roleResponses := make([]response.RoleBase, len(user.Roles))
		for j, role := range user.Roles {
			roleResponses[j] = response.RoleBase{
				ID:   role.ID,
				Name: role.Name,
				Code: role.Code,
			}
		}

		// Create comprehensive user response
		userResponses[i] = response.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			FirstName:   &user.FirstName,
			LastName:    &user.LastName,
			FullName:    user.GetFullName(),
			IsActive:    user.IsActive,
			IsSuperuser: user.IsSuperuser,
			IsAdmin:     user.IsAdmin,
			LastLogin:   user.LastLogin,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			Roles:       roleResponses,
		}
	}

	// Calculate pagination info
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	hasNext := page < totalPages
	hasPrev := page > 1

	utils.Infof("UserController.GetUsers success - returned %d users, total: %d, with roles loaded", len(users), total)

	// Return structured response
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"users": userResponses,
		},
		"pagination": gin.H{
			"total":       total,
			"page":        page,
			"page_size":   limit,
			"total_pages": totalPages,
			"has_next":    hasNext,
			"has_prev":    hasPrev,
		},
		"meta": gin.H{
			"query": gin.H{
				"search": search,
				"status": status,
				"role":   role,
			},
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		},
	})
}

// GetUser handles GET /api/v1/users/:id with complete role loading
func (uc *UserController) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid user ID",
		})
		return
	}

	utils.Infof("UserController.GetUser called for ID: %d", id)

	//  ENHANCED: Load user with complete role and permission details
	var user models.User
	if err := uc.db.Preload("Roles").Preload("Roles.Permissions").Preload("Tenant").Preload("Department").First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "User not found",
			})
			return
		}
		utils.Errorf("Error fetching user %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch user",
			"error":   err.Error(),
		})
		return
	}

	//  FIXED: Convert roles to simple RoleBase format (matching UserResponse.Roles type)
	roleResponses := make([]response.RoleBase, len(user.Roles))
	for i, role := range user.Roles {
		roleResponses[i] = response.RoleBase{
			ID:   role.ID,
			Name: role.Name,
			Code: role.Code,
		}
	}

	//  FIXED: Create user response using UserResponse (not UserDetailResponse)
	userResponse := response.UserResponse{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		FirstName:   &user.FirstName,
		LastName:    &user.LastName,
		FullName:    user.GetFullName(),
		IsActive:    user.IsActive,
		IsSuperuser: user.IsSuperuser,
		IsAdmin:     user.IsAdmin,
		LastLogin:   user.LastLogin,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
		Roles:       roleResponses,
	}

	utils.Infof("UserController.GetUser success - user: %s with %d roles", user.Username, len(user.Roles))

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   userResponse,
	})
}

//  CRITICAL FIX: CreateUser - Uses RBAC repository instead of GORM Association
func (uc *UserController) CreateUser(c *gin.Context) {
	var req struct {
		Username    string `json:"username" binding:"required"`
		Email       string `json:"email" binding:"required,email"`
		FirstName   string `json:"first_name" binding:"required"`
		LastName    string `json:"last_name" binding:"required"`
		Password    string `json:"password" binding:"required,min=8"`
		IsActive    *bool  `json:"is_active"`
		IsSuperuser *bool  `json:"is_superuser"`
		IsAdmin     *bool  `json:"is_admin"`
		TenantID    *int   `json:"tenant_id"`
		RoleIDs     []int  `json:"role_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request data",
			"errors":  err.Error(),
		})
		return
	}

	utils.Infof("🆕 UserController.CreateUser called for: %s", req.Username)

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.Errorf("Error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to process password",
		})
		return
	}

	// Create user with default values
	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		IsActive:     true,
		IsSuperuser:  false,
		IsAdmin:      false,
		TenantID:     1, // Default tenant
	}

	// Apply optional fields
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.IsSuperuser != nil {
		user.IsSuperuser = *req.IsSuperuser
	}
	if req.IsAdmin != nil {
		user.IsAdmin = *req.IsAdmin
	}
	if req.TenantID != nil && *req.TenantID > 0 {
		user.TenantID = *req.TenantID
	}

	// Start database transaction
	tx := uc.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create user
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		utils.Errorf("Error creating user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create user",
			"error":   err.Error(),
		})
		return
	}

	//  CRITICAL FIX: Assign roles using RBAC repository instead of GORM Association
	if len(req.RoleIDs) > 0 {
		// Validate roles exist
		var roleCount int64
		if err := tx.Model(&models.Role{}).Where("id IN ?", req.RoleIDs).Count(&roleCount).Error; err != nil {
			tx.Rollback()
			utils.Errorf("Error validating roles: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to validate roles",
			})
			return
		}

		if int(roleCount) != len(req.RoleIDs) {
			tx.Rollback()
			utils.Errorf("Some roles not found: expected %d, found %d", len(req.RoleIDs), roleCount)
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Some roles not found",
			})
			return
		}

		// Commit user creation first
		if err := tx.Commit().Error; err != nil {
			utils.Errorf("Error committing user creation: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to create user",
			})
			return
		}

		//  NEW: Use RBAC repository to assign roles (includes tenant_id properly)
		ctx := context.Background()
		for _, roleID := range req.RoleIDs {
			if err := uc.rbacRepository.AssignRoleToUser(ctx, user.ID, roleID); err != nil {
				utils.Errorf("Error assigning role %d to user %d: %v", roleID, user.ID, err)
				// Continue with other roles instead of failing completely
				utils.Warnf("Skipping role assignment %d->%d due to error", roleID, user.ID)
			} else {
				utils.Infof("Successfully assigned role %d to user %d with tenant_id", roleID, user.ID)
			}
		}
	} else {
		// Commit transaction if no roles to assign
		if err := tx.Commit().Error; err != nil {
			utils.Errorf("Error committing user creation transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to complete user creation",
			})
			return
		}
	}

	// Reload user with roles for response
	uc.db.Preload("Roles").First(&user, user.ID)

	utils.Infof("User created successfully: %s (ID: %d) with %d roles", user.Username, user.ID, len(user.Roles))

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"data":    user,
		"message": "User created successfully",
	})
}

//  UPDATED: UpdateUser - Uses RBAC repository for role management
func (uc *UserController) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid user ID",
		})
		return
	}

	var req struct {
		Email       *string `json:"email"`
		FirstName   *string `json:"first_name"`
		LastName    *string `json:"last_name"`
		IsActive    *bool   `json:"is_active"`
		IsSuperuser *bool   `json:"is_superuser"`
		IsAdmin     *bool   `json:"is_admin"`
		Password    *string `json:"password"`
		RoleIDs     *[]int  `json:"role_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request data",
			"errors":  err.Error(),
		})
		return
	}

	utils.Infof("UserController.UpdateUser called for ID: %d", id)

	// Start transaction
	tx := uc.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find user
	var user models.User
	if err := tx.First(&user, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch user",
		})
		return
	}

	// Update fields if provided
	updates := make(map[string]interface{})
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.FirstName != nil {
		updates["first_name"] = *req.FirstName
	}
	if req.LastName != nil {
		updates["last_name"] = *req.LastName
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}
	if req.IsSuperuser != nil {
		updates["is_superuser"] = *req.IsSuperuser
	}
	if req.IsAdmin != nil {
		updates["is_admin"] = *req.IsAdmin
	}
	if req.Password != nil && *req.Password != "" {
		hashedPassword, err := utils.HashPassword(*req.Password)
		if err != nil {
			tx.Rollback()
			utils.Errorf("Error hashing password: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to process password",
			})
			return
		}
		updates["password_hash"] = hashedPassword
	}

	// Apply updates
	if len(updates) > 0 {
		if err := tx.Model(&user).Updates(updates).Error; err != nil {
			tx.Rollback()
			utils.Errorf("Error updating user %d: %v", id, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to update user",
				"error":   err.Error(),
			})
			return
		}
	}

	// Commit user updates first
	if err := tx.Commit().Error; err != nil {
		utils.Errorf("Error committing user update transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to complete user update",
		})
		return
	}

	//  CRITICAL FIX: Update roles using RBAC repository if provided
	if req.RoleIDs != nil {
		ctx := context.Background()

		// Get current roles to determine what to remove/add
		currentRoles, err := uc.rbacRepository.FindRolesByUserID(ctx, user.ID)
		if err != nil {
			utils.Errorf("Error getting current user roles: %v", err)
		} else {
			// Remove current roles
			for _, role := range currentRoles {
				if err := uc.rbacRepository.RemoveRoleFromUser(ctx, user.ID, role.ID); err != nil {
					utils.Warnf("Error removing role %d from user %d: %v", role.ID, user.ID, err)
				}
			}
		}

		// Add new roles
		if len(*req.RoleIDs) > 0 {
			for _, roleID := range *req.RoleIDs {
				if err := uc.rbacRepository.AssignRoleToUser(ctx, user.ID, roleID); err != nil {
					utils.Errorf("Error assigning role %d to user %d: %v", roleID, user.ID, err)
					// Continue with other roles instead of failing completely
					utils.Warnf("Skipping role assignment %d->%d due to error", roleID, user.ID)
				} else {
					utils.Infof("Successfully assigned role %d to user %d with tenant_id", roleID, user.ID)
				}
			}
		}
	}

	// Reload user with roles for response
	uc.db.Preload("Roles").First(&user, user.ID)

	utils.Infof("User updated successfully: %s (ID: %d) with %d roles", user.Username, user.ID, len(user.Roles))

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    user,
		"message": "User updated successfully",
	})
}

// DeleteUser handles DELETE /api/v1/users/:id with proper cleanup
func (uc *UserController) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid user ID",
		})
		return
	}

	utils.Infof("UserController.DeleteUser called for ID: %d", id)

	// Start transaction
	tx := uc.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if user exists
	var user models.User
	if err := tx.First(&user, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch user",
		})
		return
	}

	//  FIXED: Remove all role associations using RBAC repository
	ctx := context.Background()
	if currentRoles, err := uc.rbacRepository.FindRolesByUserID(ctx, user.ID); err == nil {
		for _, role := range currentRoles {
			if err := uc.rbacRepository.RemoveRoleFromUser(ctx, user.ID, role.ID); err != nil {
				utils.Warnf("Error removing role %d from user %d during deletion: %v", role.ID, user.ID, err)
			}
		}
	}

	// Delete user (soft delete if DeletedAt field exists)
	if err := tx.Delete(&user).Error; err != nil {
		tx.Rollback()
		utils.Errorf("Error deleting user %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete user",
			"error":   err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		utils.Errorf("Error committing user deletion transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to complete user deletion",
		})
		return
	}

	utils.Infof("User deleted successfully: %s (ID: %d)", user.Username, id)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User deleted successfully",
		"data": gin.H{
			"deleted_user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"email":    user.Email,
			},
		},
	})
}

//  NEW: GetUserStats method with proper context authentication
// GetUserStats handles GET /api/v1/users/stats with proper authentication context
func (uc *UserController) GetUserStats(c *gin.Context) {
	//  FIXED: Extract actor ID from context using correct key from middleware
	actorIDVal, exists := c.Get("user_id") // Use "user_id" to match middleware
	if !exists {
		utils.Warn("UserController.GetUserStats: user_id not found in context.")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized: Actor identity not found.",
			"code":    "MISSING_USER_CONTEXT",
		})
		return
	}

	actorID, ok := actorIDVal.(int)
	if !ok {
		utils.Errorf("UserController.GetUserStats: user_id in context is not of type int. Value: %v", actorIDVal)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Error processing actor identity.",
			"code":    "INVALID_USER_CONTEXT",
		})
		return
	}

	utils.Infof("UserController.GetUserStats called by actor ID: %d", actorID)

	// Calculate user statistics from database
	var stats struct {
		Total        int64                  `json:"total"`
		Active       int64                  `json:"active"`
		Inactive     int64                  `json:"inactive"`
		Admins       int64                  `json:"admins"`
		NewThisMonth int64                  `json:"new_this_month"`
		ByDepartment map[string]interface{} `json:"by_department"`
		ByRole       map[string]interface{} `json:"by_role"`
	}

	// Get total users
	uc.db.Model(&models.User{}).Count(&stats.Total)

	// Get active/inactive counts
	uc.db.Model(&models.User{}).Where("is_active = ?", true).Count(&stats.Active)
	uc.db.Model(&models.User{}).Where("is_active = ?", false).Count(&stats.Inactive)

	// Get admin count
	uc.db.Model(&models.User{}).Where("is_admin = ? OR is_superuser = ?", true, true).Count(&stats.Admins)

	// Get new users this month
	firstDayOfMonth := time.Now().UTC().Format("2006-01-02")
	uc.db.Model(&models.User{}).Where("created_at >= ?", firstDayOfMonth).Count(&stats.NewThisMonth)

	// Initialize maps
	stats.ByDepartment = make(map[string]interface{})
	stats.ByRole = make(map[string]interface{})

	// Get department distribution
	var deptStats []struct {
		DepartmentName string `json:"department_name"`
		UserCount      int    `json:"user_count"`
	}
	uc.db.Raw(`
		SELECT d.name as department_name, COUNT(u.id) as user_count 
		FROM users u 
		LEFT JOIN departments d ON u.department_id = d.id 
		WHERE u.deleted_at IS NULL 
		GROUP BY d.name
	`).Scan(&deptStats)

	for _, dept := range deptStats {
		if dept.DepartmentName != "" {
			stats.ByDepartment[dept.DepartmentName] = dept.UserCount
		}
	}

	// Get role distribution
	var roleStats []struct {
		RoleName  string `json:"role_name"`
		UserCount int    `json:"user_count"`
	}
	uc.db.Raw(`
		SELECT r.name as role_name, COUNT(DISTINCT ur.user_id) as user_count
		FROM roles r
		LEFT JOIN user_roles ur ON r.id = ur.role_id
		WHERE r.deleted_at IS NULL
		GROUP BY r.name
	`).Scan(&roleStats)

	for _, role := range roleStats {
		stats.ByRole[role.RoleName] = role.UserCount
	}

	utils.Infof("UserController.GetUserStats success - Total: %d, Active: %d", stats.Total, stats.Active)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   stats,
		"meta": gin.H{
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"actor_id":  actorID,
		},
	})
}
