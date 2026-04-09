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

	utils.Info("Database migration completed successfully.")
	return nil
}
