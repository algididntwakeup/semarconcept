// platform/backend/app/api/handlers/asset_tenant_isolation_test.go

package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/app/api/handlers"
	"backend/app/api/routes"
	"backend/app/middleware"
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// --- MOCK TOKEN GENERATOR ---

type mockTokenGen struct {
	tokens map[string]*utils.JWTClaims
}

func (m *mockTokenGen) GenerateToken(userID int, username string, isSuperuser bool, tenantID *int, duration time.Duration) (string, error) {
	return "token", nil
}

func (m *mockTokenGen) GenerateTokenWithOptions(userID int, username string, isSuperuser bool, tenantID *int, duration time.Duration, options utils.TokenOptions) (string, error) {
	return "token", nil
}

func (m *mockTokenGen) GenerateRefreshToken(userID int, username string, duration time.Duration) (string, error) {
	return "refresh", nil
}

func (m *mockTokenGen) ValidateToken(tokenString string) (*utils.JWTClaims, error) {
	if claims, ok := m.tokens[tokenString]; ok {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func (m *mockTokenGen) RefreshToken(refreshTokenString string, userID int) (string, string, error) {
	return "", "", nil
}

func (m *mockTokenGen) BlacklistToken(jti string, userID int, reason string, expiration time.Duration) error {
	return nil
}

func (m *mockTokenGen) IsTokenBlacklisted(jti string) bool {
	return false
}

func (m *mockTokenGen) InvalidateSession(sessionID string) error {
	return nil
}

func (m *mockTokenGen) InvalidateAllUserTokens(userID int, reason string) error {
	return nil
}

func (m *mockTokenGen) CanRefreshToken(tokenString string) (bool, time.Duration, error) {
	return true, 0, nil
}

func (m *mockTokenGen) GetBlacklistStats() (int, error) {
	return 0, nil
}

func (m *mockTokenGen) CleanupBlacklist() error {
	return nil
}

// --- MOCK RBAC ROLE PROVIDER ---

type mockRoleProvider struct {
	userRoles       map[int][]models.Role
	rolePermissions map[int][]models.Permission
}

func (m *mockRoleProvider) FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error) {
	if roles, ok := m.userRoles[userID]; ok {
		return roles, nil
	}
	return []models.Role{}, nil
}

func (m *mockRoleProvider) GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error) {
	if perms, ok := m.rolePermissions[roleID]; ok {
		return perms, nil
	}
	return []models.Permission{}, nil
}

// --- MOCK ASSET SERVICE ---

type mockAssetRecord struct {
	ID        int
	TenantID  int
	UnitID    *int
	Name      string
	TagNumber string
	AssetType string
}

type mockAssetService struct {
	services.AssetServiceInterface
	assets map[int]mockAssetRecord
}

func newMockAssetService() *mockAssetService {
	return &mockAssetService{
		assets: make(map[int]mockAssetRecord),
	}
}

func (m *mockAssetService) CreateAsset(ctx context.Context, tenantID int, req *request.CreateAssetRequest, userID int) (*response.AssetResponse, error) {
	if req.UnitID != nil && *req.UnitID == 999 {
		// Unit 999 belongs to another tenant or is missing
		return nil, utils.ErrUnitNotFound
	}

	id := len(m.assets) + 1
	tag := ""
	if req.TagNumber != nil {
		tag = *req.TagNumber
	}
	assetType := ""
	if req.AssetType != nil {
		assetType = *req.AssetType
	}

	rec := mockAssetRecord{
		ID:        id,
		TenantID:  tenantID,
		UnitID:    req.UnitID,
		Name:      req.Name,
		TagNumber: tag,
		AssetType: assetType,
	}
	m.assets[id] = rec

	return &response.AssetResponse{
		ID:        id,
		TenantID:  tenantID,
		Name:      req.Name,
		TagNumber: tag,
		AssetType: assetType,
	}, nil
}

func (m *mockAssetService) GetAsset(ctx context.Context, tenantID int, assetID int) (*response.AssetResponse, error) {
	rec, ok := m.assets[assetID]
	if !ok || rec.TenantID != tenantID {
		return nil, utils.ErrAssetNotFound
	}
	return &response.AssetResponse{
		ID:        rec.ID,
		TenantID:  rec.TenantID,
		Name:      rec.Name,
		TagNumber: rec.TagNumber,
		AssetType: rec.AssetType,
	}, nil
}

func (m *mockAssetService) UpdateAsset(ctx context.Context, tenantID int, assetID int, req *request.UpdateAssetRequest, userID int) (*response.AssetResponse, error) {
	rec, ok := m.assets[assetID]
	if !ok || rec.TenantID != tenantID {
		return nil, utils.ErrAssetNotFound
	}

	if req.Name != nil {
		rec.Name = *req.Name
	}
	m.assets[assetID] = rec

	return &response.AssetResponse{
		ID:        rec.ID,
		TenantID:  rec.TenantID,
		Name:      rec.Name,
		TagNumber: rec.TagNumber,
		AssetType: rec.AssetType,
	}, nil
}

func (m *mockAssetService) DeleteAsset(ctx context.Context, tenantID int, assetID int, userID int) error {
	rec, ok := m.assets[assetID]
	if !ok || rec.TenantID != tenantID {
		return utils.ErrAssetNotFound
	}
	delete(m.assets, assetID)
	return nil
}

func (m *mockAssetService) ListAsset(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.AssetListResponse, error) {
	var items []response.AssetResponse
	for _, rec := range m.assets {
		if rec.TenantID == tenantID {
			items = append(items, response.AssetResponse{
				ID:        rec.ID,
				TenantID:  rec.TenantID,
				Name:      rec.Name,
				TagNumber: rec.TagNumber,
				AssetType: rec.AssetType,
			})
		}
	}
	return &response.AssetListResponse{
		Asset: items,
		Total: int64(len(items)),
	}, nil
}

// --- TEST SETUP HELPER ---

func setupIsolationTestRouter(tokenGen *mockTokenGen, roleProvider *mockRoleProvider, assetSvc *mockAssetService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	assetHandler := handlers.NewAssetHandler(assetSvc, nil)

	// Apply identical middleware stack as SetupAssetRoutes
	assetGroup := r.Group("/api/v1/assets")
	assetGroup.Use(middleware.AuthMiddleware(tokenGen))
	assetGroup.Use(middleware.RequireTenantContext())

	routes.RegisterAssetRoutesWithRBAC(assetGroup, assetHandler, roleProvider)

	return r
}

// Helper to create test JWT claims
func makeTestClaims(userID int, tenantID *int) *utils.JWTClaims {
	claims := &utils.JWTClaims{
		UserID:      userID,
		Username:    "testuser",
		TenantID:    tenantID,
		IsSuperuser: false,
	}
	return claims
}

// --- TEST SUITE: SAAS-01 TENANT ISOLATION & RBAC GATES ---

func TestAssetTenantIsolation_Unauthenticated(t *testing.T) {
	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{}}
	roleProv := &mockRoleProvider{}
	assetSvc := newMockAssetService()
	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/assets/Asset/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "Authorization header required")
}

func TestAssetTenantIsolation_MissingTenantContext(t *testing.T) {
	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-no-tenant": makeTestClaims(10, nil), // nil tenant
	}}
	roleProv := &mockRoleProvider{}
	assetSvc := newMockAssetService()
	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/assets/Asset/1", nil)
	req.Header.Set("Authorization", "Bearer token-no-tenant")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "TENANT_CONTEXT_REQUIRED")
}

func TestAssetTenantIsolation_ZeroTenantContext(t *testing.T) {
	zeroTenant := 0
	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-zero-tenant": makeTestClaims(11, &zeroTenant),
	}}
	roleProv := &mockRoleProvider{}
	assetSvc := newMockAssetService()
	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/assets/Asset/1", nil)
	req.Header.Set("Authorization", "Bearer token-zero-tenant")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Zero-trust gate: 0 must NOT fallback to 1, must be rejected with 401
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "TENANT_CONTEXT_REQUIRED")
}

func TestAssetTenantIsolation_CrossTenantRead_Returns404(t *testing.T) {
	tenant1 := 1
	tenant2 := 2

	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-t1": makeTestClaims(101, &tenant1),
		"token-t2": makeTestClaims(102, &tenant2),
	}}

	roleProv := &mockRoleProvider{
		userRoles: map[int][]models.Role{
			101: {{ID: 1, Name: "operator"}},
			102: {{ID: 2, Name: "operator"}},
		},
		rolePermissions: map[int][]models.Permission{
			1: {{Name: "Read Assets", Resource: "asset", Action: "view"}},
			2: {{Name: "Read Assets", Resource: "asset", Action: "view"}},
		},
	}

	assetSvc := newMockAssetService()
	// Seed asset 200 belonging to Tenant 2
	unit5 := 5
	assetSvc.assets[200] = mockAssetRecord{
		ID:        200,
		TenantID:  tenant2,
		UnitID:    &unit5,
		Name:      "Tenant 2 Heat Exchanger",
		TagNumber: "HEX-002",
		AssetType: "exchanger",
	}

	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	// 1. Tenant 1 user attempts to read Tenant 2 asset -> MUST RETURN 404 NOT FOUND
	reqT1, _ := http.NewRequest(http.MethodGet, "/api/v1/assets/Asset/200", nil)
	reqT1.Header.Set("Authorization", "Bearer token-t1")
	wT1 := httptest.NewRecorder()
	router.ServeHTTP(wT1, reqT1)

	assert.Equal(t, http.StatusNotFound, wT1.Code)
	assert.Contains(t, wT1.Body.String(), "Asset not found")

	// 2. Tenant 2 user reads their own asset -> 200 OK
	reqT2, _ := http.NewRequest(http.MethodGet, "/api/v1/assets/Asset/200", nil)
	reqT2.Header.Set("Authorization", "Bearer token-t2")
	wT2 := httptest.NewRecorder()
	router.ServeHTTP(wT2, reqT2)

	assert.Equal(t, http.StatusOK, wT2.Code)
	assert.Contains(t, wT2.Body.String(), "HEX-002")
}

func TestAssetTenantIsolation_CrossTenantMutation_Returns404(t *testing.T) {
	tenant1 := 1
	tenant2 := 2

	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-t1-mut": makeTestClaims(103, &tenant1),
	}}

	roleProv := &mockRoleProvider{
		userRoles: map[int][]models.Role{
			103: {{ID: 3, Name: "editor"}},
		},
		rolePermissions: map[int][]models.Permission{
			3: {
				{Name: "Update Assets", Resource: "asset", Action: "update"},
				{Name: "Delete Assets", Resource: "asset", Action: "delete"},
			},
		},
	}

	assetSvc := newMockAssetService()
	// Seed asset 200 belonging to Tenant 2
	unit5 := 5
	assetSvc.assets[200] = mockAssetRecord{
		ID:        200,
		TenantID:  tenant2,
		UnitID:    &unit5,
		Name:      "Tenant 2 Heat Exchanger",
		TagNumber: "HEX-002",
		AssetType: "exchanger",
	}

	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	// 1. Tenant 1 user attempts to UPDATE Tenant 2 asset -> MUST RETURN 404
	updateBody, _ := json.Marshal(request.UpdateAssetRequest{
		Name: utils.StringPtr("Malicious Update"),
	})
	reqPut, _ := http.NewRequest(http.MethodPut, "/api/v1/assets/Asset/200", bytes.NewReader(updateBody))
	reqPut.Header.Set("Authorization", "Bearer token-t1-mut")
	reqPut.Header.Set("Content-Type", "application/json")
	wPut := httptest.NewRecorder()
	router.ServeHTTP(wPut, reqPut)

	assert.Equal(t, http.StatusNotFound, wPut.Code)
	assert.Equal(t, "Tenant 2 Heat Exchanger", assetSvc.assets[200].Name) // State intact

	// 2. Tenant 1 user attempts to DELETE Tenant 2 asset -> MUST RETURN 404
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/assets/Asset/200", nil)
	reqDel.Header.Set("Authorization", "Bearer token-t1-mut")
	wDel := httptest.NewRecorder()
	router.ServeHTTP(wDel, reqDel)

	assert.Equal(t, http.StatusNotFound, wDel.Code)
	assert.Contains(t, assetSvc.assets, 200) // Not deleted
}

func TestAssetTenantIsolation_CrossTenantRelationshipCreation_Rejected(t *testing.T) {
	tenant1 := 1

	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-t1-rel": makeTestClaims(104, &tenant1),
	}}

	roleProv := &mockRoleProvider{
		userRoles: map[int][]models.Role{
			104: {{ID: 4, Name: "creator"}},
		},
		rolePermissions: map[int][]models.Permission{
			4: {{Name: "Create Assets", Resource: "asset", Action: "create"}},
		},
	}

	assetSvc := newMockAssetService()
	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	// Unit 999 belongs to another tenant; service returns validation error
	foreignUnitID := 999
	pumpType := "pump"
	createPayload := request.CreateAssetRequest{
		UnitID:    &foreignUnitID,
		Name:      "Cross-tenant child asset",
		TagNumber: utils.StringPtr("CROSS-01"),
		AssetType: &pumpType,
	}
	body, _ := json.Marshal(createPayload)

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/assets/Asset", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer token-t1-rel")
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Contains(t, w.Body.String(), "Related resource not found")
}

func TestAssetTenantIsolation_GranularRBAC_ViewOnlyCannotCreate(t *testing.T) {
	tenant1 := 1

	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-t1": makeTestClaims(101, &tenant1),
	}}

	// User has ONLY "asset:view", NOT "asset:create"
	roleProv := &mockRoleProvider{
		userRoles: map[int][]models.Role{
			101: {{ID: 1, Name: "viewer"}},
		},
		rolePermissions: map[int][]models.Permission{
			1: {{Name: "Read Assets", Resource: "asset", Action: "view"}},
		},
	}

	assetSvc := newMockAssetService()
	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	unit1 := 1
	pumpType := "pump"
	createPayload := request.CreateAssetRequest{
		UnitID:    &unit1,
		Name:      "Unauthorized Asset",
		TagNumber: utils.StringPtr("NO-RBAC-01"),
		AssetType: &pumpType,
	}
	body, _ := json.Marshal(createPayload)

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/assets/Asset", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer token-t1")
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.Contains(t, w.Body.String(), "Access denied: you do not have the required permission")
}

func TestAssetTenantIsolation_CreateAsset_CorrectlyScopedToTenant(t *testing.T) {
	tenant2 := 2

	tokenGen := &mockTokenGen{tokens: map[string]*utils.JWTClaims{
		"token-t2": makeTestClaims(202, &tenant2),
	}}

	roleProv := &mockRoleProvider{
		userRoles: map[int][]models.Role{
			202: {{ID: 2, Name: "manager"}},
		},
		rolePermissions: map[int][]models.Permission{
			2: {
				{Name: "Create Assets", Resource: "asset", Action: "create"},
				{Name: "Read Assets", Resource: "asset", Action: "view"},
			},
		},
	}

	assetSvc := newMockAssetService()
	router := setupIsolationTestRouter(tokenGen, roleProv, assetSvc)

	unit10 := 10
	pumpType := "pump"
	createPayload := request.CreateAssetRequest{
		UnitID:    &unit10,
		Name:      "Tenant 2 Pump",
		TagNumber: utils.StringPtr("PMP-T2-001"),
		AssetType: &pumpType,
	}
	body, _ := json.Marshal(createPayload)

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/assets/Asset", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer token-t2")
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusCreated, w.Code)

	var resp struct {
		Success bool                   `json:"success"`
		Data    response.AssetResponse `json:"data"`
	}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	// Verify the asset is strictly scoped to tenant 2 (NOT fallback tenant 1!)
	assert.Equal(t, tenant2, resp.Data.TenantID)
	assert.Equal(t, "PMP-T2-001", resp.Data.TagNumber)
}
