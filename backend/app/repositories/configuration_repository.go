// platform/backend/app/repositories/configuration_repository.go

package repositories

import (
	"backend/app/models"
	"context"
)

// ConfigurationRepository defines the interface for configuration data operations.
type ConfigurationRepository interface {
	Create(ctx context.Context, config *models.SystemConfig) error
	GetByID(ctx context.Context, id uint) (*models.SystemConfig, error)
	GetByKey(ctx context.Context, key string) (*models.SystemConfig, error)
	ListAll(ctx context.Context) ([]models.SystemConfig, error)
	ListByCategory(ctx context.Context, categoryName string) ([]models.SystemConfig, error)
	Update(ctx context.Context, config *models.SystemConfig) error
	Delete(ctx context.Context, id uint) error
}
