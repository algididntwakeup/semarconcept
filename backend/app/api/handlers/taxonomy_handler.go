package handlers

import (
	"backend/app/models"
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// TaxonomyHandler handles HTTP requests for taxonomy operations
type TaxonomyHandler struct {
	taxonomyService services.TaxonomyService
}

// NewTaxonomyHandler creates a new taxonomy handler instance
func NewTaxonomyHandler(taxonomyService services.TaxonomyService) *TaxonomyHandler {
	return &TaxonomyHandler{
		taxonomyService: taxonomyService,
	}
}

// ===== CATEGORY HANDLERS =====

// CreateCategory creates a new taxonomy category
func (h *TaxonomyHandler) CreateCategory(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	var req models.TaxonomyCategory
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	req.TenantID = tenantID
	req.CreatedBy = &userID
	req.UpdatedBy = &userID

	if err := h.taxonomyService.CreateCategory(c.Request.Context(), &req); err != nil {
		utils.LogErrorf("Failed to create taxonomy category: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create taxonomy category", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("Taxonomy category created successfully", req))
}

// GetCategory retrieves a specific category
func (h *TaxonomyHandler) GetCategory(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid category ID", ""))
		return
	}

	category, err := h.taxonomyService.GetCategoryByID(c.Request.Context(), tenantID, id)
	if err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Category not found", ""))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to retrieve category", ""))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Category retrieved successfully", category))
}

// UpdateCategory updates an existing category
func (h *TaxonomyHandler) UpdateCategory(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid category ID", ""))
		return
	}

	var req models.TaxonomyCategory
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}
	req.UpdatedBy = &userID

	if err := h.taxonomyService.UpdateCategory(c.Request.Context(), tenantID, id, &req); err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Category not found", ""))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update category", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Category updated successfully", nil))
}

// DeleteCategory deletes a category
func (h *TaxonomyHandler) DeleteCategory(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid category ID", ""))
		return
	}

	if err := h.taxonomyService.DeleteCategory(c.Request.Context(), tenantID, id); err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Category not found", ""))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete category", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Category deleted successfully", nil))
}

// GetCategoryTree returns the hierarchical structure
func (h *TaxonomyHandler) GetCategoryTree(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	tree, err := h.taxonomyService.GetCategoryTree(c.Request.Context(), tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to build taxonomy tree", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Tree built successfully", tree))
}

// ListCategories returns flat categories, optionally by parent
func (h *TaxonomyHandler) ListCategories(c *gin.Context) {
	tenantID := utils.GetTenantID(c)

	var parentID *int
	if p, has := c.GetQuery("parent_id"); has {
		val, err := strconv.Atoi(p)
		if err == nil {
			parentID = &val
		}
	}

	list, err := h.taxonomyService.ListCategories(c.Request.Context(), tenantID, parentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to list categories", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Categories retrieved", list))
}

// ===== ATTRIBUTE HANDLERS =====

// CreateAttribute creates a new attribute for a category
func (h *TaxonomyHandler) CreateAttribute(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	var req models.TaxonomyAttribute
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}

	req.TenantID = tenantID
	req.CreatedBy = &userID
	req.UpdatedBy = &userID

	if err := h.taxonomyService.CreateAttribute(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create taxonomy attribute", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("Taxonomy attribute created successfully", req))
}

func (h *TaxonomyHandler) UpdateAttribute(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	userID := utils.GetUserID(c)

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid attribute ID", ""))
		return
	}

	var req models.TaxonomyAttribute
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request format", err.Error()))
		return
	}
	req.UpdatedBy = &userID

	if err := h.taxonomyService.UpdateAttribute(c.Request.Context(), tenantID, id, &req); err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Attribute not found", ""))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update attribute", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Attribute updated successfully", nil))
}

func (h *TaxonomyHandler) DeleteAttribute(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid attribute ID", ""))
		return
	}

	if err := h.taxonomyService.DeleteAttribute(c.Request.Context(), tenantID, id); err != nil {
		if utils.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, utils.ErrorResponse("Attribute not found", ""))
			return
		}
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete attribute", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Attribute deleted successfully", nil))
}

func (h *TaxonomyHandler) GetInheritedAttributes(c *gin.Context) {
	tenantID := utils.GetTenantID(c)
	catIDParam := c.Param("id")
	catID, err := strconv.Atoi(catIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid category ID", ""))
		return
	}

	attrs, err := h.taxonomyService.GetInheritedAttributes(c.Request.Context(), tenantID, catID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to get attributes", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("Inherited attributes retrieved", attrs))
}
