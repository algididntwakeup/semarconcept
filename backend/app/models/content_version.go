// platform/backend/app/models/content_version.go

package models

import (
	"time"
	// "gorm.io/gorm"
)

// ContentVersion stores a snapshot of a ContentEntry at a specific point in time.
type ContentVersion struct {
	ID             uint      `gorm:"primaryKey"`
	ContentEntryID uint      `gorm:"not null;index"`     // Foreign key to the main content entry
	VersionNumber  uint      `gorm:"not null;default:1"` // Sequential version number for the entry
	Title          string    `gorm:"type:varchar(255);not null"`
	Slug           string    `gorm:"type:varchar(255)"` // Store slug at time of versioning
	Body           string    `gorm:"type:text"`
	UserID         *uint     // User who created this version
	CreatedAt      time.Time // Time this version was created
	// Optional: Add a field for 'status' (e.g., draft, published, scheduled) if versioning tracks status changes
	// Status string `gorm:"type:varchar(50);index"`
	// Optional: Add a field for scheduled publishing time
	PublishAt *time.Time `gorm:"index"` // Nullable timestamp for scheduled publishing

	// Define relationship back to ContentEntry (optional but useful)
	// ContentEntry ContentEntry `gorm:"foreignKey:ContentEntryID"`
}

// TableName specifies the table name.
func (ContentVersion) TableName() string {
	return "content_versions"
}

// Add unique constraint on ContentEntryID and VersionNumber in database migration
// ALTER TABLE content_versions ADD CONSTRAINT unique_entry_version UNIQUE (content_entry_id, version_number);
