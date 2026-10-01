package repositories

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/utils"
	"context"
	"errors"
	"fmt"
	"os"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/require"
	gormPostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func TestAssetRepository_UpsertAssetsLiveDB(t *testing.T) {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		t.Skip("Skipping live database test because DB_HOST is not set")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	sqlxDB, err := sqlx.Connect("postgres", dsn)
	require.NoError(t, err)
	defer sqlxDB.Close()

	gormDB, err := gorm.Open(gormPostgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	require.NoError(t, err)

	repo := NewAssetRepository(sqlxDB, gormDB)
	ctx := context.Background()

	tenantID := 1
	userID := 1
	testTag := "TEST-UPSERT-DUP-CHECK-01"

	// Cleanup any previous run
	_ = gormDB.Exec("DELETE FROM assets WHERE tag_number = ?", testTag).Error

	desc1 := "Initial Description"
	class1 := "Piping"
	type1 := "Pipe"
	asset1 := models.Asset{
		TenantID:    tenantID,
		TagNumber:   &testTag,
		Name:        "Test Asset V1",
		Description: &desc1,
		AssetClass:  &class1,
		AssetType:   &type1,
		RBIProperties: models.JSONBMap{
			"General.TestField": "Value1",
		},
	}

	// 1. First upload: insert new asset
	created, updated, err := repo.UpsertAssetsFromImport(ctx, tenantID, []AssetImportRecord{{Asset: asset1}}, userID)
	require.NoError(t, err)
	require.Equal(t, 1, created, "First upload should insert 1 new asset")
	require.Equal(t, 0, updated, "First upload should update 0 assets")

	// Verify asset in DB
	var dbAsset models.Asset
	err = gormDB.Where("tag_number = ?", testTag).First(&dbAsset).Error
	require.NoError(t, err)
	require.Equal(t, "Test Asset V1", dbAsset.Name)
	require.Equal(t, "Initial Description", *dbAsset.Description)
	require.Equal(t, "Piping", *dbAsset.AssetClass)
	require.Equal(t, "Pipe", *dbAsset.AssetType)
	require.Equal(t, "Value1", dbAsset.RBIProperties["General.TestField"])
	originalID := dbAsset.ID

	// 2. Second upload (re-upload of same file with modified data):
	// Must NOT create duplicate row. Must update existing row.
	desc2 := "Updated Overwritten Description"
	class2 := "Vessel"
	type2 := "Pressure Vessel"
	asset2 := models.Asset{
		TenantID:    tenantID,
		TagNumber:   &testTag,
		Name:        "Test Asset V2",
		Description: &desc2,
		AssetClass:  &class2,
		AssetType:   &type2,
		RBIProperties: models.JSONBMap{
			"General.TestField": "Value2",
			"General.NewField":  "BrandNew",
		},
	}

	created2, updated2, err2 := repo.UpsertAssetsFromImport(ctx, tenantID, []AssetImportRecord{{Asset: asset2}}, userID)
	require.NoError(t, err2)
	require.Equal(t, 0, created2, "Second upload should not insert new assets")
	require.Equal(t, 1, updated2, "Second upload should update the existing asset")

	// Verify asset in DB has been updated and no duplicates exist
	var count int64
	err = gormDB.Model(&models.Asset{}).Where("tag_number = ?", testTag).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(1), count, "There should still be exactly 1 row with this tag_number")

	var updatedAsset models.Asset
	err = gormDB.Where("tag_number = ?", testTag).First(&updatedAsset).Error
	require.NoError(t, err)
	require.Equal(t, originalID, updatedAsset.ID, "Asset ID should be preserved")
	require.Equal(t, "Test Asset V2", updatedAsset.Name)
	require.Equal(t, "Updated Overwritten Description", *updatedAsset.Description)
	require.Equal(t, "Vessel", *updatedAsset.AssetClass)
	require.Equal(t, "Pressure Vessel", *updatedAsset.AssetType)
	require.Equal(t, "Value2", updatedAsset.RBIProperties["General.TestField"])
	require.Equal(t, "BrandNew", updatedAsset.RBIProperties["General.NewField"])

	// 3. Rollback test: If one row fails in a batch, entire batch must rollback
	failTag1 := "TEST-ROLLBACK-OK"
	failTag2 := "" // Missing tag will trigger error
	failAsset1 := models.Asset{TenantID: tenantID, TagNumber: &failTag1, Name: "OK Asset"}
	failAsset2 := models.Asset{TenantID: tenantID, TagNumber: &failTag2, Name: "Invalid Asset"}

	created3, updated3, err3 := repo.UpsertAssetsFromImport(ctx, tenantID, []AssetImportRecord{{Asset: failAsset1}, {Asset: failAsset2}}, userID)
	require.Error(t, err3)
	require.True(t, errors.Is(err3, utils.ErrValidation))
	require.Equal(t, 0, created3)
	require.Equal(t, 0, updated3)

	// Verify failTag1 was rolled back and not persisted
	var failCount int64
	_ = gormDB.Model(&models.Asset{}).Where("tag_number = ?", failTag1).Count(&failCount).Error
	require.Equal(t, int64(0), failCount, "failTag1 must have been rolled back")

	// Clean up
	_ = gormDB.Exec("DELETE FROM assets WHERE tag_number = ?", testTag).Error
}

// TestAssetRepository_ListLiveDBNullParentFLOC guards the listing query against
// assets that have no functional location: the projected parent_floc column is
// NULL, and scanning it into models.Asset.ParentFLOC (a plain string) used to
// fail every list request with "converting NULL to string is unsupported".
func TestAssetRepository_ListLiveDBNullParentFLOC(t *testing.T) {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		t.Skip("Skipping live database test because DB_HOST is not set")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	sqlxDB, err := sqlx.Connect("postgres", dsn)
	require.NoError(t, err)
	defer sqlxDB.Close()

	gormDB, err := gorm.Open(gormPostgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	require.NoError(t, err)

	repo := NewAssetRepository(sqlxDB, gormDB)
	ctx := context.Background()

	tenantID := 1
	testTag := "TEST-LIST-NULL-FLOC-01"
	_ = gormDB.Exec("DELETE FROM assets WHERE tag_number = ?", testTag).Error
	insert := gormDB.Exec(
		`INSERT INTO assets (tenant_id, tag_number, name, status, functional_location_id) VALUES (?, ?, ?, 'active', NULL)`,
		tenantID, testTag, "Asset without parent FLOC")
	require.NoError(t, insert.Error)
	defer func() { _ = gormDB.Exec("DELETE FROM assets WHERE tag_number = ?", testTag).Error }()

	assets, total, err := repo.List(ctx, tenantID, &request.AssetListQuery{Page: 1, Limit: 5, SortBy: "created_at", SortOrder: "desc"})
	require.NoError(t, err)
	require.Positive(t, total)

	found := false
	for _, asset := range assets {
		require.Empty(t, asset.ParentFLOC, "assets without a functional location must scan as an empty parent FLOC")
		if asset.TagNumber != nil && *asset.TagNumber == testTag {
			found = true
		}
	}
	require.True(t, found, "listed assets must include the asset with a NULL functional_location_id")
}
