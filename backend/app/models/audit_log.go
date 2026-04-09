// platform/backend/app/models/audit_log.go

package models

import (
	"time"

	"github.com/google/uuid"
)

// AuditLog represents a record of an action performed in the system.
type AuditLog struct {
	ID         uuid.UUID  `db:"id" json:"id"`
	Timestamp  time.Time  `db:"timestamp" json:"timestamp"`
	UserID     *uuid.UUID `db:"user_id" json:"user_id"`           // User who performed the action (nullable for system actions)
	Username   *string    `db:"username" json:"username"`         // Username at the time of action (denormalized)
	Action     string     `db:"action" json:"action"`             // Description of the action (e.g., "user.login", "role.create", "config.update")
	EntityType *string    `db:"entity_type" json:"entity_type"`   // Type of entity affected (e.g., "user", "role", "config")
	EntityID   *string    `db:"entity_id" json:"entity_id"`       // ID of the entity affected (string to accommodate different ID types)
	Status     string     `db:"status" json:"status"`             // Outcome (e.g., "success", "failure", "attempt")
	SourceIP   *string    `db:"source_ip" json:"source_ip"`       // IP address of the request origin
	UserAgent  *string    `db:"user_agent" json:"user_agent"`     // User agent of the request origin
	Details    *string    `db:"details" json:"details,omitempty"` // Additional JSON details about the event (e.g., changed fields)
}

// Note: The corresponding database table should have appropriate indexes on
// timestamp, user_id, action, entity_type, entity_id, and status for efficient querying.
