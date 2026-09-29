package repositories

import (
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
