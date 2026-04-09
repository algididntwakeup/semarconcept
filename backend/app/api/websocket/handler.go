// platform/backend/app/api/websocket/handler.go

package websocket

import (
	"backend/app/utils"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Add origin validation logic here
		return true
	},
}

// ConnectionManager manages all active WebSocket connections
type ConnectionManager struct {
	connections map[string]*Connection
	mutex       sync.RWMutex
}

// Connection represents a single WebSocket connection
type Connection struct {
	ID       string
	UserID   uint
	Socket   *websocket.Conn
	SendChan chan []byte
}

// NewConnectionManager creates a new connection manager
func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		connections: make(map[string]*Connection),
	}
}

// AddConnection adds a new connection to the manager
func (cm *ConnectionManager) AddConnection(conn *Connection) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	cm.connections[conn.ID] = conn
}

// RemoveConnection removes a connection from the manager
func (cm *ConnectionManager) RemoveConnection(id string) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	delete(cm.connections, id)
}

// GetConnection retrieves a connection by ID
func (cm *ConnectionManager) GetConnection(id string) (*Connection, bool) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	conn, exists := cm.connections[id]
	return conn, exists
}

// BroadcastToUser sends a message to all connections for a specific user
func (cm *ConnectionManager) BroadcastToUser(userID uint, message []byte) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	for _, conn := range cm.connections {
		if conn.UserID == userID {
			select {
			case conn.SendChan <- message:
				// Message sent
			default:
				// Channel full, could log this
				utils.Error("WebSocket send channel full", nil)
			}
		}
	}
}

// BroadcastToAll sends a message to all connections
func (cm *ConnectionManager) BroadcastToAll(message []byte) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	for _, conn := range cm.connections {
		select {
		case conn.SendChan <- message:
			// Message sent
		default:
			// Channel full, could log this
			utils.Error("WebSocket send channel full", nil)
		}
	}
}

// GetConnectionCount returns the number of active connections
func (cm *ConnectionManager) GetConnectionCount() int {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	return len(cm.connections)
}

// GetUserConnectionCount returns the number of connections for a specific user
func (cm *ConnectionManager) GetUserConnectionCount(userID uint) int {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	count := 0
	for _, conn := range cm.connections {
		if conn.UserID == userID {
			count++
		}
	}
	return count
}

// WebSocketHandler handles WebSocket connections
func WebSocketHandler(cm *ConnectionManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Upgrade HTTP connection to WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			utils.Error("Failed to upgrade connection", err)
			return
		}

		// Create new connection
		connID, err := utils.GenerateSecureToken(16)
		if err != nil {
			utils.Error("Failed to generate connection ID", err)
			return
		}
		connection := &Connection{
			ID:       connID,
			UserID:   userID.(uint),
			Socket:   conn,
			SendChan: make(chan []byte, 256),
		}

		// Add connection to manager
		cm.AddConnection(connection)

		// Start goroutines for reading and writing
		go readPump(cm, connection)
		go writePump(connection)

		utils.Info("New WebSocket connection established", map[string]interface{}{
			"connection_id": connID,
			"user_id":       userID,
		})
	}
}

// readPump pumps messages from the WebSocket connection to the hub
func readPump(cm *ConnectionManager, conn *Connection) {
	defer func() {
		conn.Socket.Close()
		cm.RemoveConnection(conn.ID)
		close(conn.SendChan)
		utils.Info("WebSocket connection closed", map[string]interface{}{
			"connection_id": conn.ID,
			"user_id":       conn.UserID,
		})
	}()

	conn.Socket.SetReadLimit(512)
	conn.Socket.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.Socket.SetPongHandler(func(string) error {
		conn.Socket.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := conn.Socket.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				utils.Error("WebSocket read error", err)
			}
			break
		}

		// Process incoming message
		parsedMsg, err := ParseMessage(message)
		if err != nil {
			utils.Error("Failed to parse WebSocket message", err)

			// Send error message back to client
			errorMsg := NewErrorMessage("invalid_message", "Failed to parse message", nil)
			errorBytes, _ := json.Marshal(errorMsg)
			conn.SendChan <- errorBytes
			continue
		}

		utils.Debug("Received message", parsedMsg)

		// Handle message based on type
		switch msg := parsedMsg.(type) {
		case AuthMessage:
			handleAuthMessage(conn, msg)
		case SubscriptionMessage:
			handleSubscriptionMessage(cm, conn, msg)
		case PingMessage:
			handlePingMessage(conn, msg)
		default:
			// Unknown message type
			errorMsg := NewErrorMessage("unknown_message_type", "Unknown message type", nil)
			errorBytes, _ := json.Marshal(errorMsg)
			conn.SendChan <- errorBytes
		}
	}
}

// handleAuthMessage processes authentication messages
func handleAuthMessage(conn *Connection, msg AuthMessage) {
	// In a real implementation, you would validate the token here
	// For now, we'll just acknowledge the authentication

	// Send a response
	response := NewUpdateMessage(EntityTypeNotification, "auth", map[string]interface{}{
		"status": "authenticated",
	}, "system")

	responseBytes, err := json.Marshal(response)
	if err != nil {
		utils.Error("Failed to marshal auth response", err)
		return
	}

	conn.SendChan <- responseBytes
}

// handleSubscriptionMessage processes subscription messages
func handleSubscriptionMessage(cm *ConnectionManager, conn *Connection, msg SubscriptionMessage) {
	// In a real implementation, you would store the subscription
	// and set up data delivery for the subscribed entity

	// For now, just acknowledge the subscription
	var status string
	if msg.Type == MessageTypeSubscribe {
		status = "subscribed"
	} else {
		status = "unsubscribed"
	}

	// Send a response
	response := NewUpdateMessage(EntityTypeNotification, "subscription", map[string]interface{}{
		"status": status,
		"entity": msg.Entity,
		"id":     msg.ID,
	}, "system")

	responseBytes, err := json.Marshal(response)
	if err != nil {
		utils.Error("Failed to marshal subscription response", err)
		return
	}

	conn.SendChan <- responseBytes
}

// handlePingMessage processes ping messages
func handlePingMessage(conn *Connection, msg PingMessage) {
	// Send a pong response
	response := NewPongMessage(msg.Timestamp)

	responseBytes, err := json.Marshal(response)
	if err != nil {
		utils.Error("Failed to marshal pong response", err)
		return
	}

	conn.SendChan <- responseBytes
}

// writePump pumps messages from the hub to the WebSocket connection
func writePump(conn *Connection) {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		conn.Socket.Close()
	}()

	for {
		select {
		case message, ok := <-conn.SendChan:
			conn.Socket.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// Channel closed
				conn.Socket.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := conn.Socket.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages
			n := len(conn.SendChan)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-conn.SendChan)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			conn.Socket.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.Socket.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
