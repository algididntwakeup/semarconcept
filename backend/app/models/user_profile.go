// platform/backend/app/models/user_profile.go
package models

import (
	"time"
)

// UserProfile represents extended user profile information
type UserProfile struct {
	ID        int            `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    int            `gorm:"uniqueIndex;not null" json:"user_id"`
	TenantID  *int           `gorm:"index" json:"tenant_id,omitempty"`
	Bio       *string        `gorm:"type:text" json:"bio,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`

	// Relationships
	User   *User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Tenant *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// Table name
func (UserProfile) TableName() string {
	return "user_profiles"
}
