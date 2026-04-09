// platform/backend/app/api/handlers/asset_handler.go

package handlers

import (
	"backend/app/models/request"
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// AssetHandler handles HTTP requests for asset management operations
type AssetHandler struct {
	assetService     services.AssetServiceInterface
	analyticsService services.AnalyticsServiceInterface
}

// NewAssetHandler creates a new asset handler instance
func NewAssetHandler(assetService services.AssetServiceInterface, analyticsService services.AnalyticsServiceInterface) *AssetHandler {
	return &AssetHandler{
		assetService:     assetService,
		analyticsService: analyticsService,
	}
}

// ===== SITE HANDLERS =====

// CreateSite creates a new site
func (h *AssetHandler) CreateSite(c *gin.Context) {
	// Get tenant and user context
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	var req request.CreateSiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate request
	if err := utils.ValidateStruct(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ValidationErrorResponse(err))
		return
	}

	// Create site
	site, err := h.assetService.CreateSite(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to create site: %v", err)
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create site", ""))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("Site created successfully", site))
}

// GetSite retrieves a specific site
func (h *AssetHandler) GetSite(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse site ID
	siteIDParam := c.Param("id")
	siteID, err := strconv.Atoi(siteIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid site ID", ""))
		return
	}

	// Get site
	site, err := h.assetService.GetSite(c.Request.Context(), tenantID, siteID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Site not found", ""))
			return
		}
		utils.LogErrorf("Failed to get site: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve site", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Site retrieved successfully", site))
}

// UpdateSite updates an existing site
func (h *AssetHandler) UpdateSite(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	// Parse site ID
	siteIDParam := c.Param("id")
	siteID, err := strconv.Atoi(siteIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid site ID", ""))
		return
	}

	// Parse request
	var req request.UpdateSiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Update site
	site, err := h.assetService.UpdateSite(c.Request.Context(), tenantID, siteID, &req, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Site not found", ""))
			return
		}
		utils.LogErrorf("Failed to update site: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update site", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Site updated successfully", site))
}

// DeleteSite deletes a site
func (h *AssetHandler) DeleteSite(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	// Parse site ID
	siteIDParam := c.Param("id")
	siteID, err := strconv.Atoi(siteIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid site ID", ""))
		return
	}

	// Delete site
	err = h.assetService.DeleteSite(c.Request.Context(), tenantID, siteID, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Site not found", ""))
			return
		}
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Cannot delete site", err.Error()))
			return
		}
		utils.LogErrorf("Failed to delete site: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete site", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Site deleted successfully", nil))
}

// ListSites returns a paginated list of sites
func (h *AssetHandler) ListSites(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var query request.AssetListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Set defaults
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	// List sites
	sites, err := h.assetService.ListSites(c.Request.Context(), tenantID, &query)
	if err != nil {
		utils.LogErrorf("Failed to list sites: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve sites", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Sites retrieved successfully", sites))
}

// SearchSites performs advanced search on sites
func (h *AssetHandler) SearchSites(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var query request.AssetSearchRequest
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid search parameters", err.Error()))
		return
	}

	// Set defaults
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	// Search sites
	sites, err := h.assetService.SearchSites(c.Request.Context(), tenantID, &query)
	if err != nil {
		utils.LogErrorf("Failed to search sites: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to search sites", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Sites search completed", sites))
}

// ===== UNIT HANDLERS =====

// CreateUnit creates a new unit
func (h *AssetHandler) CreateUnit(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	var req request.CreateUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate request
	if err := utils.ValidateStruct(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ValidationErrorResponse(err))
		return
	}

	// Create unit
	unit, err := h.assetService.CreateUnit(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to create unit: %v", err)
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create unit", ""))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("Unit created successfully", unit))
}

// GetUnit retrieves a specific unit
func (h *AssetHandler) GetUnit(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	unitIDParam := c.Param("id")
	unitID, err := strconv.Atoi(unitIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid unit ID", ""))
		return
	}

	unit, err := h.assetService.GetUnit(c.Request.Context(), tenantID, unitID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Unit not found", ""))
			return
		}
		utils.LogErrorf("Failed to get unit: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve unit", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Unit retrieved successfully", unit))
}

// ListUnits returns a paginated list of units
func (h *AssetHandler) ListUnits(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	var query request.AssetListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	units, err := h.assetService.ListUnits(c.Request.Context(), tenantID, &query)
	if err != nil {
		utils.LogErrorf("Failed to list units: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve units", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Units retrieved successfully", units))
}

// UpdateUnit updates an existing unit
func (h *AssetHandler) UpdateUnit(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	unitIDParam := c.Param("id")
	unitID, err := strconv.Atoi(unitIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid unit ID", ""))
		return
	}

	var req request.UpdateUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	unit, err := h.assetService.UpdateUnit(c.Request.Context(), tenantID, unitID, &req, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Unit not found", ""))
			return
		}
		utils.LogErrorf("Failed to update unit: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update unit", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Unit updated successfully", unit))
}

// DeleteUnit deletes a unit
func (h *AssetHandler) DeleteUnit(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	unitIDParam := c.Param("id")
	unitID, err := strconv.Atoi(unitIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid unit ID", ""))
		return
	}

	err = h.assetService.DeleteUnit(c.Request.Context(), tenantID, unitID, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Unit not found", ""))
			return
		}
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Cannot delete unit", err.Error()))
			return
		}
		utils.LogErrorf("Failed to delete unit: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete unit", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Unit deleted successfully", nil))
}

// ===== Asset HANDLERS =====

// CreateAsset creates new Asset
func (h *AssetHandler) CreateAsset(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	var req request.CreateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ValidationErrorResponse(err))
		return
	}

	Asset, err := h.assetService.CreateAsset(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to create Asset: %v", err)
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create Asset", ""))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("Asset created successfully", Asset))
}

// GetAsset retrieves specific Asset
func (h *AssetHandler) GetAsset(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	AssetIDParam := c.Param("id")
	AssetID, err := strconv.Atoi(AssetIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid Asset ID", ""))
		return
	}

	Asset, err := h.assetService.GetAsset(c.Request.Context(), tenantID, AssetID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Asset not found", ""))
			return
		}
		utils.LogErrorf("Failed to get Asset: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve Asset", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset retrieved successfully", Asset))
}

// ListAsset returns a paginated list of Asset
func (h *AssetHandler) ListAsset(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	var query request.AssetListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	Asset, err := h.assetService.ListAsset(c.Request.Context(), tenantID, &query)
	if err != nil {
		utils.LogErrorf("Failed to list Asset: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve Asset", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset retrieved successfully", Asset))
}

// UpdateAsset updates existing Asset
func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	AssetIDParam := c.Param("id")
	AssetID, err := strconv.Atoi(AssetIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid Asset ID", ""))
		return
	}

	var req request.UpdateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	Asset, err := h.assetService.UpdateAsset(c.Request.Context(), tenantID, AssetID, &req, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Asset not found", ""))
			return
		}
		utils.LogErrorf("Failed to update Asset: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update Asset", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset updated successfully", Asset))
}

// DeleteAsset deletes Asset
func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	AssetIDParam := c.Param("id")
	AssetID, err := strconv.Atoi(AssetIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid Asset ID", ""))
		return
	}

	err = h.assetService.DeleteAsset(c.Request.Context(), tenantID, AssetID, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Asset not found", ""))
			return
		}
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Cannot delete Asset", err.Error()))
			return
		}
		utils.LogErrorf("Failed to delete Asset: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete Asset", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset deleted successfully", nil))
}

// ===== COMPONENT HANDLERS =====

// CreateComponent creates new component
func (h *AssetHandler) CreateComponent(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	var req request.CreateComponentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ValidationErrorResponse(err))
		return
	}

	component, err := h.assetService.CreateComponent(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to create component: %v", err)
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create component", ""))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("Component created successfully", component))
}

// GetComponent retrieves specific component
func (h *AssetHandler) GetComponent(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	componentIDParam := c.Param("id")
	componentID, err := strconv.Atoi(componentIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid component ID", ""))
		return
	}

	component, err := h.assetService.GetComponent(c.Request.Context(), tenantID, componentID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Component not found", ""))
			return
		}
		utils.LogErrorf("Failed to get component: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve component", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Component retrieved successfully", component))
}

// ListComponents returns a paginated list of components
func (h *AssetHandler) ListComponents(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	var query request.AssetListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	components, err := h.assetService.ListComponents(c.Request.Context(), tenantID, &query)
	if err != nil {
		utils.LogErrorf("Failed to list components: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve components", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Components retrieved successfully", components))
}

// UpdateComponent updates existing component
func (h *AssetHandler) UpdateComponent(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	componentIDParam := c.Param("id")
	componentID, err := strconv.Atoi(componentIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid component ID", ""))
		return
	}

	var req request.UpdateComponentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	component, err := h.assetService.UpdateComponent(c.Request.Context(), tenantID, componentID, &req, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Component not found", ""))
			return
		}
		utils.LogErrorf("Failed to update component: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update component", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Component updated successfully", component))
}

// DeleteComponent deletes component
func (h *AssetHandler) DeleteComponent(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	componentIDParam := c.Param("id")
	componentID, err := strconv.Atoi(componentIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid component ID", ""))
		return
	}

	err = h.assetService.DeleteComponent(c.Request.Context(), tenantID, componentID, userID)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Component not found", ""))
			return
		}
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Cannot delete component", err.Error()))
			return
		}
		utils.LogErrorf("Failed to delete component: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete component", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Component deleted successfully", nil))
}

// ===== ANALYTICS HANDLERS (REAL IMPLEMENTATIONS) =====

// GetSiteStatistics gets comprehensive site statistics
func (h *AssetHandler) GetSiteStatistics(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse site ID
	siteIDParam := c.Param("id")
	_, err := strconv.Atoi(siteIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid site ID", ""))
		return
	}

	// Parse query parameters
	var req request.SiteStatisticsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}
	// Use the parsed site ID from parameter
	if siteID, err := strconv.Atoi(siteIDParam); err == nil {
		req.SiteID = siteID
	}

	//  FIXED: Call analytics service with proper method
	statistics, err := h.analyticsService.GetSiteStatistics(c.Request.Context(), tenantID, &req)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Site not found", ""))
			return
		}
		utils.LogErrorf("Failed to get site statistics: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve site statistics", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Site statistics retrieved successfully", statistics))
}

// GetSiteWithHierarchy gets site with its complete asset hierarchy
func (h *AssetHandler) GetSiteWithHierarchy(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse site ID
	siteIDParam := c.Param("id")
	siteID, err := strconv.Atoi(siteIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid site ID", ""))
		return
	}

	// Parse query parameters
	var req request.AssetHierarchyRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}
	req.SiteID = &siteID

	// Get site with hierarchy
	hierarchy, err := h.assetService.GetAssetHierarchy(c.Request.Context(), tenantID, &req)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Site not found", ""))
			return
		}
		utils.LogErrorf("Failed to get site hierarchy: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve site hierarchy", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Site hierarchy retrieved successfully", hierarchy))
}

// GetAssetHierarchy gets complete asset hierarchy
func (h *AssetHandler) GetAssetHierarchy(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.AssetHierarchyRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Get asset hierarchy
	hierarchy, err := h.assetService.GetAssetHierarchy(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to get asset hierarchy: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve asset hierarchy", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset hierarchy retrieved successfully", hierarchy))
}

// GetAssetPath gets asset breadcrumb path
func (h *AssetHandler) GetAssetPath(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse parameters
	assetType := c.Param("type")
	assetIDParam := c.Param("id")
	assetID, err := strconv.Atoi(assetIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid asset ID", ""))
		return
	}

	// Validate asset type
	if assetType != "site" && assetType != "unit" && assetType != "Asset" && assetType != "component" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid asset type", "Must be one of: site, unit, Asset, component"))
		return
	}

	// Parse query parameters
	var req request.AssetPathRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}
	req.AssetType = assetType
	req.AssetID = assetID

	// Get asset path
	path, err := h.assetService.GetAssetPath(c.Request.Context(), tenantID, &req)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Asset not found", ""))
			return
		}
		utils.LogErrorf("Failed to get asset path: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve asset path", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset path retrieved successfully", path))
}

// GetAssetStatistics gets comprehensive asset statistics
func (h *AssetHandler) GetAssetStatistics(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.AssetStatisticsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Get asset statistics from analytics service
	statistics, err := h.analyticsService.GetAssetStatistics(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to get asset statistics: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve asset statistics", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset statistics retrieved successfully", statistics))
}

// GetAssetDistribution gets asset distribution analytics
func (h *AssetHandler) GetAssetDistribution(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.AssetDistributionRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Validate distribution type
	if req.DistributionType == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Distribution type is required", ""))
		return
	}

	// Get asset distribution
	distribution, err := h.analyticsService.GetAssetDistribution(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to get asset distribution: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve asset distribution", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset distribution retrieved successfully", distribution))
}

// GetAssetHealth gets asset health analytics
func (h *AssetHandler) GetAssetHealth(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.AssetHealthRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Validate request using basic validation since existing struct may not have ValidateAssetHealth method
	if len(req.Criticality) > 0 {
		for _, criticality := range req.Criticality {
			if criticality < 1 || criticality > 5 {
				c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Criticality must be between 1 and 5"))
				return
			}
		}
	}

	//  FIXED: Get asset health metrics with proper request structure
	healthMetrics, err := h.analyticsService.GetAssetHealthMetrics(c.Request.Context(), tenantID, &request.AssetStatisticsRequest{
		AssetTypes:  req.AssetTypes,
		SiteID:      req.SiteID,
		UnitID:      req.UnitID,
		AssetID: req.AssetID,
		DateFrom:    req.DateFrom,
		DateTo:      req.DateTo,
	})
	if err != nil {
		utils.LogErrorf("Failed to get asset health: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve asset health", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset health retrieved successfully", healthMetrics))
}

// GetAssetDashboard gets asset dashboard data
func (h *AssetHandler) GetAssetDashboard(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.AssetDashboardRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	//  FIXED: Get dashboard data from analytics service with proper method call
	dashboardData, err := h.analyticsService.GetAssetDashboard(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to get asset dashboard: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve asset dashboard", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset dashboard retrieved successfully", dashboardData))
}

// SearchAssets performs advanced asset search
func (h *AssetHandler) SearchAssets(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters and JSON body
	var req request.AssetSearchRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// For POST requests, also bind JSON body
	if c.Request.Method == "POST" {
		var jsonReq request.AssetSearchRequest
		if err := c.ShouldBindJSON(&jsonReq); err == nil {
			// Merge JSON data with query parameters (use existing struct fields)
			if jsonReq.Query != "" {
				req.Query = jsonReq.Query
			}
			// Add other field merging based on existing AssetSearchRequest struct
		}
	}

	// Validate using existing struct methods or basic validation
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 20
	}

	// Search assets
	results, err := h.assetService.SearchAssets(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to search assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to search assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset search completed successfully", results))
}

// GetCriticalAssets gets critical assets
func (h *AssetHandler) GetCriticalAssets(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.CriticalAssetsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Set default criticality threshold if not provided
	if req.CriticalityThreshold == 0 {
		req.CriticalityThreshold = 4 // High and Critical only
	}

	// Get critical assets
	criticalAssets, err := h.analyticsService.GetCriticalAssets(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to get critical assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve critical assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Critical assets retrieved successfully", criticalAssets))
}

// GetAssetsRequiringInspection gets assets requiring inspection
func (h *AssetHandler) GetAssetsRequiringInspection(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse query parameters
	var req request.InspectionDueRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid query parameters", err.Error()))
		return
	}

	// Set default days ahead and validate
	if req.DaysAhead == 0 {
		req.DaysAhead = 30 // Default to 30 days
	}
	if req.DaysAhead < 0 || req.DaysAhead > 365 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Days ahead must be between 0 and 365"))
		return
	}

	//  FIXED: Get inspection due analytics with proper request structure
	inspectionDue, err := h.analyticsService.GetInspectionDueAnalytics(c.Request.Context(), tenantID, &request.AssetStatisticsRequest{
		SiteID:      req.SiteID,
		UnitID:      req.UnitID,
		AssetID: req.AssetID,
		DateFrom: func() *time.Time {
			t := time.Now()
			return &t
		}(),
		DateTo: func() *time.Time {
			t := time.Now().AddDate(0, 0, req.DaysAhead)
			return &t
		}(),
	})
	if err != nil {
		utils.LogErrorf("Failed to get inspection due assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve inspection due assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Inspection due assets retrieved successfully", inspectionDue))
}

// UpdateAssetCriticality updates asset criticality in bulk
func (h *AssetHandler) UpdateAssetCriticality(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	// Parse request body
	var req request.AssetCriticalityUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate request using basic validation
	if len(req.Updates) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "At least one update is required"))
		return
	}
	for i, update := range req.Updates {
		if update.AssetID <= 0 {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Invalid asset ID at index "+strconv.Itoa(i)))
			return
		}
		if update.Criticality < 1 || update.Criticality > 5 {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Criticality must be between 1 and 5 at index "+strconv.Itoa(i)))
			return
		}
	}

	// Update asset criticality
	result, err := h.assetService.UpdateAssetCriticality(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to update asset criticality: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update asset criticality", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset criticality updated successfully", result))
}

// ValidateAssetHierarchy validates asset hierarchy integrity
func (h *AssetHandler) ValidateAssetHierarchy(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse request body
	var req request.AssetHierarchyValidationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate hierarchy
	validationResult, err := h.assetService.ValidateAssetHierarchy(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to validate asset hierarchy: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to validate asset hierarchy", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset hierarchy validation completed", validationResult))
}

// BulkUpdateAssets performs bulk update operations on assets
func (h *AssetHandler) BulkUpdateAssets(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	// Parse request body
	var req request.BulkAssetOperationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate request using basic validation
	if len(req.AssetIDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "At least one asset ID is required"))
		return
	}
	if len(req.AssetIDs) > 1000 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Maximum 1000 assets can be processed in a single operation"))
		return
	}
	for i, id := range req.AssetIDs {
		if id <= 0 {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Invalid asset ID at index "+strconv.Itoa(i)))
			return
		}
	}

	// Set operation to update
	req.Operation = "update"

	// Perform bulk update
	result, err := h.assetService.BulkUpdateAssets(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to bulk update assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to bulk update assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Bulk update completed successfully", result))
}

// BulkDeleteAssets performs bulk delete operations on assets
func (h *AssetHandler) BulkDeleteAssets(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	// Parse request body
	var req request.BulkAssetOperationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate request using basic validation
	if len(req.AssetIDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "At least one asset ID is required"))
		return
	}
	if len(req.AssetIDs) > 1000 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Maximum 1000 assets can be processed in a single operation"))
		return
	}
	for i, id := range req.AssetIDs {
		if id <= 0 {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "Invalid asset ID at index "+strconv.Itoa(i)))
			return
		}
	}

	// Set operation to delete
	req.Operation = "delete"

	// Perform bulk delete
	result, err := h.assetService.BulkDeleteAssets(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to bulk delete assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to bulk delete assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Bulk delete completed successfully", result))
}

// ImportAssets imports assets from file
func (h *AssetHandler) ImportAssets(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	// Parse request body
	var req request.AssetImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate import type and asset type
	if req.ImportType == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Import type is required", ""))
		return
	}
	if req.AssetType == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Asset type is required", ""))
		return
	}

	// Set default batch size
	if req.BatchSize == 0 {
		req.BatchSize = 100
	}

	// Import assets
	result, err := h.assetService.ImportAssets(c.Request.Context(), tenantID, &req, userID)
	if err != nil {
		utils.LogErrorf("Failed to import assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to import assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset import completed successfully", result))
}

// ExportAssets exports assets to file
func (h *AssetHandler) ExportAssets(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	// Parse request body
	var req request.AssetExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	// Validate export type
	if req.ExportType == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Export type is required", ""))
		return
	}

	//  FIXED: Set default format options properly (Format is string, not struct)
	if req.Format == "" && req.ExportType == "csv" {
		req.Format = "csv"
	}

	// Export assets
	result, err := h.assetService.ExportAssets(c.Request.Context(), tenantID, &req)
	if err != nil {
		utils.LogErrorf("Failed to export assets: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to export assets", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Asset export completed successfully", result))
}

// ===== REGISTER ROUTES =====

// RegisterRoutes registers all asset-related routes (MERGED FROM BOTH FILES)
func (h *AssetHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Site routes
	sites := router.Group("/sites")
	{
		sites.POST("", h.CreateSite)
		sites.GET("", h.ListSites)
		sites.POST("/search", h.SearchSites)
		sites.GET("/:id", h.GetSite)
		sites.PUT("/:id", h.UpdateSite)
		sites.DELETE("/:id", h.DeleteSite)
		sites.GET("/:id/statistics", h.GetSiteStatistics)
		sites.GET("/:id/hierarchy", h.GetSiteWithHierarchy)
	}

	// Unit routes
	units := router.Group("/units")
	{
		units.POST("", h.CreateUnit)
		units.GET("", h.ListUnits)
		units.GET("/:id", h.GetUnit)
		units.PUT("/:id", h.UpdateUnit)
		units.DELETE("/:id", h.DeleteUnit)
	}

	// Asset routes
	Asset := router.Group("/Asset")
	{
		Asset.POST("", h.CreateAsset)
		Asset.GET("", h.ListAsset)
		Asset.GET("/:id", h.GetAsset)
		Asset.PUT("/:id", h.UpdateAsset)
		Asset.DELETE("/:id", h.DeleteAsset)
	}

	// Component routes
	components := router.Group("/components")
	{
		components.POST("", h.CreateComponent)
		components.GET("", h.ListComponents)
		components.GET("/:id", h.GetComponent)
		components.PUT("/:id", h.UpdateComponent)
		components.DELETE("/:id", h.DeleteComponent)
	}

	// Asset hierarchy and analytics routes
	router.GET("/hierarchy", h.GetAssetHierarchy)
	router.GET("/path/:type/:id", h.GetAssetPath)
	router.GET("/statistics", h.GetAssetStatistics)
	router.GET("/distribution", h.GetAssetDistribution)
	router.GET("/health", h.GetAssetHealth)
	router.GET("/dashboard", h.GetAssetDashboard)
	router.GET("/search", h.SearchAssets)
	router.POST("/search", h.SearchAssets) // Support both GET and POST for search
	router.GET("/critical", h.GetCriticalAssets)
	router.GET("/inspection-due", h.GetAssetsRequiringInspection)

	// Bulk operations
	router.PATCH("/criticality", h.UpdateAssetCriticality)
	router.POST("/validate-hierarchy", h.ValidateAssetHierarchy)
	router.PATCH("/bulk-update", h.BulkUpdateAssets)
	router.DELETE("/bulk-delete", h.BulkDeleteAssets)

	// Import/Export
	router.POST("/import", h.ImportAssets)
	router.POST("/export", h.ExportAssets)

	// Add a test endpoint
	router.GET("/assets/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message":   "Asset API is working!",
			"success":   true,
			"timestamp": time.Now(),
		})
	})
}
