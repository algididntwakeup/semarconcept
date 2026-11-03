package database

import (
	"backend/app/models"
	"backend/app/utils"
	"log"

	"gorm.io/gorm"
)

// pipingClassDefaults is the built-in piping-class master data. It stands in
// for the engineering master list until the real one is supplied; the Risk
// Analysis tab reads it through the asset's piping class code.
var pipingClassDefaults = []models.PipingClass{
	{Code: "A1A", Material: "Carbon Steel", CorrosionAllowance: "1.6", PipeSchedule: "SCH160", RatingClass: "150#RF", NominalPipeSize: "1"},
	{Code: "A1B", Material: "Carbon Steel", CorrosionAllowance: "3.0", PipeSchedule: "SCH80", RatingClass: "300#RF", NominalPipeSize: "2"},
	{Code: "D1A", Material: "Stainless Steel", CorrosionAllowance: "0.0", PipeSchedule: "SCH40S", RatingClass: "150#RF", NominalPipeSize: "3"},
	{Code: "K1A", Material: "Duplex Stainless Steel", CorrosionAllowance: "0.5", PipeSchedule: "SCH80S", RatingClass: "600#RF", NominalPipeSize: "4"},
}

// SeedPipingClasses inserts the built-in piping-class master for a tenant.
// Existing codes are left untouched so engineering edits survive a restart.
func (s *Seeder) SeedPipingClasses(tenantID int) error {
	if tenantID <= 0 {
		return nil
	}
	created := 0
	for _, entry := range pipingClassDefaults {
		var existing models.PipingClass
		err := s.DB.Where("tenant_id = ? AND code = ?", tenantID, entry.Code).First(&existing).Error
		if err == nil {
			continue
		}
		if err != gorm.ErrRecordNotFound {
			return err
		}
		row := entry
		row.TenantID = tenantID
		if err := s.DB.Create(&row).Error; err != nil {
			return err
		}
		created++
	}
	if created > 0 {
		log.Printf("Seeded %d piping classes for tenant %d", created, tenantID)
	}
	return nil
}

// SeedPipingClassesForAllTenants backfills the master for existing tenants.
func (s *Seeder) SeedPipingClassesForAllTenants() error {
	var tenantIDs []int
	if err := s.DB.Model(&models.Tenant{}).Pluck("id", &tenantIDs).Error; err != nil {
		utils.Warnf("Could not list tenants for piping class seeding: %v", err)
		return err
	}
	for _, tenantID := range tenantIDs {
		if err := s.SeedPipingClasses(tenantID); err != nil {
			return err
		}
	}
	return nil
}
