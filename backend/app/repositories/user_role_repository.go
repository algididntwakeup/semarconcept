// platform/backend/app/repositories/user_role_repository.go
package repositories

import (
	"context"
	"fmt"
	"time"

	"backend/app/models"

	"github.com/jmoiron/sqlx"
)

type userRoleRepository struct {
	db *sqlx.DB
}

// NewUserRoleRepository creates a new UserRoleRepository instance
func NewUserRoleRepository(db *sqlx.DB) UserRoleRepository {
	return &userRoleRepository{db: db}
}

// Interface methods implementation

// AssignRoleToUser assigns a role to a user (interface method)
func (r *userRoleRepository) AssignRoleToUser(ctx context.Context, userID int, roleID int) error {
	// Get user to extract tenant_id for proper isolation
	var tenantID int
	getUserQuery := `SELECT tenant_id FROM public.users WHERE id = $1`
	err := r.db.GetContext(ctx, &tenantID, getUserQuery, userID)
	if err != nil {
		return fmt.Errorf("failed to get user tenant: %w", err)
	}

	// Use the existing AssignRole method with tenant context
	return r.AssignRole(ctx, userID, roleID, tenantID)
}

// RemoveRoleFromUser removes a role from a user (interface method)
func (r *userRoleRepository) RemoveRoleFromUser(ctx context.Context, userID int, roleID int) error {
	// Get user to extract tenant_id for proper isolation
	var tenantID int
	getUserQuery := `SELECT tenant_id FROM public.users WHERE id = $1`
	err := r.db.GetContext(ctx, &tenantID, getUserQuery, userID)
	if err != nil {
		return fmt.Errorf("failed to get user tenant: %w", err)
	}

	// Use the existing RemoveRole method with tenant context
	return r.RemoveRole(ctx, userID, roleID, tenantID)
}

// FindRolesByUserID finds all roles for a user (interface method)
func (r *userRoleRepository) FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error) {
	var roles []models.Role

	query := `
		SELECT r.id, r.name, r.description, r.code, r.tenant_id, r.created_at, r.updated_at, r.deleted_at
		FROM public.roles r
		INNER JOIN public.user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1
		ORDER BY r.name`

	err := r.db.SelectContext(ctx, &roles, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find roles by user ID: %w", err)
	}

	return roles, nil
}

// Existing code - preserving all original functionality

// AssignRole assigns a role to a user
// Aligned with database schema: user_roles(user_id, role_id, created_at, tenant_id)
func (r *userRoleRepository) AssignRole(ctx context.Context, userID, roleID, tenantID int) error {
	query := `
		INSERT INTO public.user_roles (user_id, role_id, tenant_id, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, role_id) DO NOTHING`

	_, err := r.db.ExecContext(ctx, query, userID, roleID, tenantID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to assign role to user: %w", err)
	}

	return nil
}

// RemoveRole removes a role from a user
func (r *userRoleRepository) RemoveRole(ctx context.Context, userID, roleID, tenantID int) error {
	query := `
		DELETE FROM public.user_roles 
		WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3`

	result, err := r.db.ExecContext(ctx, query, userID, roleID, tenantID)
	if err != nil {
		return fmt.Errorf("failed to remove role from user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user role assignment not found")
	}

	return nil
}

// GetUserRoles retrieves all roles for a specific user
func (r *userRoleRepository) GetUserRoles(ctx context.Context, userID, tenantID int) ([]models.UserRole, error) {
	var userRoles []models.UserRole

	query := `
		SELECT ur.user_id, ur.role_id, ur.tenant_id, ur.created_at
		FROM public.user_roles ur
		WHERE ur.user_id = $1 AND ur.tenant_id = $2
		ORDER BY ur.created_at DESC`

	err := r.db.SelectContext(ctx, &userRoles, query, userID, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}

	return userRoles, nil
}

// GetRoleUsers retrieves all users for a specific role
func (r *userRoleRepository) GetRoleUsers(ctx context.Context, roleID, tenantID int) ([]models.UserRole, error) {
	var userRoles []models.UserRole

	query := `
		SELECT ur.user_id, ur.role_id, ur.tenant_id, ur.created_at
		FROM public.user_roles ur
		WHERE ur.role_id = $1 AND ur.tenant_id = $2
		ORDER BY ur.created_at DESC`

	err := r.db.SelectContext(ctx, &userRoles, query, roleID, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role users: %w", err)
	}

	return userRoles, nil
}

// HasRole checks if a user has a specific role
func (r *userRoleRepository) HasRole(ctx context.Context, userID, roleID, tenantID int) (bool, error) {
	var exists bool

	query := `
		SELECT EXISTS(
			SELECT 1 FROM public.user_roles 
			WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3
		)`

	err := r.db.GetContext(ctx, &exists, query, userID, roleID, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check user role: %w", err)
	}

	return exists, nil
}

// ReplaceUserRoles replaces all roles for a user
func (r *userRoleRepository) ReplaceUserRoles(ctx context.Context, userID, tenantID int, roleIDs []int) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Remove all existing roles for the user
	deleteQuery := `DELETE FROM public.user_roles WHERE user_id = $1 AND tenant_id = $2`
	_, err = tx.ExecContext(ctx, deleteQuery, userID, tenantID)
	if err != nil {
		return fmt.Errorf("failed to remove existing roles: %w", err)
	}

	// Insert new roles
	if len(roleIDs) > 0 {
		insertQuery := `
			INSERT INTO public.user_roles (user_id, role_id, tenant_id, created_at)
			VALUES ($1, $2, $3, $4)`

		for _, roleID := range roleIDs {
			_, err = tx.ExecContext(ctx, insertQuery, userID, roleID, tenantID, time.Now())
			if err != nil {
				return fmt.Errorf("failed to assign role %d: %w", roleID, err)
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetUsersByRole retrieves all users with a specific role within a tenant
func (r *userRoleRepository) GetUsersByRole(ctx context.Context, roleName string, tenantID int) ([]models.User, error) {
	var users []models.User

	query := `
		SELECT u.id, u.username, u.email, u.password_hash, u.first_name, u.last_name, u.full_name,
		       u.is_superuser, u.is_admin, u.is_active, u.tenant_id, u.department_id, u.last_login, 
		       u.created_at, u.updated_at, u.deleted_at, u.created_by, u.updated_by
		FROM public.users u
		INNER JOIN public.user_roles ur ON u.id = ur.user_id
		INNER JOIN public.roles r ON ur.role_id = r.id
		WHERE r.name = $1 AND u.tenant_id = $2 AND u.deleted_at IS NULL
		ORDER BY u.first_name, u.last_name`

	err := r.db.SelectContext(ctx, &users, query, roleName, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by role: %w", err)
	}

	return users, nil
}

// BulkAssignRole assigns a role to multiple users
func (r *userRoleRepository) BulkAssignRole(ctx context.Context, userIDs []int, roleID, tenantID int) error {
	if len(userIDs) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO public.user_roles (user_id, role_id, tenant_id, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, role_id) DO NOTHING`

	for _, userID := range userIDs {
		_, err = tx.ExecContext(ctx, query, userID, roleID, tenantID, time.Now())
		if err != nil {
			return fmt.Errorf("failed to assign role to user %d: %w", userID, err)
		}
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// RemoveUserFromAllRoles removes a user from all roles
func (r *userRoleRepository) RemoveUserFromAllRoles(ctx context.Context, userID, tenantID int) error {
	query := `DELETE FROM public.user_roles WHERE user_id = $1 AND tenant_id = $2`

	_, err := r.db.ExecContext(ctx, query, userID, tenantID)
	if err != nil {
		return fmt.Errorf("failed to remove user from all roles: %w", err)
	}

	return nil
}
