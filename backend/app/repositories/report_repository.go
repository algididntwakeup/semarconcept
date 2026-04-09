// platform/backend/app/repositories/report_repository.go

package repositories

import (
	"backend/app/models"
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

//  REMOVED: ReportRepository interface declaration (now only in interfaces.go)

// reportRepository implements the ReportRepository interface.
type reportRepository struct {
	db *sqlx.DB
}

// NewReportRepository creates a new ReportRepository implementation.
func NewReportRepository(db *sqlx.DB) ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) CreateTemplate(ctx context.Context, template *models.ReportTemplate) error {
	query := `
		INSERT INTO report_templates (name, description, template_data, parameters, created_by, created_at, updated_at)
		VALUES (:name, :description, :template_data, :parameters, :created_by, :created_at, :updated_at)
		RETURNING id
	`

	rows, err := r.db.NamedQueryContext(ctx, query, template)
	if err != nil {
		return fmt.Errorf("failed to create report template: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		return rows.Scan(&template.ID)
	}

	return fmt.Errorf("failed to get created report template ID")
}

func (r *reportRepository) GetTemplateByID(ctx context.Context, id uint) (*models.ReportTemplate, error) {
	var template models.ReportTemplate
	query := `SELECT * FROM report_templates WHERE id = $1`

	err := r.db.GetContext(ctx, &template, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get report template by ID: %w", err)
	}

	return &template, nil
}

func (r *reportRepository) ListTemplates(ctx context.Context) ([]models.ReportTemplate, error) {
	var templates []models.ReportTemplate
	query := `SELECT * FROM report_templates ORDER BY created_at DESC`

	err := r.db.SelectContext(ctx, &templates, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list report templates: %w", err)
	}

	return templates, nil
}

func (r *reportRepository) UpdateTemplate(ctx context.Context, template *models.ReportTemplate) error {
	query := `
		UPDATE report_templates 
		SET name = :name, description = :description, template_data = :template_data, 
		    parameters = :parameters, updated_at = :updated_at
		WHERE id = :id
	`

	_, err := r.db.NamedExecContext(ctx, query, template)
	if err != nil {
		return fmt.Errorf("failed to update report template: %w", err)
	}

	return nil
}

func (r *reportRepository) DeleteTemplate(ctx context.Context, id uint) error {
	query := `DELETE FROM report_templates WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete report template: %w", err)
	}

	return nil
}

// Ensure implementation satisfies the interface
var _ ReportRepository = (*reportRepository)(nil)
