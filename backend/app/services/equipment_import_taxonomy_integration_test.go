// platform/backend/app/services/equipment_import_taxonomy_integration_test.go

package services_test

import (
	"bytes"
	"context"
	"testing"

	"backend/app/models"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/xuri/excelize/v2"
)

// dictionaryAssetRepository returns a fixed tenant dictionary while inheriting
// every other behaviour from MockAssetRepository.
type dictionaryAssetRepository struct {
	MockAssetRepository
	values []models.EquipmentTaxonomyValue
}

func (d *dictionaryAssetRepository) ListEquipmentTaxonomy(ctx context.Context, tenantID int) ([]models.EquipmentTaxonomyValue, error) {
	return d.values, nil
}

// TestAssetService_ImportAssetsUsesTenantDictionary proves a workbook using a
// tenant's own codes resolves to that tenant's canonical labels, and that the
// raw cell values are kept for provenance.
func TestAssetService_ImportAssetsUsesTenantDictionary(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Equipment Master"))
	fields := []string{"Asset ID/Tag Number", "Equipment Class", "Equipment Type"}
	for index, field := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, field))
	}
	rows := [][]interface{}{
		{"P-1", "PUMP", "CS-01"},
		{"P-2", "Piping", "CA"},
	}
	for rowIndex, values := range rows {
		for index, value := range values {
			cell, _ := excelize.CoordinatesToCellName(index+1, rowIndex+2)
			assert.NoError(t, book.SetCellValue("Equipment Master", cell, value))
		}
	}
	var file bytes.Buffer
	assert.NoError(t, book.Write(&file))
	assert.NoError(t, book.Close())

	ctx := context.Background()
	repo := &dictionaryAssetRepository{
		values: []models.EquipmentTaxonomyValue{
			{Kind: models.EquipmentTaxonomyKindClass, CanonicalCode: "PMP", CanonicalName: "Pumps", Aliases: models.JSONBArray{"PUMP"}, IsActive: true},
			{Kind: models.EquipmentTaxonomyKindType, CanonicalCode: "CS", CanonicalName: "Carbon Steel", Aliases: models.JSONBArray{"CS-01"}, IsActive: true},
		},
	}
	repo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		if len(records) != 2 {
			return false
		}
		first := records[0].Asset
		// Tenant code resolves to the tenant canonical label.
		if first.AssetClass == nil || *first.AssetClass != "Pumps (PMP)" {
			return false
		}
		if first.AssetType == nil || *first.AssetType != "Carbon Steel (CS)" {
			return false
		}
		// Raw cells are kept for provenance.
		if first.RBIProperties["source_class"] != "PUMP" || first.RBIProperties["source_type"] != "CS-01" {
			return false
		}
		second := records[1].Asset
		// A built-in value still resolves when the tenant did not override it.
		return second.AssetClass != nil && *second.AssetClass == "Piping (PI)"
	}), 7).Return(2, 0, nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.Equal(t, 2, result.(map[string]interface{})["imported_count"])
	// No unknown values in this workbook.
	assert.Equal(t, []string{}, result.(map[string]interface{})["unmapped_class"])
	assert.Equal(t, []string{}, result.(map[string]interface{})["unmapped_type"])
	repo.AssertExpectations(t)
}

// TestAssetService_ImportAssetsReportsUnmappedValues proves unknown class/type
// cells are reported so an operator can map them later.
func TestAssetService_ImportAssetsReportsUnmappedValues(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Equipment Master"))
	fields := []string{"Asset ID/Tag Number", "Equipment Class", "Equipment Type"}
	for index, field := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, field))
	}
	cell, _ := excelize.CoordinatesToCellName(1, 2)
	assert.NoError(t, book.SetCellValue("Equipment Master", cell, "T-1"))
	cell, _ = excelize.CoordinatesToCellName(2, 2)
	assert.NoError(t, book.SetCellValue("Equipment Master", cell, "Mystery Class"))
	cell, _ = excelize.CoordinatesToCellName(3, 2)
	assert.NoError(t, book.SetCellValue("Equipment Master", cell, "WIDGET-9000"))
	var file bytes.Buffer
	assert.NoError(t, book.Write(&file))
	assert.NoError(t, book.Close())

	ctx := context.Background()
	repo := new(MockAssetRepository)
	repo.On("UpsertAssetsFromImport", ctx, 42, mock.Anything, 7).Return(1, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))

	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.Equal(t, []string{"Mystery Class"}, result.(map[string]interface{})["unmapped_class"])
	assert.Equal(t, []string{"WIDGET-9000"}, result.(map[string]interface{})["unmapped_type"])
	repo.AssertExpectations(t)
}
