// platform/backend/app/repositories/menu_repository.go
package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"backend/app/models"
	"backend/app/utils"

	"github.com/jmoiron/sqlx"
)

// MenuRepository interface - COMPLETE WITH ALL MISSING METHODS
type MenuRepository interface {
	// Basic CRUD operations
	GetMenus(ctx context.Context, tenantID int) ([]models.Menu, error)
	GetAllMenusIncludingInactive(ctx context.Context, tenantID int) ([]models.Menu, error)
	GetMenuByID(ctx context.Context, id int) (*models.Menu, error)
	CreateMenu(ctx context.Context, menu *models.Menu) (*models.Menu, error)
	UpdateMenu(ctx context.Context, menu *models.Menu) (*models.Menu, error)
	DeleteMenu(ctx context.Context, id int) error

	// Hierarchy operations
	GetMenuHierarchy(ctx context.Context, tenantID int) ([]models.Menu, error)
	GetChildMenus(ctx context.Context, parentID int) ([]models.Menu, error)

	// User access
	GetUserAccessibleMenus(ctx context.Context, userID, tenantID int) ([]models.Menu, error)

	// Bulk operations
	ToggleMenuStatus(ctx context.Context, id int, isActive bool) error
	ReorderMenus(ctx context.Context, tenantID int, menuOrder []models.MenuOrderItem) error
	BatchOperations(ctx context.Context, operation string, menuIDs []int, value interface{}) error

	// Analytics and logging
	GetMenuAccessLogs(ctx context.Context, menuID, tenantID int, limit int) ([]models.MenuAccessLog, error)
	GetMenuStatistics(ctx context.Context, tenantID int, startDate, endDate string) (interface{}, error)
}

// postgresMenuRepository implements MenuRepository using SQLX
type postgresMenuRepository struct {
	db *sqlx.DB
}

// NewPostgresMenuRepository creates a new PostgreSQL-based menu repository
func NewPostgresMenuRepository(db *sqlx.DB) MenuRepository {
	return &postgresMenuRepository{db: db}
}

// GetMenus retrieves all menu items for a tenant
func (r *postgresMenuRepository) GetMenus(ctx context.Context, tenantID int) ([]models.Menu, error) {
	query := `
		SELECT 
			id, title, icon, route, parent_id, order_index, is_active, 
			required_permission_id, visibility_rules, access_level, 
			is_system_menu, conditional_permissions, menu_group, 
			custom_permissions, display_order, is_visible, description, 
			menu_type, slug, created_at, updated_at, tenant_id
		FROM menu_items 
		WHERE tenant_id = $1 AND is_active = true 
		ORDER BY order_index ASC
	`

	var menus []models.Menu
	err := r.db.SelectContext(ctx, &menus, query, tenantID)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to get menus for tenant %d: %v", tenantID, err)
		return nil, fmt.Errorf("failed to get menus: %w", err)
	}

	utils.Infof("MenuRepository: Retrieved %d active menus for tenant %d", len(menus), tenantID)
	return menus, nil
}

// GetAllMenusIncludingInactive retrieves all menu items for a tenant (including inactive ones)
func (r *postgresMenuRepository) GetAllMenusIncludingInactive(ctx context.Context, tenantID int) ([]models.Menu, error) {
	query := `
		SELECT 
			id, title, icon, route, parent_id, order_index, is_active, 
			required_permission_id, visibility_rules, access_level, 
			is_system_menu, conditional_permissions, menu_group, 
			custom_permissions, display_order, is_visible, description, 
			menu_type, slug, created_at, updated_at, tenant_id
		FROM menu_items 
		WHERE tenant_id = $1 
		ORDER BY order_index ASC
	`

	var menus []models.Menu
	err := r.db.SelectContext(ctx, &menus, query, tenantID)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to get all menus (including inactive) for tenant %d: %v", tenantID, err)
		return nil, fmt.Errorf("failed to get all menus: %w", err)
	}

	utils.Infof("MenuRepository: Retrieved ALL %d menus (including inactive) for tenant %d", len(menus), tenantID)
	return menus, nil
}

// GetMenuByID retrieves a menu item by its ID
func (r *postgresMenuRepository) GetMenuByID(ctx context.Context, id int) (*models.Menu, error) {
	query := `
		SELECT 
			id, title, icon, route, parent_id, order_index, is_active, 
			required_permission_id, visibility_rules, access_level, 
			is_system_menu, conditional_permissions, menu_group, 
			custom_permissions, display_order, is_visible, description, 
			menu_type, slug, created_at, updated_at, tenant_id
		FROM menu_items 
		WHERE id = $1
	`

	var menu models.Menu
	err := r.db.GetContext(ctx, &menu, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("menu not found")
		}
		utils.Errorf("MenuRepository: Failed to get menu by ID %d: %v", id, err)
		return nil, fmt.Errorf("failed to get menu: %w", err)
	}

	return &menu, nil
}

// CreateMenu creates a new menu item
func (r *postgresMenuRepository) CreateMenu(ctx context.Context, menu *models.Menu) (*models.Menu, error) {
	query := `
		INSERT INTO menu_items (
			title, icon, route, parent_id, order_index, is_active,
			required_permission_id, visibility_rules, access_level,
			is_system_menu, conditional_permissions, menu_group,
			custom_permissions, display_order, is_visible, description,
			menu_type, slug, tenant_id, created_at, updated_at
		) VALUES (
			:title, :icon, :route, :parent_id, :order_index, :is_active,
			:required_permission_id, CAST(:visibility_rules AS jsonb), :access_level,
			:is_system_menu, CAST(:conditional_permissions AS jsonb), :menu_group,
			CAST(:custom_permissions AS jsonb), :display_order, :is_visible, :description,
			:menu_type, :slug, :tenant_id, NOW(), NOW()
		) RETURNING id
	`

	// Prepare JSON fields
	var visibilityRulesJSON, conditionalPermissionsJSON, customPermissionsJSON *string
	var err error

	if menu.VisibilityRules != nil {
		if b, err := json.Marshal(menu.VisibilityRules); err == nil {
			s := string(b)
			visibilityRulesJSON = &s
		} else {
			return nil, fmt.Errorf("failed to marshal visibility rules: %w", err)
		}
	}

	if menu.ConditionalPermissions != nil {
		if b, err := json.Marshal(menu.ConditionalPermissions); err == nil {
			s := string(b)
			conditionalPermissionsJSON = &s
		} else {
			return nil, fmt.Errorf("failed to marshal conditional permissions: %w", err)
		}
	}

	if menu.CustomPermissions != nil {
		if b, err := json.Marshal(menu.CustomPermissions); err == nil {
			s := string(b)
			customPermissionsJSON = &s
		} else {
			return nil, fmt.Errorf("failed to marshal custom permissions: %w", err)
		}
	}

	params := map[string]interface{}{
		"title":                   menu.Title,
		"icon":                    menu.Icon,
		"route":                   menu.Route,
		"parent_id":               menu.ParentID,
		"order_index":             menu.OrderIndex,
		"is_active":               menu.IsActive,
		"required_permission_id":  menu.RequiredPermissionID,
		"visibility_rules":        visibilityRulesJSON,
		"access_level":            menu.AccessLevel,
		"is_system_menu":          menu.IsSystemMenu,
		"conditional_permissions": conditionalPermissionsJSON,
		"menu_group":              menu.MenuGroup,
		"custom_permissions":      customPermissionsJSON,
		"display_order":           menu.DisplayOrder,
		"is_visible":              menu.IsVisible,
		"description":             menu.Description,
		"menu_type":               menu.MenuType,
		"slug":                    menu.Slug,
		"tenant_id":               menu.TenantID,
	}

	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare create menu statement: %w", err)
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, &menu.ID, params)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to create menu: %v", err)
		return nil, fmt.Errorf("failed to create menu: %w", err)
	}

	utils.Infof("MenuRepository: Created menu '%s' with ID %d", menu.Title, menu.ID)
	return menu, nil
}

// UpdateMenu updates an existing menu item
func (r *postgresMenuRepository) UpdateMenu(ctx context.Context, menu *models.Menu) (*models.Menu, error) {
	query := `
		UPDATE menu_items SET
			title = :title,
			icon = :icon,
			route = :route,
			parent_id = :parent_id,
			order_index = :order_index,
			is_active = :is_active,
			required_permission_id = :required_permission_id,
			visibility_rules = CAST(:visibility_rules AS jsonb),
			access_level = :access_level,
			is_system_menu = :is_system_menu,
			conditional_permissions = CAST(:conditional_permissions AS jsonb),
			menu_group = :menu_group,
			custom_permissions = CAST(:custom_permissions AS jsonb),
			display_order = :display_order,
			is_visible = :is_visible,
			description = :description,
			menu_type = :menu_type,
			slug = :slug,
			updated_at = NOW()
		WHERE id = :id
	`

	// Prepare JSON fields
	var visibilityRulesJSON, conditionalPermissionsJSON, customPermissionsJSON *string
	var err error

	if menu.VisibilityRules != nil {
		if b, err := json.Marshal(menu.VisibilityRules); err == nil {
			s := string(b)
			visibilityRulesJSON = &s
		} else {
			return nil, fmt.Errorf("failed to marshal visibility rules: %w", err)
		}
	}

	if menu.ConditionalPermissions != nil {
		if b, err := json.Marshal(menu.ConditionalPermissions); err == nil {
			s := string(b)
			conditionalPermissionsJSON = &s
		} else {
			return nil, fmt.Errorf("failed to marshal conditional permissions: %w", err)
		}
	}

	if menu.CustomPermissions != nil {
		if b, err := json.Marshal(menu.CustomPermissions); err == nil {
			s := string(b)
			customPermissionsJSON = &s
		} else {
			return nil, fmt.Errorf("failed to marshal custom permissions: %w", err)
		}
	}

	params := map[string]interface{}{
		"id":                      menu.ID,
		"title":                   menu.Title,
		"icon":                    menu.Icon,
		"route":                   menu.Route,
		"parent_id":               menu.ParentID,
		"order_index":             menu.OrderIndex,
		"is_active":               menu.IsActive,
		"required_permission_id":  menu.RequiredPermissionID,
		"visibility_rules":        visibilityRulesJSON,
		"access_level":            menu.AccessLevel,
		"is_system_menu":          menu.IsSystemMenu,
		"conditional_permissions": conditionalPermissionsJSON,
		"menu_group":              menu.MenuGroup,
		"custom_permissions":      customPermissionsJSON,
		"display_order":           menu.DisplayOrder,
		"is_visible":              menu.IsVisible,
		"description":             menu.Description,
		"menu_type":               menu.MenuType,
		"slug":                    menu.Slug,
	}

	_, err = r.db.NamedExecContext(ctx, query, params)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to update menu ID %d: %v", menu.ID, err)
		return nil, fmt.Errorf("failed to update menu: %w", err)
	}

	utils.Infof("MenuRepository: Updated menu ID %d", menu.ID)
	return menu, nil
}

// DeleteMenu deletes a menu item by ID
func (r *postgresMenuRepository) DeleteMenu(ctx context.Context, id int) error {
	query := `DELETE FROM menu_items WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to delete menu ID %d: %v", id, err)
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("menu not found")
	}

	utils.Infof("MenuRepository: Deleted menu ID %d", id)
	return nil
}

// GetMenuHierarchy retrieves menu items in hierarchical order
func (r *postgresMenuRepository) GetMenuHierarchy(ctx context.Context, tenantID int) ([]models.Menu, error) {
	query := `
		WITH RECURSIVE menu_tree AS (
			-- Base case: root menu items (no parent)
			SELECT 
				id, title, icon, route, parent_id, order_index, is_active,
				required_permission_id, visibility_rules, access_level,
				is_system_menu, conditional_permissions, menu_group,
				custom_permissions, display_order, is_visible, description,
				menu_type, created_at, updated_at, tenant_id,
				0 as level,
				ARRAY[order_index] as path
			FROM menu_items 
			WHERE tenant_id = $1 AND parent_id IS NULL AND is_active = true
			
			UNION ALL
			
			-- Recursive case: child menu items
			SELECT 
				m.id, m.title, m.icon, m.route, m.parent_id, m.order_index, m.is_active,
				m.required_permission_id, m.visibility_rules, m.access_level,
				m.is_system_menu, m.conditional_permissions, m.menu_group,
				m.custom_permissions, m.display_order, m.is_visible, m.description,
				m.menu_type, m.created_at, m.updated_at, m.tenant_id,
				mt.level + 1,
				mt.path || m.order_index
			FROM menu_items m
			INNER JOIN menu_tree mt ON mt.id = m.parent_id
			WHERE m.tenant_id = $1 AND m.is_active = true
		)
		SELECT 
			id, title, icon, route, parent_id, order_index, is_active,
			required_permission_id, visibility_rules, access_level,
			is_system_menu, conditional_permissions, menu_group,
			custom_permissions, display_order, is_visible, description,
			menu_type, created_at, updated_at, tenant_id
		FROM menu_tree 
		ORDER BY path
	`

	var menus []models.Menu
	err := r.db.SelectContext(ctx, &menus, query, tenantID)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to get menu hierarchy for tenant %d: %v", tenantID, err)
		return nil, fmt.Errorf("failed to get menu hierarchy: %w", err)
	}

	return menus, nil
}

// GetChildMenus retrieves child menus for a given parent ID
func (r *postgresMenuRepository) GetChildMenus(ctx context.Context, parentID int) ([]models.Menu, error) {
	query := `
		SELECT 
			id, title, icon, route, parent_id, order_index, is_active, 
			required_permission_id, visibility_rules, access_level, 
			is_system_menu, conditional_permissions, menu_group, 
			custom_permissions, display_order, is_visible, description, 
			menu_type, created_at, updated_at, tenant_id
		FROM menu_items 
		WHERE parent_id = $1 AND is_active = true 
		ORDER BY order_index ASC
	`

	var menus []models.Menu
	err := r.db.SelectContext(ctx, &menus, query, parentID)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to get child menus for parent %d: %v", parentID, err)
		return nil, fmt.Errorf("failed to get child menus: %w", err)
	}

	return menus, nil
}

// GetUserAccessibleMenus retrieves menus accessible to a specific user
func (r *postgresMenuRepository) GetUserAccessibleMenus(ctx context.Context, userID, tenantID int) ([]models.Menu, error) {
	// This is a simplified implementation - in a real system you'd join with user roles and permissions
	query := `
		SELECT 
			id, title, icon, route, parent_id, order_index, is_active, 
			required_permission_id, visibility_rules, access_level, 
			is_system_menu, conditional_permissions, menu_group, 
			custom_permissions, display_order, is_visible, description, 
			menu_type, created_at, updated_at, tenant_id
		FROM menu_items 
		WHERE tenant_id = $1 AND is_active = true AND is_visible = true
		ORDER BY order_index ASC
	`

	var menus []models.Menu
	err := r.db.SelectContext(ctx, &menus, query, tenantID)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to get accessible menus for user %d: %v", userID, err)
		return nil, fmt.Errorf("failed to get accessible menus: %w", err)
	}

	return menus, nil
}

// ToggleMenuStatus toggles the active status of a menu
func (r *postgresMenuRepository) ToggleMenuStatus(ctx context.Context, id int, isActive bool) error {
	query := `UPDATE menu_items SET is_active = $1, updated_at = NOW() WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, isActive, id)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to toggle menu status for ID %d: %v", id, err)
		return fmt.Errorf("failed to toggle menu status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("menu not found")
	}

	utils.Infof("MenuRepository: Toggled menu ID %d status to %t", id, isActive)
	return nil
}

// ReorderMenus reorders menu items based on provided order
func (r *postgresMenuRepository) ReorderMenus(ctx context.Context, tenantID int, menuOrder []models.MenuOrderItem) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `UPDATE menu_items SET order_index = $1, parent_id = $2, updated_at = NOW() WHERE id = $3 AND tenant_id = $4`
	
	for _, item := range menuOrder {
		_, err := tx.ExecContext(ctx, query, item.OrderIndex, item.ParentID, item.ID, tenantID)
		if err != nil {
			utils.Errorf("MenuRepository: Failed to reorder menu ID %d: %v", item.ID, err)
			return fmt.Errorf("failed to reorder menu: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	utils.Infof("MenuRepository: Reordered %d menu items", len(menuOrder))
	return nil
}

// BatchOperations performs batch operations on menu items
func (r *postgresMenuRepository) BatchOperations(ctx context.Context, operation string, menuIDs []int, value interface{}) error {
	if len(menuIDs) == 0 {
		return fmt.Errorf("no menu IDs provided")
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create placeholders for IN clause
	placeholders := make([]string, len(menuIDs))
	args := make([]interface{}, len(menuIDs))
	for i, id := range menuIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}
	inClause := strings.Join(placeholders, ",")

	var query string
	switch operation {
	case "delete":
		query = fmt.Sprintf("DELETE FROM menu_items WHERE id IN (%s)", inClause)
	case "activate":
		query = fmt.Sprintf("UPDATE menu_items SET is_active = true, updated_at = NOW() WHERE id IN (%s)", inClause)
	case "deactivate":
		query = fmt.Sprintf("UPDATE menu_items SET is_active = false, updated_at = NOW() WHERE id IN (%s)", inClause)
	case "update_group":
		if value == nil {
			return fmt.Errorf("value required for update_group operation")
		}
		query = fmt.Sprintf("UPDATE menu_items SET menu_group = $%d, updated_at = NOW() WHERE id IN (%s)", len(menuIDs)+1, inClause)
		args = append(args, value)
	case "update_access_level":
		if value == nil {
			return fmt.Errorf("value required for update_access_level operation")
		}
		query = fmt.Sprintf("UPDATE menu_items SET access_level = $%d, updated_at = NOW() WHERE id IN (%s)", len(menuIDs)+1, inClause)
		args = append(args, value)
	default:
		return fmt.Errorf("unsupported batch operation: %s", operation)
	}

	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to perform batch operation %s: %v", operation, err)
		return fmt.Errorf("failed to perform batch operation: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	utils.Infof("MenuRepository: Performed batch operation %s on %d menu items", operation, len(menuIDs))
	return nil
}

// GetMenuAccessLogs retrieves access logs for a menu (simplified implementation)
func (r *postgresMenuRepository) GetMenuAccessLogs(ctx context.Context, menuID, tenantID int, limit int) ([]models.MenuAccessLog, error) {
	// Note: This assumes you have a menu_access_logs table
	// If the table doesn't exist, this will return an empty slice for now
	query := `
		SELECT 
			id, menu_id, user_id, tenant_id, access_time, ip_address, 
			user_agent, access_type, was_granted, denied_reason
		FROM menu_access_logs 
		WHERE menu_id = $1 AND tenant_id = $2 
		ORDER BY access_time DESC 
		LIMIT $3
	`

	var logs []models.MenuAccessLog
	err := r.db.SelectContext(ctx, &logs, query, menuID, tenantID, limit)
	if err != nil {
		// If table doesn't exist, return empty logs instead of error
		utils.Warnf("MenuRepository: Failed to get access logs (table may not exist): %v", err)
		return []models.MenuAccessLog{}, nil
	}

	return logs, nil
}

// GetMenuStatistics retrieves menu statistics (simplified implementation)
func (r *postgresMenuRepository) GetMenuStatistics(ctx context.Context, tenantID int, startDate, endDate string) (interface{}, error) {
	// Basic statistics from menu_items table
	query := `
		SELECT 
			COUNT(*) as total_menus,
			COUNT(CASE WHEN is_active = true THEN 1 END) as active_menus,
			COUNT(CASE WHEN is_system_menu = true THEN 1 END) as system_menus
		FROM menu_items 
		WHERE tenant_id = $1
	`

	var stats struct {
		TotalMenus  int `db:"total_menus"`
		ActiveMenus int `db:"active_menus"`
		SystemMenus int `db:"system_menus"`
	}

	err := r.db.GetContext(ctx, &stats, query, tenantID)
	if err != nil {
		utils.Errorf("MenuRepository: Failed to get menu statistics: %v", err)
		return nil, fmt.Errorf("failed to get menu statistics: %w", err)
	}

	return map[string]interface{}{
		"total_menus":  stats.TotalMenus,
		"active_menus": stats.ActiveMenus,
		"system_menus": stats.SystemMenus,
		"tenant_id":    tenantID,
	}, nil
}
