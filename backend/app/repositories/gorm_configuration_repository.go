// platform/backend/app/repositories/gorm_configuration_repository.go

package repositories

import (
	"backend/app/models"
	"context"
	"fmt"
	"log"

	"gorm.io/gorm"
)

// gormConfigurationRepository implements the ConfigurationRepository interface using GORM.
type gormConfigurationRepository struct {
	db *gorm.DB
}

// NewGormConfigurationRepository creates a new GORM-based configuration repository.
func NewGormConfigurationRepository(db *gorm.DB) ConfigurationRepository {
	if db == nil {
		log.Fatal("repositories: NewGormConfigurationRepository requires a non-nil *gorm.DB")
	}
	return &gormConfigurationRepository{db: db}
}

func (r *gormConfigurationRepository) Create(ctx context.Context, config *models.SystemConfig) error {
	result := r.db.WithContext(ctx).Create(config)
	if result.Error != nil {
		log.Printf("Error creating configuration '%s': %v", config.ConfigKey, result.Error)
		return fmt.Errorf("failed to create configuration: %w", result.Error)
	}
	log.Printf("Configuration '%s' created successfully with ID: %d", config.ConfigKey, config.ID)
	return nil
}

func (r *gormConfigurationRepository) GetByID(ctx context.Context, id uint) (*models.SystemConfig, error) {
	var config models.SystemConfig
	result := r.db.WithContext(ctx).First(&config, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("configuration with ID %d not found", id)
		}
		log.Printf("Error getting configuration by ID %d: %v", id, result.Error)
		return nil, fmt.Errorf("failed to get configuration by ID: %w", result.Error)
	}
	return &config, nil
}

func (r *gormConfigurationRepository) GetByKey(ctx context.Context, key string) (*models.SystemConfig, error) {
	var config models.SystemConfig
	result := r.db.WithContext(ctx).Where("config_key = ?", key).First(&config)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("configuration with key '%s' not found", key)
		}
		log.Printf("Error getting configuration by key '%s': %v", key, result.Error)
		return nil, fmt.Errorf("failed to get configuration by key: %w", result.Error)
	}
	return &config, nil
}

func (r *gormConfigurationRepository) ListAll(ctx context.Context) ([]models.SystemConfig, error) {
	var configs []models.SystemConfig
	result := r.db.WithContext(ctx).Find(&configs)
	if result.Error != nil {
		log.Printf("Error listing all configurations: %v", result.Error)
		return nil, fmt.Errorf("failed to list configurations: %w", result.Error)
	}
	return configs, nil
}

func (r *gormConfigurationRepository) ListByCategory(ctx context.Context, categoryName string) ([]models.SystemConfig, error) {
	var configs []models.SystemConfig
	// Join with config_categories table if category name is provided
	result := r.db.WithContext(ctx).
		Joins("LEFT JOIN config_categories ON system_configs.category_id = config_categories.id").
		Where("config_categories.name = ?", categoryName).
		Find(&configs)
	if result.Error != nil {
		log.Printf("Error listing configurations by category '%s': %v", categoryName, result.Error)
		return nil, fmt.Errorf("failed to list configurations by category: %w", result.Error)
	}
	return configs, nil
}

func (r *gormConfigurationRepository) Update(ctx context.Context, config *models.SystemConfig) error {
	result := r.db.WithContext(ctx).Save(config)
	if result.Error != nil {
		log.Printf("Error updating configuration %d: %v", config.ID, result.Error)
		return fmt.Errorf("failed to update configuration: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("configuration with ID %d not found", config.ID)
	}
	log.Printf("Configuration %d updated successfully.", config.ID)
	return nil
}

func (r *gormConfigurationRepository) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(&models.SystemConfig{}, id)
	if result.Error != nil {
		log.Printf("Error deleting configuration %d: %v", id, result.Error)
		return fmt.Errorf("failed to delete configuration: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("configuration with ID %d not found", id)
	}
	log.Printf("Configuration %d deleted successfully.", id)
	return nil
}

// Ensure implementation satisfies interface
var _ ConfigurationRepository = (*gormConfigurationRepository)(nil)
