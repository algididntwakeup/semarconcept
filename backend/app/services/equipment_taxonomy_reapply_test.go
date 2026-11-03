// platform/backend/app/services/equipment_taxonomy_reapply_test.go

package services_test

import (
	"context"
	"testing"

	"backend/app/models"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestAssetService_ReapplyEquipmentTaxonomy proves a dictionary edit reaches
// existing imported assets: the stored label is recomputed from the raw value.
func TestAssetService_ReapplyEquipmentTaxonomy(t *testing.T) {
	ctx := context.Background()
	staleClass := "Piping Line (PL)"
	storedType := "PM"
	canonicalClass := "Onshore Pipelines (PL)"
	canonicalType := "Multiphase Pipelines (Onshore) (PM)"

	repo := new(MockAssetRepository)
	repo.On("ListEquipmentTaxonomy", ctx, 42).Return([]models.EquipmentTaxonomyValue{
		{Kind: models.EquipmentTaxonomyKindClass, CanonicalCode: "PL", CanonicalName: "Onshore Pipelines", Aliases: models.JSONBArray{"PL", "Piping Line"}, IsActive: true},
		{Kind: models.EquipmentTaxonomyKindType, CanonicalCode: "PM", CanonicalName: "Multiphase Pipelines (Onshore)", Aliases: models.JSONBArray{"PM"}, IsActive: true},
	}, nil).Once()
	repo.On("ListImportRawTaxonomy", ctx, 42).Return([]repositories.AssetImportRawTaxonomy{
		// Stored label is stale ("Piping Line (PL)"); raw value is "PL".
		{ID: 1, AssetClass: &staleClass, AssetType: &storedType, SourceClass: "PL", SourceType: "PM"},
		// Already canonical: must not be counted as a change.
		{ID: 2, AssetClass: &canonicalClass, AssetType: &canonicalType, SourceClass: "PL", SourceType: "PM"},
	}, nil).Once()
	repo.On("ApplyImportTaxonomyLabels", ctx, 42, 7, mock.MatchedBy(func(updates map[int]repositories.AssetTaxonomyLabel) bool {
		label, ok := updates[1]
		if !ok || len(updates) != 1 {
			return false
		}
		return label.AssetClass != nil && *label.AssetClass == "Onshore Pipelines (PL)" &&
			label.AssetType != nil && *label.AssetType == "Multiphase Pipelines (Onshore) (PM)"
	}), false).Return(int64(1), nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	result, err := service.ReapplyEquipmentTaxonomy(ctx, 42, 7, false)
	assert.NoError(t, err)
	assert.Equal(t, 2, result.CheckedCount)
	assert.Equal(t, int64(1), result.UpdatedCount)
	assert.False(t, result.DryRun)
	assert.Empty(t, result.UnmappedClass)
	assert.Empty(t, result.UnmappedType)
	repo.AssertExpectations(t)
}

// TestAssetService_ReapplyEquipmentTaxonomyReportsUnmapped proves raw values
// with no dictionary entry are reported instead of silently rewritten.
func TestAssetService_ReapplyEquipmentTaxonomyReportsUnmapped(t *testing.T) {
	ctx := context.Background()
	staleClass := "Old Class"
	storedType := "PM"

	repo := new(MockAssetRepository)
	repo.On("ListEquipmentTaxonomy", ctx, 42).Return([]models.EquipmentTaxonomyValue{}, nil).Once()
	repo.On("ListImportRawTaxonomy", ctx, 42).Return([]repositories.AssetImportRawTaxonomy{
		{ID: 5, AssetClass: &staleClass, AssetType: &storedType, SourceClass: "PL", SourceType: "PM"},
	}, nil).Once()
	// The raw "PM" is unknown, so it stays "PM" and is reported; the class still
	// resolves through the built-in fallback.
	repo.On("ApplyImportTaxonomyLabels", ctx, 42, 7, mock.MatchedBy(func(updates map[int]repositories.AssetTaxonomyLabel) bool {
		label, ok := updates[5]
		return ok && label.AssetClass != nil && *label.AssetClass == "Piping Line (PL)" &&
			label.AssetType != nil && *label.AssetType == "PM"
	}), false).Return(int64(1), nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	result, err := service.ReapplyEquipmentTaxonomy(ctx, 42, 7, false)
	assert.NoError(t, err)
	assert.Equal(t, []string{"PM"}, result.UnmappedType)
	assert.Empty(t, result.UnmappedClass)
	repo.AssertExpectations(t)
}

// TestAssetService_ReapplyEquipmentTaxonomyFallsBackTypeToClass proves a row
// without a workbook type keeps its type filled from the class, mirroring the
// import behaviour instead of blanking it.
func TestAssetService_ReapplyEquipmentTaxonomyFallsBackTypeToClass(t *testing.T) {
	ctx := context.Background()
	staleClass := "Old"
	staleType := "Old"

	repo := new(MockAssetRepository)
	repo.On("ListEquipmentTaxonomy", ctx, 42).Return([]models.EquipmentTaxonomyValue{}, nil).Once()
	repo.On("ListImportRawTaxonomy", ctx, 42).Return([]repositories.AssetImportRawTaxonomy{
		{ID: 9, AssetClass: &staleClass, AssetType: &staleType, SourceClass: "PL"},
	}, nil).Once()
	repo.On("ApplyImportTaxonomyLabels", ctx, 42, 7, mock.MatchedBy(func(updates map[int]repositories.AssetTaxonomyLabel) bool {
		label, ok := updates[9]
		return ok && label.AssetClass != nil && *label.AssetClass == "Piping Line (PL)" &&
			label.AssetType != nil && *label.AssetType == "Piping Line (PL)"
	}), false).Return(int64(1), nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	result, err := service.ReapplyEquipmentTaxonomy(ctx, 42, 7, false)
	assert.NoError(t, err)
	assert.Equal(t, int64(1), result.UpdatedCount)
	repo.AssertExpectations(t)
}

// TestAssetService_ReapplyEquipmentTaxonomyDryRun proves the preview passes
// dryRun through to the repository.
func TestAssetService_ReapplyEquipmentTaxonomyDryRun(t *testing.T) {
	ctx := context.Background()
	staleClass := "Old"

	repo := new(MockAssetRepository)
	repo.On("ListEquipmentTaxonomy", ctx, 42).Return([]models.EquipmentTaxonomyValue{}, nil).Once()
	repo.On("ListImportRawTaxonomy", ctx, 42).Return([]repositories.AssetImportRawTaxonomy{
		{ID: 3, AssetClass: &staleClass, SourceClass: "PL"},
	}, nil).Once()
	repo.On("ApplyImportTaxonomyLabels", ctx, 42, 7, mock.Anything, true).Return(int64(1), nil).Once()

	service := services.NewAssetService(new(MockSiteRepository), new(MockUnitRepository), repo, new(MockComponentRepository))
	result, err := service.ReapplyEquipmentTaxonomy(ctx, 42, 7, true)
	assert.NoError(t, err)
	assert.True(t, result.DryRun)
	repo.AssertExpectations(t)
}
