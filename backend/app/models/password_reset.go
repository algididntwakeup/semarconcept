// platform/backend/app/models/password_reset.go

package models

import "time"

// PasswordReset stores information for password reset requests.
type PasswordReset struct {
	ID        int       `db:"id" gorm:"primaryKey"`
	UserID    int       `db:"user_id" gorm:"not null;index"` // Foreign key to users table
	User      User      `gorm:"foreignKey:UserID"`           // Belongs to User
	Token     string    `db:"token" gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `db:"expires_at" gorm:"not null"`
	CreatedAt time.Time `db:"created_at"`
}
