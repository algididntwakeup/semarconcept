package repositories

import (
	"backend/app/models"
	"backend/app/utils"
	"context"
	"errors"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/require"
	gormPostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestAssetRepository_GetAssetStatsAggregatesTenantRows(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	mock.ExpectQuery(`SELECT BTRIM\(asset_class\) AS class, COUNT\(\*\) AS count FROM "assets" WHERE tenant_id = \$1 AND COALESCE\(status, ''\) <> 'deleted' AND NULLIF\(BTRIM\(asset_class\), ''\) IS NOT NULL GROUP BY BTRIM\(asset_class\) ORDER BY BTRIM\(asset_class\)`).
		WithArgs(42).
		WillReturnRows(sqlmock.NewRows([]string{"class", "count"}).AddRow("Piping", int64(12)).AddRow("Storage Tanks", int64(7)))
	mock.ExpectQuery(`SELECT COUNT\(\*\) FILTER \(WHERE has_funcloc\) AS with_funcloc, COUNT\(\*\) FILTER \(WHERE NOT has_funcloc\) AS without_funcloc FROM "assets" WHERE tenant_id = \$1 AND COALESCE\(status, ''\) <> 'deleted'`).
		WithArgs(42).
		WillReturnRows(sqlmock.NewRows([]string{"with_funcloc", "without_funcloc"}).AddRow(int64(1500), int64(200)))
	gdb, err := gorm.Open(gormPostgres.New(gormPostgres.Config{Conn: db}), &gorm.Config{})
	require.NoError(t, err)
	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"), gdb)
	stats, err := repo.GetAssetStats(context.Background(), 42)
	require.NoError(t, err)
	require.Equal(t, []AssetClassCount{
		{Class: "Piping", Count: 12},
		{Class: "Storage Tanks", Count: 7},
	}, stats.Classes)
	require.Equal(t, AssetFunclocStats{With: 1500, Without: 200}, stats.Funcloc)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestAssetRepository_UpsertAssetsFromImportPrioritizesTagAndCommitsAtomically(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	ctx := context.Background()
	tag := "EQ-101"
	description := "Updated description"
	assetType := "Vessel"
	asset := models.Asset{
		ID: 999, TenantID: 42, TagNumber: &tag, Name: "Reactor",
		Description: &description, AssetType: &assetType,
		RBIProperties: models.JSONBMap{"Component Design.Design Pressure": "12.5"},
	}

	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(`SELECT pg_advisory_xact_lock($1, $2)`)).
		WithArgs(42, 74321).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT "tag_number" FROM "assets" WHERE tenant_id = $1 AND tag_number IN ($2)`)).
		WithArgs(42, "EQ-101").WillReturnRows(sqlmock.NewRows([]string{"tag_number"}).AddRow("EQ-101"))
	mock.ExpectQuery("INSERT INTO \"assets\"").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(77))
	mock.ExpectCommit()

	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"))
	created, updated, err := repo.UpsertAssetsFromImport(ctx, 42, []AssetImportRecord{{Asset: asset}}, 7)
	require.NoError(t, err)
	require.Equal(t, 0, created)
	require.Equal(t, 1, updated)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestAssetRepository_UpsertAssetsFromImportRollsBackOnError(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	ctx := context.Background()
	tag := "EQ-ERR"
	asset := models.Asset{
		TenantID: 42, TagNumber: &tag, Name: "Corrupt Asset",
	}

	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(`SELECT pg_advisory_xact_lock($1, $2)`)).
		WithArgs(42, 74321).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT "tag_number" FROM "assets" WHERE tenant_id = $1 AND tag_number IN ($2)`)).
		WithArgs(42, "EQ-ERR").WillReturnRows(sqlmock.NewRows([]string{"tag_number"}))
	mock.ExpectQuery("INSERT INTO \"assets\"").
		WillReturnError(errors.New("corrupt data in row"))
	mock.ExpectRollback()

	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"))
	created, updated, err := repo.UpsertAssetsFromImport(ctx, 42, []AssetImportRecord{{Asset: asset}}, 7)
	require.Error(t, err)
	require.True(t, errors.Is(err, utils.ErrValidation))
	require.Equal(t, 0, created)
	require.Equal(t, 0, updated)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestAssetRepository_ImportResolvesParentTagsBeforeCommit(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	ctx := context.Background()
	parentTag, childTag := "ROOT", "CHILD"
	assetType := "Pump"
	assets := []AssetImportRecord{
		{Asset: models.Asset{TenantID: 42, TagNumber: &childTag, Name: "Child", AssetType: &assetType}, ParentTag: parentTag},
		{Asset: models.Asset{TenantID: 42, TagNumber: &parentTag, Name: "Root", AssetType: &assetType}},
	}
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(`SELECT pg_advisory_xact_lock($1, $2)`)).WithArgs(42, 74321).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT "tag_number" FROM "assets" WHERE tenant_id = $1 AND tag_number IN ($2,$3)`)).
		WithArgs(42, "CHILD", "ROOT").WillReturnRows(sqlmock.NewRows([]string{"tag_number"}))
	mock.ExpectQuery("INSERT INTO \"assets\"").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(200))
	mock.ExpectQuery("INSERT INTO \"assets\"").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(100))
	mock.ExpectQuery("SELECT id, tag_number FROM \"assets\"").
		WithArgs(42, "ROOT", "CHILD").WillReturnRows(sqlmock.NewRows([]string{"id", "tag_number"}).AddRow(100, "ROOT").AddRow(200, "CHILD"))
	mock.ExpectExec(`UPDATE "assets" SET .*"parent_id"=.*WHERE tenant_id = .* AND tag_number = .*`).
		WithArgs(100, 42, "CHILD").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"))
	created, updated, err := repo.UpsertAssetsFromImport(ctx, 42, assets, 7)
	require.NoError(t, err)
	require.Equal(t, 2, created)
	require.Zero(t, updated)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestAssetRepository_ImportRollsBackWhenParentUpdateFails(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	ctx := context.Background()
	parentTag, childTag := "ROOT-ERR", "CHILD-ERR"
	assetType := "Pump"
	assets := []AssetImportRecord{
		{Asset: models.Asset{TenantID: 42, TagNumber: &parentTag, Name: "Root", AssetType: &assetType}},
		{Asset: models.Asset{TenantID: 42, TagNumber: &childTag, Name: "Child", AssetType: &assetType}, ParentTag: parentTag},
	}
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(`SELECT pg_advisory_xact_lock($1, $2)`)).WithArgs(42, 74321).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT "tag_number" FROM "assets" WHERE tenant_id = $1 AND tag_number IN ($2,$3)`)).
		WithArgs(42, "ROOT-ERR", "CHILD-ERR").WillReturnRows(sqlmock.NewRows([]string{"tag_number"}))
	mock.ExpectQuery("INSERT INTO \"assets\"").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(300))
	mock.ExpectQuery("INSERT INTO \"assets\"").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(400))
	mock.ExpectQuery("SELECT id, tag_number FROM \"assets\"").
		WithArgs(42, "ROOT-ERR", "CHILD-ERR").WillReturnRows(sqlmock.NewRows([]string{"id", "tag_number"}).AddRow(300, "ROOT-ERR").AddRow(400, "CHILD-ERR"))
	mock.ExpectExec(`UPDATE "assets" SET .*"parent_id"=.*WHERE tenant_id = .* AND tag_number = .*`).
		WithArgs(300, 42, "CHILD-ERR").WillReturnError(errors.New("parent update failed"))
	mock.ExpectRollback()

	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"))
	created, updated, err := repo.UpsertAssetsFromImport(ctx, 42, assets, 7)
	require.Error(t, err)
	require.True(t, errors.Is(err, utils.ErrValidation))
	require.Zero(t, created)
	require.Zero(t, updated)
	require.NoError(t, mock.ExpectationsWereMet())
}
