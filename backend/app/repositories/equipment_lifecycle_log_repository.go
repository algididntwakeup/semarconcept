// platform/backend/app/repositories/equipment_lifecycle_log_repository.go

package repositories

import (
	"context"
	"fmt"

	"backend/app/models"

	"github.com/jmoiron/sqlx"
)

// EquipmentLifecycleLogRepository appends to the equipment audit trail.
type EquipmentLifecycleLogRepository interface {
	// Create appends one audit entry. Entries are append-only: there is no
	// update or delete, so the trail stays trustworthy.
	Create(ctx context.Context, log *models.EquipmentLifecycleLog) error
	// ListByEquipment returns an equipment's audit entries, newest first.
	ListByEquipment(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentLifecycleLog, error)
}

type equipmentLifecycleLogRepository struct {
	db *sqlx.DB
}

// NewEquipmentLifecycleLogRepository creates the repository over the shared DB.
func NewEquipmentLifecycleLogRepository(db *sqlx.DB) EquipmentLifecycleLogRepository {
	return &equipmentLifecycleLogRepository{db: db}
}

func (r *equipmentLifecycleLogRepository) Create(ctx context.Context, log *models.EquipmentLifecycleLog) error {
	if log == nil {
		return fmt.Errorf("create equipment lifecycle log: nil log")
	}
	err := r.db.GetContext(ctx, log, `
		INSERT INTO equipment_lifecycle_logs (tenant_id, equipment_id, action, old_value, new_value, remarks, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, created_at, updated_at`,
		log.TenantID, log.EquipmentID, log.Action, log.OldValue, log.NewValue, log.Remarks, log.CreatedBy)
	if err != nil {
		return fmt.Errorf("create equipment lifecycle log for equipment %d: %w", log.EquipmentID, err)
	}
	return nil
}

func (r *equipmentLifecycleLogRepository) ListByEquipment(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentLifecycleLog, error) {
	logs := make([]models.EquipmentLifecycleLog, 0)
	err := r.db.SelectContext(ctx, &logs, `
		SELECT id, tenant_id, equipment_id, action, old_value, new_value, remarks, created_by, created_at, updated_at
		FROM equipment_lifecycle_logs
		WHERE tenant_id = $1 AND equipment_id = $2
		ORDER BY created_at DESC, id DESC`, tenantID, equipmentID)
	if err != nil {
		return nil, fmt.Errorf("list equipment lifecycle logs for equipment %d: %w", equipmentID, err)
	}
	return logs, nil
}
