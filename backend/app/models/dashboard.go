// platform/backend/app/models/dashboard.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// WidgetConfig stores the configuration for a single widget within a dashboard.
// This will be stored as JSON in the database.
type WidgetConfig struct {
	ID         string                 `json:"id"`                   // Unique ID for the widget instance on this dashboard
	Type       string                 `json:"type"`                 // e.g., "summary_stats", "line_chart", "user_list"
	X          int                    `json:"x"`                    // Grid position X
	Y          int                    `json:"y"`                    // Grid position Y
	W          int                    `json:"w"`                    // Grid width
	H          int                    `json:"h"`                    // Grid height
	Parameters map[string]interface{} `json:"parameters,omitempty"` // Widget-specific parameters
}

// WidgetConfigArray is a helper type for GORM to handle JSON arrays of WidgetConfig.
type WidgetConfigArray []WidgetConfig

// Value implements the driver.Valuer interface for WidgetConfigArray.
func (wca WidgetConfigArray) Value() (driver.Value, error) {
	if len(wca) == 0 {
		return json.Marshal([]WidgetConfig{}) // Store as empty JSON array if nil or empty
	}
	return json.Marshal(wca)
}

// Scan implements the sql.Scanner interface for WidgetConfigArray.
func (wca *WidgetConfigArray) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed for WidgetConfigArray")
	}
	if len(bytes) == 0 { // Handle empty byte slice
		*wca = []WidgetConfig{}
		return nil
	}
	return json.Unmarshal(bytes, wca)
}

// Dashboard represents a user-defined dashboard layout and configuration.
type Dashboard struct {
	ID          string            `gorm:"type:varchar(100);primaryKey"` // User-defined or system-generated unique ID
	Name        string            `gorm:"type:varchar(255);not null"`
	Description string            `gorm:"type:text"`
	OwnerUserID int               `gorm:"not null;index"`         // Foreign key to User model
	User        User              `gorm:"foreignKey:OwnerUserID"` // Belongs to User
	Widgets     WidgetConfigArray `gorm:"type:jsonb"`             // Store as JSONB for better querying if needed
	IsPublic    bool              `gorm:"default:false"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
