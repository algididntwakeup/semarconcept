// platform/backend/main.go

// @BasePath /api/v1
package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/app/api/routes"
	"backend/app/cache"
	"backend/app/config"
	"backend/app/database"
	"backend/app/repositories"
	"backend/app/utils"
	"backend/docs"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"

	_ "backend/docs" // Only ONE import of docs
)

// @title Reksolindo Enterprise Asset Management API
// @version 1.0
// @description Multi-tenant enterprise asset management system
// @BasePath /api/v1
// @host breksolindo.opuschamber.com
// @schemes https http
func main() {

	// docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.Host = "breksolindo.opuschamber.com"

	// Environment variables loaded via startup script
	// No godotenv dependency needed - using system environment variables
	log.Println("Using system environment variables (loaded via startup script)")

	// Define command-line flags
	seedDb := flag.Bool("seed", false, "Set to true to seed the database")
	flag.Parse()

	// Load application configuration
	cfg, err := config.LoadConfig(".") // Load config.yaml from the current directory
	if err != nil {
		// Logger not initialized yet, use standard log
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Log CORS configuration for debugging
	log.Printf("Configuration loaded for environment: %s", cfg.Environment)
	log.Printf("CORS Origins: %v", cfg.CORS.AllowedOrigins)
	log.Printf("CORS Headers: %v", cfg.CORS.AllowedHeaders)
	log.Printf("CORS Methods: %v", cfg.CORS.AllowedMethods)

	// Initialize Logger (set log level based on config)
	if cfg.LogLevel == "debug" {
		utils.SetLogLevel(utils.DEBUG)
	} else if cfg.LogLevel == "warn" {
		utils.SetLogLevel(utils.WARN)
	} else if cfg.LogLevel == "error" {
		utils.SetLogLevel(utils.ERROR)
	} else {
		utils.SetLogLevel(utils.INFO) // default
	}
	utils.Info("Logger initialized.")

	// Initialize validator with built-in validators only
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// The validator is properly initialized with built-in validators
		utils.Info("Validator engine initialized successfully with built-in validators.")
		_ = v // Use the validator variable to avoid unused variable warning
	} else {
		utils.Warn("Failed to get validator engine, using default validation.")
	}

	// Initialize Cache Service
	cacheService := cache.NewService()
	utils.Info("Cache service initialized.")

	utils.Info("Starting backend server...")

	// Setup database connection with a single shared pool lifecycle
	dbHolder, err := database.InitDatabase(cfg.Database)
	if err != nil {
		utils.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbHolder.Close()

	// Maintain repositories.DB for backward compatibility
	repositories.DB = dbHolder.SQLX

	// Auto-migrate tables using shared GORM adapter (shares identical *sql.DB pool)
	utils.Info("Running automatic database migration...")
	err = database.MigrateAll(dbHolder.GORM)
	if err != nil {
		utils.Fatalf("Database migration failed: %v", err)
	}

	// Auto-seed if database is fresh or seed flag is provided
	var userCount int64
	_ = dbHolder.GORM.Table("users").Count(&userCount)
	if *seedDb || userCount == 0 {
		utils.Info("Auto-seeding initial database data...")
		seeder := database.NewSeeder(dbHolder.GORM)
		if err := seeder.SeedAll(); err != nil {
			utils.Warnf("Database seeding encountered warning: %v", err)
		} else {
			utils.Info("Database seeding finished successfully.")
		}
		if *seedDb {
			os.Exit(0)
		}
	} else {
		// System navigation is application configuration, not sample data. Keep
		// it synchronized on every normal startup so existing installations get
		// canonical routes, new modules, and icon updates without reseeding users.
		seeder := database.NewSeeder(dbHolder.GORM)
		if err := seeder.SeedMenuItems(); err != nil {
			utils.Warnf("System menu synchronization encountered warning: %v", err)
		}
	}

	// Initialize Gin router using shared SQLX and GORM adapters
	router := routes.SetupRouter(&cfg, dbHolder.SQLX, dbHolder.GORM, cacheService)

	utils.Infof("Server listening on %s:%s in %s mode", cfg.HTTPServer.Host, cfg.HTTPServer.Port, cfg.Environment)

	// Configure HTTP server
	srv := &http.Server{
		Addr:         cfg.HTTPServer.Host + ":" + cfg.HTTPServer.Port,
		Handler:      router,
		ReadTimeout:  cfg.HTTPServer.ReadTimeout * time.Second,
		WriteTimeout: cfg.HTTPServer.WriteTimeout * time.Second,
		IdleTimeout:  cfg.HTTPServer.IdleTimeout * time.Second,
	}

	// Start server in a goroutine so that it doesn't block.
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			utils.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with a timeout.
	quit := make(chan os.Signal, 1)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need to add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	utils.Info("Shutting down server...")

	// The context is used to inform the server it has 5 seconds to finish
	// the requests it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		utils.Fatalf("Server forced to shutdown: %v", err)
	}

	utils.Info("Server exiting")
}
