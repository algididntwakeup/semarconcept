// platform/backend/app/models/response/health_response.go

package response

import "time"

// HealthResponse represents system health status
type HealthResponse struct {
	Status     string                 `json:"status" example:"healthy"`
	Timestamp  time.Time              `json:"timestamp"`
	Version    string                 `json:"version" example:"1.0.0"`
	Uptime     string                 `json:"uptime" example:"2h30m15s"`
	Components map[string]interface{} `json:"components"`
}
