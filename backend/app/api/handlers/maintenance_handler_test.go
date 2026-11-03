package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/app/api/handlers"
	"backend/app/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockMaintenanceService struct {
	diagnoseRes  []services.DuplicateTagGroup
	diagnoseErr  error
	fixLinksRes  *services.FixLinksResult
	fixLinksErr  error
	syncFLOCRes  *services.SyncFLOCResult
	syncFLOCErr  error
	resolveRes   *services.ResolveDuplicateResult
	resolveErr   error
	lastTenantID int
	lastUserID   int
	lastReq      *services.ResolveDuplicateRequest
}

func (m *mockMaintenanceService) DiagnoseDuplicates(ctx context.Context, tenantID int) ([]services.DuplicateTagGroup, error) {
	m.lastTenantID = tenantID
	return m.diagnoseRes, m.diagnoseErr
}

func (m *mockMaintenanceService) FixComponentLinks(ctx context.Context, tenantID int, userID int) (*services.FixLinksResult, error) {
	m.lastTenantID = tenantID
	m.lastUserID = userID
	return m.fixLinksRes, m.fixLinksErr
}

func (m *mockMaintenanceService) SyncComponentsToFLOC(ctx context.Context, tenantID int, userID int) (*services.SyncFLOCResult, error) {
	m.lastTenantID = tenantID
	m.lastUserID = userID
	return m.syncFLOCRes, m.syncFLOCErr
}

func (m *mockMaintenanceService) ResolveDuplicate(ctx context.Context, tenantID int, userID int, req *services.ResolveDuplicateRequest) (*services.ResolveDuplicateResult, error) {
	m.lastTenantID = tenantID
	m.lastUserID = userID
	m.lastReq = req
	return m.resolveRes, m.resolveErr
}

func setupMaintenanceTestRouter(mockSvc *mockMaintenanceService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	handler := handlers.NewMaintenanceHandler(mockSvc)

	// Set tenant_id and user_id in middleware
	r.Use(func(c *gin.Context) {
		c.Set("tenant_id", 1)
		c.Set("user_id", 42)
		c.Next()
	})

	r.POST("/api/v1/maintenance/diagnose-duplicates", handler.DiagnoseDuplicates)
	r.GET("/api/v1/maintenance/diagnose-duplicates", handler.DiagnoseDuplicates)
	r.POST("/api/v1/maintenance/fix-links", handler.FixLinks)
	r.POST("/api/v1/maintenance/sync-floc", handler.SyncFLOC)
	r.POST("/api/v1/maintenance/resolve-duplicate", handler.ResolveDuplicate)

	return r
}

func TestMaintenanceHandler_DiagnoseDuplicates(t *testing.T) {
	mockSvc := &mockMaintenanceService{
		diagnoseRes: []services.DuplicateTagGroup{
			{
				TagNumber:      "12-H-1101",
				DuplicateCount: 2,
				Duplicates: []services.DuplicateAssetDetail{
					{ID: 1, TagNumber: "12-H-1101", Name: "Heat Exchanger A"},
					{ID: 2, TagNumber: "12-H-1101", Name: "Heat Exchanger B"},
				},
			},
		},
	}

	r := setupMaintenanceTestRouter(mockSvc)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/maintenance/diagnose-duplicates", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, 1, mockSvc.lastTenantID)

	var resp struct {
		Success bool                         `json:"success"`
		Data    []services.DuplicateTagGroup `json:"data"`
	}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	assert.True(t, resp.Success)
	assert.Len(t, resp.Data, 1)
	assert.Equal(t, "12-H-1101", resp.Data[0].TagNumber)
}

func TestMaintenanceHandler_ResolveDuplicate(t *testing.T) {
	mockSvc := &mockMaintenanceService{
		resolveRes: &services.ResolveDuplicateResult{
			KeptAssetID:     1,
			DeletedCount:    2,
			DeletedAssetIDs: []int{2, 3},
		},
	}

	r := setupMaintenanceTestRouter(mockSvc)

	payload := services.ResolveDuplicateRequest{
		KeptAssetID:     1,
		DeletedAssetIDs: []int{2, 3},
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/maintenance/resolve-duplicate", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, 1, mockSvc.lastTenantID)
	assert.Equal(t, 42, mockSvc.lastUserID)
	require.NotNil(t, mockSvc.lastReq)
	assert.Equal(t, 1, mockSvc.lastReq.KeptAssetID)
	assert.Equal(t, []int{2, 3}, mockSvc.lastReq.DeletedAssetIDs)
}

func TestMaintenanceHandler_ResolveDuplicate_InvalidPayload(t *testing.T) {
	mockSvc := &mockMaintenanceService{}
	r := setupMaintenanceTestRouter(mockSvc)

	payload := services.ResolveDuplicateRequest{
		KeptAssetID:     0, // invalid
		DeletedAssetIDs: []int{2},
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/maintenance/resolve-duplicate", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	require.Equal(t, http.StatusBadRequest, w.Code)
}

