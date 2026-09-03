// platform/backend/app/repositories/db.go
package repositories

import (
	"backend/app/config"
	"backend/app/database"
	"backend/app/utils"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // PostgreSQL driver
)

// DB is a global variable to hold the database connection pool (for backward compatibility).
var DB *sqlx.DB
var dbHolder *database.Database

// Connect initializes the database connection using the unified database.InitDatabase.
func Connect(cfg config.DatabaseConfig) (*sqlx.DB, error) {
	holder, err := database.InitDatabase(cfg)
	if err != nil {
		return nil, err
	}
	dbHolder = holder
	DB = holder.SQLX
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
	if dbHolder != nil {
		if err := dbHolder.Close(); err != nil {
			utils.Errorf("Error closing database connection: %v", err)
		}
		dbHolder = nil
		DB = nil
	} else if DB != nil {
		if err := DB.Close(); err != nil {
			utils.Errorf("Error closing database connection: %v", err)
		}
		DB = nil
	}
}
