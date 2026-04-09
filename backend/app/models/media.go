// platform/backend/app/models/media.go
package models

import (
	"time"
)

// Media represents metadata for an uploaded file.
type Media struct {
	ID               int       `db:"id" json:"id" gorm:"primaryKey;autoIncrement"`
	Filename         string    `db:"filename" json:"filename" gorm:"size:255;not null"`                   // Original filename from upload
	OriginalFilename string    `db:"original_filename" json:"original_filename" gorm:"size:255;not null"` // Original filename as uploaded
	MimeType         string    `db:"mime_type" json:"mime_type" gorm:"size:100;not null"`                 // Detected MIME type (e.g., "image/jpeg", "application/pdf")
	FileSize         int64     `db:"file_size" json:"file_size" gorm:"not null"`                          // File size in bytes
	FilePath         string    `db:"file_path" json:"file_path" gorm:"type:text;not null"`                // Path relative to storage root (e.g., "uploads/2024/04/xyz.jpg")
	ThumbnailPath    *string   `db:"thumbnail_path" json:"thumbnail_path,omitempty" gorm:"type:text"`     // Path to thumbnail file (nullable)
	Metadata         *string   `db:"metadata" json:"metadata,omitempty" gorm:"type:jsonb"`                // Additional metadata as JSONB
	IsActive         bool      `db:"is_active" json:"is_active" gorm:"default:true;not null"`             // Whether the media item is active
	UploadedAt       time.Time `db:"uploaded_at" json:"uploaded_at" gorm:"default:now();not null"`        // When the file was uploaded
	UploadedBy       *int      `db:"uploaded_by" json:"uploaded_by" gorm:"not null"`                      // User who uploaded the file (integer ID)
	TenantID         int       `db:"tenant_id" json:"tenant_id" gorm:"not null"`                          // Tenant ID for multi-tenancy

	// Legacy fields for compatibility with your current service code
	StoragePath string    `json:"-" gorm:"-"`                     // Computed field, maps to FilePath
	URL         string    `json:"url" gorm:"-"`                   // Computed field for public URL
	Size        int64     `json:"size" gorm:"-"`                  // Maps to FileSize
	Description string    `json:"description,omitempty" gorm:"-"` // Can be stored in Metadata JSONB
	CreatedAt   time.Time `json:"created_at" gorm:"-"`            // Maps to UploadedAt
	UpdatedAt   time.Time `json:"updated_at" gorm:"-"`            // Not used in current schema
}

// TableName specifies the table name for GORM
func (Media) TableName() string {
	return "media_items"
}

// BeforeSave hook to sync legacy fields with database fields
func (m *Media) BeforeSave() error {
	// Sync legacy fields with database fields
	if m.StoragePath != "" {
		m.FilePath = m.StoragePath
	}
	if m.Size > 0 {
		m.FileSize = m.Size
	}
	if m.Filename != "" && m.OriginalFilename == "" {
		m.OriginalFilename = m.Filename
	}
	return nil
}

// AfterFind hook to populate legacy fields from database fields
func (m *Media) AfterFind() error {
	// Populate legacy fields for backward compatibility
	m.StoragePath = m.FilePath
	m.Size = m.FileSize
	m.CreatedAt = m.UploadedAt
	return nil
}

// Validate checks basic media metadata.
func (m *Media) Validate() error {
	if m.Filename == "" {
		return &ValidationError{Field: "filename", Message: "Filename cannot be empty"}
	}
	if m.OriginalFilename == "" {
		return &ValidationError{Field: "original_filename", Message: "Original filename cannot be empty"}
	}
	if m.FilePath == "" && m.StoragePath == "" {
		return &ValidationError{Field: "file_path", Message: "File path cannot be empty"}
	}
	if m.MimeType == "" {
		return &ValidationError{Field: "mime_type", Message: "MIME type cannot be empty"}
	}
	if m.FileSize <= 0 && m.Size <= 0 {
		return &ValidationError{Field: "file_size", Message: "File size must be positive"}
	}
	if m.TenantID <= 0 {
		return &ValidationError{Field: "tenant_id", Message: "Tenant ID must be positive"}
	}
	return nil
}
