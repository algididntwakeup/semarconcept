// platform/backend/app/database/connection.go

package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"backend/app/config"
	"backend/app/utils"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	gormPostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Database encapsulates the single underlying *sql.DB pool
// along with its SQLX and GORM adapters.
type Database struct {
	SQL  *sql.DB
	SQLX *sqlx.DB
	GORM *gorm.DB
}

// TransactionManager provides an abstraction for executing atomic operations
// across repositories sharing the database connection.
type TransactionManager interface {
	WithTransaction(ctx context.Context, fn func(tx *gorm.DB) error) error
}

// InitDatabase initializes a single *sql.DB connection pool and wraps it
// with both SQLX and GORM adapters to prevent connection pool fragmentation.
func InitDatabase(cfg config.DatabaseConfig) (*Database, error) {
	var dataSourceName string
	switch cfg.Driver {
	case "postgres":
		dataSourceName = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Shanghai search_path=public",
			cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode)
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", cfg.Driver)
	}

	utils.Infof("DATABASE: Initializing single *sql.DB connection pool for %s", cfg.Name)

	var gormDB *gorm.DB
	var err error
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		gormDB, err = gorm.Open(gormPostgres.Open(dataSourceName), &gorm.Config{
			Logger:                                   logger.Default.LogMode(logger.Warn),
			DisableForeignKeyConstraintWhenMigrating: true,
		})
		if err == nil {
			break
		}
		utils.Warnf("DATABASE: Connection attempt %d/%d failed: %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			time.Sleep(2 * time.Second)
		}
	}
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database after %d retries: %w", maxRetries, err)
	}

	// Extract the single underlying *sql.DB connection pool
	sqlDB, err := gormDB.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to extract *sql.DB from GORM: %w", err)
	}

	// Apply explicit connection pool limits to the shared pool
	maxOpen := cfg.MaxOpenConns
	if maxOpen <= 0 {
		maxOpen = 25
	}
	sqlDB.SetMaxOpenConns(maxOpen)

	maxIdle := cfg.MaxIdleConns
	if maxIdle <= 0 {
		maxIdle = 10
	}
	sqlDB.SetMaxIdleConns(maxIdle)

	connLifetime := cfg.ConnMaxLifetime * time.Second
	if connLifetime <= 0 {
		connLifetime = 15 * time.Minute
	}
	sqlDB.SetConnMaxLifetime(connLifetime)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	// Verify connectivity
	if err := sqlDB.Ping(); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Ensure search_path is set to public
	if _, err := sqlDB.Exec("SET search_path TO public"); err != nil {
		utils.Warnf("DATABASE: Failed to set search_path to public: %v", err)
	}

	// Wrap the EXACT SAME underlying sqlDB pool with SQLX
	sqlxDB := sqlx.NewDb(sqlDB, "postgres")

	utils.Info("DATABASE: Single *sql.DB lifecycle established. GORM and SQLX adapters share the exact same pool.")

	return &Database{
		SQL:  sqlDB,
		SQLX: sqlxDB,
		GORM: gormDB,
	}, nil
}

// Close gracefully closes the underlying connection pool.
func (d *Database) Close() error {
	if d.SQL != nil {
		utils.Info("DATABASE: Closing shared *sql.DB connection pool.")
		return d.SQL.Close()
	}
	return nil
}

// WithTransaction executes the given function within a GORM database transaction.
func (d *Database) WithTransaction(ctx context.Context, fn func(tx *gorm.DB) error) error {
	return d.GORM.WithContext(ctx).Transaction(fn)
}

// Stats returns connection pool statistics.
func (d *Database) Stats() sql.DBStats {
	if d.SQL != nil {
		return d.SQL.Stats()
	}
	return sql.DBStats{}
}
