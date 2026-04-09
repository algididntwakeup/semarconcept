// platform/backend/app/api/handlers/config_handler.go

package handlers

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type ConfigHandler struct {
	configRepo repositories.ConfigurationRepository
}

func NewConfigHandler(configRepo repositories.ConfigurationRepository) *ConfigHandler {
	return &ConfigHandler{
		configRepo: configRepo,
	}
}

// ListConfigs handles GET /api/v1/config
func (h *ConfigHandler) ListConfigs(c *gin.Context) {
	configs, err := h.configRepo.ListAll(c.Request.Context())
	if err != nil {
		utils.Errorf("Error listing configurations: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configurations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    configs,
		"count":   len(configs),
		"status":  "success",
		"message": "Configurations retrieved successfully",
	})
}

// GetConfigsByCategory handles GET /api/v1/config/category/:category
func (h *ConfigHandler) GetConfigsByCategory(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category is required"})
		return
	}

	configs, err := h.configRepo.ListByCategory(c.Request.Context(), category)
	if err != nil {
		utils.Errorf("Error getting configurations for category %s: %v", category, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configurations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":     configs,
		"count":    len(configs),
		"category": category,
		"status":   "success",
		"message":  "Configurations retrieved successfully",
	})
}

// GetConfig handles GET /api/v1/config/:key
func (h *ConfigHandler) GetConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Configuration key is required"})
		return
	}

	config, err := h.configRepo.GetByKey(c.Request.Context(), key)
	if err != nil {
		utils.Errorf("Error getting configuration %s: %v", key, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Configuration not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    config,
		"status":  "success",
		"message": "Configuration retrieved successfully",
	})
}

// CreateConfig handles POST /api/v1/config
func (h *ConfigHandler) CreateConfig(c *gin.Context) {
	var req request.CreateConfigRequest

	// Bind JSON request to struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
			"status":  "bad_request",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
			"status":  "validation_error",
		})
		return
	}

	// Convert request to model
	config := &models.SystemConfig{
		ConfigKey:   req.ConfigKey,
		ConfigValue: req.ConfigValue,
		DataType:    req.DataType,
		IsEncrypted: req.IsEncrypted,
		Description: req.Description,
		CategoryID:  req.CategoryID,
		TenantID:    req.TenantID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Create configuration
	if err := h.configRepo.Create(c.Request.Context(), config); err != nil {
		utils.Errorf("Error creating configuration: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create configuration",
			"details": err.Error(),
			"status":  "internal_error",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    config,
		"status":  "success",
		"message": "Configuration created successfully",
	})
}

// UpdateConfig handles PUT /api/v1/config/:key
func (h *ConfigHandler) UpdateConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "Configuration key is required",
			"status": "bad_request",
		})
		return
	}

	var req request.UpdateConfigRequest

	// Bind JSON request to struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
			"status":  "bad_request",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
			"status":  "validation_error",
		})
		return
	}

	// Get existing configuration
	existingConfig, err := h.configRepo.GetByKey(c.Request.Context(), key)
	if err != nil {
		utils.Errorf("Error getting configuration %s: %v", key, err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Configuration not found",
			"details": err.Error(),
			"status":  "not_found",
		})
		return
	}

	// Update fields if provided
	if req.ConfigValue != "" {
		existingConfig.ConfigValue = req.ConfigValue
	}
	if req.DataType != "" {
		existingConfig.DataType = req.DataType
	}
	if req.IsEncrypted != nil {
		existingConfig.IsEncrypted = *req.IsEncrypted
	}
	if req.Description != nil {
		existingConfig.Description = req.Description
	}
	if req.CategoryID != nil {
		existingConfig.CategoryID = req.CategoryID
	}

	// Update timestamp
	existingConfig.UpdatedAt = time.Now()

	// Save updated configuration
	if err := h.configRepo.Update(c.Request.Context(), existingConfig); err != nil {
		utils.Errorf("Error updating configuration %s: %v", key, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update configuration",
			"details": err.Error(),
			"status":  "internal_error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    existingConfig,
		"status":  "success",
		"message": "Configuration updated successfully",
	})
}

// DeleteConfig handles DELETE /api/v1/config/:key
func (h *ConfigHandler) DeleteConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "Configuration key is required",
			"status": "bad_request",
		})
		return
	}

	// Get existing configuration to get ID for deletion
	existingConfig, err := h.configRepo.GetByKey(c.Request.Context(), key)
	if err != nil {
		utils.Errorf("Error getting configuration %s: %v", key, err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Configuration not found",
			"details": err.Error(),
			"status":  "not_found",
		})
		return
	}

	// Delete configuration by ID
	if err := h.configRepo.Delete(c.Request.Context(), uint(existingConfig.ID)); err != nil {
		utils.Errorf("Error deleting configuration %s: %v", key, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete configuration",
			"details": err.Error(),
			"status":  "internal_error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"message":     "Configuration deleted successfully",
		"deleted_key": key,
		"deleted_id":  existingConfig.ID,
	})
}
