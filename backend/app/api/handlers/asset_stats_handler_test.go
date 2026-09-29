package handlers_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/app/api/handlers"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

type assetStatsServiceMock struct {
	services.AssetServiceInterface
	stats    []repositories.AssetTypeStatusCount
	err      error
	tenantID int
}

func (m *assetStatsServiceMock) GetAssetStats(_ context.Context, tenantID int) ([]repositories.AssetTypeStatusCount, error) {
	m.tenantID = tenantID
	return m.stats, m.err
}

func TestGetAssetStatsReturnsExactTenantAggregate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetStatsServiceMock{stats: []repositories.AssetTypeStatusCount{
		{AssetType: "pump", LifecycleStatus: "Installed", Count: 12},
		{AssetType: "pump", LifecycleStatus: "Sent to repair", Count: 3},
		{AssetType: "vessel", LifecycleStatus: "Installed", Count: 7},
		{AssetType: "Uncategorized", LifecycleStatus: "Unknown", Count: 2},
	}}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/stats", nil)
	ctx.Set("tenant_id", 42)

	handler.GetAssetStats(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, 42, service.tenantID)
	require.JSONEq(t, `{"success":true,"message":"Asset statistics retrieved successfully","data":[{"asset_type":"pump","lifecycle_status":"Installed","count":12},{"asset_type":"pump","lifecycle_status":"Sent to repair","count":3},{"asset_type":"vessel","lifecycle_status":"Installed","count":7},{"asset_type":"Uncategorized","lifecycle_status":"Unknown","count":2}]}`, recorder.Body.String())
}

func TestGetAssetStatsReturnsJSONInternalError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetStatsServiceMock{err: errors.New("database unavailable")}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/stats", nil)
	ctx.Set("tenant_id", 42)

	handler.GetAssetStats(ctx)

	require.Equal(t, http.StatusInternalServerError, recorder.Code)
	require.JSONEq(t, `{"success":false,"message":"Failed to retrieve asset statistics","error":"Failed to retrieve asset statistics","code":"API_ERROR"}`, recorder.Body.String())
}
