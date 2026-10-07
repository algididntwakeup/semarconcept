package handlers

import (
	"net/http"
	"strconv"

	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
)

// EquipmentDocumentHandler serves the files attached to an asset.
type EquipmentDocumentHandler struct {
	service services.EquipmentDocumentService
}

// NewEquipmentDocumentHandler wires the handler to its service.
func NewEquipmentDocumentHandler(service services.EquipmentDocumentService) *EquipmentDocumentHandler {
	return &EquipmentDocumentHandler{service: service}
}

// ListEquipmentDocuments returns the documents for one asset.
func (h *EquipmentDocumentHandler) ListEquipmentDocuments(c *gin.Context) {
	tenantID, ok := h.requireTenant(c)
	if !ok {
		return
	}
	equipmentID, ok := h.equipmentIDParam(c)
	if !ok {
		return
	}

	documents, err := h.service.List(c.Request.Context(), tenantID, equipmentID)
	if err != nil {
		utils.LogErrorf("Failed to list equipment documents: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to list equipment documents", err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("Equipment documents retrieved successfully", documents))
}

// UploadEquipmentDocument stores one multipart file for an asset.
func (h *EquipmentDocumentHandler) UploadEquipmentDocument(c *gin.Context) {
	tenantID, ok := h.requireTenant(c)
	if !ok {
		return
	}
	equipmentID, ok := h.equipmentIDParam(c)
	if !ok {
		return
	}

	// Allow a small multipart envelope over the 10 MB file limit.
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, services.MaxEquipmentDocumentSize+(1<<20))
	if err := c.Request.ParseMultipartForm(8 << 20); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Expected multipart form-data upload", err.Error()))
		return
	}
	if c.Request.MultipartForm != nil {
		defer func() { _ = c.Request.MultipartForm.RemoveAll() }()
	}

	header, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("File is required in multipart field 'file'", err.Error()))
		return
	}

	document, err := h.service.Upload(c.Request.Context(), tenantID, equipmentID, utils.GetUserID(c), header, c.PostForm("category"))
	if err != nil {
		if utils.IsValidationError(err) {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid upload", err.Error()))
			return
		}
		utils.LogErrorf("Failed to upload equipment document: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to upload equipment document", err.Error()))
		return
	}
	c.JSON(http.StatusCreated, utils.SuccessResponse("Equipment document uploaded successfully", document))
}

// DeleteEquipmentDocument removes one document and its stored file.
func (h *EquipmentDocumentHandler) DeleteEquipmentDocument(c *gin.Context) {
	tenantID, ok := h.requireTenant(c)
	if !ok {
		return
	}
	id, err := strconv.Atoi(c.Param("documentId"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid document id", ""))
		return
	}

	if err := h.service.Delete(c.Request.Context(), tenantID, id); err != nil {
		utils.LogErrorf("Failed to delete equipment document: %v", err)
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Failed to delete equipment document", err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("Equipment document deleted successfully", gin.H{"id": id}))
}

func (h *EquipmentDocumentHandler) requireTenant(c *gin.Context) (int, bool) {
	tenantID, err := utils.RequireTenantID(c)
	if err != nil || tenantID <= 0 {
		c.AbortWithStatusJSON(http.StatusUnauthorized, utils.ErrorResponse("Tenant context required", "Unauthorized: valid tenant context is required"))
		return 0, false
	}
	return tenantID, true
}

func (h *EquipmentDocumentHandler) equipmentIDParam(c *gin.Context) (int, bool) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid equipment id", ""))
		return 0, false
	}
	return id, true
}
