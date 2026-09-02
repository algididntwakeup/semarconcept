// platform/backend/app/repositories/asset_repository.go

package repositories

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/utils"
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

// assetRepository implements AssetRepository interface using SQLX
type assetRepository struct {
	db *sqlx.DB
}

// NewAssetRepository creates a new AssetRepository implementation
func NewAssetRepository(db *sqlx.DB) AssetRepository {
	return &assetRepository{db: db}
}

// Create inserts a new Asset into the database
func (r *assetRepository) Create(ctx context.Context, asset *models.Asset) error {
	query := `
		INSERT INTO assets (
			tenant_id, unit_id, taxonomy_category_id, parent_id, name, tag_number,
			asset_type, asset_class, manufacturer, model, serial_number,
			manufacture_date, installation_date, commissioning_date, warranty_expiry,
			design_life_years, remaining_life_years, specifications,
			operating_parameters, design_conditions, materials, drawings_references,
			maintenance_strategy, inspection_strategy, status, criticality,
			safety_critical, environmentally_critical, metadata, created_by, updated_by
		) VALUES (
			:tenant_id, :unit_id, :taxonomy_category_id, :parent_id, :name, :tag_number,
			:asset_type, :asset_class, :manufacturer, :model, :serial_number,
			:manufacture_date, :installation_date, :commissioning_date, :warranty_expiry,
			:design_life_years, :remaining_life_years, :specifications,
			:operating_parameters, :design_conditions, :materials, :drawings_references,
			:maintenance_strategy, :inspection_strategy, :status, :criticality,
			:safety_critical, :environmentally_critical, :metadata, :created_by, :updated_by
		) RETURNING id, created_at, updated_at
	`

	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return fmt.Errorf("prepare named: %w", err)
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, asset, asset)
	if err != nil {
		return fmt.Errorf("execute and get: %w", err)
	}

	return nil
}

// FindByTag finds an asset by its tag number
func (r *assetRepository) FindByTag(ctx context.Context, tenantID int, unitID int, tag string) (*models.Asset, error) {
	query := `SELECT * FROM assets WHERE tenant_id = $1 AND unit_id = $2 AND tag_number = $3 AND status != 'deleted'`
	var asset models.Asset
	err := r.db.GetContext(ctx, &asset, query, tenantID, unitID, tag)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrAssetNotFound
		}
		return nil, fmt.Errorf("get context: %w", err)
	}
	return &asset, nil
}

// FindByName finds an asset by its name
func (r *assetRepository) FindByName(ctx context.Context, tenantID int, unitID int, name string) (*models.Asset, error) {
	query := `SELECT * FROM assets WHERE tenant_id = $1 AND unit_id = $2 AND name = $3 AND status != 'deleted'`
	var asset models.Asset
	err := r.db.GetContext(ctx, &asset, query, tenantID, unitID, name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrAssetNotFound
		}
		return nil, fmt.Errorf("get context: %w", err)
	}
	return &asset, nil
}

// Update modifies an existing Asset
func (r *assetRepository) Update(ctx context.Context, asset *models.Asset) error {
	query := `
		UPDATE assets SET
			unit_id = :unit_id,
			taxonomy_category_id = :taxonomy_category_id,
			parent_id = :parent_id,
			name = :name,
			tag_number = :tag_number,
			asset_type = :asset_type,
			asset_class = :asset_class,
			manufacturer = :manufacturer,
			model = :model,
			serial_number = :serial_number,
			manufacture_date = :manufacture_date,
			installation_date = :installation_date,
			commissioning_date = :commissioning_date,
			warranty_expiry = :warranty_expiry,
			design_life_years = :design_life_years,
			remaining_life_years = :remaining_life_years,
			specifications = :specifications,
			operating_parameters = :operating_parameters,
			design_conditions = :design_conditions,
			materials = :materials,
			drawings_references = :drawings_references,
			maintenance_strategy = :maintenance_strategy,
			inspection_strategy = :inspection_strategy,
			status = :status,
			criticality = :criticality,
			safety_critical = :safety_critical,
			environmentally_critical = :environmentally_critical,
			metadata = :metadata,
			updated_by = :updated_by,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = :id AND tenant_id = :tenant_id
	`
	
	result, err := r.db.NamedExecContext(ctx, query, asset)
	if err != nil {
		return fmt.Errorf("named exec: %w", err)
	}
	
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}
	
	if rows == 0 {
		return utils.ErrAssetNotFound
	}
	
	return nil
}

// Delete logically deletes an Asset
func (r *assetRepository) Delete(ctx context.Context, tenantID int, id int) error {
	query := `UPDATE assets SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2`
	result, err := r.db.ExecContext(ctx, query, id, tenantID)
	if err != nil {
		return fmt.Errorf("exec context: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}
	if rows == 0 {
		return utils.ErrAssetNotFound
	}
	return nil
}

// HasActiveComponents checks if the asset has related components
func (r *assetRepository) HasActiveComponents(ctx context.Context, tenantID int, id int) (bool, error) {
	query := `SELECT COUNT(*) FROM components WHERE equipment_id = $1 AND tenant_id = $2 AND status != 'deleted'`
	var count int
	err := r.db.GetContext(ctx, &count, query, id, tenantID)
	if err != nil {
		return false, fmt.Errorf("get context: %w", err)
	}
	return count > 0, nil
}

// FindByID retrieves Asset by ID with tenant isolation
func (r *assetRepository) FindByID(ctx context.Context, tenantID int, id int) (*models.Asset, error) {
	query := `SELECT * FROM assets WHERE id = $1 AND tenant_id = $2 AND status != 'deleted'`

	var asset models.Asset
	err := r.db.GetContext(ctx, &asset, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrAssetNotFound
		}
		return nil, err
	}

	return &asset, nil
}

// List retrieves assets with optional filtering
func (r *assetRepository) List(ctx context.Context, tenantID int, req *request.AssetListQuery) ([]models.Asset, int64, error) {
	query := `SELECT * FROM assets WHERE tenant_id = $1 AND status != 'deleted'`
	countQuery := `SELECT COUNT(*) FROM assets WHERE tenant_id = $1 AND status != 'deleted'`
	
	args := []interface{}{tenantID}
	argIdx := 2
	
	if req.UnitID != nil {
		query += fmt.Sprintf(` AND unit_id = $%d`, argIdx)
		countQuery += fmt.Sprintf(` AND unit_id = $%d`, argIdx)
		args = append(args, *req.UnitID)
		argIdx++
	}
	
	if req.Search != "" {
		query += fmt.Sprintf(` AND (name ILIKE $%d OR tag_number ILIKE $%d)`, argIdx, argIdx)
		countQuery += fmt.Sprintf(` AND (name ILIKE $%d OR tag_number ILIKE $%d)`, argIdx, argIdx)
		searchPattern := "%" + req.Search + "%"
		args = append(args, searchPattern)
		argIdx++
	}
	
	var total int64
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("count query: %w", err)
	}
	
	query += ` ORDER BY created_at DESC`
	
	if req.Limit > 0 {
		query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argIdx, argIdx+1)
		args = append(args, req.Limit, (req.Page-1)*req.Limit)
	}
	
	var assets []models.Asset
	if err := r.db.SelectContext(ctx, &assets, query, args...); err != nil {
		return nil, 0, fmt.Errorf("select context: %w", err)
	}
	
	return assets, total, nil
}

// GetSiteByID retrieves a site by ID with tenant isolation
func (r *assetRepository) GetSiteByID(ctx context.Context, id int, tenantID int) (*models.Site, error) {
	query := `SELECT * FROM sites WHERE id = $1 AND tenant_id = $2 AND status = 'active'`

	var site models.Site
	err := r.db.GetContext(ctx, &site, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &site, nil
}

// GetUnitByID retrieves a unit by ID with tenant isolation
func (r *assetRepository) GetUnitByID(ctx context.Context, id int, tenantID int) (*models.Unit, error) {
	query := `SELECT * FROM units WHERE id = $1 AND tenant_id = $2 AND status = 'active'`

	var unit models.Unit
	err := r.db.GetContext(ctx, &unit, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &unit, nil
}

// GetAssetByID retrieves Asset by ID with tenant isolation
func (r *assetRepository) GetAssetByID(ctx context.Context, id int, tenantID int) (*models.Asset, error) {
	query := `SELECT * FROM assets WHERE id = $1 AND tenant_id = $2 AND status = 'active'`

	var asset models.Asset
	err := r.db.GetContext(ctx, &asset, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &asset, nil
}

// GetComponentByID retrieves a component by ID with tenant isolation
func (r *assetRepository) GetComponentByID(ctx context.Context, id int, tenantID int) (*models.Component, error) {
	query := `SELECT * FROM components WHERE id = $1 AND tenant_id = $2 AND status = 'active'`

	var component models.Component
	err := r.db.GetContext(ctx, &component, query, id, tenantID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &component, nil
}

// GetAssetCounts retrieves asset counts by type for a tenant
func (r *assetRepository) GetAssetCounts(ctx context.Context, tenantID int) (map[string]int, error) {
	query := `
		SELECT 
			'sites' as asset_type, COUNT(*) as count FROM sites WHERE tenant_id = $1 AND status = 'active'
		UNION ALL
		SELECT 
			'units' as asset_type, COUNT(*) as count FROM units WHERE tenant_id = $1 AND status = 'active'
		UNION ALL
		SELECT 
			'assets' as asset_type, COUNT(*) as count FROM assets WHERE tenant_id = $1 AND status = 'active'
		UNION ALL
		SELECT 
			'components' as asset_type, COUNT(*) as count FROM components WHERE tenant_id = $1 AND status = 'active'
	`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var assetType string
		var count int
		if err := rows.Scan(&assetType, &count); err != nil {
			return nil, err
		}
		counts[assetType] = count
	}

	return counts, nil
}

// GetAssetCriticalityBreakdown uses the v_asset_criticality_summary view from your database
func (r *assetRepository) GetAssetCriticalityBreakdown(ctx context.Context, tenantID int) (map[string]map[string]int, error) {
	query := `
		SELECT 
			asset_type,
			total_count,
			critical_count,
			high_count,
			medium_count,
			low_count
		FROM v_asset_criticality_summary 
		WHERE tenant_id = $1
	`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	breakdown := make(map[string]map[string]int)
	for rows.Next() {
		var assetType string
		var totalCount, criticalCount, highCount, mediumCount, lowCount int

		if err := rows.Scan(&assetType, &totalCount, &criticalCount, &highCount, &mediumCount, &lowCount); err != nil {
			return nil, err
		}

		breakdown[assetType] = map[string]int{
			"total":    totalCount,
			"critical": criticalCount,
			"high":     highCount,
			"medium":   mediumCount,
			"low":      lowCount,
		}
	}

	return breakdown, nil
}

// GetComponentIntegrityStatus uses the v_asset_integrity_summary view
func (r *assetRepository) GetComponentIntegrityStatus(ctx context.Context, tenantID int, AssetID *int) (map[string]int, error) {
	var query string
	var args []interface{}

	if AssetID != nil {
		query = `
			SELECT 
				COUNT(CASE WHEN integrity_status = 'excellent' THEN 1 END) as excellent_count,
				COUNT(CASE WHEN integrity_status = 'good' THEN 1 END) as good_count,
				COUNT(CASE WHEN integrity_status = 'fair' THEN 1 END) as fair_count,
				COUNT(CASE WHEN integrity_status = 'poor' THEN 1 END) as poor_count,
				COUNT(CASE WHEN integrity_status = 'critical' THEN 1 END) as critical_count,
				COUNT(CASE WHEN safety_critical = true THEN 1 END) as safety_critical_count
			FROM components 
			WHERE tenant_id = $1 AND equipment_id = $2 AND status = 'active'
		`
		args = []interface{}{tenantID, *AssetID}
	} else {
		query = `
			SELECT 
				COUNT(CASE WHEN integrity_status = 'excellent' THEN 1 END) as excellent_count,
				COUNT(CASE WHEN integrity_status = 'good' THEN 1 END) as good_count,
				COUNT(CASE WHEN integrity_status = 'fair' THEN 1 END) as fair_count,
				COUNT(CASE WHEN integrity_status = 'poor' THEN 1 END) as poor_count,
				COUNT(CASE WHEN integrity_status = 'critical' THEN 1 END) as critical_count,
				COUNT(CASE WHEN safety_critical = true THEN 1 END) as safety_critical_count
			FROM components 
			WHERE tenant_id = $1 AND status = 'active'
		`
		args = []interface{}{tenantID}
	}

	var excellent, good, fair, poor, critical, safetyCritical int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&excellent, &good, &fair, &poor, &critical, &safetyCritical,
	)
	if err != nil {
		return nil, err
	}

	return map[string]int{
		"excellent":       excellent,
		"good":            good,
		"fair":            fair,
		"poor":            poor,
		"critical":        critical,
		"safety_critical": safetyCritical,
	}, nil
}

// GetInspectionDueAnalytics analyzes inspection due dates
func (r *assetRepository) GetInspectionDueAnalytics(ctx context.Context, tenantID int, daysAhead int) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(CASE WHEN next_inspection_date < CURRENT_DATE THEN 1 END) as overdue,
			COUNT(CASE WHEN next_inspection_date >= CURRENT_DATE 
				AND next_inspection_date <= CURRENT_DATE + INTERVAL '%d days' THEN 1 END) as due_soon,
			COUNT(CASE WHEN next_inspection_date > CURRENT_DATE + INTERVAL '%d days' THEN 1 END) as future,
			COUNT(CASE WHEN next_inspection_date < CURRENT_DATE AND criticality = 5 THEN 1 END) as critical_overdue,
			COUNT(CASE WHEN next_inspection_date >= CURRENT_DATE 
				AND next_inspection_date <= CURRENT_DATE + INTERVAL '%d days' 
				AND criticality = 5 THEN 1 END) as critical_due_soon
		FROM components 
		WHERE tenant_id = $1 AND status = 'active' AND next_inspection_date IS NOT NULL
	`

	formattedQuery := fmt.Sprintf(query, daysAhead, daysAhead, daysAhead)

	var overdue, dueSoon, future, criticalOverdue, criticalDueSoon int
	err := r.db.QueryRowContext(ctx, formattedQuery, tenantID).Scan(
		&overdue, &dueSoon, &future, &criticalOverdue, &criticalDueSoon,
	)
	if err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"inspections": map[string]int{
			"overdue":  overdue,
			"due_soon": dueSoon,
			"future":   future,
		},
		"by_criticality": map[string]int{
			"critical_overdue":  criticalOverdue,
			"critical_due_soon": criticalDueSoon,
		},
	}

	return result, nil
}

// CalculateAssetHealthScore calculates overall asset health score
func (r *assetRepository) CalculateAssetHealthScore(ctx context.Context, tenantID int, assetType string) (float64, error) {
	// Simplified health score calculation based on integrity status distribution
	query := `
		SELECT 
			COUNT(CASE WHEN integrity_status = 'excellent' THEN 1 END) * 100 +
			COUNT(CASE WHEN integrity_status = 'good' THEN 1 END) * 80 +
			COUNT(CASE WHEN integrity_status = 'fair' THEN 1 END) * 60 +
			COUNT(CASE WHEN integrity_status = 'poor' THEN 1 END) * 40 +
			COUNT(CASE WHEN integrity_status = 'critical' THEN 1 END) * 20
			as weighted_score,
			COUNT(*) as total_count
		FROM components 
		WHERE tenant_id = $1 AND status = 'active'
	`

	var weightedScore, totalCount int
	err := r.db.QueryRowContext(ctx, query, tenantID).Scan(&weightedScore, &totalCount)
	if err != nil {
		return 0, err
	}

	if totalCount == 0 {
		return 0, nil
	}

	healthScore := float64(weightedScore) / float64(totalCount)
	return healthScore, nil
}

// GetCriticalAssets retrieves assets with critical status
func (r *assetRepository) GetCriticalAssets(ctx context.Context, tenantID int) ([]interface{}, error) {
	query := `
		SELECT 'component' as type, id, name, criticality, integrity_status
		FROM components 
		WHERE tenant_id = $1 AND (criticality = 5 OR integrity_status = 'critical') AND status = 'active'
		UNION ALL
		SELECT 'asset' as type, id, name, criticality, 'N/A' as integrity_status
		FROM assets 
		WHERE tenant_id = $1 AND criticality = 5 AND status = 'active'
		ORDER BY criticality DESC
		LIMIT 20
	`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []interface{}
	for rows.Next() {
		var assetType, name, integrityStatus string
		var id, criticality int

		if err := rows.Scan(&assetType, &id, &name, &criticality, &integrityStatus); err != nil {
			return nil, err
		}

		asset := map[string]interface{}{
			"type":             assetType,
			"id":               id,
			"name":             name,
			"criticality":      criticality,
			"integrity_status": integrityStatus,
		}
		assets = append(assets, asset)
	}

	return assets, nil
}

// GetAssetsRequiringAttention retrieves assets needing immediate attention
func (r *assetRepository) GetAssetsRequiringAttention(ctx context.Context, tenantID int) ([]interface{}, error) {
	query := `
		SELECT 'component' as type, id, name, 
			CASE 
				WHEN next_inspection_date < CURRENT_DATE THEN 'inspection_overdue'
				WHEN integrity_status = 'critical' THEN 'critical_integrity'
				WHEN integrity_status = 'poor' THEN 'poor_integrity'
				ELSE 'attention_needed'
			END as reason
		FROM components 
		WHERE tenant_id = $1 AND status = 'active' AND (
			next_inspection_date < CURRENT_DATE OR 
			integrity_status IN ('critical', 'poor') OR
			(safety_critical = true AND integrity_status = 'fair')
		)
		ORDER BY 
			CASE 
				WHEN next_inspection_date < CURRENT_DATE THEN 1
				WHEN integrity_status = 'critical' THEN 2
				WHEN integrity_status = 'poor' THEN 3
				ELSE 4
			END
		LIMIT 20
	`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []interface{}
	for rows.Next() {
		var assetType, name, reason string
		var id int

		if err := rows.Scan(&assetType, &id, &name, &reason); err != nil {
			return nil, err
		}

		asset := map[string]interface{}{
			"type":   assetType,
			"id":     id,
			"name":   name,
			"reason": reason,
		}
		assets = append(assets, asset)
	}

	return assets, nil
}
