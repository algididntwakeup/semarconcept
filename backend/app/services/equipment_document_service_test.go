// platform/backend/app/services/equipment_document_service_test.go

package services_test

import (
	"bytes"
	"context"
	"mime/multipart"
	"net/textproto"
	"os"
	"path/filepath"
	"testing"

	"backend/app/models"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// mockEquipmentDocumentRepository captures the row the service writes.
type mockEquipmentDocumentRepository struct {
	mock.Mock
}

func (m *mockEquipmentDocumentRepository) ListByEquipment(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentDocument, error) {
	args := m.Called(ctx, tenantID, equipmentID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.EquipmentDocument), args.Error(1)
}

func (m *mockEquipmentDocumentRepository) Create(ctx context.Context, document *models.EquipmentDocument) error {
	args := m.Called(ctx, document)
	return args.Error(0)
}

func (m *mockEquipmentDocumentRepository) FindByID(ctx context.Context, tenantID, id int) (*models.EquipmentDocument, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.EquipmentDocument), args.Error(1)
}

func (m *mockEquipmentDocumentRepository) Delete(ctx context.Context, tenantID, id int) error {
	args := m.Called(ctx, tenantID, id)
	return args.Error(0)
}

// fileHeaderFor builds a multipart.FileHeader backed by an in-memory file.
func fileHeaderFor(t *testing.T, name string, content []byte) *multipart.FileHeader {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreatePart(textproto.MIMEHeader{
		"Content-Disposition": {`form-data; name="file"; filename="` + name + `"`},
		"Content-Type":        {"application/octet-stream"},
	})
	assert.NoError(t, err)
	_, err = part.Write(content)
	assert.NoError(t, err)
	assert.NoError(t, writer.Close())

	reader := multipart.NewReader(&body, writer.Boundary())
	form, err := reader.ReadForm(int64(len(content)) + 1024)
	assert.NoError(t, err)
	t.Cleanup(func() { _ = form.RemoveAll() })
	files := form.File["file"]
	assert.NotEmpty(t, files)
	return files[0]
}

func TestEquipmentDocumentService_UploadStoresFileAndMetadata(t *testing.T) {
	ctx := context.Background()
	repo := new(mockEquipmentDocumentRepository)
	storage := t.TempDir()

	repo.On("Create", ctx, mock.MatchedBy(func(document *models.EquipmentDocument) bool {
		return document.TenantID == 7 && document.EquipmentID == 42 &&
			document.FileName == "drawing.pdf" &&
			document.FileType == models.EquipmentDocumentTypeDrawing &&
			document.FileSize == 12 &&
			len(document.FileURL) > 0
	})).Return(nil).Once()

	service := services.NewEquipmentDocumentService(repo, storage)
	document, err := service.Upload(ctx, 7, 42, 3, fileHeaderFor(t, "drawing.pdf", []byte("pdf-content!")), "Drawing")
	assert.NoError(t, err)
	assert.NotNil(t, document)
	assert.Contains(t, document.FileURL, "/static/uploads/equipments/42/")

	// The physical file lands under the equipment folder.
	relative := filepath.Join("equipments", "42")
	entries, err := os.ReadDir(filepath.Join(storage, relative))
	assert.NoError(t, err)
	assert.Len(t, entries, 1)
	repo.AssertExpectations(t)
}

func TestEquipmentDocumentService_UploadRejectsUnsupportedExtension(t *testing.T) {
	ctx := context.Background()
	repo := new(mockEquipmentDocumentRepository)
	service := services.NewEquipmentDocumentService(repo, t.TempDir())

	_, err := service.Upload(ctx, 7, 42, 3, fileHeaderFor(t, "malware.exe", []byte("nope")), "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unsupported file type")
	repo.AssertNotCalled(t, "Create", mock.Anything, mock.Anything)
}

func TestEquipmentDocumentService_UploadRejectsOversizeFile(t *testing.T) {
	ctx := context.Background()
	repo := new(mockEquipmentDocumentRepository)
	service := services.NewEquipmentDocumentService(repo, t.TempDir())

	header := fileHeaderFor(t, "big.pdf", []byte("small"))
	// Simulate a size beyond the 10 MB limit without allocating it.
	header.Size = services.MaxEquipmentDocumentSize + 1

	_, err := service.Upload(ctx, 7, 42, 3, header, "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "10 MB")
	repo.AssertNotCalled(t, "Create", mock.Anything, mock.Anything)
}

func TestEquipmentDocumentService_UploadKeepsImagesAsImages(t *testing.T) {
	ctx := context.Background()
	repo := new(mockEquipmentDocumentRepository)
	repo.On("Create", ctx, mock.MatchedBy(func(document *models.EquipmentDocument) bool {
		// An image stays an image even when the File tab category is passed.
		return document.FileType == models.EquipmentDocumentTypeImage
	})).Return(nil).Once()

	service := services.NewEquipmentDocumentService(repo, t.TempDir())
	document, err := service.Upload(ctx, 7, 42, 3, fileHeaderFor(t, "photo.png", []byte("png-bytes")), "Document")
	assert.NoError(t, err)
	assert.Equal(t, models.EquipmentDocumentTypeImage, document.FileType)
	repo.AssertExpectations(t)
}

func TestEquipmentDocumentService_UploadRemovesFileWhenMetadataFails(t *testing.T) {
	ctx := context.Background()
	repo := new(mockEquipmentDocumentRepository)
	repo.On("Create", ctx, mock.Anything).Return(assert.AnError).Once()
	storage := t.TempDir()

	service := services.NewEquipmentDocumentService(repo, storage)
	_, err := service.Upload(ctx, 7, 42, 3, fileHeaderFor(t, "drawing.pdf", []byte("pdf-content!")), "Drawing")
	assert.Error(t, err)

	// No orphaned file remains on disk.
	entries, readErr := os.ReadDir(filepath.Join(storage, "equipments", "42"))
	assert.NoError(t, readErr)
	assert.Empty(t, entries)
	repo.AssertExpectations(t)
}

func TestEquipmentDocumentService_ListDelegatesToRepository(t *testing.T) {
	ctx := context.Background()
	repo := new(mockEquipmentDocumentRepository)
	expected := []models.EquipmentDocument{{ID: 1, EquipmentID: 42, FileName: "a.pdf"}}
	repo.On("ListByEquipment", ctx, 7, 42).Return(expected, nil).Once()

	service := services.NewEquipmentDocumentService(repo, t.TempDir())
	documents, err := service.List(ctx, 7, 42)
	assert.NoError(t, err)
	assert.Equal(t, expected, documents)
	repo.AssertExpectations(t)
}

var _ repositories.EquipmentDocumentRepository = (*mockEquipmentDocumentRepository)(nil)
