package services_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"backend/app/services"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupMockGormDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	assert.NoError(t, err)

	return gormDB, mock
}

func TestMaintenanceService_DiagnoseDuplicates(t *testing.T) {
	gormDB, mock := setupMockGormDB(t)
	svc := services.NewMaintenanceService(gormDB)

	ctx := context.Background()
	tenantID := 1
	now := time.Now().UTC()

	// Expected aggregate query
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT BTRIM(tag_number) AS tag_number, COUNT(*) AS count FROM "assets" WHERE tenant_id = $1 AND NULLIF(BTRIM(tag_number), '') IS NOT NULL AND COALESCE(status, '') <> 'deleted' GROUP BY BTRIM(tag_number) HAVING COUNT(*) > 1 ORDER BY count DESC, BTRIM(tag_number) ASC`)).
		WithArgs(tenantID).
		WillReturnRows(sqlmock.NewRows([]string{"tag_number", "count"}).
			AddRow("12-H-1101", 2))

	// Expected full asset fetch for the duplicate group
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "assets" WHERE tenant_id = $1 AND LOWER(BTRIM(tag_number)) = LOWER(BTRIM($2)) AND COALESCE(status, '') <> 'deleted' ORDER BY id ASC`)).
		WithArgs(tenantID, "12-H-1101").
		WillReturnRows(sqlmock.NewRows([]string{"id", "tenant_id", "tag_number", "name", "status", "created_at", "updated_at"}).
			AddRow(101, 1, "12-H-1101", "Heat Exchanger Primary", "active", now, now).
			AddRow(102, 1, "12-H-1101", "Heat Exchanger Duplicate", "draft", now, now))

	res, err := svc.DiagnoseDuplicates(ctx, tenantID)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Len(t, res, 1)
	assert.Equal(t, "12-H-1101", res[0].TagNumber)
	assert.Equal(t, 2, res[0].DuplicateCount)
	assert.Len(t, res[0].Duplicates, 2)
	assert.Equal(t, 101, res[0].Duplicates[0].ID)
	assert.Equal(t, 102, res[0].Duplicates[1].ID)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestMaintenanceService_ResolveDuplicate(t *testing.T) {
	t.Run("success_smart_merge", func(t *testing.T) {
		gormDB, mock := setupMockGormDB(t)
		svc := services.NewMaintenanceService(gormDB)

		ctx := context.Background()
		tenantID := 1
		userID := 42
		now := time.Now().UTC()

		req := &services.ResolveDuplicateRequest{
			KeptAssetID:     101,
			DeletedAssetIDs: []int{102, 103},
		}

		// 1. Fetch kept asset
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "assets" WHERE id = $1 AND tenant_id = $2 AND COALESCE(status, '') <> 'deleted' ORDER BY "assets"."id" LIMIT $3`)).
			WithArgs(req.KeptAssetID, tenantID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "tenant_id", "tag_number", "name", "status", "rbi_properties", "created_at", "updated_at"}).
				AddRow(101, 1, "12-H-1101", "Heat Exchanger", "active", []byte(`{"corrosion_rate":0.15,"insulation":""}`), now, now))

		// 2. Fetch deleted duplicate assets
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "assets" WHERE id IN ($1,$2) AND tenant_id = $3 AND COALESCE(status, '') <> 'deleted'`)).
			WithArgs(102, 103, tenantID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "tenant_id", "tag_number", "name", "status", "rbi_properties", "created_at", "updated_at"}).
				AddRow(102, 1, "12-H-1101", "Duplicate 1", "draft", []byte(`{"corrosion_rate":0.99,"insulation":"Fiberglass","pressure":150}`), now, now).
				AddRow(103, 1, "12-H-1101", "Duplicate 2", "draft", []byte(`{"temperature":200}`), now, now))

		// 3. Begin transaction
		mock.ExpectBegin()

		// 4. Update kept asset with merged rbi_properties
		mock.ExpectExec(`UPDATE "assets" SET .*rbi_properties.*updated_at.* WHERE id = \$4 AND tenant_id = \$5`).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), userID, req.KeptAssetID, tenantID).
			WillReturnResult(sqlmock.NewResult(0, 1))

		// 5. Re-parent children of deleted assets to kept_asset_id
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "assets" SET "parent_id"=$1 WHERE parent_id IN ($2,$3) AND tenant_id = $4`)).
			WithArgs(req.KeptAssetID, 102, 103, tenantID).
			WillReturnResult(sqlmock.NewResult(0, 1))

		// 6. Soft-delete duplicate assets
		mock.ExpectExec(`UPDATE "assets" SET .*status.*updated_at.*updated_by.* WHERE id IN \(\$4,\$5\) AND tenant_id = \$6 AND COALESCE\(status, ''\) <> 'deleted'`).
			WithArgs("deleted", sqlmock.AnyArg(), userID, 102, 103, tenantID).
			WillReturnResult(sqlmock.NewResult(0, 2))

		// 7. Commit transaction
		mock.ExpectCommit()

		result, err := svc.ResolveDuplicate(ctx, tenantID, userID, req)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 101, result.KeptAssetID)
		assert.Equal(t, int64(2), result.DeletedCount)
		assert.Equal(t, []int{102, 103}, result.DeletedAssetIDs)

		// Assert Smart Merge Priority: existing 0.15 is NOT overwritten by 0.99
		assert.Equal(t, 0.15, result.MergedProperties["corrosion_rate"])
		// Assert Smart Merge Filling: empty string "" in kept asset is filled with "Fiberglass"
		assert.Equal(t, "Fiberglass", result.MergedProperties["insulation"])
		// Assert Smart Merge Filling: missing fields added
		assert.Equal(t, float64(150), result.MergedProperties["pressure"])
		assert.Equal(t, float64(200), result.MergedProperties["temperature"])

		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("validation_error_kept_in_deleted", func(t *testing.T) {
		gormDB, _ := setupMockGormDB(t)
		svc := services.NewMaintenanceService(gormDB)

		req := &services.ResolveDuplicateRequest{
			KeptAssetID:     101,
			DeletedAssetIDs: []int{101, 102},
		}

		res, err := svc.ResolveDuplicate(context.Background(), 1, 1, req)
		assert.Error(t, err)
		assert.Nil(t, res)
		assert.Contains(t, err.Error(), "kept_asset_id cannot be included in deleted_asset_ids")
	})

	t.Run("validation_error_empty_deleted", func(t *testing.T) {
		gormDB, _ := setupMockGormDB(t)
		svc := services.NewMaintenanceService(gormDB)

		req := &services.ResolveDuplicateRequest{
			KeptAssetID:     101,
			DeletedAssetIDs: []int{},
		}

		res, err := svc.ResolveDuplicate(context.Background(), 1, 1, req)
		assert.Error(t, err)
		assert.Nil(t, res)
		assert.Contains(t, err.Error(), "deleted_asset_ids must not be empty")
	})
}

func TestMaintenanceService_FixComponentLinks(t *testing.T) {
	gormDB, mock := setupMockGormDB(t)
	svc := services.NewMaintenanceService(gormDB)

	ctx := context.Background()
	tenantID := 1
	userID := 42

	mock.ExpectExec("UPDATE assets AS comp").
		WithArgs(userID, tenantID, tenantID).
		WillReturnResult(sqlmock.NewResult(0, 5))

	res, err := svc.FixComponentLinks(ctx, tenantID, userID)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, int64(5), res.Count)
	assert.Equal(t, int64(5), res.AffectedLinks)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestMaintenanceService_SyncComponentsToFLOC(t *testing.T) {
	gormDB, mock := setupMockGormDB(t)
	svc := services.NewMaintenanceService(gormDB)

	ctx := context.Background()
	tenantID := 1
	userID := 42

	mock.ExpectExec("UPDATE assets AS comp").
		WithArgs(userID, tenantID).
		WillReturnResult(sqlmock.NewResult(0, 8))

	res, err := svc.SyncComponentsToFLOC(ctx, tenantID, userID)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, int64(8), res.Count)
	assert.Equal(t, int64(8), res.SyncedCount)

	assert.NoError(t, mock.ExpectationsWereMet())
}
