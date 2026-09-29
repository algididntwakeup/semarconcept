// platform/backend/app/services/asset_service_tenant_test.go

package services_test

import (
	"bytes"
	"context"
	"testing"

	"backend/app/models"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/xuri/excelize/v2"
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

func (m *MockAssetRepository) ListAssetsForExport(ctx context.Context, tenantID int, assetType, status string) ([]models.Asset, error) {
	args := m.Called(ctx, tenantID, assetType, status)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Asset), args.Error(1)
}

func (m *MockAssetRepository) UpsertAssetsFromImport(ctx context.Context, tenantID int, assets []models.Asset, userID int) (int, int, error) {
	args := m.Called(ctx, tenantID, assets, userID)
	return args.Int(0), args.Int(1), args.Error(2)
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

func TestAssetService_ExportAssetsToExcel_WritesTwoTierEquipmentWorkbook(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	siteRepo := new(MockSiteRepository)
	unitRepo := new(MockUnitRepository)
	componentRepo := new(MockComponentRepository)
	pressure := 12.5
	tag := "PV-101"
	name := "Reactor"
	assetRepo.On("ListAssetsForExport", ctx, 42, "", "").Return([]models.Asset{{
		ID:                  101,
		TenantID:            42,
		TagNumber:           &tag,
		Name:                name,
		DesignConditions:    models.JSONBMap{"design_pressure": pressure},
		OperatingParameters: models.JSONBMap{"operating_temperature": 185.0},
	}}, nil).Once()

	service := services.NewAssetService(siteRepo, unitRepo, assetRepo, componentRepo)
	data, filename, err := service.ExportAssetsToExcel(ctx, 42, &request.AssetExportRequest{})
	assert.NoError(t, err)
	assert.Equal(t, "equipment-master.xlsx", filename)
	assert.NotEmpty(t, data)

	workbook, err := excelize.OpenReader(bytes.NewReader(data))
	assert.NoError(t, err)
	defer workbook.Close()
	assert.Equal(t, []string{"Data Source"}, workbook.GetSheetList())
	category, err := workbook.GetCellValue("Data Source", "A1")
	assert.NoError(t, err)
	assert.Equal(t, "General", category)
	header, err := workbook.GetCellValue("Data Source", "A2")
	assert.NoError(t, err)
	assert.Equal(t, "Equipment ID", header)
	assert.Equal(t, "101", mustExportCell(t, workbook, "A3"))
	assert.Equal(t, "PV-101", mustExportCell(t, workbook, "B3"))
	assert.Equal(t, "Reactor", mustExportCell(t, workbook, "C3"))
	assert.Equal(t, "12.5", mustExportCell(t, workbook, "Y3"))
	assert.Equal(t, "185", mustExportCell(t, workbook, "AJ3"))
	assetRepo.AssertExpectations(t)
}

func mustExportCell(t *testing.T, workbook *excelize.File, cell string) string {
	t.Helper()
	value, err := workbook.GetCellValue("Data Source", cell)
	assert.NoError(t, err)
	return value
}

func TestAssetService_ImportAssetsFromXLSX_MapsTwoTierHeadersAndUpserts(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Data Source"))
	fields := []string{"Equipment ID", "Equipment Tag", "Equipment Name", "Description", "Equipment Class", "Equipment Type", "Design Pressure", "Flow Rate"}
	categories := []string{"General", "General", "General", "General", "General", "General", "Component Design", "Component Design"}
	values := []interface{}{101, "PV-101", "Reactor", "Hydrocracker reactor", "Pressure Vessel", "Vessel", 12.5, 450.0}
	for index := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Data Source", cell, categories[index]))
		cell, _ = excelize.CoordinatesToCellName(index+1, 2)
		assert.NoError(t, book.SetCellValue("Data Source", cell, fields[index]))
		cell, _ = excelize.CoordinatesToCellName(index+1, 3)
		assert.NoError(t, book.SetCellValue("Data Source", cell, values[index]))
	}
	var file bytes.Buffer
	assert.NoError(t, book.Write(&file))
	assert.NoError(t, book.Close())

	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(assets []models.Asset) bool {
		if len(assets) != 1 {
			return false
		}
		asset := assets[0]
		return asset.ID == 101 && asset.TenantID == 42 && asset.TagNumber != nil && *asset.TagNumber == "PV-101" &&
			asset.Name == "Reactor" && asset.Description != nil && *asset.Description == "Hydrocracker reactor" &&
			asset.AssetClass != nil && *asset.AssetClass == "Pressure Vessel" && asset.AssetType != nil && *asset.AssetType == "Vessel" &&
			asset.RBIProperties["Component Design.Design Pressure"] == "12.5" && asset.RBIProperties["Component Design.Flow Rate"] == "450"
	}), 7).Return(1, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))

	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.Equal(t, map[string]interface{}{
		"created_count": 1, "updated_count": 0, "imported_count": 1, "total_count": 1,
		"errors": []string{}, "validate_only": false,
	}, result)
	assetRepo.AssertExpectations(t)
}

func TestAssetService_ImportAssetsFromXLSX_RequiresDataSourceSheet(t *testing.T) {
	book := excelize.NewFile()
	var file bytes.Buffer
	assert.NoError(t, book.Write(&file))
	assert.NoError(t, book.Close())
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), new(MockAssetRepository), new(MockComponentRepository))

	_, err := service.ImportAssets(context.Background(), 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.Error(t, err)
	assert.ErrorIs(t, err, utils.ErrValidation)
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
