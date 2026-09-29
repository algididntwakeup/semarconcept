package repositories

import (
	"backend/app/models"
	"context"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/require"
)

func TestAssetRepository_GetAssetStatsAggregatesTenantRows(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	query := regexp.QuoteMeta(`
		SELECT
			COALESCE(NULLIF(asset_type, ''), NULLIF(asset_class, ''), 'Uncategorized') AS asset_type,
			COALESCE(NULLIF(lifecycle_status, ''), NULLIF(status, ''), 'Unknown') AS lifecycle_status,
			COUNT(*) AS count
		FROM assets
		WHERE tenant_id = $1 AND COALESCE(status, '') <> 'deleted'
		GROUP BY 1, 2
		ORDER BY 1, 2`)
	rows := sqlmock.NewRows([]string{"asset_type", "lifecycle_status", "count"}).
		AddRow("pump", "Installed", int64(12)).
		AddRow("pump", "Sent to repair", int64(3)).
		AddRow("vessel", "Installed", int64(7)).
		AddRow("Uncategorized", "Unknown", int64(2))
	mock.ExpectQuery(query).WithArgs(42).WillReturnRows(rows)

	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"))
	stats, err := repo.GetAssetStats(context.Background(), 42)
	require.NoError(t, err)
	require.Equal(t, []AssetTypeStatusCount{
		{AssetType: "pump", LifecycleStatus: "Installed", Count: 12},
		{AssetType: "pump", LifecycleStatus: "Sent to repair", Count: 3},
		{AssetType: "vessel", LifecycleStatus: "Installed", Count: 7},
		{AssetType: "Uncategorized", LifecycleStatus: "Unknown", Count: 2},
	}, stats)

	countsByStatus := make(map[string]int64)
	var total int64
	for _, stat := range stats {
		countsByStatus[stat.LifecycleStatus] += stat.Count
		total += stat.Count
	}
	require.Equal(t, int64(19), countsByStatus["Installed"])
	require.Equal(t, int64(3), countsByStatus["Sent to repair"])
	require.Equal(t, int64(2), countsByStatus["Unknown"])
	require.Equal(t, int64(24), total)
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
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id FROM assets WHERE tenant_id = $1 AND tag_number = $2 AND COALESCE(status, '') <> 'deleted' ORDER BY id LIMIT 1 FOR UPDATE`)).
		WithArgs(42, "EQ-101").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(77))
	mock.ExpectExec(regexp.QuoteMeta(`
		UPDATE assets SET
			name = $1,
			tag_number = COALESCE($2, tag_number),
			description = COALESCE($3, description),
			asset_type = COALESCE($4, asset_type),
			asset_class = COALESCE($5, asset_class),
			parent_id = COALESCE($6, parent_id),
			functional_location_id = COALESCE($7, functional_location_id),
			lifecycle_status = COALESCE($8, lifecycle_status),
			status = COALESCE($9, status),
			rbi_properties = COALESCE(rbi_properties, '{}'::jsonb) || $10::jsonb,
			updated_by = $11,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $12 AND tenant_id = $13`)).
		WithArgs("Reactor", &tag, &description, &assetType, nil, nil, nil, nil, nil, sqlmock.AnyArg(), 7, 77, 42).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	repo := NewAssetRepository(sqlx.NewDb(db, "sqlmock"))
	created, updated, err := repo.UpsertAssetsFromImport(ctx, 42, []models.Asset{asset}, 7)
	require.NoError(t, err)
	require.Equal(t, 0, created)
	require.Equal(t, 1, updated)
	require.NoError(t, mock.ExpectationsWereMet())
}
