// platform/backend/app/models/request/department_request.go
package request

// CreateDepartmentRequest represents the request payload for creating a new department
type CreateDepartmentRequest struct {
	Name               string                 `json:"name" binding:"required,min=2,max=255" example:"Engineering"`
	Description        *string                `json:"description,omitempty" binding:"omitempty,max=1000" example:"Engineering Department"`
	Code               *string                `json:"code,omitempty" binding:"omitempty,min=2,max=50,alphanum" example:"ENG"`
	ParentDepartmentID *int                   `json:"parent_department_id,omitempty" binding:"omitempty,min=1" example:"1"`
	ManagerID          *int                   `json:"manager_id,omitempty" binding:"omitempty,min=1" example:"5"`
	Budget             *float64               `json:"budget,omitempty" binding:"omitempty,min=0" example:"100000.00"`
	CostCenter         *string                `json:"cost_center,omitempty" binding:"omitempty,max=100" example:"CC-ENG-001"`
	Location           *string                `json:"location,omitempty" binding:"omitempty,max=255" example:"Building A, Floor 3"`
	Phone              *string                `json:"phone,omitempty" binding:"omitempty,max=50" example:"+1-555-0123"`
	Email              *string                `json:"email,omitempty" binding:"omitempty,email,max=255" example:"engineering@company.com"`
	SortOrder          *int                   `json:"sort_order,omitempty" binding:"omitempty,min=0" example:"10"`
	Metadata           map[string]interface{} `json:"metadata,omitempty" example:"{}"`
}

// UpdateDepartmentRequest represents the request payload for updating an existing department
type UpdateDepartmentRequest struct {
	Name               *string                `json:"name,omitempty" binding:"omitempty,min=2,max=255" example:"Engineering"`
	Description        *string                `json:"description,omitempty" binding:"omitempty,max=1000" example:"Engineering Department"`
	Code               *string                `json:"code,omitempty" binding:"omitempty,min=2,max=50,alphanum" example:"ENG"`
	ParentDepartmentID *int                   `json:"parent_department_id,omitempty" binding:"omitempty,min=1" example:"1"`
	ManagerID          *int                   `json:"manager_id,omitempty" binding:"omitempty,min=1" example:"5"`
	Budget             *float64               `json:"budget,omitempty" binding:"omitempty,min=0" example:"100000.00"`
	CostCenter         *string                `json:"cost_center,omitempty" binding:"omitempty,max=100" example:"CC-ENG-001"`
	Location           *string                `json:"location,omitempty" binding:"omitempty,max=255" example:"Building A, Floor 3"`
	Phone              *string                `json:"phone,omitempty" binding:"omitempty,max=50" example:"+1-555-0123"`
	Email              *string                `json:"email,omitempty" binding:"omitempty,email,max=255" example:"engineering@company.com"`
	Status             *string                `json:"status,omitempty" binding:"omitempty,oneof=active inactive archived" example:"active"`
	IsActive           *bool                  `json:"is_active,omitempty" example:"true"`
	SortOrder          *int                   `json:"sort_order,omitempty" binding:"omitempty,min=0" example:"10"`
	Metadata           map[string]interface{} `json:"metadata,omitempty" example:"{}"`
}

// DepartmentListQuery represents query parameters for listing departments
type DepartmentListQuery struct {
	Page               int    `form:"page,default=1" binding:"omitempty,min=1" example:"1"`
	Limit              int    `form:"limit,default=10" binding:"omitempty,min=1,max=100" example:"10"`
	Search             string `form:"search" binding:"omitempty,max=255" example:"engineering"`
	Status             string `form:"status" binding:"omitempty,oneof=active inactive archived" example:"active"`
	ParentDepartmentID *int   `form:"parent_department_id" binding:"omitempty,min=1" example:"1"`
	ManagerID          *int   `form:"manager_id" binding:"omitempty,min=1" example:"5"`
	SortBy             string `form:"sort_by,default=name" binding:"omitempty,oneof=name code created_at updated_at sort_order" example:"name"`
	SortOrder          string `form:"sort_order,default=asc" binding:"omitempty,oneof=asc desc" example:"asc"`
	IncludeStats       bool   `form:"include_stats" example:"false"`
	IncludeHierarchy   bool   `form:"include_hierarchy" example:"false"`
}

// UserStatsQuery represents query parameters for user statistics
type UserStatsQuery struct {
	Period        string `form:"period,default=all" binding:"omitempty,oneof=all daily weekly monthly yearly" example:"monthly"`
	StartDate     string `form:"start_date" binding:"omitempty" example:"2024-01-01"`
	EndDate       string `form:"end_date" binding:"omitempty" example:"2024-12-31"`
	DepartmentID  *int   `form:"department_id" binding:"omitempty,min=1" example:"1"`
	IncludeGrowth bool   `form:"include_growth" example:"true"`
}

// GetManagersQuery represents query parameters for getting managers
type GetManagersQuery struct {
	Page         int    `form:"page,default=1" binding:"omitempty,min=1" example:"1"`
	Limit        int    `form:"limit,default=10" binding:"omitempty,min=1,max=100" example:"10"`
	Search       string `form:"search" binding:"omitempty,max=255" example:"john"`
	DepartmentID *int   `form:"department_id" binding:"omitempty,min=1" example:"1"`
	SortBy       string `form:"sort_by,default=name" binding:"omitempty,oneof=name email department created_at" example:"name"`
	SortOrder    string `form:"sort_order,default=asc" binding:"omitempty,oneof=asc desc" example:"asc"`
}
