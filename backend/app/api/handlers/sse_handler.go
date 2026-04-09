// platform/backend/app/api/handlers/sse_handler.go
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"backend/app/utils"

	"github.com/gin-gonic/gin"
)

// SSEMessage represents a server-sent event message
type SSEMessage struct {
	Type      string      `json:"type"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp"`
	UserID    int         `json:"user_id,omitempty"`
	TenantID  int         `json:"tenant_id,omitempty"`
}

// SSEConnection represents an active SSE connection
type SSEConnection struct {
	UserID   int
	TenantID int
	Channel  chan SSEMessage
	Context  context.Context
	Cancel   context.CancelFunc
	LastPing time.Time
	ClientIP string
}

// SSEHandler handles server-sent events
type SSEHandler struct {
	connections map[string]*SSEConnection
	mu          sync.RWMutex
	jwtService  *utils.JWTService
}

// NewSSEHandler creates a new SSE handler
func NewSSEHandler(jwtService *utils.JWTService) *SSEHandler {
	handler := &SSEHandler{
		connections: make(map[string]*SSEConnection),
		jwtService:  jwtService,
	}

	// Start cleanup routine
	go handler.cleanupRoutine()

	utils.Info("SSE Handler initialized successfully")
	return handler
}

// HandleSSE handles SSE connections
func (h *SSEHandler) HandleSSE(c *gin.Context) {
	//  ENHANCED CORS Headers for SSE
	origin := c.Request.Header.Get("Origin")
	if origin != "" {
		c.Header("Access-Control-Allow-Origin", origin)
	} else {
		c.Header("Access-Control-Allow-Origin", "*")
	}

	c.Header("Access-Control-Allow-Headers", "Cache-Control,Authorization,X-Tenant-ID,X-Request-ID,Accept,Accept-Language,Accept-Encoding,Connection,Host,Last-Event-ID,X-Tenant-Subdomain,X-Client-Version")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Credentials", "true")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Content-Type", "text/event-stream")
	c.Header("X-Accel-Buffering", "no") // Disable nginx buffering

	// Handle preflight requests
	if c.Request.Method == "OPTIONS" {
		utils.Info("SSE: Preflight request handled for origin: %s", origin)
		c.Status(http.StatusOK)
		return
	}

	//  Enhanced Authentication
	token := c.Query("token")
	if token == "" {
		token = c.GetHeader("Authorization")
		if token != "" {
			token = strings.TrimPrefix(token, "Bearer ")
		}
	}

	if token == "" {
		utils.Warn(" SSE: No authentication token provided")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required for SSE connection"})
		return
	}

	// Validate token and extract user info
	userID, tenantID, err := h.validateToken(token)
	if err != nil {
		utils.Errorf(" SSE: Token validation failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Check connection limits per user
	if h.GetConnectionCountByUser(userID) >= 5 {
		utils.Warnf(" SSE: Connection limit exceeded for user %d", userID)
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Connection limit exceeded"})
		return
	}

	// Create connection context
	ctx, cancel := context.WithCancel(c.Request.Context())

	// Create unique connection ID
	connectionID := fmt.Sprintf("sse_%d_%d_%d", userID, tenantID, time.Now().UnixNano())
	connection := &SSEConnection{
		UserID:   userID,
		TenantID: tenantID,
		Channel:  make(chan SSEMessage, 100),
		Context:  ctx,
		Cancel:   cancel,
		LastPing: time.Now(),
		ClientIP: c.ClientIP(),
	}

	// Store connection
	h.mu.Lock()
	h.connections[connectionID] = connection
	totalConnections := len(h.connections)
	h.mu.Unlock()

	utils.Infof("SSE: New connection established - User: %d, Tenant: %d, IP: %s, Total: %d",
		userID, tenantID, c.ClientIP(), totalConnections)

	// Cleanup on disconnect
	defer func() {
		h.mu.Lock()
		delete(h.connections, connectionID)
		remainingConnections := len(h.connections)
		h.mu.Unlock()
		cancel()
		close(connection.Channel)
		utils.Infof("SSE: Connection closed - User: %d, Tenant: %d, Remaining: %d",
			userID, tenantID, remainingConnections)
	}()

	// Send initial connection message
	initialMsg := SSEMessage{
		Type: "connected",
		Payload: map[string]interface{}{
			"status":        "connected",
			"user_id":       userID,
			"tenant_id":     tenantID,
			"server_time":   time.Now(),
			"connection_id": connectionID,
		},
		Timestamp: time.Now(),
		UserID:    userID,
		TenantID:  tenantID,
	}

	if err := h.sendMessage(c.Writer, initialMsg); err != nil {
		utils.Errorf(" SSE: Failed to send initial message: %v", err)
		return
	}

	// Start heartbeat
	heartbeatTicker := time.NewTicker(30 * time.Second)
	defer heartbeatTicker.Stop()

	// Connection activity ticker
	activityTicker := time.NewTicker(5 * time.Minute)
	defer activityTicker.Stop()

	utils.Infof("SSE: Message loop started for user %d", userID)

	// Message loop
	for {
		select {
		case <-ctx.Done():
			utils.Debugf("SSE: Context cancelled for user %d", userID)
			return

		case msg, ok := <-connection.Channel:
			if !ok {
				utils.Debugf("SSE: Channel closed for user %d", userID)
				return
			}

			if err := h.sendMessage(c.Writer, msg); err != nil {
				utils.Errorf(" SSE: Failed to send message to user %d: %v", userID, err)
				return
			}

		case <-heartbeatTicker.C:
			heartbeatMsg := SSEMessage{
				Type: "heartbeat",
				Payload: map[string]interface{}{
					"timestamp": time.Now().Unix(),
					"user_id":   userID,
					"tenant_id": tenantID,
				},
				Timestamp: time.Now(),
			}

			if err := h.sendMessage(c.Writer, heartbeatMsg); err != nil {
				utils.Errorf(" SSE: Failed to send heartbeat to user %d: %v", userID, err)
				return
			}

			connection.LastPing = time.Now()

		case <-activityTicker.C:
			// Send periodic activity update
			activityMsg := SSEMessage{
				Type: "activity",
				Payload: map[string]interface{}{
					"active_connections": h.GetConnectionCount(),
					"user_connections":   h.GetConnectionCountByUser(userID),
					"tenant_connections": h.GetConnectionCountByTenant(tenantID),
				},
				Timestamp: time.Now(),
			}

			if err := h.sendMessage(c.Writer, activityMsg); err != nil {
				utils.Errorf(" SSE: Failed to send activity update to user %d: %v", userID, err)
				return
			}
		}
	}
}

// sendMessage sends an SSE message
func (h *SSEHandler) sendMessage(w http.ResponseWriter, msg SSEMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %v", err)
	}

	// Format as SSE
	if msg.Type != "" {
		fmt.Fprintf(w, "event: %s\n", msg.Type)
	}
	fmt.Fprintf(w, "data: %s\n\n", string(data))

	// Flush immediately
	if flusher, ok := w.(http.Flusher); ok {
		flusher.Flush()
	}

	return nil
}

// BroadcastToUser sends a message to all connections for a specific user
func (h *SSEHandler) BroadcastToUser(userID int, message SSEMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	count := 0
	for _, conn := range h.connections {
		if conn.UserID == userID {
			select {
			case conn.Channel <- message:
				count++
			default:
				// Channel full, skip
				utils.Warnf(" SSE: Channel full for user %d, skipping message", userID)
			}
		}
	}

	if count > 0 {
		utils.Debugf("SSE: Broadcasted message to %d connections for user %d", count, userID)
	}
}

// BroadcastToTenant sends a message to all connections for a specific tenant
func (h *SSEHandler) BroadcastToTenant(tenantID int, message SSEMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	count := 0
	for _, conn := range h.connections {
		if conn.TenantID == tenantID {
			select {
			case conn.Channel <- message:
				count++
			default:
				// Channel full, skip
				utils.Warnf(" SSE: Channel full for tenant %d, skipping message", tenantID)
			}
		}
	}

	if count > 0 {
		utils.Debugf("SSE: Broadcasted message to %d connections for tenant %d", count, tenantID)
	}
}

// BroadcastToAll sends a message to all connections
func (h *SSEHandler) BroadcastToAll(message SSEMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	count := 0
	for _, conn := range h.connections {
		select {
		case conn.Channel <- message:
			count++
		default:
			// Channel full, skip
		}
	}

	utils.Debugf("SSE: Broadcasted message to %d total connections", count)
}

// cleanupRoutine removes stale connections
func (h *SSEHandler) cleanupRoutine() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	utils.Info("SSE: Cleanup routine started")

	for range ticker.C {
		h.mu.Lock()

		staleCount := 0
		activeCount := 0

		for id, conn := range h.connections {
			if time.Since(conn.LastPing) > 10*time.Minute {
				conn.Cancel()
				delete(h.connections, id)
				staleCount++
			} else {
				activeCount++
			}
		}

		h.mu.Unlock()

		if staleCount > 0 {
			utils.Infof("SSE: Cleaned up %d stale connections, %d active remaining", staleCount, activeCount)
		}
	}
}

// validateToken validates JWT token and returns user info
func (h *SSEHandler) validateToken(token string) (int, int, error) {
	// Validate JWT token using the JWT service
	claims, err := h.jwtService.ValidateToken(token)
	if err != nil {
		return 0, 0, fmt.Errorf("invalid token: %v", err)
	}

	// Extract user ID from struct fields (UserID is int, not pointer)
	userID := claims.UserID
	if userID <= 0 {
		return 0, 0, fmt.Errorf("invalid user_id in token: %d", userID)
	}

	// Extract tenant ID from struct fields (TenantID is *int, handle pointer)
	var tenantID int
	if claims.TenantID == nil || *claims.TenantID <= 0 {
		// Default tenant ID if not present or invalid in token
		tenantID = 1
		utils.Warnf(" SSE: No valid tenant_id in token for user %d, using default: %d", userID, tenantID)
	} else {
		tenantID = *claims.TenantID
	}

	return userID, tenantID, nil
}

// GetConnectionCount returns the number of active connections
func (h *SSEHandler) GetConnectionCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.connections)
}

// GetConnectionCountByUser returns connection count for a specific user
func (h *SSEHandler) GetConnectionCountByUser(userID int) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	count := 0
	for _, conn := range h.connections {
		if conn.UserID == userID {
			count++
		}
	}
	return count
}

// GetConnectionCountByTenant returns connection count for a specific tenant
func (h *SSEHandler) GetConnectionCountByTenant(tenantID int) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	count := 0
	for _, conn := range h.connections {
		if conn.TenantID == tenantID {
			count++
		}
	}
	return count
}

// SSEHealthCheck handles GET /sse/health
func (h *SSEHandler) SSEHealthCheck(c *gin.Context) {
	h.mu.RLock()
	totalConnections := len(h.connections)

	// Group by tenant and user
	tenantCounts := make(map[int]int)
	userCounts := make(map[int]int)

	for _, conn := range h.connections {
		tenantCounts[conn.TenantID]++
		userCounts[conn.UserID]++
	}
	h.mu.RUnlock()

	// Enhanced health check response
	c.JSON(http.StatusOK, gin.H{
		"status":      "healthy",
		"service":     "sse",
		"connections": totalConnections,
		"timestamp":   time.Now(),
		"stats": gin.H{
			"total_connections": totalConnections,
			"tenants_connected": len(tenantCounts),
			"users_connected":   len(userCounts),
			"uptime":            "healthy", // Placeholder
		},
		"features": gin.H{
			"heartbeat_enabled":        true,
			"cleanup_enabled":          true,
			"authentication_required":  true,
			"max_connections_per_user": 5,
		},
	})
}

// SendTestMessage handles POST /sse/test (development only)
func (h *SSEHandler) SendTestMessage(c *gin.Context) {
	// Only allow in development
	if os.Getenv("APP_ENV") != "development" && os.Getenv("DEBUG_SSE") != "true" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Test endpoint only available in development"})
		return
	}

	var msg SSEMessage
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message format", "details": err.Error()})
		return
	}

	msg.Timestamp = time.Now()

	// Determine broadcast type from query parameters
	userIDStr := c.Query("user_id")
	tenantIDStr := c.Query("tenant_id")
	broadcastType := c.Query("type") // all, user, tenant

	switch broadcastType {
	case "user":
		if userIDStr != "" {
			if userID, err := strconv.Atoi(userIDStr); err == nil {
				h.BroadcastToUser(userID, msg)
				c.JSON(http.StatusOK, gin.H{
					"message":     fmt.Sprintf("Test message sent to user %d", userID),
					"connections": h.GetConnectionCountByUser(userID),
				})
				return
			}
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing user_id"})
		return

	case "tenant":
		if tenantIDStr != "" {
			if tenantID, err := strconv.Atoi(tenantIDStr); err == nil {
				h.BroadcastToTenant(tenantID, msg)
				c.JSON(http.StatusOK, gin.H{
					"message":     fmt.Sprintf("Test message sent to tenant %d", tenantID),
					"connections": h.GetConnectionCountByTenant(tenantID),
				})
				return
			}
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing tenant_id"})
		return

	default:
		// Broadcast to all
		h.BroadcastToAll(msg)
		c.JSON(http.StatusOK, gin.H{
			"message":     "Test message sent to all connections",
			"connections": h.GetConnectionCount(),
		})
	}
}

// SendNotification sends a notification message to specific user/tenant
func (h *SSEHandler) SendNotification(userID int, tenantID int, title string, message string, data map[string]interface{}) {
	notification := SSEMessage{
		Type: "notification",
		Payload: map[string]interface{}{
			"title":   title,
			"message": message,
			"data":    data,
		},
		Timestamp: time.Now(),
		UserID:    userID,
		TenantID:  tenantID,
	}

	if userID > 0 {
		h.BroadcastToUser(userID, notification)
	} else if tenantID > 0 {
		h.BroadcastToTenant(tenantID, notification)
	}
}

// SendSystemAlert sends a system-wide alert
func (h *SSEHandler) SendSystemAlert(level string, title string, message string) {
	alert := SSEMessage{
		Type: "system_alert",
		Payload: map[string]interface{}{
			"level":   level, // info, warning, error, critical
			"title":   title,
			"message": message,
			"system":  true,
		},
		Timestamp: time.Now(),
	}

	h.BroadcastToAll(alert)
	utils.Infof("🚨 SSE: System alert sent - Level: %s, Title: %s", level, title)
}
