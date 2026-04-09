// platform/backend/app/models/department.go
package models

import (
	"time"
)

// Department represents a department in the organization

type Department struct {
	ID                 int       `json:"id" gorm:"primaryKey;autoIncrement"`
	TenantID           int       `json:"tenant_id" gorm:"not null;index"`
	Name               string    `json:"name" gorm:"type:varchar(255);not null"`
	Description        *string   `json:"description" gorm:"type:text"`
	Code               *string   `json:"code" gorm:"type:varchar(50)"`
	ParentDepartmentID *int      `json:"parent_department_id" gorm:"index"`
	ManagerID          *int      `json:"manager_id" gorm:"index"`
	Budget             float64   `json:"budget" gorm:"type:numeric(15,2);default:0.00"`
	CostCenter         *string   `json:"cost_center" gorm:"type:varchar(100)"`
	Location           *string   `json:"location" gorm:"type:varchar(255)"`
	Phone              *string   `json:"phone" gorm:"type:varchar(50)"`
	Email              *string   `json:"email" gorm:"type:varchar(255)"`
	Status             string    `json:"status" gorm:"type:varchar(20);default:'active';check:status IN ('active','inactive','archived')"`
	IsActive           bool      `json:"is_active" gorm:"default:true"`
	HierarchyLevel     int       `json:"hierarchy_level" gorm:"default:1"`
	SortOrder          int       `json:"sort_order" gorm:"default:0"`
	Metadata           JSONBMap  `json:"metadata" gorm:"type:jsonb;default:'{}'"`
	CreatedAt          time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt          time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy          *int      `json:"created_by" gorm:"index"`
	UpdatedBy          *int      `json:"updated_by" gorm:"index"`

	// Relationships
	Tenant           *Tenant      `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
	ParentDepartment *Department  `json:"parent_department,omitempty" gorm:"foreignKey:ParentDepartmentID"`
	Manager          *User        `json:"manager,omitempty" gorm:"foreignKey:ManagerID"`
	SubDepartments   []Department `json:"sub_departments,omitempty" gorm:"foreignKey:ParentDepartmentID"`
	Users            []User       `json:"users,omitempty" gorm:"foreignKey:DepartmentID"`
}

// TableName specifies the table name for GORM
func (Department) TableName() string {
	return "departments"
}
