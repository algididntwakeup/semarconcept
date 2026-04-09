// platform/backend/app/api/handlers/media_handler.go

package handlers

import (
	"backend/app/services"
	"backend/app/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// MediaHandler handles media-related HTTP requests
type MediaHandler struct {
	mediaService services.MediaService
}

// NewMediaHandler creates a new MediaHandler
func NewMediaHandler(mediaService services.MediaService) *MediaHandler {
	return &MediaHandler{
		mediaService: mediaService,
	}
}

// UploadFile handles file upload requests
// @Summary Upload file
// @Description Upload a file to the media storage
// @Tags media
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Param description formData string false "File description"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /media/upload [post]
func (h *MediaHandler) UploadFile(c *gin.Context) {
	// Get the uploaded file
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No file provided or invalid file",
			"details": err.Error(),
		})
		return
	}

	// Get optional description
	description := c.PostForm("description")

	// Extract uploader ID from context (set by auth middleware)
	var uploaderID *int
	if ctxUserID, exists := c.Get("user_id"); exists {
		if userIDInt, ok := ctxUserID.(int); ok {
			uploaderID = &userIDInt
		}
	}

	// Call service to upload file
	media, err := h.mediaService.UploadFile(c.Request.Context(), fileHeader, uploaderID, description)
	if err != nil {
		utils.Errorf("Error uploading file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to upload file",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File uploaded successfully",
		"data": gin.H{
			"id":          media.ID,
			"filename":    media.Filename,
			"url":         media.URL,
			"size":        media.Size,
			"mime_type":   media.MimeType,
			"uploaded_at": media.CreatedAt,
		},
	})
}

// DeleteFile handles file deletion requests
// @Summary Delete file
// @Description Delete a file from media storage
// @Tags media
// @Accept json
// @Produce json
// @Param id path string true "Media file ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /media/{id} [delete]
func (h *MediaHandler) DeleteFile(c *gin.Context) {
	mediaIDStr := c.Param("id")
	if mediaIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Media ID is required",
		})
		return
	}

	// Parse media ID as integer (matching database schema)
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid media ID format",
			"details": err.Error(),
		})
		return
	}

	// Call service to delete file
	err = h.mediaService.DeleteFile(c.Request.Context(), mediaID)
	if err != nil {
		if err.Error() == "media record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Media file not found",
			})
			return
		}
		utils.Errorf("Error deleting file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete file",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File deleted successfully",
	})
}

// GetMediaURL retrieves the public URL for a media file
// @Summary Get media URL
// @Description Get the public URL for accessing a media file
// @Tags media
// @Accept json
// @Produce json
// @Param id path string true "Media file ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /media/{id}/url [get]
func (h *MediaHandler) GetMediaURL(c *gin.Context) {
	mediaIDStr := c.Param("id")
	if mediaIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Media ID is required",
		})
		return
	}

	// Parse media ID as integer (matching database schema)
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid media ID format",
			"details": err.Error(),
		})
		return
	}

	// For this endpoint, we need to get the media record first
	// This requires adding a GetByID method to the media service
	// For now, we'll return a simple response indicating the endpoint structure

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"media_id": mediaID,
			"url":      "/static/uploads/placeholder.jpg", // Placeholder
			"message":  "URL retrieval functionality to be implemented",
		},
	})
}

// Additional helper methods could be added here:

// ListMediaFiles could retrieve a paginated list of media files
// GetMediaInfo could retrieve detailed information about a media file
// UpdateMediaMetadata could update file metadata like description
// GenerateThumbnail could create thumbnails for image files
