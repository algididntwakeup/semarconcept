// platform/backend/app/models/response/department_response.go
package response

import (
	"time"
)

// DepartmentResponse represents a department in API responses
type DepartmentResponse struct {
	ID                 int                      `json:"id" example:"1"`
	Name               string                   `json:"name" example:"Engineering"`
	Description        *string                  `json:"description,omitempty" example:"Engineering Department"`
	Code               *string                  `json:"code,omitempty" example:"ENG"`
	ParentDepartmentID *int                     `json:"parent_department_id,omitempty" example:"1"`
	ManagerID          *int                     `json:"manager_id,omitempty" example:"5"`
	Manager            *UserBase                `json:"manager,omitempty"`
	ParentDepartment   *DepartmentBase          `json:"parent_department,omitempty"`
	Budget             float64                  `json:"budget" example:"100000.00"`
	CostCenter         *string                  `json:"cost_center,omitempty" example:"CC-ENG-001"`
	Location           *string                  `json:"location,omitempty" example:"Building A, Floor 3"`
	Phone              *string                  `json:"phone,omitempty" example:"+1-555-0123"`
	Email              *string                  `json:"email,omitempty" example:"engineering@company.com"`
	Status             string                   `json:"status" example:"active"`
	IsActive           bool                     `json:"is_active" example:"true"`
	HierarchyLevel     int                      `json:"hierarchy_level" example:"2"`
	SortOrder          int                      `json:"sort_order" example:"10"`
	UserCount          *int                     `json:"user_count,omitempty" example:"25"`
	SubDepartments     []DepartmentBase         `json:"sub_departments,omitempty"`
	Stats              *DepartmentStatsResponse `json:"stats,omitempty"`
	Metadata           map[string]interface{}   `json:"metadata,omitempty" example:"{}"`
	CreatedAt          time.Time                `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt          time.Time                `json:"updated_at" example:"2024-01-01T00:00:00Z"`
	CreatedBy          *int                     `json:"created_by,omitempty" example:"1"`
	UpdatedBy          *int                     `json:"updated_by,omitempty" example:"1"`
}

// DepartmentBase represents basic department information for references
type DepartmentBase struct {
	ID   int     `json:"id" example:"1"`
	Name string  `json:"name" example:"Engineering"`
	Code *string `json:"code,omitempty" example:"ENG"`
}

// DepartmentListResponse represents the response for listing departments
type DepartmentListResponse struct {
	Departments []DepartmentResponse `json:"departments"`
	Total       int64                `json:"total" example:"50"`
	Page        int                  `json:"page" example:"1"`
	Limit       int                  `json:"limit" example:"10"`
	TotalPages  int                  `json:"total_pages" example:"5"`
}

// DepartmentStatsResponse represents department statistics
type DepartmentStatsResponse struct {
	TotalUsers       int     `json:"total_users" example:"25"`
	ActiveUsers      int     `json:"active_users" example:"23"`
	ManagersCount    int     `json:"managers_count" example:"3"`
	SubDepartments   int     `json:"sub_departments" example:"2"`
	TotalBudget      float64 `json:"total_budget" example:"250000.00"`
	AverageHierarchy float64 `json:"average_hierarchy" example:"2.5"`
}

// UserStatsResponse represents comprehensive user statistics
type UserStatsResponse struct {
	Total          int            `json:"total" example:"150"`
	Active         int            `json:"active" example:"142"`
	Inactive       int            `json:"inactive" example:"8"`
	Admins         int            `json:"admins" example:"10"`
	Superusers     int            `json:"superusers" example:"5"`
	RecentLogins   int            `json:"recent_logins" example:"45"`
	NeverLoggedIn  int            `json:"never_logged_in" example:"10"`
	ByDepartment   map[string]int `json:"by_department"`
	ByRole         map[string]int `json:"by_role"`
	MonthlyGrowth  []MonthlyUserGrowthResponse   `json:"monthly_growth,omitempty"`
	GeneratedAt    time.Time      `json:"generated_at" example:"2024-01-01T00:00:00Z"`
}

// DepartmentUserCountResponse represents user count per department
type DepartmentUserCountResponse struct {
	DepartmentID   int     `json:"department_id" example:"1"`
	DepartmentName string  `json:"department_name" example:"Engineering"`
	DepartmentCode *string `json:"department_code,omitempty" example:"ENG"`
	UserCount      int     `json:"user_count" example:"25"`
	ActiveCount    int     `json:"active_count" example:"23"`
}

// RoleUserCountResponse represents user count per role
type RoleUserCountResponse struct {
	RoleID      int    `json:"role_id" example:"1"`
	RoleName    string `json:"role_name" example:"Administrator"`
	UserCount   int    `json:"user_count" example:"5"`
	ActiveCount int    `json:"active_count" example:"5"`
}

// MonthlyUserGrowthResponse represents user growth over months
type MonthlyUserGrowthResponse struct {
	Month      string  `json:"month" example:"2024-01"`
	Year       int     `json:"year" example:"2024"`
	MonthName  string  `json:"month_name" example:"January"`
	NewUsers   int     `json:"new_users" example:"10"`
	TotalUsers int     `json:"total_users" example:"150"`
	GrowthRate float64 `json:"growth_rate" example:"7.14"`
}
