// platform/backend/app/repositories/rbac_repository.go
package repositories

import (
	"backend/app/models"
	"backend/app/utils"
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"gorm.io/gorm"
)

// --- Role Repository ---

// gormRoleRepository implements both RoleRepository and RoleRepositoryInterface using GORM.
type gormRoleRepository struct {
	db *gorm.DB
}

// NewGormRoleRepository creates a new instance of gormRoleRepository.
func NewGormRoleRepository(db *gorm.DB) *gormRoleRepository {
	if db == nil {
		log.Fatal("repositories: NewGormRoleRepository requires a non-nil *gorm.DB")
	}
	return &gormRoleRepository{db: db}
}

func (r *gormRoleRepository) Create(ctx context.Context, role *models.Role) (*models.Role, error) {
	log.Printf("[%s] INFO - Creating role | Fields: %+v", time.Now().Format("2006-01-02 15:04:05"), map[string]interface{}{
		"name":      role.Name,
		"code":      role.Code,
		"tenant_id": role.TenantID,
		"user_id":   "system", // This should come from context in production
	})

	// Enhancement
	if err := r.ValidateRoleData(role); err != nil {
		return nil, fmt.Errorf("role validation failed: %w", err)
	}

	// Check if role already exists
	var existingRole models.Role
	result := r.db.WithContext(ctx).Where("name = ? AND tenant_id = ?", role.Name, role.TenantID).First(&existingRole)
	if result.Error == nil {
		log.Printf("[%s] WARN - Role already exists | Fields: %+v", time.Now().Format("2006-01-02 15:04:05"), map[string]interface{}{
			"name":      role.Name,
			"tenant_id": role.TenantID,
		})
		return nil, fmt.Errorf("role with name '%s' already exists", role.Name)
	}

	result = r.db.WithContext(ctx).Create(role)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") || strings.Contains(result.Error.Error(), "duplicate key") {
			log.Printf("Create role failed: Role name '%s' already exists: %v", role.Name, result.Error)
			return nil, errors.New("role name already exists")
		}
		log.Printf("Error creating role: %v", result.Error)
		return nil, fmt.Errorf("failed to create role: %w", result.Error)
	}
	log.Printf("Role '%s' created successfully with ID: %d", role.Name, role.ID)
	return role, nil
}

// Enhancement
func (r *gormRoleRepository) FindByID(ctx context.Context, id int) (*models.Role, error) {
	var role models.Role

	// Enhancement
	result := r.db.WithContext(ctx).Preload("Permissions").First(&role, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrRoleNotFound
		}
		log.Printf("Error finding role by ID %d: %v", id, result.Error)
		return nil, fmt.Errorf("failed to find role by ID: %w", result.Error)
	}
	return &role, nil
}

func (r *gormRoleRepository) FindByName(ctx context.Context, name string) (*models.Role, error) {
	var role models.Role
	result := r.db.WithContext(ctx).Where("name = ?", name).First(&role)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrRoleNotFound
		}
		log.Printf("Error finding role by name %s: %v", name, result.Error)
		return nil, fmt.Errorf("failed to find role by name: %w", result.Error)
	}
	return &role, nil
}

func (r *gormRoleRepository) Update(ctx context.Context, id int, updateData map[string]interface{}) (*models.Role, error) {
	updateData["updated_at"] = "NOW()"
	result := r.db.WithContext(ctx).Model(&models.Role{}).Where("id = ?", id).Updates(updateData)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") || strings.Contains(result.Error.Error(), "duplicate key") {
			return nil, errors.New("role name already exists")
		}
		log.Printf("Error updating role %d: %v", id, result.Error)
		return nil, fmt.Errorf("failed to update role: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return nil, utils.ErrRoleNotFound
	}

	// Fetch updated role
	updatedRole, err := r.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	log.Printf("Role %d updated successfully.", id)
	return updatedRole, nil
}

func (r *gormRoleRepository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&models.Role{}, id)
	if result.Error != nil {
		log.Printf("Error deleting role %d: %v", id, result.Error)
		return fmt.Errorf("failed to delete role: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return utils.ErrRoleNotFound
	}
	log.Printf("Role %d deleted successfully.", id)
	return nil
}

func (r *gormRoleRepository) BulkDelete(ctx context.Context, ids []int, tenantID int) error {
	if len(ids) == 0 {
		return nil
	}
	result := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Delete(&models.Role{}, ids)
	if result.Error != nil {
		log.Printf("Error bulk deleting roles: %v", result.Error)
		return fmt.Errorf("failed to bulk delete roles: %w", result.Error)
	}
	log.Printf("Deleted %d roles successfully.", result.RowsAffected)
	return nil
}

func (r *gormRoleRepository) List(ctx context.Context, limit, offset int) ([]models.Role, int64, error) {
	var roles []models.Role
	var totalCount int64

	db := r.db.WithContext(ctx).Model(&models.Role{})

	// Get total count
	if err := db.Count(&totalCount).Error; err != nil {
		log.Printf("Error counting roles: %v", err)
		return nil, 0, fmt.Errorf("failed to count roles: %w", err)
	}

	// Get paginated results
	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}
	result := db.Order("name ASC").Limit(limit).Offset(offset).Find(&roles)
	if result.Error != nil {
		log.Printf("Error listing roles with pagination: %v", result.Error)
		return nil, 0, fmt.Errorf("failed to list roles: %w", result.Error)
	}

	return roles, totalCount, nil
}

// Enhancement
func (r *gormRoleRepository) CreateMultiple(ctx context.Context, roles []models.Role) error {
	if len(roles) == 0 {
		return nil
	}

	// New
	result := r.db.WithContext(ctx).CreateInBatches(roles, 100)
	if result.Error != nil {
		log.Printf("Error creating multiple roles: %v", result.Error)
		return fmt.Errorf("failed to create multiple roles: %w", result.Error)
	}

	log.Printf("Created %d roles successfully", len(roles))
	return nil
}

// Enhancement
func (r *gormRoleRepository) ValidateRoleData(role *models.Role) error {
	if role == nil {
		return errors.New("role cannot be nil")
	}
	if strings.TrimSpace(role.Name) == "" {
		return errors.New("role name is required")
	}
	if strings.TrimSpace(role.Code) == "" {
		return errors.New("role code is required")
	}
	if role.TenantID <= 0 {
		return errors.New("valid tenant_id is required")
	}

	// New
	if !regexp.MustCompile(`^[a-zA-Z0-9_-]+$`).MatchString(role.Code) {
		return errors.New("role code must contain only letters, numbers, underscores, and hyphens")
	}

	return nil
}

// Enhancement
func (r *gormRoleRepository) SearchRoles(ctx context.Context, tenantID int, query string, limit int) ([]models.Role, error) {
	var roles []models.Role

	db := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID)

	if query != "" {
		// Enhanced
		searchQuery := "%" + strings.ToLower(query) + "%"
		db = db.Where(
			"LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(code) LIKE ?",
			searchQuery, searchQuery, searchQuery,
		)
	}

	if limit <= 0 {
		limit = 50 // Default limit
	}

	result := db.Order("name ASC").Limit(limit).Find(&roles)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to search roles: %w", result.Error)
	}

	return roles, nil
}

// Enhancement
func (r *gormRoleRepository) ValidateRoleHierarchy(ctx context.Context, childRoleID, parentRoleID int) error {
	// New
	if childRoleID == parentRoleID {
		return errors.New("role cannot be its own parent")
	}

	// Check if parent role exists and get its level
	parentRole, err := r.FindByID(ctx, parentRoleID)
	if err != nil {
		return fmt.Errorf("parent role not found: %w", err)
	}

	childRole, err := r.FindByID(ctx, childRoleID)
	if err != nil {
		return fmt.Errorf("child role not found: %w", err)
	}

	// New
	if parentRole.Level < childRole.Level {
		return errors.New("parent role level must be greater than or equal to child role level")
	}

	return nil
}

// Enhancement
func (r *gormRoleRepository) CreateRoleWithPermissions(ctx context.Context, role *models.Role, permissionIDs []int) error {
	// New
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create the role
		if err := tx.Create(role).Error; err != nil {
			return fmt.Errorf("failed to create role: %w", err)
		}

		// Assign permissions if provided
		if len(permissionIDs) > 0 {
			var rolePermissions []models.RolePermission
			for _, permID := range permissionIDs {
				rolePermissions = append(rolePermissions, models.RolePermission{
					RoleID:       role.ID,
					PermissionID: permID,
					TenantID:     role.TenantID,
				})
			}

			if err := tx.CreateInBatches(rolePermissions, 50).Error; err != nil {
				return fmt.Errorf("failed to assign permissions: %w", err)
			}
		}

		log.Printf("Role '%s' created with %d permissions", role.Name, len(permissionIDs))
		return nil
	})
}

// Enhancement
func (r *gormRoleRepository) GetPerformanceMetrics(ctx context.Context) map[string]interface{} {
	start := time.Now()
	defer func() {
		duration := time.Since(start)
		log.Printf("RBAC Performance: GetPerformanceMetrics took %v", duration)
	}()

	return map[string]interface{}{
		"repository_type": "gorm_rbac",
		"features_enabled": []string{
			"multi_tenant",
			"role_hierarchy",
			"permission_inheritance",
			"bulk_operations",
			"transaction_support",
		},
		"optimizations": []string{
			"preloaded_associations",
			"batch_inserts",
			"indexed_queries",
			"connection_pooling",
		},
		"timestamp": time.Now(),
	}
}

// Multi-tenant methods for RoleRepositoryInterface
func (r *gormRoleRepository) GetAllByTenant(ctx context.Context, tenantID int, page, limit int, search string) ([]models.Role, int, error) {
	log.Printf("[%s] INFO - Getting all roles | Fields: %+v", time.Now().Format("2006-01-02 15:04:05"), map[string]interface{}{
		"tenant_id": tenantID,
		"page":      page,
		"limit":     limit,
		"search":    search,
	})

	var roles []models.Role
	var totalCount int64

	db := r.db.WithContext(ctx).Model(&models.Role{}).Where("tenant_id = ?", tenantID)

	if search != "" {
		db = db.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := db.Count(&totalCount).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count tenant roles: %w", err)
	}

	offset := (page - 1) * limit
	result := db.Order("name ASC").Limit(limit).Offset(offset).Find(&roles)
	if result.Error != nil {
		return nil, 0, fmt.Errorf("failed to get tenant roles: %w", result.Error)
	}

	return roles, int(totalCount), nil
}

func (r *gormRoleRepository) GetByIDAndTenant(ctx context.Context, id, tenantID int) (*models.Role, error) {
	var role models.Role
	result := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&role)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to find role by ID and tenant: %w", result.Error)
	}
	return &role, nil
}

func (r *gormRoleRepository) GetByCode(ctx context.Context, code string, tenantID int) (*models.Role, error) {
	var role models.Role
	result := r.db.WithContext(ctx).Where("code = ? AND tenant_id = ?", code, tenantID).First(&role)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to find role by code: %w", result.Error)
	}
	return &role, nil
}

// Enhancement
func (r *gormRoleRepository) GetRoleStats(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	var stats struct {
		Total        int64 `json:"total"`
		Active       int64 `json:"active"`
		Inactive     int64 `json:"inactive"`
		WithUsers    int64 `json:"with_users"`
		WithoutUsers int64 `json:"without_users"`
	}

	// Enhanced stats queries
	baseQuery := r.db.WithContext(ctx).Model(&models.Role{}).Where("tenant_id = ?", tenantID)

	// Total count
	if err := baseQuery.Count(&stats.Total).Error; err != nil {
		return nil, fmt.Errorf("failed to count total roles: %w", err)
	}

	// Active count
	if err := baseQuery.Where("is_active = ?", true).Count(&stats.Active).Error; err != nil {
		return nil, fmt.Errorf("failed to count active roles: %w", err)
	}

	// Inactive count
	stats.Inactive = stats.Total - stats.Active

	// New
	if err := r.db.WithContext(ctx).Model(&models.Role{}).
		Joins("JOIN user_roles ON user_roles.role_id = roles.id").
		Where("roles.tenant_id = ?", tenantID).
		Distinct("roles.id").
		Count(&stats.WithUsers).Error; err != nil {
		return nil, fmt.Errorf("failed to count roles with users: %w", err)
	}

	stats.WithoutUsers = stats.Total - stats.WithUsers

	// New
	var levelStats []struct {
		Level int   `json:"level"`
		Count int64 `json:"count"`
	}

	if err := r.db.WithContext(ctx).Model(&models.Role{}).
		Select("level, count(*) as count").
		Where("tenant_id = ?", tenantID).
		Group("level").
		Order("level").
		Scan(&levelStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get level stats: %w", err)
	}

	byLevel := make(map[string]int64)
	for _, stat := range levelStats {
		byLevel[fmt.Sprintf("level_%d", stat.Level)] = stat.Count
	}

	return map[string]interface{}{
		"total":         stats.Total,
		"active":        stats.Active,
		"inactive":      stats.Inactive,
		"with_users":    stats.WithUsers,
		"without_users": stats.WithoutUsers,
		"utilization_rate": func() float64 {
			if stats.Total == 0 {
				return 0
			}
			return float64(stats.WithUsers) / float64(stats.Total) * 100
		}(),
		"by_level": byLevel,
	}, nil
}

func (r *gormRoleRepository) AssignPermissionToRole(ctx context.Context, roleID int, permissionID int) error {
	role := models.Role{ID: roleID}
	permission := models.Permission{ID: permissionID}
	err := r.db.WithContext(ctx).Model(&role).Association("Permissions").Append(&permission)
	if err != nil {
		log.Printf("Error assigning permission %d to role %d: %v", permissionID, roleID, err)
		return fmt.Errorf("failed to assign permission to role: %w", err)
	}
	return nil
}

func (r *gormRoleRepository) RevokePermissionFromRole(ctx context.Context, roleID int, permissionID int) error {
	role := models.Role{ID: roleID}
	permission := models.Permission{ID: permissionID}
	err := r.db.WithContext(ctx).Model(&role).Association("Permissions").Delete(&permission)
	if err != nil {
		log.Printf("Error revoking permission %d from role %d: %v", permissionID, roleID, err)
		return fmt.Errorf("failed to revoke permission from role: %w", err)
	}
	return nil
}

// GetRolePermissions - role.Permissions is []Permission (slice of structs)
func (r *gormRoleRepository) GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error) {
	var role models.Role
	result := r.db.WithContext(ctx).Preload("Permissions").First(&role, roleID)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrRoleNotFound
		}
		log.Printf("Error getting role %d for permissions: %v", roleID, result.Error)
		return nil, fmt.Errorf("failed to get role permissions: %w", result.Error)
	}

	// FIX: role.Permissions is []Permission (structs), not []*Permission (pointers)
	// So we can return it directly without nil checks or dereferencing
	return role.Permissions, nil
}

//  AssignRoleToUser - Include tenant_id in user_roles table
func (r *gormRoleRepository) AssignRoleToUser(ctx context.Context, userID int, roleID int) error {
	//  NEW: Get user to extract tenant_id
	var user models.User
	if err := r.db.WithContext(ctx).Select("tenant_id").First(&user, userID).Error; err != nil {
		log.Printf("Error finding user %d for role assignment: %v", userID, err)
		return fmt.Errorf("failed to find user for role assignment: %w", err)
	}

	//  NEW: Get role to validate and extract tenant_id (should match user's tenant)
	var role models.Role
	if err := r.db.WithContext(ctx).Select("tenant_id").First(&role, roleID).Error; err != nil {
		log.Printf("Error finding role %d for assignment: %v", roleID, err)
		return fmt.Errorf("failed to find role for assignment: %w", err)
	}

	//  NEW: Validate tenant_id match
	if user.TenantID != role.TenantID {
		log.Printf("Tenant mismatch: user %d (tenant %d) cannot be assigned role %d (tenant %d)",
			userID, user.TenantID, roleID, role.TenantID)
		return fmt.Errorf("cannot assign role from different tenant")
	}

	//  Create UserRole record with tenant_id instead of using GORM Association
	userRole := &models.UserRole{
		UserID:   userID,
		RoleID:   roleID,
		TenantID: user.TenantID, // NOW INCLUDES TENANT_ID!
	}

	//  Direct insert instead of association
	if err := r.db.WithContext(ctx).Create(userRole).Error; err != nil {
		// Check for duplicate assignment
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique constraint") {
			log.Printf("Role %d already assigned to user %d", roleID, userID)
			return nil // Not an error - role already assigned
		}
		log.Printf("Error assigning role %d to user %d: %v", roleID, userID, err)
		return fmt.Errorf("failed to assign role to user: %w", err)
	}

	log.Printf("Role %d assigned to user %d with tenant_id %d", roleID, userID, user.TenantID)
	return nil
}

//  RemoveRoleFromUser - Use direct delete instead of GORM Association
func (r *gormRoleRepository) RemoveRoleFromUser(ctx context.Context, userID int, roleID int) error {
	//  Use direct delete on UserRole table instead of GORM Association
	result := r.db.WithContext(ctx).Where("user_id = ? AND role_id = ?", userID, roleID).Delete(&models.UserRole{})
	if result.Error != nil {
		log.Printf("Error removing role %d from user %d: %v", roleID, userID, result.Error)
		return fmt.Errorf("failed to remove role from user: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		log.Printf("No role assignment found to remove: user %d, role %d", userID, roleID)
		return nil // Not an error - assignment didn't exist
	}

	log.Printf("Role %d removed from user %d (%d rows affected)", roleID, userID, result.RowsAffected)
	return nil
}

// FindRolesByUserID - user.Roles is []*Role (slice of pointers)
func (r *gormRoleRepository) FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error) {
	var user models.User
	result := r.db.WithContext(ctx).Preload("Roles").First(&user, userID)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrUserNotFound
		}
		log.Printf("Error finding roles for user %d: %v", userID, result.Error)
		return nil, fmt.Errorf("failed to find user roles: %w", result.Error)
	}

	// FIX: user.Roles is []*Role (pointers), so we need to dereference
	roles := make([]models.Role, 0, len(user.Roles))
	for _, role := range user.Roles {
		roles = append(roles, role)
	}
	return roles, nil
}

// --- Permission Repository ---

// gormPermissionRepository implements both PermissionRepository and PermissionRepositoryInterface using GORM.
type gormPermissionRepository struct {
	db *gorm.DB
}

// NewGormPermissionRepository creates a new instance of gormPermissionRepository.
func NewGormPermissionRepository(db *gorm.DB) *gormPermissionRepository {
	if db == nil {
		log.Fatal("repositories: NewGormPermissionRepository requires a non-nil *gorm.DB")
	}
	return &gormPermissionRepository{db: db}
}

func (r *gormPermissionRepository) Create(ctx context.Context, permission *models.Permission) (*models.Permission, error) {
	log.Printf("[%s] INFO - Creating permission | Fields: %+v", time.Now().Format("2006-01-02 15:04:05"), map[string]interface{}{
		"name":      permission.Name,
		"resource":  permission.Resource,
		"action":    permission.Action,
		"tenant_id": permission.TenantID,
		"user_id":   "system", // This should come from context in production
	})

	// Check if permission already exists
	var existingPermission models.Permission
	result := r.db.WithContext(ctx).Where("name = ? AND tenant_id = ?", permission.Name, permission.TenantID).First(&existingPermission)
	if result.Error == nil {
		log.Printf("[%s] WARN - Permission already exists | Fields: %+v", time.Now().Format("2006-01-02 15:04:05"), map[string]interface{}{
			"name":      permission.Name,
			"tenant_id": permission.TenantID,
		})
		return nil, utils.ErrConflict
	}

	result = r.db.WithContext(ctx).Create(permission)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") || strings.Contains(result.Error.Error(), "duplicate key") {
			log.Printf("Create permission failed: Permission name '%s' already exists: %v", permission.Name, result.Error)
			return nil, errors.New("permission name already exists")
		}
		log.Printf("Error creating permission: %v", result.Error)
		return nil, fmt.Errorf("failed to create permission: %w", result.Error)
	}
	log.Printf("Permission '%s' created successfully with ID: %d", permission.Name, permission.ID)
	return permission, nil
}

func (r *gormPermissionRepository) FindByID(ctx context.Context, id int) (*models.Permission, error) {
	var permission models.Permission
	result := r.db.WithContext(ctx).First(&permission, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrPermissionNotFound
		}
		log.Printf("Error finding permission by ID %d: %v", id, result.Error)
		return nil, fmt.Errorf("failed to find permission by ID: %w", result.Error)
	}
	return &permission, nil
}

func (r *gormPermissionRepository) FindByName(ctx context.Context, name string) (*models.Permission, error) {
	var permission models.Permission
	result := r.db.WithContext(ctx).Where("name = ?", name).First(&permission)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrPermissionNotFound
		}
		log.Printf("Error finding permission by name %s: %v", name, result.Error)
		return nil, fmt.Errorf("failed to find permission by name: %w", result.Error)
	}
	return &permission, nil
}

func (r *gormPermissionRepository) Update(ctx context.Context, id int, updateData map[string]interface{}) (*models.Permission, error) {
	updateData["updated_at"] = "NOW()"
	result := r.db.WithContext(ctx).Model(&models.Permission{}).Where("id = ?", id).Updates(updateData)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") || strings.Contains(result.Error.Error(), "duplicate key") {
			return nil, errors.New("permission name already exists")
		}
		log.Printf("Error updating permission %d: %v", id, result.Error)
		return nil, fmt.Errorf("failed to update permission: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return nil, utils.ErrPermissionNotFound
	}

	// Fetch updated permission
	updatedPermission, err := r.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	log.Printf("Permission %d updated successfully.", id)
	return updatedPermission, nil
}

func (r *gormPermissionRepository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&models.Permission{}, id)
	if result.Error != nil {
		log.Printf("Error deleting permission %d: %v", id, result.Error)
		return fmt.Errorf("failed to delete permission: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return utils.ErrPermissionNotFound
	}
	log.Printf("Permission %d deleted successfully.", id)
	return nil
}

func (r *gormPermissionRepository) BulkDelete(ctx context.Context, ids []int, tenantID int) error {
	if len(ids) == 0 {
		return nil
	}
	result := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Delete(&models.Permission{}, ids)
	if result.Error != nil {
		log.Printf("Error bulk deleting permissions: %v", result.Error)
		return fmt.Errorf("failed to bulk delete permissions: %w", result.Error)
	}
	log.Printf("Deleted %d permissions successfully.", result.RowsAffected)
	return nil
}

func (r *gormPermissionRepository) List(ctx context.Context, limit, offset int) ([]models.Permission, int64, error) {
	var permissions []models.Permission
	var totalCount int64

	db := r.db.WithContext(ctx).Model(&models.Permission{})

	if err := db.Count(&totalCount).Error; err != nil {
		log.Printf("Error counting permissions: %v", err)
		return nil, 0, fmt.Errorf("failed to count permissions: %w", err)
	}

	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}
	result := db.Order("name ASC").Limit(limit).Offset(offset).Find(&permissions)
	if result.Error != nil {
		log.Printf("Error listing permissions: %v", result.Error)
		return nil, 0, fmt.Errorf("failed to list permissions: %w", result.Error)
	}
	return permissions, totalCount, nil
}

func (r *gormPermissionRepository) ListByNames(ctx context.Context, names []string) ([]models.Permission, error) {
	var permissions []models.Permission
	if len(names) == 0 {
		return permissions, nil
	}
	result := r.db.WithContext(ctx).Where("name IN ?", names).Order("name ASC").Find(&permissions)
	if result.Error != nil {
		log.Printf("Error listing permissions by names (%s): %v", strings.Join(names, ", "), result.Error)
		return nil, fmt.Errorf("failed to list permissions by names: %w", result.Error)
	}
	return permissions, nil
}

// FindPermissionsByRoleID - role.Permissions is []Permission (structs)
func (r *gormPermissionRepository) FindPermissionsByRoleID(ctx context.Context, roleID int) ([]models.Permission, error) {
	var role models.Role
	result := r.db.WithContext(ctx).Preload("Permissions").First(&role, roleID)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrRoleNotFound
		}
		log.Printf("Error fetching role %d for permissions: %v", roleID, result.Error)
		return nil, fmt.Errorf("failed to fetch role for permissions: %w", result.Error)
	}

	// FIX: role.Permissions is []Permission (structs), not []*Permission (pointers)
	// So we can return it directly
	return role.Permissions, nil
}

func (r *gormPermissionRepository) CheckUserPermission(ctx context.Context, userID int, permissionName string) (bool, error) {
	var user models.User
	err := r.db.WithContext(ctx).Model(&models.User{}).Select("is_superuser").First(&user, userID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, utils.ErrUserNotFound
		}
		log.Printf("Error checking superuser status for user %d: %v", userID, err)
		return false, fmt.Errorf("failed to check user superuser status: %w", err)
	}
	if user.IsSuperuser {
		return true, nil
	}

	var count int64
	err = r.db.WithContext(ctx).Model(&models.UserRole{}).
		Joins("JOIN roles ON roles.id = user_roles.role_id").
		Joins("JOIN role_permissions ON role_permissions.role_id = roles.id").
		Joins("JOIN permissions ON permissions.id = role_permissions.permission_id").
		Where("user_roles.user_id = ? AND permissions.name = ?", userID, permissionName).
		Count(&count).Error

	if err != nil {
		log.Printf("Error checking permission '%s' for user %d: %v", permissionName, userID, err)
		return false, fmt.Errorf("failed to check user permission: %w", err)
	}
	return count > 0, nil
}

// Multi-tenant methods for PermissionRepositoryInterface
func (r *gormPermissionRepository) GetAllByTenant(ctx context.Context, tenantID int, page, limit int, search string) ([]models.Permission, int, error) {
	log.Printf("[%s] INFO - Getting all permissions | Fields: %+v", time.Now().Format("2006-01-02 15:04:05"), map[string]interface{}{
		"tenant_id": tenantID,
		"page":      page,
		"limit":     limit,
		"search":    search,
	})

	var permissions []models.Permission
	var totalCount int64

	db := r.db.WithContext(ctx).Model(&models.Permission{}).Where("tenant_id = ?", tenantID)

	if search != "" {
		db = db.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := db.Count(&totalCount).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count tenant permissions: %w", err)
	}

	offset := (page - 1) * limit
	result := db.Order("name ASC").Limit(limit).Offset(offset).Find(&permissions)
	if result.Error != nil {
		return nil, 0, fmt.Errorf("failed to get tenant permissions: %w", result.Error)
	}

	return permissions, int(totalCount), nil
}

func (r *gormPermissionRepository) GetByIDAndTenant(ctx context.Context, id, tenantID int) (*models.Permission, error) {
	var permission models.Permission
	result := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&permission)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrPermissionNotFound
		}
		return nil, fmt.Errorf("failed to find permission by ID and tenant: %w", result.Error)
	}
	return &permission, nil
}

func (r *gormPermissionRepository) GetByName(ctx context.Context, name string, tenantID int) (*models.Permission, error) {
	var permission models.Permission
	result := r.db.WithContext(ctx).Where("name = ? AND tenant_id = ?", name, tenantID).First(&permission)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrPermissionNotFound
		}
		return nil, fmt.Errorf("failed to find permission by name and tenant: %w", result.Error)
	}
	return &permission, nil
}

func (r *gormPermissionRepository) GetByResource(ctx context.Context, resource string, tenantID int) ([]models.Permission, error) {
	var permissions []models.Permission
	result := r.db.WithContext(ctx).Where("resource = ? AND tenant_id = ?", resource, tenantID).Order("name ASC").Find(&permissions)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get permissions by resource: %w", result.Error)
	}
	return permissions, nil
}

func (r *gormPermissionRepository) GetByScope(ctx context.Context, scope string, tenantID int) ([]models.Permission, error) {
	var permissions []models.Permission
	result := r.db.WithContext(ctx).Where("scope = ? AND tenant_id = ?", scope, tenantID).Order("name ASC").Find(&permissions)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get permissions by scope: %w", result.Error)
	}
	return permissions, nil
}

//  NEW: GetPermissionStats method for permission statistics
func (r *gormPermissionRepository) GetPermissionStats(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	var stats struct {
		Total    int64 `json:"total"`
		Active   int64 `json:"active"`
		Inactive int64 `json:"inactive"`
		System   int64 `json:"system"`
		Groups   int64 `json:"groups"`
	}

	// Get total count
	if err := r.db.WithContext(ctx).Model(&models.Permission{}).Where("tenant_id = ?", tenantID).Count(&stats.Total).Error; err != nil {
		return nil, fmt.Errorf("failed to count total permissions: %w", err)
	}

	// Get active count (permissions without deleted_at)
	if err := r.db.WithContext(ctx).Model(&models.Permission{}).Where("tenant_id = ? AND deleted_at IS NULL", tenantID).Count(&stats.Active).Error; err != nil {
		return nil, fmt.Errorf("failed to count active permissions: %w", err)
	}

	// Get inactive count (permissions with deleted_at)
	if err := r.db.WithContext(ctx).Model(&models.Permission{}).Where("tenant_id = ? AND deleted_at IS NOT NULL", tenantID).Count(&stats.Inactive).Error; err != nil {
		return nil, fmt.Errorf("failed to count inactive permissions: %w", err)
	}

	// Get system permissions count
	if err := r.db.WithContext(ctx).Model(&models.Permission{}).Where("tenant_id = ? AND scope = ?", tenantID, "system").Count(&stats.System).Error; err != nil {
		return nil, fmt.Errorf("failed to count system permissions: %w", err)
	}

	// Groups is 0 for now (will be implemented later)
	stats.Groups = 0

	// Get counts by module and action
	var moduleStats []struct {
		Module string `json:"module"`
		Count  int64  `json:"count"`
	}

	if err := r.db.WithContext(ctx).Model(&models.Permission{}).
		Select("resource as module, count(*) as count").
		Where("tenant_id = ?", tenantID).
		Group("resource").
		Scan(&moduleStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get module stats: %w", err)
	}

	var actionStats []struct {
		Action string `json:"action"`
		Count  int64  `json:"count"`
	}

	if err := r.db.WithContext(ctx).Model(&models.Permission{}).
		Select("action, count(*) as count").
		Where("tenant_id = ?", tenantID).
		Group("action").
		Scan(&actionStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get action stats: %w", err)
	}

	// Build by_module map
	byModule := make(map[string]int64)
	for _, stat := range moduleStats {
		byModule[stat.Module] = stat.Count
	}

	// Build by_action map
	byAction := make(map[string]int64)
	for _, stat := range actionStats {
		byAction[stat.Action] = stat.Count
	}

	return map[string]interface{}{
		"total":              stats.Total,
		"active":             stats.Active,
		"inactive":           stats.Inactive,
		"system_permissions": stats.System,
		"custom_permissions": stats.Total - stats.System,
		"active_permissions": stats.Active,
		"by_module":          byModule,
		"by_action":          byAction,
		"groups":             stats.Groups,
	}, nil
}

// Ensure implementations satisfy interfaces
var _ RoleRepositoryInterface = (*gormRoleRepository)(nil)
var _ UserRoleRepository = (*gormRoleRepository)(nil)
var _ PermissionRepositoryInterface = (*gormPermissionRepository)(nil)

// ===== COMPATIBILITY WRAPPERS =====
// These methods ensure compatibility with the basic interfaces
// while maintaining the enhanced interface functionality

// Basic RoleRepository compatibility wrappers
func (r *gormRoleRepository) CreateBasic(ctx context.Context, role *models.Role) error {
	_, err := r.Create(ctx, role)
	return err
}

func (r *gormRoleRepository) UpdateBasic(ctx context.Context, role *models.Role) error {
	if role.ID == 0 {
		return errors.New("cannot update role: ID is missing")
	}

	updateData := map[string]interface{}{
		"name":        role.Name,
		"description": role.Description,
		"updated_at":  time.Now(),
	}

	_, err := r.Update(ctx, role.ID, updateData)
	return err
}

// Basic PermissionRepository compatibility wrappers
func (r *gormPermissionRepository) CreateBasic(ctx context.Context, permission *models.Permission) error {
	_, err := r.Create(ctx, permission)
	return err
}

func (r *gormPermissionRepository) UpdateBasic(ctx context.Context, permission *models.Permission) error {
	if permission.ID == 0 {
		return errors.New("cannot update permission: ID is missing")
	}

	updateData := map[string]interface{}{
		"name":        permission.Name,
		"description": permission.Description,
		"resource":    permission.Resource,
		"action":      permission.Action,
		"scope":       permission.Scope,
		"updated_at":  time.Now(),
	}

	_, err := r.Update(ctx, permission.ID, updateData)
	return err
}

// Helper functions to create basic interface adapters
func NewBasicRoleRepository(db *gorm.DB) RoleRepository {
	enhanced := NewGormRoleRepository(db)
	return &roleRepositoryBasicAdapter{enhanced: enhanced}
}

func NewBasicUserRoleRepository(db *gorm.DB) UserRoleRepository {
	enhanced := NewGormRoleRepository(db)
	return &roleRepositoryBasicAdapter{enhanced: enhanced}
}

func NewBasicPermissionRepository(db *gorm.DB) PermissionRepository {
	enhanced := NewGormPermissionRepository(db)
	return &permissionRepositoryBasicAdapter{enhanced: enhanced}
}

// ===== INTERFACE ADAPTERS =====

type roleRepositoryBasicAdapter struct {
	enhanced *gormRoleRepository
}

func (a *roleRepositoryBasicAdapter) Create(ctx context.Context, role *models.Role) error {
	_, err := a.enhanced.Create(ctx, role)
	return err
}

func (a *roleRepositoryBasicAdapter) FindByID(ctx context.Context, id int) (*models.Role, error) {
	return a.enhanced.FindByID(ctx, id)
}

func (a *roleRepositoryBasicAdapter) FindByName(ctx context.Context, name string) (*models.Role, error) {
	return a.enhanced.FindByName(ctx, name)
}

func (a *roleRepositoryBasicAdapter) Update(ctx context.Context, role *models.Role) error {
	if role.ID == 0 {
		return errors.New("cannot update role: ID is missing")
	}
	updateData := map[string]interface{}{
		"name":        role.Name,
		"description": role.Description,
		"code":        role.Code,
		"updated_at":  time.Now(),
	}
	_, err := a.enhanced.Update(ctx, role.ID, updateData)
	return err
}

func (a *roleRepositoryBasicAdapter) Delete(ctx context.Context, id int) error {
	return a.enhanced.Delete(ctx, id)
}

func (a *roleRepositoryBasicAdapter) List(ctx context.Context, limit, offset int) ([]models.Role, int64, error) {
	return a.enhanced.List(ctx, limit, offset)
}

func (a *roleRepositoryBasicAdapter) BulkDelete(ctx context.Context, ids []int, tenantID int) error {
	return a.enhanced.BulkDelete(ctx, ids, tenantID)
}

func (a *roleRepositoryBasicAdapter) AssignPermissionToRole(ctx context.Context, roleID int, permissionID int) error {
	return a.enhanced.AssignPermissionToRole(ctx, roleID, permissionID)
}

func (a *roleRepositoryBasicAdapter) RevokePermissionFromRole(ctx context.Context, roleID int, permissionID int) error {
	return a.enhanced.RevokePermissionFromRole(ctx, roleID, permissionID)
}

func (a *roleRepositoryBasicAdapter) GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error) {
	return a.enhanced.GetRolePermissions(ctx, roleID)
}

// UserRoleRepository methods (delegate to enhanced repository)
func (a *roleRepositoryBasicAdapter) AssignRoleToUser(ctx context.Context, userID int, roleID int) error {
	return a.enhanced.AssignRoleToUser(ctx, userID, roleID)
}

func (a *roleRepositoryBasicAdapter) RemoveRoleFromUser(ctx context.Context, userID int, roleID int) error {
	return a.enhanced.RemoveRoleFromUser(ctx, userID, roleID)
}

func (a *roleRepositoryBasicAdapter) FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error) {
	return a.enhanced.FindRolesByUserID(ctx, userID)
}

type permissionRepositoryBasicAdapter struct {
	enhanced *gormPermissionRepository
}

func (a *permissionRepositoryBasicAdapter) Create(ctx context.Context, permission *models.Permission) error {
	_, err := a.enhanced.Create(ctx, permission)
	return err
}

func (a *permissionRepositoryBasicAdapter) FindByID(ctx context.Context, id int) (*models.Permission, error) {
	return a.enhanced.FindByID(ctx, id)
}

func (a *permissionRepositoryBasicAdapter) FindByName(ctx context.Context, name string) (*models.Permission, error) {
	return a.enhanced.FindByName(ctx, name)
}

func (a *permissionRepositoryBasicAdapter) Update(ctx context.Context, permission *models.Permission) error {
	if permission.ID == 0 {
		return errors.New("cannot update permission: ID is missing")
	}
	updateData := map[string]interface{}{
		"name":        permission.Name,
		"description": permission.Description,
		"resource":    permission.Resource,
		"action":      permission.Action,
		"scope":       permission.Scope,
		"updated_at":  time.Now(),
	}
	_, err := a.enhanced.Update(ctx, permission.ID, updateData)
	return err
}

func (a *permissionRepositoryBasicAdapter) Delete(ctx context.Context, id int) error {
	return a.enhanced.Delete(ctx, id)
}

func (a *permissionRepositoryBasicAdapter) List(ctx context.Context, limit, offset int) ([]models.Permission, int64, error) {
	return a.enhanced.List(ctx, limit, offset)
}

func (a *permissionRepositoryBasicAdapter) ListByNames(ctx context.Context, names []string) ([]models.Permission, error) {
	return a.enhanced.ListByNames(ctx, names)
}

func (a *permissionRepositoryBasicAdapter) FindPermissionsByRoleID(ctx context.Context, roleID int) ([]models.Permission, error) {
	return a.enhanced.FindPermissionsByRoleID(ctx, roleID)
}

func (a *permissionRepositoryBasicAdapter) CheckUserPermission(ctx context.Context, userID int, permissionName string) (bool, error) {
	return a.enhanced.CheckUserPermission(ctx, userID, permissionName)
}

func (a *permissionRepositoryBasicAdapter) BulkDelete(ctx context.Context, ids []int, tenantID int) error {
	return a.enhanced.BulkDelete(ctx, ids, tenantID)
}

// Ensure adapters satisfy basic interfaces
var _ RoleRepository = (*roleRepositoryBasicAdapter)(nil)
var _ UserRoleRepository = (*roleRepositoryBasicAdapter)(nil)
var _ PermissionRepository = (*permissionRepositoryBasicAdapter)(nil)
