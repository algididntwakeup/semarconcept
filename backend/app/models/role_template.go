// platform/backend/app/models/role_template.go

package models

import (
	"time"
)

// RoleTemplate represents a template for creating roles
type RoleTemplate struct {
	ID               int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name             string    `gorm:"not null;size:100" json:"name"`
	Code             string    `gorm:"not null;size:50" json:"code"`
	Description      *string   `gorm:"size:500" json:"description,omitempty"`
	Category         string    `gorm:"size:50" json:"category"`
	Level            int       `gorm:"default:1" json:"level"`
	IsSystemTemplate bool      `gorm:"default:false" json:"is_system_template"`
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	PermissionCodes  *string   `gorm:"type:text" json:"permission_codes,omitempty"`
	Color            *string   `gorm:"size:20" json:"color,omitempty"`
	Icon             *string   `gorm:"size:50" json:"icon,omitempty"`
	Metadata         *string   `gorm:"type:text" json:"metadata,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	CreatedBy        *int      `gorm:"index" json:"created_by,omitempty"`
	UpdatedBy        *int      `gorm:"index" json:"updated_by,omitempty"`

	// Relationships
	CreatedUser *User `gorm:"foreignKey:CreatedBy" json:"created_user,omitempty"`
	UpdatedUser *User `gorm:"foreignKey:UpdatedBy" json:"updated_user,omitempty"`
}

func (RoleTemplate) TableName() string {
	return "role_templates"
}
