// platform/backend/app/repositories/piping_class_repository.go

package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"backend/app/models"

	"github.com/jmoiron/sqlx"
)

// PipingClassRepository reads the tenant's piping-class master data.
type PipingClassRepository interface {
	// FindByCode loads one class by its (case-insensitive) code for a tenant.
	// It returns nil, nil when the code is unknown so callers can degrade
	// gracefully instead of failing the whole request.
	FindByCode(ctx context.Context, tenantID int, code string) (*models.PipingClass, error)
}

type pipingClassRepository struct {
	db *sqlx.DB
}

// NewPipingClassRepository creates the repository over the shared DB.
func NewPipingClassRepository(db *sqlx.DB) PipingClassRepository {
	return &pipingClassRepository{db: db}
}

func (r *pipingClassRepository) FindByCode(ctx context.Context, tenantID int, code string) (*models.PipingClass, error) {
	var class models.PipingClass
	err := r.db.GetContext(ctx, &class, `
		SELECT id, tenant_id, code, material, corrosion_allowance, pipe_schedule, rating_class, nominal_pipe_size, created_at, updated_at
		FROM piping_classes
		WHERE tenant_id = $1 AND UPPER(BTRIM(code)) = UPPER(BTRIM($2))`, tenantID, code)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find piping class %q: %w", code, err)
	}
	return &class, nil
}
