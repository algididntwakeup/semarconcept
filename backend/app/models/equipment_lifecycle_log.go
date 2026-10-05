// platform/backend/app/models/equipment_lifecycle_log.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// EquipmentLifecycleAction is the constrained set of lifecycle transitions
// recorded in the audit trail. The values are shared with the Equipment Master
// row Lifecycle menu so a UI action maps to exactly one stored action.
type EquipmentLifecycleAction = string

const (
	LifecycleActionRelocate     EquipmentLifecycleAction = "Relocate"
	LifecycleActionInstall      EquipmentLifecycleAction = "Install"
	LifecycleActionUninstall    EquipmentLifecycleAction = "Uninstall"
	LifecycleActionRepair       EquipmentLifecycleAction = "Repair"
	LifecycleActionRetire       EquipmentLifecycleAction = "Retire"
	LifecycleActionCondemn      EquipmentLifecycleAction = "Condemn"
	LifecycleActionSendToRepair EquipmentLifecycleAction = "Send to repair"
)

// EquipmentLifecycleActions lists every allowed action in a stable order. It is
// used to build the database CHECK constraint and to validate writes.
var EquipmentLifecycleActions = []EquipmentLifecycleAction{
	LifecycleActionRelocate,
	LifecycleActionInstall,
	LifecycleActionUninstall,
	LifecycleActionRepair,
	LifecycleActionRetire,
	LifecycleActionCondemn,
	LifecycleActionSendToRepair,
}

// IsValidEquipmentLifecycleAction reports whether action is one of the allowed
// lifecycle transitions.
func IsValidEquipmentLifecycleAction(action string) bool {
	for _, allowed := range EquipmentLifecycleActions {
		if allowed == action {
			return true
		}
	}
	return false
}

// EquipmentLifecycleLog records one lifecycle change for an equipment asset so
// the timeline view and audits can reconstruct its history: who changed what,
// from which value to which value, when, and why.
type EquipmentLifecycleLog struct {
	ID       int `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID int `gorm:"index;not null;index:idx_lifecycle_tenant_equipment,priority:1" db:"tenant_id" json:"tenant_id"`
	// EquipmentID references the asset whose lifecycle changed.
	EquipmentID int                      `gorm:"not null;index;index:idx_lifecycle_tenant_equipment,priority:2" db:"equipment_id" json:"equipment_id"`
	Action      EquipmentLifecycleAction `gorm:"size:50;not null;index" db:"action" json:"action"`
	OldValue    *string                  `gorm:"type:text" db:"old_value" json:"old_value,omitempty"`
	NewValue    *string                  `gorm:"type:text" db:"new_value" json:"new_value,omitempty"`
	Remarks     *string                  `gorm:"type:text" db:"remarks" json:"remarks,omitempty"`
	CreatedBy   *int                     `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	CreatedAt   time.Time                `gorm:"index" db:"created_at" json:"created_at"`
	UpdatedAt   time.Time                `db:"updated_at" json:"updated_at"`

	// Relationships
	Tenant    *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Equipment *Asset  `gorm:"foreignKey:EquipmentID" json:"equipment,omitempty"`
}

// Table name
func (EquipmentLifecycleLog) TableName() string {
	return "equipment_lifecycle_logs"
}

// Validate rejects an unknown action before the database CHECK constraint does.
func (l *EquipmentLifecycleLog) Validate() error {
	if l.EquipmentID <= 0 {
		return fmt.Errorf("equipment ID is required")
	}
	if !IsValidEquipmentLifecycleAction(l.Action) {
		return fmt.Errorf("invalid lifecycle action %q", l.Action)
	}
	return nil
}

// BeforeCreate hook
func (l *EquipmentLifecycleLog) BeforeCreate(tx *gorm.DB) error {
	return l.Validate()
}
