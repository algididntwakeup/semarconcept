// backend/app/api/handlers/tenant_handler.go
package handlers

import (
	"backend/app/models/request"
	"backend/app/services"
	"backend/app/utils"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// TenantHandler handles tenant-related HTTP requests
type TenantHandler struct {
	tenantService services.TenantService
}

// NewTenantHandler creates a new tenant handler instance
func NewTenantHandler(tenantService services.TenantService) *TenantHandler {
	return &TenantHandler{
		tenantService: tenantService,
	}
}

// CreateTenant creates a new tenant
// @Summary Create a new tenant
// @Description Creates a new tenant with the provided information
// @Tags tenants
// @Accept json
// @Produce json
// @Param tenant body request.CreateTenantRequest true "Tenant information"
// @Success 201 {object} response.TenantResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants [post]
func (h *TenantHandler) CreateTenant(c *gin.Context) {
	var req request.CreateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": utils.FormatValidationErrors(ve)})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	response, err := h.tenantService.CreateTenant(c.Request.Context(), req, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrSubdomainTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "Subdomain already taken."})
			return
		}
		if errors.Is(err, utils.ErrDomainTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "Domain already taken."})
			return
		}
		utils.LogErrorf("TenantHandler.CreateTenant: Error creating tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tenant."})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// GetTenant retrieves a tenant by ID
// @Summary Get a tenant by ID
// @Description Retrieves a tenant with the specified ID
// @Tags tenants
// @Produce json
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.TenantResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id} [get]
func (h *TenantHandler) GetTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	response, err := h.tenantService.GetTenantByID(c.Request.Context(), id)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetTenant: Error retrieving tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetTenantBySubdomain retrieves a tenant by subdomain
// @Summary Get a tenant by subdomain
// @Description Retrieves a tenant with the specified subdomain
// @Tags tenants
// @Produce json
// @Param subdomain path string true "Tenant subdomain"
// @Success 200 {object} response.TenantResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/subdomain/{subdomain} [get]
func (h *TenantHandler) GetTenantBySubdomain(c *gin.Context) {
	subdomain := c.Param("subdomain")
	if subdomain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subdomain is required."})
		return
	}

	response, err := h.tenantService.GetTenantBySubdomain(c.Request.Context(), subdomain)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetTenantBySubdomain: Error retrieving tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// UpdateTenant updates an existing tenant
// @Summary Update a tenant
// @Description Updates a tenant with the provided information
// @Tags tenants
// @Accept json
// @Produce json
// @Param id path int true "Tenant ID"
// @Param tenant body request.UpdateTenantRequest true "Updated tenant information"
// @Success 200 {object} response.TenantResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id} [put]
func (h *TenantHandler) UpdateTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	var req request.UpdateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": utils.FormatValidationErrors(ve)})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	response, err := h.tenantService.UpdateTenant(c.Request.Context(), id, req, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		if errors.Is(err, utils.ErrSubdomainTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "Subdomain already taken."})
			return
		}
		if errors.Is(err, utils.ErrDomainTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "Domain already taken."})
			return
		}
		utils.LogErrorf("TenantHandler.UpdateTenant: Error updating tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tenant."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// DeleteTenant deletes a tenant
// @Summary Delete a tenant
// @Description Soft deletes a tenant by setting its status to deleted
// @Tags tenants
// @Param id path int true "Tenant ID"
// @Success 204
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id} [delete]
func (h *TenantHandler) DeleteTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.DeleteTenant(c.Request.Context(), id, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.DeleteTenant: Error deleting tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tenant."})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetTenants retrieves a paginated list of tenants
// @Summary Get tenants list
// @Description Retrieves a paginated list of tenants with optional filtering
// @Tags tenants
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search term"
// @Param status query string false "Filter by status"
// @Param subscription_plan query string false "Filter by subscription plan"
// @Success 200 {object} response.TenantListResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants [get]
func (h *TenantHandler) GetTenants(c *gin.Context) {
	var query request.TenantListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters: " + err.Error()})
		return
	}

	response, err := h.tenantService.GetTenants(c.Request.Context(), query)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		utils.LogErrorf("TenantHandler.GetTenants: Error retrieving tenants: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenants."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// ActivateTenant activates a tenant
// @Summary Activate a tenant
// @Description Changes a tenant's status to active
// @Tags tenants
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/activate [post]
func (h *TenantHandler) ActivateTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.ActivateTenant(c.Request.Context(), id, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.ActivateTenant: Error activating tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate tenant."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tenant activated successfully."})
}

// DeactivateTenant deactivates a tenant
// @Summary Deactivate a tenant
// @Description Changes a tenant's status to inactive
// @Tags tenants
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/deactivate [post]
func (h *TenantHandler) DeactivateTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.DeactivateTenant(c.Request.Context(), id, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.DeactivateTenant: Error deactivating tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deactivate tenant."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tenant deactivated successfully."})
}

// SuspendTenant suspends a tenant
// @Summary Suspend a tenant
// @Description Changes a tenant's status to suspended
// @Tags tenants
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/suspend [post]
func (h *TenantHandler) SuspendTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.SuspendTenant(c.Request.Context(), id, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.SuspendTenant: Error suspending tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to suspend tenant."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tenant suspended successfully."})
}

// UpdateTenantConfig updates tenant configuration
// @Summary Update tenant configuration
// @Description Updates the configuration settings for a tenant
// @Tags tenants
// @Accept json
// @Produce json
// @Param id path int true "Tenant ID"
// @Param config body request.UpdateTenantConfigRequest true "Configuration settings"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/config [put]
func (h *TenantHandler) UpdateTenantConfig(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	var req request.UpdateTenantConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": utils.FormatValidationErrors(ve)})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.UpdateTenantConfig(c.Request.Context(), id, req, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.UpdateTenantConfig: Error updating config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tenant configuration."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tenant configuration updated successfully."})
}

// GetTenantConfig retrieves tenant configuration
// @Summary Get tenant configuration
// @Description Retrieves the configuration settings for a tenant
// @Tags tenants
// @Produce json
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.TenantConfigResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/config [get]
func (h *TenantHandler) GetTenantConfig(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	response, err := h.tenantService.GetTenantConfig(c.Request.Context(), id)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetTenantConfig: Error retrieving config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant configuration."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// UpdateTenantBranding updates tenant branding
// @Summary Update tenant branding
// @Description Updates the branding settings for a tenant
// @Tags tenants
// @Accept json
// @Produce json
// @Param id path int true "Tenant ID"
// @Param branding body request.UpdateTenantBrandingRequest true "Branding settings"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/branding [put]
func (h *TenantHandler) UpdateTenantBranding(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	var req request.UpdateTenantBrandingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": utils.FormatValidationErrors(ve)})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.UpdateTenantBranding(c.Request.Context(), id, req, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.UpdateTenantBranding: Error updating branding: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tenant branding."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tenant branding updated successfully."})
}

// GetTenantBranding retrieves tenant branding
// @Summary Get tenant branding
// @Description Retrieves the branding settings for a tenant
// @Tags tenants
// @Produce json
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.TenantBrandingResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/branding [get]
func (h *TenantHandler) GetTenantBranding(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	response, err := h.tenantService.GetTenantBranding(c.Request.Context(), id)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetTenantBranding: Error retrieving branding: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant branding."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// AddUserToTenant adds a user to a tenant
// @Summary Add user to tenant
// @Description Adds a user to a tenant with specified role and permissions
// @Tags tenants
// @Accept json
// @Produce json
// @Param request body request.AddUserToTenantRequest true "User assignment information"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/users [post]
func (h *TenantHandler) AddUserToTenant(c *gin.Context) {
	var req request.AddUserToTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": utils.FormatValidationErrors(ve)})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err := h.tenantService.AddUserToTenant(c.Request.Context(), req, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		if errors.Is(err, utils.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found."})
			return
		}
		if errors.Is(err, utils.ErrTenantUserLimitExceeded) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant user limit exceeded."})
			return
		}
		utils.LogErrorf("TenantHandler.AddUserToTenant: Error adding user to tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add user to tenant."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User added to tenant successfully."})
}

// RemoveUserFromTenant removes a user from a tenant
// @Summary Remove user from tenant
// @Description Removes a user from a tenant
// @Tags tenants
// @Param tenant_id path int true "Tenant ID"
// @Param user_id path int true "User ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{tenant_id}/users/{user_id} [delete]
func (h *TenantHandler) RemoveUserFromTenant(c *gin.Context) {
	tenantIDStr := c.Param("tenant_id")
	tenantID, err := strconv.Atoi(tenantIDStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID."})
		return
	}

	actorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Actor identity not found."})
		return
	}
	actorID, ok := actorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing actor identity."})
		return
	}

	err = h.tenantService.RemoveUserFromTenant(c.Request.Context(), tenantID, userID, actorID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		if errors.Is(err, utils.ErrTenantUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found in tenant."})
			return
		}
		utils.LogErrorf("TenantHandler.RemoveUserFromTenant: Error removing user from tenant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove user from tenant."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User removed from tenant successfully."})
}

// GetTenantUsers retrieves users for a tenant
// @Summary Get tenant users
// @Description Retrieves a paginated list of users for a tenant
// @Tags tenants
// @Produce json
// @Param id path int true "Tenant ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param role query string false "Filter by role"
// @Param status query string false "Filter by status"
// @Param search query string false "Search term"
// @Success 200 {object} response.TenantUserListResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/users [get]
func (h *TenantHandler) GetTenantUsers(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	var query request.TenantUserListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters: " + err.Error()})
		return
	}

	response, err := h.tenantService.GetTenantUsers(c.Request.Context(), id, query)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetTenantUsers: Error retrieving tenant users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant users."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetTenantStats retrieves tenant statistics
// @Summary Get tenant statistics
// @Description Retrieves various statistics for a tenant
// @Tags tenants
// @Produce json
// @Param id path int true "Tenant ID"
// @Success 200 {object} response.TenantStatsResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/{id}/stats [get]
func (h *TenantHandler) GetTenantStats(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID."})
		return
	}

	response, err := h.tenantService.GetTenantStats(c.Request.Context(), id)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetTenantStats: Error retrieving stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant statistics."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetSystemStats retrieves system-wide statistics
// @Summary Get system statistics
// @Description Retrieves system-wide statistics across all tenants
// @Tags tenants
// @Produce json
// @Success 200 {object} response.SystemStatsResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/system/stats [get]
func (h *TenantHandler) GetSystemStats(c *gin.Context) {
	response, err := h.tenantService.GetSystemStats(c.Request.Context())
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		utils.LogErrorf("TenantHandler.GetSystemStats: Error retrieving system stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve system statistics."})
		return
	}

	c.JSON(http.StatusOK, response)
}

// CheckSubdomainAvailability checks if a subdomain is available
// @Summary Check subdomain availability
// @Description Checks if a subdomain is available for registration
// @Tags tenants
// @Param subdomain query string true "Subdomain to check"
// @Success 200 {object} response.AvailabilityCheckResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/check/subdomain [get]
func (h *TenantHandler) CheckSubdomainAvailability(c *gin.Context) {
	subdomain := c.Query("subdomain")
	if subdomain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subdomain parameter is required."})
		return
	}

	available, err := h.tenantService.CheckSubdomainAvailability(c.Request.Context(), subdomain)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		utils.LogErrorf("TenantHandler.CheckSubdomainAvailability: Error checking availability: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check subdomain availability."})
		return
	}

	response := gin.H{
		"available": available,
		"subdomain": subdomain,
	}

	if !available {
		response["message"] = "Subdomain is already taken"
	}

	c.JSON(http.StatusOK, response)
}

// CheckDomainAvailability checks if a domain is available
// @Summary Check domain availability
// @Description Checks if a custom domain is available for registration
// @Tags tenants
// @Param domain query string true "Domain to check"
// @Success 200 {object} response.AvailabilityCheckResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/check/domain [get]
func (h *TenantHandler) CheckDomainAvailability(c *gin.Context) {
	domain := c.Query("domain")
	if domain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Domain parameter is required."})
		return
	}

	available, err := h.tenantService.CheckDomainAvailability(c.Request.Context(), domain)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		utils.LogErrorf("TenantHandler.CheckDomainAvailability: Error checking availability: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check domain availability."})
		return
	}

	response := gin.H{
		"available": available,
		"domain":    domain,
	}

	if !available {
		response["message"] = "Domain is already taken"
	}

	c.JSON(http.StatusOK, response)
}

// GetCurrentTenant gets the current user's tenant context
// @Summary Get current tenant
// @Description Retrieves the current user's tenant information or system info for superusers
// @Tags tenants
// @Produce json
// @Success 200 {object} response.TenantResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/current [get]

// GetCurrentTenant gets the current user's tenant context
// @Summary Get current tenant
// @Description Retrieves the current user's tenant information or system info for superusers
// @Tags tenants
// @Produce json
// @Success 200 {object} response.TenantResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /tenants/current [get]
func (h *TenantHandler) GetCurrentTenant(c *gin.Context) {
	// Extract user information from JWT context
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User context not found."})
		return
	}

	userID, ok := userIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context."})
		return
	}

	// Check if user is superuser
	isSuperuserVal, _ := c.Get("is_superuser")
	isSuperuser, _ := isSuperuserVal.(bool)

	// Get user's tenant ID from token/context if available
	var userTenantID int
	if userTenantIDVal, exists := c.Get("tenant_id"); exists {
		if tid, ok := userTenantIDVal.(int); ok {
			userTenantID = tid
				utils.Debugf("GetCurrentTenant: Found tenantID in context: %d", tid)
				utils.Debugf("GetCurrentTenant: Found userTenantID in context: %d", tid)
		}
	}

	// If no tenant ID in context, try to get from tenant resolver middleware
	if userTenantID == 0 {
		utils.Debugf("GetCurrentTenant: userTenantID is 0, checking tenantID context...")
		if tenantIDVal, exists := c.Get("tenant_id"); exists {
			if tid, ok := tenantIDVal.(int); ok {
				userTenantID = tid
				utils.Debugf("GetCurrentTenant: Found tenantID in context: %d", tid)
				utils.Debugf("GetCurrentTenant: Found userTenantID in context: %d", tid)
			}
		}
	}

	// Handle superuser case - based on your DB, superusers still have tenant_id
	if isSuperuser {
		if userTenantID == 0 {
		utils.Debugf("GetCurrentTenant: userTenantID is 0, checking tenantID context...")
			// Superuser without specific tenant context (rare case)
			systemResponse := gin.H{
				"type": "system",
				"user_type": "superuser",
				"message": "Superuser has access to all tenants",
				"available_tenants": "Use /tenants endpoint to list all available tenants",
			}
			
			c.JSON(http.StatusOK, gin.H{
				"status": "success",
				"data": systemResponse,
			})
			return
		} else {
			// Superuser with tenant context - get their primary tenant but indicate superuser status
			// Continue to tenant retrieval below, but mark as superuser
		}
	}

	// Handle regular user or superuser with tenant context
	if userTenantID == 0 {
		utils.Debugf("GetCurrentTenant: userTenantID is 0, checking tenantID context...")
		// User has no tenant assignment
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No tenant assignment found for user. Please contact administrator.",
		})
		return
	}

	// Get tenant information
	tenant, err := h.tenantService.GetTenantByID(c.Request.Context(), userTenantID)
	if err != nil {
			utils.Debugf("GetCurrentTenant: Service call failed with error: %v", err)
		if errors.Is(err, utils.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Assigned tenant not found."})
			return
		}
		utils.LogErrorf("TenantHandler.GetCurrentTenant: Error retrieving tenant %d: %v", userTenantID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tenant information."})
		return
	}

	// Add user context to response
	userAccessType := "assigned"
	if isSuperuser {
		userAccessType = "superuser_primary" // Superuser accessing their primary tenant
	}

	response := gin.H{
		"tenant": tenant,
		"user_context": gin.H{
			"user_id": userID,
			"is_superuser": isSuperuser,
			"tenant_access": userAccessType,
			"can_access_other_tenants": isSuperuser, // Superusers can access other tenants
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success", 
		"data": response,
	})
}
