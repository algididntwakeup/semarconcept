// platform/backend/app/services/equipment_import_translation_test.go

package services_test

import (
	"bytes"
	"context"
	"testing"

	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/xuri/excelize/v2"
)

func TestTranslateEquipmentImportClass(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"piping", "PI", "Piping (PI)"},
		{"heat exchangers", "HX", "Heat Exchangers (HX)"},
		{"pressure vessels", "VE", "Pressure Vessels (VE)"},
		{"storage tanks TK", "TK", "Storage Tanks (TK)"},
		{"storage tanks TA", "TA", "Storage Tanks (TA)"},
		{"filters and strainers", "FS", "Filters And Strainers (FS)"},
		{"heaters and boilers", "HB", "Heaters And Boilers (HB)"},
		{"piping line", "PL", "Piping Line (PL)"},
		{"case insensitive", "pi", "Piping (PI)"},
		{"surrounding whitespace", "  ve  ", "Pressure Vessels (VE)"},
		{"unknown code kept as-is", "ZZ", "ZZ"},
		{"long name kept as-is", "Pressure Vessels", "Pressure Vessels"},
		{"empty kept as-is", "", ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, services.TranslateEquipmentImportClass(tc.input))
		})
	}
}

func TestTranslateEquipmentImportType(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"carbon steel CA", "CA", "Carbon Steel (Ca) (CA)"},
		{"carbon steel CS", "CS", "Carbon Steel (Cs) (CS)"},
		{"stainless steel", "SS", "Stainless Steel (Ss) (SS)"},
		{"shell and tube", "ST", "Shell And Tube (St) (ST)"},
		{"air cooled", "AC", "Air Cooled (Ac) (AC)"},
		{"coalescer filter", "CO", "Coalescer Filter (Co) (CO)"},
		{"cartridge filter", "CF", "Cartridge Filter (Cf) (CF)"},
		{"pressure filter", "PF", "Pressure Filter (Pf) (PF)"},
		{"basket strainer", "BS", "Basket Strainer (Bs) (BS)"},
		{"separator", "SE", "Separator (Se) (SE)"},
		{"scrubber", "SB", "Scrubber (Sb) (SB)"},
		{"surge drum", "SD", "Surge Drum (Sd) (SD)"},
		{"adsorber", "AD", "Adsorber (Ad) (AD)"},
		{"flash drum", "FD", "Flash Drum (Fd) (FD)"},
		{"distillation column", "DC", "Distillation Column (Dc) (DC)"},
		{"dryer", "DR", "Dryer (Dr) (DR)"},
		{"pig trap", "PT", "Pig Trap (Pt) (PT)"},
		{"fixed roof", "FR", "Fixed Roof (Fr) (FR)"},
		{"direct fired heater", "DF", "Direct Fired Heater (Df) (DF)"},
		{"case insensitive", "ca", "Carbon Steel (Ca) (CA)"},
		{"surrounding whitespace", "  ss  ", "Stainless Steel (Ss) (SS)"},
		{"unknown code kept as-is", "PM", "PM"},
		{"long name kept as-is", "Carbon Steel", "Carbon Steel"},
		{"empty kept as-is", "", ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, services.TranslateEquipmentImportType(tc.input))
		})
	}
}

// TestAssetService_ImportAssetsFromXLSX_TranslatesAbbreviationCodes proves the
// import writes the canonical long names to the database while leaving unknown
// codes untouched.
func TestAssetService_ImportAssetsFromXLSX_TranslatesAbbreviationCodes(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Equipment Master"))
	fields := []string{"Asset ID/Tag Number", "Description", "Equipment Class", "Equipment Type"}
	for index, field := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, field))
	}
	rows := [][]interface{}{
		{`1"-AI-12001-1G1`, "Piping line", "PI", "CA"},
		{"12-H-1101A-1", "Intercooler", "HX", "ST"},
		{"11-V-1101", "Inlet separator", "VE", "SE"},
		{"11-T-1103", "Produced water tank", "TA", "FR"},
		{"ZZ-1", "Unknown codes", "ZZ", "PM"},
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
	assetRepo := new(MockAssetRepository)
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		if len(records) != 5 {
			return false
		}
		want := [][2]string{
			{"Piping (PI)", "Carbon Steel (Ca) (CA)"},
			{"Heat Exchangers (HX)", "Shell And Tube (St) (ST)"},
			{"Pressure Vessels (VE)", "Separator (Se) (SE)"},
			{"Storage Tanks (TA)", "Fixed Roof (Fr) (FR)"},
			{"ZZ", "PM"},
		}
		for index, record := range records {
			if record.Asset.AssetClass == nil || *record.Asset.AssetClass != want[index][0] {
				return false
			}
			if record.Asset.AssetType == nil || *record.Asset.AssetType != want[index][1] {
				return false
			}
		}
		return true
	}), 7).Return(5, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))

	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.Equal(t, 5, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, []string{}, result.(map[string]interface{})["errors"])
	assetRepo.AssertExpectations(t)
}

// TestAssetService_ImportAssetsFromXLSX_LeavesLongNamesUnchanged guards the
// fallback: a workbook that already carries canonical names must not be altered.
func TestAssetService_ImportAssetsFromXLSX_LeavesLongNamesUnchanged(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Equipment Master"))
	fields := []string{"Asset ID/Tag Number", "Equipment Class", "Equipment Type"}
	for index, field := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, field))
	}
	values := []interface{}{"PV-101", "Pressure Vessels", "Adsorber"}
	for index, value := range values {
		cell, _ := excelize.CoordinatesToCellName(index+1, 2)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, value))
	}
	var file bytes.Buffer
	assert.NoError(t, book.Write(&file))
	assert.NoError(t, book.Close())

	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	assetRepo.On("UpsertAssetsFromImport", ctx, 42, mock.MatchedBy(func(records []repositories.AssetImportRecord) bool {
		return len(records) == 1 &&
			records[0].Asset.AssetClass != nil && *records[0].Asset.AssetClass == "Pressure Vessels" &&
			records[0].Asset.AssetType != nil && *records[0].Asset.AssetType == "Adsorber"
	}), 7).Return(1, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))

	_, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assetRepo.AssertExpectations(t)
}
