package database

import (
	"backend/app/models"
	"backend/app/utils"
	"log"

	"gorm.io/gorm"
)

// equipmentTaxonomyDefault is the built-in import dictionary. It is the same
// vocabulary the legacy Go maps carried, expressed once as data so every tenant
// starts with a usable dictionary that can then be extended per tenant.
//
// Each entry declares one canonical code and the raw values (aliases) that
// resolve to it. Aliases include the code, the canonical name, the canonical
// label, and the legacy double-code label so that workbooks exported by older
// revisions keep importing correctly.
type equipmentTaxonomyDefault struct {
	kind string
	code string
	name string
	// legacyLabel is an extra alias kept for workbooks written before the label
	// format was simplified; empty when there is nothing extra to add.
	legacyLabel string
}

var equipmentTaxonomyDefaults = []equipmentTaxonomyDefault{
	// Equipment Class.
	{models.EquipmentTaxonomyKindClass, "PI", "Piping", ""},
	{models.EquipmentTaxonomyKindClass, "HX", "Heat Exchangers", ""},
	{models.EquipmentTaxonomyKindClass, "VE", "Pressure Vessels", ""},
	{models.EquipmentTaxonomyKindClass, "TK", "Storage Tanks", ""},
	{models.EquipmentTaxonomyKindClass, "TA", "Storage Tanks", ""},
	{models.EquipmentTaxonomyKindClass, "FS", "Filters And Strainers", ""},
	{models.EquipmentTaxonomyKindClass, "HB", "Heaters And Boilers", ""},
	{models.EquipmentTaxonomyKindClass, "PL", "Piping Line", ""},

	// Equipment Type / piping material.
	{models.EquipmentTaxonomyKindType, "CA", "Carbon Steel", "Carbon Steel (Ca) (CA)"},
	{models.EquipmentTaxonomyKindType, "CS", "Carbon Steel", "Carbon Steel (Cs) (CS)"},
	{models.EquipmentTaxonomyKindType, "SS", "Stainless Steel", "Stainless Steel (Ss) (SS)"},
	{models.EquipmentTaxonomyKindType, "ST", "Shell And Tube", "Shell And Tube (St) (ST)"},
	{models.EquipmentTaxonomyKindType, "AC", "Air Cooled", "Air Cooled (Ac) (AC)"},
	{models.EquipmentTaxonomyKindType, "HE", "Heat Exchanger", "Heat Exchanger (He) (HE)"},
	{models.EquipmentTaxonomyKindType, "SE", "Separator", "Separator (Se) (SE)"},
	{models.EquipmentTaxonomyKindType, "SB", "Scrubber", "Scrubber (Sb) (SB)"},
	{models.EquipmentTaxonomyKindType, "SD", "Surge Drum", "Surge Drum (Sd) (SD)"},
	{models.EquipmentTaxonomyKindType, "AD", "Adsorber", "Adsorber (Ad) (AD)"},
	{models.EquipmentTaxonomyKindType, "FD", "Flash Drum", "Flash Drum (Fd) (FD)"},
	{models.EquipmentTaxonomyKindType, "DC", "Distillation Column", "Distillation Column (Dc) (DC)"},
	{models.EquipmentTaxonomyKindType, "DR", "Dryer", "Dryer (Dr) (DR)"},
	{models.EquipmentTaxonomyKindType, "PT", "Pig Trap", "Pig Trap (Pt) (PT)"},
	{models.EquipmentTaxonomyKindType, "CF", "Cartridge Filter", "Cartridge Filter (Cf) (CF)"},
	{models.EquipmentTaxonomyKindType, "CO", "Coalescer Filter", "Coalescer Filter (Co) (CO)"},
	{models.EquipmentTaxonomyKindType, "PF", "Pressure Filter", "Pressure Filter (Pf) (PF)"},
	{models.EquipmentTaxonomyKindType, "BS", "Basket Strainer", "Basket Strainer (Bs) (BS)"},
	{models.EquipmentTaxonomyKindType, "FR", "Fixed Roof", "Fixed Roof (Fr) (FR)"},
	{models.EquipmentTaxonomyKindType, "DF", "Direct Fired Heater", "Direct Fired Heater (Df) (DF)"},
}

// SeedEquipmentTaxonomy inserts the built-in import dictionary for a tenant.
// Existing rows are left untouched so tenant customisations survive a restart.
func (s *Seeder) SeedEquipmentTaxonomy(tenantID int) error {
	if tenantID <= 0 {
		return nil
	}
	created := 0
	for _, entry := range equipmentTaxonomyDefaults {
		aliases := []interface{}{entry.code, entry.name}
		label := entry.name + " (" + entry.code + ")"
		aliases = append(aliases, label)
		if entry.legacyLabel != "" && entry.legacyLabel != label {
			aliases = append(aliases, entry.legacyLabel)
		}
		var existing models.EquipmentTaxonomyValue
		err := s.DB.Where("tenant_id = ? AND kind = ? AND canonical_code = ?", tenantID, entry.kind, entry.code).First(&existing).Error
		if err == nil {
			continue
		}
		if err != gorm.ErrRecordNotFound {
			return err
		}
		value := models.EquipmentTaxonomyValue{
			TenantID:      tenantID,
			Kind:          entry.kind,
			CanonicalCode: entry.code,
			CanonicalName: entry.name,
			Aliases:       models.JSONBArray(aliases),
			IsActive:      true,
		}
		if err := s.DB.Create(&value).Error; err != nil {
			return err
		}
		created++
	}
	if created > 0 {
		log.Printf("Seeded %d equipment taxonomy values for tenant %d", created, tenantID)
	}
	return nil
}

// SeedEquipmentTaxonomyForAllTenants backfills the import dictionary for every
// tenant so existing installations get the built-in vocabulary without a
// manual step.
func (s *Seeder) SeedEquipmentTaxonomyForAllTenants() error {
	var tenantIDs []int
	if err := s.DB.Model(&models.Tenant{}).Pluck("id", &tenantIDs).Error; err != nil {
		utils.Warnf("Could not list tenants for taxonomy seeding: %v", err)
		return err
	}
	for _, tenantID := range tenantIDs {
		if err := s.SeedEquipmentTaxonomy(tenantID); err != nil {
			return err
		}
	}
	return nil
}
