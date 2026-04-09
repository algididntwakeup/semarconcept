// platform/backend/app/models/pagination.go

package models

// Pagination defines the structure for pagination parameters.
type Pagination struct {
	Page       int   `json:"page" form:"page"`
	PageSize   int   `json:"page_size" form:"page_size"`
	TotalRows  int64 `json:"total_rows"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// NewPagination creates a new Pagination instance with default values.
func NewPagination(page, pageSize int) *Pagination {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10 // Default page size
	}
	if pageSize > 100 {
		pageSize = 100 // Maximum page size
	}
	return &Pagination{
		Page:     page,
		PageSize: pageSize,
	}
}

// SetTotalRows sets the total number of rows and calculates pagination metadata.
func (p *Pagination) SetTotalRows(totalRows int64) {
	p.TotalRows = totalRows
	p.TotalPages = int((totalRows + int64(p.PageSize) - 1) / int64(p.PageSize))
	p.HasNext = p.Page < p.TotalPages
	p.HasPrev = p.Page > 1
}

// GetOffset returns the offset for database queries.
func (p *Pagination) GetOffset() int {
	return (p.Page - 1) * p.PageSize
}

// GetLimit returns the limit for database queries.
func (p *Pagination) GetLimit() int {
	return p.PageSize
}

// GetPage returns the current page.
func (p *Pagination) GetPage() int {
	return p.Page
}

// GetPageSize returns the page size.
func (p *Pagination) GetPageSize() int {
	return p.PageSize
}

// GetPaginationParams returns the pagination parameters for database queries.
func (p *Pagination) GetPaginationParams() (int, int) {
	return p.GetOffset(), p.GetLimit()
}
