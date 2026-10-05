// platform/backend/app/services/equipment_import_status_funcloc_test.go

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

func TestNormalizeInstallationStatus(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"active becomes installed", "Active", "Installed"},
		{"in service becomes installed", "In Service", "Installed"},
		{"case insensitive", "ACTIVE", "Installed"},
		{"case insensitive in service", "in service", "Installed"},
		{"surrounding whitespace", "  Active  ", "Installed"},
		{"blank becomes available", "", "Available"},
		{"whitespace becomes available", "   ", "Available"},
		{"9999 becomes available", "9999", "Available"},
		{"-9999 becomes available", "-9999", "Available"},
		{"N/A becomes available", "N/A", "Available"},
		{"NULL becomes available", "NULL", "Available"},
		{"other value preserved", "Maintenance", "Maintenance"},
		{"installed preserved", "Installed", "Installed"},
		{"available preserved", "Available", "Available"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, services.NormalizeInstallationStatus(tc.input))
		})
	}
}

func TestParseEquipmentImportFuncloc(t *testing.T) {
	cases := []struct {
		name        string
		input       string
		wantCode    string
		wantDesc    string
		wantHasFunc bool
	}{
		{"code with description", "JI-JL-AG-11-PW (INLET SEPARATION)", "JI-JL-AG-11-PW", "INLET SEPARATION", true},
		{"bare code", "68-FWS-68-T-1108", "68-FWS-68-T-1108", "", true},
		{"multiple groups joined", "A-B-C (INLET) (SEPARATION)", "A-B-C", "INLET SEPARATION", true},
		{"lowercase preserved", "a-b (inlet separation)", "a-b", "inlet separation", true},
		{"nested parentheses", "A-B (INLET (PRIMARY) SEPARATION)", "A-B", "INLET (PRIMARY) SEPARATION", true},
		{"surrounding whitespace", "  JI-JL-AG-11-PW (INLET)  ", "JI-JL-AG-11-PW", "INLET", true},
		{"empty is invalid", "", "", "", false},
		{"9999 is invalid", "9999", "", "", false},
		{"N/A is invalid", "N/A", "", "", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			code, desc, has := services.ParseEquipmentImportFuncloc(tc.input)
			assert.Equal(t, tc.wantCode, code)
			assert.Equal(t, tc.wantDesc, desc)
			assert.Equal(t, tc.wantHasFunc, has)
		})
	}
}

// TestAssetService_ImportAssetsFromXLSX_NormalizesStatusAndParsesFuncloc proves
// the import writes the normalized status, sets has_funcloc, and splits the
// functional location code/description into rbi_properties.
func TestAssetService_ImportAssetsFromXLSX_NormalizesStatusAndParsesFuncloc(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Equipment Master"))
	fields := []string{"Asset ID/Tag Number", "Funcloc", "Equipment Status", "Equipment Class", "Equipment Type"}
	for index, field := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, field))
	}
	rows := [][]interface{}{
		{"TAG-1", "JI-JL-AG-11-PW (INLET SEPARATION)", "Active", "PI", "CA"},
		{"TAG-2", "68-FWS-68-T-1108", "In Service", "VE", "SE"},
		{"TAG-3", "9999", "", "HX", "ST"},
		{"TAG-4", "", "Available", "TA", "FR"},
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
		if len(records) != 4 {
			return false
		}
		first := records[0].Asset
		if first.Status == nil || *first.Status != "Installed" || !first.HasFuncloc {
			return false
		}
		if first.RBIProperties["parent_funcloc_code"] != "JI-JL-AG-11-PW" || first.RBIProperties["parent_funcloc_desc"] != "INLET SEPARATION" {
			return false
		}
		second := records[1].Asset
		if second.Status == nil || *second.Status != "Installed" || !second.HasFuncloc {
			return false
		}
		if second.RBIProperties["parent_funcloc_code"] != "68-FWS-68-T-1108" {
			return false
		}
		if _, hasDesc := second.RBIProperties["parent_funcloc_desc"]; hasDesc {
			return false
		}
		third := records[2].Asset
		if third.Status == nil || *third.Status != "Available" || third.HasFuncloc {
			return false
		}
		if _, hasCode := third.RBIProperties["parent_funcloc_code"]; hasCode {
			return false
		}
		fourth := records[3].Asset
		if fourth.Status == nil || *fourth.Status != "Available" || fourth.HasFuncloc {
			return false
		}
		return true
	}), 7).Return(4, 0, nil).Once()
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository))

	result, err := service.ImportAssets(ctx, 42, &request.AssetImportRequest{}, 7, file.Bytes())
	assert.NoError(t, err)
	assert.Equal(t, 4, result.(map[string]interface{})["imported_count"])
	assert.Equal(t, []string{}, result.(map[string]interface{})["errors"])
	assetRepo.AssertExpectations(t)
}
