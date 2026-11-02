// platform/backend/app/services/functional_location_service_test.go
package services_test

import (
	"backend/app/models"
	"backend/app/services"
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type mockFlocRepo struct {
	mock.Mock
}

func (m *mockFlocRepo) GetTree(ctx context.Context, tenantID int) ([]*models.FunctionalLocationNode, error) {
	args := m.Called(ctx, tenantID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*models.FunctionalLocationNode), args.Error(1)
}

func (m *mockFlocRepo) GetAll(ctx context.Context, tenantID int) ([]models.FunctionalLocation, error) {
	args := m.Called(ctx, tenantID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.FunctionalLocation), args.Error(1)
}

func (m *mockFlocRepo) GetByID(ctx context.Context, tenantID, id int) (*models.FunctionalLocation, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.FunctionalLocation), args.Error(1)
}

func (m *mockFlocRepo) GetEquipments(ctx context.Context, tenantID, flocID int) ([]models.EquipmentSummary, error) {
	args := m.Called(ctx, tenantID, flocID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.EquipmentSummary), args.Error(1)
}

func (m *mockFlocRepo) SeedDefaultFlocsIfEmpty(ctx context.Context, tenantID int) error {
	args := m.Called(ctx, tenantID)
	return args.Error(0)
}

func TestFunctionalLocationService_GetTree(t *testing.T) {
	ctx := context.Background()

	t.Run("success returning nested tree with equipment count", func(t *testing.T) {
		repo := new(mockFlocRepo)
		svc := services.NewFunctionalLocationService(repo)

		crit := 3
		mockTree := []*models.FunctionalLocationNode{
			{
				ID:                      1,
				TenantID:                1,
				Code:                    "CORP-REK",
				Description:             "PT Reksolindo Energy Corp",
				Level:                   1,
				InstalledEquipmentCount: 0,
				Children: []*models.FunctionalLocationNode{
					{
						ID:                      2,
						TenantID:                1,
						Code:                    "JI-JL-AG-11-PW",
						Description:             "Produced Water System",
						Level:                   5,
						InstalledEquipmentCount: 1,
						Equipments: []models.EquipmentSummary{
							{
								ID:          101,
								TagNumber:   "P-101A",
								Name:        "Produced Water Pump A",
								AssetClass:  "Pump",
								AssetType:   "Centrifugal",
								Status:      "Installed",
								Criticality: &crit,
							},
						},
						Children: []*models.FunctionalLocationNode{},
					},
				},
			},
		}

		repo.On("GetTree", ctx, 1).Return(mockTree, nil)

		tree, err := svc.GetTree(ctx, 1)
		assert.NoError(t, err)
		assert.NotNil(t, tree)
		assert.Len(t, tree, 1)
		assert.Equal(t, "CORP-REK", tree[0].Code)
		assert.Len(t, tree[0].Children, 1)
		assert.Equal(t, 1, tree[0].Children[0].InstalledEquipmentCount)
		assert.Equal(t, "P-101A", tree[0].Children[0].Equipments[0].TagNumber)
		repo.AssertExpectations(t)
	})

	t.Run("tenant ID required", func(t *testing.T) {
		repo := new(mockFlocRepo)
		svc := services.NewFunctionalLocationService(repo)

		tree, err := svc.GetTree(ctx, 0)
		assert.Error(t, err)
		assert.Nil(t, tree)
		assert.Contains(t, err.Error(), "tenant ID is required")
	})

	t.Run("repo error returns error", func(t *testing.T) {
		repo := new(mockFlocRepo)
		svc := services.NewFunctionalLocationService(repo)

		repo.On("GetTree", ctx, 1).Return(nil, errors.New("db error"))

		tree, err := svc.GetTree(ctx, 1)
		assert.Error(t, err)
		assert.Nil(t, tree)
		assert.Equal(t, "db error", err.Error())
		repo.AssertExpectations(t)
	})
}

func TestFunctionalLocationService_GetByID(t *testing.T) {
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		repo := new(mockFlocRepo)
		svc := services.NewFunctionalLocationService(repo)

		floc := &models.FunctionalLocation{
			ID:          5,
			TenantID:    1,
			Code:        "JI-JL-AG-11-PW",
			Description: "Produced Water System",
			Level:       5,
		}
		repo.On("GetByID", ctx, 1, 5).Return(floc, nil)

		res, err := svc.GetByID(ctx, 1, 5)
		assert.NoError(t, err)
		assert.Equal(t, "JI-JL-AG-11-PW", res.Code)
		repo.AssertExpectations(t)
	})

	t.Run("invalid id", func(t *testing.T) {
		repo := new(mockFlocRepo)
		svc := services.NewFunctionalLocationService(repo)

		res, err := svc.GetByID(ctx, 1, 0)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

