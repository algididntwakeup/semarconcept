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
		{"unknown value becomes available", "Maintenance", "Available"},
		{"already installed becomes available without active token", "Installed", "Available"},
		{"already available stays available", "Available", "Available"},
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

func TestFormatParentFuncloc(t *testing.T) {
	cases := []struct {
		name   string
		code   string
		inline string
		want   string
	}{
		{"bare code without description", "JI-JL-AG-11-PW", "", "JI-JL-AG-11-PW"},
		{"inline description fallback", "JI-JL-AG-11-PW", "INLET SEPARATION", "JI-JL-AG-11-PW (INLET SEPARATION)"},
		{"empty code", "", "INLET", ""},
		{"whitespace trimmed", "  68-FWS-68-T-1108  ", "  FIRE WATER  ", "68-FWS-68-T-1108 (FIRE WATER)"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, services.FormatParentFuncloc(tc.code, tc.inline))
		})
	}
}

func TestFormatLevel6Funcloc(t *testing.T) {
	cases := []struct {
		name      string
		installed string
		tag       string
		want      string
	}{
		{"installed with tag", `11-W-1112`, `11-W-1112`, `11-W-1112 (11-W-1112)`},
		{"distinct installed and tag", `11-IS-11-V-1101`, `11-V-1101`, `11-IS-11-V-1101 (11-V-1101)`},
		{"missing installed omitted", "", "TAG-9", ""},
		{"missing tag duplicates installed", "TAG-8", "", "TAG-8 (TAG-8)"},
		{"both empty", "", "", ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, services.FormatLevel6Funcloc(tc.installed, tc.tag))
		})
	}
}

// TestAssetService_ImportAssetsFromXLSX_NormalizesStatusAndParsesFuncloc proves
// the import writes the normalized status, sets has_funcloc, and stores the
// formatted parent and level-6 functional locations in rbi_properties.
func TestAssetService_ImportAssetsFromXLSX_NormalizesStatusAndParsesFuncloc(t *testing.T) {
	book := excelize.NewFile()
	assert.NoError(t, book.SetSheetName("Sheet1", "Equipment Master"))
	fields := []string{"Asset ID/Tag Number", "Funcloc", "Installed FunLoc", "Equipment Status", "Equipment Class", "Equipment Type"}
	for index, field := range fields {
		cell, _ := excelize.CoordinatesToCellName(index+1, 1)
		assert.NoError(t, book.SetCellValue("Equipment Master", cell, field))
	}
	rows := [][]interface{}{
		{"TAG-1", "JI-JL-AG-11-PW (INLET SEPARATION)", "10\"-PG-12009-3C3-P", "Active", "PI", "CA"},
		{"TAG-2", "68-FWS-68-T-1108", "1\"-VH-11002-1C1", "In Service", "VE", "SE"},
		{"TAG-3", "9999", "9999", "", "HX", "ST"},
		{"TAG-4", "", "", "Available", "TA", "FR"},
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
		if first.RBIProperties["parent_funcloc"] != "JI-JL-AG-11-PW (INLET SEPARATION)" {
			return false
		}
		if first.RBIProperties["level6_funcloc"] != `10"-PG-12009-3C3-P (TAG-1)` {
			return false
		}
		second := records[1].Asset
		if second.Status == nil || *second.Status != "Installed" || !second.HasFuncloc {
			return false
		}
		if second.RBIProperties["parent_funcloc"] != "68-FWS-68-T-1108" {
			return false
		}
		if second.RBIProperties["level6_funcloc"] != `1"-VH-11002-1C1 (TAG-2)` {
			return false
		}
		third := records[2].Asset
		if third.Status == nil || *third.Status != "Available" || third.HasFuncloc {
			return false
		}
		if _, hasParent := third.RBIProperties["parent_funcloc"]; hasParent {
			return false
		}
		if _, hasLevel6 := third.RBIProperties["level6_funcloc"]; hasLevel6 {
			return false
		}
		fourth := records[3].Asset
		if fourth.Status == nil || *fourth.Status != "Available" || fourth.HasFuncloc {
			return false
		}
		if _, hasLevel6 := fourth.RBIProperties["level6_funcloc"]; hasLevel6 {
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
