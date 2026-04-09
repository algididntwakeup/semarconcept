// platform/backend/app/models/request/bulk_request.go
package request

// BulkDeleteRequest defines the structure for bulk delete operations.
type BulkDeleteRequest struct {
	IDs []int `json:"ids" binding:"required,min=1"`
}
