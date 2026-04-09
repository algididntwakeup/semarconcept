// platform/backend/app/services/permission_service.go

package services

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/utils"
	"context"
	"fmt"
	"time"
)

// PermissionServiceInterface defines the contract for permission service
type PermissionServiceInterface interface {
	CreatePermission(ctx context.Context, req *request.CreatePermissionRequest, tenantID, userID int) (*response.CreatePermissionResponse, error)
	UpdatePermission(ctx context.Context, id int, req *request.UpdatePermissionRequest, tenantID int) (*response.UpdatePermissionResponse, error)
	DeletePermission(ctx context.Context, id, tenantID int) (*response.DeletePermissionResponse, error)
	GetPermissionByID(ctx context.Context, id, tenantID int) (*response.PermissionResponse, error)
	GetAllPermissions(ctx context.Context, tenantID, page, limit int, search string) (*response.PermissionListResponse, error)
	GetPermissionByName(ctx context.Context, name string, tenantID int) (*models.Permission, error)
	InitializeDefaultPermissions(ctx context.Context, tenantID int) error
	BulkCreatePermissions(ctx context.Context, permissions []request.CreatePermissionRequest, tenantID, userID int) error
	//  NEW METHOD ADDED: Permission statistics
	GetPermissionStats(ctx context.Context, tenantID int) (map[string]interface{}, error)
	BulkDeletePermissions(ctx context.Context, ids []int, tenantID int) error
}

// PermissionService handles permission-related business logic
type PermissionService struct {
	permissionRepo repositories.PermissionRepositoryInterface
	logger         utils.Logger
}

// NewPermissionService creates a new PermissionService instance
func NewPermissionService(permissionRepo repositories.PermissionRepositoryInterface, logger utils.Logger) PermissionServiceInterface {
	return &PermissionService{
		permissionRepo: permissionRepo,
		logger:         logger,
	}
}

// CreatePermission creates a new permission
func (s *PermissionService) CreatePermission(ctx context.Context, req *request.CreatePermissionRequest, tenantID, userID int) (*response.CreatePermissionResponse, error) {
	s.logger.Info("Creating permission", map[string]interface{}{
		"name":      req.Name,
		"resource":  req.Resource,
		"action":    req.Action,
		"tenant_id": tenantID,
		"user_id":   userID,
	})

	// Check if permission already exists (use tenant-aware method)
	existing, _ := s.permissionRepo.GetByName(ctx, req.Name, tenantID)
	if existing != nil {
		s.logger.Warn("Permission already exists", map[string]interface{}{
			"name":      req.Name,
			"tenant_id": tenantID,
		})
		return nil, utils.ErrConflict
	}

	// Create permission with TenantID set
	newPermission := &models.Permission{
		Name:        req.Name,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
		Scope:       req.Scope,
		TenantID:    tenantID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Set default scope if not provided
	if newPermission.Scope == "" {
		newPermission.Scope = "tenant"
	}

	// Validate permission before creation
	if err := newPermission.Validate(); err != nil {
		s.logger.Error("Permission validation failed", err, map[string]interface{}{
			"name":      req.Name,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("permission validation failed: %w", err)
	}

	// Create permission using repository
	createdPermission, err := s.permissionRepo.Create(ctx, newPermission)
	if err != nil {
		s.logger.Error("Failed to create permission", err, map[string]interface{}{
			"name":      req.Name,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to create permission: %w", err)
	}

	s.logger.Info("Permission created successfully", map[string]interface{}{
		"id":        createdPermission.ID,
		"name":      createdPermission.Name,
		"tenant_id": tenantID,
	})

	return &response.CreatePermissionResponse{
		Permission: response.PermissionResponse{
			ID:          createdPermission.ID,
			Name:        createdPermission.Name,
			Description: createdPermission.Description,
			Resource:    createdPermission.Resource,
			Action:      createdPermission.Action,
			Scope:       createdPermission.Scope,
			CreatedAt:   createdPermission.CreatedAt,
			UpdatedAt:   createdPermission.UpdatedAt,
		},
		Message: "Permission created successfully",
	}, nil
}

// UpdatePermission updates an existing permission
func (s *PermissionService) UpdatePermission(ctx context.Context, id int, req *request.UpdatePermissionRequest, tenantID int) (*response.UpdatePermissionResponse, error) {
	s.logger.Info("Updating permission", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	// Get existing permission (use tenant-aware method)
	existing, err := s.permissionRepo.GetByIDAndTenant(ctx, id, tenantID)
	if err != nil {
		s.logger.Error("Failed to get permission for update", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, utils.ErrPermissionNotFound
	}

	// Create update data map and validate using model's ValidateForUpdate
	updateData := map[string]interface{}{}
	updated := false

	// Only update name if provided and different
	if req.Name != "" && req.Name != existing.Name {
		// Check if new name already exists
		existingByName, _ := s.permissionRepo.GetByName(ctx, req.Name, tenantID)
		if existingByName != nil && existingByName.ID != id {
			return nil, fmt.Errorf("permission with name '%s' already exists", req.Name)
		}
		updateData["name"] = req.Name
		updated = true
	}

	// Always allow description updates (including empty descriptions)
	if req.Description != existing.Description {
		updateData["description"] = req.Description
		updated = true
	}

	// Only update resource if provided and different
	if req.Resource != "" && req.Resource != existing.Resource {
		updateData["resource"] = req.Resource
		updated = true
	}

	// Only update action if provided and different
	if req.Action != "" && req.Action != existing.Action {
		updateData["action"] = req.Action
		updated = true
	}

	// Only update scope if provided and different
	if req.Scope != "" && req.Scope != existing.Scope {
		updateData["scope"] = req.Scope
		updated = true
	}

	if !updated {
		// No changes to update
		return &response.UpdatePermissionResponse{
			Permission: response.PermissionResponse{
				ID:          existing.ID,
				Name:        existing.Name,
				Description: existing.Description,
				Resource:    existing.Resource,
				Action:      existing.Action,
				Scope:       existing.Scope,
				CreatedAt:   existing.CreatedAt,
				UpdatedAt:   existing.UpdatedAt,
			},
			Message: "No changes to update",
		}, nil
	}

	// Use model's ValidateForUpdate method instead of full validation
	tempPermission := &models.Permission{}
	if err := tempPermission.ValidateForUpdate(updateData); err != nil {
		s.logger.Error("Permission update validation failed", err, map[string]interface{}{
			"id":          id,
			"tenant_id":   tenantID,
			"update_data": updateData,
		})
		return nil, fmt.Errorf("permission validation failed: %w", err)
	}

	updateData["updated_at"] = time.Now()

	// Update using repository
	updatedPermission, err := s.permissionRepo.Update(ctx, id, updateData)
	if err != nil {
		s.logger.Error("Failed to update permission", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to update permission: %w", err)
	}

	s.logger.Info("Permission updated successfully", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	return &response.UpdatePermissionResponse{
		Permission: response.PermissionResponse{
			ID:          updatedPermission.ID,
			Name:        updatedPermission.Name,
			Description: updatedPermission.Description,
			Resource:    updatedPermission.Resource,
			Action:      updatedPermission.Action,
			Scope:       updatedPermission.Scope,
			CreatedAt:   updatedPermission.CreatedAt,
			UpdatedAt:   updatedPermission.UpdatedAt,
		},
		Message: "Permission updated successfully",
	}, nil
}

// DeletePermission deletes a permission
func (s *PermissionService) DeletePermission(ctx context.Context, id, tenantID int) (*response.DeletePermissionResponse, error) {
	s.logger.Info("Deleting permission", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	// Check if permission exists (use tenant-aware method)
	existing, err := s.permissionRepo.GetByIDAndTenant(ctx, id, tenantID)
	if err != nil {
		s.logger.Error("Failed to get permission for deletion", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, utils.ErrPermissionNotFound
	}

	// Delete the permission
	err = s.permissionRepo.Delete(ctx, id)
	if err != nil {
		s.logger.Error("Failed to delete permission", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to delete permission: %w", err)
	}

	s.logger.Info("Permission deleted successfully", map[string]interface{}{
		"id":        id,
		"name":      existing.Name,
		"tenant_id": tenantID,
	})

	return &response.DeletePermissionResponse{
		Message: "Permission deleted successfully",
	}, nil
}

func (s *PermissionService) BulkDeletePermissions(ctx context.Context, ids []int, tenantID int) error {
	s.logger.Info("Bulk deleting permissions", map[string]interface{}{
		"ids":       ids,
		"tenant_id": tenantID,
	})

	if len(ids) == 0 {
		return nil
	}

	err := s.permissionRepo.BulkDelete(ctx, ids, tenantID)
	if err != nil {
		s.logger.Error("Failed to bulk delete permissions", err, map[string]interface{}{
			"tenant_id": tenantID,
		})
		return fmt.Errorf("failed to bulk delete permissions: %w", err)
	}

	s.logger.Info("Permissions bulk deleted successfully", map[string]interface{}{
		"count":     len(ids),
		"tenant_id": tenantID,
	})

	return nil
}

// GetPermissionByID retrieves a permission by ID
func (s *PermissionService) GetPermissionByID(ctx context.Context, id, tenantID int) (*response.PermissionResponse, error) {
	s.logger.Info("Getting permission by ID", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	// Use tenant-aware method
	permission, err := s.permissionRepo.GetByIDAndTenant(ctx, id, tenantID)
	if err != nil {
		s.logger.Error("Failed to get permission by ID", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, utils.ErrPermissionNotFound
	}

	return &response.PermissionResponse{
		ID:          permission.ID,
		Name:        permission.Name,
		Description: permission.Description,
		Resource:    permission.Resource,
		Action:      permission.Action,
		Scope:       permission.Scope,
		CreatedAt:   permission.CreatedAt,
		UpdatedAt:   permission.UpdatedAt,
	}, nil
}

// GetAllPermissions retrieves all permissions with pagination
func (s *PermissionService) GetAllPermissions(ctx context.Context, tenantID, page, limit int, search string) (*response.PermissionListResponse, error) {
	s.logger.Info("Getting all permissions", map[string]interface{}{
		"tenant_id": tenantID,
		"page":      page,
		"limit":     limit,
		"search":    search,
	})

	// Use tenant-aware method
	permissions, total, err := s.permissionRepo.GetAllByTenant(ctx, tenantID, page, limit, search)
	if err != nil {
		s.logger.Error("Failed to get all permissions", err, map[string]interface{}{
			"tenant_id": tenantID,
			"page":      page,
			"limit":     limit,
		})
		return nil, fmt.Errorf("failed to retrieve permissions: %w", err)
	}

	permissionResponses := make([]response.PermissionResponse, len(permissions))
	for i, permission := range permissions {
		permissionResponses[i] = response.PermissionResponse{
			ID:          permission.ID,
			Name:        permission.Name,
			Description: permission.Description,
			Resource:    permission.Resource,
			Action:      permission.Action,
			Scope:       permission.Scope,
			CreatedAt:   permission.CreatedAt,
			UpdatedAt:   permission.UpdatedAt,
		}
	}

	// Calculate pagination info
	totalPages := (total + limit - 1) / limit
	currentPage := page

	return &response.PermissionListResponse{
		Permissions: permissionResponses,
		Pagination: response.PaginationResponse{
			Total:       total,
			PerPage:     limit,
			CurrentPage: currentPage,
			LastPage:    totalPages,
			From:        (currentPage-1)*limit + 1,
			To:          min(currentPage*limit, total),
		},
	}, nil
}

// GetPermissionByName retrieves a permission by name
func (s *PermissionService) GetPermissionByName(ctx context.Context, name string, tenantID int) (*models.Permission, error) {
	s.logger.Info("Getting permission by name", map[string]interface{}{
		"name":      name,
		"tenant_id": tenantID,
	})

	permission, err := s.permissionRepo.GetByName(ctx, name, tenantID)
	if err != nil {
		s.logger.Error("Failed to get permission by name", err, map[string]interface{}{
			"name":      name,
			"tenant_id": tenantID,
		})
		return nil, utils.ErrPermissionNotFound
	}

	return permission, nil
}

//  NEW METHOD: GetPermissionStats - SURGICAL ADD
func (s *PermissionService) GetPermissionStats(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	s.logger.Info("Getting permission statistics", map[string]interface{}{
		"tenant_id": tenantID,
	})

	// Get statistics from repository
	stats, err := s.permissionRepo.GetPermissionStats(ctx, tenantID)
	if err != nil {
		s.logger.Error("Failed to get permission statistics", err, map[string]interface{}{
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to get permission statistics: %w", err)
	}

	s.logger.Info("Permission statistics retrieved successfully", map[string]interface{}{
		"tenant_id": tenantID,
		"stats":     stats,
	})

	return stats, nil
}

// InitializeDefaultPermissions creates default system permissions for a tenant
func (s *PermissionService) InitializeDefaultPermissions(ctx context.Context, tenantID int) error {
	s.logger.Info("Initializing default permissions", map[string]interface{}{
		"tenant_id": tenantID,
	})

	defaultPermissions := getDefaultSystemPermissions()

	for _, permission := range defaultPermissions {
		// Check if permission already exists
		existing, _ := s.permissionRepo.GetByName(ctx, permission.Name, tenantID)
		if existing != nil {
			s.logger.Info("Permission already exists, skipping", map[string]interface{}{
				"name":      permission.Name,
				"tenant_id": tenantID,
			})
			continue // Skip if already exists
		}

		// Set tenant_id for default permissions
		permission.TenantID = tenantID
		permission.CreatedAt = time.Now()
		permission.UpdatedAt = time.Now()

		_, err := s.permissionRepo.Create(ctx, &permission)
		if err != nil {
			s.logger.Error("Failed to create default permission", err, map[string]interface{}{
				"permission_name": permission.Name,
				"tenant_id":       tenantID,
			})
			// Continue with other permissions even if one fails
		} else {
			s.logger.Info("Created default permission", map[string]interface{}{
				"permission_name": permission.Name,
				"tenant_id":       tenantID,
			})
		}
	}

	s.logger.Info("Default permissions initialized", map[string]interface{}{
		"tenant_id": tenantID,
		"count":     len(defaultPermissions),
	})

	return nil
}

// BulkCreatePermissions creates multiple permissions in bulk
func (s *PermissionService) BulkCreatePermissions(ctx context.Context, permissions []request.CreatePermissionRequest, tenantID, userID int) error {
	s.logger.Info("Bulk creating permissions", map[string]interface{}{
		"count":     len(permissions),
		"tenant_id": tenantID,
		"user_id":   userID,
	})

	for _, req := range permissions {
		// Check if permission already exists
		existing, _ := s.permissionRepo.GetByName(ctx, req.Name, tenantID)
		if existing != nil {
			s.logger.Warn("Permission already exists, skipping", map[string]interface{}{
				"name":      req.Name,
				"tenant_id": tenantID,
			})
			continue
		}

		// Add TenantID to bulk permission creation
		newPermission := &models.Permission{
			Name:        req.Name,
			Description: req.Description,
			Resource:    req.Resource,
			Action:      req.Action,
			Scope:       req.Scope,
			TenantID:    tenantID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// Set default scope if not provided
		if newPermission.Scope == "" {
			newPermission.Scope = "tenant"
		}

		// Validate permission
		if err := newPermission.Validate(); err != nil {
			s.logger.Error("Permission validation failed during bulk create", err, map[string]interface{}{
				"name":      req.Name,
				"tenant_id": tenantID,
			})
			continue
		}

		_, err := s.permissionRepo.Create(ctx, newPermission)
		if err != nil {
			s.logger.Error("Failed to create permission during bulk create", err, map[string]interface{}{
				"name":      req.Name,
				"tenant_id": tenantID,
			})
			continue
		}

		s.logger.Info("Created permission during bulk create", map[string]interface{}{
			"name":      req.Name,
			"tenant_id": tenantID,
		})
	}

	return nil
}

// Helper function
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// getDefaultSystemPermissions returns the default system permissions
func getDefaultSystemPermissions() []models.Permission {
	return []models.Permission{
		// User management permissions
		{Name: "users.create", Description: "Create users", Resource: "users", Action: "create", Scope: "tenant"},
		{Name: "users.read", Description: "View users", Resource: "users", Action: "read", Scope: "tenant"},
		{Name: "users.update", Description: "Update users", Resource: "users", Action: "update", Scope: "tenant"},
		{Name: "users.delete", Description: "Delete users", Resource: "users", Action: "delete", Scope: "tenant"},
		{Name: "users.list", Description: "List users", Resource: "users", Action: "list", Scope: "tenant"},

		// Role management permissions
		{Name: "roles.create", Description: "Create roles", Resource: "roles", Action: "create", Scope: "tenant"},
		{Name: "roles.read", Description: "View roles", Resource: "roles", Action: "read", Scope: "tenant"},
		{Name: "roles.update", Description: "Update roles", Resource: "roles", Action: "update", Scope: "tenant"},
		{Name: "roles.delete", Description: "Delete roles", Resource: "roles", Action: "delete", Scope: "tenant"},
		{Name: "roles.list", Description: "List roles", Resource: "roles", Action: "list", Scope: "tenant"},

		// Permission management permissions
		{Name: "permissions.create", Description: "Create permissions", Resource: "permissions", Action: "create", Scope: "tenant"},
		{Name: "permissions.read", Description: "View permissions", Resource: "permissions", Action: "read", Scope: "tenant"},
		{Name: "permissions.update", Description: "Update permissions", Resource: "permissions", Action: "update", Scope: "tenant"},
		{Name: "permissions.delete", Description: "Delete permissions", Resource: "permissions", Action: "delete", Scope: "tenant"},
		{Name: "permissions.list", Description: "List permissions", Resource: "permissions", Action: "list", Scope: "tenant"},

		// Dashboard permissions
		{Name: "dashboard.view", Description: "View dashboard", Resource: "dashboard", Action: "view", Scope: "tenant"},
		{Name: "dashboard.admin", Description: "Administer dashboard", Resource: "dashboard", Action: "admin", Scope: "tenant"},

		// Admin permissions
		{Name: "admin.system", Description: "System administration", Resource: "admin", Action: "system", Scope: "global"},
		{Name: "admin.tenant", Description: "Tenant administration", Resource: "admin", Action: "tenant", Scope: "tenant"},
	}
}
