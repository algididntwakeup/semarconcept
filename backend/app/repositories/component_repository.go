// platform/backend/app/repositories/component_repository.go
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

// ComponentRepository defines the interface for component data operations
type ComponentRepository interface {
	// Core CRUD operations
	Create(ctx context.Context, component *models.Component) error
	FindByID(ctx context.Context, tenantID, id int) (*models.Component, error)
	Update(ctx context.Context, component *models.Component) error
	Delete(ctx context.Context, tenantID, id int) error
	List(ctx context.Context, tenantID int, query *request.ComponentListQuery) ([]models.Component, int64, error)
	Search(ctx context.Context, tenantID int, query *request.AssetSearchRequest) ([]models.Component, int64, error)

	// Validation operations
	ExistsByID(ctx context.Context, tenantID, id int) (bool, error)
	ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error)
	ValidateUniqueness(ctx context.Context, tenantID int, component *models.Component) error
	ValidateAssetOwnership(ctx context.Context, tenantID, AssetID int) error
	HasActiveDegradationMechanisms(ctx context.Context, tenantID, componentID int) (bool, error)

	// Statistics
	GetStatistics(ctx context.Context, tenantID int) (*models.ComponentStatistics, error)
	GetStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error)
	GetTypeDistribution(ctx context.Context, tenantID int) (map[string]int64, error)
	GetIntegrityStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error)
	CountByTenant(ctx context.Context, tenantID int) (int64, error)
	CountByAsset(ctx context.Context, tenantID, AssetID int) (int64, error)
	CountCritical(ctx context.Context, tenantID int, minCriticality int) (int64, error)

	// Inspection-related operations
	FindComponentsRequiringInspection(ctx context.Context, tenantID int, daysFromNow int) ([]models.Component, error)
	FindOverdueComponents(ctx context.Context, tenantID int) ([]models.Component, error)
	UpdateInspectionDates(ctx context.Context, tenantID, componentID int, lastInspection, nextInspection time.Time) error
	GetInspectionSchedule(ctx context.Context, tenantID int, from, to time.Time) ([]models.Component, error)

	// Integrity management
	FindComponentsByIntegrityStatus(ctx context.Context, tenantID int, status string) ([]models.Component, error)
	FindCriticalComponents(ctx context.Context, tenantID int) ([]models.Component, error)
	UpdateThickness(ctx context.Context, tenantID, componentID int, currentThickness float64) error
}

// componentRepository implements the ComponentRepository interface using SQLX
type componentRepository struct {
	db *sqlx.DB
}

// NewComponentRepository creates a new component repository instance
func NewComponentRepository(db *sqlx.DB) ComponentRepository {
	return &componentRepository{db: db}
}

// Create creates a new component with tenant isolation
func (r *componentRepository) Create(ctx context.Context, component *models.Component) error {
	// Validate Asset ownership
	if err := r.ValidateAssetOwnership(ctx, component.TenantID, component.AssetID); err != nil {
		return err
	}

	// Validate uniqueness
	if err := r.ValidateUniqueness(ctx, component.TenantID, component); err != nil {
		return err
	}

	query := `
		INSERT INTO components (tenant_id, equipment_id, name, component_code, component_type, component_class,
		                       material, design_thickness_mm, current_thickness_mm, minimum_thickness_mm,
		                       design_pressure_bar, design_temperature_c, operating_pressure_bar, operating_temperature_c,
		                       installation_date, last_replacement_date, next_replacement_date,
		                       specifications, dimensions, location_description, accessibility,
		                       insulation_type, coating_type, cathodic_protection, inspection_access,
		                       inspection_frequency_months, last_inspection_date, next_inspection_date,
		                       integrity_status, fitness_for_service, remaining_life_years, confidence_level,
		                       status, criticality, consequence_of_failure, safety_critical, environmentally_critical,
		                       metadata, created_at, updated_at, created_by, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		component.TenantID, component.AssetID, component.Name, component.ComponentCode, component.ComponentType, component.ComponentClass,
		component.Material, component.DesignThicknessMM, component.CurrentThicknessMM, component.MinimumThicknessMM,
		component.DesignPressureBar, component.DesignTemperatureC, component.OperatingPressureBar, component.OperatingTemperatureC,
		component.InstallationDate, component.LastReplacementDate, component.NextReplacementDate,
		component.Specifications, component.Dimensions, component.LocationDescription, component.Accessibility,
		component.InsulationType, component.CoatingType, component.CathodicProtection, component.InspectionAccess,
		component.InspectionFrequencyMonths, component.LastInspectionDate, component.NextInspectionDate,
		component.IntegrityStatus, component.FitnessForService, component.RemainingLifeYears, component.ConfidenceLevel,
		component.Status, component.Criticality, component.ConsequenceOfFailure, component.SafetyCritical, component.EnvironmentallyCritical,
		component.Metadata, time.Now(), time.Now(), component.CreatedBy, component.UpdatedBy,
	).Scan(&component.ID, &component.CreatedAt, &component.UpdatedAt)

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return utils.ErrComponentDuplicateCode
		}
		return fmt.Errorf("failed to create component: %w", err)
	}
	return nil
}

// FindByID finds a component by ID with tenant validation
func (r *componentRepository) FindByID(ctx context.Context, tenantID, id int) (*models.Component, error) {
	var component models.Component
	query := `SELECT * FROM components WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &component, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrComponentNotFound
		}
		return nil, fmt.Errorf("failed to find component by ID: %w", err)
	}

	return &component, nil
}

// Update updates an existing component
func (r *componentRepository) Update(ctx context.Context, component *models.Component) error {
	// Validate Asset ownership if Asset changed
	if err := r.ValidateAssetOwnership(ctx, component.TenantID, component.AssetID); err != nil {
		return err
	}

	// Validate uniqueness
	if err := r.ValidateUniqueness(ctx, component.TenantID, component); err != nil {
		return err
	}

	query := `
		UPDATE components 
		SET Asset_id = $3, name = $4, component_code = $5, component_type = $6, component_class = $7,
		    material = $8, design_thickness_mm = $9, current_thickness_mm = $10, minimum_thickness_mm = $11,
		    design_pressure_bar = $12, design_temperature_c = $13, operating_pressure_bar = $14, operating_temperature_c = $15,
		    installation_date = $16, last_replacement_date = $17, next_replacement_date = $18,
		    specifications = $19, dimensions = $20, location_description = $21, accessibility = $22,
		    insulation_type = $23, coating_type = $24, cathodic_protection = $25, inspection_access = $26,
		    inspection_frequency_months = $27, last_inspection_date = $28, next_inspection_date = $29,
		    integrity_status = $30, fitness_for_service = $31, remaining_life_years = $32, confidence_level = $33,
		    status = $34, criticality = $35, consequence_of_failure = $36, safety_critical = $37, environmentally_critical = $38,
		    metadata = $39, updated_at = $40, updated_by = $41
		WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`

	result, err := r.db.ExecContext(ctx, query,
		component.ID, component.TenantID, component.AssetID, component.Name, component.ComponentCode, component.ComponentType, component.ComponentClass,
		component.Material, component.DesignThicknessMM, component.CurrentThicknessMM, component.MinimumThicknessMM,
		component.DesignPressureBar, component.DesignTemperatureC, component.OperatingPressureBar, component.OperatingTemperatureC,
		component.InstallationDate, component.LastReplacementDate, component.NextReplacementDate,
		component.Specifications, component.Dimensions, component.LocationDescription, component.Accessibility,
		component.InsulationType, component.CoatingType, component.CathodicProtection, component.InspectionAccess,
		component.InspectionFrequencyMonths, component.LastInspectionDate, component.NextInspectionDate,
		component.IntegrityStatus, component.FitnessForService, component.RemainingLifeYears, component.ConfidenceLevel,
		component.Status, component.Criticality, component.ConsequenceOfFailure, component.SafetyCritical, component.EnvironmentallyCritical,
		component.Metadata, time.Now(), component.UpdatedBy,
	)

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return utils.ErrComponentDuplicateCode
		}
		return fmt.Errorf("failed to update component: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrComponentNotFound
	}

	return nil
}

// Delete soft deletes a component
func (r *componentRepository) Delete(ctx context.Context, tenantID, id int) error {
	// Check if component has active degradation mechanisms
	hasActiveDegradation, err := r.HasActiveDegradationMechanisms(ctx, tenantID, id)
	if err != nil {
		return fmt.Errorf("failed to check active degradation mechanisms: %w", err)
	}
	if hasActiveDegradation {
		return utils.ErrComponentHasActiveDegradation
	}

	query := `UPDATE components SET deleted_at = $1, updated_at = $2 WHERE id = $3 AND tenant_id = $4 AND deleted_at IS NULL`
	result, err := r.db.ExecContext(ctx, query, time.Now(), time.Now(), id, tenantID)
	if err != nil {
		return fmt.Errorf("failed to soft delete component: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrComponentNotFound
	}

	return nil
}

// List returns a paginated list of components for a tenant
func (r *componentRepository) List(ctx context.Context, tenantID int, query *request.ComponentListQuery) ([]models.Component, int64, error) {
	var components []models.Component
	var total int64

	// Build WHERE conditions
	whereConditions := []string{"tenant_id = $1", "deleted_at IS NULL"}
	args := []interface{}{tenantID}
	argCount := 1

	// Apply filters
	if query.Search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(component_code) LIKE $%d OR LOWER(material) LIKE $%d)", argCount, argCount, argCount))
		searchPattern := "%" + strings.ToLower(query.Search) + "%"
		args = append(args, searchPattern)
	}

	if query.AssetID != nil && *query.AssetID > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("equipment_id = $%d", argCount))
		args = append(args, *query.AssetID)
	}

	if query.ComponentType != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("component_type = $%d", argCount))
		args = append(args, query.ComponentType)
	}

	if query.Material != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("material = $%d", argCount))
		args = append(args, query.Material)
	}

	if query.Status != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("status = $%d", argCount))
		args = append(args, query.Status)
	}

	if query.IntegrityStatus != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("integrity_status = $%d", argCount))
		args = append(args, query.IntegrityStatus)
	}

	if query.Criticality != nil && *query.Criticality > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("criticality >= $%d", argCount))
		args = append(args, *query.Criticality)
	}

	if query.SafetyCritical != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("safety_critical = $%d", argCount))
		args = append(args, *query.SafetyCritical)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM components WHERE %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count components: %w", err)
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
		SELECT * FROM components WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`, whereClause, sortField, sortOrder, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &components, listQuery, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list components: %w", err)
	}

	return components, total, nil
}

// Search performs advanced search on components
func (r *componentRepository) Search(ctx context.Context, tenantID int, query *request.AssetSearchRequest) ([]models.Component, int64, error) {
	var components []models.Component
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
			whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(component_code) LIKE $%d OR LOWER(material) LIKE $%d OR LOWER(component_type) LIKE $%d)", argCount, argCount, argCount, argCount))
		} else {
			whereConditions = append(whereConditions, fmt.Sprintf("(name ILIKE $%d OR component_code ILIKE $%d OR material ILIKE $%d OR component_type ILIKE $%d)", argCount, argCount, argCount, argCount))
		}
		args = append(args, searchTerm)
	}

	// Apply additional filters
	if len(query.AssetTypes) > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("component_type = ANY($%d)", argCount))
		args = append(args, query.AssetTypes)
	}

	if len(query.Statuses) > 0 {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("status = ANY($%d)", argCount))
		args = append(args, query.Statuses)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM components WHERE %s", whereClause)
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
		SELECT * FROM components WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`, whereClause, sortField, sortOrder, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &components, searchQuery, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search components: %w", err)
	}

	return components, total, nil
}

// ===== VALIDATION OPERATIONS =====

// ExistsByID checks if a component exists by ID
func (r *componentRepository) ExistsByID(ctx context.Context, tenantID, id int) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM components WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, id, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check component existence: %w", err)
	}
	return count > 0, nil
}

// ExistsByCode checks if a component exists by code
func (r *componentRepository) ExistsByCode(ctx context.Context, tenantID int, code string) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM components WHERE component_code = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, code, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check component code existence: %w", err)
	}
	return count > 0, nil
}

// ValidateUniqueness validates component uniqueness constraints
func (r *componentRepository) ValidateUniqueness(ctx context.Context, tenantID int, component *models.Component) error {
	// Check code uniqueness (if provided)
	if component.ComponentCode != nil && *component.ComponentCode != "" {
		var count int64
		query := `SELECT COUNT(*) FROM components WHERE component_code = $1 AND tenant_id = $2 AND deleted_at IS NULL`
		args := []interface{}{component.ComponentCode, tenantID}

		// Exclude current component if updating
		if component.ID > 0 {
			query += " AND id != $3"
			args = append(args, component.ID)
		}

		if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
			return fmt.Errorf("failed to validate code uniqueness: %w", err)
		}

		if count > 0 {
			return utils.ErrComponentDuplicateCode
		}
	}

	// Check name uniqueness within the same Asset
	var count int64
	query := `SELECT COUNT(*) FROM components WHERE name = $1 AND equipment_id = $2 AND tenant_id = $3 AND deleted_at IS NULL`
	args := []interface{}{component.Name, component.AssetID, tenantID}

	// Exclude current component if updating
	if component.ID > 0 {
		query += " AND id != $4"
		args = append(args, component.ID)
	}

	if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
		return fmt.Errorf("failed to validate name uniqueness: %w", err)
	}

	if count > 0 {
		return utils.ErrComponentDuplicateName
	}

	return nil
}

// ValidateAssetOwnership validates that the Asset belongs to the tenant
func (r *componentRepository) ValidateAssetOwnership(ctx context.Context, tenantID, AssetID int) error {
	var count int64
	query := `SELECT COUNT(*) FROM equipment WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, AssetID, tenantID)
	if err != nil {
		return fmt.Errorf("failed to validate Asset ownership: %w", err)
	}

	if count == 0 {
		return utils.ErrAssetNotFound
	}

	return nil
}

// HasActiveDegradationMechanisms checks if component has active degradation mechanisms
func (r *componentRepository) HasActiveDegradationMechanisms(ctx context.Context, tenantID, componentID int) (bool, error) {
	var count int64
	query := `SELECT COUNT(*) FROM degradation_mechanisms WHERE component_id = $1 AND tenant_id = $2 AND status = 'active' AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, componentID, tenantID)
	if err != nil {
		return false, fmt.Errorf("failed to check active degradation mechanisms: %w", err)
	}
	return count > 0, nil
}

// ===== STATISTICS =====

// GetStatistics gets component statistics for tenant
func (r *componentRepository) GetStatistics(ctx context.Context, tenantID int) (*models.ComponentStatistics, error) {
	var stats models.ComponentStatistics

	// Total count
	totalCount, err := r.CountByTenant(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	stats.TotalComponents = totalCount

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

	// Integrity distribution
	integrityDist, err := r.GetIntegrityStatusDistribution(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	stats.IntegrityDistribution = integrityDist

	// Critical components
	criticalCount, err := r.CountCritical(ctx, tenantID, 4)
	if err != nil {
		return nil, err
	}
	stats.CriticalComponents = criticalCount

	return &stats, nil
}

// CountByTenant counts components for a tenant
func (r *componentRepository) CountByTenant(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM components WHERE tenant_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, tenantID)
	return count, err
}

// GetStatusDistribution gets status distribution
func (r *componentRepository) GetStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error) {
	query := `SELECT status, COUNT(*) as count FROM components WHERE tenant_id = $1 AND deleted_at IS NULL GROUP BY status`

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
func (r *componentRepository) GetTypeDistribution(ctx context.Context, tenantID int) (map[string]int64, error) {
	query := `SELECT component_type, COUNT(*) as count FROM components WHERE tenant_id = $1 AND deleted_at IS NULL GROUP BY component_type`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get type distribution: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]int64)
	for rows.Next() {
		var componentType string
		var count int64
		if err := rows.Scan(&componentType, &count); err != nil {
			return nil, fmt.Errorf("failed to scan type distribution: %w", err)
		}
		distribution[componentType] = count
	}

	return distribution, nil
}

// GetIntegrityStatusDistribution gets integrity status distribution
func (r *componentRepository) GetIntegrityStatusDistribution(ctx context.Context, tenantID int) (map[string]int64, error) {
	query := `SELECT integrity_status, COUNT(*) as count FROM components WHERE tenant_id = $1 AND deleted_at IS NULL GROUP BY integrity_status`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get integrity status distribution: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]int64)
	for rows.Next() {
		var integrityStatus string
		var count int64
		if err := rows.Scan(&integrityStatus, &count); err != nil {
			return nil, fmt.Errorf("failed to scan integrity status distribution: %w", err)
		}
		distribution[integrityStatus] = count
	}

	return distribution, nil
}

// CountCritical counts components with criticality >= minCriticality
func (r *componentRepository) CountCritical(ctx context.Context, tenantID int, minCriticality int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM components WHERE tenant_id = $1 AND criticality >= $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, tenantID, minCriticality)
	return count, err
}

// CountByAsset counts components for an Asset
func (r *componentRepository) CountByAsset(ctx context.Context, tenantID, AssetID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM components WHERE equipment_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, AssetID, tenantID)
	return count, err
}

// ===== INSPECTION-RELATED OPERATIONS =====

// FindComponentsRequiringInspection finds components requiring inspection
func (r *componentRepository) FindComponentsRequiringInspection(ctx context.Context, tenantID int, daysFromNow int) ([]models.Component, error) {
	var components []models.Component
	cutoffDate := time.Now().AddDate(0, 0, daysFromNow)

	query := `
		SELECT * FROM components 
		WHERE tenant_id = $1 AND next_inspection_date <= $2 AND status = 'active' AND deleted_at IS NULL
		ORDER BY next_inspection_date ASC`

	err := r.db.SelectContext(ctx, &components, query, tenantID, cutoffDate)
	if err != nil {
		return nil, fmt.Errorf("failed to find components requiring inspection: %w", err)
	}

	return components, nil
}

// FindOverdueComponents finds overdue components
func (r *componentRepository) FindOverdueComponents(ctx context.Context, tenantID int) ([]models.Component, error) {
	var components []models.Component
	now := time.Now()

	query := `
		SELECT * FROM components 
		WHERE tenant_id = $1 AND next_inspection_date < $2 AND status = 'active' AND deleted_at IS NULL
		ORDER BY next_inspection_date ASC`

	err := r.db.SelectContext(ctx, &components, query, tenantID, now)
	if err != nil {
		return nil, fmt.Errorf("failed to find overdue components: %w", err)
	}

	return components, nil
}

// UpdateInspectionDates updates inspection dates
func (r *componentRepository) UpdateInspectionDates(ctx context.Context, tenantID, componentID int, lastInspection, nextInspection time.Time) error {
	query := `
		UPDATE components 
		SET last_inspection_date = $3, next_inspection_date = $4, updated_at = $5
		WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`

	result, err := r.db.ExecContext(ctx, query, componentID, tenantID, lastInspection, nextInspection, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update inspection dates: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrComponentNotFound
	}

	return nil
}

// GetInspectionSchedule gets inspection schedule
func (r *componentRepository) GetInspectionSchedule(ctx context.Context, tenantID int, from, to time.Time) ([]models.Component, error) {
	var components []models.Component

	query := `
		SELECT * FROM components 
		WHERE tenant_id = $1 AND next_inspection_date BETWEEN $2 AND $3 AND status = 'active' AND deleted_at IS NULL
		ORDER BY next_inspection_date ASC`

	err := r.db.SelectContext(ctx, &components, query, tenantID, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to get inspection schedule: %w", err)
	}

	return components, nil
}

// ===== INTEGRITY MANAGEMENT =====

// FindComponentsByIntegrityStatus finds components by integrity status
func (r *componentRepository) FindComponentsByIntegrityStatus(ctx context.Context, tenantID int, status string) ([]models.Component, error) {
	var components []models.Component

	query := `
		SELECT * FROM components 
		WHERE tenant_id = $1 AND integrity_status = $2 AND deleted_at IS NULL
		ORDER BY name ASC`

	err := r.db.SelectContext(ctx, &components, query, tenantID, status)
	if err != nil {
		return nil, fmt.Errorf("failed to find components by integrity status: %w", err)
	}

	return components, nil
}

// FindCriticalComponents finds critical components
func (r *componentRepository) FindCriticalComponents(ctx context.Context, tenantID int) ([]models.Component, error) {
	var components []models.Component

	query := `
		SELECT * FROM components 
		WHERE tenant_id = $1 AND (criticality >= 4 OR safety_critical = true OR environmentally_critical = true) AND deleted_at IS NULL
		ORDER BY criticality DESC, name ASC`

	err := r.db.SelectContext(ctx, &components, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to find critical components: %w", err)
	}

	return components, nil
}

// UpdateThickness updates thickness
func (r *componentRepository) UpdateThickness(ctx context.Context, tenantID, componentID int, currentThickness float64) error {
	query := `
		UPDATE components 
		SET current_thickness_mm = $3, updated_at = $4
		WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`

	result, err := r.db.ExecContext(ctx, query, componentID, tenantID, currentThickness, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update thickness: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return utils.ErrComponentNotFound
	}

	return nil
}
