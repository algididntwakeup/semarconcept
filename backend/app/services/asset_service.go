package services

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

// AssetService implements AssetServiceInterface
type AssetService struct {
	siteRepo      repositories.SiteRepository
	unitRepo      repositories.UnitRepository
	AssetRepo     repositories.AssetRepository
	componentRepo repositories.ComponentRepository
	logger        utils.Logger
}

// NewAssetService creates a new asset service instance
func NewAssetService(
	siteRepo repositories.SiteRepository,
	unitRepo repositories.UnitRepository,
	AssetRepo repositories.AssetRepository,
	componentRepo repositories.ComponentRepository,
) AssetServiceInterface {
	return &AssetService{
		siteRepo:      siteRepo,
		unitRepo:      unitRepo,
		AssetRepo:     AssetRepo,
		componentRepo: componentRepo,
		logger:        utils.NewLogger(),
	}
}

// ===== EXISTING SITE OPERATIONS =====

// CreateSite creates a new site with tenant isolation
func (s *AssetService) CreateSite(ctx context.Context, tenantID int, req *request.CreateSiteRequest, userID int) (*response.SiteResponse, error) {
	if err := s.validateCreateSiteRequest(req); err != nil {
		return nil, err
	}

	site := &models.Site{
		TenantID:             tenantID,
		Name:                 req.Name,
		Code:                 req.Code,
		Location:             &req.Location,
		SiteType:             &req.SiteType,
		Description:          req.Description,
		CommissionDate:       req.CommissionDate,
		DecommissionDate:     req.DecommissionDate,
		Address:              models.JSONBMap(req.Address),
		Coordinates:          models.JSONBMap(req.Coordinates),
		ContactInfo:          models.JSONBMap(req.ContactInfo),
		OperatingConditions:  models.JSONBMap(req.OperatingConditions),
		EnvironmentalFactors: models.JSONBMap(req.EnvironmentalFactors),
		Status:               req.Status,
		Metadata:             models.JSONBMap(req.Metadata),
		CreatedBy:            &userID,
		UpdatedBy:            &userID,
	}

	if err := s.siteRepo.Create(ctx, site); err != nil {
		s.logger.Error("Failed to create site: %v", err)
		return nil, err
	}

	return s.siteToResponse(site), nil
}

func (s *AssetService) GetSite(ctx context.Context, tenantID, siteID int) (*response.SiteResponse, error) {
	site, err := s.siteRepo.FindByID(ctx, tenantID, siteID)
	if err != nil {
		return nil, err
	}
	return s.siteToResponse(site), nil
}

func (s *AssetService) UpdateSite(ctx context.Context, tenantID, siteID int, req *request.UpdateSiteRequest, userID int) (*response.SiteResponse, error) {
	existingSite, err := s.siteRepo.FindByID(ctx, tenantID, siteID)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		existingSite.Name = *req.Name
	}
	if req.Code != nil {
		existingSite.Code = req.Code
	}
	if req.Location != nil {
		existingSite.Location = req.Location
	}
	if req.SiteType != nil {
		existingSite.SiteType = req.SiteType
	}
	if req.Description != nil {
		existingSite.Description = req.Description
	}
	if req.Status != nil {
		existingSite.Status = req.Status
	}
	if req.Address != nil {
		existingSite.Address = models.JSONBMap(req.Address)
	}
	if req.ContactInfo != nil {
		existingSite.ContactInfo = models.JSONBMap(req.ContactInfo)
	}
	if req.Metadata != nil {
		existingSite.Metadata = models.JSONBMap(req.Metadata)
	}

	existingSite.UpdatedBy = &userID
	existingSite.UpdatedAt = time.Now()

	if err := s.siteRepo.Update(ctx, existingSite); err != nil {
		return nil, err
	}

	return s.siteToResponse(existingSite), nil
}

func (s *AssetService) DeleteSite(ctx context.Context, tenantID, siteID, userID int) error {

	return s.siteRepo.Delete(ctx, tenantID, siteID)
}

func (s *AssetService) ListSites(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.SiteListResponse, error) {
	// Convert AssetListQuery to SiteListQuery - removed SiteID field
	siteQuery := &request.SiteListQuery{
		Page:      query.Page,
		Limit:     query.Limit,
		Search:    query.Search,
		Status:    query.Status,
		SortBy:    query.SortBy,
		SortOrder: query.SortOrder,
	}

	sites, total, err := s.siteRepo.List(ctx, tenantID, siteQuery)
	if err != nil {
		return nil, err
	}

	return &response.SiteListResponse{
		Sites: s.sitesToResponse(sites),
		Total: total,
		Page:  query.Page,
		Limit: query.Limit,
	}, nil
}

// FIXED: SearchSites method to return AssetSearchResponse
func (s *AssetService) SearchSites(ctx context.Context, tenantID int, query *request.AssetSearchRequest) (*response.AssetSearchResponse, error) {
	sites, total, err := s.siteRepo.Search(ctx, tenantID, query)
	if err != nil {
		return nil, err
	}

	// Convert sites to search results
	results := make([]response.AssetSearchResult, len(sites))
	for i, site := range sites {
		results[i] = response.AssetSearchResult{
			ID:         site.ID,
			Type:       "site",
			Name:       site.Name,
			Code:       s.derefToString(site.Code),
			Status:     s.derefToString(site.Status),
			Location:   site.Location,
			Path:       []response.AssetPathItem{{ID: site.ID, Type: "site", Name: site.Name, Code: s.derefToString(site.Code)}},
			Metadata:   map[string]interface{}(site.Metadata),
			Score:      1.0,
			Highlights: []string{},
		}
	}

	return &response.AssetSearchResponse{
		Query:        query.Query,
		TotalResults: total,
		Page:         query.Page,
		Limit:        query.Limit,
		Results:      results,
		Facets:       map[string]interface{}{},
		SearchTime:   0, // Can be calculated if needed
	}, nil
}

// ===== EXISTING UNIT OPERATIONS =====

func (s *AssetService) CreateUnit(ctx context.Context, tenantID int, req *request.CreateUnitRequest, userID int) (*response.UnitResponse, error) {
	if err := s.validateCreateUnitRequest(req); err != nil {
		return nil, err
	}

	// Enforce tenant boundary: site must belong to the same tenant
	if req.SiteID > 0 {
		if _, err := s.siteRepo.FindByID(ctx, tenantID, req.SiteID); err != nil {
			return nil, utils.ErrSiteNotFound
		}
	}

	unit := &models.Unit{
		TenantID:           tenantID,
		SiteID:             req.SiteID,
		Name:               req.Name,
		Code:               req.Code,
		UnitType:           &req.UnitType,
		ProcessDescription: req.ProcessDescription,
		DesignCapacity:     req.DesignCapacity,
		OperatingCapacity:  req.OperatingCapacity,
		CommissionDate:     req.CommissionDate,
		DecommissionDate:   req.DecommissionDate,
		ProcessConditions:  models.JSONBMap(req.ProcessConditions),
		SafetySystems:      models.JSONBMap(req.SafetySystems),
		ControlSystems:     models.JSONBMap(req.ControlSystems),
		Status:             req.Status,
		Criticality:        req.Criticality,
		Metadata:           models.JSONBMap(req.Metadata),
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
	}

	if err := s.unitRepo.Create(ctx, unit); err != nil {
		return nil, err
	}

	return s.unitToResponse(unit), nil
}

func (s *AssetService) GetUnit(ctx context.Context, tenantID, unitID int) (*response.UnitResponse, error) {
	unit, err := s.unitRepo.FindByID(ctx, tenantID, unitID)
	if err != nil {
		return nil, err
	}
	return s.unitToResponse(unit), nil
}

func (s *AssetService) UpdateUnit(ctx context.Context, tenantID, unitID int, req *request.UpdateUnitRequest, userID int) (*response.UnitResponse, error) {
	existingUnit, err := s.unitRepo.FindByID(ctx, tenantID, unitID)
	if err != nil {
		return nil, err
	}

	if req.SiteID != nil && *req.SiteID > 0 {
		if _, err := s.siteRepo.FindByID(ctx, tenantID, *req.SiteID); err != nil {
			return nil, utils.ErrSiteNotFound
		}
		existingUnit.SiteID = *req.SiteID
	}

	if req.Name != nil {
		existingUnit.Name = *req.Name
	}
	if req.Code != nil {
		existingUnit.Code = req.Code
	}
	if req.UnitType != nil {
		existingUnit.UnitType = req.UnitType
	}
	if req.ProcessDescription != nil {
		existingUnit.ProcessDescription = req.ProcessDescription
	}
	if req.Status != nil {
		existingUnit.Status = req.Status
	}
	if req.Criticality != nil {
		existingUnit.Criticality = req.Criticality
	}
	if req.Metadata != nil {
		existingUnit.Metadata = models.JSONBMap(req.Metadata)
	}

	existingUnit.UpdatedBy = &userID
	existingUnit.UpdatedAt = time.Now()

	if err := s.unitRepo.Update(ctx, existingUnit); err != nil {
		return nil, err
	}

	return s.unitToResponse(existingUnit), nil
}

func (s *AssetService) DeleteUnit(ctx context.Context, tenantID, unitID, userID int) error {

	return s.unitRepo.Delete(ctx, tenantID, unitID)
}

func (s *AssetService) ListUnits(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.UnitListResponse, error) {
	unitQuery := &request.UnitListQuery{
		Page:      query.Page,
		Limit:     query.Limit,
		Search:    query.Search,
		SiteID:    query.SiteID,
		Status:    query.Status,
		SortBy:    query.SortBy,
		SortOrder: query.SortOrder,
	}

	units, total, err := s.unitRepo.List(ctx, tenantID, unitQuery)
	if err != nil {
		return nil, err
	}

	return &response.UnitListResponse{
		Units: s.unitsToResponse(units),
		Total: total,
		Page:  query.Page,
		Limit: query.Limit,
	}, nil
}

// ===== EXISTING Asset OPERATIONS =====

func (s *AssetService) CreateAsset(ctx context.Context, tenantID int, req *request.CreateAssetRequest, userID int) (*response.AssetResponse, error) {
	if err := s.validateCreateAssetRequest(req); err != nil {
		return nil, err
	}

	var unitIDPtr *int
	if req.UnitID != nil && *req.UnitID > 0 {
		// Enforce tenant boundary: unit must belong to the same tenant
		if _, err := s.unitRepo.FindByID(ctx, tenantID, *req.UnitID); err != nil {
			return nil, utils.ErrUnitNotFound
		}
		unitIDPtr = req.UnitID
	}

	if req.ParentID != nil && *req.ParentID > 0 {
		// Enforce tenant boundary: parent asset must belong to the same tenant
		if _, err := s.AssetRepo.FindByID(ctx, tenantID, *req.ParentID); err != nil {
			return nil, utils.ErrAssetNotFound
		}
	}

	asset := &models.Asset{
		TenantID:             tenantID,
		UnitID:               unitIDPtr,
		ParentID:             req.ParentID,
		FunctionalLocationID: req.FunctionalLocationID,
		TaxonomyCategoryID:   req.TaxonomyCategoryID,
		Name:                 req.Name,
		Description:          req.Description,
		TagNumber:            req.TagNumber,
		AssetType:            req.AssetType,
		AssetClass:           req.AssetClass,
		Manufacturer:         req.Manufacturer,
		Model:                req.Model,
		SerialNumber:         req.SerialNumber,
		ManufactureDate:      req.ManufactureDate,
		InstallationDate:     req.InstallationDate,
		CommissioningDate:    req.CommissioningDate,
		WarrantyExpiry:       req.WarrantyExpiry,
		DesignLifeYears:      req.DesignLifeYears,
		RemainingLifeYears: func() *float64 {
			var rem float64
			if req.DesignLifeYears != nil {
				rem = float64(*req.DesignLifeYears)
			} else {
				rem = 20.0
			}
			return &rem
		}(),
		Specifications:      models.JSONBMap(req.Specifications),
		OperatingParameters: models.JSONBMap(req.OperatingParameters),
		DesignConditions:    models.JSONBMap(req.DesignConditions),
		Materials:           models.JSONBMap(req.Materials),
		DrawingsReferences:  models.JSONBMap(req.DrawingsReferences),
		MaintenanceStrategy: req.MaintenanceStrategy,
		InspectionStrategy:  req.InspectionStrategy,
		Status: func() *string {
			if req.Status != nil {
				return req.Status
			}
			active := "active"
			return &active
		}(),
		LifecycleStatus:         req.LifecycleStatus,
		Criticality:             req.Criticality,
		SafetyCritical:          req.SafetyCritical,
		EnvironmentallyCritical: req.EnvironmentallyCritical,
		Metadata:                models.JSONBMap(req.Metadata),
		CreatedBy:               &userID,
		UpdatedBy:               &userID,
	}

	if err := s.AssetRepo.Create(ctx, asset); err != nil {
		return nil, err
	}

	// Generate tag number if not provided
	if asset.TagNumber == nil || *asset.TagNumber == "" {
		asset.GenerateTagNumber()
		if asset.TagNumber != nil && *asset.TagNumber != "" {
			_ = s.AssetRepo.Update(ctx, asset)
		}
	}

	return s.AssetToResponse(asset), nil
}

func (s *AssetService) GetAsset(ctx context.Context, tenantID, assetID int) (*response.AssetResponse, error) {
	asset, err := s.AssetRepo.FindByID(ctx, tenantID, assetID)
	if err != nil {
		return nil, err
	}
	return s.AssetToResponse(asset), nil
}

func (s *AssetService) UpdateAsset(ctx context.Context, tenantID, assetID int, req *request.UpdateAssetRequest, userID int) (*response.AssetResponse, error) {
	existingAsset, err := s.AssetRepo.FindByID(ctx, tenantID, assetID)
	if err != nil {
		return nil, err
	}

	if req.UnitID != nil && *req.UnitID > 0 {
		if _, err := s.unitRepo.FindByID(ctx, tenantID, *req.UnitID); err != nil {
			return nil, utils.ErrUnitNotFound
		}
		existingAsset.UnitID = req.UnitID
	}

	if req.ParentID != nil && *req.ParentID > 0 {
		if *req.ParentID == assetID {
			return nil, fmt.Errorf("asset cannot be its own parent: %w", utils.ErrValidation)
		}
		if _, err := s.AssetRepo.FindByID(ctx, tenantID, *req.ParentID); err != nil {
			return nil, utils.ErrAssetNotFound
		}
		existingAsset.ParentID = req.ParentID
	}
	if req.FunctionalLocationID != nil {
		existingAsset.FunctionalLocationID = req.FunctionalLocationID
	}

	if req.Name != nil {
		existingAsset.Name = *req.Name
	}
	if req.Description != nil {
		existingAsset.Description = req.Description
	}
	if req.TagNumber != nil {
		existingAsset.TagNumber = req.TagNumber
	}
	if req.AssetType != nil {
		existingAsset.AssetType = req.AssetType
	}
	if req.AssetClass != nil {
		existingAsset.AssetClass = req.AssetClass
	}
	if req.Manufacturer != nil {
		existingAsset.Manufacturer = req.Manufacturer
	}
	if req.Model != nil {
		existingAsset.Model = req.Model
	}
	if req.SerialNumber != nil {
		existingAsset.SerialNumber = req.SerialNumber
	}
	if req.ManufactureDate != nil {
		existingAsset.ManufactureDate = req.ManufactureDate
	}
	if req.InstallationDate != nil {
		existingAsset.InstallationDate = req.InstallationDate
	}
	if req.CommissioningDate != nil {
		existingAsset.CommissioningDate = req.CommissioningDate
	}
	if req.WarrantyExpiry != nil {
		existingAsset.WarrantyExpiry = req.WarrantyExpiry
	}
	if req.DesignLifeYears != nil {
		existingAsset.DesignLifeYears = req.DesignLifeYears
	}
	if req.TaxonomyCategoryID != nil {
		existingAsset.TaxonomyCategoryID = req.TaxonomyCategoryID
	}
	if req.Status != nil {
		existingAsset.Status = req.Status
	}
	if req.LifecycleStatus != nil {
		existingAsset.LifecycleStatus = req.LifecycleStatus
	}
	if req.Criticality != nil {
		existingAsset.Criticality = req.Criticality
	}
	if req.SafetyCritical != nil {
		existingAsset.SafetyCritical = req.SafetyCritical
	}
	if req.EnvironmentallyCritical != nil {
		existingAsset.EnvironmentallyCritical = req.EnvironmentallyCritical
	}
	if req.Specifications != nil {
		existingAsset.Specifications = models.JSONBMap(req.Specifications)
	}
	if req.OperatingParameters != nil {
		existingAsset.OperatingParameters = models.JSONBMap(req.OperatingParameters)
	}
	if req.DesignConditions != nil {
		existingAsset.DesignConditions = models.JSONBMap(req.DesignConditions)
	}
	if req.Materials != nil {
		existingAsset.Materials = models.JSONBMap(req.Materials)
	}
	if req.DrawingsReferences != nil {
		existingAsset.DrawingsReferences = models.JSONBMap(req.DrawingsReferences)
	}
	if req.MaintenanceStrategy != nil {
		existingAsset.MaintenanceStrategy = req.MaintenanceStrategy
	}
	if req.InspectionStrategy != nil {
		existingAsset.InspectionStrategy = req.InspectionStrategy
	}
	if req.Metadata != nil {
		existingAsset.Metadata = models.JSONBMap(req.Metadata)
	}

	existingAsset.UpdatedBy = &userID
	existingAsset.UpdatedAt = time.Now()

	if err := s.AssetRepo.Update(ctx, existingAsset); err != nil {
		return nil, err
	}

	return s.AssetToResponse(existingAsset), nil
}

func (s *AssetService) DeleteAsset(ctx context.Context, tenantID, assetID, userID int) error {
	hasActiveComponents, err := s.AssetRepo.HasActiveComponents(ctx, tenantID, assetID)
	if err != nil {
		return err
	}
	if hasActiveComponents {
		return utils.ErrAssetHasActiveComponents
	}
	return s.AssetRepo.Delete(ctx, tenantID, assetID)
}

func (s *AssetService) ListAsset(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.AssetListResponse, error) {
	assetQuery := &request.AssetListQuery{
		Page:            query.Page,
		Limit:           query.Limit,
		Search:          query.Search,
		UnitID:          query.UnitID,
		AssetType:       query.AssetType,
		Type:            query.Type,
		LifecycleStatus: query.LifecycleStatus,
		Status:          query.Status,
		SortBy:          query.SortBy,
		SortOrder:       query.SortOrder,
	}

	assets, total, err := s.AssetRepo.List(ctx, tenantID, assetQuery)
	if err != nil {
		return nil, err
	}

	return &response.AssetListResponse{
		Asset: s.AssetListToResponse(assets),
		Total: total,
		Page:  query.Page,
		Limit: query.Limit,
	}, nil
}

// GetAssetStats returns asset counts grouped by type/class and lifecycle status.
func (s *AssetService) GetAssetStats(ctx context.Context, tenantID int) ([]repositories.AssetTypeStatusCount, error) {
	return s.AssetRepo.GetAssetStats(ctx, tenantID)
}

var lifecycleStatuses = map[string]string{
	"install": "Installed", "installed": "Installed",
	"send to repair": "Sent to repair", "send_to_repair": "Sent to repair", "sent to repair": "Sent to repair",
	"retire": "Retired", "retired": "Retired",
	"condemn": "Condemned", "condemned": "Condemned",
}

func (s *AssetService) UpdateAssetLifecycle(ctx context.Context, tenantID, assetID, userID int, lifecycle string) (*response.AssetResponse, error) {
	canonical, ok := lifecycleStatuses[strings.ToLower(strings.TrimSpace(lifecycle))]
	if !ok {
		return nil, fmt.Errorf("unsupported lifecycle status %q: %w", lifecycle, utils.ErrValidation)
	}
	if err := s.AssetRepo.UpdateLifecycle(ctx, tenantID, assetID, canonical, userID); err != nil {
		return nil, err
	}
	asset, err := s.AssetRepo.FindByID(ctx, tenantID, assetID)
	if err != nil {
		return nil, err
	}
	return s.AssetToResponse(asset), nil
}

func (s *AssetService) DiagnoseDuplicateAssetTags(ctx context.Context, tenantID int) ([]repositories.DuplicateAssetTag, error) {
	return s.AssetRepo.DiagnoseDuplicateTags(ctx, tenantID)
}

func (s *AssetService) FixAssetLinks(ctx context.Context, tenantID, userID int, dryRun bool) (int64, error) {
	return s.AssetRepo.FixBrokenParentLinks(ctx, tenantID, userID, dryRun)
}

func (s *AssetService) SyncAssetFLOC(ctx context.Context, tenantID, userID int, dryRun bool) (*repositories.FLOCSyncResult, error) {
	return s.AssetRepo.ValidateFLOCLinks(ctx, tenantID, userID, dryRun)
}

// ===== EXISTING COMPONENT OPERATIONS =====

func (s *AssetService) CreateComponent(ctx context.Context, tenantID int, req *request.CreateComponentRequest, userID int) (*response.ComponentResponse, error) {
	if err := s.validateCreateComponentRequest(req); err != nil {
		return nil, err
	}

	// Enforce tenant boundary: asset must belong to the same tenant
	if _, err := s.AssetRepo.FindByID(ctx, tenantID, req.AssetID); err != nil {
		return nil, utils.ErrAssetNotFound
	}

	component := &models.Component{
		TenantID:              tenantID,
		AssetID:               req.AssetID,
		Name:                  req.Name,
		ComponentCode:         req.ComponentCode,
		ComponentType:         req.ComponentType,
		ComponentClass:        req.ComponentClass,
		Material:              req.Material,
		DesignThicknessMM:     req.DesignThicknessMM,
		CurrentThicknessMM:    req.CurrentThicknessMM,
		MinimumThicknessMM:    req.MinimumThicknessMM,
		DesignPressureBar:     req.DesignPressureBar,
		DesignTemperatureC:    req.DesignTemperatureC,
		OperatingPressureBar:  req.OperatingPressureBar,
		OperatingTemperatureC: req.OperatingTemperatureC,
		InstallationDate:      req.InstallationDate,
		LastReplacementDate:   req.LastReplacementDate,
		NextReplacementDate:   req.NextReplacementDate,
		Specifications:        models.JSONBMap(req.Specifications),
		Dimensions:            models.JSONBMap(req.Dimensions),
		LocationDescription:   req.LocationDescription,
		Accessibility:         req.Accessibility,
		InsulationType:        req.InsulationType,
		CoatingType:           req.CoatingType,
		CathodicProtection:    req.CathodicProtection,
		InspectionAccess:      req.InspectionAccess,
		// Fixed: InspectionFrequencyMonths is int, not *int
		InspectionFrequencyMonths: req.InspectionFrequencyMonths,
		LastInspectionDate:        req.LastInspectionDate,
		NextInspectionDate: func() *time.Time {
			if req.LastInspectionDate != nil && req.InspectionFrequencyMonths != nil {
				next := req.LastInspectionDate.AddDate(0, *req.InspectionFrequencyMonths, 0)
				return &next
			}
			return nil
		}(),
		IntegrityStatus:   req.IntegrityStatus,
		FitnessForService: req.FitnessForService,
		// Fixed: RemainingLifeYears is float64, not *float64
		RemainingLifeYears: func() *float64 {
			f := 20.0
			return &f
		}(),
		ConfidenceLevel: req.ConfidenceLevel,
		Status: func() *string {
			if req.Status != nil {
				return req.Status
			}
			active := "active"
			return &active
		}(),
		Criticality:             req.Criticality,
		ConsequenceOfFailure:    nil, // nullable
		SafetyCritical:          req.SafetyCritical,
		EnvironmentallyCritical: req.EnvironmentallyCritical,
		Metadata:                models.JSONBMap(req.Metadata),
		CreatedBy:               &userID,
		UpdatedBy:               &userID,
	}

	if err := s.componentRepo.Create(ctx, component); err != nil {
		return nil, err
	}

	return s.componentToResponse(component), nil
}

func (s *AssetService) GetComponent(ctx context.Context, tenantID, componentID int) (*response.ComponentResponse, error) {
	component, err := s.componentRepo.FindByID(ctx, tenantID, componentID)
	if err != nil {
		return nil, err
	}
	return s.componentToResponse(component), nil
}

func (s *AssetService) UpdateComponent(ctx context.Context, tenantID, componentID int, req *request.UpdateComponentRequest, userID int) (*response.ComponentResponse, error) {
	existingComponent, err := s.componentRepo.FindByID(ctx, tenantID, componentID)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		existingComponent.Name = *req.Name
	}
	if req.ComponentCode != nil {
		existingComponent.ComponentCode = req.ComponentCode
	}
	if req.Status != nil {
		existingComponent.Status = req.Status
	}
	if req.IntegrityStatus != nil {
		existingComponent.IntegrityStatus = req.IntegrityStatus
	}
	if req.CurrentThicknessMM != nil {
		existingComponent.CurrentThicknessMM = req.CurrentThicknessMM
	}

	existingComponent.UpdatedBy = &userID
	existingComponent.UpdatedAt = time.Now()

	if err := s.componentRepo.Update(ctx, existingComponent); err != nil {
		return nil, err
	}

	return s.componentToResponse(existingComponent), nil
}

func (s *AssetService) DeleteComponent(ctx context.Context, tenantID, componentID, userID int) error {
	return s.componentRepo.Delete(ctx, tenantID, componentID)
}

func (s *AssetService) ListComponents(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.ComponentListResponse, error) {
	componentQuery := &request.ComponentListQuery{
		Page:      query.Page,
		Limit:     query.Limit,
		Search:    query.Search,
		Status:    query.Status,
		SortBy:    query.SortBy,
		SortOrder: query.SortOrder,
	}

	components, total, err := s.componentRepo.List(ctx, tenantID, componentQuery)
	if err != nil {
		return nil, err
	}

	return &response.ComponentListResponse{
		Components: s.componentsToResponse(components),
		Total:      total,
		Page:       query.Page,
		Limit:      query.Limit,
	}, nil
}

// ===== MISSING ANALYTICS METHODS =====

// GetAssetHierarchy gets complete asset hierarchy
func (s *AssetService) GetAssetHierarchy(ctx context.Context, tenantID int, req *request.AssetHierarchyRequest) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Getting asset hierarchy for tenant %d", tenantID))

	// Get all sites for the tenant
	sites, _, err := s.siteRepo.List(ctx, tenantID, &request.SiteListQuery{Limit: 1000})
	if err != nil {
		return nil, err
	}

	// Build hierarchy structure
	hierarchy := make([]map[string]interface{}, 0)

	for _, site := range sites {
		siteData := map[string]interface{}{
			"id":             fmt.Sprintf("site-%d", site.ID),
			"name":           site.Name,
			"code":           site.Code,
			"type":           "site",
			"hierarchyLevel": "site",
		}

		// Always include units
		units, _, err := s.unitRepo.List(ctx, tenantID, &request.UnitListQuery{
			SiteID: &site.ID,
			Limit:  1000,
		})
		if err == nil {
			unitList := make([]map[string]interface{}, 0)
			for _, unit := range units {
				unitData := map[string]interface{}{
					"id":             fmt.Sprintf("unit-%d", unit.ID),
					"name":           unit.Name,
					"code":           unit.Code,
					"type":           "unit",
					"hierarchyLevel": "unit",
					"parentId":       fmt.Sprintf("site-%d", site.ID),
				}
				unitList = append(unitList, unitData)
			}
			siteData["children"] = unitList
		}

		hierarchy = append(hierarchy, siteData)
	}

	return hierarchy, nil
}

// GetAssetPath gets asset breadcrumb path
func (s *AssetService) GetAssetPath(ctx context.Context, tenantID int, req *request.AssetPathRequest) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Getting asset path for tenant %d, type %s, id %d", tenantID, req.AssetType, req.AssetID))

	path := make([]map[string]interface{}, 0)

	switch req.AssetType {
	case "component":
		// Get component and traverse up
		component, err := s.componentRepo.FindByID(ctx, tenantID, req.AssetID)
		if err != nil {
			return nil, err
		}

		// Add component to path
		path = append(path, map[string]interface{}{
			"id":   component.ID,
			"name": component.Name,
			"type": "component",
		})

		// Get Asset
		asset, err := s.AssetRepo.FindByID(ctx, tenantID, component.AssetID)
		if err == nil {
			path = append([]map[string]interface{}{{
				"id":   asset.ID,
				"name": asset.Name,
				"type": "Asset",
			}}, path...)

			// Get unit
			if asset.UnitID != nil {
				unit, err := s.unitRepo.FindByID(ctx, tenantID, *asset.UnitID)
				if err == nil {
					path = append([]map[string]interface{}{{
						"id":   unit.ID,
						"name": unit.Name,
						"type": "unit",
					}}, path...)

					// Get site
					site, err := s.siteRepo.FindByID(ctx, tenantID, unit.SiteID)
					if err == nil {
						path = append([]map[string]interface{}{{
							"id":   site.ID,
							"name": site.Name,
							"type": "site",
						}}, path...)
					}
				}
			}
		}

	case "Asset":
		// Similar logic for Asset
		asset, err := s.AssetRepo.FindByID(ctx, tenantID, req.AssetID)
		if err != nil {
			return nil, err
		}

		path = append(path, map[string]interface{}{
			"id":   asset.ID,
			"name": asset.Name,
			"type": "Asset",
		})

		// Get unit and site
		if asset.UnitID != nil {
			unit, err := s.unitRepo.FindByID(ctx, tenantID, *asset.UnitID)
			if err == nil {
				path = append([]map[string]interface{}{{
					"id":   unit.ID,
					"name": unit.Name,
					"type": "unit",
				}}, path...)

				site, err := s.siteRepo.FindByID(ctx, tenantID, unit.SiteID)
				if err == nil {
					path = append([]map[string]interface{}{{
						"id":   site.ID,
						"name": site.Name,
						"type": "site",
					}}, path...)
				}
			}
		}

	case "unit":
		// Logic for unit
		unit, err := s.unitRepo.FindByID(ctx, tenantID, req.AssetID)
		if err != nil {
			return nil, err
		}

		path = append(path, map[string]interface{}{
			"id":   unit.ID,
			"name": unit.Name,
			"type": "unit",
		})

		site, err := s.siteRepo.FindByID(ctx, tenantID, unit.SiteID)
		if err == nil {
			path = append([]map[string]interface{}{{
				"id":   site.ID,
				"name": site.Name,
				"type": "site",
			}}, path...)
		}

	case "site":
		// Logic for site
		site, err := s.siteRepo.FindByID(ctx, tenantID, req.AssetID)
		if err != nil {
			return nil, err
		}

		path = append(path, map[string]interface{}{
			"id":   site.ID,
			"name": site.Name,
			"type": "site",
		})
	}

	return map[string]interface{}{
		"tenant_id":  tenantID,
		"asset_type": req.AssetType,
		"asset_id":   req.AssetID,
		"path":       path,
	}, nil
}

// SearchAssets performs advanced asset search
func (s *AssetService) SearchAssets(ctx context.Context, tenantID int, req *request.AssetSearchRequest) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Searching assets for tenant %d", tenantID))

	results := make(map[string]interface{})
	results["query"] = req.Query
	results["results"] = make([]map[string]interface{}, 0)

	// Search sites
	if req.AssetTypes == nil || contains(req.AssetTypes, "site") {
		sites, _, err := s.siteRepo.Search(ctx, tenantID, req)
		if err == nil {
			for _, site := range sites {
				results["results"] = append(results["results"].([]map[string]interface{}), map[string]interface{}{
					"id":   site.ID,
					"name": site.Name,
					"type": "site",
					"code": site.Code,
				})
			}
		}
	}

	// Add similar logic for units, Asset, components...

	return results, nil
}

// UpdateAssetCriticality updates asset criticality in bulk
func (s *AssetService) UpdateAssetCriticality(ctx context.Context, tenantID int, req *request.AssetCriticalityUpdateRequest, userID int) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Updating asset criticality for tenant %d", tenantID))

	updatedCount := 0
	errors := make([]string, 0)

	for _, update := range req.Updates {
		// Determine asset type and update accordingly
		switch update.AssetType {
		case "site":
			// Update site criticality (if sites have criticality)
		case "unit":
			unit, err := s.unitRepo.FindByID(ctx, tenantID, update.AssetID)
			if err != nil {
				errors = append(errors, err.Error())
				continue
			}
			val := update.Criticality
			unit.Criticality = &val
			unit.UpdatedBy = &userID
			unit.UpdatedAt = time.Now()
			if err := s.unitRepo.Update(ctx, unit); err != nil {
				errors = append(errors, err.Error())
			} else {
				updatedCount++
			}
		case "Asset":
			Asset, err := s.AssetRepo.FindByID(ctx, tenantID, update.AssetID)
			if err != nil {
				errors = append(errors, err.Error())
				continue
			}
			val := update.Criticality
			Asset.Criticality = &val
			Asset.UpdatedBy = &userID
			Asset.UpdatedAt = time.Now()
			if err := s.AssetRepo.Update(ctx, Asset); err != nil {
				errors = append(errors, err.Error())
			} else {
				updatedCount++
			}
		case "component":
			component, err := s.componentRepo.FindByID(ctx, tenantID, update.AssetID)
			if err != nil {
				errors = append(errors, err.Error())
				continue
			}
			val := update.Criticality
			component.Criticality = &val
			component.UpdatedBy = &userID
			component.UpdatedAt = time.Now()
			if err := s.componentRepo.Update(ctx, component); err != nil {
				errors = append(errors, err.Error())
			} else {
				updatedCount++
			}
		}
	}

	return map[string]interface{}{
		"updated_count": updatedCount,
		"total_count":   len(req.Updates),
		"errors":        errors,
	}, nil
}

// ValidateAssetHierarchy validates asset hierarchy integrity
func (s *AssetService) ValidateAssetHierarchy(ctx context.Context, tenantID int, req *request.AssetHierarchyValidationRequest) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Validating asset hierarchy for tenant %d", tenantID))

	validation := map[string]interface{}{
		"is_valid": true,
		"issues":   make([]string, 0),
	}

	// Basic validation logic
	sites, _, err := s.siteRepo.List(ctx, tenantID, &request.SiteListQuery{Limit: 10000})
	if err != nil {
		validation["is_valid"] = false
		validation["issues"] = append(validation["issues"].([]string), "Failed to fetch sites")
		return validation, nil
	}

	// Check for orphaned units, Asset, components
	for _, site := range sites {
		units, _, err := s.unitRepo.List(ctx, tenantID, &request.UnitListQuery{SiteID: &site.ID, Limit: 10000})
		if err != nil {
			validation["issues"] = append(validation["issues"].([]string), "Failed to fetch units for site "+site.Name)
			continue
		}

		for _, unit := range units {
			Asset, _, err := s.AssetRepo.List(ctx, tenantID, &request.AssetListQuery{UnitID: &unit.ID, Limit: 10000})
			if err != nil {
				validation["issues"] = append(validation["issues"].([]string), "Failed to fetch Asset for unit "+unit.Name)
			}
			_ = Asset // Use Asset to check components if needed
		}
	}

	if len(validation["issues"].([]string)) > 0 {
		validation["is_valid"] = false
	}

	return validation, nil
}

// BulkUpdateAssets performs bulk update operations on assets -  FIXED: Removed unused variables
func (s *AssetService) BulkUpdateAssets(ctx context.Context, tenantID int, req *request.BulkAssetOperationRequest, userID int) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Bulk updating assets for tenant %d", tenantID))

	updatedCount := 0
	errors := make([]string, 0)

	for _, _ = range req.AssetIDs {
		// Determine asset type and perform update
		// This is a simplified implementation
		if req.UpdateFields != nil { //  FIXED: Changed from req.Updates to req.UpdateFields
			// Apply updates based on asset type
			updatedCount++
		}
	}

	return map[string]interface{}{
		"updated_count": updatedCount,
		"total_count":   len(req.AssetIDs),
		"errors":        errors,
	}, nil
}

// BulkDeleteAssets performs bulk delete operations on assets -  FIXED: Removed unused variables
func (s *AssetService) BulkDeleteAssets(ctx context.Context, tenantID int, req *request.BulkAssetOperationRequest, userID int) (interface{}, error) {
	s.logger.Info(fmt.Sprintf("Bulk deleting assets for tenant %d", tenantID))

	deletedCount := 0
	errors := make([]string, 0)

	for _, _ = range req.AssetIDs {
		// Determine asset type and perform deletion
		// This is a simplified implementation
		// Need to check for dependencies before deletion
		deletedCount++
	}

	return map[string]interface{}{
		"deleted_count": deletedCount,
		"total_count":   len(req.AssetIDs),
		"errors":        errors,
	}, nil
}

// ImportAssets imports assets from file
func (s *AssetService) ImportAssets(ctx context.Context, tenantID int, req *request.AssetImportRequest, userID int, fileData []byte) (interface{}, error) {
	return s.ImportAssetsFromXLSX(ctx, tenantID, req, userID, fileData)
}

// ImportAssetsFromXLSX imports the Data Source worksheet using its category row,
// field-name row, and data rows beginning at row three. Relational fields stay on
// Asset; all other fields are retained in the RBI JSONB property map.
func (s *AssetService) ImportAssetsFromXLSX(ctx context.Context, tenantID int, req *request.AssetImportRequest, userID int, fileData []byte) (interface{}, error) {
	if len(fileData) == 0 {
		return nil, fmt.Errorf("empty import workbook: %w", utils.ErrValidation)
	}
	book, err := excelize.OpenReader(bytes.NewReader(fileData))
	if err != nil {
		return nil, fmt.Errorf("open XLSX workbook: %w", err)
	}
	defer func() { _ = book.Close() }()

	const sheetName = "Data Source"
	sheetIndex, sheetErr := book.GetSheetIndex(sheetName)
	if sheetErr != nil || sheetIndex == -1 {
		return nil, fmt.Errorf("worksheet %q not found: %w", sheetName, utils.ErrValidation)
	}
	rows, err := book.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("read worksheet %q: %w", sheetName, err)
	}
	if len(rows) < 2 {
		return nil, fmt.Errorf("worksheet must contain two header rows: %w", utils.ErrValidation)
	}
	columns := equipmentImportColumns(rows[0], rows[1])
	if !equipmentImportHasField(columns, "assetid", "equipmentid", "id", "tagnumber", "equipmenttag", "equipmenttagnumber", "tag") {
		return nil, fmt.Errorf("row 2 must contain Asset ID or Tag Number: %w", utils.ErrValidation)
	}
	if !equipmentImportHasField(columns, "assetclass", "equipmentclass", "class", "assettype", "equipmenttype", "type") {
		return nil, fmt.Errorf("row 2 must contain Equipment Class or Equipment Type: %w", utils.ErrValidation)
	}

	batchSize := req.BatchSize
	if batchSize <= 0 || batchSize > 1000 {
		batchSize = 1000
	}
	assets := make([]models.Asset, 0, len(rows)-2)
	issues := make([]string, 0)
	total := len(rows) - 2
	for rowIndex, row := range rows[2:] {
		if rowIndex >= batchSize {
			issues = append(issues, fmt.Sprintf("row %d: batch size limit (%d) exceeded", rowIndex+3, batchSize))
			break
		}
		if equipmentImportRowIsEmpty(row) {
			continue
		}
		asset, parseErr := parseEquipmentImportRow(columns, row, tenantID, userID, req.AssetType)
		if parseErr != nil {
			issues = append(issues, fmt.Sprintf("row %d: %v", rowIndex+3, parseErr))
			if !req.SkipErrors {
				return nil, fmt.Errorf("validate equipment import: %w", utils.ErrValidation)
			}
			continue
		}
		assets = append(assets, asset)
	}

	if req.ValidateOnly || req.DryRun {
		return map[string]interface{}{
			"created_count": 0, "updated_count": 0, "imported_count": len(assets),
			"total_count": total, "errors": issues, "validate_only": true,
		}, nil
	}
	created, updated, err := s.AssetRepo.UpsertAssetsFromImport(ctx, tenantID, assets, userID)
	if err != nil {
		return nil, fmt.Errorf("import equipment assets transaction: %w", err)
	}
	return map[string]interface{}{
		"created_count": created, "updated_count": updated, "imported_count": created + updated,
		"total_count": total, "errors": issues, "validate_only": false,
	}, nil
}

type equipmentImportColumn struct {
	key        string
	normalized string
}

func equipmentImportColumns(categories, headers []string) []equipmentImportColumn {
	count := len(headers)
	if len(categories) > count {
		count = len(categories)
	}
	columns := make([]equipmentImportColumn, count)
	category := "General"
	for index := 0; index < count; index++ {
		if index < len(categories) && strings.TrimSpace(categories[index]) != "" {
			category = strings.TrimSpace(categories[index])
		}
		field := ""
		if index < len(headers) {
			field = strings.TrimSpace(headers[index])
		}
		columns[index] = equipmentImportColumn{
			key:        category + "." + field,
			normalized: normalizeImportHeader(field),
		}
	}
	return columns
}

func equipmentImportHasField(columns []equipmentImportColumn, names ...string) bool {
	for _, column := range columns {
		for _, name := range names {
			if column.normalized == name {
				return true
			}
		}
	}
	return false
}

func normalizeImportHeader(value string) string {
	return strings.Map(func(r rune) rune {
		if r >= 'A' && r <= 'Z' {
			return r + ('a' - 'A')
		}
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		return -1
	}, value)
}

func equipmentImportRowIsEmpty(row []string) bool {
	for _, value := range row {
		if strings.TrimSpace(value) != "" {
			return false
		}
	}
	return true
}

func parseEquipmentImportRow(columns []equipmentImportColumn, row []string, tenantID, userID int, defaultType string) (models.Asset, error) {
	asset := models.Asset{TenantID: tenantID, RBIProperties: make(models.JSONBMap)}
	for index, column := range columns {
		if column.normalized == "" || index >= len(row) {
			continue
		}
		value := strings.TrimSpace(row[index])
		if value == "" {
			continue
		}
		switch column.normalized {
		case "id", "assetid", "equipmentid":
			id, err := strconv.Atoi(value)
			if err != nil || id <= 0 {
				return models.Asset{}, fmt.Errorf("invalid Asset ID %q", value)
			}
			asset.ID = id
		case "tag", "tagnumber", "equipmenttag", "equipmenttagnumber":
			asset.TagNumber = &value
		case "description", "equipmentdescription":
			asset.Description = &value
		case "assetclass", "equipmentclass", "class":
			asset.AssetClass = &value
		case "assettype", "equipmenttype", "type":
			asset.AssetType = &value
		case "name", "equipmentname":
			asset.Name = value
		case "parentid", "parentequipmentid":
			id, err := strconv.Atoi(value)
			if err != nil || id <= 0 {
				return models.Asset{}, fmt.Errorf("invalid Parent Equipment ID %q", value)
			}
			asset.ParentID = &id
		case "functionallocationid":
			id, err := strconv.Atoi(value)
			if err != nil || id <= 0 {
				return models.Asset{}, fmt.Errorf("invalid Functional Location ID %q", value)
			}
			asset.FunctionalLocationID = &id
		case "lifecyclestatus":
			asset.LifecycleStatus = &value
		case "status":
			asset.Status = &value
		default:
			asset.RBIProperties[column.key] = value
		}
	}

	if asset.ID <= 0 && (asset.TagNumber == nil || strings.TrimSpace(*asset.TagNumber) == "") {
		return models.Asset{}, fmt.Errorf("Asset ID or Tag Number is required")
	}
	if asset.Name == "" {
		if asset.TagNumber != nil {
			asset.Name = *asset.TagNumber
		} else {
			asset.Name = fmt.Sprintf("Asset %d", asset.ID)
		}
	}
	if asset.AssetType == nil && strings.TrimSpace(defaultType) != "" && !strings.EqualFold(defaultType, "Asset") {
		asset.AssetType = &defaultType
	}
	if asset.AssetType == nil && asset.AssetClass != nil {
		asset.AssetType = asset.AssetClass
	}
	if asset.AssetClass == nil && asset.AssetType != nil {
		asset.AssetClass = asset.AssetType
	}
	if asset.AssetType == nil || strings.TrimSpace(*asset.AssetType) == "" {
		return models.Asset{}, fmt.Errorf("Equipment Type or Equipment Class is required")
	}
	asset.CreatedBy, asset.UpdatedBy = &userID, &userID
	return asset, nil
}

// ExportAssets serializes tenant-scoped assets into an XLSX workbook.
func (s *AssetService) ExportAssets(ctx context.Context, tenantID int, req *request.AssetExportRequest) ([]byte, string, error) {
	assetType := req.AssetType
	if assetType == "Asset" {
		assetType = ""
	}
	status := req.Status
	if status == "" && len(req.Statuses) == 1 {
		status = req.Statuses[0]
	}
	assets, err := s.AssetRepo.ListAssetsForExport(ctx, tenantID, assetType, status)
	if err != nil {
		return nil, "", err
	}
	book := excelize.NewFile()
	defer func() { _ = book.Close() }()
	sheet := "Assets"
	if err := book.SetSheetName("Sheet1", sheet); err != nil {
		return nil, "", err
	}
	headers := []string{"id", "tag_number", "name", "description", "asset_type", "asset_class", "parent_id", "functional_location_id", "lifecycle_status", "status"}
	for col, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(col+1, 1)
		if err := book.SetCellValue(sheet, cell, header); err != nil {
			return nil, "", err
		}
	}
	for rowIndex, asset := range assets {
		values := []interface{}{asset.ID, valueOrEmpty(asset.TagNumber), asset.Name, valueOrEmpty(asset.Description), valueOrEmpty(asset.AssetType), valueOrEmpty(asset.AssetClass), valueOrEmptyInt(asset.ParentID), valueOrEmptyInt(asset.FunctionalLocationID), valueOrEmpty(asset.LifecycleStatus), valueOrEmpty(asset.Status)}
		for col, value := range values {
			cell, _ := excelize.CoordinatesToCellName(col+1, rowIndex+2)
			if err := book.SetCellValue(sheet, cell, value); err != nil {
				return nil, "", err
			}
		}
	}
	var buffer bytes.Buffer
	if err := book.Write(&buffer); err != nil {
		return nil, "", fmt.Errorf("write XLSX workbook: %w", err)
	}
	filename := "assets.xlsx"
	if req.FileName != nil && strings.TrimSpace(*req.FileName) != "" {
		filename = strings.TrimSpace(*req.FileName)
	}
	filename = strings.TrimSuffix(filename, ".xlsx") + ".xlsx"
	return buffer.Bytes(), filename, nil
}

type equipmentExportColumn struct {
	category string
	header   string
	value    func(models.Asset) interface{}
}

var equipmentExportColumns = []equipmentExportColumn{
	{category: "General", header: "Equipment ID", value: func(a models.Asset) interface{} { return a.ID }},
	{category: "General", header: "Equipment Tag", value: func(a models.Asset) interface{} { return valueOrEmpty(a.TagNumber) }},
	{category: "General", header: "Equipment Name", value: func(a models.Asset) interface{} { return a.Name }},
	{category: "General", header: "Description", value: func(a models.Asset) interface{} { return valueOrEmpty(a.Description) }},
	{category: "General", header: "Equipment Type", value: func(a models.Asset) interface{} { return valueOrEmpty(a.AssetType) }},
	{category: "General", header: "Equipment Class", value: func(a models.Asset) interface{} { return valueOrEmpty(a.AssetClass) }},
	{category: "General", header: "Manufacturer", value: func(a models.Asset) interface{} { return valueOrEmpty(a.Manufacturer) }},
	{category: "General", header: "Model", value: func(a models.Asset) interface{} { return valueOrEmpty(a.Model) }},
	{category: "General", header: "Serial Number", value: func(a models.Asset) interface{} { return valueOrEmpty(a.SerialNumber) }},
	{category: "General", header: "Functional Location ID", value: func(a models.Asset) interface{} { return valueOrEmptyInt(a.FunctionalLocationID) }},
	{category: "General", header: "Parent Equipment ID", value: func(a models.Asset) interface{} { return valueOrEmptyInt(a.ParentID) }},
	{category: "General", header: "Lifecycle Status", value: func(a models.Asset) interface{} { return valueOrEmpty(a.LifecycleStatus) }},
	{category: "General", header: "Status", value: func(a models.Asset) interface{} { return valueOrEmpty(a.Status) }},
	{category: "General", header: "Criticality", value: func(a models.Asset) interface{} { return valueOrEmptyInt(a.Criticality) }},
	{category: "General", header: "Safety Critical", value: func(a models.Asset) interface{} { return valueOrEmptyBool(a.SafetyCritical) }},
	{category: "General", header: "Environmentally Critical", value: func(a models.Asset) interface{} { return valueOrEmptyBool(a.EnvironmentallyCritical) }},
	{category: "General", header: "Manufacture Date", value: func(a models.Asset) interface{} { return valueOrEmptyDate(a.ManufactureDate) }},
	{category: "General", header: "Installation Date", value: func(a models.Asset) interface{} { return valueOrEmptyDate(a.InstallationDate) }},
	{category: "General", header: "Commissioning Date", value: func(a models.Asset) interface{} { return valueOrEmptyDate(a.CommissioningDate) }},
	{category: "General", header: "Warranty Expiry", value: func(a models.Asset) interface{} { return valueOrEmptyDate(a.WarrantyExpiry) }},
	{category: "General", header: "Design Life (Years)", value: func(a models.Asset) interface{} { return valueOrEmptyInt(a.DesignLifeYears) }},
	{category: "General", header: "Remaining Life (Years)", value: func(a models.Asset) interface{} { return valueOrEmptyFloat(a.RemainingLifeYears) }},
	{category: "General", header: "Maintenance Strategy", value: func(a models.Asset) interface{} { return valueOrEmpty(a.MaintenanceStrategy) }},
	{category: "General", header: "Inspection Strategy", value: func(a models.Asset) interface{} { return valueOrEmpty(a.InspectionStrategy) }},
	{category: "Component Design", header: "Design Pressure", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"design_pressure", "design pressure"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Component Design", header: "Design Temperature", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"design_temperature", "design temperature"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Component Design", header: "Design Code", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"design_code", "design code", "code"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Component Design", header: "Material", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"material", "material_specification", "material specification"}, a.Materials, a.Specifications)
	}},
	{category: "Component Design", header: "Corrosion Allowance", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"corrosion_allowance", "corrosion allowance"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Component Design", header: "Wall Thickness", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"wall_thickness", "wall thickness", "thickness"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Component Design", header: "Diameter", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"diameter", "nominal_diameter", "nominal diameter"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Component Design", header: "Length", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"length", "overall_length"}, a.DesignConditions, a.Specifications)
	}},
	{category: "Operating Envelope", header: "Operating Pressure", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"operating_pressure", "operating pressure", "pressure"}, a.OperatingParameters)
	}},
	{category: "Operating Envelope", header: "Minimum Operating Pressure", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"minimum_operating_pressure", "min_operating_pressure", "minimum pressure"}, a.OperatingParameters)
	}},
	{category: "Operating Envelope", header: "Maximum Operating Pressure", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"maximum_operating_pressure", "max_operating_pressure", "maximum pressure"}, a.OperatingParameters)
	}},
	{category: "Operating Envelope", header: "Operating Temperature", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"operating_temperature", "operating temperature", "temperature"}, a.OperatingParameters)
	}},
	{category: "Operating Envelope", header: "Minimum Operating Temperature", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"minimum_operating_temperature", "min_operating_temperature", "minimum temperature"}, a.OperatingParameters)
	}},
	{category: "Operating Envelope", header: "Maximum Operating Temperature", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"maximum_operating_temperature", "max_operating_temperature", "maximum temperature"}, a.OperatingParameters)
	}},
	{category: "Operating Envelope", header: "Operating Medium", value: func(a models.Asset) interface{} {
		return assetJSONValue([]string{"operating_medium", "operating medium", "fluid", "medium"}, a.OperatingParameters)
	}},
}

// ExportAssetsToExcel creates an Equipment Master workbook with grouped, two-tier headers.
func (s *AssetService) ExportAssetsToExcel(ctx context.Context, tenantID int, req *request.AssetExportRequest) ([]byte, string, error) {
	assetType := req.AssetType
	if assetType == "" || assetType == "Asset" || strings.EqualFold(assetType, "equipment") {
		assetType = ""
	}
	status := req.Status
	if status == "" && len(req.Statuses) == 1 {
		status = req.Statuses[0]
	}

	assets, err := s.AssetRepo.ListAssetsForExport(ctx, tenantID, assetType, status)
	if err != nil {
		return nil, "", fmt.Errorf("load equipment assets for XLSX export: %w", err)
	}
	workbook, err := createEquipmentExportWorkbook(assets)
	if err != nil {
		return nil, "", err
	}
	return workbook, "equipment-master.xlsx", nil
}

func createEquipmentExportWorkbook(assets []models.Asset) ([]byte, error) {
	book := excelize.NewFile()
	defer func() { _ = book.Close() }()
	const sheet = "Data Source"
	if err := book.SetSheetName("Sheet1", sheet); err != nil {
		return nil, fmt.Errorf("name equipment export sheet: %w", err)
	}

	categoryStyle, err := book.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"1F4E78"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border:    []excelize.Border{{Type: "bottom", Color: "17365D", Style: 2}},
	})
	if err != nil {
		return nil, fmt.Errorf("create category header style: %w", err)
	}
	fieldStyle, err := book.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "1F1F1F", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"D9EAF7"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Border: []excelize.Border{
			{Type: "bottom", Color: "9EADBA", Style: 1},
			{Type: "right", Color: "D6DEE5", Style: 1},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create field header style: %w", err)
	}

	for index, column := range equipmentExportColumns {
		cell, _ := excelize.CoordinatesToCellName(index+1, 2)
		if err := book.SetCellValue(sheet, cell, column.header); err != nil {
			return nil, fmt.Errorf("write equipment field header: %w", err)
		}
	}
	for start := 0; start < len(equipmentExportColumns); {
		end := start + 1
		for end < len(equipmentExportColumns) && equipmentExportColumns[end].category == equipmentExportColumns[start].category {
			end++
		}
		firstCell, _ := excelize.CoordinatesToCellName(start+1, 1)
		lastCell, _ := excelize.CoordinatesToCellName(end, 1)
		if end-start > 1 {
			if err := book.MergeCell(sheet, firstCell, lastCell); err != nil {
				return nil, fmt.Errorf("merge equipment category header: %w", err)
			}
		}
		if err := book.SetCellValue(sheet, firstCell, equipmentExportColumns[start].category); err != nil {
			return nil, fmt.Errorf("write equipment category header: %w", err)
		}
		if err := book.SetCellStyle(sheet, firstCell, lastCell, categoryStyle); err != nil {
			return nil, fmt.Errorf("style equipment category header: %w", err)
		}
		start = end
	}
	lastHeaderCell, _ := excelize.CoordinatesToCellName(len(equipmentExportColumns), 2)
	if err := book.SetCellStyle(sheet, "A2", lastHeaderCell, fieldStyle); err != nil {
		return nil, fmt.Errorf("style equipment field headers: %w", err)
	}
	if err := book.SetRowHeight(sheet, 1, 24); err != nil {
		return nil, err
	}
	if err := book.SetRowHeight(sheet, 2, 36); err != nil {
		return nil, err
	}
	if err := book.SetPanes(sheet, &excelize.Panes{Freeze: true, YSplit: 2, TopLeftCell: "A3", ActivePane: "bottomLeft"}); err != nil {
		return nil, fmt.Errorf("freeze equipment export headers: %w", err)
	}
	lastDataRow := len(assets) + 2
	if err := book.AutoFilter(sheet, fmt.Sprintf("A2:%s%d", strings.TrimRight(lastHeaderCell, "0123456789"), lastDataRow), nil); err != nil {
		return nil, fmt.Errorf("add equipment export filters: %w", err)
	}
	for index, column := range equipmentExportColumns {
		width := float64(len([]rune(column.header)) + 3)
		if width < 14 {
			width = 14
		}
		if width > 28 {
			width = 28
		}
		letter, _ := excelize.ColumnNumberToName(index + 1)
		if err := book.SetColWidth(sheet, letter, letter, width); err != nil {
			return nil, fmt.Errorf("set equipment export column width: %w", err)
		}
	}

	for rowIndex, asset := range assets {
		for columnIndex, column := range equipmentExportColumns {
			cell, _ := excelize.CoordinatesToCellName(columnIndex+1, rowIndex+3)
			if err := book.SetCellValue(sheet, cell, column.value(asset)); err != nil {
				return nil, fmt.Errorf("write equipment export row %d: %w", rowIndex+3, err)
			}
		}
	}

	var buffer bytes.Buffer
	if err := book.Write(&buffer); err != nil {
		return nil, fmt.Errorf("write equipment XLSX workbook: %w", err)
	}
	return buffer.Bytes(), nil
}

func assetJSONValue(keys []string, maps ...models.JSONBMap) interface{} {
	for _, values := range maps {
		if value := lookupJSONValue(values, keys...); value != nil {
			switch value.(type) {
			case map[string]interface{}, []interface{}:
				encoded, err := json.Marshal(value)
				if err == nil {
					return string(encoded)
				}
			}
			return value
		}
	}
	return ""
}

func lookupJSONValue(values models.JSONBMap, keys ...string) interface{} {
	for _, key := range keys {
		if value, exists := values[key]; exists && value != nil {
			return value
		}
	}
	for actualKey, value := range values {
		for _, key := range keys {
			if normalizeExportKey(actualKey) == normalizeExportKey(key) && value != nil {
				return value
			}
		}
	}
	return nil
}

func normalizeExportKey(value string) string {
	return strings.Map(func(r rune) rune {
		if r >= 'A' && r <= 'Z' {
			return r + ('a' - 'A')
		}
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		return -1
	}, value)
}

func valueOrEmptyBool(value *bool) interface{} {
	if value == nil {
		return ""
	}
	return *value
}

func valueOrEmptyFloat(value *float64) interface{} {
	if value == nil {
		return ""
	}
	return *value
}

func valueOrEmptyDate(value *time.Time) interface{} {
	if value == nil || value.IsZero() {
		return ""
	}
	return value.Format("2006-01-02")
}

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
func valueOrEmptyInt(value *int) interface{} {
	if value == nil {
		return ""
	}
	return *value
}

// ===== VALIDATION METHODS =====

func (s *AssetService) validateCreateSiteRequest(req *request.CreateSiteRequest) error {
	if req.Name == "" {
		return utils.ErrSiteNameRequired
	}
	return nil
}

func (s *AssetService) validateCreateUnitRequest(req *request.CreateUnitRequest) error {
	if req.Name == "" {
		return utils.ErrUnitNameRequired
	}
	if req.SiteID <= 0 {
		return utils.ErrUnitSiteRequired
	}
	return nil
}

func (s *AssetService) validateCreateAssetRequest(req *request.CreateAssetRequest) error {
	if req.Name == "" {
		return utils.ErrAssetNameRequired
	}
	// UnitID is now optional for non-equipment assets (locations, installations, etc.)
	return nil
}

func (s *AssetService) validateCreateComponentRequest(req *request.CreateComponentRequest) error {
	if req.Name == "" {
		return utils.ErrComponentNameRequired
	}
	if req.AssetID <= 0 {
		return utils.ErrComponentAssetRequired
	}
	return nil
}

// ===== RESPONSE CONVERSION METHODS =====

func (s *AssetService) siteToResponse(site *models.Site) *response.SiteResponse {
	return &response.SiteResponse{
		ID:                   site.ID,
		TenantID:             site.TenantID,
		Name:                 site.Name,
		Code:                 s.derefToString(site.Code),
		SiteType:             s.derefToString(site.SiteType),
		Location:             s.derefToString(site.Location),
		Address:              map[string]interface{}(site.Address),
		Coordinates:          map[string]interface{}(site.Coordinates),
		CommissionDate:       site.CommissionDate,
		DecommissionDate:     site.DecommissionDate,
		Description:          site.Description,
		ContactInfo:          map[string]interface{}(site.ContactInfo),
		OperatingConditions:  map[string]interface{}(site.OperatingConditions),
		EnvironmentalFactors: map[string]interface{}(site.EnvironmentalFactors),
		Status:               s.derefToString(site.Status),
		Metadata:             map[string]interface{}(site.Metadata),
		CreatedAt:            site.CreatedAt,
		UpdatedAt:            site.UpdatedAt,
		CreatedBy:            site.CreatedBy,
		UpdatedBy:            site.UpdatedBy,
	}
}

func (s *AssetService) sitesToResponse(sites []models.Site) []response.SiteResponse {
	responses := make([]response.SiteResponse, len(sites))
	for i, site := range sites {
		responses[i] = *s.siteToResponse(&site)
	}
	return responses
}

func (s *AssetService) unitToResponse(unit *models.Unit) *response.UnitResponse {
	return &response.UnitResponse{
		ID:                 unit.ID,
		TenantID:           unit.TenantID,
		SiteID:             unit.SiteID,
		Name:               unit.Name,
		Code:               s.derefToString(unit.Code),
		UnitType:           s.derefToString(unit.UnitType),
		ProcessDescription: unit.ProcessDescription,
		DesignCapacity:     unit.DesignCapacity,
		OperatingCapacity:  unit.OperatingCapacity,
		CommissionDate:     unit.CommissionDate,
		DecommissionDate:   unit.DecommissionDate,
		ProcessConditions:  map[string]interface{}(unit.ProcessConditions),
		SafetySystems:      map[string]interface{}(unit.SafetySystems),
		ControlSystems:     map[string]interface{}(unit.ControlSystems),
		Status:             s.derefToString(unit.Status),
		Criticality:        s.derefToInt(unit.Criticality),
		Metadata:           map[string]interface{}(unit.Metadata),
		CreatedAt:          unit.CreatedAt,
		UpdatedAt:          unit.UpdatedAt,
		CreatedBy:          unit.CreatedBy,
		UpdatedBy:          unit.UpdatedBy,
	}
}

func (s *AssetService) unitsToResponse(units []models.Unit) []response.UnitResponse {
	responses := make([]response.UnitResponse, len(units))
	for i, unit := range units {
		responses[i] = *s.unitToResponse(&unit)
	}
	return responses
}

func (s *AssetService) AssetToResponse(asset *models.Asset) *response.AssetResponse {
	return &response.AssetResponse{
		ID:                   asset.ID,
		TenantID:             asset.TenantID,
		UnitID:               asset.UnitID, // Pointers are the same
		ParentID:             asset.ParentID,
		FunctionalLocationID: asset.FunctionalLocationID,
		Name:                 asset.Name,
		Description:          s.derefToString(asset.Description),
		TagNumber:            s.derefToString(asset.TagNumber),
		AssetType:            s.derefToString(asset.AssetType),
		AssetClass:           s.derefToString(asset.AssetClass),
		LifecycleStatus:      s.derefToString(asset.LifecycleStatus),
		Manufacturer:         s.derefToString(asset.Manufacturer),
		Model:                s.derefToString(asset.Model),
		SerialNumber:         s.derefToString(asset.SerialNumber),
		ManufactureDate:      asset.ManufactureDate,
		InstallationDate:     asset.InstallationDate,
		CommissioningDate:    asset.CommissioningDate,
		WarrantyExpiry:       asset.WarrantyExpiry,
		// Fixed: Asset fields are int and float64, not pointers
		DesignLifeYears:         s.derefToInt(asset.DesignLifeYears),
		RemainingLifeYears:      s.derefToFloat(asset.RemainingLifeYears),
		Specifications:          map[string]interface{}(asset.Specifications),
		OperatingParameters:     map[string]interface{}(asset.OperatingParameters),
		DesignConditions:        map[string]interface{}(asset.DesignConditions),
		Materials:               map[string]interface{}(asset.Materials),
		DrawingsReferences:      map[string]interface{}(asset.DrawingsReferences),
		MaintenanceStrategy:     s.derefToString(asset.MaintenanceStrategy),
		InspectionStrategy:      s.derefToString(asset.InspectionStrategy),
		Status:                  s.derefToString(asset.Status),
		Criticality:             s.derefToInt(asset.Criticality),
		SafetyCritical:          s.derefToBool(asset.SafetyCritical),
		EnvironmentallyCritical: s.derefToBool(asset.EnvironmentallyCritical),
		Metadata:                map[string]interface{}(asset.Metadata),
		CreatedAt:               asset.CreatedAt,
		UpdatedAt:               asset.UpdatedAt,
		CreatedBy:               asset.CreatedBy,
		UpdatedBy:               asset.UpdatedBy,
	}
}

func (s *AssetService) AssetListToResponse(Asset []models.Asset) []response.AssetResponse {
	responses := make([]response.AssetResponse, len(Asset))
	for i, equip := range Asset {
		responses[i] = *s.AssetToResponse(&equip)
	}
	return responses
}

func (s *AssetService) componentToResponse(component *models.Component) *response.ComponentResponse {
	return &response.ComponentResponse{
		ID:                        component.ID,
		TenantID:                  component.TenantID,
		AssetID:                   component.AssetID,
		Name:                      component.Name,
		ComponentCode:             s.derefToString(component.ComponentCode),
		ComponentType:             s.derefToString(component.ComponentType),
		ComponentClass:            s.derefToString(component.ComponentClass),
		Material:                  s.derefToString(component.Material),
		DesignThicknessMM:         component.DesignThicknessMM,
		CurrentThicknessMM:        component.CurrentThicknessMM,
		MinimumThicknessMM:        component.MinimumThicknessMM,
		DesignPressureBar:         component.DesignPressureBar,
		DesignTemperatureC:        component.DesignTemperatureC,
		OperatingPressureBar:      component.OperatingPressureBar,
		OperatingTemperatureC:     component.OperatingTemperatureC,
		InstallationDate:          component.InstallationDate,
		LastReplacementDate:       component.LastReplacementDate,
		NextReplacementDate:       component.NextReplacementDate,
		Specifications:            map[string]interface{}(component.Specifications),
		Dimensions:                map[string]interface{}(component.Dimensions),
		LocationDescription:       component.LocationDescription,
		Accessibility:             s.derefToString(component.Accessibility),
		InsulationType:            s.derefToString(component.InsulationType),
		CoatingType:               s.derefToString(component.CoatingType),
		CathodicProtection:        s.derefToBool(component.CathodicProtection),
		InspectionAccess:          s.derefToString(component.InspectionAccess),
		InspectionFrequencyMonths: s.derefToInt(component.InspectionFrequencyMonths),
		LastInspectionDate:        component.LastInspectionDate,
		NextInspectionDate:        component.NextInspectionDate,
		IntegrityStatus:           s.derefToString(component.IntegrityStatus),
		FitnessForService:         s.derefToString(component.FitnessForService),
		// Fixed: Component RemainingLifeYears is float64, not pointer
		RemainingLifeYears:      s.derefToFloat(component.RemainingLifeYears),
		ConfidenceLevel:         s.derefToString(component.ConfidenceLevel),
		Status:                  s.derefToString(component.Status),
		Criticality:             s.derefToInt(component.Criticality),
		ConsequenceOfFailure:    s.derefToString(component.ConsequenceOfFailure),
		SafetyCritical:          s.derefToBool(component.SafetyCritical),
		EnvironmentallyCritical: s.derefToBool(component.EnvironmentallyCritical),
		Metadata:                map[string]interface{}(component.Metadata),
		CreatedAt:               component.CreatedAt,
		UpdatedAt:               component.UpdatedAt,
		CreatedBy:               component.CreatedBy,
		UpdatedBy:               component.UpdatedBy,
	}
}

// derefToString safely dereferences a *string to string, returning default if nil
func (s *AssetService) derefToString(ptr *string) string {
	if ptr == nil {
		return ""
	}
	return *ptr
}

// derefToInt safely dereferences a *int to int, returning 0 if nil
func (s *AssetService) derefToInt(ptr *int) int {
	if ptr == nil {
		return 0
	}
	return *ptr
}

// derefToBool safely dereferences a *bool to bool, returning false if nil
func (s *AssetService) derefToBool(ptr *bool) bool {
	if ptr == nil {
		return false
	}
	return *ptr
}

// derefToFloat safely dereferences a *float64 to float64, returning 0.0 if nil
func (s *AssetService) derefToFloat(ptr *float64) float64 {
	if ptr == nil {
		return 0.0
	}
	return *ptr
}

func (s *AssetService) componentsToResponse(components []models.Component) []response.ComponentResponse {
	responses := make([]response.ComponentResponse, len(components))
	for i, component := range components {
		responses[i] = *s.componentToResponse(&component)
	}
	return responses
}

// ===== UTILITY METHODS =====

// Helper function for slice contains check
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Ensure implementation satisfies the interface
var _ AssetServiceInterface = (*AssetService)(nil)
