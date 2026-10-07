// platform/backend/app/repositories/equipment_document_repository.go

package repositories

import (
	"context"
	"fmt"

	"backend/app/models"

	"github.com/jmoiron/sqlx"
)

// EquipmentDocumentRepository stores the files attached to an asset.
type EquipmentDocumentRepository interface {
	// ListByEquipment returns a tenant's documents for one equipment, newest first.
	ListByEquipment(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentDocument, error)
	// Create inserts one document row and fills its ID/UploadedAt.
	Create(ctx context.Context, document *models.EquipmentDocument) error
	// FindByID loads one document scoped to the tenant.
	FindByID(ctx context.Context, tenantID, id int) (*models.EquipmentDocument, error)
	// Delete removes one document scoped to the tenant.
	Delete(ctx context.Context, tenantID, id int) error
}

type equipmentDocumentRepository struct {
	db *sqlx.DB
}

// NewEquipmentDocumentRepository creates the repository over the shared DB.
func NewEquipmentDocumentRepository(db *sqlx.DB) EquipmentDocumentRepository {
	return &equipmentDocumentRepository{db: db}
}

func (r *equipmentDocumentRepository) ListByEquipment(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentDocument, error) {
	documents := make([]models.EquipmentDocument, 0)
	err := r.db.SelectContext(ctx, &documents, `
		SELECT id, tenant_id, equipment_id, file_name, file_url, file_type, file_size, uploaded_at, uploaded_by
		FROM equipment_documents
		WHERE tenant_id = $1 AND equipment_id = $2
		ORDER BY uploaded_at DESC, id DESC`, tenantID, equipmentID)
	if err != nil {
		return nil, fmt.Errorf("list equipment documents for equipment %d: %w", equipmentID, err)
	}
	return documents, nil
}

func (r *equipmentDocumentRepository) Create(ctx context.Context, document *models.EquipmentDocument) error {
	if document == nil {
		return fmt.Errorf("create equipment document: nil document")
	}
	err := r.db.GetContext(ctx, document, `
		INSERT INTO equipment_documents (tenant_id, equipment_id, file_name, file_url, file_type, file_size, uploaded_by, uploaded_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
		RETURNING id, uploaded_at`,
		document.TenantID, document.EquipmentID, document.FileName, document.FileURL,
		document.FileType, document.FileSize, document.UploadedBy)
	if err != nil {
		return fmt.Errorf("create equipment document %q: %w", document.FileName, err)
	}
	return nil
}

func (r *equipmentDocumentRepository) FindByID(ctx context.Context, tenantID, id int) (*models.EquipmentDocument, error) {
	var document models.EquipmentDocument
	err := r.db.GetContext(ctx, &document, `
		SELECT id, tenant_id, equipment_id, file_name, file_url, file_type, file_size, uploaded_at, uploaded_by
		FROM equipment_documents
		WHERE tenant_id = $1 AND id = $2`, tenantID, id)
	if err != nil {
		return nil, fmt.Errorf("find equipment document %d: %w", id, err)
	}
	return &document, nil
}

func (r *equipmentDocumentRepository) Delete(ctx context.Context, tenantID, id int) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM equipment_documents WHERE tenant_id = $1 AND id = $2`, tenantID, id)
	if err != nil {
		return fmt.Errorf("delete equipment document %d: %w", id, err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete equipment document %d rows affected: %w", id, err)
	}
	if rows == 0 {
		return fmt.Errorf("equipment document %d not found", id)
	}
	return nil
}
