// platform/backend/app/models/workflow_transition.go

package models

import (
	"time"
	// "gorm.io/gorm"
)

// WorkflowTransition defines the allowed movement between stages in a workflow.
type WorkflowTransition struct {
	ID               uint   `gorm:"primaryKey"`
	WorkflowID       uint   `gorm:"not null;index"`                                // Link to the overall workflow
	Name             string `gorm:"type:varchar(100);not null"`                    // e.g., "Submit for Review", "Publish", "Reject"
	FromStageID      uint   `gorm:"not null;index"`                                // Source stage
	ToStageID        uint   `gorm:"not null;index"`                                // Destination stage
	RequiredRoles    []Role `gorm:"many2many:workflow_transition_roles;"`          // Roles allowed to INITIATE this transition
	ApprovalRequired bool   `gorm:"not null;default:false"`                        // Does this transition require approval?
	ApproverRoles    []Role `gorm:"many2many:workflow_transition_approver_roles;"` // Roles allowed to APPROVE this transition (if ApprovalRequired is true)
	// Add fields for conditions (e.g., check field value), actions (e.g., send notification), etc.
	CreatedAt time.Time
	UpdatedAt time.Time

	// Define relationships if needed (GORM might infer based on foreign keys)
	// FromStage WorkflowStage `gorm:"foreignKey:FromStageID"`
	// ToStage   WorkflowStage `gorm:"foreignKey:ToStageID"`
}

// TableName specifies the table name for the WorkflowTransition model.
func (WorkflowTransition) TableName() string {
	return "workflow_transitions"
}

// Join table for transition roles (if using GORM many2many)
// type WorkflowTransitionRole struct {
// 	WorkflowTransitionID uint `gorm:"primaryKey"`
// 	RoleID               uint `gorm:"primaryKey"`
// }
