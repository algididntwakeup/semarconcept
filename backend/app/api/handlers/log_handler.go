// platform/backend/api/handlers/log_handler.go
package handlers

import (
	"backend/app/utils"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// LogEntry represents a log entry from the frontend
type LogEntry struct {
	Level      string                 `json:"level" binding:"required"`
	Message    string                 `json:"message" binding:"required"`
	Timestamp  string                 `json:"timestamp"`
	Source     string                 `json:"source"`
	UserID     string                 `json:"user_id"`
	RequestID  string                 `json:"request_id"`
	UserAgent  string                 `json:"user_agent"`
	URL        string                 `json:"url"`
	Path       string                 `json:"path"`
	Method     string                 `json:"method"`
	StatusCode int                    `json:"status_code"`
	Error      map[string]interface{} `json:"error"`
	Data       map[string]interface{} `json:"data"`
}

// LogHandler handles frontend log requests
type LogHandler struct{}

// NewLogHandler creates a new LogHandler
func NewLogHandler() *LogHandler {
	return &LogHandler{}
}

// HandleFrontendLog handles logs from the frontend
// @Summary Handle frontend logs
// @Description Receives and processes logs from the frontend application
// @Tags logs
// @Accept json
// @Produce json
// @Param log body LogEntry true "Log entry from frontend"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/logs [post]
func (h *LogHandler) HandleFrontendLog(c *gin.Context) {
	var logEntry LogEntry

	// Bind JSON request to LogEntry struct
	if err := c.ShouldBindJSON(&logEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set timestamp if not provided
	if logEntry.Timestamp == "" {
		logEntry.Timestamp = time.Now().Format(time.RFC3339)
	}

	// Set source if not provided
	if logEntry.Source == "" {
		logEntry.Source = "frontend"
	}

	// Get user agent from request if not provided
	if logEntry.UserAgent == "" {
		logEntry.UserAgent = c.Request.UserAgent()
	}

	// Get request ID from context or header
	if logEntry.RequestID == "" {
		if requestID, exists := c.Get("RequestID"); exists {
			logEntry.RequestID = requestID.(string)
		} else if requestID := c.GetHeader("X-Request-ID"); requestID != "" {
			logEntry.RequestID = requestID
		}
	}

	// Log to backend based on level with very visible formatting
	message := fmt.Sprintf("FRONTEND LOG: %s", logEntry.Message)

	// Print directly to console for immediate visibility
	fmt.Printf("\n\n==== FRONTEND LOG [%s] ====\n", logEntry.Level)
	fmt.Printf("MESSAGE: %s\n", logEntry.Message)
	fmt.Printf("SOURCE: %s\n", logEntry.Source)
	fmt.Printf("URL: %s\n", logEntry.URL)
	if logEntry.Error != nil {
		fmt.Printf("ERROR: %v\n", logEntry.Error)
	}
	fmt.Println("============================")

	// Also log through the structured logger
	switch logEntry.Level {
	case "debug":
		utils.Debug(message, logEntry)
	case "info":
		utils.Info(message, logEntry)
	case "warn":
		utils.Warn(message, logEntry)
	case "error":
		utils.Error(message, logEntry)
	default:
		utils.Info(message, logEntry)
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Log received",
	})
}

// HandleBatchLogs handles batch logs from the frontend
// @Summary Handle batch frontend logs
// @Description Receives and processes multiple logs from the frontend application
// @Tags logs
// @Accept json
// @Produce json
// @Param logs body []LogEntry true "Array of log entries from frontend"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/logs/batch [post]
func (h *LogHandler) HandleBatchLogs(c *gin.Context) {
	var logEntries []LogEntry

	// Bind JSON request to LogEntry array
	if err := c.ShouldBindJSON(&logEntries); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Process each log entry
	for _, entry := range logEntries {
		// Set timestamp if not provided
		if entry.Timestamp == "" {
			entry.Timestamp = time.Now().Format(time.RFC3339)
		}

		// Set source if not provided
		if entry.Source == "" {
			entry.Source = "frontend"
		}

		// Log to backend based on level with very visible formatting
		message := fmt.Sprintf("FRONTEND BATCH LOG: %s", entry.Message)

		// Print directly to console for immediate visibility
		fmt.Printf("\n\n==== FRONTEND BATCH LOG [%s] ====\n", entry.Level)
		fmt.Printf("MESSAGE: %s\n", entry.Message)
		fmt.Printf("SOURCE: %s\n", entry.Source)
		fmt.Printf("URL: %s\n", entry.URL)
		if entry.Error != nil {
			fmt.Printf("ERROR: %v\n", entry.Error)
		}
		fmt.Println("============================")

		// Also log through the structured logger
		switch entry.Level {
		case "debug":
			utils.Debug(message, entry)
		case "info":
			utils.Info(message, entry)
		case "warn":
			utils.Warn(message, entry)
		case "error":
			utils.Error(message, entry)
		default:
			utils.Info(message, entry)
		}
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Batch logs received",
		"count":   len(logEntries),
	})
}
