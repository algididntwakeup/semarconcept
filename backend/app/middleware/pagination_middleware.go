// platform/backend/app/middleware/pagination_middleware.go

package middleware

import (
	"backend/app/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Default pagination values
const (
	DefaultPage     = 1
	DefaultPageSize = 10
	MaxPageSize     = 100
)

// PaginationMiddleware extracts pagination parameters from the request query string
// and adds them to the context.
func PaginationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract page and page_size from query parameters
		pageStr := c.DefaultQuery("page", strconv.Itoa(DefaultPage))
		pageSizeStr := c.DefaultQuery("page_size", strconv.Itoa(DefaultPageSize))

		// Convert to integers with defaults
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = DefaultPage
		}

		pageSize, err := strconv.Atoi(pageSizeStr)
		if err != nil || pageSize < 1 {
			pageSize = DefaultPageSize
		}

		// Limit maximum page size
		if pageSize > MaxPageSize {
			pageSize = MaxPageSize
		}

		// Create pagination object
		pagination := models.NewPagination(page, pageSize)

		// Add to context
		c.Set("pagination", pagination)

		c.Next()
	}
}

// GetPagination retrieves the pagination object from the context.
func GetPagination(c *gin.Context) *models.Pagination {
	pagination, exists := c.Get("pagination")
	if !exists {
		return models.NewPagination(DefaultPage, DefaultPageSize)
	}
	return pagination.(*models.Pagination)
}
