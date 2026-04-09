// platform/backend/app/api/handlers/dashboard_handler.go

package handlers

import (
	"backend/app/models/request"
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DashboardHandler handles dashboard-related HTTP requests
type DashboardHandler struct {
	dashboardService *services.DashboardService
}

// NewDashboardHandler creates a new DashboardHandler
func NewDashboardHandler(dashboardService *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
	}
}

// GetDashboardLayout retrieves a dashboard layout
// @Summary Get dashboard layout
// @Description Retrieve a specific dashboard layout and configuration
// @Tags dashboard
// @Accept json
// @Produce json
// @Param id path string true "Dashboard ID"
// @Success 200 {object} response.DashboardResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards/{id} [get]
func (h *DashboardHandler) GetDashboardLayout(c *gin.Context) {
	dashboardID := c.Param("id")
	if dashboardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dashboard ID is required",
		})
		return
	}

	// Extract user ID from context (set by auth middleware)
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Call service to get dashboard layout
	dashboard, err := h.dashboardService.GetDashboardLayout(c.Request.Context(), userID, dashboardID)
	if err != nil {
		if err.Error() == "dashboard not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Dashboard not found",
			})
			return
		}
		utils.Errorf("Error getting dashboard layout: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve dashboard layout",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dashboard,
	})
}

// SaveDashboardLayout saves or updates a dashboard layout
// @Summary Save dashboard layout
// @Description Save or update a dashboard layout and configuration
// @Tags dashboard
// @Accept json
// @Produce json
// @Param id path string true "Dashboard ID"
// @Param layout body request.DashboardLayoutRequest true "Dashboard layout data"
// @Success 200 {object} response.DashboardResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards/{id} [put]
func (h *DashboardHandler) SaveDashboardLayout(c *gin.Context) {
	dashboardID := c.Param("id")
	if dashboardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dashboard ID is required",
		})
		return
	}

	var req request.DashboardLayoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid dashboard layout data",
			"details": err.Error(),
		})
		return
	}

	// Extract user ID from context
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Call service to save dashboard layout
	dashboard, err := h.dashboardService.SaveDashboardLayout(c.Request.Context(), userID, dashboardID, req)
	if err != nil {
		utils.Errorf("Error saving dashboard layout: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save dashboard layout",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dashboard,
	})
}

// GetWidgetData retrieves data for a specific widget
// @Summary Get widget data
// @Description Retrieve data for a specific widget on a dashboard
// @Tags dashboard
// @Accept json
// @Produce json
// @Param id path string true "Dashboard ID"
// @Param widgetId path string true "Widget ID"
// @Param parameters query string false "Widget parameters as JSON"
// @Success 200 {object} response.WidgetDataResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards/{id}/widgets/{widgetId}/data [get]
func (h *DashboardHandler) GetWidgetData(c *gin.Context) {
	dashboardID := c.Param("id")
	widgetID := c.Param("widgetId")

	if dashboardID == "" || widgetID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dashboard ID and Widget ID are required",
		})
		return
	}

	// Extract user ID from context
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Parse any additional parameters from query string
	params := make(map[string]interface{})
	for key, values := range c.Request.URL.Query() {
		if len(values) > 0 {
			// Try to parse as number, otherwise keep as string
			if intVal, err := strconv.Atoi(values[0]); err == nil {
				params[key] = intVal
			} else if floatVal, err := strconv.ParseFloat(values[0], 64); err == nil {
				params[key] = floatVal
			} else {
				params[key] = values[0]
			}
		}
	}

	// Call service to get widget data
	widgetData, err := h.dashboardService.GetWidgetData(c.Request.Context(), userID, widgetID, dashboardID, params)
	if err != nil {
		if err.Error() == "widget not found" || err.Error() == "dashboard not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Widget or dashboard not found",
			})
			return
		}
		utils.Errorf("Error getting widget data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve widget data",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    widgetData,
	})
}

// ListUserDashboards retrieves dashboards accessible to the user
// @Summary List user dashboards
// @Description Retrieve a list of dashboards accessible to the user
// @Tags dashboard
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Page size" default(10)
// @Success 200 {object} response.DashboardListResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards [get]
func (h *DashboardHandler) ListUserDashboards(c *gin.Context) {
	// Extract user ID from context
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Parse pagination parameters
	page := 1
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Call service to list user dashboards
	dashboards, err := h.dashboardService.ListUserDashboards(c.Request.Context(), userID, page, limit)
	if err != nil {
		utils.Errorf("Error listing user dashboards: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve user dashboards",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dashboards,
	})
}

// ShareDashboard shares a dashboard with another user or role
// @Summary Share dashboard
// @Description Share a dashboard with another user or role
// @Tags dashboard
// @Accept json
// @Produce json
// @Param id path string true "Dashboard ID"
// @Param share body map[string]interface{} true "Share configuration"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards/{id}/share [post]
func (h *DashboardHandler) ShareDashboard(c *gin.Context) {
	dashboardID := c.Param("id")
	if dashboardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dashboard ID is required",
		})
		return
	}

	var shareReq struct {
		ShareWithUserID *int   `json:"share_with_user_id"`
		ShareWithRoleID *int   `json:"share_with_role_id"`
		PermissionLevel string `json:"permission_level"`
	}

	if err := c.ShouldBindJSON(&shareReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid share configuration",
			"details": err.Error(),
		})
		return
	}

	// Extract user ID from context
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Call service to share dashboard
	err := h.dashboardService.ShareDashboard(c.Request.Context(), userID, dashboardID,
		shareReq.ShareWithUserID, shareReq.ShareWithRoleID, shareReq.PermissionLevel)
	if err != nil {
		utils.Errorf("Error sharing dashboard: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to share dashboard",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Dashboard shared successfully",
	})
}

// UnshareDashboard removes a dashboard share
// @Summary Unshare dashboard
// @Description Remove a dashboard share
// @Tags dashboard
// @Accept json
// @Produce json
// @Param id path string true "Dashboard ID"
// @Param shareId path int true "Share ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards/{id}/share/{shareId} [delete]
func (h *DashboardHandler) UnshareDashboard(c *gin.Context) {
	dashboardID := c.Param("id")
	shareIDStr := c.Param("shareId")

	if dashboardID == "" || shareIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dashboard ID and Share ID are required",
		})
		return
	}

	shareID, err := strconv.Atoi(shareIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Share ID",
		})
		return
	}

	// Extract user ID from context
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Call service to unshare dashboard
	err = h.dashboardService.UnshareDashboard(c.Request.Context(), userID, dashboardID, shareID)
	if err != nil {
		utils.Errorf("Error unsharing dashboard: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to unshare dashboard",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Dashboard unshared successfully",
	})
}

// GetDashboardShares retrieves all shares for a dashboard
// @Summary Get dashboard shares
// @Description Retrieve all shares for a specific dashboard
// @Tags dashboard
// @Accept json
// @Produce json
// @Param id path string true "Dashboard ID"
// @Success 200 {object} []response.DashboardShareResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /dashboards/{id}/shares [get]
func (h *DashboardHandler) GetDashboardShares(c *gin.Context) {
	dashboardID := c.Param("id")
	if dashboardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dashboard ID is required",
		})
		return
	}

	// Extract user ID from context
	userID := 1 // Default fallback
	if ctxUserID, exists := c.Get("user_id"); exists {
		if uid, ok := ctxUserID.(int); ok {
			userID = uid
		}
	}

	// Call service to get dashboard shares
	shares, err := h.dashboardService.GetDashboardShares(c.Request.Context(), userID, dashboardID)
	if err != nil {
		utils.Errorf("Error getting dashboard shares: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve dashboard shares",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    shares,
	})
}
