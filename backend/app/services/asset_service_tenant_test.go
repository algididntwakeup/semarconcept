// platform/backend/app/services/asset_service_tenant_test.go

package services_test

import (
	"context"
	"testing"

	"backend/app/models"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockSiteRepository for boundary testing
type MockSiteRepository struct {
	repositories.SiteRepository
	mock.Mock
}

func (m *MockSiteRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Site, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Site), args.Error(1)
}

func (m *MockSiteRepository) ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error) {
	args := m.Called(ctx, tenantID, code)
	return args.Bool(0), args.Error(1)
}

// MockUnitRepository for boundary testing
type MockUnitRepository struct {
	repositories.UnitRepository
	mock.Mock
}

func (m *MockUnitRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Unit, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Unit), args.Error(1)
}

func (m *MockUnitRepository) ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error) {
	args := m.Called(ctx, tenantID, code)
	return args.Bool(0), args.Error(1)
}

// MockAssetRepository for boundary testing
type MockAssetRepository struct {
	repositories.AssetRepository
	mock.Mock
}

func (m *MockAssetRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Asset, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Asset), args.Error(1)
}

func (m *MockAssetRepository) FindByTag(ctx context.Context, tenantID, unitID int, tag string) (*models.Asset, error) {
	args := m.Called(ctx, tenantID, unitID, tag)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Asset), args.Error(1)
}

// MockComponentRepository for boundary testing
type MockComponentRepository struct {
	repositories.ComponentRepository
	mock.Mock
}

func (m *MockComponentRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Component, error) {
	args := m.Called(ctx, tenantID, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Component), args.Error(1)
}

func TestAssetService_CreateUnit_ForeignSiteRejected(t *testing.T) {
	mockSiteRepo := new(MockSiteRepository)
	mockUnitRepo := new(MockUnitRepository)
	mockAssetRepo := new(MockAssetRepository)
	mockCompRepo := new(MockComponentRepository)

	svc := services.NewAssetService(mockSiteRepo, mockUnitRepo, mockAssetRepo, mockCompRepo)

	ctx := context.Background()
	tenantID := 1
	userID := 10

	// Site 999 does not exist under Tenant 1 (e.g. belongs to Tenant 2)
	mockSiteRepo.On("FindByID", ctx, tenantID, 999).Return(nil, utils.ErrSiteNotFound)

	req := &request.CreateUnitRequest{
		SiteID:   999,
		Name:     "Distillation Unit",
		Code:     utils.StringPtr("DIST-01"),
		UnitType: "distillation",
	}

	res, err := svc.CreateUnit(ctx, tenantID, req, userID)
	assert.Nil(t, res)
	assert.ErrorIs(t, err, utils.ErrSiteNotFound)
	mockSiteRepo.AssertExpectations(t)
}

func TestAssetService_CreateAsset_ForeignUnitRejected(t *testing.T) {
	mockSiteRepo := new(MockSiteRepository)
	mockUnitRepo := new(MockUnitRepository)
	mockAssetRepo := new(MockAssetRepository)
	mockCompRepo := new(MockComponentRepository)

	svc := services.NewAssetService(mockSiteRepo, mockUnitRepo, mockAssetRepo, mockCompRepo)

	ctx := context.Background()
	tenantID := 1
	userID := 10

	foreignUnitID := 888
	// Unit 888 does not exist under Tenant 1
	mockUnitRepo.On("FindByID", ctx, tenantID, foreignUnitID).Return(nil, utils.ErrUnitNotFound)

	pumpType := "pump"
	req := &request.CreateAssetRequest{
		UnitID:    &foreignUnitID,
		Name:      "Feed Pump",
		TagNumber: utils.StringPtr("PMP-01"),
		AssetType: &pumpType,
	}

	res, err := svc.CreateAsset(ctx, tenantID, req, userID)
	assert.Nil(t, res)
	assert.ErrorIs(t, err, utils.ErrUnitNotFound)
	mockUnitRepo.AssertExpectations(t)
}

func TestAssetService_CreateAsset_ForeignParentAssetRejected(t *testing.T) {
	mockSiteRepo := new(MockSiteRepository)
	mockUnitRepo := new(MockUnitRepository)
	mockAssetRepo := new(MockAssetRepository)
	mockCompRepo := new(MockComponentRepository)

	svc := services.NewAssetService(mockSiteRepo, mockUnitRepo, mockAssetRepo, mockCompRepo)

	ctx := context.Background()
	tenantID := 1
	userID := 10

	unit1 := 1
	foreignParentID := 777

	mockUnitRepo.On("FindByID", ctx, tenantID, unit1).Return(&models.Unit{ID: unit1, TenantID: tenantID}, nil)
	// Parent asset 777 does not exist under Tenant 1
	mockAssetRepo.On("FindByID", ctx, tenantID, foreignParentID).Return(nil, utils.ErrAssetNotFound)

	pumpType := "pump"
	req := &request.CreateAssetRequest{
		UnitID:    &unit1,
		ParentID:  &foreignParentID,
		Name:      "Sub-assembly",
		TagNumber: utils.StringPtr("SUB-01"),
		AssetType: &pumpType,
	}

	res, err := svc.CreateAsset(ctx, tenantID, req, userID)
	assert.Nil(t, res)
	assert.ErrorIs(t, err, utils.ErrAssetNotFound)
	mockAssetRepo.AssertExpectations(t)
}

func TestAssetService_UpdateAsset_SelfParentingRejected(t *testing.T) {
	mockSiteRepo := new(MockSiteRepository)
	mockUnitRepo := new(MockUnitRepository)
	mockAssetRepo := new(MockAssetRepository)
	mockCompRepo := new(MockComponentRepository)

	svc := services.NewAssetService(mockSiteRepo, mockUnitRepo, mockAssetRepo, mockCompRepo)

	ctx := context.Background()
	tenantID := 1
	userID := 10
	assetID := 50

	selfParentID := 50
	mockAssetRepo.On("FindByID", ctx, tenantID, assetID).Return(&models.Asset{ID: assetID, TenantID: tenantID}, nil)

	req := &request.UpdateAssetRequest{
		ParentID: &selfParentID, // Self-parenting attempt
	}

	res, err := svc.UpdateAsset(ctx, tenantID, assetID, req, userID)
	assert.Nil(t, res)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "cannot be its own parent")
}

func TestAssetService_CreateComponent_ForeignAssetRejected(t *testing.T) {
	mockSiteRepo := new(MockSiteRepository)
	mockUnitRepo := new(MockUnitRepository)
	mockAssetRepo := new(MockAssetRepository)
	mockCompRepo := new(MockComponentRepository)

	svc := services.NewAssetService(mockSiteRepo, mockUnitRepo, mockAssetRepo, mockCompRepo)

	ctx := context.Background()
	tenantID := 1
	userID := 10
	foreignAssetID := 666

	// Asset 666 does not exist under Tenant 1
	mockAssetRepo.On("FindByID", ctx, tenantID, foreignAssetID).Return(nil, utils.ErrAssetNotFound)

	req := &request.CreateComponentRequest{
		AssetID:       foreignAssetID,
		Name:          "Impeller",
		ComponentType: utils.StringPtr("impeller"),
	}

	res, err := svc.CreateComponent(ctx, tenantID, req, userID)
	assert.Nil(t, res)
	assert.ErrorIs(t, err, utils.ErrAssetNotFound)
	mockAssetRepo.AssertExpectations(t)
}
