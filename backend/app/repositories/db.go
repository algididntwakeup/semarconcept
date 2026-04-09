// platform/backend/app/repositories/db.go
package repositories

import (
	"fmt"
	"time" // Ensure time package is imported

	"backend/app/config" // Adjusted import path
	"backend/app/utils"  // For logging

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // PostgreSQL driver
	// Add other drivers if needed e.g.:
	// _ "github.com/go-sql-driver/mysql"
)

// DB is a global variable to hold the database connection pool.
// Consider if a global variable is the best approach or if it should be managed and passed around.
// For now, keeping it similar to the original structure.
var DB *sqlx.DB

// Connect initializes the database connection using the provided configuration.
// This function will be called by main.go
func Connect(cfg config.DatabaseConfig) (*sqlx.DB, error) {
	var dataSourceName string

	switch cfg.Driver {
	case "postgres":
		dataSourceName = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s search_path=public",
			cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode)
	// Add cases for other database drivers if you plan to support them
	// case "mysql":
	// dataSourceName = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true",
	// cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name)
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", cfg.Driver)
	}

	utils.Infof("Connecting to database: %s with driver %s", cfg.Name, cfg.Driver)

	var err error
	DB, err = sqlx.Connect(cfg.Driver, dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool settings
	DB.SetMaxOpenConns(cfg.MaxOpenConns)
	DB.SetMaxIdleConns(cfg.MaxIdleConns)
	DB.SetConnMaxLifetime(cfg.ConnMaxLifetime * time.Second) // Multiply by time.Second

	err = DB.Ping()
	// Set search path to public schema explicitly
	_, err = DB.Exec("SET search_path TO public")
	if err != nil {
		utils.Warnf("Failed to set search_path to public: %v", err)
	} else {
		utils.Info("Database search_path set to 'public' schema")
	}
	if err != nil {
		DB.Close() // Attempt to close before returning error
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	_, err = DB.Exec("SET search_path TO public")
	if err != nil {
		utils.Warnf("Failed to set search_path to public: %v", err)
	} else {
		utils.Info("Database search_path set to 'public' schema")
	}

	utils.Info("Successfully connected to the database.")
	return DB, nil
}

// GetDB returns the current database connection pool.
// It's a helper function to access the DB instance from other packages within repositories.
// Other services should ideally receive the DB instance through dependency injection.
func GetDB() *sqlx.DB {
	if DB == nil {
		utils.Fatal("Database connection is not initialized. Call repositories.Connect first.")
	}
	return DB
}

// CloseDB closes the database connection.
// It should be called when the application is shutting down.
func CloseDB() {
	if DB != nil {
		err := DB.Close()
		if err != nil {
			utils.Errorf("Error closing database connection: %v", err)
		} else {
			utils.Info("Database connection closed.")
		}
	}
}
