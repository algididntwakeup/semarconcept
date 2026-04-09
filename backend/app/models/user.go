// platform/backend/app/models/user.go
package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID           int        `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	Username     string     `json:"username" db:"username" gorm:"type:varchar(50);not null;uniqueIndex:idx_users_tenant_id_username"`
	Email        string     `json:"email" db:"email" gorm:"type:varchar(100);not null;uniqueIndex:idx_users_tenant_id_email"`
	PasswordHash string     `json:"-" db:"password_hash" gorm:"type:varchar(100);not null"`
	FirstName    string     `json:"first_name" db:"first_name" gorm:"type:varchar(50);not null"`
	LastName     string     `json:"last_name" db:"last_name" gorm:"type:varchar(50);not null"`
	FullName     *string    `json:"full_name" db:"full_name" gorm:"type:varchar(50)"`
	IsActive     bool       `json:"is_active" db:"is_active" gorm:"default:true;not null;index"`
	IsAdmin      bool       `json:"is_admin" db:"is_admin" gorm:"default:false;not null;index"`
	IsSuperuser  bool       `json:"is_superuser" db:"is_superuser" gorm:"default:false;not null"`
	TenantID     int        `json:"tenant_id" db:"tenant_id" gorm:"not null;index"`
	DepartmentID *int       `json:"department_id" db:"department_id" gorm:"index"`
	LastLogin    *time.Time `json:"last_login" db:"last_login" gorm:"index"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt    *time.Time `json:"deleted_at" db:"deleted_at" gorm:"index"`
	CreatedBy    *int       `json:"created_by" db:"created_by" gorm:"index"`
	UpdatedBy    *int       `json:"updated_by" db:"updated_by" gorm:"index"`

	// Relationships (GORM only - not used in SQLX queries)
	Tenant     *Tenant     `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
	Department *Department `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Roles      []Role      `json:"roles,omitempty" gorm:"many2many:user_roles"`
	UserRoles  []UserRole  `json:"user_roles,omitempty" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}

// GetFullName returns the full name of the user
func (u *User) GetFullName() string {
	if u.FullName != nil && *u.FullName != "" {
		return *u.FullName
	}
	return u.FirstName + " " + u.LastName
}
