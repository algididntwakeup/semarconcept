// platform/backend/app/api/routes/asset_routes.go
package routes

import (
	"backend/app/api/handlers"
	"backend/app/middleware"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// SetupAssetRoutes configures all asset-related routes
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

	// Apply middleware
	assetGroup := router.Group("")
	assetGroup.Use(middleware.AuthMiddleware(tokenGen))
	// Note: TenantMiddleware removed temporarily for simplicity
	assetGroup.Use(middleware.RBACMiddleware(roleProvider, "asset:view"))

	// Register all asset routes
	assetHandler.RegisterRoutes(assetGroup)
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
