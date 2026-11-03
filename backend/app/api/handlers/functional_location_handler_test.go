// platform/backend/app/api/handlers/functional_location_handler_test.go
package handlers_test

import (
	"backend/app/api/handlers"
	"backend/app/models"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type mockFlocService struct {
	mock.Mock
}

func (m *mockFlocService) GetTree(ctx context.Context, tenantID int) ([]*models.FunctionalLocationNode, error) {
	args := m.Called(ctx, tenantID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*models.FunctionalLocationNode), args.Error(1)
}

func (m *mockFlocService) GetAll(ctx context.Context, tenantID int) ([]models.FunctionalLocation, error) {
	args := m.Called(ctx, tenantID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.FunctionalLocation), args.Error(1)
}

func (m *mockFlocService) GetByID(ctx context.Context, tenantID, id int) (*models.FunctionalLocation, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.FunctionalLocation), args.Error(1)
}

func (m *mockFlocService) GetEquipments(ctx context.Context, tenantID, id int) ([]models.EquipmentSummary, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.EquipmentSummary), args.Error(1)
}

func setupFlocRouter(svc *mockFlocService, tenantID int) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		if tenantID > 0 {
			c.Set("tenant_id", tenantID)
		}
		c.Next()
	})

	h := handlers.NewFunctionalLocationHandler(svc)
	group := r.Group("/api/v1/functional-locations")
	{
		group.GET("/tree", h.GetTree)
		group.GET("", h.GetAll)
		group.GET("/:id", h.GetByID)
		group.GET("/:id/equipments", h.GetEquipments)
	}
	return r
}

func TestFunctionalLocationHandler_GetTree(t *testing.T) {
	t.Run("returns 200 with nested json tree and equipment count", func(t *testing.T) {
		svc := new(mockFlocService)
		router := setupFlocRouter(svc, 1)

		crit := 2
		mockTree := []*models.FunctionalLocationNode{
			{
				ID:                      1,
				TenantID:                1,
				Code:                    "CORP-01",
				Description:             "Headquarters",
				Level:                   1,
				InstalledEquipmentCount: 0,
				Children: []*models.FunctionalLocationNode{
					{
						ID:                      2,
						TenantID:                1,
						Code:                    "PLANT-01",
						Description:             "Akasia Plant",
						Level:                   4,
						InstalledEquipmentCount: 1,
						Equipments: []models.EquipmentSummary{
							{
								ID:          55,
								TagNumber:   "V-101",
								Name:        "Inlet Vessel",
								AssetClass:  "Pressure Vessel",
								AssetType:   "Vertical",
								Status:      "Installed",
								Criticality: &crit,
							},
						},
						Children: []*models.FunctionalLocationNode{},
					},
				},
			},
		}

		svc.On("GetTree", mock.Anything, 1).Return(mockTree, nil)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/functional-locations/tree", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp struct {
			Success bool                            `json:"success"`
			Message string                          `json:"message"`
			Data    []*models.FunctionalLocationNode `json:"data"`
		}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.True(t, resp.Success)
		assert.Len(t, resp.Data, 1)
		assert.Equal(t, "CORP-01", resp.Data[0].Code)
		assert.Len(t, resp.Data[0].Children, 1)
		assert.Equal(t, 1, resp.Data[0].Children[0].InstalledEquipmentCount)
		assert.Equal(t, "V-101", resp.Data[0].Children[0].Equipments[0].TagNumber)
		svc.AssertExpectations(t)
	})

	t.Run("returns 401 when tenant id missing", func(t *testing.T) {
		svc := new(mockFlocService)
		router := setupFlocRouter(svc, 0) // No tenant

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/functional-locations/tree", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("returns 500 when service fails", func(t *testing.T) {
		svc := new(mockFlocService)
		router := setupFlocRouter(svc, 1)

		svc.On("GetTree", mock.Anything, 1).Return(nil, errors.New("database connection failed"))

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/functional-locations/tree", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		svc.AssertExpectations(t)
	})
}

