package handlers

import (
	"fmt"
	"net/http"

	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
)

// MaintenanceHandler handles HTTP requests for system maintenance and mass data cleaning utilities.
type MaintenanceHandler struct {
	maintenanceService services.MaintenanceService
}

// NewMaintenanceHandler creates a new MaintenanceHandler instance.
func NewMaintenanceHandler(maintenanceService services.MaintenanceService) *MaintenanceHandler {
	return &MaintenanceHandler{
		maintenanceService: maintenanceService,
	}
}

func (h *MaintenanceHandler) requireTenantContext(c *gin.Context) (int, bool) {
	tenantID := utils.GetTenantID(c)
	if tenantID <= 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Unauthorized", "Tenant context required"))
		return 0, false
	}
	return tenantID, true
}

// DiagnoseDuplicates handles POST /api/v1/maintenance/diagnose-duplicates
// Queries assets with identical tag numbers (duplicates) within the tenant.
func (h *MaintenanceHandler) DiagnoseDuplicates(c *gin.Context) {
	tenantID, ok := h.requireTenantContext(c)
	if !ok {
		return
	}

	result, err := h.maintenanceService.DiagnoseDuplicates(c.Request.Context(), tenantID)
	if err != nil {
		utils.LogErrorf("Failed to diagnose duplicate tags: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to diagnose duplicate tags", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Duplicate tag diagnosis completed", result))
}

// FixLinks handles POST /api/v1/maintenance/fix-links
// Auto-links Level 7 components with empty parent_id by matching against parent equipment tags.
func (h *MaintenanceHandler) FixLinks(c *gin.Context) {
	tenantID, ok := h.requireTenantContext(c)
	if !ok {
		return
	}

	userID := utils.GetUserID(c)
	result, err := h.maintenanceService.FixComponentLinks(c.Request.Context(), tenantID, userID)
	if err != nil {
		utils.LogErrorf("Failed to fix component links: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to fix component links", err.Error()))
		return
	}

	message := fmt.Sprintf("Successfully fixed %d component link(s)!", result.Count)
	c.JSON(http.StatusOK, utils.SuccessResponse(message, result))
}

// SyncFLOC handles POST /api/v1/maintenance/sync-floc
// Bulk updates components (Level 7) to inherit their parent asset's installed_floc_id.
func (h *MaintenanceHandler) SyncFLOC(c *gin.Context) {
	tenantID, ok := h.requireTenantContext(c)
	if !ok {
		return
	}

	userID := utils.GetUserID(c)
	result, err := h.maintenanceService.SyncComponentsToFLOC(c.Request.Context(), tenantID, userID)
	if err != nil {
		utils.LogErrorf("Failed to sync components to FLOC: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to sync components to FLOC", err.Error()))
		return
	}

	message := fmt.Sprintf("Successfully synced %d component(s) to FLOC!", result.Count)
	c.JSON(http.StatusOK, utils.SuccessResponse(message, result))
}

// ResolveDuplicate handles POST /api/v1/maintenance/resolve-duplicate
// Keeps one asset and soft-deletes other duplicates in the group, re-parenting any orphaned children.
func (h *MaintenanceHandler) ResolveDuplicate(c *gin.Context) {
	tenantID, ok := h.requireTenantContext(c)
	if !ok {
		return
	}

	var req services.ResolveDuplicateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request payload", err.Error()))
		return
	}

	if req.KeptAssetID <= 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "kept_asset_id must be a positive integer"))
		return
	}

	if len(req.DeletedAssetIDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Validation failed", "deleted_asset_ids must not be empty"))
		return
	}

	userID := utils.GetUserID(c)
	result, err := h.maintenanceService.ResolveDuplicate(c.Request.Context(), tenantID, userID, &req)
	if err != nil {
		utils.LogErrorf("Failed to resolve duplicate assets: %v", err)
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Failed to resolve duplicate assets", err.Error()))
		return
	}

	message := "Successfully merged data and removed duplicates."
	c.JSON(http.StatusOK, utils.SuccessResponse(message, result))
}


