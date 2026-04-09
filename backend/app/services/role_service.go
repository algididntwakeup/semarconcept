// platform/backend/app/services/role_service.go
package services

import (
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

type RoleServiceInterface interface {
	GetAllRoles(ctx context.Context, tenantID int, page, limit int, search string) (*response.RoleListResponse, error)
	GetRoleByID(ctx context.Context, id, tenantID int) (*response.RoleResponse, error)
	CreateRole(ctx context.Context, req *request.CreateRoleRequest, tenantID, userID int) (*response.CreateRoleResponse, error)
	UpdateRole(ctx context.Context, id int, req *request.UpdateRoleRequest, tenantID int) (*response.UpdateRoleResponse, error)
	DeleteRole(ctx context.Context, id, tenantID int) (*response.DeleteRoleResponse, error)
	GetRoleStats(ctx context.Context, tenantID int) (*response.RoleStatsResponse, error)
	ValidateRoleName(ctx context.Context, name string, tenantID int, excludeID *int) (*response.RoleValidationResponse, error)
	//  ADDED: ValidateRoleCode method to interface
	ValidateRoleCode(ctx context.Context, code string, tenantID int, excludeID *int) (bool, error)
	InitializeDefaultRoles(ctx context.Context, tenantID int) error
	BulkCreateRoles(ctx context.Context, roles []request.CreateRoleRequest, tenantID, userID int) error
	GetRolePermissions(ctx context.Context, roleID, tenantID int) ([]response.PermissionResponse, error)
	AssignPermissionToRole(ctx context.Context, roleID, permissionID, tenantID int) error
	RevokePermissionFromRole(ctx context.Context, roleID, permissionID, tenantID int) error
	BulkDeleteRoles(ctx context.Context, ids []int, tenantID int) error
}

type RoleService struct {
	roleRepo repositories.RoleRepositoryInterface
	logger   utils.Logger
}

func NewRoleService(roleRepo repositories.RoleRepositoryInterface, logger utils.Logger) RoleServiceInterface {
	return &RoleService{
		roleRepo: roleRepo,
		logger:   logger,
	}
}

func (s *RoleService) GetAllRoles(ctx context.Context, tenantID int, page, limit int, search string) (*response.RoleListResponse, error) {
	s.logger.Info("Getting all roles", map[string]interface{}{
		"tenant_id": tenantID,
		"page":      page,
		"limit":     limit,
		"search":    search,
	})

	roles, total, err := s.roleRepo.GetAllByTenant(ctx, tenantID, page, limit, search)
	if err != nil {
		s.logger.Error("Failed to get roles", err, map[string]interface{}{
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to get roles: %w", err)
	}

	var roleResponses []response.RoleResponse
	for _, r := range roles {
		roleResponses = append(roleResponses, response.RoleResponse{
			ID:          r.ID,
			TenantID:    &r.TenantID,
			Name:        r.Name,
			Code:        r.Code,
			Description: &r.Description,
			Level:       r.Level,
			IsSystem:    r.IsSystem,
			IsDefault:   r.IsDefault,
			IsActive:    r.IsActive,
			CreatedAt:   r.CreatedAt,
			UpdatedAt:   r.UpdatedAt,
		})
	}

	totalInt64 := int64(total)
	lastPage := int((totalInt64 + int64(limit) - 1) / int64(limit))
	to := page * limit
	if to > total {
		to = total
	}

	return &response.RoleListResponse{
		Roles: roleResponses,
		Pagination: response.PaginationResponse{
			Total:       total,
			PerPage:     limit,
			CurrentPage: page,
			LastPage:    lastPage,
			From:        (page-1)*limit + 1,
			To:          to,
		},
	}, nil
}

func (s *RoleService) GetRoleByID(ctx context.Context, id, tenantID int) (*response.RoleResponse, error) {
	s.logger.Info("Getting role by ID", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	role, err := s.roleRepo.GetByIDAndTenant(ctx, id, tenantID)
	if err != nil {
		s.logger.Error("Failed to get role by ID", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	return &response.RoleResponse{
		ID:          role.ID,
		TenantID:    &role.TenantID,
		Name:        role.Name,
		Code:        role.Code,
		Description: &role.Description,
		Level:       role.Level,
		IsSystem:    role.IsSystem,
		IsDefault:   role.IsDefault,
		IsActive:    role.IsActive,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
	}, nil
}

func (s *RoleService) CreateRole(ctx context.Context, req *request.CreateRoleRequest, tenantID, userID int) (*response.CreateRoleResponse, error) {
	s.logger.Info("Creating role", map[string]interface{}{
		"name":      req.Name,
		"code":      req.Code,
		"tenant_id": tenantID,
		"user_id":   userID,
	})

	existing, _ := s.roleRepo.GetByCode(ctx, req.Code, tenantID)
	if existing != nil {
		return nil, fmt.Errorf("role with code '%s' already exists", req.Code)
	}

	newRole := &models.Role{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Level:       req.Level,
		TenantID:    tenantID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if newRole.Name == "" {
		return nil, fmt.Errorf("role name is required")
	}
	if newRole.Code == "" {
		return nil, fmt.Errorf("role code is required")
	}

	createdRole, err := s.roleRepo.Create(ctx, newRole)
	if err != nil {
		s.logger.Error("Failed to create role", err, map[string]interface{}{
			"name":      req.Name,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	//  ASSIGN PERMISSIONS if present
	if len(req.PermissionIDs) > 0 {
		for _, pID := range req.PermissionIDs {
			if err := s.roleRepo.AssignPermissionToRole(ctx, createdRole.ID, int(pID)); err != nil {
				s.logger.Error(fmt.Sprintf("Failed to assign permission %d to role %d", pID, createdRole.ID), err)
			}
		}
	}

	s.logger.Info("Role created successfully", map[string]interface{}{
		"id":        createdRole.ID,
		"name":      createdRole.Name,
		"tenant_id": tenantID,
	})

	return &response.CreateRoleResponse{
		Role: response.RoleResponse{
			ID:          createdRole.ID,
			TenantID:    &createdRole.TenantID,
			Name:        createdRole.Name,
			Code:        createdRole.Code,
			Description: &createdRole.Description,
			Level:       createdRole.Level,
			IsSystem:    false,
			IsDefault:   false,
			IsActive:    true,
			CreatedAt:   createdRole.CreatedAt,
			UpdatedAt:   createdRole.UpdatedAt,
		},
		Message: "Role created successfully",
	}, nil
}

func (s *RoleService) UpdateRole(ctx context.Context, id int, req *request.UpdateRoleRequest, tenantID int) (*response.UpdateRoleResponse, error) {
	s.logger.Info("Updating role", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	existingRole, err := s.roleRepo.GetByIDAndTenant(ctx, id, tenantID)
	if err != nil {
		return nil, fmt.Errorf("role not found: %w", err)
	}

	if req.Code != "" && req.Code != existingRole.Code {
		conflicting, _ := s.roleRepo.GetByCode(ctx, req.Code, tenantID)
		if conflicting != nil && conflicting.ID != id {
			return nil, fmt.Errorf("role with code '%s' already exists", req.Code)
		}
	}

	updateData := make(map[string]interface{})
	if req.Name != "" {
		updateData["name"] = req.Name
	}
	if req.Code != "" {
		updateData["code"] = req.Code
	}
	if req.Description != "" {
		updateData["description"] = req.Description
	}
	if req.Level > 0 {
		updateData["level"] = req.Level
	}
	updateData["updated_at"] = time.Now()

	updatedRole, err := s.roleRepo.Update(ctx, id, updateData)
	if err != nil {
		s.logger.Error("Failed to update role", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	//  SYNC PERMISSIONS if present
	if req.PermissionIDs != nil {
		// Get current permissions
		currentPerms, _ := s.roleRepo.GetRolePermissions(ctx, id)
		currentPermIDs := make(map[int]bool)
		for _, p := range currentPerms {
			currentPermIDs[p.ID] = true
		}

		newPermIDs := make(map[int]bool)
		for _, pID := range req.PermissionIDs {
			newPermIDs[int(pID)] = true
		}

		// Revoke removed permissions
		for pID := range currentPermIDs {
			if !newPermIDs[pID] {
				s.roleRepo.RevokePermissionFromRole(ctx, id, pID)
			}
		}

		// Assign new permissions
		for pID := range newPermIDs {
			if !currentPermIDs[pID] {
				s.roleRepo.AssignPermissionToRole(ctx, id, pID)
			}
		}
	}

	s.logger.Info("Role updated successfully", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	return &response.UpdateRoleResponse{
		Role: response.RoleResponse{
			ID:          updatedRole.ID,
			TenantID:    &updatedRole.TenantID,
			Name:        updatedRole.Name,
			Code:        updatedRole.Code,
			Description: &updatedRole.Description,
			Level:       updatedRole.Level,
			IsSystem:    false,
			IsDefault:   false,
			IsActive:    true,
			CreatedAt:   updatedRole.CreatedAt,
			UpdatedAt:   updatedRole.UpdatedAt,
		},
		Message: "Role updated successfully",
	}, nil
}

func (s *RoleService) DeleteRole(ctx context.Context, id, tenantID int) (*response.DeleteRoleResponse, error) {
	s.logger.Info("Deleting role", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	_, err := s.roleRepo.GetByIDAndTenant(ctx, id, tenantID)
	if err != nil {
		return nil, fmt.Errorf("role not found: %w", err)
	}

	err = s.roleRepo.Delete(ctx, id)
	if err != nil {
		s.logger.Error("Failed to delete role", err, map[string]interface{}{
			"id":        id,
			"tenant_id": tenantID,
		})
		return nil, fmt.Errorf("failed to delete role: %w", err)
	}

	s.logger.Info("Role deleted successfully", map[string]interface{}{
		"id":        id,
		"tenant_id": tenantID,
	})

	return &response.DeleteRoleResponse{
		Message: "Role deleted successfully",
	}, nil
}

func (s *RoleService) BulkDeleteRoles(ctx context.Context, ids []int, tenantID int) error {
	s.logger.Info("Bulk deleting roles", map[string]interface{}{
		"ids":       ids,
		"tenant_id": tenantID,
	})

	if len(ids) == 0 {
		return nil
	}

	err := s.roleRepo.BulkDelete(ctx, ids, tenantID)
	if err != nil {
		s.logger.Error("Failed to bulk delete roles", err, map[string]interface{}{
			"tenant_id": tenantID,
		})
		return fmt.Errorf("failed to bulk delete roles: %w", err)
	}

	s.logger.Info("Roles bulk deleted successfully", map[string]interface{}{
		"count":     len(ids),
		"tenant_id": tenantID,
	})

	return nil
}

func (s *RoleService) GetRoleStats(ctx context.Context, tenantID int) (*response.RoleStatsResponse, error) {
	s.logger.Info("Getting role statistics", map[string]interface{}{
		"tenant_id": tenantID,
	})

	roles, _, err := s.roleRepo.GetAllByTenant(ctx, tenantID, 1, 1000, "")
	if err != nil {
		return nil, fmt.Errorf("failed to get roles for stats: %w", err)
	}

	stats := &response.RoleStatsResponse{
		TotalRoles:    len(roles),
		SystemRoles:   0,
		TenantRoles:   len(roles),
		ActiveRoles:   len(roles),
		InactiveRoles: 0,
		RolesByLevel:  make(map[string]int),
		RecentRoles:   []response.RoleResponse{},
	}

	if len(roles) > 0 {
		recentCount := 10
		if len(roles) < recentCount {
			recentCount = len(roles)
		}

		for i := len(roles) - recentCount; i < len(roles); i++ {
			r := roles[i]
			stats.RecentRoles = append(stats.RecentRoles, response.RoleResponse{
				ID:          r.ID,
				TenantID:    &r.TenantID,
				Name:        r.Name,
				Code:        r.Code,
				Description: &r.Description,
				Level:       1,
				IsSystem:    false,
				IsDefault:   false,
				IsActive:    true,
				CreatedAt:   r.CreatedAt,
				UpdatedAt:   r.UpdatedAt,
			})
		}
	}

	return stats, nil
}

func (s *RoleService) ValidateRoleName(ctx context.Context, name string, tenantID int, excludeID *int) (*response.RoleValidationResponse, error) {
	var errors []string

	if name == "" {
		errors = append(errors, "Role name is required")
	}

	if len(name) < 2 {
		errors = append(errors, "Role name must be at least 2 characters long")
	}

	if len(name) > 100 {
		errors = append(errors, "Role name must be less than 100 characters")
	}

	return &response.RoleValidationResponse{
		IsValid: len(errors) == 0,
		Errors:  errors,
	}, nil
}

//  NEW: ValidateRoleCode method implementation
func (s *RoleService) ValidateRoleCode(ctx context.Context, code string, tenantID int, excludeID *int) (bool, error) {
	s.logger.Info("Validating role code", map[string]interface{}{
		"code":       code,
		"tenant_id":  tenantID,
		"exclude_id": excludeID,
	})

	if code == "" {
		s.logger.Warn("Role code validation failed: empty code", map[string]interface{}{
			"tenant_id": tenantID,
		})
		return false, fmt.Errorf("role code is required")
	}

	// Check if role with this code already exists
	existingRole, err := s.roleRepo.GetByCode(ctx, code, tenantID)
	if err != nil {
		// If error is "not found", that means code is available
		if err.Error() == "role not found" || errors.Is(err, utils.ErrRoleNotFound) {
			s.logger.Info("Role code is available", map[string]interface{}{
				"code":      code,
				"tenant_id": tenantID,
			})
			return true, nil
		}

		// Other errors should be reported
		s.logger.Error("Error checking role code availability", err, map[string]interface{}{
			"code":      code,
			"tenant_id": tenantID,
		})
		return false, fmt.Errorf("failed to check role code availability: %w", err)
	}

	// If we have an existing role, check if it's the one we're excluding (for edits)
	if existingRole != nil {
		if excludeID != nil && existingRole.ID == *excludeID {
			s.logger.Info("Role code is available (excluding current role)", map[string]interface{}{
				"code":        code,
				"tenant_id":   tenantID,
				"exclude_id":  *excludeID,
				"existing_id": existingRole.ID,
			})
			return true, nil
		}

		s.logger.Info("Role code is not available", map[string]interface{}{
			"code":        code,
			"tenant_id":   tenantID,
			"existing_id": existingRole.ID,
		})
		return false, nil
	}

	// Should not reach here, but default to available
	s.logger.Info("Role code is available (default case)", map[string]interface{}{
		"code":      code,
		"tenant_id": tenantID,
	})
	return true, nil
}

func (s *RoleService) InitializeDefaultRoles(ctx context.Context, tenantID int) error {
	s.logger.Info("Initializing default roles", map[string]interface{}{
		"tenant_id": tenantID,
	})

	defaultRoles := []models.Role{
		{
			Name:        "Administrator",
			Code:        "admin",
			Description: "Full system access",
			TenantID:    tenantID,
		},
		{
			Name:        "Editor",
			Code:        "editor",
			Description: "Content management access",
			TenantID:    tenantID,
		},
		{
			Name:        "Viewer",
			Code:        "viewer",
			Description: "Read-only access",
			TenantID:    tenantID,
		},
	}

	for _, role := range defaultRoles {
		existing, _ := s.roleRepo.GetByCode(ctx, role.Code, tenantID)
		if existing != nil {
			continue
		}

		role.CreatedAt = time.Now()
		role.UpdatedAt = time.Now()

		_, err := s.roleRepo.Create(ctx, &role)
		if err != nil {
			s.logger.Error("Failed to create default role", err, map[string]interface{}{
				"role_name": role.Name,
				"tenant_id": tenantID,
			})
		}
	}

	s.logger.Info("Default roles initialized", map[string]interface{}{
		"tenant_id": tenantID,
		"count":     len(defaultRoles),
	})

	return nil
}

func (s *RoleService) BulkCreateRoles(ctx context.Context, roles []request.CreateRoleRequest, tenantID, userID int) error {
	s.logger.Info("Bulk creating roles", map[string]interface{}{
		"count":     len(roles),
		"tenant_id": tenantID,
		"user_id":   userID,
	})

	for _, req := range roles {
		existing, _ := s.roleRepo.GetByCode(ctx, req.Code, tenantID)
		if existing != nil {
			s.logger.Warn("Role already exists, skipping", map[string]interface{}{
				"code":      req.Code,
				"tenant_id": tenantID,
			})
			continue
		}

		newRole := &models.Role{
			Name:        req.Name,
			Code:        req.Code,
			Description: req.Description,
			TenantID:    tenantID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		if newRole.Name == "" {
			s.logger.Error("Role validation failed during bulk create", fmt.Errorf("name is required"), map[string]interface{}{
				"name":      req.Name,
				"tenant_id": tenantID,
			})
			continue
		}

		_, err := s.roleRepo.Create(ctx, newRole)
		if err != nil {
			s.logger.Error("Failed to create role during bulk create", err, map[string]interface{}{
				"name":      req.Name,
				"tenant_id": tenantID,
			})
			continue
		}
	}

	return nil
}

func (s *RoleService) GetRolePermissions(ctx context.Context, roleID, tenantID int) ([]response.PermissionResponse, error) {
	s.logger.Info("Getting role permissions", map[string]interface{}{
		"role_id":   roleID,
		"tenant_id": tenantID,
	})

	permissions, err := s.roleRepo.GetRolePermissions(ctx, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role permissions: %w", err)
	}

	var responses []response.PermissionResponse
	for _, p := range permissions {
		responses = append(responses, response.PermissionResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Resource:    p.Resource,
			Action:      p.Action,
			Scope:       p.Scope,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}

	return responses, nil
}

func (s *RoleService) AssignPermissionToRole(ctx context.Context, roleID, permissionID, tenantID int) error {
	s.logger.Info("Assigning permission to role", map[string]interface{}{
		"role_id":       roleID,
		"permission_id": permissionID,
		"tenant_id":     tenantID,
	})

	_, err := s.roleRepo.GetByIDAndTenant(ctx, roleID, tenantID)
	if err != nil {
		return fmt.Errorf("role not found: %w", err)
	}

	err = s.roleRepo.AssignPermissionToRole(ctx, roleID, permissionID)
	if err != nil {
		s.logger.Error("Failed to assign permission to role", err, map[string]interface{}{
			"role_id":       roleID,
			"permission_id": permissionID,
		})
		return fmt.Errorf("failed to assign permission: %w", err)
	}

	return nil
}

func (s *RoleService) RevokePermissionFromRole(ctx context.Context, roleID, permissionID, tenantID int) error {
	s.logger.Info("Revoking permission from role", map[string]interface{}{
		"role_id":       roleID,
		"permission_id": permissionID,
		"tenant_id":     tenantID,
	})

	_, err := s.roleRepo.GetByIDAndTenant(ctx, roleID, tenantID)
	if err != nil {
		return fmt.Errorf("role not found: %w", err)
	}

	err = s.roleRepo.RevokePermissionFromRole(ctx, roleID, permissionID)
	if err != nil {
		s.logger.Error("Failed to revoke permission from role", err, map[string]interface{}{
			"role_id":       roleID,
			"permission_id": permissionID,
		})
		return fmt.Errorf("failed to revoke permission: %w", err)
	}

	return nil
}
