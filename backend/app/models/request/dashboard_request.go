// platform/backend/app/models/request/dashboard_request.go

package request

// WidgetConfigRequest defines the configuration for a single widget.
type WidgetConfigRequest struct {
	ID         string                 `json:"id" binding:"required"`   // Unique ID for the widget instance on a dashboard
	Type       string                 `json:"type" binding:"required"` // e.g., "summary_stats", "line_chart", "user_list"
	X          int                    `json:"x"`                       // Grid position X
	Y          int                    `json:"y"`                       // Grid position Y
	W          int                    `json:"w"`                       // Grid width
	H          int                    `json:"h"`                       // Grid height
	Parameters map[string]interface{} `json:"parameters,omitempty"`    // Widget-specific parameters
}

// DashboardLayoutRequest defines the structure for saving a dashboard layout.
type DashboardLayoutRequest struct {
	ID          string                `json:"id" binding:"required"` // Dashboard ID (e.g., "main_dashboard", "user_profile_dashboard")
	Name        string                `json:"name" binding:"required"`
	Description string                `json:"description,omitempty"`
	Widgets     []WidgetConfigRequest `json:"widgets" binding:"required,dive"`
	// Add other layout properties like grid columns, etc.
}

// WidgetDataRequest defines parameters for fetching data for a specific widget.
type WidgetDataRequest struct {
	WidgetID   string                 `json:"widget_id" binding:"required"`
	Parameters map[string]interface{} `json:"parameters,omitempty"` // Additional dynamic parameters for data fetching
}

// DashboardShareRequest defines the structure for sharing a dashboard.
type DashboardShareRequest struct {
	SharedWithUserID *int   `json:"shared_with_user_id,omitempty"`                              // Pointer to allow null
	SharedWithRoleID *int   `json:"shared_with_role_id,omitempty"`                              // Pointer to allow null
	PermissionLevel  string `json:"permission_level" binding:"required,oneof=view edit manage"` // e.g., "view", "edit", "manage"
}

// DashboardUnshareRequest defines the structure for unsharing a dashboard (typically by share ID).
// For unsharing, we usually target a specific share record.
type DashboardUnshareRequest struct {
	ShareID int `json:"share_id" binding:"required"`
}
