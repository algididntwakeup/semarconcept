// platform/backend/app/repositories/asset_repository.go

package repositories

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/utils"
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

// assetRepository implements AssetRepository interface using SQLX
type assetRepository struct {
	db *sqlx.DB
}

// NewAssetRepository creates a new AssetRepository implementation
func NewAssetRepository(db *sqlx.DB) AssetRepository {
	return &assetRepository{db: db.Unsafe()}
}

// Create inserts a new Asset into the database
func (r *assetRepository) Create(ctx context.Context, asset *models.Asset) error {
	if asset.RBIProperties == nil {
		asset.RBIProperties = models.JSONBMap{}
	}
	query := `
		INSERT INTO assets (
			tenant_id, unit_id, taxonomy_category_id, parent_id, functional_location_id, name, description, tag_number,
			asset_type, asset_class, manufacturer, model, serial_number,
			manufacture_date, installation_date, commissioning_date, warranty_expiry,
			design_life_years, remaining_life_years, specifications, rbi_properties,
			operating_parameters, design_conditions, materials, drawings_references,
			maintenance_strategy, inspection_strategy, status, lifecycle_status, criticality,
			safety_critical, environmentally_critical, metadata, created_by, updated_by
		) VALUES (
			:tenant_id, :unit_id, :taxonomy_category_id, :parent_id, :functional_location_id, :name, :description, :tag_number,
			:asset_type, :asset_class, :manufacturer, :model, :serial_number,
			:manufacture_date, :installation_date, :commissioning_date, :warranty_expiry,
			:design_life_years, :remaining_life_years, :specifications, :rbi_properties,
			:operating_parameters, :design_conditions, :materials, :drawings_references,
			:maintenance_strategy, :inspection_strategy, :status, :lifecycle_status, :criticality,
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
	if asset.RBIProperties == nil {
		asset.RBIProperties = models.JSONBMap{}
	}
	query := `
		UPDATE assets SET
			unit_id = :unit_id,
			taxonomy_category_id = :taxonomy_category_id,
			parent_id = :parent_id,
			functional_location_id = :functional_location_id,
			name = :name,
			description = :description,
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
			rbi_properties = :rbi_properties,
			operating_parameters = :operating_parameters,
			design_conditions = :design_conditions,
			materials = :materials,
			drawings_references = :drawings_references,
			maintenance_strategy = :maintenance_strategy,
			inspection_strategy = :inspection_strategy,
			status = :status,
			lifecycle_status = :lifecycle_status,
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
		query += fmt.Sprintf(` AND tag_number ILIKE $%d`, argIdx)
		countQuery += fmt.Sprintf(` AND tag_number ILIKE $%d`, argIdx)
		searchPattern := "%" + req.Search + "%"
		args = append(args, searchPattern)
		argIdx++
	}

	assetType := req.AssetType
	if assetType == "" {
		assetType = req.Type
	}
	if assetType != "" {
		query += fmt.Sprintf(` AND COALESCE(NULLIF(asset_type, ''), asset_class) = $%d`, argIdx)
		countQuery += fmt.Sprintf(` AND COALESCE(NULLIF(asset_type, ''), asset_class) = $%d`, argIdx)
		args = append(args, assetType)
		argIdx++
	}

	lifecycleStatus := req.LifecycleStatus
	if lifecycleStatus == "" {
		lifecycleStatus = req.Status
	}
	if lifecycleStatus != "" {
		query += fmt.Sprintf(` AND COALESCE(NULLIF(lifecycle_status, ''), status) = $%d`, argIdx)
		countQuery += fmt.Sprintf(` AND COALESCE(NULLIF(lifecycle_status, ''), status) = $%d`, argIdx)
		args = append(args, lifecycleStatus)
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

// GetAssetStats aggregates non-deleted assets by type/class and lifecycle status.
func (r *assetRepository) GetAssetStats(ctx context.Context, tenantID int) ([]AssetTypeStatusCount, error) {
	const query = `
		SELECT
			COALESCE(NULLIF(asset_type, ''), NULLIF(asset_class, ''), 'Uncategorized') AS asset_type,
			COALESCE(NULLIF(lifecycle_status, ''), NULLIF(status, ''), 'Unknown') AS lifecycle_status,
			COUNT(*) AS count
		FROM assets
		WHERE tenant_id = $1 AND COALESCE(status, '') <> 'deleted'
		GROUP BY 1, 2
		ORDER BY 1, 2`

	stats := make([]AssetTypeStatusCount, 0)
	if err := r.db.SelectContext(ctx, &stats, query, tenantID); err != nil {
		return nil, fmt.Errorf("aggregate asset statistics: %w", err)
	}
	return stats, nil
}

func (r *assetRepository) UpdateLifecycle(ctx context.Context, tenantID, assetID int, status string, userID int) error {
	result, err := r.db.ExecContext(ctx, `UPDATE assets SET lifecycle_status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND tenant_id = $4 AND COALESCE(status, '') <> 'deleted'`, status, userID, assetID, tenantID)
	if err != nil {
		return fmt.Errorf("update asset lifecycle: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get lifecycle rows affected: %w", err)
	}
	if rows == 0 {
		return utils.ErrAssetNotFound
	}
	return nil
}

func (r *assetRepository) DiagnoseDuplicateTags(ctx context.Context, tenantID int) ([]DuplicateAssetTag, error) {
	const query = `
		SELECT MIN(BTRIM(tag_number)) AS tag_number, COUNT(*) AS count
		FROM assets
		WHERE tenant_id = $1 AND NULLIF(BTRIM(tag_number), '') IS NOT NULL AND COALESCE(status, '') <> 'deleted'
		GROUP BY LOWER(BTRIM(tag_number)) HAVING COUNT(*) > 1 ORDER BY LOWER(MIN(BTRIM(tag_number)))`
	duplicates := make([]DuplicateAssetTag, 0)
	if err := r.db.SelectContext(ctx, &duplicates, query, tenantID); err != nil {
		return nil, fmt.Errorf("diagnose duplicate asset tags: %w", err)
	}
	for i := range duplicates {
		if err := r.db.SelectContext(ctx, &duplicates[i].AssetIDs, `SELECT id FROM assets WHERE tenant_id = $1 AND LOWER(BTRIM(tag_number)) = LOWER(BTRIM($2)) AND COALESCE(status, '') <> 'deleted' ORDER BY id`, tenantID, duplicates[i].TagNumber); err != nil {
			return nil, fmt.Errorf("load duplicate asset IDs for tag %q: %w", duplicates[i].TagNumber, err)
		}
	}
	return duplicates, nil
}

func (r *assetRepository) FixBrokenParentLinks(ctx context.Context, tenantID, userID int, dryRun bool) (int64, error) {
	if dryRun {
		const countQuery = `
			SELECT COUNT(*) FROM assets AS child
			WHERE child.tenant_id = $1 AND child.parent_id IS NOT NULL
			  AND COALESCE(child.status, '') <> 'deleted'
			  AND NOT EXISTS (SELECT 1 FROM assets AS parent WHERE parent.id = child.parent_id
			    AND parent.tenant_id = child.tenant_id AND COALESCE(parent.status, '') <> 'deleted')`
		var count int64
		if err := r.db.GetContext(ctx, &count, countQuery, tenantID); err != nil {
			return 0, fmt.Errorf("count broken asset parent links: %w", err)
		}
		return count, nil
	}
	const query = `
		UPDATE assets AS child
		SET parent_id = NULL, updated_by = $2, updated_at = CURRENT_TIMESTAMP
		WHERE child.tenant_id = $1 AND child.parent_id IS NOT NULL
		  AND COALESCE(child.status, '') <> 'deleted'
		  AND NOT EXISTS (
			SELECT 1 FROM assets AS parent
			WHERE parent.id = child.parent_id AND parent.tenant_id = child.tenant_id
			  AND COALESCE(parent.status, '') <> 'deleted'
		  )`
	result, err := r.db.ExecContext(ctx, query, tenantID, userID)
	if err != nil {
		return 0, fmt.Errorf("fix broken asset parent links: %w", err)
	}
	return result.RowsAffected()
}

func (r *assetRepository) ValidateFLOCLinks(ctx context.Context, tenantID, userID int, dryRun bool) (*FLOCSyncResult, error) {
	result := &FLOCSyncResult{}
	const assetCountQuery = `SELECT COUNT(*) FROM assets WHERE tenant_id = $1 AND COALESCE(status, '') <> 'deleted'`
	if err := r.db.GetContext(ctx, &result.CheckedAssets, assetCountQuery, tenantID); err != nil {
		return nil, fmt.Errorf("count assets for FLOC validation: %w", err)
	}
	const componentCountsQuery = `
		SELECT
			COUNT(*) FILTER (WHERE parent.id IS NOT NULL) AS valid_components,
			COUNT(*) FILTER (WHERE parent.id IS NULL) AS orphaned_components
		FROM components AS component
		LEFT JOIN assets AS parent ON parent.id = component.equipment_id
			AND parent.tenant_id = component.tenant_id AND COALESCE(parent.status, '') <> 'deleted'
		WHERE component.tenant_id = $1 AND COALESCE(component.status, '') <> 'deleted'`
	if err := r.db.QueryRowContext(ctx, componentCountsQuery, tenantID).Scan(&result.ValidComponents, &result.OrphanedComponents); err != nil {
		return nil, fmt.Errorf("validate component FLOC membership: %w", err)
	}
	const brokenFLOCQuery = `
		SELECT COUNT(*) FROM assets AS asset
		WHERE asset.tenant_id = $1 AND asset.functional_location_id IS NOT NULL
		  AND COALESCE(asset.status, '') <> 'deleted'
		  AND NOT EXISTS (SELECT 1 FROM assets AS floc WHERE floc.id = asset.functional_location_id
		    AND floc.tenant_id = asset.tenant_id AND COALESCE(floc.status, '') <> 'deleted')`
	if err := r.db.GetContext(ctx, &result.BrokenFLOCLinks, brokenFLOCQuery, tenantID); err != nil {
		return nil, fmt.Errorf("validate functional location links: %w", err)
	}
	if result.BrokenFLOCLinks > 0 && !dryRun {
		const clearBrokenLinksQuery = `
			UPDATE assets AS asset SET functional_location_id = NULL, updated_by = $2, updated_at = CURRENT_TIMESTAMP
			WHERE asset.tenant_id = $1 AND asset.functional_location_id IS NOT NULL
			  AND COALESCE(asset.status, '') <> 'deleted'
			  AND NOT EXISTS (SELECT 1 FROM assets AS floc WHERE floc.id = asset.functional_location_id
			    AND floc.tenant_id = asset.tenant_id AND COALESCE(floc.status, '') <> 'deleted')`
		updateResult, err := r.db.ExecContext(ctx, clearBrokenLinksQuery, tenantID, userID)
		if err != nil {
			return nil, fmt.Errorf("clear invalid functional location links: %w", err)
		}
		result.ClearedFLOCLinks, err = updateResult.RowsAffected()
		if err != nil {
			return nil, fmt.Errorf("get cleared functional location rows: %w", err)
		}
	}
	return result, nil
}

func (r *assetRepository) ListAssetsForExport(ctx context.Context, tenantID int, assetType, status string) ([]models.Asset, error) {
	query := `SELECT * FROM assets WHERE tenant_id = $1 AND COALESCE(status, '') <> 'deleted'`
	args := []interface{}{tenantID}
	if assetType != "" {
		args = append(args, assetType)
		query += fmt.Sprintf(` AND COALESCE(NULLIF(asset_type, ''), asset_class) = $%d`, len(args))
	}
	if status != "" {
		args = append(args, status)
		query += fmt.Sprintf(` AND COALESCE(NULLIF(lifecycle_status, ''), status) = $%d`, len(args))
	}
	query += ` ORDER BY id`
	assets := make([]models.Asset, 0)
	if err := r.db.SelectContext(ctx, &assets, query, args...); err != nil {
		return nil, fmt.Errorf("list assets for export: %w", err)
	}
	return assets, nil
}

// UpsertAssetsFromImport applies an entire import batch atomically for one tenant.
// A transaction-scoped advisory lock serializes concurrent imports for the tenant,
// including imports where incoming tag numbers do not yet exist in the database.
func (r *assetRepository) UpsertAssetsFromImport(ctx context.Context, tenantID int, assets []models.Asset, userID int) (created, updated int, err error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return 0, 0, fmt.Errorf("begin asset import transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock($1, $2)`, tenantID, 74321); err != nil {
		return 0, 0, fmt.Errorf("lock tenant asset import: %w", err)
	}

	const findByTagQuery = `SELECT id FROM assets WHERE tenant_id = $1 AND tag_number = $2 AND COALESCE(status, '') <> 'deleted' ORDER BY id LIMIT 1 FOR UPDATE`
	const findByIDQuery = `SELECT id FROM assets WHERE tenant_id = $1 AND id = $2 AND COALESCE(status, '') <> 'deleted' FOR UPDATE`
	const updateByIDQuery = `
		UPDATE assets SET
			name = $1,
			tag_number = COALESCE($2, tag_number),
			description = COALESCE($3, description),
			asset_type = COALESCE($4, asset_type),
			asset_class = COALESCE($5, asset_class),
			parent_id = COALESCE($6, parent_id),
			functional_location_id = COALESCE($7, functional_location_id),
			lifecycle_status = COALESCE($8, lifecycle_status),
			status = COALESCE($9, status),
			rbi_properties = COALESCE(rbi_properties, '{}'::jsonb) || $10::jsonb,
			updated_by = $11,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $12 AND tenant_id = $13`
	const insertWithTagQuery = `
		INSERT INTO assets (
			tenant_id, name, tag_number, description, asset_type, asset_class, parent_id,
			functional_location_id, lifecycle_status, status, rbi_properties, created_by, updated_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 'active'), $11, $12, $12)`
	const insertWithoutTagQuery = `
		INSERT INTO assets (
			tenant_id, name, description, asset_type, asset_class, parent_id,
			functional_location_id, lifecycle_status, status, rbi_properties, created_by, updated_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'active'), $10, $11, $11)`

	for index := range assets {
		select {
		case <-ctx.Done():
			return created, updated, fmt.Errorf("asset import cancelled: %w", ctx.Err())
		default:
		}
		asset := &assets[index]
		asset.TenantID = tenantID
		asset.UpdatedBy = &userID
		if asset.CreatedBy == nil {
			asset.CreatedBy = &userID
		}
		if asset.RBIProperties == nil {
			asset.RBIProperties = models.JSONBMap{}
		}

		var existingID int
		findErr := sql.ErrNoRows
		if asset.TagNumber != nil && strings.TrimSpace(*asset.TagNumber) != "" {
			findErr = tx.GetContext(ctx, &existingID, findByTagQuery, tenantID, strings.TrimSpace(*asset.TagNumber))
		}
		if findErr == sql.ErrNoRows && asset.ID > 0 {
			findErr = tx.GetContext(ctx, &existingID, findByIDQuery, tenantID, asset.ID)
		}
		if findErr != nil && findErr != sql.ErrNoRows {
			err = findErr
			return 0, 0, fmt.Errorf("find existing asset at import row %d: %w", index+1, err)
		}
		if findErr == nil {
			_, err = tx.ExecContext(ctx, updateByIDQuery,
				asset.Name, asset.TagNumber, asset.Description, asset.AssetType, asset.AssetClass,
				asset.ParentID, asset.FunctionalLocationID, asset.LifecycleStatus, asset.Status,
				asset.RBIProperties, userID, existingID, tenantID,
			)
			if err != nil {
				return 0, 0, fmt.Errorf("update asset import row %d: %w", index+1, err)
			}
			updated++
			continue
		}
		if asset.TagNumber == nil || strings.TrimSpace(*asset.TagNumber) == "" {
			_, err = tx.ExecContext(ctx, insertWithoutTagQuery,
				asset.TenantID, asset.Name, asset.Description, asset.AssetType, asset.AssetClass,
				asset.ParentID, asset.FunctionalLocationID, asset.LifecycleStatus, asset.Status,
				asset.RBIProperties, userID,
			)
		} else {
			_, err = tx.ExecContext(ctx, insertWithTagQuery,
				asset.TenantID, asset.Name, asset.TagNumber, asset.Description, asset.AssetType,
				asset.AssetClass, asset.ParentID, asset.FunctionalLocationID, asset.LifecycleStatus,
				asset.Status, asset.RBIProperties, userID,
			)
		}
		if err != nil {
			return 0, 0, fmt.Errorf("insert asset import row %d: %w", index+1, err)
		}
		created++
	}

	if err = tx.Commit(); err != nil {
		return 0, 0, fmt.Errorf("commit asset import transaction: %w", err)
	}
	return created, updated, nil
}

func (r *assetRepository) FindByTagNumber(ctx context.Context, tenantID int, tagNumber string) (*models.Asset, error) {
	var asset models.Asset
	err := r.db.GetContext(ctx, &asset, `SELECT * FROM assets WHERE tenant_id = $1 AND tag_number = $2 AND COALESCE(status, '') <> 'deleted' ORDER BY id LIMIT 1`, tenantID, tagNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("find asset by tag number: %w", err)
	}
	return &asset, nil
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
