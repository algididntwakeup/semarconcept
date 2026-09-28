// platform/backend/app/services/asset_service_interface.go

package services

import (
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"context"
)

// AssetServiceInterface - EXACT interface matching your AssetService
type AssetServiceInterface interface {
	// Component operations - EXACT from your error message
	CreateComponent(ctx context.Context, tenantID int, req *request.CreateComponentRequest, userID int) (*response.ComponentResponse, error)
	GetComponent(ctx context.Context, tenantID int, componentID int) (*response.ComponentResponse, error)
	UpdateComponent(ctx context.Context, tenantID int, componentID int, req *request.UpdateComponentRequest, userID int) (*response.ComponentResponse, error)
	DeleteComponent(ctx context.Context, tenantID int, componentID int, userID int) error
	ListComponents(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.ComponentListResponse, error)

	// Site operations - based on component pattern
	CreateSite(ctx context.Context, tenantID int, req *request.CreateSiteRequest, userID int) (*response.SiteResponse, error)
	GetSite(ctx context.Context, tenantID int, siteID int) (*response.SiteResponse, error)
	UpdateSite(ctx context.Context, tenantID int, siteID int, req *request.UpdateSiteRequest, userID int) (*response.SiteResponse, error)
	DeleteSite(ctx context.Context, tenantID int, siteID int, userID int) error
	ListSites(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.SiteListResponse, error)
	SearchSites(ctx context.Context, tenantID int, query *request.AssetSearchRequest) (*response.AssetSearchResponse, error)

	// Unit operations - based on component pattern
	CreateUnit(ctx context.Context, tenantID int, req *request.CreateUnitRequest, userID int) (*response.UnitResponse, error)
	GetUnit(ctx context.Context, tenantID int, unitID int) (*response.UnitResponse, error)
	UpdateUnit(ctx context.Context, tenantID int, unitID int, req *request.UpdateUnitRequest, userID int) (*response.UnitResponse, error)
	DeleteUnit(ctx context.Context, tenantID int, unitID int, userID int) error
	ListUnits(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.UnitListResponse, error)

	// Asset operations - based on component pattern
	CreateAsset(ctx context.Context, tenantID int, req *request.CreateAssetRequest, userID int) (*response.AssetResponse, error)
	GetAsset(ctx context.Context, tenantID int, AssetID int) (*response.AssetResponse, error)
	UpdateAsset(ctx context.Context, tenantID int, AssetID int, req *request.UpdateAssetRequest, userID int) (*response.AssetResponse, error)
	DeleteAsset(ctx context.Context, tenantID int, AssetID int, userID int) error
	ListAsset(ctx context.Context, tenantID int, query *request.AssetListQuery) (*response.AssetListResponse, error)
	GetAssetStats(ctx context.Context, tenantID int) ([]repositories.AssetTypeStatusCount, error)
	UpdateAssetLifecycle(ctx context.Context, tenantID, assetID, userID int, lifecycle string) (*response.AssetResponse, error)
	DiagnoseDuplicateAssetTags(ctx context.Context, tenantID int) ([]repositories.DuplicateAssetTag, error)
	FixAssetLinks(ctx context.Context, tenantID, userID int, dryRun bool) (int64, error)
	SyncAssetFLOC(ctx context.Context, tenantID, userID int, dryRun bool) (*repositories.FLOCSyncResult, error)

	// Hierarchy operations - these might not exist in your service, add only if needed
	GetAssetHierarchy(ctx context.Context, tenantID int, req *request.AssetHierarchyRequest) (interface{}, error)
	GetAssetPath(ctx context.Context, tenantID int, req *request.AssetPathRequest) (interface{}, error)
	ValidateAssetHierarchy(ctx context.Context, tenantID int, req *request.AssetHierarchyValidationRequest) (interface{}, error)
	SearchAssets(ctx context.Context, tenantID int, req *request.AssetSearchRequest) (interface{}, error)
	UpdateAssetCriticality(ctx context.Context, tenantID int, req *request.AssetCriticalityUpdateRequest, userID int) (interface{}, error)
	BulkUpdateAssets(ctx context.Context, tenantID int, req *request.BulkAssetOperationRequest, userID int) (interface{}, error)
	BulkDeleteAssets(ctx context.Context, tenantID int, req *request.BulkAssetOperationRequest, userID int) (interface{}, error)
	ImportAssets(ctx context.Context, tenantID int, req *request.AssetImportRequest, userID int, fileData []byte) (interface{}, error)
	ExportAssets(ctx context.Context, tenantID int, req *request.AssetExportRequest) ([]byte, string, error)
}
