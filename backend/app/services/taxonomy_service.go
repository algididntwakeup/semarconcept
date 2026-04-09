package services

import (
	"backend/app/models"
	"backend/app/repositories"
	"context"
	"fmt"
)

// TaxonomyService defines the business logic interface for taxonomy
type TaxonomyService interface {
	// Category ops
	CreateCategory(ctx context.Context, category *models.TaxonomyCategory) error
	GetCategoryByID(ctx context.Context, tenantID, id int) (*models.TaxonomyCategory, error)
	GetCategoryByCode(ctx context.Context, tenantID int, code string) (*models.TaxonomyCategory, error)
	UpdateCategory(ctx context.Context, tenantID int, id int, req *models.TaxonomyCategory) error
	DeleteCategory(ctx context.Context, tenantID, id int) error
	GetCategoryTree(ctx context.Context, tenantID int) ([]models.TaxonomyCategory, error)
	ListCategories(ctx context.Context, tenantID int, parentID *int) ([]models.TaxonomyCategory, error)

	// Attribute ops
	CreateAttribute(ctx context.Context, attribute *models.TaxonomyAttribute) error
	GetAttributeByID(ctx context.Context, tenantID, id int) (*models.TaxonomyAttribute, error)
	UpdateAttribute(ctx context.Context, tenantID int, id int, req *models.TaxonomyAttribute) error
	DeleteAttribute(ctx context.Context, tenantID, id int) error
	ListAttributesByCategory(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error)
	GetInheritedAttributes(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error)
}

type taxonomyService struct {
	repo repositories.TaxonomyRepository
}

// NewTaxonomyService creates a new taxonomy service
func NewTaxonomyService(repo repositories.TaxonomyRepository) TaxonomyService {
	return &taxonomyService{repo: repo}
}

// Category Operations

func (s *taxonomyService) CreateCategory(ctx context.Context, category *models.TaxonomyCategory) error {
	// Add business logic/validation if necessary
	if category.Level <= 0 && category.ParentID == nil {
		category.Level = 1 // default for root
	} else if category.ParentID != nil && category.Level <= 0 {
		parent, err := s.repo.GetCategoryByID(ctx, category.TenantID, *category.ParentID)
		if err != nil {
			return fmt.Errorf("failed to get parent category: %w", err)
		}
		category.Level = parent.Level + 1
	}

	return s.repo.CreateCategory(ctx, category)
}

func (s *taxonomyService) GetCategoryByID(ctx context.Context, tenantID, id int) (*models.TaxonomyCategory, error) {
	return s.repo.GetCategoryByID(ctx, tenantID, id)
}

func (s *taxonomyService) GetCategoryByCode(ctx context.Context, tenantID int, code string) (*models.TaxonomyCategory, error) {
	return s.repo.GetCategoryByCode(ctx, tenantID, code)
}

func (s *taxonomyService) UpdateCategory(ctx context.Context, tenantID int, id int, req *models.TaxonomyCategory) error {
	existing, err := s.repo.GetCategoryByID(ctx, tenantID, id)
	if err != nil {
		return err
	}

	// Update allowed fields
	existing.Name = req.Name
	existing.Code = req.Code
	existing.Description = req.Description
	existing.IsActive = req.IsActive
	existing.ParentID = req.ParentID
	existing.Level = req.Level

	existing.UpdatedBy = req.UpdatedBy

	return s.repo.UpdateCategory(ctx, existing)
}

func (s *taxonomyService) DeleteCategory(ctx context.Context, tenantID, id int) error {
	return s.repo.DeleteCategory(ctx, tenantID, id)
}

// GetCategoryTree returns the hierarchical tree of categories structure
func (s *taxonomyService) GetCategoryTree(ctx context.Context, tenantID int) ([]models.TaxonomyCategory, error) {
	flatCategories, err := s.repo.GetCategoryTree(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	return BuildCategoryTree(flatCategories), nil
}

func (s *taxonomyService) ListCategories(ctx context.Context, tenantID int, parentID *int) ([]models.TaxonomyCategory, error) {
	return s.repo.ListCategories(ctx, tenantID, parentID)
}

// Attribute Operations

func (s *taxonomyService) CreateAttribute(ctx context.Context, attribute *models.TaxonomyAttribute) error {
	// Verify category exists
	if _, err := s.repo.GetCategoryByID(ctx, attribute.TenantID, attribute.CategoryID); err != nil {
		return fmt.Errorf("invalid category: %w", err)
	}

	if attribute.DataType == "" {
		attribute.DataType = models.AttributeTypeString
	}

	return s.repo.CreateAttribute(ctx, attribute)
}

func (s *taxonomyService) GetAttributeByID(ctx context.Context, tenantID, id int) (*models.TaxonomyAttribute, error) {
	return s.repo.GetAttributeByID(ctx, tenantID, id)
}

func (s *taxonomyService) UpdateAttribute(ctx context.Context, tenantID int, id int, req *models.TaxonomyAttribute) error {
	existing, err := s.repo.GetAttributeByID(ctx, tenantID, id)
	if err != nil {
		return err
	}

	existing.AttributeName = req.AttributeName
	existing.AttributeKey = req.AttributeKey
	existing.DataType = req.DataType
	existing.IsRequired = req.IsRequired
	existing.UnitOfMeasure = req.UnitOfMeasure
	existing.DefaultValue = req.DefaultValue
	existing.Options = req.Options
	existing.DisplayOrder = req.DisplayOrder
	existing.IsActive = req.IsActive
	existing.UpdatedBy = req.UpdatedBy

	return s.repo.UpdateAttribute(ctx, existing)
}

func (s *taxonomyService) DeleteAttribute(ctx context.Context, tenantID, id int) error {
	return s.repo.DeleteAttribute(ctx, tenantID, id)
}

func (s *taxonomyService) ListAttributesByCategory(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error) {
	return s.repo.ListAttributesByCategory(ctx, tenantID, categoryID)
}

func (s *taxonomyService) GetInheritedAttributes(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error) {
	return s.repo.GetInheritedAttributes(ctx, tenantID, categoryID)
}

// BuildCategoryTree organizes a flat list of categories into a tree layout
func BuildCategoryTree(categories []models.TaxonomyCategory) []models.TaxonomyCategory {
	var tree []models.TaxonomyCategory
	categoryMap := make(map[int]*models.TaxonomyCategory)

	// Convert and reference all nodes
	for i := range categories {
		categoryMap[categories[i].ID] = &categories[i]
	}

	// Link children to parents
	for i := range categories {
		if categories[i].ParentID != nil {
			if parent, exists := categoryMap[*categories[i].ParentID]; exists {
				parent.Children = append(parent.Children, categories[i])
			}
		} else {
			// Unparented items are roots
			tree = append(tree, categories[i])
		}
	}

	return tree
}
