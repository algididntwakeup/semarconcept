package models

import (
	"strings"
	"time"
)

// EquipmentTaxonomyValue is one tenant-scoped canonical Equipment Class or
// Equipment Type together with the raw inputs ("aliases") that map to it.
//
// The import Data Transformation Layer reads this table so each tenant can
// teach SEMAR its own workbook vocabulary without a code change: a tenant may
// upload "CS", "CARBON STEEL" or "CS-01" and all three resolve to the same
// canonical value. Rows are seeded with the built-in dictionary on tenant
// creation, then extended by the tenant.
//
// The canonical label stored on an asset is `CanonicalName (CanonicalCode)`,
// for example "Piping (PI)" or "Carbon Steel (CA)". Keeping the label in one
// place means the Equipment Master form, the import, the list filters, and the
// statistics all agree.
type EquipmentTaxonomyValue struct {
	ID       int `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID int `gorm:"index;not null;uniqueIndex:idx_equipment_taxonomy_tenant_kind_code,priority:1" db:"tenant_id" json:"tenant_id"`
	// Kind is "class" or "type"; see the EquipmentTaxonomyKind* constants.
	Kind          string `gorm:"size:20;not null;uniqueIndex:idx_equipment_taxonomy_tenant_kind_code,priority:2" db:"kind" json:"kind"`
	CanonicalCode string `gorm:"size:50;not null;uniqueIndex:idx_equipment_taxonomy_tenant_kind_code,priority:3" db:"canonical_code" json:"canonical_code"`
	CanonicalName string `gorm:"size:255;not null" db:"canonical_name" json:"canonical_name"`
	// Aliases holds every raw cell value (any casing) that resolves to this
	// canonical value. Matching is case-insensitive and whitespace-trimmed.
	Aliases   JSONBArray `gorm:"type:jsonb" db:"aliases" json:"aliases"`
	IsActive  bool       `gorm:"default:true" db:"is_active" json:"is_active"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt time.Time  `db:"updated_at" json:"updated_at"`

	Tenant *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// Equipment taxonomy kinds.
const (
	EquipmentTaxonomyKindClass = "class"
	EquipmentTaxonomyKindType  = "type"
)

// TableName returns the physical table name.
func (EquipmentTaxonomyValue) TableName() string {
	return "equipment_taxonomy_values"
}

// Label is the canonical string persisted on assets and shown in the UI.
func (v EquipmentTaxonomyValue) Label() string {
	if v.CanonicalName == "" {
		return v.CanonicalCode
	}
	return v.CanonicalName + " (" + v.CanonicalCode + ")"
}

// AliasList returns the aliases as trimmed, non-empty plain strings.
func (v EquipmentTaxonomyValue) AliasList() []string {
	list := make([]string, 0, len(v.Aliases))
	for _, alias := range v.Aliases {
		if text, ok := alias.(string); ok {
			if trimmed := strings.TrimSpace(text); trimmed != "" {
				list = append(list, trimmed)
			}
		}
	}
	return list
}
