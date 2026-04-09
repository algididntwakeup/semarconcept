// platform/backend/app/repositories/site_repository.go
package repositories

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/utils"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// SiteRepository defines the interface for site data operations
type SiteRepository interface {
	// Core CRUD operations
	Create(ctx context.Context, site *models.Site) error
	FindByID(ctx context.Context, tenantID, id int) (*models.Site, error)
	Update(ctx context.Context, site *models.Site) error
	Delete(ctx context.Context, tenantID, id int) error
	List(ctx context.Context, tenantID int, query *request.SiteListQuery) ([]models.Site, int64, error)
	Search(ctx context.Context, tenantID int, query *request.AssetSearchRequest) ([]models.Site, int64, error)

	// Validation operations
	ExistsByID(ctx context.Context, tenantID, id int) (bool, error)
	ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error)
	ValidateUniqueness(ctx context.Context, tenantID int, site *models.Site) error
	HasActiveUnits(ctx context.Context, tenantID, siteID int) (bool, error)

	// Statistics
	GetStatistics(ctx context.Context, tenantID int) (*models.SiteStatistics, error)
	GetStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error)
	CountByTenant(ctx context.Context, tenantID int) (int64, error)
}

// siteRepository implements the SiteRepository interface using SQLX
type siteRepository struct {
	db *sqlx.DB
}

// NewSiteRepository creates a new site repository instance
func NewSiteRepository(db *sqlx.DB) SiteRepository {
	return &siteRepository{db: db}
}

// Create creates a new site with tenant isolation
func (r *siteRepository) Create(ctx context.Context, site *models.Site) error {
	// Validate uniqueness
	if err := r.ValidateUniqueness(ctx, site.TenantID, site); err != nil {
		return err
	}

	query := `
		INSERT INTO sites (tenant_id, name, code, location, site_type, description, 
		                  commission_date, decommission_date, address, coordinates, 
		                  contact_info, operating_conditions, environmental_factors, 
		                  status, metadata, created_at, updated_at, created_by, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		site.TenantID, site.Name, site.Code, site.Location, site.SiteType, site.Description,
		site.CommissionDate, site.DecommissionDate, site.Address, site.Coordinates,
		site.ContactInfo, site.OperatingConditions, site.EnvironmentalFactors,
		site.Status, site.Metadata, time.Now(), time.Now(), site.CreatedBy, site.UpdatedBy,
	).Scan(&site.ID, &site.CreatedAt, &site.UpdatedAt)

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return utils.ErrSiteDuplicateCode
		}
		return fmt.Errorf("failed to create site: %w", err)
	}
	return nil
}

// FindByID finds a site by ID with tenant validation
func (r *siteRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Site, error) {
	var site models.Site
	query := `SELECT * FROM sites WHERE id = $1 AND tenant_id = $2 AND status != 'deleted'`

	err := r.db.GetContext(ctx, &site, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrSiteNotFound
		}
		return nil, fmt.Errorf("failed to find site by ID: %w", err)
	}

	return &site, nil
}

// Update updates an existing site
func (r *siteRepository) Update(ctx context.Context, site *models.Site) error {
	if err := r.ValidateUniqueness(ctx, site.TenantID, site); err != nil {
		return err
	}

	query := `
		UPDATE sites 
		SET name = $3, code = $4, location = $5, site_type = $6, description = $7,
		    commission_date = $8, decommission_date = $9, address = $10, coordinates = $11,
		    contact_info = $12, operating_conditions = $13, environmental_factors = $14,
		    status = $15, metadata = $16, updated_at = $17, updated_by = $18
		WHERE id = $1 AND tenant_id = $2 AND status != 'deleted'`

	result, err := r.db.ExecContext(ctx, query,
		site.ID, site.TenantID, site.Name, site.Code, site.Location, site.SiteType, site.Description,
		site.CommissionDate, site.DecommissionDate, site.Address, site.Coordinates,
		site.ContactInfo, site.OperatingConditions, site.EnvironmentalFactors,
		site.Status, site.Metadata, time.Now(), site.UpdatedBy,
	)

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return utils.ErrSiteDuplicateCode
		}
		return fmt.Errorf("failed to update site: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrSiteNotFound
	}

	return nil
}

// Delete soft deletes a site by setting status to 'deleted'
func (r *siteRepository) Delete(ctx context.Context, tenantID, id int) error {


	query := `UPDATE sites SET status = 'deleted', updated_at = $1 WHERE id = $2 AND tenant_id = $3 AND status != 'deleted'`
	result, err := r.db.ExecContext(ctx, query, time.Now(), id, tenantID)
	if err != nil {
		return fmt.Errorf("failed to soft delete site: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrSiteNotFound
	}

	return nil
}

// List returns a paginated list of sites for a tenant
func (r *siteRepository) List(ctx context.Context, tenantID int, query *request.SiteListQuery) ([]models.Site, int64, error) {
	var sites []models.Site
	var total int64

	// Build WHERE conditions
	whereConditions := []string{"tenant_id = $1", "status != 'deleted'"}
	args := []interface{}{tenantID}
	argCount := 1

	// Apply filters
	if query.Search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(code) LIKE $%d OR LOWER(location) LIKE $%d)", argCount, argCount, argCount))
		searchPattern := "%" + strings.ToLower(query.Search) + "%"
		args = append(args, searchPattern)
	}

	if query.SiteType != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("site_type = $%d", argCount))
		args = append(args, query.SiteType)
	}

	if query.Status != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("status = $%d", argCount))
		args = append(args, query.Status)
	}

	if query.Location != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("LOWER(location) LIKE $%d", argCount))
		locationPattern := "%" + strings.ToLower(query.Location) + "%"
		args = append(args, locationPattern)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sites WHERE %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count sites: %w", err)
	}

	// Get paginated results
	sortField := "name"
	sortOrder := "ASC"
	if query.SortBy != "" {
		sortField = query.SortBy
	}
	if query.SortOrder != "" {
		sortOrder = strings.ToUpper(query.SortOrder)
	}

	// Set defaults for pagination
	limit := query.Limit
	if limit <= 0 {
		limit = 20
	}
	offset := 0
	if query.Page > 1 {
		offset = (query.Page - 1) * limit
	}

	listQuery := fmt.Sprintf(`
		SELECT * FROM sites WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`, whereClause, sortField, sortOrder, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &sites, listQuery, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list sites: %w", err)
	}

	return sites, total, nil
}

// Search performs advanced search on sites
func (r *siteRepository) Search(ctx context.Context, tenantID int, query *request.AssetSearchRequest) ([]models.Site, int64, error) {
	var sites []models.Site
	var total int64

	// Build search query
	whereConditions := []string{"tenant_id = $1", "status != 'deleted'"}
	args := []interface{}{tenantID}
	argCount := 1

	// Apply search term
	if query.Query != "" {
		argCount++
		searchTerm := "%" + strings.ToLower(query.Query) + "%"
		if query.FuzzySearch {
			whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(code) LIKE $%d OR LOWER(location) LIKE $%d OR LOWER(description) LIKE $%d)", argCount, argCount, argCount, argCount))
		} else {
			whereConditions = append(whereConditions, fmt.Sprintf("(name ILIKE $%d OR code ILIKE $%d OR location ILIKE $%d OR description ILIKE $%d)", argCount, argCount, argCount, argCount))
		}
		args = append(args, searchTerm)
	}

	// Apply additional filters
	if len(query.AssetTypes) > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("site_type = ANY($%d)", argCount))
		args = append(args, query.AssetTypes)
	}

	if len(query.Statuses) > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("status = ANY($%d)", argCount))
		args = append(args, query.Statuses)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sites WHERE %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %w", err)
	}

	// Apply sorting and pagination
	sortField := "name"
	sortOrder := "ASC"
	if query.SortBy != "" && query.SortOrder != "" {
		sortField = query.SortBy
		sortOrder = strings.ToUpper(query.SortOrder)
	}

	limit := query.Limit
	if limit <= 0 {
		limit = 20
	}
	offset := 0
	if query.Page > 1 {
		offset = (query.Page - 1) * limit
	}

	searchQuery := fmt.Sprintf(`
		SELECT * FROM sites WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`, whereClause, sortField, sortOrder, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &sites, searchQuery, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search sites: %w", err)
	}

	return sites, total, nil
}

// ===== VALIDATION OPERATIONS =====

// ExistsByID checks if a site exists by ID
func (r *siteRepository) ExistsByID(ctx context.Context, tenantID, id int) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM sites WHERE id = $1 AND tenant_id = $2 AND status != 'deleted'`
	err := r.db.GetContext(ctx, &count, query, id, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check site existence: %w", err)
	}
	return count > 0, nil
}

// ExistsByCode checks if a site exists by code
func (r *siteRepository) ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM sites WHERE code = $1 AND tenant_id = $2 AND status != 'deleted'`
	err := r.db.GetContext(ctx, &count, query, code, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check site code existence: %w", err)
	}
	return count > 0, nil
}

// ValidateUniqueness validates site uniqueness constraints
func (r *siteRepository) ValidateUniqueness(ctx context.Context, tenantID int, site *models.Site) error {
	// Check code uniqueness (if provided)
	if site.Code != nil && *site.Code != "" {
		var count int64
		query := `SELECT COUNT(*) FROM sites WHERE code = $1 AND tenant_id = $2 AND status != 'deleted'`
		args := []interface{}{site.Code, tenantID}

		// Exclude current site if updating
		if site.ID > 0 {
			query += " AND id != $3"
			args = append(args, site.ID)
		}

		if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
			return fmt.Errorf("failed to validate code uniqueness: %w", err)
		}

		if count > 0 {
			return utils.ErrSiteDuplicateCode
		}
	}

	// Check name uniqueness
	var count int64
	query := `SELECT COUNT(*) FROM sites WHERE name = $1 AND tenant_id = $2 AND status != 'deleted'`
	args := []interface{}{site.Name, tenantID}

	// Exclude current site if updating
	if site.ID > 0 {
		query += " AND id != $3"
		args = append(args, site.ID)
	}

	if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
		return fmt.Errorf("failed to validate name uniqueness: %w", err)
	}

	if count > 0 {
		return utils.ErrSiteDuplicateName
	}

	return nil
}

// HasActiveUnits checks if site has any active units
func (r *siteRepository) HasActiveUnits(ctx context.Context, tenantID, siteID int) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM units WHERE site_id = $1 AND tenant_id = $2 AND status = 'active'`
	err := r.db.GetContext(ctx, &count, query, siteID, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check active units: %w", err)
	}
	return count > 0, nil
}

// ===== STATISTICS =====

// GetStatistics returns comprehensive site statistics
func (r *siteRepository) GetStatistics(ctx context.Context, tenantID int) (*models.SiteStatistics, error) {
	var stats models.SiteStatistics

	// Total count
	totalQuery := `SELECT COUNT(*) FROM sites WHERE tenant_id = $1 AND status != 'deleted'`
	if err := r.db.GetContext(ctx, &stats.Total, totalQuery, tenantID); err != nil {
		return nil, fmt.Errorf("failed to count total sites: %w", err)
	}

	// Active count
	activeQuery := `SELECT COUNT(*) FROM sites WHERE tenant_id = $1 AND status = 'active'`
	if err := r.db.GetContext(ctx, &stats.Active, activeQuery, tenantID); err != nil {
		return nil, fmt.Errorf("failed to count active sites: %w", err)
	}

	// Inactive count
	inactiveQuery := `SELECT COUNT(*) FROM sites WHERE tenant_id = $1 AND status = 'inactive'`
	if err := r.db.GetContext(ctx, &stats.Inactive, inactiveQuery, tenantID); err != nil {
		return nil, fmt.Errorf("failed to count inactive sites: %w", err)
	}

	// Get status distribution
	statusDist, err := r.GetStatusDistribution(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	stats.ByStatus = statusDist

	return &stats, nil
}

// GetStatusDistribution returns site count by status
func (r *siteRepository) GetStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error) {
	query := `SELECT status, COUNT(*) as count FROM sites WHERE tenant_id = $1 AND status != 'deleted' GROUP BY status`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get status distribution: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]int64)
	for rows.Next() {
		var status string
		var count int64
		if err := rows.Scan(&status, &count); err != nil {
			return nil, fmt.Errorf("failed to scan status distribution: %w", err)
		}
		distribution[status] = count
	}

	return distribution, nil
}

// CountByTenant returns total site count for tenant
func (r *siteRepository) CountByTenant(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM sites WHERE tenant_id = $1 AND status != 'deleted'`
	err := r.db.GetContext(ctx, &count, query, tenantID)
	if err != nil {
		return 0, fmt.Errorf("failed to count sites by tenant: %w", err)
	}
	return count, nil
}
