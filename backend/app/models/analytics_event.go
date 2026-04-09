// platform/backend/app/models/analytics_event.go

package models

import (
	"time"
)

// AnalyticsEvent represents a user analytics event for tracking behavior
type AnalyticsEvent struct {
	ID         int                    `db:"id" json:"id"`
	UserID     *int                   `db:"user_id" json:"user_id,omitempty"` // Nullable for anonymous events
	SessionID  string                 `db:"session_id" json:"session_id"`
	EventType  string                 `db:"event_type" json:"event_type"`           // e.g., page_view, button_click, login
	Properties map[string]interface{} `db:"properties" json:"properties,omitempty"` // Additional event data as JSON
	IPAddress  string                 `db:"ip_address" json:"ip_address,omitempty"`
	UserAgent  string                 `db:"user_agent" json:"user_agent,omitempty"`
	Timestamp  time.Time              `db:"timestamp" json:"timestamp"`
	TenantID   int                    `db:"tenant_id" json:"tenant_id"` // For multi-tenant isolation
	CreatedAt  time.Time              `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time              `db:"updated_at" json:"updated_at"`
}

// TableName returns the table name for GORM
func (AnalyticsEvent) TableName() string {
	return "analytics_events"
}
