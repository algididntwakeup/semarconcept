package database

import (
	"backend/app/models"
	"backend/app/utils"
	"gorm.io/gorm"
)

// MigrateAll ensures all database tables exist and are up to date
func MigrateAll(db *gorm.DB) error {
	utils.Info("Running full database migration...")

	// Rename the legacy functional-location column to installed_floc_id before
	// AutoMigrate runs: AutoMigrate would otherwise add a brand-new
	// installed_floc_id column next to the old one, leaving two similar
	// columns. The old column self-referenced assets; the new foreign key
	// points at functional_locations. Existing data is all NULL in current
	// deployments, so the rename preserves the column's meaning as "the FLOC
	// where this equipment is installed".
	if err := db.Exec(`ALTER TABLE assets RENAME COLUMN functional_location_id TO installed_floc_id`).Error; err != nil {
		utils.Warnf("Could not rename assets.functional_location_id (already renamed?): %v", err)
	}

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
		&models.FunctionalLocation{},
		&models.Asset{},
		&models.EquipmentLifecycleLog{},
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
	// Deployments that ran an intermediate migration may still carry the legacy
	// functional_location_id column beside installed_floc_id. The legacy column
	// self-referenced assets (not functional_locations), so its values cannot be
	// migrated safely; drop it once it is empty and warn when data remains.
	if err := db.Exec(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'assets' AND column_name = 'functional_location_id'
			) THEN
				IF EXISTS (SELECT 1 FROM assets WHERE functional_location_id IS NOT NULL) THEN
					RAISE WARNING 'assets.functional_location_id still holds data; keeping column for manual review';
				ELSE
					ALTER TABLE assets DROP COLUMN functional_location_id;
				END IF;
			END IF;
		END $$;`).Error; err != nil {
		utils.Warnf("Could not clean up legacy assets.functional_location_id column: %v", err)
	}
	// AutoMigrate cannot change an existing index's uniqueness, so an index
	// created by an earlier revision may still be non-unique. Recreate it to
	// enforce one code per tenant.
	if err := db.Exec(`DROP INDEX IF EXISTS idx_floc_tenant_code`).Error; err != nil {
		utils.Warnf("Could not drop functional_locations tenant/code index: %v", err)
	}
	if err := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_floc_tenant_code ON functional_locations (tenant_id, code)`).Error; err != nil {
		utils.Errorf("Failed to create unique functional_locations tenant/code index: %v", err)
		return err
	}
	// ISO 14224 functional hierarchy depth must stay within 1..8.
	if err := db.Exec(`ALTER TABLE functional_locations DROP CONSTRAINT IF EXISTS chk_floc_level_range`).Error; err != nil {
		utils.Warnf("Could not drop existing functional_locations level constraint: %v", err)
	}
	if err := db.Exec(`ALTER TABLE functional_locations ADD CONSTRAINT chk_floc_level_range CHECK (level >= 1 AND level <= 8)`).Error; err != nil {
		utils.Errorf("Failed to add functional_locations level range constraint: %v", err)
		return err
	}
	// Lifecycle actions are a closed set shared with the UI menus.
	if err := db.Exec(`ALTER TABLE equipment_lifecycle_logs DROP CONSTRAINT IF EXISTS chk_lifecycle_action`).Error; err != nil {
		utils.Warnf("Could not drop existing lifecycle action constraint: %v", err)
	}
	if err := db.Exec(`ALTER TABLE equipment_lifecycle_logs ADD CONSTRAINT chk_lifecycle_action CHECK (action IN ('Relocate','Install','Uninstall','Repair','Retire','Condemn','Send to repair'))`).Error; err != nil {
		utils.Errorf("Failed to add equipment_lifecycle_logs action constraint: %v", err)
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_lifecycle_equipment_created ON equipment_lifecycle_logs (equipment_id, created_at DESC)`).Error; err != nil {
		utils.Errorf("Failed to create equipment_lifecycle_logs timeline index: %v", err)
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_assets_installed_floc_id ON assets (installed_floc_id)`).Error; err != nil {
		utils.Errorf("Failed to create assets.installed_floc_id index: %v", err)
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
