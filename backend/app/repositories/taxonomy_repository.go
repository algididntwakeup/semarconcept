package repositories

import (
	"backend/app/models"
	"backend/app/utils"
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

// TaxonomyRepository defines the interface for taxonomy data operations
type TaxonomyRepository interface {
	// Category operations
	CreateCategory(ctx context.Context, category *models.TaxonomyCategory) error
	GetCategoryByID(ctx context.Context, tenantID, id int) (*models.TaxonomyCategory, error)
	GetCategoryByCode(ctx context.Context, tenantID int, code string) (*models.TaxonomyCategory, error)
	UpdateCategory(ctx context.Context, category *models.TaxonomyCategory) error
	DeleteCategory(ctx context.Context, tenantID, id int) error
	ListCategories(ctx context.Context, tenantID int, parentID *int) ([]models.TaxonomyCategory, error)
	GetCategoryTree(ctx context.Context, tenantID int) ([]models.TaxonomyCategory, error)

	// Attribute operations
	CreateAttribute(ctx context.Context, attribute *models.TaxonomyAttribute) error
	GetAttributeByID(ctx context.Context, tenantID, id int) (*models.TaxonomyAttribute, error)
	UpdateAttribute(ctx context.Context, attribute *models.TaxonomyAttribute) error
	DeleteAttribute(ctx context.Context, tenantID, id int) error
	ListAttributesByCategory(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error)
	GetInheritedAttributes(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error)
}

type taxonomyRepository struct {
	db *sqlx.DB
}

// NewTaxonomyRepository creates a new taxonomy repository instance
func NewTaxonomyRepository(db *sqlx.DB) TaxonomyRepository {
	return &taxonomyRepository{db: db}
}

// CreateCategory creates a new taxonomy category
func (r *taxonomyRepository) CreateCategory(ctx context.Context, category *models.TaxonomyCategory) error {
	query := `
		INSERT INTO taxonomy_categories (tenant_id, parent_id, level, name, code, description, is_active, created_at, updated_at, created_by, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		category.TenantID, category.ParentID, category.Level, category.Name, category.Code, category.Description,
		category.IsActive, time.Now(), time.Now(), category.CreatedBy, category.UpdatedBy,
	).Scan(&category.ID, &category.CreatedAt, &category.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create taxonomy category: %w", err)
	}
	return nil
}

// GetCategoryByID finds a category by its ID
func (r *taxonomyRepository) GetCategoryByID(ctx context.Context, tenantID, id int) (*models.TaxonomyCategory, error) {
	var category models.TaxonomyCategory
	query := `SELECT * FROM taxonomy_categories WHERE id = $1 AND tenant_id = $2`

	err := r.db.GetContext(ctx, &category, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find taxonomy category by ID: %w", err)
	}

	return &category, nil
}

// GetCategoryByCode finds a category by its Code
func (r *taxonomyRepository) GetCategoryByCode(ctx context.Context, tenantID int, code string) (*models.TaxonomyCategory, error) {
	var category models.TaxonomyCategory
	query := `SELECT * FROM taxonomy_categories WHERE code = $1 AND tenant_id = $2`

	err := r.db.GetContext(ctx, &category, query, code, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find taxonomy category by Code: %w", err)
	}

	return &category, nil
}

// UpdateCategory updates an existing taxonomy category
func (r *taxonomyRepository) UpdateCategory(ctx context.Context, category *models.TaxonomyCategory) error {
	query := `
		UPDATE taxonomy_categories 
		SET parent_id = $3, level = $4, name = $5, code = $6, description = $7, is_active = $8, updated_at = $9, updated_by = $10
		WHERE id = $1 AND tenant_id = $2`

	result, err := r.db.ExecContext(ctx, query,
		category.ID, category.TenantID, category.ParentID, category.Level, category.Name, category.Code,
		category.Description, category.IsActive, time.Now(), category.UpdatedBy,
	)

	if err != nil {
		return fmt.Errorf("failed to update taxonomy category: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrNotFound
	}

	return nil
}

// DeleteCategory deletes a category
func (r *taxonomyRepository) DeleteCategory(ctx context.Context, tenantID, id int) error {
	query := `DELETE FROM taxonomy_categories WHERE id = $1 AND tenant_id = $2`
	result, err := r.db.ExecContext(ctx, query, id, tenantID)
	if err != nil {
		return fmt.Errorf("failed to delete taxonomy category: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrNotFound
	}

	return nil
}

// ListCategories retrieves a list of categories
func (r *taxonomyRepository) ListCategories(ctx context.Context, tenantID int, parentID *int) ([]models.TaxonomyCategory, error) {
	var categories []models.TaxonomyCategory
	var query string
	var args []interface{}

	if parentID != nil {
		query = `SELECT * FROM taxonomy_categories WHERE tenant_id = $1 AND parent_id = $2 ORDER BY level, name`
		args = []interface{}{tenantID, *parentID}
	} else {
		query = `SELECT * FROM taxonomy_categories WHERE tenant_id = $1 ORDER BY level, name`
		args = []interface{}{tenantID}
	}

	err := r.db.SelectContext(ctx, &categories, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list taxonomy categories: %w", err)
	}

	return categories, nil
}

// GetCategoryTree retrieves all categories for a tenant (used typically to build a tree structure in service layer)
func (r *taxonomyRepository) GetCategoryTree(ctx context.Context, tenantID int) ([]models.TaxonomyCategory, error) {
	return r.ListCategories(ctx, tenantID, nil)
}

// CreateAttribute creates a new taxonomy attribute
func (r *taxonomyRepository) CreateAttribute(ctx context.Context, attribute *models.TaxonomyAttribute) error {
	query := `
		INSERT INTO taxonomy_attributes (tenant_id, category_id, attribute_name, attribute_key, data_type, is_required, unit_of_measure, default_value, options, display_order, is_active, created_at, updated_at, created_by, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		attribute.TenantID, attribute.CategoryID, attribute.AttributeName, attribute.AttributeKey, attribute.DataType,
		attribute.IsRequired, attribute.UnitOfMeasure, attribute.DefaultValue, attribute.Options, attribute.DisplayOrder,
		attribute.IsActive, time.Now(), time.Now(), attribute.CreatedBy, attribute.UpdatedBy,
	).Scan(&attribute.ID, &attribute.CreatedAt, &attribute.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create taxonomy attribute: %w", err)
	}
	return nil
}

// GetAttributeByID finds an attribute by its ID
func (r *taxonomyRepository) GetAttributeByID(ctx context.Context, tenantID, id int) (*models.TaxonomyAttribute, error) {
	var attribute models.TaxonomyAttribute
	query := `SELECT * FROM taxonomy_attributes WHERE id = $1 AND tenant_id = $2`

	err := r.db.GetContext(ctx, &attribute, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find taxonomy attribute by ID: %w", err)
	}

	return &attribute, nil
}

// UpdateAttribute updates an existing attribute
func (r *taxonomyRepository) UpdateAttribute(ctx context.Context, attribute *models.TaxonomyAttribute) error {
	query := `
		UPDATE taxonomy_attributes 
		SET category_id = $3, attribute_name = $4, attribute_key = $5, data_type = $6, is_required = $7, unit_of_measure = $8, default_value = $9, options = $10, display_order = $11, is_active = $12, updated_at = $13, updated_by = $14
		WHERE id = $1 AND tenant_id = $2`

	result, err := r.db.ExecContext(ctx, query,
		attribute.ID, attribute.TenantID, attribute.CategoryID, attribute.AttributeName, attribute.AttributeKey,
		attribute.DataType, attribute.IsRequired, attribute.UnitOfMeasure, attribute.DefaultValue, attribute.Options,
		attribute.DisplayOrder, attribute.IsActive, time.Now(), attribute.UpdatedBy,
	)

	if err != nil {
		return fmt.Errorf("failed to update taxonomy attribute: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrNotFound
	}

	return nil
}

// DeleteAttribute deletes an attribute
func (r *taxonomyRepository) DeleteAttribute(ctx context.Context, tenantID, id int) error {
	query := `DELETE FROM taxonomy_attributes WHERE id = $1 AND tenant_id = $2`
	result, err := r.db.ExecContext(ctx, query, id, tenantID)
	if err != nil {
		return fmt.Errorf("failed to delete taxonomy attribute: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrNotFound
	}

	return nil
}

// ListAttributesByCategory lists all attributes directly attached to a category
func (r *taxonomyRepository) ListAttributesByCategory(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error) {
	var attributes []models.TaxonomyAttribute
	query := `SELECT * FROM taxonomy_attributes WHERE tenant_id = $1 AND category_id = $2 ORDER BY display_order, attribute_name`

	err := r.db.SelectContext(ctx, &attributes, query, tenantID, categoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to list taxonomy attributes: %w", err)
	}

	return attributes, nil
}

// GetInheritedAttributes retrieves attributes from a specific category up to its root parent (using CTE)
func (r *taxonomyRepository) GetInheritedAttributes(ctx context.Context, tenantID, categoryID int) ([]models.TaxonomyAttribute, error) {
	var attributes []models.TaxonomyAttribute
	
	// Recursive CTE to find all parent categories
	query := `
		WITH RECURSIVE category_tree AS (
			SELECT id, parent_id
			FROM taxonomy_categories
			WHERE id = $2 AND tenant_id = $1
			
			UNION ALL
			
			SELECT p.id, p.parent_id
			FROM taxonomy_categories p
			INNER JOIN category_tree ct ON ct.parent_id = p.id
			WHERE p.tenant_id = $1
		)
		SELECT a.* 
		FROM taxonomy_attributes a
		INNER JOIN category_tree ct ON a.category_id = ct.id
		WHERE a.tenant_id = $1 AND a.is_active = true
		ORDER BY a.display_order, a.attribute_name
	`

	err := r.db.SelectContext(ctx, &attributes, query, tenantID, categoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to get inherited taxonomy attributes: %w", err)
	}

	return attributes, nil
}
