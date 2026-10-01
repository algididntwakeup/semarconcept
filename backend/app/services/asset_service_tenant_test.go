// platform/backend/app/services/asset_service_tenant_test.go

package services_test

import (
	"bytes"
	"context"
	"encoding/csv"
	"io"
	"strconv"
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

func (m *MockAssetRepository) FindByTagNumber(ctx context.Context, tenantID int, tagNumber string) (*models.Asset, error) {
	args := m.Called(ctx, tenantID, tagNumber)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Asset), args.Error(1)
}

func (m *MockAssetRepository) UpsertAssetsFromImport(ctx context.Context, tenantID int, assets []repositories.AssetImportRecord, userID int) (int, int, error) {
	args := m.Called(ctx, tenantID, assets, userID)
	return args.Int(0), args.Int(1), args.Error(2)
}

func (m *MockAssetRepository) PurgeAll(ctx context.Context, tenantID int) (int64, error) {
	args := m.Called(ctx, tenantID)
	return args.Get(0).(int64), args.Error(1)
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
		RBIProperties: models.JSONBMap{
			"Component Design.Design Pressure":      88.0,
			"Operating Envelope.Operating Pressure": 99.5,
			"Component Design.Flow Rate":            450.0,
			"Custom Data.Test Value":                "round-trip",
			"Bare Property":                         "general-value",
			"Custom Data.Metadata":                  map[string]interface{}{"key": "value"},
			"Custom Data.Value List":                []interface{}{1, "two"},
		},
	}}, nil).Twice()

	service := services.NewAssetService(siteRepo, unitRepo, assetRepo, componentRepo)
	data, filename, err := service.ExportAssets(ctx, 42, &request.AssetExportRequest{})
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
	flowColumn := mustExportColumn(t, workbook, "Flow Rate")
	knownColumn := mustExportColumn(t, workbook, "Operating Pressure")
	customColumn := mustExportColumn(t, workbook, "Test Value")
	designPressureColumn := mustExportColumn(t, workbook, "Design Pressure")
	operatingTemperatureColumn := mustExportColumn(t, workbook, "Operating Temperature")
	assert.Equal(t, "12.5", mustExportCell(t, workbook, designPressureColumn+"3"))
	assert.Equal(t, "185", mustExportCell(t, workbook, operatingTemperatureColumn+"3"))
	assert.Equal(t, "450", mustExportCell(t, workbook, flowColumn+"3"))
	assert.Equal(t, "99.5", mustExportCell(t, workbook, knownColumn+"3"))
	assert.Equal(t, "round-trip", mustExportCell(t, workbook, customColumn+"3"))
	metadataColumn := mustExportColumn(t, workbook, "Metadata")
	listColumn := mustExportColumn(t, workbook, "Value List")
	assert.Equal(t, `{"key":"value"}`, mustExportCell(t, workbook, metadataColumn+"3"))
	assert.Equal(t, `[1,"two"]`, mustExportCell(t, workbook, listColumn+"3"))
	barePropertyColumn := mustExportColumn(t, workbook, "Bare Property")
	assert.Equal(t, "general-value", mustExportCell(t, workbook, barePropertyColumn+"3"))
	assert.NotZero(t, mustExportStyleID(t, workbook, "A1"))
	assert.NotZero(t, mustExportStyleID(t, workbook, "A2"))
	csvData, csvFilename, err := service.ExportAssets(ctx, 42, &request.AssetExportRequest{Format: "csv"})
	assert.NoError(t, err)
	assert.Equal(t, "equipment-master.csv", csvFilename)
	reader := csv.NewReader(bytes.NewReader(csvData))
	categoryRow, err := reader.Read()
	assert.NoError(t, err)
	fieldRow, err := reader.Read()
	assert.NoError(t, err)
	assetRow, err := reader.Read()
	assert.NoError(t, err)
	assert.Equal(t, "General", categoryRow[0])
	assert.Equal(t, "Equipment ID", fieldRow[0])
	assert.Equal(t, "101", assetRow[0])
	flowCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "Component Design", "Flow Rate")
	designPressureColumnCount := 0
	currentCategory := ""
	for index, field := range fieldRow {
		if categoryRow[index] != "" {
			currentCategory = categoryRow[index]
		}
		if currentCategory == "Component Design" && field == "Design Pressure" {
			designPressureColumnCount++
		}
	}
	assert.Equal(t, 1, designPressureColumnCount)
	knownCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "Operating Envelope", "Operating Pressure")
	customCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "Custom Data", "Test Value")
	metadataCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "Custom Data", "Metadata")
	designPressureCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "Component Design", "Design Pressure")
	assert.Equal(t, "12.5", assetRow[designPressureCSVColumn])
	assert.Equal(t, "", categoryRow[1])
	listCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "Custom Data", "Value List")
	assert.Equal(t, "450", assetRow[flowCSVColumn])
	assert.Equal(t, "99.5", assetRow[knownCSVColumn])
	assert.Equal(t, "round-trip", assetRow[customCSVColumn])
	assert.Equal(t, `{"key":"value"}`, assetRow[metadataCSVColumn])
	assert.Equal(t, `[1,"two"]`, assetRow[listCSVColumn])
	barePropertyCSVColumn := findCSVExportColumn(t, categoryRow, fieldRow, "General", "Bare Property")
	assert.Equal(t, "general-value", assetRow[barePropertyCSVColumn])
	_, err = reader.Read()
	assert.Equal(t, io.EOF, err)
	assetRepo.AssertExpectations(t)
}

func mustExportCell(t *testing.T, workbook *excelize.File, cell string) string {
	t.Helper()
	value, err := workbook.GetCellValue("Data Source", cell)
	assert.NoError(t, err)
	return value
}

func mustExportColumn(t *testing.T, workbook *excelize.File, header string) string {
	t.Helper()
	for index := 1; index <= 256; index++ {
		column, err := excelize.ColumnNumberToName(index)
		assert.NoError(t, err)
		if mustExportCell(t, workbook, column+"2") == header {
			return column
		}
	}
	t.Fatalf("export column %q not found", header)
	return ""
}

func mustExportStyleID(t *testing.T, workbook *excelize.File, cell string) int {
	t.Helper()
	styleID, err := workbook.GetCellStyle("Data Source", cell)
	assert.NoError(t, err)
	return styleID
}

func findCSVExportColumn(t *testing.T, categories, headers []string, category, header string) int {
	t.Helper()
	currentCategory := ""
	for index, field := range headers {
		if categories[index] != "" {
			currentCategory = categories[index]
		}
		if currentCategory == category && field == header {
			return index
		}
	}
	t.Fatalf("CSV export column %q.%q not found", category, header)
	return -1
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
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		if len(records) != 1 {
			return false
		}
		asset := records[0].Asset
		return records[0].ParentTag == "" && asset.ID == 101 && asset.TenantID == 42 && asset.TagNumber != nil && *asset.TagNumber == "PV-101" &&
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

func TestAssetService_ImportAssetsFromCSV_FillsIDsAndParentTags(t *testing.T) {
	csvData := []byte("General,General,General,General,General,General,General,Design Data\nAsset ID,Equipment Tag,Equipment Name,Equipment Class,Parent Equipment Tag,Parent Equipment ID,Description,Pressure\n101,ROOT, Root ,Pump,, ,Root description,\n,CHILD-1, Child 1 ,Pump,ROOT,,N/A,9999\n-9999,CHILD-2, Child 2 ,Pump,,777,-9999,N/A\n")
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.Anything, 7).Return(3, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))

	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{FileFormat: "csv"}, 7, csvData)
	assert.NoError(t, err)
	assert.Equal(t, 3, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, 3, result.(map[string]interface{})["total_count"])
	records := assetRepo.Calls[0].Arguments.Get(2).([]repositories.AssetImportRecord)
	assert.Len(t, records, 3)
	assert.Equal(t, 101, records[1].Asset.ID)
	assert.Equal(t, "Child 1", records[1].Asset.Name)
	assert.Equal(t, "ROOT", records[1].ParentTag)
	assert.Nil(t, records[1].Asset.ParentID)
	assert.Nil(t, records[1].Asset.Description)
	assert.Equal(t, 101, records[2].Asset.ID)
	assert.Equal(t, "Child 2", records[2].Asset.Name)
	assert.Equal(t, "ROOT", records[2].ParentTag)
	assert.Equal(t, 777, *records[2].Asset.ParentID)
	assert.Nil(t, records[2].Asset.Description)
	assert.Equal(t, "Root description", *records[0].Asset.Description)
	for _, record := range records {
		assert.NotContains(t, record.Asset.RBIProperties, "Design Data.Pressure")
	}
	assert.Equal(t, []string{}, result.(map[string]interface{})["errors"])
	assetRepo.AssertExpectations(t)
}

func TestAssetService_ImportAssetsFromCSV_DryRunDoesNotWrite(t *testing.T) {
	csvData := []byte("General,General,General,General,General\nAsset ID,Equipment Tag,Equipment Name,Equipment Class,Parent Equipment Tag\n101,ROOT,Root,Pump\n,CHILD,Child,Pump,ROOT\n")
	assetRepo := new(MockAssetRepository)
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))
	result, err := service.ImportAssets(context.Background(), 42, &request.AssetImportRequest{FileFormat: "csv", DryRun: true}, 7, csvData)
	assert.NoError(t, err)
	assert.Equal(t, 2, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, 2, result.(map[string]interface{})["total_count"])
	assert.True(t, result.(map[string]interface{})["validate_only"].(bool))
	assetRepo.AssertNotCalled(t, "UpsertAssetsFromImport", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestAssetService_ImportAssetsFromCSV_SkipsUnavailableParentAndDependents(t *testing.T) {
	csvData := []byte("General,General,General,General,General\nAsset ID,Equipment Tag,Equipment Name,Equipment Class,Parent Equipment Tag\n101,ROOT,Root,Pump,\n102,BAD-CHILD,Bad child,Pump,MISSING\n103,GRANDCHILD,Grandchild,Pump,BAD-CHILD\n104,SELF,Self,Pump,SELF\n")
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	assetRepo.On("FindByTagNumber", ctx, 42, "MISSING").Return((*models.Asset)(nil), nil).Once()
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		return len(records) == 1 && records[0].Asset.TagNumber != nil && *records[0].Asset.TagNumber == "ROOT"
	}), 7).Return(1, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))
	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{FileFormat: "csv", SkipErrors: true}, 7, csvData)
	assert.NoError(t, err)
	assert.Equal(t, 1, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, 4, result.(map[string]interface{})["total_count"])
	assert.Len(t, result.(map[string]interface{})["errors"], 3)
	assetRepo.AssertExpectations(t)
}

func TestAssetService_ImportAssetsFromCSV_ResolvesExternalParentAndRetainsLastValidID(t *testing.T) {
	csvData := []byte("General,General,General,General,General\nAsset ID,Equipment Tag,Equipment Name,Equipment Class,Parent Equipment Tag\n101,ROOT,Root,Pump,\ninvalid,IGNORED,Ignored,Pump,\n,CHILD,Child,Pump,EXTERNAL\n")
	ctx := context.Background()
	externalParent := &models.Asset{ID: 900}
	assetRepo := new(MockAssetRepository)
	assetRepo.On("FindByTagNumber", ctx, 42, "EXTERNAL").Return(externalParent, nil).Once()
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		if len(records) != 2 || records[0].Asset.ID != 101 || records[1].Asset.ID != 101 {
			return false
		}
		return records[1].Asset.ParentID != nil && *records[1].Asset.ParentID == 900
	}), 7).Return(2, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))
	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{FileFormat: "csv", SkipErrors: true}, 7, csvData)
	assert.NoError(t, err)
	assert.Equal(t, 2, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, 3, result.(map[string]interface{})["total_count"])
	assert.Equal(t, []string{"row 4: invalid Asset ID \"invalid\""}, result.(map[string]interface{})["errors"])
	assetRepo.AssertExpectations(t)
}

func TestAssetService_ImportAssetsFromCSV_RejectsMalformedQuotes(t *testing.T) {
	csvData := []byte("General,General\nAsset ID,Equipment Class\n101,\"Pump\n")
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), new(MockAssetRepository), new(MockComponentRepository))
	_, err := service.ImportAssets(context.Background(), 42, &request.AssetImportRequest{FileFormat: "csv"}, 7, csvData)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "read import data row")
}

func TestAssetService_ImportAssetsFromCSV_RejectsMissingParentWithoutWrites(t *testing.T) {
	csvData := []byte("General,General,General,General,General\nAsset ID,Equipment Tag,Equipment Name,Equipment Class,Parent Equipment Tag\n101,CHILD,Child,Pump,MISSING\n")
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	assetRepo.On("FindByTagNumber", ctx, 42, "MISSING").Return((*models.Asset)(nil), nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))
	_, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{FileFormat: "csv"}, 7, csvData)
	assert.ErrorIs(t, err, utils.ErrValidation)
	assetRepo.AssertNotCalled(t, "UpsertAssetsFromImport", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
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

func TestAssetService_ImportAssetsFromXLSX_ImportsMoreThan100Rows(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Data Source"))
	for column, field := range []string{"Equipment ID", "Equipment Tag", "Equipment Class"} {
		cell, _ := excelize.CoordinatesToCellName(column+1, 2)
		assert.NoError(t, book.SetCellValue("Data Source", cell, field))
	}
	for row := 3; row < 104; row++ {
		assert.NoError(t, book.SetCellValue("Data Source", "A"+strconv.Itoa(row), row-2))
		assert.NoError(t, book.SetCellValue("Data Source", "B"+strconv.Itoa(row), "TAG-"+strconv.Itoa(row-2)))
		assert.NoError(t, book.SetCellValue("Data Source", "C"+strconv.Itoa(row), "Pressure Vessel"))
	}
	var file bytes.Buffer
	assert.NoError(t, book.Write(&file))
	assert.NoError(t, book.Close())

	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		return len(records) == 101
	}), 7).Return(101, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))

	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{BatchSize: 100}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.Equal(t, 101, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, 101, result.(map[string]interface{})["total_count"])
	assetRepo.AssertExpectations(t)
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

func TestAssetService_ImportAssetsFromXLSX_Sanitizes9999AndNAValues(t *testing.T) {
	// 1. Direct helper test
	assert.Nil(t, services.SanitizeValue("9999"))
	assert.Nil(t, services.SanitizeValue("-9999"))
	assert.Nil(t, services.SanitizeValue("9999.0"))
	assert.Nil(t, services.SanitizeValue("N/A"))
	assert.Nil(t, services.SanitizeValue("NA"))
	assert.Nil(t, services.SanitizeValue("#N/A"))
	assert.Nil(t, services.SanitizeValue("NULL"))
	assert.Nil(t, services.SanitizeValue(""))
	assert.Nil(t, services.SanitizeValue("   "))
	assert.Equal(t, "450.5", services.SanitizeValue("450.5"))
	assert.Equal(t, "Stainless Steel", services.SanitizeValue("Stainless Steel"))

	// 2. Integration with ImportAssetsFromExcel
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Data Source"))
	fields := []string{"Equipment ID", "Equipment Tag", "Equipment Name", "Description", "Equipment Class", "Equipment Type", "Design Temperature", "Flow Rate", "Notes"}
	categories := []string{"General", "General", "General", "General", "General", "General", "Design Data", "Design Data", "Design Data"}
	values := []interface{}{102, "E-102", "Exchanger", "9999", "Heat Exchanger", "Exchanger", "9999", "-9999", "Real Note"}
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
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		if len(records) != 1 {
			return false
		}
		asset := records[0].Asset
		if asset.Description != nil {
			return false
		}
		if _, hasTemp := asset.RBIProperties["Design Data.Design Temperature"]; hasTemp {
			return false
		}
		if _, hasFlow := asset.RBIProperties["Design Data.Flow Rate"]; hasFlow {
			return false
		}
		return asset.RBIProperties["Design Data.Notes"] == "Real Note"
	}), 7).Return(1, 0, nil).Once()

	svc := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))
	result, err := svc.ImportAssetsFromExcel(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assetRepo.AssertExpectations(t)
}

func TestAssetService_PurgeAssets(t *testing.T) {
	ctx := context.Background()
	tenantID := 42
	assetRepo := new(MockAssetRepository)
	assetRepo.On("PurgeAll", ctx, tenantID).Return(int64(1537), nil).Once()

	svc := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))
	deleted, err := svc.PurgeAssets(ctx, tenantID)
	assert.NoError(t, err)
	assert.Equal(t, int64(1537), deleted)
	assetRepo.AssertExpectations(t)
}
