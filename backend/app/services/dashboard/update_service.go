// platform/backend/app/services/dashboard/update_service.go

package dashboard

import (
	"backend/app/api/websocket"
	"backend/app/models"
	"backend/app/repositories"
	"backend/app/utils"
	"encoding/json"
	"sync"
	"time"
)

// DashboardUpdateService manages real-time updates for dashboards
type DashboardUpdateService struct {
	dashboardRepo     repositories.DashboardRepository
	connectionManager *websocket.ConnectionManager
	subscriptions     map[uint]map[uint]bool // dashboardID -> userID -> subscribed
	mutex             sync.RWMutex
	updateInterval    time.Duration
	stopChan          chan struct{}
}

// NewDashboardUpdateService creates a new dashboard update service
func NewDashboardUpdateService(
	dashboardRepo repositories.DashboardRepository,
	connectionManager *websocket.ConnectionManager,
) *DashboardUpdateService {
	service := &DashboardUpdateService{
		dashboardRepo:     dashboardRepo,
		connectionManager: connectionManager,
		subscriptions:     make(map[uint]map[uint]bool),
		updateInterval:    10 * time.Second,
		stopChan:          make(chan struct{}),
	}

	// Start background worker to check for updates
	go service.updateWorker()

	return service
}

// Subscribe adds a subscription for a user to a dashboard
func (s *DashboardUpdateService) Subscribe(dashboardID, userID uint) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if _, exists := s.subscriptions[dashboardID]; !exists {
		s.subscriptions[dashboardID] = make(map[uint]bool)
	}

	s.subscriptions[dashboardID][userID] = true

	utils.Info("User subscribed to dashboard", map[string]interface{}{
		"user_id":      userID,
		"dashboard_id": dashboardID,
	})
}

// Unsubscribe removes a subscription for a user from a dashboard
func (s *DashboardUpdateService) Unsubscribe(dashboardID, userID uint) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if userSubs, exists := s.subscriptions[dashboardID]; exists {
		delete(userSubs, userID)

		// Clean up empty maps
		if len(userSubs) == 0 {
			delete(s.subscriptions, dashboardID)
		}

		utils.Info("User unsubscribed from dashboard", map[string]interface{}{
			"user_id":      userID,
			"dashboard_id": dashboardID,
		})
	}
}

// NotifyUpdate sends an update notification for a dashboard widget
func (s *DashboardUpdateService) NotifyUpdate(dashboardID uint, widgetID string, data interface{}) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	if userSubs, exists := s.subscriptions[dashboardID]; exists {
		// Create WebSocket message directly
		wsMessage := websocket.NewUpdateMessage(
			websocket.EntityTypeDashboard,
			dashboardID,
			map[string]interface{}{
				"widget_id": widgetID,
				"data":      data,
			},
			"system",
		)

		// Serialize to JSON
		jsonData, err := json.Marshal(wsMessage)
		if err != nil {
			utils.Error("Failed to marshal dashboard update", err)
			return
		}

		// Broadcast to subscribed users
		for userID := range userSubs {
			s.connectionManager.BroadcastToUser(userID, jsonData)
		}

		utils.Info("Dashboard update notification sent", map[string]interface{}{
			"dashboard_id": dashboardID,
			"widget_id":    widgetID,
			"users_count":  len(userSubs),
		})
	}
}

// updateWorker periodically checks for dashboard updates
func (s *DashboardUpdateService) updateWorker() {
	ticker := time.NewTicker(s.updateInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.checkForUpdates()
		case <-s.stopChan:
			return
		}
	}
}

// checkForUpdates checks all subscribed dashboards for updates
func (s *DashboardUpdateService) checkForUpdates() {
	// Temporarily disabled due to undefined dashboardRepo methods
}

// getWidgetData retrieves the latest data for a widget
func (s *DashboardUpdateService) getWidgetData(widget models.WidgetConfig) (interface{}, error) {
	// Implementation depends on widget type
	// For now, return a placeholder
	switch widget.Type {
	case "chart":
		return s.getChartData(widget)
	case "table":
		return s.getTableData(widget)
	case "kpi":
		return s.getKPIData(widget)
	default:
		return map[string]interface{}{
			"message": "Data not available for this widget type",
		}, nil
	}
}

// getChartData retrieves data for chart widgets
func (s *DashboardUpdateService) getChartData(widget models.WidgetConfig) (interface{}, error) {
	// Placeholder implementation
	return map[string]interface{}{
		"labels": []string{"Jan", "Feb", "Mar", "Apr", "May"},
		"datasets": []map[string]interface{}{
			{
				"label": "Sales",
				"data":  []int{65, 59, 80, 81, 56},
			},
			{
				"label": "Revenue",
				"data":  []int{28, 48, 40, 19, 86},
			},
		},
	}, nil
}

// getTableData retrieves data for table widgets
func (s *DashboardUpdateService) getTableData(widget models.WidgetConfig) (interface{}, error) {
	// Placeholder implementation
	return map[string]interface{}{
		"headers": []string{"ID", "Name", "Value"},
		"rows": [][]interface{}{
			{1, "Item 1", 100},
			{2, "Item 2", 200},
			{3, "Item 3", 300},
		},
	}, nil
}

// getKPIData retrieves data for KPI widgets
func (s *DashboardUpdateService) getKPIData(widget models.WidgetConfig) (interface{}, error) {
	// Placeholder implementation
	return map[string]interface{}{
		"value":      1250,
		"change":     5.2,
		"changeType": "increase",
	}, nil
}

// Stop stops the update worker
func (s *DashboardUpdateService) Stop() {
	close(s.stopChan)
}
