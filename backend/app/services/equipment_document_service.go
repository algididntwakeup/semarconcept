package services

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"backend/app/models"
	"backend/app/repositories"
	"backend/app/utils"

	"github.com/google/uuid"
)

// Equipment document upload rules.
const (
	// MaxEquipmentDocumentSize caps a single upload at 10 MB.
	MaxEquipmentDocumentSize = 10 << 20
	// equipmentDocumentURLPrefix is where the router serves the upload root.
	equipmentDocumentURLPrefix = "/static/uploads"
)

// allowedEquipmentDocumentExtensions is the closed set accepted from the UI:
// PDF, DOCX, XLSX (File tab) and PNG, JPG/JPEG (Image tab).
var allowedEquipmentDocumentExtensions = map[string]string{
	".pdf":  models.EquipmentDocumentTypeDocument,
	".docx": models.EquipmentDocumentTypeDocument,
	".xlsx": models.EquipmentDocumentTypeDocument,
	".png":  models.EquipmentDocumentTypeImage,
	".jpg":  models.EquipmentDocumentTypeImage,
	".jpeg": models.EquipmentDocumentTypeImage,
}

// EquipmentDocumentService stores and lists the files attached to an asset.
type EquipmentDocumentService interface {
	// Upload validates and stores one file, then records its metadata.
	Upload(ctx context.Context, tenantID, equipmentID, userID int, header *multipart.FileHeader, category string) (*models.EquipmentDocument, error)
	// List returns the tenant's documents for one equipment.
	List(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentDocument, error)
	// Delete removes one document row and its stored file.
	Delete(ctx context.Context, tenantID, id int) error
}

type equipmentDocumentService struct {
	repo        repositories.EquipmentDocumentRepository
	storagePath string
}

// NewEquipmentDocumentService stores files under storagePath (the same volume
// the router serves at /static/uploads).
func NewEquipmentDocumentService(repo repositories.EquipmentDocumentRepository, storagePath string) EquipmentDocumentService {
	if strings.TrimSpace(storagePath) == "" {
		storagePath = "./storage/uploads"
	}
	return &equipmentDocumentService{repo: repo, storagePath: storagePath}
}

// Upload validates extension and size, writes the file under
// equipments/<id>/, and records the metadata row.
func (s *equipmentDocumentService) Upload(ctx context.Context, tenantID, equipmentID, userID int, header *multipart.FileHeader, category string) (*models.EquipmentDocument, error) {
	if header == nil {
		return nil, fmt.Errorf("file is required: %w", utils.ErrValidation)
	}
	if header.Size <= 0 {
		return nil, fmt.Errorf("file is empty: %w", utils.ErrValidation)
	}
	if header.Size > MaxEquipmentDocumentSize {
		return nil, fmt.Errorf("file exceeds the 10 MB limit: %w", utils.ErrValidation)
	}

	extension := strings.ToLower(filepath.Ext(header.Filename))
	kind, allowed := allowedEquipmentDocumentExtensions[extension]
	if !allowed {
		return nil, fmt.Errorf("unsupported file type %q (allowed: pdf, docx, xlsx, png, jpg): %w", extension, utils.ErrValidation)
	}

	// The UI may narrow the kind (Drawing, Report, …) but an image stays an image.
	fileType := kind
	if kind != models.EquipmentDocumentTypeImage && category != "" {
		if !models.IsValidEquipmentDocumentType(category) {
			return nil, fmt.Errorf("unknown file category %q: %w", category, utils.ErrValidation)
		}
		fileType = category
	}

	// Keep the original name for display, but store a collision-free name.
	safeName := filepath.Base(header.Filename)
	storedName := uuid.New().String() + extension
	relativeDir := filepath.Join("equipments", fmt.Sprintf("%d", equipmentID))
	relativePath := filepath.Join(relativeDir, storedName)
	fullPath := filepath.Join(s.storagePath, relativePath)
	if err := os.MkdirAll(filepath.Dir(fullPath), os.ModePerm); err != nil {
		return nil, fmt.Errorf("create upload directory: %w", err)
	}

	source, err := header.Open()
	if err != nil {
		return nil, fmt.Errorf("open uploaded file: %w", err)
	}
	defer func() { _ = source.Close() }()

	destination, err := os.Create(fullPath)
	if err != nil {
		return nil, fmt.Errorf("create destination file: %w", err)
	}

	written, copyErr := io.Copy(destination, io.LimitReader(source, MaxEquipmentDocumentSize+1))
	// Close before any cleanup: an open handle cannot be removed on Windows, so
	// a deferred close would leave the orphaned file behind.
	closeErr := destination.Close()
	if copyErr != nil {
		_ = os.Remove(fullPath)
		return nil, fmt.Errorf("write uploaded file: %w", copyErr)
	}
	if closeErr != nil {
		_ = os.Remove(fullPath)
		return nil, fmt.Errorf("finalize uploaded file: %w", closeErr)
	}
	if written > MaxEquipmentDocumentSize {
		_ = os.Remove(fullPath)
		return nil, fmt.Errorf("file exceeds the 10 MB limit: %w", utils.ErrValidation)
	}

	document := &models.EquipmentDocument{
		TenantID:    tenantID,
		EquipmentID: equipmentID,
		FileName:    safeName,
		FileURL:     equipmentDocumentURLPrefix + "/" + filepath.ToSlash(relativePath),
		FileType:    fileType,
		FileSize:    written,
		UploadedBy:  &userID,
	}
	if err := s.repo.Create(ctx, document); err != nil {
		// Do not leave an orphaned file behind when the row fails.
		_ = os.Remove(fullPath)
		return nil, err
	}
	return document, nil
}

// List returns the tenant's documents for one equipment.
func (s *equipmentDocumentService) List(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentDocument, error) {
	return s.repo.ListByEquipment(ctx, tenantID, equipmentID)
}

// Delete removes the metadata row and the stored file (best effort on the file:
// a missing file must not block removing the record).
func (s *equipmentDocumentService) Delete(ctx context.Context, tenantID, id int) error {
	document, err := s.repo.FindByID(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if err := s.repo.Delete(ctx, tenantID, id); err != nil {
		return err
	}
	if document != nil && document.FileURL != "" {
		relative := strings.TrimPrefix(document.FileURL, equipmentDocumentURLPrefix+"/")
		_ = os.Remove(filepath.Join(s.storagePath, filepath.FromSlash(relative)))
	}
	return nil
}
