// platform/backend/app/models/user_role.go
package models

import "time"

// UserRole represents the many-to-many relationship between users and roles
// Aligned with database schema: user_roles(user_id, role_id, created_at, tenant_id)
type UserRole struct {
	UserID    int       `json:"user_id" gorm:"primaryKey;not null;index"`
	RoleID    int       `json:"role_id" gorm:"primaryKey;not null;index"`
	TenantID  int       `json:"tenant_id" gorm:"not null;index"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`

	// Relationships
	User   *User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Role   *Role   `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	Tenant *Tenant `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for GORM
func (UserRole) TableName() string {
	return "user_roles"
}
