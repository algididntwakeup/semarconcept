// platform/backend/app/models/response/dashboard_response.go
package response

import "time"

// WidgetResponse defines the structure for a widget's layout and potentially its data.
type WidgetResponse struct {
	ID         string                 `json:"id"`                   // Unique ID for the widget instance
	Type       string                 `json:"type"`                 // e.g., "summary_stats", "line_chart"
	X          int                    `json:"x"`                    // Grid position X
	Y          int                    `json:"y"`                    // Grid position Y
	W          int                    `json:"w"`                    // Grid width
	H          int                    `json:"h"`                    // Grid height
	Parameters map[string]interface{} `json:"parameters,omitempty"` // Widget-specific parameters
	Data       interface{}            `json:"data,omitempty"`       // Widget data, structure depends on widget type
	UpdatedAt  time.Time              `json:"updated_at,omitempty"` // When the widget's data was last updated
}

// DashboardResponse defines the structure for a dashboard layout.
type DashboardResponse struct {
	ID          string           `json:"id"` // Dashboard ID
	Name        string           `json:"name"`
	Description *string          `json:"description,omitempty"`
	Widgets     []WidgetResponse `json:"widgets"`
	OwnerUserID int              `json:"owner_user_id"` // Or string if using UUIDs
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	// Add sharing information if applicable
}

// DashboardListEntry provides a summary for listing dashboards.
type DashboardListEntry struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	OwnerUserID int       `json:"owner_user_id"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// DashboardListResponse defines the structure for a paginated list of dashboards.
type DashboardListResponse struct {
	Dashboards []DashboardListEntry `json:"dashboards"`
	TotalCount int64                `json:"total_count"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
}

// WidgetDataResponse is a generic container for widget data.
type WidgetDataResponse struct {
	WidgetID  string      `json:"widget_id"`
	Data      interface{} `json:"data"` // Actual data structure varies by widget
	UpdatedAt time.Time   `json:"updated_at"`
}

// DashboardShareResponse defines the structure for returning dashboard share information.
type DashboardShareResponse struct {
	ID                 int       `json:"id"`
	DashboardID        string    `json:"dashboard_id"`
	SharedWithUserID   *int      `json:"shared_with_user_id,omitempty"`
	SharedWithUsername *string   `json:"shared_with_username,omitempty"` // Populated if SharedWithUserID is not nil
	SharedWithRoleID   *int      `json:"shared_with_role_id,omitempty"`
	SharedWithRoleName *string   `json:"shared_with_role_name,omitempty"` // Populated if SharedWithRoleID is not nil
	PermissionLevel    string    `json:"permission_level"`
	CreatedAt          time.Time `json:"created_at"`
}
