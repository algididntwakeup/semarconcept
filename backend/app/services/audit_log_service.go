// platform/backend/app/services/audit_log_service.go

package services

import (
	"context"
	"encoding/json"
	"log"

	"backend/app/models"       // Corrected path
	"backend/app/repositories" // Corrected path

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AuditLogService defines the interface for audit logging operations.
type AuditLogService interface {
	// Log creates an audit log entry. Can be called asynchronously.
	Log(ctx context.Context, entry models.AuditLog)
	// LogGin creates an audit log entry from Gin context information.
	LogGin(c *gin.Context, action, status string, entityType *string, entityID *string, details interface{})
	// List retrieves audit logs with filtering and pagination.
	List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]models.AuditLog, int, error)
}

// auditLogService implements the AuditLogService interface.
type auditLogService struct {
	repo repositories.AuditLogRepository
}

// NewAuditLogService creates a new instance of AuditLogService.
func NewAuditLogService(repo repositories.AuditLogRepository) AuditLogService {
	if repo == nil {
		log.Fatal("services: NewAuditLogService requires a non-nil AuditLogRepository")
	}
	return &auditLogService{repo: repo}
}

// Log creates an audit log entry.
// For high-throughput systems, consider making this asynchronous (e.g., send to a channel/queue).
func (s *auditLogService) Log(ctx context.Context, entry models.AuditLog) {
	// Use a background context if the original request context might be cancelled
	// but we still want to log the action. However, be mindful of resource leaks.
	// For simplicity here, we use the provided context.
	err := s.repo.Create(ctx, &entry)
	if err != nil {
		// Log the failure to create the audit log, but don't propagate the error
		// as audit logging is often considered non-critical to the primary operation.
		log.Printf("AuditLogService: Failed to create audit log: %v", err)
	}
}

// LogGin is a helper to create an audit log entry directly from Gin context.
func (s *auditLogService) LogGin(c *gin.Context, action, status string, entityType *string, entityID *string, details interface{}) {
	entry := models.AuditLog{
		Action:     action,
		Status:     status,
		EntityType: entityType,
		EntityID:   entityID,
	}

	// Extract User Info from context (set by AuthMiddleware)
	if userIDVal, exists := c.Get("user_id"); exists {
		if userID, ok := userIDVal.(uuid.UUID); ok {
			entry.UserID = &userID
		}
	}
	// TODO: Get username from context if available/needed

	// Extract Request Info
	ip := c.ClientIP()
	entry.SourceIP = &ip
	ua := c.Request.UserAgent()
	entry.UserAgent = &ua

	// Marshal details if provided
	if details != nil {
		detailsJSON, err := json.Marshal(details)
		if err == nil {
			detailsStr := string(detailsJSON)
			entry.Details = &detailsStr
		} else {
			log.Printf("AuditLogService: Failed to marshal audit log details: %v", err)
			errMsg := "Error marshaling details"
			entry.Details = &errMsg
		}
	}

	// Log asynchronously in a goroutine to avoid blocking the request handler
	go func() {
		// Use context.Background() for the goroutine as the original request context (c.Request.Context())
		// might be cancelled before the logging completes.
		err := s.repo.Create(context.Background(), &entry)
		if err != nil {
			log.Printf("AuditLogService (async): Failed to create audit log: %v", err)
		}
	}()
}

// List retrieves audit logs with filtering and pagination.
func (s *auditLogService) List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]models.AuditLog, int, error) {
	logs, total, err := s.repo.List(ctx, limit, offset, filters)
	if err != nil {
		log.Printf("AuditLogService: Failed to list audit logs: %v", err)
		// Return error to the handler
		return nil, 0, err
	}
	return logs, total, nil
}

// Ensure implementation satisfies interface
var _ AuditLogService = (*auditLogService)(nil)
