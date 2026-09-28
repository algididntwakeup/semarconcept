// platform/backend/app/api/routes/asset_routes.go
package routes

import (
	"backend/app/api/handlers"
	"backend/app/middleware"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// SetupAssetRoutes configures all asset-related routes with authentication, tenant enforcement, and granular RBAC
func SetupAssetRoutes(router *gin.RouterGroup, db *sqlx.DB, tokenGen utils.TokenGenerator, roleProvider middleware.RBACRoleProvider) {

	// Initialize asset repositories
	siteRepo := repositories.NewSiteRepository(db)
	unitRepo := repositories.NewUnitRepository(db)
	AssetRepo := repositories.NewAssetRepository(db)
	componentRepo := repositories.NewComponentRepository(db)

	analyticsRepo := repositories.NewBasicAnalyticsRepository(db)
	assetRepo := repositories.NewAssetRepository(db)
	userRepo := repositories.NewUserRepository(db)

	assetService := services.NewAssetService(
		siteRepo,
		unitRepo,
		AssetRepo,
		componentRepo,
	)

	analyticsService := services.NewAnalyticsService(
		analyticsRepo,
		assetRepo,
		userRepo,
	)

	assetHandler := handlers.NewAssetHandler(assetService, analyticsService)

	// Apply authentication and strict tenant enforcement (zero-trust: no default fallback)
	assetGroup := router.Group("")
	assetGroup.Use(middleware.AuthMiddleware(tokenGen))
	assetGroup.Use(middleware.RequireTenantContext())

	// Register all asset routes with granular RBAC permissions
	RegisterAssetRoutesWithRBAC(assetGroup, assetHandler, roleProvider)
}

// RegisterAssetRoutesWithRBAC registers asset-related routes with action-level RBAC permissions
func RegisterAssetRoutesWithRBAC(router *gin.RouterGroup, h *handlers.AssetHandler, roleProvider middleware.RBACRoleProvider) {
	rbac := func(permission string) gin.HandlerFunc {
		if roleProvider != nil {
			return middleware.RBACMiddleware(roleProvider, permission)
		}
		return func(c *gin.Context) { c.Next() }
	}

	// Site routes
	sites := router.Group("/sites")
	{
		sites.POST("", rbac("asset:create"), h.CreateSite)
		sites.GET("", rbac("asset:view"), h.ListSites)
		sites.POST("/search", rbac("asset:view"), h.SearchSites)
		sites.GET("/:id", rbac("asset:view"), h.GetSite)
		sites.PUT("/:id", rbac("asset:update"), h.UpdateSite)
		sites.DELETE("/:id", rbac("asset:delete"), h.DeleteSite)
		sites.GET("/:id/statistics", rbac("asset:view"), h.GetSiteStatistics)
		sites.GET("/:id/hierarchy", rbac("asset:view"), h.GetSiteWithHierarchy)
	}

	// Unit routes
	units := router.Group("/units")
	{
		units.POST("", rbac("asset:create"), h.CreateUnit)
		units.GET("", rbac("asset:view"), h.ListUnits)
		units.GET("/:id", rbac("asset:view"), h.GetUnit)
		units.PUT("/:id", rbac("asset:update"), h.UpdateUnit)
		units.DELETE("/:id", rbac("asset:delete"), h.DeleteUnit)
	}

	// Asset routes
	// Lowercase endpoints are kept for the Asset Master frontend/API contract.
	router.GET("/stats", rbac("asset:view"), h.GetAssetStats)
	router.GET("", rbac("asset:view"), h.ListAsset)
	router.PUT("/:id/lifecycle", rbac("asset:update"), h.UpdateAssetLifecycle)
	router.GET("/diagnose-duplicates", rbac("asset:view"), h.DiagnoseDuplicateAssets)
	router.POST("/fix-links", rbac("asset:update"), h.FixAssetLinks)
	router.POST("/sync-floc", rbac("asset:update"), h.SyncAssetFLOC)
	router.GET("/export", rbac("asset:export"), h.ExportAssets)
	router.POST("/import", rbac("asset:import"), h.ImportAssets)

	Asset := router.Group("/Asset")
	{
		Asset.POST("", rbac("asset:create"), h.CreateAsset)
		Asset.GET("", rbac("asset:view"), h.ListAsset)
		Asset.GET("/:id", rbac("asset:view"), h.GetAsset)
		Asset.PUT("/:id", rbac("asset:update"), h.UpdateAsset)
		Asset.DELETE("/:id", rbac("asset:delete"), h.DeleteAsset)
	}

	// Component routes
	components := router.Group("/components")
	{
		components.POST("", rbac("asset:create"), h.CreateComponent)
		components.GET("", rbac("asset:view"), h.ListComponents)
		components.GET("/:id", rbac("asset:view"), h.GetComponent)
		components.PUT("/:id", rbac("asset:update"), h.UpdateComponent)
		components.DELETE("/:id", rbac("asset:delete"), h.DeleteComponent)
	}

	// Asset hierarchy and analytics routes
	router.GET("/hierarchy", rbac("asset:view"), h.GetAssetHierarchy)
	router.GET("/path/:type/:id", rbac("asset:view"), h.GetAssetPath)
	router.GET("/statistics", rbac("asset:view"), h.GetAssetStatistics)
	router.GET("/distribution", rbac("asset:view"), h.GetAssetDistribution)
	router.GET("/health", rbac("asset:view"), h.GetAssetHealth)
	router.GET("/dashboard", rbac("asset:view"), h.GetAssetDashboard)
	router.GET("/search", rbac("asset:view"), h.SearchAssets)
	router.POST("/search", rbac("asset:view"), h.SearchAssets)
	router.GET("/critical", rbac("asset:view"), h.GetCriticalAssets)
	router.GET("/inspection-due", rbac("asset:view"), h.GetAssetsRequiringInspection)

	// Bulk operations
	router.PATCH("/criticality", rbac("asset:update"), h.UpdateAssetCriticality)
	router.POST("/validate-hierarchy", rbac("asset:view"), h.ValidateAssetHierarchy)
	router.PATCH("/bulk-update", rbac("asset:update"), h.BulkUpdateAssets)
	router.DELETE("/bulk-delete", rbac("asset:delete"), h.BulkDeleteAssets)

	// Test endpoint
	router.GET("/assets/test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message":   "Asset API is working!",
			"success":   true,
			"timestamp": time.Now(),
		})
	})
}

// SetupPublicAssetRoutes configures public asset routes (if any)
func SetupPublicAssetRoutes(router *gin.RouterGroup, db *sqlx.DB) {
	// Public routes for assets (like public API documentation)
	// Currently none, but can be added here
}

// SetupInternalAssetRoutes configures internal/admin asset routes
func SetupInternalAssetRoutes(router *gin.RouterGroup, db *sqlx.DB, tokenGen utils.TokenGenerator, roleProvider middleware.RBACRoleProvider) {

	siteRepo := repositories.NewSiteRepository(db)
	unitRepo := repositories.NewUnitRepository(db)
	AssetRepo := repositories.NewAssetRepository(db)
	componentRepo := repositories.NewComponentRepository(db)

	analyticsRepo := repositories.NewBasicAnalyticsRepository(db)
	assetRepo := repositories.NewAssetRepository(db)
	userRepo := repositories.NewUserRepository(db)

	assetService := services.NewAssetService(
		siteRepo,
		unitRepo,
		AssetRepo,
		componentRepo,
	)

	analyticsService := services.NewAnalyticsService(
		analyticsRepo,
		assetRepo,
		userRepo,
	)

	assetHandler := handlers.NewAssetHandler(assetService, analyticsService)

	// Apply admin middleware
	adminGroup := router.Group("/admin")
	adminGroup.Use(middleware.AuthMiddleware(tokenGen))

	adminGroup.Use(middleware.RBACMiddleware(roleProvider, "admin:view"))

	// Admin-only asset routes
	admin := adminGroup.Group("/assets")
	{
		admin.POST("/bulk-import", assetHandler.ImportAssets)
		admin.POST("/bulk-export", assetHandler.ExportAssets)
		admin.GET("/system-statistics", assetHandler.GetAssetStatistics)
		admin.DELETE("/bulk-delete", assetHandler.BulkDeleteAssets)
	}
}
