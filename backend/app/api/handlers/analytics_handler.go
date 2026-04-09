// platform/backend/app/api/handlers/analytics_handler.go

package handlers

import (
	"backend/app/models/request"
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// AnalyticsHandler handles analytics-related HTTP requests
type AnalyticsHandler struct {
	analyticsService services.AnalyticsService
}

// NewAnalyticsHandler creates a new AnalyticsHandler
func NewAnalyticsHandler(analyticsService services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
	}
}

// GetAssetHealthMetrics retrieves asset health metrics
// @Summary Get asset health metrics
// @Description Retrieve asset health metrics for analytics dashboard
// @Tags analytics
// @Accept json
// @Produce json
// @Param asset_type query string false "Asset type filter"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /analytics/asset-health [get]
func (h *AnalyticsHandler) GetAssetHealthMetrics(c *gin.Context) {
	// Extract tenant ID from context (set by auth middleware)
	tenantID := 1 // Default fallback
	if ctxTenantID, exists := c.Get("tenant_id"); exists {
		if tid, ok := ctxTenantID.(int); ok {
			tenantID = tid
		}
	}

	// Get asset type filter from query params
	assetType := c.DefaultQuery("asset_type", "all")

	//  FIXED: Call service with proper request structure
	metrics, err := h.analyticsService.GetAssetHealthMetrics(c.Request.Context(), tenantID, &request.AssetStatisticsRequest{
		AssetTypes: []string{assetType},
	})
	if err != nil {
		utils.Errorf("Error getting asset health metrics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve asset health metrics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetCriticalityBreakdown retrieves criticality breakdown analytics
// @Summary Get criticality breakdown
// @Description Retrieve asset criticality breakdown for analytics
// @Tags analytics
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /analytics/criticality-breakdown [get]
func (h *AnalyticsHandler) GetCriticalityBreakdown(c *gin.Context) {
	// Extract tenant ID from context
	tenantID := 1 // Default fallback
	if ctxTenantID, exists := c.Get("tenant_id"); exists {
		if tid, ok := ctxTenantID.(int); ok {
			tenantID = tid
		}
	}

	//  FIXED: Call service with proper request structure
	breakdown, err := h.analyticsService.GetCriticalityBreakdown(c.Request.Context(), tenantID, &request.AssetStatisticsRequest{})
	if err != nil {
		utils.Errorf("Error getting criticality breakdown: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve criticality breakdown",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    breakdown,
	})
}

// GetIntegrityStatusSummary retrieves integrity status summary
// @Summary Get integrity status summary
// @Description Retrieve component integrity status summary
// @Tags analytics
// @Accept json
// @Produce json
// @Param Asset_id query int false "Asset ID filter"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /analytics/integrity-status [get]
func (h *AnalyticsHandler) GetIntegrityStatusSummary(c *gin.Context) {
	// Extract tenant ID from context
	tenantID := 1 // Default fallback
	if ctxTenantID, exists := c.Get("tenant_id"); exists {
		if tid, ok := ctxTenantID.(int); ok {
			tenantID = tid
		}
	}

	// Parse Asset ID filter if provided
	var AssetID *int
	if eqIDStr := c.Query("asset_id"); eqIDStr != "" {
		if eqID, err := strconv.Atoi(eqIDStr); err == nil {
			AssetID = &eqID
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid Asset_id parameter",
			})
			return
		}
	}

	//  FIXED: Call service with proper request structure
	summary, err := h.analyticsService.GetIntegrityStatusSummary(c.Request.Context(), tenantID, &request.AssetStatisticsRequest{
		AssetID: AssetID,
	})
	if err != nil {
		utils.Errorf("Error getting integrity status summary: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve integrity status summary",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    summary,
	})
}

// GetInspectionDueAnalytics retrieves inspection due analytics
// @Summary Get inspection due analytics
// @Description Retrieve inspection due analytics for maintenance planning
// @Tags analytics
// @Accept json
// @Produce json
// @Param days_ahead query int false "Days ahead to analyze" default(30)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /analytics/inspection-due [get]
func (h *AnalyticsHandler) GetInspectionDueAnalytics(c *gin.Context) {
	// Extract tenant ID from context
	tenantID := 1 // Default fallback
	if ctxTenantID, exists := c.Get("tenant_id"); exists {
		if tid, ok := ctxTenantID.(int); ok {
			tenantID = tid
		}
	}

	// Parse days ahead parameter
	daysAhead := 30 // Default
	if daysStr := c.Query("days_ahead"); daysStr != "" {
		if days, err := strconv.Atoi(daysStr); err == nil && days > 0 {
			daysAhead = days
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid days_ahead parameter",
			})
			return
		}
	}

	//  FIXED: Call service with proper request structure
	analytics, err := h.analyticsService.GetInspectionDueAnalytics(c.Request.Context(), tenantID, &request.AssetStatisticsRequest{
		DateFrom: func() *time.Time {
			t := time.Now()
			return &t
		}(),
		DateTo: func() *time.Time {
			t := time.Now().AddDate(0, 0, daysAhead)
			return &t
		}(),
	})
	if err != nil {
		utils.Errorf("Error getting inspection due analytics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve inspection due analytics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    analytics,
	})
}

// TrackEvent tracks an analytics event
// @Summary Track analytics event
// @Description Track a user analytics event
// @Tags analytics
// @Accept json
// @Produce json
// @Param event body map[string]interface{} true "Event data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /analytics/track-event [post]
func (h *AnalyticsHandler) TrackEvent(c *gin.Context) {
	var eventData map[string]interface{}
	if err := c.ShouldBindJSON(&eventData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid event data",
			"details": err.Error(),
		})
		return
	}

	// Add user and tenant context to event data
	if userID, exists := c.Get("user_id"); exists {
		eventData["user_id"] = userID
	}
	if tenantID, exists := c.Get("tenant_id"); exists {
		eventData["tenant_id"] = tenantID
	}

	// Add request context
	eventData["ip_address"] = c.ClientIP()
	eventData["user_agent"] = c.GetHeader("User-Agent")

	//  FIXED: Call service TrackEvent method
	err := h.analyticsService.TrackEvent(c.Request.Context(), eventData)
	if err != nil {
		utils.Errorf("Error tracking analytics event: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to track event",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Event tracked successfully",
	})
}
