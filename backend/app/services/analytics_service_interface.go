// platform/backend/app/services/analytics_service_interface.go

package services

import (
	"backend/app/models/request"
	"context"
)

// AnalyticsServiceInterface interface for analytics operations (matches existing analytics_service.go)
type AnalyticsServiceInterface interface {
	//  ADDED: TrackEvent method - required by analytics_handler.go line 235
	TrackEvent(ctx context.Context, eventData map[string]interface{}) error

	// Dashboard analytics
	GetDashboardAnalytics(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)

	// Asset analytics - using the request types that already exist in your code
	GetAssetStatistics(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetAssetDistribution(ctx context.Context, tenantID int, req *request.AssetDistributionRequest) (interface{}, error)
	GetCriticalAssets(ctx context.Context, tenantID int, req *request.CriticalAssetsRequest) (interface{}, error)

	//  ADDED: GetSiteStatistics method - required by asset_handler.go line 683
	GetSiteStatistics(ctx context.Context, tenantID int, req *request.SiteStatisticsRequest) (interface{}, error)

	//  ADDED: GetAssetDashboard method - required by asset_handler.go line 891
	GetAssetDashboard(ctx context.Context, tenantID int, req *request.AssetDashboardRequest) (interface{}, error)

	// Performance analytics
	GetPerformanceMetrics(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetMaintenanceEffectiveness(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetInspectionCoverage(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)

	// Risk analytics
	GetRiskAnalysis(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetComplianceStatus(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)

	// Methods called by dashboard service and analytics handler
	GetAssetHealthMetrics(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetCriticalityBreakdown(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetIntegrityStatusSummary(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
	GetInspectionDueAnalytics(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)

	// Custom reports
	GenerateCustomReport(ctx context.Context, tenantID int, req *request.AssetStatisticsRequest) (interface{}, error)
}

// AnalyticsService is an alias for backward compatibility
type AnalyticsService = AnalyticsServiceInterface
