// platform/backend/app/database/connection_test.go

package database

import (
	"context"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	gormPostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestDatabase_LifecycleAndTransaction(t *testing.T) {
	sqlDB, mock, err := sqlmock.New()
	assert.NoError(t, err)

	sqlxDB := sqlx.NewDb(sqlDB, "sqlmock")

	gormDB, err := gorm.Open(gormPostgres.New(gormPostgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	}), &gorm.Config{})
	assert.NoError(t, err)

	dbHolder := &Database{
		SQL:  sqlDB,
		SQLX: sqlxDB,
		GORM: gormDB,
	}

	// 1. Verify Stats returns values from underlying pool
	stats := dbHolder.Stats()
	assert.GreaterOrEqual(t, stats.OpenConnections, 0)

	// 2. Test WithTransaction - Successful Commit
	mock.ExpectBegin()
	mock.ExpectCommit()

	err = dbHolder.WithTransaction(context.Background(), func(tx *gorm.DB) error {
		assert.NotNil(t, tx)
		return nil
	})
	assert.NoError(t, err)

	// 3. Test WithTransaction - Rollback on error
	mock.ExpectBegin()
	mock.ExpectRollback()

	expectedErr := errors.New("simulated business failure")
	err = dbHolder.WithTransaction(context.Background(), func(tx *gorm.DB) error {
		return expectedErr
	})
	assert.ErrorIs(t, err, expectedErr)

	// 4. Test Close
	mock.ExpectClose()
	err = dbHolder.Close()
	assert.NoError(t, err)

	assert.NoError(t, mock.ExpectationsWereMet())
}
