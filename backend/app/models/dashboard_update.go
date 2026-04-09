// platform/backend/app/models/dashboard_update.go

package models

import (
	"time"
)

// DashboardUpdate represents a real-time update for a dashboard widget
type DashboardUpdate struct {
	DashboardID uint        `json:"dashboard_id"`
	WidgetID    string      `json:"widget_id"`
	Data        interface{} `json:"data"`
	Timestamp   time.Time   `json:"timestamp"`
}

// Widget represents a dashboard widget
type Widget struct {
	ID          string                 `json:"id" gorm:"primaryKey"`
	DashboardID uint                   `json:"dashboard_id" gorm:"index"`
	Type        string                 `json:"type"`
	Title       string                 `json:"title"`
	Position    map[string]interface{} `json:"position" gorm:"type:jsonb"`
	Size        map[string]interface{} `json:"size" gorm:"type:jsonb"`
	Config      map[string]interface{} `json:"config" gorm:"type:jsonb"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}
