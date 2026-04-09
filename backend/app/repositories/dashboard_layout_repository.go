// platform/backend/app/repositories/dashboard_layout_repository.go
package repositories

import (
	"backend/app/models"
	"backend/app/utils" // For custom errors like ErrNotFound
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type gormDashboardLayoutRepository struct {
	db *gorm.DB
}

// NewGormDashboardLayoutRepository creates a new instance of DashboardLayoutRepository.
func NewGormDashboardLayoutRepository(db *gorm.DB) DashboardLayoutRepository {
	return &gormDashboardLayoutRepository{db: db}
}

// Create creates a new dashboard layout.
func (r *gormDashboardLayoutRepository) Create(ctx context.Context, dashboard *models.Dashboard) error {
	if err := r.db.WithContext(ctx).Create(dashboard).Error; err != nil {
		// TODO: Check for specific errors like duplicate primary key if dashboard.ID is user-provided and unique
		return fmt.Errorf("failed to create dashboard layout: %w", err)
	}
	return nil
}

// FindByID retrieves a dashboard layout by its ID, ensuring it belongs to the given userID.
func (r *gormDashboardLayoutRepository) FindByID(ctx context.Context, dashboardID string, userID int) (*models.Dashboard, error) {
	var dashboard models.Dashboard
	// First, find the dashboard by ID
	if err := r.db.WithContext(ctx).Where("id = ?", dashboardID).First(&dashboard).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("dashboard layout with ID '%s' not found: %w", dashboardID, utils.ErrNotFound)
		}
		return nil, fmt.Errorf("failed to find dashboard layout by ID '%s': %w", dashboardID, err)
	}

	// Check ownership or if the dashboard is public or shared with the user
	// For now, simple ownership check. Sharing logic would be more complex.
	if dashboard.OwnerUserID != userID && !dashboard.IsPublic {
		// TODO: Implement sharing check here.
		// For now, if not owner and not public, deny access.
		// This might involve checking a DashboardShare table.
		// Example:
		// var share models.DashboardShare
		// errShare := r.db.WithContext(ctx).Where("dashboard_id = ? AND (shared_with_user_id = ? OR shared_with_role_id IN (SELECT role_id FROM user_roles WHERE user_id = ?))", dashboardID, userID, userID).First(&share).Error
		// if errors.Is(errShare, gorm.ErrRecordNotFound) {
		// 	 return nil, fmt.Errorf("access to dashboard layout '%s' denied: %w", dashboardID, utils.ErrForbidden)
		// } else if errShare != nil {
		//   return nil, fmt.Errorf("failed to check share permissions for dashboard '%s': %w", dashboardID, errShare)
		// }
		// If found via share, return dashboard.
		return nil, fmt.Errorf("access to dashboard layout '%s' denied: %w", dashboardID, utils.ErrForbidden)
	}

	return &dashboard, nil
}

// Update updates an existing dashboard layout.
func (r *gormDashboardLayoutRepository) Update(ctx context.Context, dashboard *models.Dashboard) error {
	// Ensure the dashboard belongs to the user trying to update it, or they have edit rights.
	// This check should ideally happen in the service layer before calling update.
	// Here, we assume the service has validated ownership/permissions.
	result := r.db.WithContext(ctx).Model(&models.Dashboard{}).Where("id = ? AND owner_user_id = ?", dashboard.ID, dashboard.OwnerUserID).Updates(dashboard)
	if result.Error != nil {
		return fmt.Errorf("failed to update dashboard layout '%s': %w", dashboard.ID, result.Error)
	}
	if result.RowsAffected == 0 {
		// This could mean the record was not found, or the owner_user_id didn't match.
		// Check if record exists to differentiate.
		var temp models.Dashboard
		if err := r.db.WithContext(ctx).Where("id = ?", dashboard.ID).First(&temp).Error; errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("dashboard layout with ID '%s' not found for update: %w", dashboard.ID, utils.ErrNotFound)
		}
		return fmt.Errorf("failed to update dashboard layout '%s': no rows affected (possibly permission issue or record mismatch): %w", dashboard.ID, utils.ErrForbidden)
	}
	return nil
}

// Delete removes a dashboard layout by its ID, ensuring it belongs to the given userID.
func (r *gormDashboardLayoutRepository) Delete(ctx context.Context, dashboardID string, userID int) error {
	// First, delete associated shares to maintain referential integrity if not handled by DB cascade
	if err := r.db.WithContext(ctx).Where("dashboard_id = ?", dashboardID).Delete(&models.DashboardShare{}).Error; err != nil {
		// Log this error but proceed with dashboard deletion attempt
		utils.Warnf("gormDashboardLayoutRepository.Delete: failed to delete shares for dashboard '%s': %v", dashboardID, err)
	}

	result := r.db.WithContext(ctx).Where("id = ? AND owner_user_id = ?", dashboardID, userID).Delete(&models.Dashboard{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete dashboard layout '%s': %w", dashboardID, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("dashboard layout with ID '%s' not found or not owned by user %d: %w", dashboardID, userID, utils.ErrNotFound)
	}
	return nil
}

// ListByOwner retrieves all dashboard layouts owned by a specific user.
func (r *gormDashboardLayoutRepository) ListByOwner(ctx context.Context, userID int, limit, offset int) ([]models.Dashboard, int64, error) {
	var dashboards []models.Dashboard
	var totalCount int64

	// Count total records for pagination
	if err := r.db.WithContext(ctx).Model(&models.Dashboard{}).Where("owner_user_id = ?", userID).Count(&totalCount).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count dashboard layouts for user %d: %w", userID, err)
	}

	// Fetch paginated records
	query := r.db.WithContext(ctx).Where("owner_user_id = ?", userID)
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Order("updated_at DESC").Find(&dashboards).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list dashboard layouts for user %d: %w", userID, err)
	}
	return dashboards, totalCount, nil
}

// CreateShare creates a new dashboard share record.
func (r *gormDashboardLayoutRepository) CreateShare(ctx context.Context, share *models.DashboardShare) error {
	// Ensure the dashboard exists and is owned by the user creating the share (or they have share permissions)
	// This validation should ideally be in the service layer.
	if err := r.db.WithContext(ctx).Create(share).Error; err != nil {
		return fmt.Errorf("failed to create dashboard share: %w", err)
	}
	return nil
}

// DeleteShare removes a dashboard share record.
// userID is the ID of the user attempting the deletion, to check if they own the dashboard.
func (r *gormDashboardLayoutRepository) DeleteShare(ctx context.Context, shareID int, userID int) error {
	// First, find the share to get the dashboard ID
	var share models.DashboardShare
	if err := r.db.WithContext(ctx).Preload(clause.Associations).First(&share, shareID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("dashboard share with ID %d not found: %w", shareID, utils.ErrNotFound)
		}
		return fmt.Errorf("failed to find dashboard share %d: %w", shareID, err)
	}

	// Check if the user attempting to delete the share owns the dashboard
	if share.Dashboard.OwnerUserID != userID {
		return fmt.Errorf("user %d is not authorized to delete share %d for dashboard '%s': %w", userID, shareID, share.DashboardID, utils.ErrForbidden)
	}

	if err := r.db.WithContext(ctx).Delete(&models.DashboardShare{}, shareID).Error; err != nil {
		return fmt.Errorf("failed to delete dashboard share %d: %w", shareID, err)
	}
	return nil
}

// GetDashboardShares retrieves all shares for a given dashboard.
func (r *gormDashboardLayoutRepository) GetDashboardShares(ctx context.Context, dashboardID string) ([]models.DashboardShare, error) {
	var shares []models.DashboardShare
	if err := r.db.WithContext(ctx).Where("dashboard_id = ?", dashboardID).Preload("User").Preload("Role").Find(&shares).Error; err != nil {
		return nil, fmt.Errorf("failed to get shares for dashboard '%s': %w", dashboardID, err)
	}
	return shares, nil
}

// FindShareByID retrieves a specific dashboard share by its ID.
func (r *gormDashboardLayoutRepository) FindShareByID(ctx context.Context, shareID int) (*models.DashboardShare, error) {
	var share models.DashboardShare
	if err := r.db.WithContext(ctx).Preload(clause.Associations).First(&share, shareID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("dashboard share with ID %d not found: %w", shareID, utils.ErrNotFound)
		}
		return nil, fmt.Errorf("failed to find dashboard share %d: %w", shareID, err)
	}
	return &share, nil
}
