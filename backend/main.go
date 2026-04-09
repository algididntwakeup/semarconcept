// platform/backend/main.go

// @BasePath /api/v1
package main

import (
	"context"
	"flag"
	"fmt"
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

	"gorm.io/gorm"
	gormPostgres "gorm.io/driver/postgres"
	"gorm.io/gorm/logger"

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

	// Setup database connection
	db, err := repositories.Connect(cfg.Database) // Use repositories.Connect
	if err != nil {
		utils.Fatalf("Failed to connect to database: %v", err)
	}
	defer repositories.CloseDB() // Use repositories.CloseDB

	// 🔥 AUTO-MIGRATE: Ensure tables exist on startup
	utils.Info("Running automatic database migration...")
	
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=Asia/Shanghai search_path=public",
		cfg.Database.Host, cfg.Database.User, cfg.Database.Password, cfg.Database.Name, cfg.Database.Port, cfg.Database.SSLMode)
		
	gormDB, err := gorm.Open(gormPostgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		utils.Fatalf("Failed to connect to database using GORM for migration: %v", err)
	}
	
	// 🔥 AUTO-MIGRATE: Ensure tables exist on startup
	err = database.MigrateAll(gormDB)
	if err != nil {
		utils.Fatalf("Database migration failed: %v", err)
	}

	// Run seeder if the -seed flag is true
	if *seedDb {
		utils.Info("Seed flag is set to true. Running database seeder...")
		
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=Asia/Shanghai search_path=public",
			cfg.Database.Host, cfg.Database.User, cfg.Database.Password, cfg.Database.Name, cfg.Database.Port, cfg.Database.SSLMode)
			
		gormDB, err := gorm.Open(gormPostgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			utils.Fatalf("Failed to connect to database using GORM for seeding: %v", err)
		}
		
		seeder := database.NewSeeder(gormDB)
		if err := seeder.SeedAll(); err != nil {
			utils.Fatalf("Database seeding failed: %v", err)
		}
		
		utils.Info("Finished seeding.")
		os.Exit(0)
	}

	// Initialize Gin router using the new SetupRouter function
	router := routes.SetupRouter(&cfg, db, cacheService) // Pass config, db connection, and cache service

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
