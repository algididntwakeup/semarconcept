// platform/backend/app/api/routes/websocket_routes.go
package routes

import (
	"backend/app/api/websocket"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
)

// SetupWebSocketRoutes adds WebSocket routes to the router
func SetupWebSocketRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	// Create a new connection manager
	connectionManager := websocket.NewConnectionManager()

	// Create WebSocket handler
	wsHandler := websocket.WebSocketHandler(connectionManager)

	// Add WebSocket route
	wsRoutes := router.Group("/ws")
	{
		// WebSocket endpoint requires authentication
		wsRoutes.GET("", authMiddleware, wsHandler)
	}

	utils.Info("WebSocket routes configured")
}
