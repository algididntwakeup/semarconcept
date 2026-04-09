// platform/backend/app/repositories/password_reset_repository.go
package repositories

import (
	"backend/app/models"
	"backend/app/utils" // Added utils import
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

// gormPasswordResetRepository implements PasswordResetRepository using GORM.
type gormPasswordResetRepository struct {
	db *gorm.DB
}

// NewGormPasswordResetRepository creates a new gormPasswordResetRepository.
func NewGormPasswordResetRepository(db *gorm.DB) PasswordResetRepository {
	return &gormPasswordResetRepository{db: db}
}

func (r *gormPasswordResetRepository) Create(ctx context.Context, pr *models.PasswordReset) error {
	result := r.db.WithContext(ctx).Create(pr)
	if result.Error != nil {
		return fmt.Errorf("failed to create password reset token: %w", result.Error)
	}
	return nil
}

func (r *gormPasswordResetRepository) FindByToken(ctx context.Context, token string) (*models.PasswordReset, error) {
	var pr models.PasswordReset
	result := r.db.WithContext(ctx).Where("token = ?", token).Preload("User").First(&pr)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, utils.ErrPasswordResetTokenNotFound // Use defined error
		}
		return nil, fmt.Errorf("failed to find password reset token: %w", result.Error)
	}
	return &pr, nil
}

// Delete method in the interface expects a token string, not an ID.
// This implementation should match the interface.
// If deletion by ID is needed, it should be a different method or not part of this specific interface contract.
func (r *gormPasswordResetRepository) Delete(ctx context.Context, token string) error {
	result := r.db.WithContext(ctx).Where("token = ?", token).Delete(&models.PasswordReset{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete password reset token by token: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		// It's debatable whether this is an error. If the token doesn't exist, it's already "deleted".
		// For now, let's consider it not an error to be idempotent.
		// return utils.ErrPasswordResetTokenNotFound
	}
	return nil
}

// DeleteByUserID deletes all password reset tokens for a specific user.
func (r *gormPasswordResetRepository) DeleteByUserID(ctx context.Context, userID int) error {
	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.PasswordReset{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete password reset tokens for user ID %d: %w", userID, result.Error)
	}
	// It's okay if no tokens were found for the user.
	return nil
}

// DeleteByToken was effectively the same as Delete, so it's removed to avoid redundancy
// and to ensure the Delete method matches the interface.
// func (r *gormPasswordResetRepository) DeleteByToken(ctx context.Context, token string) error { ... }

// Ensure gormPasswordResetRepository satisfies PasswordResetRepository interface
var _ PasswordResetRepository = (*gormPasswordResetRepository)(nil)
