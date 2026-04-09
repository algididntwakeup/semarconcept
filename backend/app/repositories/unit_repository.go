// platform/backend/app/repositories/unit_repository.go
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

// UnitRepository defines the interface for unit data operations
type UnitRepository interface {
	// Core CRUD operations
	Create(ctx context.Context, unit *models.Unit) error
	FindByID(ctx context.Context, tenantID, id int) (*models.Unit, error)
	Update(ctx context.Context, unit *models.Unit) error
	Delete(ctx context.Context, tenantID, id int) error
	List(ctx context.Context, tenantID int, query *request.UnitListQuery) ([]models.Unit, int64, error)
	Search(ctx context.Context, tenantID int, query *request.AssetSearchRequest) ([]models.Unit, int64, error)

	// Validation operations
	ExistsByID(ctx context.Context, tenantID, id int) (bool, error)
	ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error)
	ValidateUniqueness(ctx context.Context, tenantID int, unit *models.Unit) error
	ValidateSiteOwnership(ctx context.Context, tenantID, siteID int) error
	HasActiveAsset(ctx context.Context, tenantID, unitID int) (bool, error)

	// Statistics
	GetStatistics(ctx context.Context, tenantID int) (*models.UnitStatistics, error)
	GetStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error)
	GetTypeDistribution(ctx context.Context, tenantID int) (map[string]int64, error)
	CountByTenant(ctx context.Context, tenantID int) (int64, error)
	CountBySite(ctx context.Context, tenantID, siteID int) (int64, error)
}

// unitRepository implements the UnitRepository interface using SQLX
type unitRepository struct {
	db *sqlx.DB
}

// NewUnitRepository creates a new unit repository instance
func NewUnitRepository(db *sqlx.DB) UnitRepository {
	return &unitRepository{db: db}
}

// Create creates a new unit with tenant isolation
func (r *unitRepository) Create(ctx context.Context, unit *models.Unit) error {
	// Validate site ownership
	if err := r.ValidateSiteOwnership(ctx, unit.TenantID, unit.SiteID); err != nil {
		return err
	}

	// Validate uniqueness
	if err := r.ValidateUniqueness(ctx, unit.TenantID, unit); err != nil {
		return err
	}

	query := `
		INSERT INTO units (tenant_id, site_id, name, code, unit_type, process_description,
		                  design_capacity, operating_capacity, commission_date, decommission_date,
		                  process_conditions, safety_systems, control_systems, status, criticality,
		                  metadata, created_at, updated_at, created_by, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		unit.TenantID, unit.SiteID, unit.Name, unit.Code, unit.UnitType, unit.ProcessDescription,
		unit.DesignCapacity, unit.OperatingCapacity, unit.CommissionDate, unit.DecommissionDate,
		unit.ProcessConditions, unit.SafetySystems, unit.ControlSystems, unit.Status, unit.Criticality,
		unit.Metadata, time.Now(), time.Now(), unit.CreatedBy, unit.UpdatedBy,
	).Scan(&unit.ID, &unit.CreatedAt, &unit.UpdatedAt)

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return utils.ErrUnitDuplicateCode
		}
		return fmt.Errorf("failed to create unit: %w", err)
	}
	return nil
}

// FindByID finds a unit by ID with tenant validation
func (r *unitRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Unit, error) {
	var unit models.Unit
	query := `SELECT * FROM units WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &unit, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrUnitNotFound
		}
		return nil, fmt.Errorf("failed to find unit by ID: %w", err)
	}

	return &unit, nil
}

// Update updates an existing unit
func (r *unitRepository) Update(ctx context.Context, unit *models.Unit) error {
	// Validate site ownership if site changed
	if err := r.ValidateSiteOwnership(ctx, unit.TenantID, unit.SiteID); err != nil {
		return err
	}

	// Validate uniqueness
	if err := r.ValidateUniqueness(ctx, unit.TenantID, unit); err != nil {
		return err
	}

	query := `
		UPDATE units 
		SET site_id = $3, name = $4, code = $5, unit_type = $6, process_description = $7,
		    design_capacity = $8, operating_capacity = $9, commission_date = $10, decommission_date = $11,
		    process_conditions = $12, safety_systems = $13, control_systems = $14, 
		    status = $15, criticality = $16, metadata = $17, updated_at = $18, updated_by = $19
		WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`

	result, err := r.db.ExecContext(ctx, query,
		unit.ID, unit.TenantID, unit.SiteID, unit.Name, unit.Code, unit.UnitType, unit.ProcessDescription,
		unit.DesignCapacity, unit.OperatingCapacity, unit.CommissionDate, unit.DecommissionDate,
		unit.ProcessConditions, unit.SafetySystems, unit.ControlSystems,
		unit.Status, unit.Criticality, unit.Metadata, time.Now(), unit.UpdatedBy,
	)

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return utils.ErrUnitDuplicateCode
		}
		return fmt.Errorf("failed to update unit: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrUnitNotFound
	}

	return nil
}

// Delete soft deletes a unit
func (r *unitRepository) Delete(ctx context.Context, tenantID, id int) error {


	query := `UPDATE units SET deleted_at = $1, updated_at = $2 WHERE id = $3 AND tenant_id = $4 AND deleted_at IS NULL`
	result, err := r.db.ExecContext(ctx, query, time.Now(), time.Now(), id, tenantID)
	if err != nil {
		return fmt.Errorf("failed to soft delete unit: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrUnitNotFound
	}

	return nil
}

// List returns a paginated list of units for a tenant
func (r *unitRepository) List(ctx context.Context, tenantID int, query *request.UnitListQuery) ([]models.Unit, int64, error) {
	var units []models.Unit
	var total int64

	// Build WHERE conditions
	whereConditions := []string{"tenant_id = $1", "deleted_at IS NULL"}
	args := []interface{}{tenantID}
	argCount := 1

	// Apply filters
	if query.Search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(code) LIKE $%d OR LOWER(unit_type) LIKE $%d)", argCount, argCount, argCount))
		searchPattern := "%" + strings.ToLower(query.Search) + "%"
		args = append(args, searchPattern)
	}

	if query.SiteID != nil && *query.SiteID > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("site_id = $%d", argCount))
		args = append(args, *query.SiteID)
	}

	if query.UnitType != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("unit_type = $%d", argCount))
		args = append(args, query.UnitType)
	}

	if query.Status != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("status = $%d", argCount))
		args = append(args, query.Status)
	}

	if query.Criticality != nil && *query.Criticality > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("criticality >= $%d", argCount))
		args = append(args, *query.Criticality)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM units WHERE %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count units: %w", err)
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
		SELECT * FROM units WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`, whereClause, sortField, sortOrder, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &units, listQuery, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list units: %w", err)
	}

	return units, total, nil
}

// Search performs advanced search on units
func (r *unitRepository) Search(ctx context.Context, tenantID int, query *request.AssetSearchRequest) ([]models.Unit, int64, error) {
	var units []models.Unit
	var total int64

	// Build search query
	whereConditions := []string{"tenant_id = $1", "deleted_at IS NULL"}
	args := []interface{}{tenantID}
	argCount := 1

	// Apply search term
	if query.Query != "" {
		argCount++
		searchTerm := "%" + strings.ToLower(query.Query) + "%"
		if query.FuzzySearch {
			whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(code) LIKE $%d OR LOWER(unit_type) LIKE $%d OR LOWER(process_description) LIKE $%d)", argCount, argCount, argCount, argCount))
		} else {
			whereConditions = append(whereConditions, fmt.Sprintf("(name ILIKE $%d OR code ILIKE $%d OR unit_type ILIKE $%d OR process_description ILIKE $%d)", argCount, argCount, argCount, argCount))
		}
		args = append(args, searchTerm)
	}

	// Apply additional filters
	if len(query.AssetTypes) > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("unit_type = ANY($%d)", argCount))
		args = append(args, query.AssetTypes)
	}

	if len(query.Statuses) > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("status = ANY($%d)", argCount))
		args = append(args, query.Statuses)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM units WHERE %s", whereClause)
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
		SELECT * FROM units WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`, whereClause, sortField, sortOrder, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &units, searchQuery, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search units: %w", err)
	}

	return units, total, nil
}

// ===== VALIDATION OPERATIONS =====

// ExistsByID checks if a unit exists by ID
func (r *unitRepository) ExistsByID(ctx context.Context, tenantID, id int) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM units WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, id, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check unit existence: %w", err)
	}
	return count > 0, nil
}

// ExistsByCode checks if a unit exists by code
func (r *unitRepository) ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM units WHERE code = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, code, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check unit code existence: %w", err)
	}
	return count > 0, nil
}

// ValidateUniqueness validates unit uniqueness constraints
func (r *unitRepository) ValidateUniqueness(ctx context.Context, tenantID int, unit *models.Unit) error {
	// Check code uniqueness (if provided)
	if unit.Code != nil && *unit.Code != "" {
		var count int64
		query := `SELECT COUNT(*) FROM units WHERE code = $1 AND tenant_id = $2 AND deleted_at IS NULL`
		args := []interface{}{unit.Code, tenantID}

		// Exclude current unit if updating
		if unit.ID > 0 {
			query += " AND id != $3"
			args = append(args, unit.ID)
		}

		if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
			return fmt.Errorf("failed to validate code uniqueness: %w", err)
		}

		if count > 0 {
			return utils.ErrUnitDuplicateCode
		}
	}

	// Check name uniqueness within the same site
	var count int64
	query := `SELECT COUNT(*) FROM units WHERE name = $1 AND site_id = $2 AND tenant_id = $3 AND deleted_at IS NULL`
	args := []interface{}{unit.Name, unit.SiteID, tenantID}

	// Exclude current unit if updating
	if unit.ID > 0 {
		query += " AND id != $4"
		args = append(args, unit.ID)
	}

	if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
		return fmt.Errorf("failed to validate name uniqueness: %w", err)
	}

	if count > 0 {
		return utils.ErrUnitDuplicateName
	}

	return nil
}

// ValidateSiteOwnership validates that the site belongs to the tenant
func (r *unitRepository) ValidateSiteOwnership(ctx context.Context, tenantID, siteID int) error {
	var count int64
	query := `SELECT COUNT(*) FROM sites WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, siteID, tenantID)
	if err != nil {
		return fmt.Errorf("failed to validate site ownership: %w", err)
	}

	if count == 0 {
		return utils.ErrSiteNotFound
	}

	return nil
}

// HasActiveAsset checks if unit has any active Asset
func (r *unitRepository) HasActiveAsset(ctx context.Context, tenantID, unitID int) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM equipment WHERE unit_id = $1 AND tenant_id = $2 AND status = 'active' AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, unitID, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check active Asset: %w", err)
	}
	return count > 0, nil
}

// ===== STATISTICS =====

// GetStatistics gets unit statistics for tenant
func (r *unitRepository) GetStatistics(ctx context.Context, tenantID int) (*models.UnitStatistics, error) {
	var stats models.UnitStatistics

	// Total count
	totalCount, err := r.CountByTenant(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	stats.TotalUnits = totalCount

	// Status distribution
	statusDist, err := r.GetStatusDistribution(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	stats.StatusDistribution = statusDist

	// Type distribution
	typeDist, err := r.GetTypeDistribution(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	stats.TypeDistribution = typeDist

	return &stats, nil
}

// CountByTenant counts units for a tenant
func (r *unitRepository) CountByTenant(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM units WHERE tenant_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, tenantID)
	return count, err
}

// GetStatusDistribution gets status distribution
func (r *unitRepository) GetStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error) {
	query := `SELECT status, COUNT(*) as count FROM units WHERE tenant_id = $1 AND deleted_at IS NULL GROUP BY status`

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

// GetTypeDistribution gets type distribution
func (r *unitRepository) GetTypeDistribution(ctx context.Context, tenantID int) (map[string]int64, error) {
	query := `SELECT unit_type, COUNT(*) as count FROM units WHERE tenant_id = $1 AND deleted_at IS NULL GROUP BY unit_type`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get type distribution: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]int64)
	for rows.Next() {
		var unitType string
		var count int64
		if err := rows.Scan(&unitType, &count); err != nil {
			return nil, fmt.Errorf("failed to scan type distribution: %w", err)
		}
		distribution[unitType] = count
	}

	return distribution, nil
}

// CountBySite counts units by site
func (r *unitRepository) CountBySite(ctx context.Context, tenantID, siteID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM units WHERE site_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, siteID, tenantID)
	return count, err
}
