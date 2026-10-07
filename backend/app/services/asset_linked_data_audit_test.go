// platform/backend/app/services/asset_linked_data_audit_test.go

package services_test

import (
	"context"
	"testing"

	"backend/app/models"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// mockPipingClassRepository returns a fixed master row (or nil for unknown).
type mockPipingClassRepository struct {
	mock.Mock
}

func (m *mockPipingClassRepository) FindByCode(ctx context.Context, tenantID int, code string) (*models.PipingClass, error) {
	args := m.Called(ctx, tenantID, code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.PipingClass), args.Error(1)
}

// mockLifecycleLogRepository captures audit entries the service appends.
type mockLifecycleLogRepository struct {
	mock.Mock
}

func (m *mockLifecycleLogRepository) Create(ctx context.Context, log *models.EquipmentLifecycleLog) error {
	args := m.Called(ctx, log)
	return args.Error(0)
}

func (m *mockLifecycleLogRepository) ListByEquipment(ctx context.Context, tenantID, equipmentID int) ([]models.EquipmentLifecycleLog, error) {
	args := m.Called(ctx, tenantID, equipmentID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.EquipmentLifecycleLog), args.Error(1)
}

var (
	_ repositories.PipingClassRepository           = (*mockPipingClassRepository)(nil)
	_ repositories.EquipmentLifecycleLogRepository = (*mockLifecycleLogRepository)(nil)
)

// TestAssetService_GetAssetBuildsLinkedDataFromPipingClass proves the relational
// fetch renders a Design & Material card from the master row.
func TestAssetService_GetAssetBuildsLinkedDataFromPipingClass(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	pipingRepo := new(mockPipingClassRepository)

	assetRepo.On("FindByID", ctx, 1, 55).Return(&models.Asset{
		ID:       55,
		TenantID: 1,
		RBIProperties: models.JSONBMap{
			"Component Design.Piping Class": "A1A",
		},
	}, nil).Once()
	pipingRepo.On("FindByCode", ctx, 1, "A1A").Return(&models.PipingClass{
		Code: "A1A", Material: "Carbon Steel", CorrosionAllowance: "1.6",
		PipeSchedule: "SCH160", RatingClass: "150#RF", NominalPipeSize: "1",
	}, nil).Once()

	service := services.NewAssetService(
		new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository),
		services.WithAssetRelations(pipingRepo, new(mockLifecycleLogRepository)),
	)
	result, err := service.GetAsset(ctx, 1, 55)
	assert.NoError(t, err)
	assert.NotNil(t, result.LinkedData)
	assert.Equal(t, "A1A", result.LinkedData.PipingClassCode)
	assert.Len(t, result.LinkedData.Cards, 1)

	card := result.LinkedData.Cards[0]
	assert.Equal(t, "piping-class", card.Key)
	assert.Equal(t, "Design & Material", card.Title)
	assert.Equal(t, "Piping Class Master", card.Source)
	assert.Len(t, card.Properties, 5)
	assert.Equal(t, "Corrosion Allowance", card.Properties[1].Label)
	assert.Equal(t, "1.6", card.Properties[1].Value)
	assetRepo.AssertExpectations(t)
	pipingRepo.AssertExpectations(t)
}

// TestAssetService_GetAssetWithoutLinkOmitsLinkedData proves an asset with no
// piping class returns no linked_data, so the UI hides the area.
func TestAssetService_GetAssetWithoutLinkOmitsLinkedData(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	pipingRepo := new(mockPipingClassRepository)

	assetRepo.On("FindByID", ctx, 1, 56).Return(&models.Asset{ID: 56, TenantID: 1}, nil).Once()

	service := services.NewAssetService(
		new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository),
		services.WithAssetRelations(pipingRepo, new(mockLifecycleLogRepository)),
	)
	result, err := service.GetAsset(ctx, 1, 56)
	assert.NoError(t, err)
	assert.Nil(t, result.LinkedData)
	// No reference means no master lookup at all.
	pipingRepo.AssertNotCalled(t, "FindByCode", mock.Anything, mock.Anything, mock.Anything)
}

// TestAssetService_GetAssetUnknownPipingClassStillReportsReference proves an
// unknown code degrades gracefully: the card shows the reference, not an error.
func TestAssetService_GetAssetUnknownPipingClassStillReportsReference(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	pipingRepo := new(mockPipingClassRepository)

	assetRepo.On("FindByID", ctx, 1, 57).Return(&models.Asset{
		ID: 57, TenantID: 1,
		RBIProperties: models.JSONBMap{"Component Design.Piping Class": "ZZ9"},
	}, nil).Once()
	pipingRepo.On("FindByCode", ctx, 1, "ZZ9").Return(nil, nil).Once()

	service := services.NewAssetService(
		new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository),
		services.WithAssetRelations(pipingRepo, new(mockLifecycleLogRepository)),
	)
	result, err := service.GetAsset(ctx, 1, 57)
	assert.NoError(t, err)
	assert.NotNil(t, result.LinkedData)
	assert.Len(t, result.LinkedData.Cards, 1)
	assert.Equal(t, "Piping Class", result.LinkedData.Cards[0].Properties[0].Label)
	assert.Equal(t, "ZZ9", result.LinkedData.Cards[0].Properties[0].Value)
}

// TestAssetService_UpdateAssetWritesAuditTrail proves a save that changes data
// appends one UPDATE_ASSET entry describing the changed fields.
func TestAssetService_UpdateAssetWritesAuditTrail(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	logRepo := new(mockLifecycleLogRepository)
	description := "Old description"

	assetRepo.On("FindByID", ctx, 1, 77).Return(&models.Asset{
		ID: 77, TenantID: 1, Description: &description,
		RBIProperties: models.JSONBMap{"source_class": "PI"},
	}, nil).Once()
	assetRepo.On("Update", ctx, mock.Anything).Return(nil).Once()
	logRepo.On("Create", ctx, mock.MatchedBy(func(entry *models.EquipmentLifecycleLog) bool {
		return entry.Action == models.LifecycleActionUpdateAsset &&
			entry.EquipmentID == 77 && entry.TenantID == 1 &&
			entry.Remarks != nil && entry.OldValue != nil && entry.NewValue != nil &&
			entry.CreatedBy != nil && *entry.CreatedBy == 9
	})).Return(nil).Once()

	service := services.NewAssetService(
		new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository),
		services.WithAssetRelations(new(mockPipingClassRepository), logRepo),
	)
	newDescription := "New description"
	_, err := service.UpdateAsset(ctx, 1, 77, &request.UpdateAssetRequest{Description: &newDescription}, 9)
	assert.NoError(t, err)
	logRepo.AssertExpectations(t)
}

// TestAssetService_UpdateAssetNoChangeWritesNoAudit proves an unchanged save
// does not pollute the audit trail.
func TestAssetService_UpdateAssetNoChangeWritesNoAudit(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	logRepo := new(mockLifecycleLogRepository)
	description := "Same description"

	assetRepo.On("FindByID", ctx, 1, 78).Return(&models.Asset{
		ID: 78, TenantID: 1, Description: &description,
	}, nil).Once()
	assetRepo.On("Update", ctx, mock.Anything).Return(nil).Once()

	service := services.NewAssetService(
		new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository),
		services.WithAssetRelations(new(mockPipingClassRepository), logRepo),
	)
	sameDescription := "Same description"
	_, err := service.UpdateAsset(ctx, 1, 78, &request.UpdateAssetRequest{Description: &sameDescription}, 9)
	assert.NoError(t, err)
	logRepo.AssertNotCalled(t, "Create", mock.Anything, mock.Anything)
}

// TestAssetService_UpdateAssetAuditFailureDoesNotFailSave proves auditing is
// best-effort: a log write error must not roll back the user's save.
func TestAssetService_UpdateAssetAuditFailureDoesNotFailSave(t *testing.T) {
	ctx := context.Background()
	assetRepo := new(MockAssetRepository)
	logRepo := new(mockLifecycleLogRepository)
	description := "Before"

	assetRepo.On("FindByID", ctx, 1, 79).Return(&models.Asset{
		ID: 79, TenantID: 1, Description: &description,
	}, nil).Once()
	assetRepo.On("Update", ctx, mock.Anything).Return(nil).Once()
	logRepo.On("Create", ctx, mock.Anything).Return(assert.AnError).Once()

	service := services.NewAssetService(
		new(MockSiteRepository), new(MockUnitRepository), assetRepo, new(MockComponentRepository),
		services.WithAssetRelations(new(mockPipingClassRepository), logRepo),
	)
	after := "After"
	result, err := service.UpdateAsset(ctx, 1, 79, &request.UpdateAssetRequest{Description: &after}, 9)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	logRepo.AssertExpectations(t)
}
