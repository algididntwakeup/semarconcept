// platform/backend/app/services/media_service.go

package services

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"backend/app/models"       // Corrected path
	"backend/app/repositories" // Corrected path

	"github.com/disintegration/imaging" // Added for image processing
	"github.com/google/uuid"
)

const (
	thumbnailWidth  = 300 // Width for generated thumbnails
	thumbnailHeight = 300 // Height for generated thumbnails
	thumbnailSuffix = "_thumb"
)

// MediaService defines the interface for media upload and management.
type MediaService interface {
	UploadFile(ctx context.Context, fileHeader *multipart.FileHeader, uploaderID *int, description string) (*models.Media, error)
	DeleteFile(ctx context.Context, mediaID int) error
	GetMediaURL(media *models.Media) string // Helper to construct URL based on config/media data
	// Add GetThumbnailURL if needed
}

// localMediaService implements MediaService using local filesystem storage.
type localMediaService struct {
	mediaRepo   repositories.MediaRepository
	storagePath string // Base path for storing uploads (e.g., "./storage/uploads")
	baseURL     string // Base URL for accessing uploaded files (e.g., "/static/uploads")
}

// NewLocalMediaService creates a new instance of localMediaService.
// storagePath should be the absolute or relative path to the upload directory.
// baseURL should be the prefix for the public URL of uploaded files.
func NewLocalMediaService(mediaRepo repositories.MediaRepository, storagePath, baseURL string) MediaService {
	if mediaRepo == nil {
		log.Fatal("services: NewLocalMediaService requires a non-nil MediaRepository")
	}
	if storagePath == "" {
		log.Fatal("services: NewLocalMediaService requires a non-empty storagePath")
	}
	// Ensure storage path exists
	if err := os.MkdirAll(storagePath, os.ModePerm); err != nil {
		log.Fatalf("services: Failed to create storage directory '%s': %v", storagePath, err)
	}
	// Ensure baseURL ends with a slash if not empty
	if baseURL != "" && !strings.HasSuffix(baseURL, "/") {
		baseURL += "/"
	}

	log.Printf("MediaService: Initialized with storage path '%s' and base URL '%s'", storagePath, baseURL)
	return &localMediaService{
		mediaRepo:   mediaRepo,
		storagePath: storagePath,
		baseURL:     baseURL,
	}
}

// isSupportedImageType checks if the MIME type is a processable image format.
func isSupportedImageType(mimeType string) bool {
	switch strings.ToLower(mimeType) {
	case "image/jpeg", "image/png", "image/gif": // Add more types if needed (e.g., "image/bmp", "image/tiff")
		return true
	default:
		return false
	}
}

// getThumbnailPath generates the full path for a thumbnail file.
func getThumbnailPath(originalStoragePath, storageBasePath string) string {
	ext := filepath.Ext(originalStoragePath)
	base := strings.TrimSuffix(originalStoragePath, ext)
	thumbRelativePath := base + thumbnailSuffix + ext
	return filepath.Join(storageBasePath, thumbRelativePath)
}

// UploadFile handles saving an uploaded file, creating its metadata record, and generating a thumbnail if it's an image.
func (s *localMediaService) UploadFile(ctx context.Context, fileHeader *multipart.FileHeader, uploaderID *int, description string) (*models.Media, error) {
	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		log.Printf("MediaService: Error opening uploaded file '%s': %v", fileHeader.Filename, err)
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	// Read the first 512 bytes to detect MIME type
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		log.Printf("MediaService: Error reading file header for MIME detection '%s': %v", fileHeader.Filename, err)
		return nil, fmt.Errorf("failed to read file header: %w", err)
	}
	mimeType := http.DetectContentType(buffer[:n]) // Use actual bytes read
	log.Printf("MediaService: Detected MIME type '%s' for file '%s'", mimeType, fileHeader.Filename)

	// Reset file pointer to the beginning
	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		log.Printf("MediaService: Error seeking file start '%s': %v", fileHeader.Filename, err)
		return nil, fmt.Errorf("failed to process file: %w", err)
	}

	// Generate unique filename and storage path
	ext := filepath.Ext(fileHeader.Filename)
	newFilenameBase := uuid.New().String()
	newFilename := newFilenameBase + ext
	year, month, _ := time.Now().Date()
	relativePath := filepath.Join(fmt.Sprintf("%d", year), fmt.Sprintf("%02d", month), newFilename)
	fullStoragePath := filepath.Join(s.storagePath, relativePath)
	thumbStoragePath := "" // Initialize thumbnail path

	// Create subdirectory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(fullStoragePath), os.ModePerm); err != nil {
		log.Printf("MediaService: Error creating subdirectory for '%s': %v", fullStoragePath, err)
		return nil, fmt.Errorf("failed to create storage directory: %w", err)
	}

	// Create the destination file
	dst, err := os.Create(fullStoragePath)
	if err != nil {
		log.Printf("MediaService: Error creating destination file '%s': %v", fullStoragePath, err)
		return nil, fmt.Errorf("failed to create destination file: %w", err)
	}

	// Copy the uploaded file data to the destination file
	_, err = io.Copy(dst, file)
	// Close destination file immediately after copy to allow reading for thumbnail generation
	dst.Close()
	if err != nil {
		log.Printf("MediaService: Error copying file data to '%s': %v", fullStoragePath, err)
		os.Remove(fullStoragePath) // Attempt to remove partially created file
		return nil, fmt.Errorf("failed to save file data: %w", err)
	}

	// --- Thumbnail Generation ---
	if isSupportedImageType(mimeType) {
		thumbStoragePath = getThumbnailPath(relativePath, s.storagePath)
		log.Printf("MediaService: Attempting to generate thumbnail for '%s' at '%s'", fullStoragePath, thumbStoragePath)

		// Open the *saved* original file for reading
		srcFile, err := os.Open(fullStoragePath)
		if err != nil {
			log.Printf("MediaService: Error opening saved file for thumbnail generation '%s': %v", fullStoragePath, err)
			// Don't fail the whole upload, just log the error and skip thumbnail
		} else {
			defer srcFile.Close()
			img, err := imaging.Decode(srcFile) // Use imaging.Decode which handles various formats
			if err != nil {
				log.Printf("MediaService: Error decoding image '%s' for thumbnail: %v", fullStoragePath, err)
				// Don't fail the whole upload, just log the error
			} else {
				thumb := imaging.Thumbnail(img, thumbnailWidth, thumbnailHeight, imaging.Lanczos) // Lanczos is a good quality resampling filter

				// Save the thumbnail
				err = imaging.Save(thumb, thumbStoragePath)
				if err != nil {
					log.Printf("MediaService: Error saving thumbnail '%s': %v", thumbStoragePath, err)
					// Don't fail the whole upload, just log the error
					thumbStoragePath = "" // Reset path if saving failed
				} else {
					log.Printf("MediaService: Thumbnail generated successfully at '%s'", thumbStoragePath)
				}
			}
		}
	}
	// --- End Thumbnail Generation ---

	// Construct the public URL
	urlPath := filepath.ToSlash(relativePath)
	publicURL := s.baseURL + urlPath

	// Create the media record
	media := &models.Media{
		Filename:    fileHeader.Filename, // Original filename
		StoragePath: relativePath,        // Store relative path
		URL:         publicURL,
		MimeType:    mimeType,
		Size:        fileHeader.Size,
		UploadedBy:  uploaderID,
		Description: description,
		// Add ThumbnailURL field here if you modify the model
	}

	if err := media.Validate(); err != nil {
		log.Printf("MediaService: Media validation failed for '%s': %v", media.Filename, err)
		os.Remove(fullStoragePath) // Clean up saved file
		if thumbStoragePath != "" {
			os.Remove(thumbStoragePath) // Clean up thumbnail
		}
		return nil, fmt.Errorf("invalid media data: %w", err)
	}

	// Save metadata to database
	err = s.mediaRepo.Create(ctx, media)
	if err != nil {
		log.Printf("MediaService: Error saving media record for '%s': %v", media.Filename, err)
		os.Remove(fullStoragePath) // Clean up saved file
		if thumbStoragePath != "" {
			os.Remove(thumbStoragePath) // Clean up thumbnail
		}
		return nil, fmt.Errorf("failed to save media record: %w", err)
	}

	log.Printf("MediaService: File '%s' uploaded successfully. Stored at: %s, URL: %s", media.Filename, fullStoragePath, media.URL)
	return media, nil
}

// DeleteFile handles deleting a file record and the corresponding file(s) from storage.
func (s *localMediaService) DeleteFile(ctx context.Context, mediaID int) error {
	// 1. Get media record from DB
	media, err := s.mediaRepo.GetByID(ctx, mediaID)
	if err != nil {
		log.Printf("MediaService: Error getting media record %d for deletion: %v", mediaID, err)
		if err.Error() == "media record not found" { // Check specific error text
			return err // Return the specific "not found" error
		}
		return fmt.Errorf("failed to retrieve media record for deletion: %w", err)
	}

	// 2. Delete the actual file from storage
	fullStoragePath := filepath.Join(s.storagePath, media.StoragePath)
	err = os.Remove(fullStoragePath)
	if err != nil && !os.IsNotExist(err) {
		log.Printf("MediaService: Error deleting file '%s' for media record %d: %v", fullStoragePath, mediaID, err)
		// Decide if this is fatal. Maybe log and continue to delete DB record?
		// For now, return error to indicate storage issue.
		return fmt.Errorf("failed to delete file from storage: %w", err)
	} else if err == nil {
		log.Printf("MediaService: Deleted file '%s' from storage.", fullStoragePath)
	} else { // os.IsNotExist(err) == true
		log.Printf("MediaService: File '%s' not found during deletion for media record %d.", fullStoragePath, mediaID)
	}

	// 3. Delete the thumbnail if it's an image
	if isSupportedImageType(media.MimeType) {
		thumbStoragePath := getThumbnailPath(media.StoragePath, s.storagePath)
		err = os.Remove(thumbStoragePath)
		if err != nil && !os.IsNotExist(err) {
			log.Printf("MediaService: Error deleting thumbnail file '%s' for media record %d: %v", thumbStoragePath, mediaID, err)
			// Log error but continue to delete DB record as original might be gone.
		} else if err == nil {
			log.Printf("MediaService: Deleted thumbnail file '%s' from storage.", thumbStoragePath)
		} else {
			log.Printf("MediaService: Thumbnail file '%s' not found during deletion for media record %d.", thumbStoragePath, mediaID)
		}
	}

	// 4. Delete the media record from DB
	err = s.mediaRepo.Delete(ctx, mediaID)
	if err != nil {
		log.Printf("MediaService: Error deleting media record %d after file deletion: %v", mediaID, err)
		// File(s) might be deleted, but DB record remains. This is problematic.
		return fmt.Errorf("failed to delete media record after file deletion: %w", err)
	}

	log.Printf("MediaService: Media record %d deleted successfully.", mediaID)
	return nil
}

// GetMediaURL constructs the public URL for a media item.
func (s *localMediaService) GetMediaURL(media *models.Media) string {
	if media == nil {
		return ""
	}
	// In this simple local storage case, the URL is already stored.
	return media.URL
}

// GetThumbnailURL constructs the public URL for a media item's thumbnail.
// Note: This assumes the thumbnail exists and follows the naming convention.
// You might want to add a ThumbnailURL field to the Media model instead.
func (s *localMediaService) GetThumbnailURL(media *models.Media) string {
	if media == nil || !isSupportedImageType(media.MimeType) {
		return ""
	}
	ext := filepath.Ext(media.StoragePath)
	base := strings.TrimSuffix(media.StoragePath, ext)
	thumbRelativePath := base + thumbnailSuffix + ext
	urlPath := filepath.ToSlash(thumbRelativePath)
	return s.baseURL + urlPath
}

// Ensure implementation satisfies interface
var _ MediaService = (*localMediaService)(nil)
