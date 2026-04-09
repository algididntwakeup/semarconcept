// platform/backend/app/models/role.go

package models

import (
	"time"

	"gorm.io/gorm"
)

// Role represents a role in the RBAC system
type Role struct {
	ID          int            `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"type:varchar(50);not null"`
	Code        string         `json:"code" gorm:"type:varchar(50);uniqueIndex"`
	Description string         `json:"description" gorm:"type:text"`
	Level       int            `json:"level" gorm:"not null;default:1"`
	IsSystem    bool           `json:"is_system" gorm:"default:false"`
	IsDefault   bool           `json:"is_default" gorm:"default:false"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	TenantID    int            `json:"tenant_id" gorm:"not null;index"`
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Users       []*User      `json:"users,omitempty" gorm:"many2many:user_roles;"`
	Permissions []Permission `json:"permissions,omitempty" gorm:"many2many:role_permissions;"`
	Tenant      *Tenant      `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for GORM
func (Role) TableName() string {
	return "roles"
}

// BeforeCreate GORM hook
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	now := time.Now()
	r.CreatedAt = now
	r.UpdatedAt = now
	return nil
}

// BeforeUpdate GORM hook
func (r *Role) BeforeUpdate(tx *gorm.DB) error {
	r.UpdatedAt = time.Now()
	return nil
}
