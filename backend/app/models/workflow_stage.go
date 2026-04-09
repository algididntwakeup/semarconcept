// platform/backend/app/models/worklflow_stage.go

package models

import (
	"time"
	// "gorm.io/gorm"
)

// WorkflowStage represents a single stage or status within a workflow.
type WorkflowStage struct {
	ID          uint   `gorm:"primaryKey"`
	WorkflowID  uint   `gorm:"not null;index"`             // Foreign key to Workflow
	Name        string `gorm:"type:varchar(100);not null"` // e.g., "Draft", "Review", "Published", "Archived"
	Description string `gorm:"type:text"`
	IsInitial   bool   `gorm:"not null;default:false"` // Is this the starting stage?
	IsFinal     bool   `gorm:"not null;default:false"` // Is this a terminal stage?
	Order       int    `gorm:"not null;default:0"`     // For visual ordering if needed
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Relationships (optional, depending on how transitions are modeled)
	// FromTransitions []WorkflowTransition `gorm:"foreignKey:FromStageID"`
	// ToTransitions   []WorkflowTransition `gorm:"foreignKey:ToStageID"`
}

// TableName specifies the table name for the WorkflowStage model.
func (WorkflowStage) TableName() string {
	return "workflow_stages"
}
