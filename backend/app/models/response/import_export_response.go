// platform/backend/app/models/response/import_export_response.go

package response

import "time"

// UserImportResponse represents the response from user import operation
type UserImportResponse struct {
	TotalProcessed int               `json:"total_processed"`
	SuccessCount   int               `json:"success_count"`
	ErrorCount     int               `json:"error_count"`
	Errors         []UserImportError `json:"errors,omitempty"`
	CreatedUsers   []UserResponse    `json:"created_users,omitempty"`
	UpdatedUsers   []UserResponse    `json:"updated_users,omitempty"`
	PreviewMode    bool              `json:"preview_mode"`
	ImportID       string            `json:"import_id,omitempty"`
	ProcessedAt    time.Time         `json:"processed_at"`
	Summary        UserImportSummary `json:"summary"`
}

// UserImportError represents an error during user import
type UserImportError struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}

// UserImportSummary provides a summary of the import operation
type UserImportSummary struct {
	TotalRows          int `json:"total_rows"`
	ValidRows          int `json:"valid_rows"`
	InvalidRows        int `json:"invalid_rows"`
	CreatedUsers       int `json:"created_users"`
	UpdatedUsers       int `json:"updated_users"`
	SkippedUsers       int `json:"skipped_users"`
	DuplicateEmails    int `json:"duplicate_emails"`
	DuplicateUsernames int `json:"duplicate_usernames"`
}

// UserExportResponse represents the response from user export operation
type UserExportResponse struct {
	TotalUsers   int       `json:"total_users"`
	ExportedRows int       `json:"exported_rows"`
	Format       string    `json:"format"`
	Filename     string    `json:"filename"`
	FileSize     int64     `json:"file_size"`
	ExportedAt   time.Time `json:"exported_at"`
	DownloadURL  string    `json:"download_url,omitempty"`
	ExpiresAt    time.Time `json:"expires_at,omitempty"`
}

// UserBulkActionResponse represents the response from bulk user actions
type UserBulkActionResponse struct {
	Action         string          `json:"action"`
	TotalRequested int             `json:"total_requested"`
	SuccessCount   int             `json:"success_count"`
	ErrorCount     int             `json:"error_count"`
	Errors         []UserBulkError `json:"errors,omitempty"`
	ProcessedUsers []UserResponse  `json:"processed_users,omitempty"`
	ProcessedAt    time.Time       `json:"processed_at"`
}

// UserBulkError represents an error during bulk operations
type UserBulkError struct {
	UserID  int    `json:"user_id"`
	Message string `json:"message"`
	Field   string `json:"field,omitempty"`
}

// UserTemplateResponse represents the response for CSV template download
type UserTemplateResponse struct {
	Filename    string          `json:"filename"`
	Headers     []string        `json:"headers"`
	Examples    [][]string      `json:"examples,omitempty"`
	Format      string          `json:"format"`
	Description string          `json:"description"`
	Fields      []TemplateField `json:"fields"`
}

// TemplateField describes a field in the import template
type TemplateField struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Type        string `json:"type"`
	Required    bool   `json:"required"`
	Description string `json:"description"`
	Example     string `json:"example"`
	Validation  string `json:"validation,omitempty"`
}

// UserImportValidationResponse represents the response from CSV validation
type UserImportValidationResponse struct {
	IsValid     bool                `json:"is_valid"`
	TotalRows   int                 `json:"total_rows"`
	ValidRows   int                 `json:"valid_rows"`
	InvalidRows int                 `json:"invalid_rows"`
	Errors      []UserImportError   `json:"errors,omitempty"`
	Warnings    []UserImportWarning `json:"warnings,omitempty"`
	Headers     []string            `json:"headers"`
	PreviewData [][]string          `json:"preview_data,omitempty"`
	Duplicates  UserDuplicateInfo   `json:"duplicates"`
}

// UserImportWarning represents a warning during validation
type UserImportWarning struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}

// UserDuplicateInfo provides information about duplicates
type UserDuplicateInfo struct {
	DuplicateEmails    []DuplicateEntry `json:"duplicate_emails,omitempty"`
	DuplicateUsernames []DuplicateEntry `json:"duplicate_usernames,omitempty"`
}

// DuplicateEntry represents a duplicate entry
type DuplicateEntry struct {
	Value string `json:"value"`
	Rows  []int  `json:"rows"`
	Count int    `json:"count"`
}

// UserImportProgressResponse represents the response for import
