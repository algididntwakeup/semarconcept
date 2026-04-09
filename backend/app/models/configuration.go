// platform/backend/app/models/configuration.go

package models

import (
	"time"
)

// Configuration represents a system configuration setting
type Configuration struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Key         string    `gorm:"uniqueIndex;not null;size:255" json:"key"`
	Value       string    `gorm:"type:text" json:"value"`
	Category    string    `gorm:"size:100;index" json:"category"`
	Description *string   `gorm:"type:text" json:"description,omitempty"`
	Type        string    `gorm:"size:50;default:'string'" json:"type"` // string, number, boolean, json
	IsPublic    bool      `gorm:"default:false" json:"is_public"`
	IsEditable  bool      `gorm:"default:true" json:"is_editable"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Configuration) TableName() string {
	return "system_configurations"
}
