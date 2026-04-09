// platform/backend/app/api/handlers/health_handler.go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// HealthCheck godoc
// @Summary Check API Health
// @Description Returns the health status of the API and its dependencies (e.g., database).
// @Tags health
// @Produce json
// @Success 200 {object} map[string]string "API is healthy"
// @Failure 503 {object} map[string]string "API is unhealthy or database is down"
// @Router /health [get]
func HealthCheck(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check database connection
		if db != nil {
			err := db.Ping()
			if err != nil {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"status":   "unhealthy",
					"database": "down",
					"error":    err.Error(),
				})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"status":   "healthy",
				"database": "up",
			})
			return
		}
		// If DB is nil (not passed or not configured for health check)
		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"database": "not_checked",
		})
	}
}
