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
	if err := db.Exec(`ALTER TABLE assets ADD COLUMN IF NOT EXISTS rbi_properties JSONB NOT NULL DEFAULT '{}'::jsonb`).Error; err != nil {
		utils.Errorf("Failed to ensure assets.rbi_properties JSONB column: %v", err)
		return err
	}
	if err := db.Exec(`ALTER TABLE assets DROP COLUMN IF EXISTS rb_iproperties`).Error; err != nil {
		utils.Warnf("Could not drop legacy assets.rb_iproperties column: %v", err)
	}
	_ = db.Exec(`ALTER TABLE assets ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP`)
	_ = db.Exec(`ALTER TABLE assets ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP`)
	_ = db.Exec(`UPDATE assets SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`)
	_ = db.Exec(`UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`)

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
