// platform/backend/app/services/user_service.go
//  COMPLETE FIXED VERSION with tenant context handling

package services

import (
	"backend/app/cache"
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/utils"
	"context"
	"errors"
	"fmt"
	"time"
)

// UserService provides user management related services.
type UserService struct {
	userRepo     repositories.UserRepository
	roleRepo     repositories.RoleRepository
	userRoleRepo repositories.UserRoleRepository
	cacheService *cache.Service
	// auditService AuditLogService // TODO: Add when AuditService is implemented
}

// NewUserService creates a new UserService instance.
func NewUserService(
	userRepo repositories.UserRepository,
	roleRepo repositories.RoleRepository,
	userRoleRepo repositories.UserRoleRepository,
	cacheService *cache.Service,
	// auditService AuditLogService,
) *UserService {
	return &UserService{
		userRepo:     userRepo,
		roleRepo:     roleRepo,
		userRoleRepo: userRoleRepo,
		cacheService: cacheService,
		// auditService: auditService,
	}
}

// CreateUser handles creation of a new user, typically by an administrator.
// Corresponds to FR-2.1
func (s *UserService) CreateUser(ctx context.Context, req request.CreateUserRequest, actorID int) (*response.UserResponse, error) {
	// 🚨 CRITICAL FIX: Validate tenant_id is provided
	if req.TenantID <= 0 {
		return nil, fmt.Errorf("tenant_id is required and must be greater than 0")
	}

	// Validate input (basic validation done by Gin binding)
	utils.Infof("UserService.CreateUser: Creating user %s for tenant_id=%d", req.Username, req.TenantID)

	// Check for existing username
	if _, err := s.userRepo.FindByUsername(ctx, req.Username); err == nil {
		return nil, fmt.Errorf("%w: username '%s' already exists", utils.ErrConflict, req.Username)
	} else if !errors.Is(err, utils.ErrUserNotFound) {
		utils.Errorf("UserService.CreateUser: Error checking username %s: %v", req.Username, err)
		return nil, fmt.Errorf("could not verify username existence: %w", err)
	}

	// Check for existing email
	if _, err := s.userRepo.FindByEmail(ctx, req.Email); err == nil {
		return nil, fmt.Errorf("%w: email '%s' already exists", utils.ErrConflict, req.Email)
	} else if !errors.Is(err, utils.ErrUserNotFound) {
		utils.Errorf("UserService.CreateUser: Error checking email %s: %v", req.Email, err)
		return nil, fmt.Errorf("could not verify email existence: %w", err)
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.Errorf("UserService.CreateUser: Error hashing password for %s: %v", req.Username, err)
		return nil, fmt.Errorf("failed to secure password: %w", err)
	}

	isActive := true // Default to true for admin creation
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	isSuperuser := false // Default to false
	if req.IsSuperuser != nil {
		isSuperuser = *req.IsSuperuser
	}
	isAdmin := false // Default to false
	if req.IsAdmin != nil {
		isAdmin = *req.IsAdmin
	}

	// 🚨 CRITICAL FIX: Include tenant_id and department_id in user creation
	newUser := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		IsActive:     isActive,
		IsAdmin:      isAdmin, // 🚨 FIX: Set IsAdmin field
		IsSuperuser:  isSuperuser,
		TenantID:     req.TenantID, // 🚨 CRITICAL FIX: Set tenant_id
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// 🚨 SURGICAL FIX: Set department_id if provided
	if req.DepartmentID != nil && *req.DepartmentID > 0 {
		newUser.DepartmentID = req.DepartmentID
		utils.Infof("UserService.CreateUser: Setting department_id=%d for user %s", *req.DepartmentID, req.Username)
	}

	createdUser, err := s.userRepo.Create(ctx, newUser)
	if err != nil {
		utils.Errorf("UserService.CreateUser: Error creating user %s in repository: %v", newUser.Username, err)
		return nil, fmt.Errorf("could not create user: %w", err)
	}
	newUser.ID = createdUser.ID // Set ID from the created user object

	// Assign roles
	assignedRoles := []response.RoleBase{}
	if len(req.RoleIDs) > 0 {
		for _, roleID := range req.RoleIDs {
			role, err := s.roleRepo.FindByID(ctx, roleID)
			if err != nil {
				utils.Warnf("UserService.CreateUser: Failed to find roleID %d for user %s: %v. Skipping role assignment.", roleID, newUser.Username, err)
				continue // Skip if role not found
			}
			err = s.userRoleRepo.AssignRoleToUser(ctx, newUser.ID, roleID)
			if err != nil {
				utils.Warnf("UserService.CreateUser: Failed to assign roleID %d to user %s: %v", roleID, newUser.Username, err)
				// Decide on error handling: continue, rollback, or return partial success with error
			} else {
				assignedRoles = append(assignedRoles, response.RoleBase{ID: role.ID, Name: role.Name, Code: role.Code})
			}
		}
	}

	// Invalidate user list cache
	s.cacheService.InvalidateByPrefix("users:list")

	// TODO: Log action via AuditService (FR-2.7)
	// s.auditService.Record(ctx, actorID, "admin_user_created", "user", newUser.ID, req)

	userDto := &response.UserResponse{
		ID:          newUser.ID,
		Username:    newUser.Username,
		Email:       newUser.Email,
		FirstName:   &newUser.FirstName,
		LastName:    &newUser.LastName,
		FullName:    newUser.GetFullName(),
		IsActive:    newUser.IsActive,
		IsAdmin:     newUser.IsAdmin, // 🚨 FIX: Include IsAdmin in response
		IsSuperuser: newUser.IsSuperuser,
		CreatedAt:   newUser.CreatedAt,
		UpdatedAt:   newUser.UpdatedAt,
		Roles:       assignedRoles,
	}
	utils.Infof("User '%s' (ID: %d) created successfully for tenant %d by actor %d.", newUser.Username, newUser.ID, req.TenantID, actorID)
	return userDto, nil
}

// GetUserByID retrieves a user by their ID.
// Corresponds to FR-2.1
func (s *UserService) GetUserByID(ctx context.Context, userID int) (*response.UserResponse, error) {
	// Generate cache key for the user
	cacheKey := s.cacheService.GenerateKey("user", userID)

	// Create a variable to hold the user response
	var userDto response.UserResponse

	// Try to get the user from cache
	err := s.cacheService.GetOrSet(cacheKey, &userDto, cache.DefaultExpiration, func() (interface{}, error) {
		// If not in cache, fetch from database
		user, err := s.userRepo.FindByID(ctx, userID)
		if err != nil {
			if errors.Is(err, utils.ErrUserNotFound) {
				return nil, utils.ErrUserNotFound // Return the specific error
			}
			utils.Errorf("UserService.GetUserByID: Error fetching user %d: %v", userID, err)
			return nil, fmt.Errorf("could not retrieve user: %w", err)
		}

		// Fetch user roles
		roles, err := s.userRoleRepo.FindRolesByUserID(ctx, userID)
		if err != nil {
			// Log the error but don't fail the entire request if roles can't be fetched
			utils.Warnf("UserService.GetUserByID: Error fetching roles for user %d: %v", userID, err)
		}

		assignedRoles := []response.RoleBase{}
		for _, r := range roles {
			assignedRoles = append(assignedRoles, response.RoleBase{ID: r.ID, Name: r.Name, Code: r.Code})
		}

		// Create the user response
		return response.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			FirstName:   &user.FirstName,
			LastName:    &user.LastName,
			FullName:    user.GetFullName(),
			IsActive:    user.IsActive,
			IsAdmin:     user.IsAdmin, // 🚨 FIX: Include IsAdmin in response
			IsSuperuser: user.IsSuperuser,
			LastLogin:   user.LastLogin,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			Roles:       assignedRoles,
		}, nil
	})

	if err != nil {
		return nil, err
	}

	return &userDto, nil
}

// GetUsers retrieves a paginated list of users.
// Corresponds to FR-2.1
func (s *UserService) GetUsers(ctx context.Context, query request.UserListQuery) (*response.UserListResponse, int64, error) {
	// Generate cache key for the user list
	params := map[string]interface{}{
		"page":   query.Page,
		"limit":  query.Limit,
		"search": query.Search,
	}
	cacheKey := s.cacheService.GenerateListKey("users", params)

	// Create variables to hold the response
	var userResponses []response.UserResponse
	var totalCount int64

	// Try to get the user list from cache
	err := s.cacheService.GetOrSet(cacheKey, &userResponses, cache.DefaultExpiration, func() (interface{}, error) {
		// If not in cache, fetch from database
		limit := query.Limit
		if limit <= 0 {
			limit = 10 // Default limit
		}
		offset := (query.Page - 1) * limit
		if offset < 0 {
			offset = 0
		}

		users, count, err := s.userRepo.List(ctx, limit, offset)
		if err != nil {
			utils.Errorf("UserService.GetUsers: Error listing users: %v", err)
			return nil, fmt.Errorf("could not retrieve users: %w", err)
		}

		// Store the total count for later use
		totalCount = count

		responses := make([]response.UserResponse, len(users))
		for i, user := range users {
			// Fetch roles for each user to include in the response
			roles, roleErr := s.userRoleRepo.FindRolesByUserID(ctx, user.ID)
			assignedRoles := []response.RoleBase{}
			if roleErr != nil {
				utils.Warnf("UserService.GetUsers: Error fetching roles for user %d: %v", user.ID, roleErr)
			} else {
				for _, r := range roles {
					assignedRoles = append(assignedRoles, response.RoleBase{ID: r.ID, Name: r.Name, Code: r.Code})
				}
			}

			responses[i] = response.UserResponse{
				ID:          user.ID,
				Username:    user.Username,
				Email:       user.Email,
				FirstName:   &user.FirstName,
				LastName:    &user.LastName,
				FullName:    user.GetFullName(),
				IsActive:    user.IsActive,
				IsAdmin:     user.IsAdmin, // 🚨 FIX: Include IsAdmin in response
				IsSuperuser: user.IsSuperuser,
				LastLogin:   user.LastLogin,
				CreatedAt:   user.CreatedAt,
				UpdatedAt:   user.UpdatedAt,
				Roles:       assignedRoles,
			}
		}

		return responses, nil
	})

	if err != nil {
		return nil, 0, err
	}

	return &response.UserListResponse{
		Users: userResponses,
	}, totalCount, nil
}

// GetAllUsers retrieves all users with pagination and filtering - NEW METHOD FOR HANDLER
func (s *UserService) GetAllUsers(ctx context.Context, tenantID, page, limit int, search, status, role string) (*response.UserListResponse, error) {
	//  FIXED: Ensure minimum values and log for debugging
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	utils.Infof("UserService.GetAllUsers: tenantID=%d, page=%d, limit=%d, search='%s'", tenantID, page, limit, search)

	users, total, err := s.userRepo.GetAllWithFilters(ctx, tenantID, page, limit, search, status, role)
	if err != nil {
		utils.Errorf("UserService.GetAllUsers: Repository error: %v", err)
		return nil, fmt.Errorf("failed to retrieve users: %w", err)
	}

	utils.Infof("UserService.GetAllUsers: Retrieved %d users, total=%d", len(users), total)

	userResponses := make([]response.UserResponse, len(users))
	for i, user := range users {
		// Get user roles
		roles, roleErr := s.userRoleRepo.FindRolesByUserID(ctx, user.ID)
		roleResponses := make([]response.RoleBase, 0)
		if roleErr != nil {
			utils.Warnf("UserService.GetAllUsers: Error fetching roles for user %d: %v", user.ID, roleErr)
		} else {
			roleResponses = make([]response.RoleBase, len(roles))
			for j, role := range roles {
				roleResponses[j] = response.RoleBase{
					ID:   role.ID,
					Name: role.Name,
					Code: role.Code,
				}
			}
		}

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

	//  FIXED: Calculate pagination info correctly with proper type handling
	totalInt := int(total)
	totalPages := 1
	if totalInt > 0 && limit > 0 {
		totalPages = (totalInt + limit - 1) / limit // Ceiling division
	}

	currentPage := page

	//  FIXED: Calculate from/to correctly
	from := 0
	to := 0
	if totalInt > 0 {
		from = (currentPage-1)*limit + 1
		to = currentPage * limit
		if to > totalInt {
			to = totalInt
		}
	}

	paginationResponse := response.PaginationResponse{
		Total:       totalInt,
		PerPage:     limit,
		CurrentPage: currentPage,
		LastPage:    totalPages,
		From:        from,
		To:          to,
	}

	utils.Infof("UserService.GetAllUsers: Pagination calculated - total=%d, pages=%d, current=%d, from=%d, to=%d",
		totalInt, totalPages, currentPage, from, to)

	return &response.UserListResponse{
		Users:      userResponses,
		Pagination: paginationResponse,
	}, nil
}

// UpdateUser updates an existing user's details.
// Corresponds to FR-2.1
func (s *UserService) UpdateUser(ctx context.Context, userID int, req request.UpdateUserRequest, actorID int) (*response.UserResponse, error) {
	// Get existing user
	existingUser, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("%w: user not found", utils.ErrUserNotFound)
	}

	// Check for conflicts if username or email is being updated
	if req.Username != nil && *req.Username != existingUser.Username {
		if _, err := s.userRepo.FindByUsername(ctx, *req.Username); err == nil {
			return nil, fmt.Errorf("%w: username '%s' already exists", utils.ErrConflict, *req.Username)
		}
	}

	if req.Email != nil && *req.Email != existingUser.Email {
		if _, err := s.userRepo.FindByEmail(ctx, *req.Email); err == nil {
			return nil, fmt.Errorf("%w: email '%s' already exists", utils.ErrConflict, *req.Email)
		}
	}

	// Update fields
	updates := make(map[string]interface{})
	if req.Username != nil {
		updates["username"] = *req.Username
	}
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
	if req.DepartmentID != nil {
		updates["department_id"] = *req.DepartmentID
	}
	if req.Password != nil {
		hashedPassword, err := utils.HashPassword(*req.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		updates["password_hash"] = hashedPassword
	}

	// 🚨 CRITICAL FIX: Remove redundant updated_at assignment
	// Let the database trigger handle updated_at automatically
	// updates["updated_at"] = time.Now() // ← REMOVED THIS LINE

	// Update user - Fixed: removed unused variable
	_, err = s.userRepo.UpdateByID(ctx, userID, updates)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Update roles if provided
	if req.RoleIDs != nil {
		// Remove existing roles
		currentRoles, findRolesErr := s.userRoleRepo.FindRolesByUserID(ctx, userID)
		if findRolesErr != nil {
			utils.Warnf("UserService.UpdateUser: Could not fetch current roles for user %d to update: %v", userID, findRolesErr)
		} else {
			for _, currentRole := range currentRoles {
				if err := s.userRoleRepo.RemoveRoleFromUser(ctx, userID, currentRole.ID); err != nil {
					utils.Warnf("UserService.UpdateUser: Failed to remove roleID %d from user %d: %v", currentRole.ID, userID, err)
				}
			}
		}

		// Assign new roles
		for _, roleID := range req.RoleIDs {
			_, err := s.roleRepo.FindByID(ctx, roleID)
			if err != nil {
				utils.Warnf("UserService.UpdateUser: Failed to find roleID %d for user %d: %v. Skipping role assignment.", roleID, userID, err)
				continue
			}
			if err := s.userRoleRepo.AssignRoleToUser(ctx, userID, roleID); err != nil {
				utils.Warnf("UserService.UpdateUser: Failed to assign roleID %d to user %d: %v", roleID, userID, err)
			}
		}
	}

	// Invalidate user cache
	s.cacheService.Delete(s.cacheService.GenerateKey("user", userID))
	// Invalidate user list cache
	s.cacheService.InvalidateByPrefix("users:list")

	// Get updated user with roles
	return s.GetUserByID(ctx, userID)
}

// DeleteUser handles deletion of a user by an administrator
func (s *UserService) DeleteUser(ctx context.Context, userID, actorID int) error {
	// Check if user exists
	_, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("%w: user not found", utils.ErrUserNotFound)
	}

	// Remove user role assignments first.
	currentRoles, findRolesErr := s.userRoleRepo.FindRolesByUserID(ctx, userID)
	if findRolesErr != nil {
		utils.Warnf("UserService.DeleteUser: Could not fetch current roles for user %d before deletion: %v", userID, findRolesErr)
	} else {
		for _, role := range currentRoles {
			if err := s.userRoleRepo.RemoveRoleFromUser(ctx, userID, role.ID); err != nil {
				utils.Warnf("UserService.DeleteUser: Failed to remove roleID %d from user %d during deletion: %v", role.ID, userID, err)
			}
		}
	}

	// Delete user
	if err := s.userRepo.DeleteByID(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	// Invalidate user cache
	s.cacheService.Delete(s.cacheService.GenerateKey("user", userID))
	// Invalidate user list cache
	s.cacheService.InvalidateByPrefix("users:list")

	return nil
}

// BulkDelete handles mass deletion of users (soft delete).
func (s *UserService) BulkDelete(ctx context.Context, ids []int, tenantID int) error {
	utils.Infof("UserService.BulkDelete: Bulk deleting %d users for tenant %d", len(ids), tenantID)

	// Directly call repository for bulk delete
	err := s.userRepo.BulkDelete(ctx, ids, tenantID)
	if err != nil {
		utils.Errorf("UserService.BulkDelete: Error bulk deleting users: %v", err)
		return fmt.Errorf("failed to bulk delete users: %w", err)
	}

	// Invalidate cache for all deleted users and list
	for _, id := range ids {
		s.cacheService.Delete(s.cacheService.GenerateKey("user", id))
	}
	s.cacheService.InvalidateByPrefix("users:list")

	return nil
}

// GetUserStatistics retrieves user statistics - NEW METHOD FOR HANDLER
func (s *UserService) GetUserStatistics(ctx context.Context, query request.UserStatsQuery, tenantID int) (*response.UserStatsResponse, error) {
	totalUsers, err := s.userRepo.GetTotalUsersCount(ctx, tenantID)
	if err != nil {
		utils.Errorf("UserService.GetUserStatistics: Error counting total users: %v", err)
		return nil, fmt.Errorf("failed to retrieve total user count")
	}

	activeUsers, err := s.userRepo.GetActiveUsersCount(ctx, tenantID)
	if err != nil {
		utils.Errorf("UserService.GetUserStatistics: Error counting active users: %v", err)
	}

	superusers, err := s.userRepo.GetSuperusersCount(ctx, tenantID)
	if err != nil {
		utils.Errorf("UserService.GetUserStatistics: Error counting superusers: %v", err)
	}

	admins, err := s.userRepo.GetAdminsCount(ctx, tenantID)
	if err != nil {
		utils.Errorf("UserService.GetUserStatistics: Error counting admins: %v", err)
	}

	recentLogins, err := s.userRepo.GetRecentLoginsCount(ctx, tenantID, 24)
	if err != nil {
		utils.Errorf("UserService.GetUserStatistics: Error counting recent logins: %v", err)
	}

	// Fetch department stats
	deptStats, _ := s.userRepo.GetUserCountByDepartment(ctx, tenantID)
	deptMap := make(map[string]int)
	for _, ds := range deptStats {
		deptMap[ds.DepartmentName] = ds.UserCount
	}

	// Fetch role stats
	roleStats, _ := s.userRepo.GetUserCountByRole(ctx, tenantID)
	roleMap := make(map[string]int)
	for _, rs := range roleStats {
		roleMap[rs.RoleName] = rs.UserCount
	}

	stats := &response.UserStatsResponse{
		Total:         int(totalUsers),
		Active:        int(activeUsers),
		Inactive:      int(totalUsers - activeUsers),
		Admins:        int(admins),
		Superusers:    int(superusers),
		RecentLogins:  int(recentLogins),
		ByDepartment:  deptMap,
		ByRole:        roleMap,
		GeneratedAt:   time.Now(),
	}

	return stats, nil
}

// GetManagers retrieves users who are managers - NEW METHOD FOR HANDLER
func (s *UserService) GetManagers(ctx context.Context, query request.GetManagersQuery, actorID int) (*response.ManagerListResponse, error) {
	// This would typically filter users by role or department
	// Implementation depends on your business logic

	managers, total, err := s.userRepo.GetManagersWithFilters(ctx, query.Page, query.Limit, query.Search, query.DepartmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve managers: %w", err)
	}

	managerResponses := make([]response.ManagerResponse, len(managers))
	for i, manager := range managers {
		managerResponses[i] = response.ManagerResponse{
			ID:           manager.ID,
			Username:     manager.Username,
			Email:        manager.Email,
			FirstName:    &manager.FirstName,
			LastName:     &manager.LastName,
			FullName:     manager.GetFullName(),
			DepartmentID: manager.DepartmentID,
			CreatedAt:    manager.CreatedAt,
			LastLogin:    manager.LastLogin,
		}
	}

	// Calculate pagination info
	totalPages := (total + query.Limit - 1) / query.Limit
	currentPage := query.Page

	return &response.ManagerListResponse{
		Managers: managerResponses,
		Pagination: response.PaginationResponse{
			Total:       total,
			PerPage:     query.Limit,
			CurrentPage: currentPage,
			LastPage:    totalPages,
			From:        (currentPage-1)*query.Limit + 1,
			To:          minUsers(currentPage*query.Limit, total),
		},
	}, nil
}

// Helper function - Fixed: renamed from min to minUsers to avoid redeclaration
func minUsers(a, b int) int {
	if a < b {
		return a
	}
	return b
}
