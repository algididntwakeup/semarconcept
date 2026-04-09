// platform/backend/app/models/content_entry.go

package models

import (
	"time"
	// "gorm.io/gorm"
)

// ContentEntry represents a piece of content (e.g., page, post).
// This is a minimal placeholder. Actual implementation would have more fields (title, body, etc.).
type ContentEntry struct {
	ID              uint   `gorm:"primaryKey"`
	Title           string `gorm:"type:varchar(255);not null"`
	Slug            string `gorm:"type:varchar(255);uniqueIndex"` // Unique slug for URL
	Body            string `gorm:"type:text"`
	CreatedByUserID *uint
	UpdatedByUserID *uint
	CreatedAt       time.Time
	UpdatedAt       time.Time

	// Field to link to the *current* active version (optional, depends on strategy)
	// CurrentVersionID *uint
}

// TableName specifies the table name.
func (ContentEntry) TableName() string {
	return "content_entries"
}
