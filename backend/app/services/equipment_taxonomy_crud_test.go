// platform/backend/app/services/equipment_taxonomy_crud_test.go

package services_test

import (
	"context"
	"errors"
	"testing"

	"backend/app/models"
	"backend/app/models/request"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestAssetService_CreateEquipmentTaxonomyValue proves the code is upper-cased
// and the code/name are always included as aliases.
func TestAssetService_CreateEquipmentTaxonomyValue(t *testing.T) {
	ctx := context.Background()
	repo := new(MockAssetRepository)
	repo.On("CreateEquipmentTaxonomyValue", ctx, mock.MatchedBy(func(value *models.EquipmentTaxonomyValue) bool {
		if value.TenantID != 42 || value.Kind != "type" || value.CanonicalCode != "PG" || value.CanonicalName != "Process Gas" {
			return false
		}
		aliases := value.AliasList()
		// Code and name are auto-added; the duplicate "process gas" drops.
		return len(aliases) == 2 && aliases[0] == "PG" && aliases[1] == "Process Gas"
	})).Return(nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	value, err := service.CreateEquipmentTaxonomyValue(ctx, 42, &request.CreateEquipmentTaxonomyValueRequest{
		Kind:          "type",
		CanonicalCode: " pg ",
		CanonicalName: " Process Gas ",
		Aliases:       []string{"process gas"},
	})
	assert.NoError(t, err)
	assert.Equal(t, "PG", value.CanonicalCode)
	assert.True(t, value.IsActive)
	repo.AssertExpectations(t)
}

// TestAssetService_CreateEquipmentTaxonomyValueRejectsBlank proves a blank code
// or name is rejected before touching the repository.
func TestAssetService_CreateEquipmentTaxonomyValueRejectsBlank(t *testing.T) {
	ctx := context.Background()
	repo := new(MockAssetRepository)
	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))

	_, err := service.CreateEquipmentTaxonomyValue(ctx, 42, &request.CreateEquipmentTaxonomyValueRequest{
		Kind: "class", CanonicalCode: "  ", CanonicalName: "Pumps",
	})
	assert.Error(t, err)
	repo.AssertNotCalled(t, "CreateEquipmentTaxonomyValue", mock.Anything, mock.Anything)
}

// TestAssetService_UpdateEquipmentTaxonomyValue proves the name, aliases, and
// active flag are forwarded.
func TestAssetService_UpdateEquipmentTaxonomyValue(t *testing.T) {
	ctx := context.Background()
	repo := new(MockAssetRepository)
	repo.On("UpdateEquipmentTaxonomyValue", ctx, 42, 7, "Process Gas",
		mock.MatchedBy(func(aliases models.JSONBArray) bool {
			list := models.EquipmentTaxonomyValue{Aliases: aliases}.AliasList()
			return len(list) == 2 && list[0] == "Process Gas" && list[1] == "PG"
		}), true).Return(nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	err := service.UpdateEquipmentTaxonomyValue(ctx, 42, 7, &request.UpdateEquipmentTaxonomyValueRequest{
		CanonicalName: "Process Gas",
		Aliases:       []string{"PG"},
	})
	assert.NoError(t, err)
	repo.AssertExpectations(t)
}

// TestAssetService_DeleteEquipmentTaxonomyValue proves the error is forwarded.
func TestAssetService_DeleteEquipmentTaxonomyValue(t *testing.T) {
	ctx := context.Background()
	repo := new(MockAssetRepository)
	repo.On("DeleteEquipmentTaxonomyValue", ctx, 42, 7).Return(errors.New("not found")).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	err := service.DeleteEquipmentTaxonomyValue(ctx, 42, 7)
	assert.Error(t, err)
	repo.AssertExpectations(t)
}
