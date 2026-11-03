// platform/backend/app/services/functional_location_service.go
package services

import (
	"backend/app/models"
	"backend/app/repositories"
	"context"
	"fmt"
)

// FunctionalLocationService defines business operations for functional locations
type FunctionalLocationService interface {
	GetTree(ctx context.Context, tenantID int) ([]*models.FunctionalLocationNode, error)
	GetAll(ctx context.Context, tenantID int) ([]models.FunctionalLocation, error)
	GetByID(ctx context.Context, tenantID, id int) (*models.FunctionalLocation, error)
	GetEquipments(ctx context.Context, tenantID, id int) ([]models.EquipmentSummary, error)
}

type functionalLocationService struct {
	repo repositories.FunctionalLocationRepository
}

// NewFunctionalLocationService creates a new functional location service
func NewFunctionalLocationService(repo repositories.FunctionalLocationRepository) FunctionalLocationService {
	return &functionalLocationService{repo: repo}
}

// GetTree returns the entire hierarchical functional location tree
func (s *functionalLocationService) GetTree(ctx context.Context, tenantID int) ([]*models.FunctionalLocationNode, error) {
	if tenantID <= 0 {
		return nil, fmt.Errorf("tenant ID is required")
	}
	return s.repo.GetTree(ctx, tenantID)
}

// GetAll returns flat list of functional locations
func (s *functionalLocationService) GetAll(ctx context.Context, tenantID int) ([]models.FunctionalLocation, error) {
	if tenantID <= 0 {
		return nil, fmt.Errorf("tenant ID is required")
	}
	return s.repo.GetAll(ctx, tenantID)
}

// GetByID retrieves a functional location by ID
func (s *functionalLocationService) GetByID(ctx context.Context, tenantID, id int) (*models.FunctionalLocation, error) {
	if tenantID <= 0 {
		return nil, fmt.Errorf("tenant ID is required")
	}
	if id <= 0 {
		return nil, fmt.Errorf("functional location ID is required")
	}
	return s.repo.GetByID(ctx, tenantID, id)
}

// GetEquipments retrieves installed equipment at a functional location
func (s *functionalLocationService) GetEquipments(ctx context.Context, tenantID, id int) ([]models.EquipmentSummary, error) {
	if tenantID <= 0 {
		return nil, fmt.Errorf("tenant ID is required")
	}
	if id <= 0 {
		return nil, fmt.Errorf("functional location ID is required")
	}
	return s.repo.GetEquipments(ctx, tenantID, id)
}

