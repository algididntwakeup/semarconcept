// platform/backend/app/repositories/audit_log_repository.go

package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"backend/app/models" // Corrected import path

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// AuditLogRepository defines the interface for audit log data operations.
type AuditLogRepository interface {
	Create(ctx context.Context, logEntry *models.AuditLog) error
	List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]models.AuditLog, int, error) // Returns logs and total count for pagination
}

// postgresAuditLogRepository implements the AuditLogRepository interface.
type postgresAuditLogRepository struct {
	db *sqlx.DB
}

// NewPostgresAuditLogRepository creates a new instance of postgresAuditLogRepository.
func NewPostgresAuditLogRepository(db *sqlx.DB) AuditLogRepository {
	if db == nil {
		log.Fatal("repositories: NewPostgresAuditLogRepository requires a non-nil *sqlx.DB")
	}
	return &postgresAuditLogRepository{db: db}
}

// Create inserts a new audit log entry into the database.
// This is often called asynchronously or from middleware.
func (r *postgresAuditLogRepository) Create(ctx context.Context, logEntry *models.AuditLog) error {
	logEntry.ID = uuid.New() // Generate ID here or expect it pre-filled? Let's generate here.
	if logEntry.Timestamp.IsZero() {
		logEntry.Timestamp = time.Now() // Set timestamp if not provided
	}

	query := `
        INSERT INTO audit_logs (
            id, timestamp, user_id, username, action, entity_type, entity_id, status, source_ip, user_agent, details
        ) VALUES (
            :id, :timestamp, :user_id, :username, :action, :entity_type, :entity_id, :status, :source_ip, :user_agent, :details
        )
    `
	_, err := r.db.NamedExecContext(ctx, query, logEntry)
	if err != nil {
		// Log the error but don't necessarily block the original request if called from middleware
		log.Printf("Error creating audit log entry (action: %s, user: %v): %v", logEntry.Action, logEntry.UserID, err)
		// Return the error so the caller (e.g., service) can decide how to handle it
		return fmt.Errorf("failed to create audit log entry: %w", err)
	}
	// Log success minimally to avoid flooding logs
	// log.Printf("Audit log created for action: %s", logEntry.Action)
	return nil
}

// List retrieves audit logs with pagination and filtering.
func (r *postgresAuditLogRepository) List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]models.AuditLog, int, error) {
	logs := []models.AuditLog{}
	var totalCount int

	// Base query
	baseQuery := `FROM audit_logs`
	countQuery := `SELECT COUNT(*) ` + baseQuery
	selectQuery := `SELECT * ` + baseQuery

	// Build WHERE clause based on filters
	whereClauses := []string{}
	args := []interface{}{}
	argCount := 1

	// Example filters (expand as needed)
	if userID, ok := filters["user_id"].(uuid.UUID); ok {
		whereClauses = append(whereClauses, fmt.Sprintf("user_id = $%d", argCount))
		args = append(args, userID)
		argCount++
	}
	if action, ok := filters["action"].(string); ok && action != "" {
		// Use LIKE for partial matches? Or exact match? Let's use exact for now.
		whereClauses = append(whereClauses, fmt.Sprintf("action = $%d", argCount))
		args = append(args, action)
		argCount++
	}
	if entityType, ok := filters["entity_type"].(string); ok && entityType != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("entity_type = $%d", argCount))
		args = append(args, entityType)
		argCount++
	}
	if entityID, ok := filters["entity_id"].(string); ok && entityID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("entity_id = $%d", argCount))
		args = append(args, entityID)
		argCount++
	}
	if startDate, ok := filters["start_date"].(time.Time); ok && !startDate.IsZero() {
		whereClauses = append(whereClauses, fmt.Sprintf("timestamp >= $%d", argCount))
		args = append(args, startDate)
		argCount++
	}
	if endDate, ok := filters["end_date"].(time.Time); ok && !endDate.IsZero() {
		whereClauses = append(whereClauses, fmt.Sprintf("timestamp <= $%d", argCount))
		args = append(args, endDate)
		argCount++
	}

	// Combine WHERE clauses
	whereStr := ""
	if len(whereClauses) > 0 {
		whereStr = " WHERE " + sqlx.Rebind(sqlx.BindType("postgres"), strings.Join(whereClauses, " AND "))
	}

	// Apply WHERE to both queries
	countQuery += whereStr
	selectQuery += whereStr

	// Get total count
	err := r.db.GetContext(ctx, &totalCount, countQuery, args...)
	if err != nil {
		log.Printf("Error counting audit logs: %v", err)
		return nil, 0, fmt.Errorf("failed to count audit logs: %w", err)
	}

	if totalCount == 0 {
		return logs, 0, nil // No logs found, return empty slice
	}

	// Add ordering, limit, and offset for selection
	selectQuery += fmt.Sprintf(" ORDER BY timestamp DESC LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, limit, offset)

	// Get the log entries
	err = r.db.SelectContext(ctx, &logs, selectQuery, args...)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("Error listing audit logs: %v", err)
		return nil, 0, fmt.Errorf("failed to list audit logs: %w", err)
	}

	return logs, totalCount, nil
}

// Ensure implementation satisfies interface
var _ AuditLogRepository = (*postgresAuditLogRepository)(nil)
