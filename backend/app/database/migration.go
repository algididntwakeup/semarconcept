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
	// has_funcloc is derived during import from the Funcloc column so the
	// statistics endpoint can count assets with and without a functional
	// location. AutoMigrate creates the column; this explicit statement keeps
	// the migration reviewable and idempotent for existing deployments.
	if err := db.Exec(`ALTER TABLE assets ADD COLUMN IF NOT EXISTS has_funcloc BOOLEAN NOT NULL DEFAULT FALSE`).Error; err != nil {
		utils.Errorf("Failed to ensure assets.has_funcloc column: %v", err)
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_assets_has_funcloc ON assets (has_funcloc)`).Error; err != nil {
		utils.Errorf("Failed to create assets.has_funcloc index: %v", err)
		return err
	}
	// Backfill rows imported before the flag existed: an asset has a functional
	// location when its imported JSONB carries the parsed funcloc code.
	if err := db.Exec(`UPDATE assets SET has_funcloc = TRUE WHERE has_funcloc = FALSE AND NULLIF(BTRIM(COALESCE(rbi_properties->>'parent_funcloc_code', '')), '') IS NOT NULL`).Error; err != nil {
		utils.Warnf("Could not backfill assets.has_funcloc from rbi_properties: %v", err)
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
	if err := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_unique_tag_number ON assets (tag_number)`).Error; err != nil {
		utils.Errorf("Failed to create unique asset tag index: %v", err)
		return err
	}

	utils.Info("Database migration completed successfully.")
	return nil
}
