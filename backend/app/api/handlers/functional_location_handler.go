// platform/backend/app/api/handlers/functional_location_handler.go
package handlers

import (
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// FunctionalLocationHandler handles HTTP requests for functional locations and visual tree
type FunctionalLocationHandler struct {
	service services.FunctionalLocationService
}

// NewFunctionalLocationHandler creates a new functional location handler
func NewFunctionalLocationHandler(service services.FunctionalLocationService) *FunctionalLocationHandler {
	return &FunctionalLocationHandler{service: service}
}

// GetTree returns the hierarchical functional location tree
func (h *FunctionalLocationHandler) GetTree(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	if tenantID <= 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Tenant context required", "Unauthorized"))
		return
	}

	tree, err := h.service.GetTree(c.Request.Context(), tenantID)
	if err != nil {
		utils.LogErrorf("Failed to retrieve functional location tree: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve functional location tree", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Functional location tree retrieved successfully", tree))
}

// GetAll returns flat list of functional locations
func (h *FunctionalLocationHandler) GetAll(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	if tenantID <= 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Tenant context required", "Unauthorized"))
		return
	}

	list, err := h.service.GetAll(c.Request.Context(), tenantID)
	if err != nil {
		utils.LogErrorf("Failed to list functional locations: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to list functional locations", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Functional locations retrieved successfully", list))
}

// GetByID retrieves a functional location by ID
func (h *FunctionalLocationHandler) GetByID(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	if tenantID <= 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Tenant context required", "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid functional location ID", "Bad Request"))
		return
	}

	floc, err := h.service.GetByID(c.Request.Context(), tenantID, id)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Functional location not found", "Not Found"))
			return
		}
		utils.LogErrorf("Failed to get functional location %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve functional location", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Functional location retrieved successfully", floc))
}

// GetEquipments retrieves installed equipment at a functional location
func (h *FunctionalLocationHandler) GetEquipments(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	if tenantID <= 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Tenant context required", "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid functional location ID", "Bad Request"))
		return
	}

	equipments, err := h.service.GetEquipments(c.Request.Context(), tenantID, id)
	if err != nil {
		utils.LogErrorf("Failed to get equipment for functional location %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve installed equipments", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Installed equipments retrieved successfully", equipments))
}

