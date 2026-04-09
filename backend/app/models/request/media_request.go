// platform/backend/app/models/request/media_request.go

package request

// UploadMediaRequest defines the structure for uploading media files
type UploadMediaRequest struct {
	Description *string `json:"description,omitempty" binding:"omitempty,max=500"`
	FolderID    *int    `json:"folder_id,omitempty" binding:"omitempty,min=1"`
	TenantID    *int    `json:"tenant_id,omitempty" binding:"omitempty,min=1"`
}

// UpdateMediaRequest defines the structure for updating media metadata
type UpdateMediaRequest struct {
	Filename    *string `json:"filename,omitempty" binding:"omitempty,min=1,max=255"`
	Description *string `json:"description,omitempty" binding:"omitempty,max=500"`
	FolderID    *int    `json:"folder_id,omitempty" binding:"omitempty,min=1"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

// MediaListQuery defines query parameters for listing media files
type MediaListQuery struct {
	Page       int    `form:"page,default=1" binding:"min=1"`
	Limit      int    `form:"limit,default=20" binding:"min=1,max=100"`
	Search     string `form:"search"`
	MimeType   string `form:"mime_type"`
	FolderID   *int   `form:"folder_id"`
	UploadedBy *int   `form:"uploaded_by"`
	IsActive   *bool  `form:"is_active"`
	TenantID   *int   `form:"tenant_id"`
	SortBy     string `form:"sort_by,default=uploaded_at" binding:"oneof=filename uploaded_at file_size"`
	SortOrder  string `form:"sort_order,default=desc" binding:"oneof=asc desc"`
}

// MediaSearchRequest represents the request to search media files
type MediaSearchRequest struct {
	Search     string `json:"search,omitempty"`
	MimeType   string `json:"mime_type,omitempty"`
	FolderID   *int   `json:"folder_id,omitempty"`
	UploadedBy *int   `json:"uploaded_by,omitempty"`
	IsActive   *bool  `json:"is_active,omitempty"`
	TenantID   *int   `json:"tenant_id,omitempty"`
	Page       int    `json:"page,omitempty" binding:"min=1"`
	PerPage    int    `json:"per_page,omitempty" binding:"min=1,max=100"`
	SortBy     string `json:"sort_by,omitempty" binding:"omitempty,oneof=filename uploaded_at file_size"`
	SortOrder  string `json:"sort_order,omitempty" binding:"omitempty,oneof=asc desc"`
}

// CreateFolderRequest defines the structure for creating media folders
type CreateFolderRequest struct {
	Name     string `json:"name" binding:"required,min=1,max=100"`
	Path     string `json:"path" binding:"required,min=1"`
	ParentID *int   `json:"parent_id,omitempty" binding:"omitempty,min=1"`
	TenantID *int   `json:"tenant_id,omitempty" binding:"omitempty,min=1"`
}

// UpdateFolderRequest defines the structure for updating media folders
type UpdateFolderRequest struct {
	Name     *string `json:"name,omitempty" binding:"omitempty,min=1,max=100"`
	Path     *string `json:"path,omitempty" binding:"omitempty,min=1"`
	ParentID *int    `json:"parent_id,omitempty" binding:"omitempty,min=1"`
}

// MoveFolderItemsRequest defines the structure for moving media items between folders
type MoveFolderItemsRequest struct {
	MediaIDs []int `json:"media_ids" binding:"required,min=1"`
	FolderID *int  `json:"folder_id,omitempty" binding:"omitempty,min=1"`
}

// BulkDeleteMediaRequest defines the structure for bulk deleting media files
type BulkDeleteMediaRequest struct {
	MediaIDs []int `json:"media_ids" binding:"required,min=1"`
}
