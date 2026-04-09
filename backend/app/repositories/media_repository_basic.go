// platform/backend/app/repositories/media_repository_basic.go

package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"backend/app/models"

	"github.com/jmoiron/sqlx"
)

// basicMediaRepository implements a simplified MediaRepository interface.
type basicMediaRepository struct {
	db *sqlx.DB
}

// NewBasicMediaRepository creates a new instance of basicMediaRepository.
func NewBasicMediaRepository(db *sqlx.DB) MediaRepository {
	if db == nil {
		log.Fatal("repositories: NewBasicMediaRepository requires a non-nil *sqlx.DB")
	}
	return &basicMediaRepository{db: db}
}

func (r *basicMediaRepository) Create(ctx context.Context, media *models.Media) error {
	// Validate media before creating
	if err := media.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Check if ID is not set (should be auto-generated)
	if media.ID != 0 {
		return errors.New("ID should not be set for new media records")
	}

	// Sync legacy fields to database fields
	if err := media.BeforeSave(); err != nil {
		return fmt.Errorf("failed to prepare media for save: %w", err)
	}

	query := `
        INSERT INTO media_items (
            filename, original_filename, mime_type, file_size, file_path,
            thumbnail_path, metadata, is_active, uploaded_at, uploaded_by, tenant_id
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id`

	err := r.db.QueryRowContext(
		ctx, query,
		media.Filename,
		media.OriginalFilename,
		media.MimeType,
		media.FileSize,
		media.FilePath,
		media.ThumbnailPath,
		media.Metadata,
		media.IsActive,
		media.UploadedAt,
		media.UploadedBy,
		media.TenantID,
	).Scan(&media.ID)

	if err != nil {
		log.Printf("Error creating media record for '%s': %v", media.Filename, err)
		return fmt.Errorf("failed to create media record: %w", err)
	}

	log.Printf("Media record created successfully for '%s' with ID: %d", media.Filename, media.ID)
	return nil
}

func (r *basicMediaRepository) GetByID(ctx context.Context, id interface{}) (*models.Media, error) {
	// Convert interface{} to int
	var mediaID int
	var err error

	switch v := id.(type) {
	case int:
		mediaID = v
	case int64:
		mediaID = int(v)
	case float64:
		mediaID = int(v)
	default:
		return nil, fmt.Errorf("unsupported ID type: %T", id)
	}

	if mediaID <= 0 {
		return nil, errors.New("invalid media ID")
	}

	var media models.Media
	query := `SELECT * FROM media_items WHERE id = $1 AND is_active = true`
	err = r.db.GetContext(ctx, &media, query, mediaID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("media record not found")
		}
		log.Printf("Error getting media record by ID %d: %v", mediaID, err)
		return nil, fmt.Errorf("failed to get media record by ID: %w", err)
	}

	// Populate legacy fields for backward compatibility
	if err := media.AfterFind(); err != nil {
		log.Printf("Warning: failed to populate legacy fields: %v", err)
	}

	return &media, nil
}

func (r *basicMediaRepository) Delete(ctx context.Context, id interface{}) error {
	// Convert interface{} to int
	var mediaID int

	switch v := id.(type) {
	case int:
		mediaID = v
	case int64:
		mediaID = int(v)
	case float64:
		mediaID = int(v)
	default:
		return fmt.Errorf("unsupported ID type: %T", id)
	}

	if mediaID <= 0 {
		return errors.New("invalid media ID")
	}

	// Soft delete by setting is_active = false
	query := `UPDATE media_items SET is_active = false WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, mediaID)
	if err != nil {
		log.Printf("Error deleting media record %d: %v", mediaID, err)
		return fmt.Errorf("failed to delete media record: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("media record not found")
	}

	log.Printf("Media record %d deleted successfully (soft delete).", mediaID)
	return nil
}

func (r *basicMediaRepository) ListByUploader(ctx context.Context, uploaderID interface{}, limit, offset int) ([]models.Media, int64, error) {
	// Convert interface{} to int
	var uploaderIDInt int

	switch v := uploaderID.(type) {
	case int:
		uploaderIDInt = v
	case int64:
		uploaderIDInt = int(v)
	case float64:
		uploaderIDInt = int(v)
	default:
		return nil, 0, fmt.Errorf("unsupported uploader ID type: %T", uploaderID)
	}

	mediaList := []models.Media{}
	var totalCount int64

	countQuery := `SELECT COUNT(*) FROM media_items WHERE uploaded_by = $1 AND is_active = true`
	selectQuery := `SELECT * FROM media_items WHERE uploaded_by = $1 AND is_active = true ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3`

	// Get total count
	err := r.db.GetContext(ctx, &totalCount, countQuery, uploaderIDInt)
	if err != nil {
		log.Printf("Error counting media records for uploader %d: %v", uploaderIDInt, err)
		return nil, 0, fmt.Errorf("failed to count media records: %w", err)
	}

	if totalCount == 0 {
		return mediaList, 0, nil
	}

	// Get the media records
	err = r.db.SelectContext(ctx, &mediaList, selectQuery, uploaderIDInt, limit, offset)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("Error listing media records for uploader %d: %v", uploaderIDInt, err)
		return nil, 0, fmt.Errorf("failed to list media records: %w", err)
	}

	// Populate legacy fields for all records
	for i := range mediaList {
		if err := mediaList[i].AfterFind(); err != nil {
			log.Printf("Warning: failed to populate legacy fields for media %d: %v", mediaList[i].ID, err)
		}
	}

	return mediaList, totalCount, nil
}

func (r *basicMediaRepository) ListByType(ctx context.Context, mimeType string, limit, offset int) ([]models.Media, int64, error) {
	mediaList := []models.Media{}
	var totalCount int64

	countQuery := `SELECT COUNT(*) FROM media_items WHERE mime_type = $1 AND is_active = true`
	selectQuery := `SELECT * FROM media_items WHERE mime_type = $1 AND is_active = true ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3`

	// Get total count
	err := r.db.GetContext(ctx, &totalCount, countQuery, mimeType)
	if err != nil {
		log.Printf("Error counting media records for type %s: %v", mimeType, err)
		return nil, 0, fmt.Errorf("failed to count media records: %w", err)
	}

	if totalCount == 0 {
		return mediaList, 0, nil
	}

	// Get the media records
	err = r.db.SelectContext(ctx, &mediaList, selectQuery, mimeType, limit, offset)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("Error listing media records for type %s: %v", mimeType, err)
		return nil, 0, fmt.Errorf("failed to list media records: %w", err)
	}

	// Populate legacy fields for all records
	for i := range mediaList {
		if err := mediaList[i].AfterFind(); err != nil {
			log.Printf("Warning: failed to populate legacy fields for media %d: %v", mediaList[i].ID, err)
		}
	}

	return mediaList, totalCount, nil
}

func (r *basicMediaRepository) UpdateMetadata(ctx context.Context, id interface{}, metadata map[string]interface{}) error {
	// Convert interface{} to int
	var mediaID int

	switch v := id.(type) {
	case int:
		mediaID = v
	case int64:
		mediaID = int(v)
	case float64:
		mediaID = int(v)
	default:
		return fmt.Errorf("unsupported ID type: %T", id)
	}

	if mediaID <= 0 {
		return errors.New("invalid media ID")
	}

	// Simple metadata update - just filename for now
	if filename, ok := metadata["filename"]; ok {
		query := `UPDATE media_items SET filename = $1 WHERE id = $2 AND is_active = true`
		result, err := r.db.ExecContext(ctx, query, filename, mediaID)
		if err != nil {
			return fmt.Errorf("failed to update media metadata: %w", err)
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			return errors.New("media record not found")
		}
	}

	return nil
}

// Simple List method for basic functionality
func (r *basicMediaRepository) List(ctx context.Context, limit, offset int) ([]models.Media, int, error) {
	mediaList := []models.Media{}
	var totalCount int

	countQuery := `SELECT COUNT(*) FROM media_items WHERE is_active = true`
	selectQuery := `SELECT * FROM media_items WHERE is_active = true ORDER BY uploaded_at DESC LIMIT $1 OFFSET $2`

	// Get total count
	err := r.db.GetContext(ctx, &totalCount, countQuery)
	if err != nil {
		log.Printf("Error counting media records: %v", err)
		return nil, 0, fmt.Errorf("failed to count media records: %w", err)
	}

	if totalCount == 0 {
		return mediaList, 0, nil
	}

	// Get the media records
	err = r.db.SelectContext(ctx, &mediaList, selectQuery, limit, offset)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("Error listing media records: %v", err)
		return nil, 0, fmt.Errorf("failed to list media records: %w", err)
	}

	// Populate legacy fields for all records
	for i := range mediaList {
		if err := mediaList[i].AfterFind(); err != nil {
			log.Printf("Warning: failed to populate legacy fields for media %d: %v", mediaList[i].ID, err)
		}
	}

	return mediaList, totalCount, nil
}

// Ensure implementation satisfies interface
var _ MediaRepository = (*basicMediaRepository)(nil)
