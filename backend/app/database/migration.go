package database

import (
	"backend/app/models"
	"backend/app/utils"
	"gorm.io/gorm"
)

// MigrateAll ensures all database tables exist and are up to date
func MigrateAll(db *gorm.DB) error {
	utils.Info("Running full database migration...")

	// Run all models in a single call to handle complex relationships and circular foreign keys
	err := db.AutoMigrate(
		&models.Tenant{},
		&models.Role{},
		&models.Permission{},
		&models.Department{},
		&models.User{},
		&models.UserRole{},
		&models.RolePermission{},
		&models.Site{},
		&models.Unit{},
		&models.Asset{},
		&models.AuditLog{},
		&models.TaxonomyCategory{},
		&models.TaxonomyAttribute{},
		&models.Menu{},
		&models.MenuAccessLog{},
	)

	if err != nil {
		utils.Errorf("Migration failed: %v", err)
		return err
	}

	// The asset registry searches tag numbers with ILIKE '%query%'. A normal
	// B-tree cannot accelerate leading-wildcard searches, so add a trigram GIN
	// index for this PostgreSQL query shape.
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS pg_trgm`).Error; err != nil {
		utils.Errorf("Failed to ensure pg_trgm extension: %v", err)
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_assets_tag_number_trgm ON assets USING gin (tag_number gin_trgm_ops)`).Error; err != nil {
		utils.Errorf("Failed to create asset tag search index: %v", err)
		return err
	}

	utils.Info("Database migration completed successfully.")
	return nil
}
