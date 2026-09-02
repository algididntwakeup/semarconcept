// platform/backend/app/api/routes/router.go
package routes

import (
	"backend/app/api/handlers"
	"backend/app/cache"
	"backend/app/config"
	"backend/app/middleware"
	"backend/app/pagination"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/jmoiron/sqlx"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	gormPostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// COMPLETE CORS FIX: Enhanced CORS middleware with comprehensive debugging and SSE support
func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		method := c.Request.Method
		path := c.Request.URL.Path

		// DEBUG: Log the actual config being used (only in development)
		isDevelopment := cfg.Environment == "development" || os.Getenv("APP_ENV") == "development"
		debugCORS := os.Getenv("DEBUG_CORS") == "true"

		if debugCORS {
			utils.Infof("CORS DEBUG: Config loaded - Origins: %v", cfg.CORS.AllowedOrigins)
			utils.Infof("CORS DEBUG: Config loaded - Headers: %v", cfg.CORS.AllowedHeaders)
			utils.Infof("CORS DEBUG: Config loaded - Methods: %v", cfg.CORS.AllowedMethods)
			utils.Infof("CORS DEBUG: Request - Origin: %s, Method: %s, Path: %s", origin, method, path)
		}

		//  COMPREHENSIVE: Always include these essential headers regardless of config
		//  ENHANCED: Added SSE-specific headers
		essentialHeaders := []string{
			"Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token",
			"Authorization", "accept", "origin", "Cache-Control", "X-Requested-With",
			"X-Development-Mode", "X-Mock-Token", "X-Request-ID", "X-Tenant-ID",
			"X-Tenant-Subdomain", "X-Client-Version", "User-Agent", "Referer",
			"Accept", "Accept-Language", "Connection", "Host", "Last-Event-ID", //  SSE headers
		}

		//  MERGE: Combine config headers with essential headers (remove duplicates)
		allowedHeaders := cfg.CORS.AllowedHeaders
		headerMap := make(map[string]bool)

		// Add config headers first
		for _, header := range allowedHeaders {
			if header != "" {
				headerMap[strings.TrimSpace(header)] = true
			}
		}

		// Add essential headers
		for _, header := range essentialHeaders {
			headerMap[header] = true
		}

		// Convert back to slice
		finalHeaders := make([]string, 0, len(headerMap))
		for header := range headerMap {
			finalHeaders = append(finalHeaders, header)
		}

		//  COMPREHENSIVE: Use origins from config
		allowedOrigins := cfg.CORS.AllowedOrigins
		if len(allowedOrigins) == 0 {
			if debugCORS {
				utils.Warn("CORS: Config origins empty, using wildcard as fallback for development")
			}
			allowedOrigins = []string{"*"}
		}

		// Check if origin is allowed
		originAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if allowedOrigin == "*" {
				c.Header("Access-Control-Allow-Origin", "*")
				originAllowed = true
				break
			} else if allowedOrigin == origin {
				c.Header("Access-Control-Allow-Origin", origin)
				originAllowed = true
				break
			}
		}

		// Development mode: be more permissive
		if !originAllowed && origin != "" && isDevelopment {
			c.Header("Access-Control-Allow-Origin", origin)
			originAllowed = true
			utils.Warnf("CORS: Allowing non-whitelisted origin in development: %s", origin)
		}

		// If no origin matches and not in development, still allow if no origin (like direct API calls)
		if !originAllowed && origin == "" {
			c.Header("Access-Control-Allow-Origin", "*")
			originAllowed = true
		}

		// Set allowed methods
		allowedMethods := cfg.CORS.AllowedMethods
		if len(allowedMethods) == 0 {
			allowedMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"}
		}
		methods := strings.Join(allowedMethods, ",")
		c.Header("Access-Control-Allow-Methods", methods)

		//  CRITICAL: Set comprehensive headers
		headers := strings.Join(finalHeaders, ",")
		c.Header("Access-Control-Allow-Headers", headers)

		// Set exposed headers
		exposedHeaders := cfg.CORS.ExposedHeaders
		if len(exposedHeaders) == 0 {
			exposedHeaders = []string{"X-Request-ID", "X-Total-Count", "Content-Length", "Content-Type"}
		}
		if len(exposedHeaders) > 0 {
			exposedHeadersStr := strings.Join(exposedHeaders, ",")
			c.Header("Access-Control-Expose-Headers", exposedHeadersStr)
		}

		// Set credentials
		allowCredentials := cfg.CORS.AllowCredentials
		if allowCredentials {
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		// Set max age
		maxAge := cfg.CORS.MaxAge
		if maxAge <= 0 {
			maxAge = 86400 // 24 hours default
		}
		c.Header("Access-Control-Max-Age", fmt.Sprintf("%d", maxAge))

		// Additional headers for better compatibility
		c.Header("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers")

		// DEBUG: Log final headers being sent
		if debugCORS {
			utils.Infof("CORS: Final headers sent - Allow-Origin: %s", c.Writer.Header().Get("Access-Control-Allow-Origin"))
			utils.Infof("CORS: Final headers sent - Allow-Headers: %s", c.Writer.Header().Get("Access-Control-Allow-Headers"))
			utils.Infof("CORS: Final headers sent - Allow-Methods: %s", c.Writer.Header().Get("Access-Control-Allow-Methods"))
		}

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			utils.Infof("CORS: Preflight request handled for origin: %s, path: %s", origin, path)

			// Additional debug for preflight
			if debugCORS {
				requestMethod := c.Request.Header.Get("Access-Control-Request-Method")
				requestHeaders := c.Request.Header.Get("Access-Control-Request-Headers")
				utils.Infof("CORS: Preflight - Requested Method: %s", requestMethod)
				utils.Infof("CORS: Preflight - Requested Headers: %s", requestHeaders)
			}

			c.AbortWithStatus(204)
			return
		}

		if debugCORS {
			utils.Debugf("CORS: Request allowed for origin: %s", origin)
		}
		c.Next()
	}
}

// SetupRouter initializes and configures the Gin router - COMPLETELY FIXED WITH SSE
func SetupRouter(cfg *config.Config, sqlxDB *sqlx.DB, cacheService *cache.Service) *gin.Engine {
	utils.Info("Setting up router with COMPLETE FIXES + SSE...")

	// Initialize GORM DB from sqlx.DB connection
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=Asia/Shanghai search_path=public",
		cfg.Database.Host, cfg.Database.User, cfg.Database.Password, cfg.Database.Name, cfg.Database.Port, cfg.Database.SSLMode)

	gormDB, err := gorm.Open(gormPostgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		utils.Fatalf("Failed to connect to database using GORM: %v", err)
	}

	//  FIXED: Redis client initialization with proper error handling
	var redisClient *redis.Client

	if cfg.Redis.Host != "" && cfg.Redis.Port != "" {
		redisClient = redis.NewClient(&redis.Options{
			Addr:     cfg.Redis.Host + ":" + cfg.Redis.Port,
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})

		ctx := context.Background()
		if err := redisClient.Ping(ctx).Err(); err != nil {
			utils.Warnf("Redis connection failed: %v - Continuing without Redis", err)
			redisClient = nil
		} else {
			utils.Info("Redis connection established")
		}
	} else {
		utils.Info("Redis not configured - Using JWT-only authentication")
		redisClient = nil
	}

	//  COMPLETELY FIXED: Initialize all repositories with CORRECT constructor names
	utils.Info("Initializing repositories with correct constructor names...")

	// SQLX-based repositories
	userRepo := repositories.NewUserRepository(sqlxDB)
	auditRepo := repositories.NewPostgresAuditLogRepository(sqlxDB)
	menuRepo := repositories.NewPostgresMenuRepository(sqlxDB)

	// Use existing constructors with correct names
	assetRepo := repositories.NewAssetRepository(sqlxDB)
	dashboardDataRepo := repositories.NewDashboardRepository(sqlxDB)
	mediaRepo := repositories.NewBasicMediaRepository(sqlxDB)

	// Use real analytics repository implementation
	analyticsRepo := repositories.NewAnalyticsRepository(sqlxDB)
	taxonomyRepo := repositories.NewTaxonomyRepository(sqlxDB)

	// GORM-based repositories
	tenantRepo := repositories.NewTenantRepository(gormDB)
	dashboardLayoutRepo := repositories.NewGormDashboardLayoutRepository(gormDB)

	// Use GORM-based repositories
	passwordResetRepo := repositories.NewGormPasswordResetRepository(gormDB)
	configRepo := repositories.NewGormConfigurationRepository(gormDB)

	//  COMPLETELY FIXED: Initialize services with correct constructors
	utils.Info("Initializing services with correct signatures...")

	// Create JWT service with correct function and parameters
	jwtService := utils.NewJWTService(cfg.JWT.SecretKey, "reksolindo-platform")

	// Create tenant service with all required dependencies
	tenantService := services.NewTenantService(tenantRepo, userRepo, auditRepo)

	//  CRITICAL ENHANCEMENT: Enhanced Analytics Service with REAL repository implementation
	analyticsService := services.NewAnalyticsService(
		analyticsRepo, //  FIXED: Now using real implementation (18K file) instead of stub (2.9K file)
		assetRepo,     //  NEW: For asset health calculations
		userRepo,      //  NEW: For user metrics
	)

	//  SURGICAL ENHANCEMENT: Enhanced Dashboard Service with analytics integration
	dashboardService := services.NewDashboardService(
		dashboardLayoutRepo,
		dashboardDataRepo,
		analyticsService, //  NEW: For widget data
		userRepo,         //  NEW: For user statistics
	)

	taxonomyService := services.NewTaxonomyService(taxonomyRepo)

	//  SURGICAL ADD: Media Service for file management
	mediaService := services.NewLocalMediaService(
		mediaRepo,
		cfg.Storage.UploadPath, // From your config: UPLOAD_PATH
		"/static/uploads/",     // Base URL for file access
	)

	// Create auth service with all required dependencies
	authService := services.NewAuthService(
		userRepo,
		repositories.NewBasicRoleRepository(gormDB),
		repositories.NewBasicUserRoleRepository(gormDB),
		passwordResetRepo,
		tenantService,
		jwtService,
		cfg,
	)

	// Create user service with required dependencies
	userService := services.NewUserService(
		userRepo,
		repositories.NewBasicRoleRepository(gormDB),
		repositories.NewBasicUserRoleRepository(gormDB),
		cacheService,
	)

	// Create menu service with auth service
	menuService := services.NewMenuService(menuRepo, *authService)

	//  CRITICAL FIXED: Initialize role and permission services with correct signatures
	logger := utils.NewLogger()
	roleRepo := repositories.NewGormRoleRepository(gormDB)
	roleService := services.NewRoleService(roleRepo, logger)
	permissionRepo := repositories.NewGormPermissionRepository(gormDB)
	permissionService := services.NewPermissionService(permissionRepo, logger)

	//  COMPLETELY FIXED: Initialize handlers with correct constructors
	utils.Info("Initializing handlers with correct signatures...")

	// Create auth handler with services and JWT service
	authHandler := handlers.NewAuthHandler(*authService, *userService, jwtService, tenantService)

	// Create user handler with service
	userHandler := handlers.NewUserHandler(*userService)

	tenantHandler := handlers.NewTenantHandler(tenantService)
	menuHandler := handlers.NewMenuHandler(menuService)
	configHandler := handlers.NewConfigHandler(configRepo)

	//  SURGICAL ADD: Enhanced service handlers
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService) //  NEW: For analytics endpoints
	dashboardHandler := handlers.NewDashboardHandler(dashboardService) //  NEW: For dashboard endpoints
	mediaHandler := handlers.NewMediaHandler(mediaService)             //  NEW: For media endpoints
	taxonomyHandler := handlers.NewTaxonomyHandler(taxonomyService)

	//  CRITICAL FIXED: Initialize role and permission handlers with correct services
	roleHandler := handlers.NewRoleHandler(roleService)
	permissionHandler := handlers.NewPermissionHandler(permissionService)

	//  NEW: SSE Handler for real-time communication
	sseHandler := handlers.NewSSEHandler(jwtService)

	//  COMPLETELY FIXED: Initialize middleware
	utils.Info("Setting up middleware...")
	authMiddleware := middleware.AuthMiddleware(jwtService)

	// Setup Gin router
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.LoggingMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())

	//  CRITICAL FIX: Use enhanced CORS middleware
	utils.Info("CORS: Setting up enhanced CORS middleware...")
	utils.Infof("CORS: Allowed Origins: %v", cfg.CORS.AllowedOrigins)
	utils.Infof("CORS: Allowed Headers: %v", cfg.CORS.AllowedHeaders)
	router.Use(CORSMiddleware(cfg))

	//  COMPLETELY FIXED: Health check route with proper handler
	router.GET("/health", handlers.HealthCheck(sqlxDB))

	//  NEW: SSE Routes for real-time communication
	utils.Info("Setting up SSE routes...")
	sseRoutes := router.Group("/sse")
	{
		sseRoutes.GET("", sseHandler.HandleSSE)             // Main SSE endpoint
		sseRoutes.GET("/health", sseHandler.SSEHealthCheck) // SSE health check
		sseRoutes.OPTIONS("", sseHandler.HandleSSE)         // Handle preflight

		// Development/testing endpoints
		if cfg.Environment == "development" || os.Getenv("APP_ENV") == "development" {
			debugRoutes := router.Group("/debug")
			{
				// Test parameter parsing
				debugRoutes.GET("/menu-id-test/:id", func(c *gin.Context) {
					idParam := c.Param("id")

					// Test the same logic as in menu handler
					var id int
					var parseMethod string

					if numericID, err := strconv.Atoi(idParam); err == nil {
						id = numericID
						parseMethod = "numeric"
					} else {
						// Try string mapping (based on YOUR database)
						stringMap := map[string]int{
							"primary": 1, "dashboard": 1, "analytics": 2, "assets": 3, "asset": 3,
							"inspection": 4, "risk": 5, "maintenance": 6, "compliance": 7,
							"content": 8, "admin": 9, "templates": 10, "starter": 10, "template": 10,
						}
						if mappedID, exists := stringMap[strings.ToLower(idParam)]; exists {
							id = mappedID
							parseMethod = "string_mapped"
						} else {
							c.JSON(http.StatusBadRequest, gin.H{
								"error":            "Invalid ID format",
								"received":         idParam,
								"valid_strings":    []string{"primary", "dashboard", "analytics", "assets", "inspection", "risk", "maintenance", "compliance", "content", "admin", "templates"},
								"valid_numeric":    "1-10",
								"database_mapping": stringMap,
							})
							return
						}
					}

					c.JSON(http.StatusOK, gin.H{
						"success":        true,
						"original_param": idParam,
						"parsed_id":      id,
						"parse_method":   parseMethod,
						"message":        "Parameter parsing successful",
						"test_time":      time.Now(),
					})
				})

				// Test auth token extraction
				debugRoutes.GET("/auth/token-test", func(c *gin.Context) {
					authHeader := c.GetHeader("Authorization")

					var token string
					var hasToken bool

					if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
						token = strings.TrimPrefix(authHeader, "Bearer ")
						hasToken = true
					}

					c.JSON(http.StatusOK, gin.H{
						"success":          true,
						"has_auth_header":  authHeader != "",
						"has_bearer_token": hasToken,
						"token_length":     len(token),
						"token_preview": func() string {
							if len(token) > 10 {
								return token[:10] + "..."
							}
							return token
						}(),
						"test_time": time.Now(),
					})
				})

				// Test menu database query
				debugRoutes.GET("/menu/database-test", authMiddleware, func(c *gin.Context) {
					// Test both filtered and unfiltered
					tenantID := 1
					ctx := c.Request.Context()

					filteredMenus, err1 := menuService.GetMenus(ctx, tenantID)
					allMenus, err2 := menuService.GetAllMenus(ctx, tenantID, true)

					if err1 != nil || err2 != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"error":                "Failed to get menus",
							"filtered_menus_error": err1,
							"all_menus_error":      err2,
						})
						return
					}

					// Count primary vs secondary menus
					primaryCount := 0
					secondaryCount := 0
					var activeCount, inactiveCount, visibleCount, invisibleCount int

					for _, menu := range allMenus {
						if menu.ParentID == nil {
							primaryCount++
						} else {
							secondaryCount++
						}

						if menu.IsActive {
							activeCount++
						} else {
							inactiveCount++
						}

						if menu.IsVisible {
							visibleCount++
						} else {
							invisibleCount++
						}
					}

					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"filtering_test": gin.H{
							"total_menus":     len(allMenus),
							"filtered_menus":  len(filteredMenus),
							"filtered_out":    len(allMenus) - len(filteredMenus),
							"filtering_works": len(filteredMenus) <= len(allMenus),
						},
						"breakdown": gin.H{
							"primary_menus":   primaryCount,
							"secondary_menus": secondaryCount,
							"active_menus":    activeCount,
							"inactive_menus":  inactiveCount,
							"visible_menus":   visibleCount,
							"invisible_menus": invisibleCount,
						},
						"test_time":   time.Now(),
						"fix_applied": "Enhanced with filtering test",
					})
				})

				debugRoutes.GET("/menu/filter-comparison", authMiddleware, func(c *gin.Context) {
					tenantID := 1
					ctx := c.Request.Context()

					// Test all endpoints
					filteredMenus, _ := menuService.GetMenus(ctx, tenantID)
					allMenus, _ := menuService.GetAllMenus(ctx, tenantID, true)
					hierarchyMenus, _ := menuService.GetMenuHierarchy(ctx, tenantID)

					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"endpoint_comparison": gin.H{
							"GET_menus_filtered": len(filteredMenus),
							"GET_all_menus":      len(allMenus),
							"GET_hierarchy":      len(hierarchyMenus),
						},
						"filter_status": gin.H{
							"basic_filtering_active":     len(filteredMenus) <= len(allMenus),
							"hierarchy_filtering_active": len(hierarchyMenus) <= len(allMenus),
							"admin_bypass_available":     len(allMenus) > 0,
						},
						"test_time": time.Now(),
					})
				})
			}

			utils.Info("DEBUG: Test routes enabled for development")
			utils.Info("DEBUG: Available test endpoints:")
			utils.Info("   - GET /debug/menu-id-test/:id")
			utils.Info("   - GET /debug/auth/token-test")
			utils.Info("   - GET /debug/menu/database-test")
		}

	}

	// Auth routes with available methods from auth_handler.go
	authRoutes := router.Group("/api/v1/auth")
	{
		// Existing routes (keep these)
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/logout", authHandler.Logout)
		authRoutes.POST("/refresh", authHandler.RefreshToken)
		authRoutes.POST("/logout-all", authHandler.LogoutAll)
		authRoutes.GET("/validate", authHandler.ValidateToken)
		authRoutes.GET("/stats", authHandler.GetAuthStats)
		authRoutes.POST("/cleanup-blacklist", authHandler.CleanupBlacklist)

		//  NEW: Missing profile endpoints (CRITICAL FIX)
		authRoutes.GET("/me", authMiddleware, authHandler.GetCurrentUser)
		authRoutes.GET("/permissions", authMiddleware, authHandler.GetUserPermissions)
		authRoutes.GET("/roles", authMiddleware, authHandler.GetUserRoles)

		//  BONUS: Additional useful endpoints
		authRoutes.PUT("/profile", authMiddleware, authHandler.UpdateUserProfile)       // Bonus: Update profile
		authRoutes.POST("/change-password", authMiddleware, authHandler.ChangePassword) // Bonus: Change password
	}

	// Swagger documentation
	router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Protected API v1 routes
	apiV1 := router.Group("/api/v1")
	{
		//  COMPLETELY FIXED: User routes
		userRoutes := apiV1.Group("/users")
		userRoutes.Use(authMiddleware)
		userRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		userRoutes.Use(pagination.Middleware())
		{
			userRoutes.GET("", userHandler.GetUsers)
			userRoutes.GET("/:id", userHandler.GetUser)
			userRoutes.POST("", userHandler.CreateUser)
			userRoutes.PUT("/:id", userHandler.UpdateUser)
			userRoutes.DELETE("/:id", userHandler.DeleteUser)
			userRoutes.GET("/profile", userHandler.GetCurrentUserProfile)
			userRoutes.GET("/stats", middleware.RBACMiddleware(roleRepo, "user:stats"), userHandler.GetUserStats)
			userRoutes.GET("/managers", middleware.RBACMiddleware(roleRepo, "user:view"), userHandler.GetManagers)
			userRoutes.POST("/bulk-delete", middleware.RBACMiddleware(roleRepo, "user:delete"), userHandler.BulkDeleteUsers)
		}

		//  CRITICAL FIXED: Role routes with correct handlers
		roleRoutes := apiV1.Group("/roles")
		roleRoutes.Use(authMiddleware)
		roleRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		roleRoutes.Use(pagination.Middleware())
		{
			roleRoutes.GET("", middleware.RBACMiddleware(roleRepo, "role:view"), roleHandler.ListRoles)
			roleRoutes.GET("/:id", middleware.RBACMiddleware(roleRepo, "role:view"), roleHandler.GetRole)
			roleRoutes.POST("", middleware.RBACMiddleware(roleRepo, "role:create"), roleHandler.CreateRole)
			roleRoutes.PUT("/:id", middleware.RBACMiddleware(roleRepo, "role:update"), roleHandler.UpdateRole)
			roleRoutes.DELETE("/:id", middleware.RBACMiddleware(roleRepo, "role:delete"), roleHandler.DeleteRole)
			roleRoutes.GET("/stats", middleware.RBACMiddleware(roleRepo, "role:stats"), roleHandler.GetRoleStats)
			roleRoutes.GET("/validate-code", middleware.RBACMiddleware(roleRepo, "role:view"), roleHandler.ValidateRoleCode)
			roleRoutes.POST("/bulk-delete", middleware.RBACMiddleware(roleRepo, "role:delete"), roleHandler.BulkDeleteRoles)
		}

		//  CRITICAL FIXED: Permission routes with correct handlers
		permissionRoutes := apiV1.Group("/permissions")
		permissionRoutes.Use(authMiddleware)
		permissionRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		permissionRoutes.Use(pagination.Middleware())
		{
			permissionRoutes.GET("", middleware.RBACMiddleware(roleRepo, "permission:view"), permissionHandler.ListPermissions)
			permissionRoutes.GET("/:id", middleware.RBACMiddleware(roleRepo, "permission:view"), permissionHandler.GetPermission)
			permissionRoutes.POST("", middleware.RBACMiddleware(roleRepo, "permission:create"), permissionHandler.CreatePermission)
			permissionRoutes.PUT("/:id", middleware.RBACMiddleware(roleRepo, "permission:update"), permissionHandler.UpdatePermission)
			permissionRoutes.DELETE("/:id", middleware.RBACMiddleware(roleRepo, "permission:delete"), permissionHandler.DeletePermission)
			permissionRoutes.GET("/stats", middleware.RBACMiddleware(roleRepo, "permission:stats"), permissionHandler.GetPermissionStats)
			permissionRoutes.POST("/bulk-delete", middleware.RBACMiddleware(roleRepo, "permission:delete"), permissionHandler.BulkDeletePermissions)
		}

		//  COMPLETELY FIXED: Tenant routes
		tenantRoutes := apiV1.Group("/tenants")
		tenantRoutes.Use(authMiddleware)
		tenantRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		{
			tenantRoutes.GET("/current", tenantHandler.GetCurrentTenant)
			tenantRoutes.POST("", middleware.RBACMiddleware(roleRepo, "tenant:create"), tenantHandler.CreateTenant)
			tenantRoutes.GET("", middleware.RBACMiddleware(roleRepo, "tenant:view"), tenantHandler.GetTenants)
			tenantRoutes.GET("/:id", middleware.RBACMiddleware(roleRepo, "tenant:read"), tenantHandler.GetTenant)
			tenantRoutes.GET("/subdomain/:subdomain", middleware.RBACMiddleware(roleRepo, "tenant:read"), tenantHandler.GetTenantBySubdomain)
			tenantRoutes.PUT("/:id", middleware.RBACMiddleware(roleRepo, "tenant:update"), tenantHandler.UpdateTenant)
			tenantRoutes.DELETE("/:id", middleware.RBACMiddleware(roleRepo, "tenant:delete"), tenantHandler.DeleteTenant)
		}

		//  COMPLETELY FIXED: Menu routes with hierarchy support + FIXED TOGGLE ROUTE
		menuRoutes := apiV1.Group("/menu")
		menuRoutes.Use(authMiddleware)
		menuRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		{
			//  ENHANCED: Regular routes with filtering
			menuRoutes.GET("", middleware.RBACMiddleware(roleRepo, "menu:view"), menuHandler.GetMenus)
			menuRoutes.GET("/hierarchy", middleware.RBACMiddleware(roleRepo, "menu:view"), menuHandler.GetMenuHierarchy)
			menuRoutes.GET("/:id", middleware.RBACMiddleware(roleRepo, "menu:view"), menuHandler.GetMenu)
			menuRoutes.GET("/:id/children", middleware.RBACMiddleware(roleRepo, "menu:view"), menuHandler.GetMenuChildren)

			// Management routes
			menuRoutes.POST("", middleware.RBACMiddleware(roleRepo, "menu:create"), menuHandler.CreateMenu)
			menuRoutes.PUT("/:id", middleware.RBACMiddleware(roleRepo, "menu:update"), menuHandler.UpdateMenu)
			menuRoutes.DELETE("/:id", middleware.RBACMiddleware(roleRepo, "menu:delete"), menuHandler.DeleteMenu)

			//  CRITICAL FIX: Changed route from "/status" to "/toggle" to match frontend
			menuRoutes.PUT("/:id/toggle", middleware.RBACMiddleware(roleRepo, "menu:update"), menuHandler.ToggleStatus)

			menuRoutes.PUT("/reorder", middleware.RBACMiddleware(roleRepo, "menu:update"), menuHandler.ReorderMenus)
			menuRoutes.POST("/batch", middleware.RBACMiddleware(roleRepo, "menu:create"), menuHandler.BatchOperations)

			// User-specific routes (already filtered by backend)
			menuRoutes.GET("/user-tree", menuHandler.GetUserMenuTree)
			menuRoutes.GET("/accessible", menuHandler.GetAccessibleMenus)

			//  NEW: Debug route for checking filtering status
			if cfg.Environment == "development" {
				menuRoutes.GET("/debug/stats", menuHandler.GetMenuStats)
				utils.Info("DEBUG: Menu stats endpoint enabled at /api/v1/menu/debug/stats")
			}
		}

		//  COMPLETELY FIXED: Configuration routes
		configRoutes := apiV1.Group("/config")
		configRoutes.Use(authMiddleware)
		configRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		{
			configRoutes.GET("", middleware.RBACMiddleware(roleRepo, "config:view"), configHandler.ListConfigs)
			configRoutes.GET("/category/:category", middleware.RBACMiddleware(roleRepo, "config:view"), configHandler.GetConfigsByCategory)
			configRoutes.GET("/:key", middleware.RBACMiddleware(roleRepo, "config:view"), configHandler.GetConfig)
			configRoutes.PUT("/:key", middleware.RBACMiddleware(roleRepo, "config:update"), configHandler.UpdateConfig)
			configRoutes.POST("", middleware.RBACMiddleware(roleRepo, "config:create"), configHandler.CreateConfig)
			configRoutes.DELETE("/:key", middleware.RBACMiddleware(roleRepo, "config:delete"), configHandler.DeleteConfig)
		}

		//  SURGICAL ADD: Analytics routes - NOW WITH REAL DATA
		analyticsRoutes := apiV1.Group("/analytics")
		analyticsRoutes.Use(authMiddleware)
		analyticsRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		{
			analyticsRoutes.GET("/asset-health", middleware.RBACMiddleware(roleRepo, "analytics:view"), analyticsHandler.GetAssetHealthMetrics)
			analyticsRoutes.GET("/criticality-breakdown", middleware.RBACMiddleware(roleRepo, "analytics:view"), analyticsHandler.GetCriticalityBreakdown)
			analyticsRoutes.GET("/integrity-status", middleware.RBACMiddleware(roleRepo, "analytics:view"), analyticsHandler.GetIntegrityStatusSummary)
			analyticsRoutes.GET("/inspection-due", middleware.RBACMiddleware(roleRepo, "analytics:view"), analyticsHandler.GetInspectionDueAnalytics)
			analyticsRoutes.POST("/track-event", middleware.RBACMiddleware(roleRepo, "analytics:create"), analyticsHandler.TrackEvent)
		}

		//  SURGICAL ADD: Dashboard routes
		dashboardRoutes := apiV1.Group("/dashboards")
		dashboardRoutes.Use(authMiddleware)
		dashboardRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		{
			dashboardRoutes.GET("", dashboardHandler.ListUserDashboards)
			dashboardRoutes.GET("/:id", dashboardHandler.GetDashboardLayout)
			dashboardRoutes.PUT("/:id", dashboardHandler.SaveDashboardLayout)
			dashboardRoutes.GET("/:id/widgets/:widgetId/data", dashboardHandler.GetWidgetData)
			dashboardRoutes.POST("/:id/share", middleware.RBACMiddleware(roleRepo, "dashboard:share"), dashboardHandler.ShareDashboard)
			dashboardRoutes.DELETE("/:id/share/:shareId", middleware.RBACMiddleware(roleRepo, "dashboard:share"), dashboardHandler.UnshareDashboard)
			dashboardRoutes.GET("/:id/shares", middleware.RBACMiddleware(roleRepo, "dashboard:share"), dashboardHandler.GetDashboardShares)
		}

		//  SURGICAL ADD: Media routes with HighTier rate limiting
		mediaRoutes := apiV1.Group("/media")
		mediaRoutes.Use(authMiddleware)
		mediaRoutes.Use(middleware.RateLimitMiddleware(middleware.HighTier))
		{
			mediaRoutes.POST("/upload", middleware.RBACMiddleware(roleRepo, "media:upload"), mediaHandler.UploadFile)
			mediaRoutes.DELETE("/:id", middleware.RBACMiddleware(roleRepo, "media:delete"), mediaHandler.DeleteFile)
			mediaRoutes.GET("/:id/url", mediaHandler.GetMediaURL)
		}

		//  SURGICAL ADD: Taxonomy routes
		taxonomyRoutes := apiV1.Group("/taxonomy")
		taxonomyRoutes.Use(authMiddleware)
		taxonomyRoutes.Use(middleware.RateLimitMiddleware(middleware.StandardTier))
		{
			// Category Routes
			taxonomyRoutes.GET("/categories", middleware.RBACMiddleware(roleRepo, "asset:view"), taxonomyHandler.ListCategories)
			taxonomyRoutes.GET("/categories/tree", middleware.RBACMiddleware(roleRepo, "asset:view"), taxonomyHandler.GetCategoryTree)
			taxonomyRoutes.GET("/categories/:id", middleware.RBACMiddleware(roleRepo, "asset:view"), taxonomyHandler.GetCategory)
			taxonomyRoutes.POST("/categories", middleware.RBACMiddleware(roleRepo, "asset:create"), taxonomyHandler.CreateCategory)
			taxonomyRoutes.PUT("/categories/:id", middleware.RBACMiddleware(roleRepo, "asset:update"), taxonomyHandler.UpdateCategory)
			taxonomyRoutes.DELETE("/categories/:id", middleware.RBACMiddleware(roleRepo, "asset:delete"), taxonomyHandler.DeleteCategory)

			// Attribute Routes
			taxonomyRoutes.GET("/categories/:id/attributes/inherited", middleware.RBACMiddleware(roleRepo, "asset:view"), taxonomyHandler.GetInheritedAttributes)
			taxonomyRoutes.POST("/attributes", middleware.RBACMiddleware(roleRepo, "asset:create"), taxonomyHandler.CreateAttribute)
			taxonomyRoutes.PUT("/attributes/:id", middleware.RBACMiddleware(roleRepo, "asset:update"), taxonomyHandler.UpdateAttribute)
			taxonomyRoutes.DELETE("/attributes/:id", middleware.RBACMiddleware(roleRepo, "asset:delete"), taxonomyHandler.DeleteAttribute)
		}

		//  ENABLED: Asset routes now that all repositories exist
		utils.Info("Enabling asset routes - all repositories are now available")
		SetupAssetRoutes(apiV1.Group("/assets"), sqlxDB, jwtService, roleRepo)
	}

	//  SURGICAL ADD: Static file serving for media
	router.Static("/static/uploads", cfg.Storage.UploadPath)

	utils.Info("Router setup complete")

	return router
}
