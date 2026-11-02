// platform/backend/app/repositories/functional_location_repository.go
package repositories

import (
	"backend/app/models"
	"backend/app/utils"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"gorm.io/gorm"
)

// FunctionalLocationRepository defines operations for functional locations and visual tree
type FunctionalLocationRepository interface {
	GetTree(ctx context.Context, tenantID int) ([]*models.FunctionalLocationNode, error)
	GetAll(ctx context.Context, tenantID int) ([]models.FunctionalLocation, error)
	GetByID(ctx context.Context, tenantID, id int) (*models.FunctionalLocation, error)
	GetEquipments(ctx context.Context, tenantID, flocID int) ([]models.EquipmentSummary, error)
	SeedDefaultFlocsIfEmpty(ctx context.Context, tenantID int) error
}

type functionalLocationRepository struct {
	db     *sqlx.DB
	gormDB *gorm.DB
}

// NewFunctionalLocationRepository creates a new instance of FunctionalLocationRepository
func NewFunctionalLocationRepository(db *sqlx.DB, gormDB *gorm.DB) FunctionalLocationRepository {
	return &functionalLocationRepository{
		db:     db,
		gormDB: gormDB,
	}
}

type rawFlocRow struct {
	ID          int    `db:"id"`
	TenantID    int    `db:"tenant_id"`
	ParentID    *int   `db:"parent_id"`
	Code        string `db:"code"`
	Description string `db:"description"`
	Level       int    `db:"level"`
	IsActive    bool   `db:"is_active"`
}

type rawEquipmentRow struct {
	ID              int     `db:"id"`
	InstalledFlocID int     `db:"installed_floc_id"`
	TagNumber       string  `db:"tag_number"`
	Name            string  `db:"name"`
	AssetClass      string  `db:"asset_class"`
	AssetType       string  `db:"asset_type"`
	Status          string  `db:"status"`
	Criticality     *int    `db:"criticality"`
}

// SeedDefaultFlocsIfEmpty populates a rich ISO 14224 (L1-L8) functional location hierarchy
// if the tenant does not have any functional locations yet.
func (r *functionalLocationRepository) SeedDefaultFlocsIfEmpty(ctx context.Context, tenantID int) error {
	var count int
	checkQuery := `SELECT COUNT(*) FROM functional_locations WHERE tenant_id = $1`
	if err := r.db.GetContext(ctx, &count, checkQuery, tenantID); err != nil {
		// Ignore error if table is not accessible via sqlx yet
		return nil
	}
	if count > 0 {
		return nil
	}

	type flocSeed struct {
		Code        string
		Description string
		Level       int
		ParentCode  string
	}

	seeds := []flocSeed{
		// Level 1: Industry / Company
		{Code: "CORP-REK", Description: "PT Reksolindo Energy Corp", Level: 1, ParentCode: ""},

		// Level 2: Business Category / Region
		{Code: "REG-WJ", Description: "Upstream Oil & Gas - West Java", Level: 2, ParentCode: "CORP-REK"},

		// Level 3: Installation / Site
		{Code: "SITE-JTB", Description: "Jatibarang Onshore Field", Level: 3, ParentCode: "REG-WJ"},

		// Level 4: Plant / Area
		{Code: "AREA-AGB", Description: "Gathering Station Akasia Bagus", Level: 4, ParentCode: "SITE-JTB"},
		{Code: "PLANT-WS68", Description: "Well Site 68 Gathering Header", Level: 4, ParentCode: "SITE-JTB"},

		// Level 5: Section / System
		{Code: "JI-JL-AG-11-PW", Description: "Produced Water Treatment System", Level: 5, ParentCode: "AREA-AGB"},
		{Code: "JI-JL-AG-11-IS", Description: "Inlet Separation System", Level: 5, ParentCode: "AREA-AGB"},
		{Code: "JI-JL-AG-12-ECTB", Description: "Electrical Control Building", Level: 5, ParentCode: "AREA-AGB"},
		{Code: "JI-JL-AG-68-WS", Description: "Wellhead Flowline & Manifold", Level: 5, ParentCode: "PLANT-WS68"},

		// Level 6: Equipment Unit / Package
		{Code: "JI-JL-AG-11-PW-PKG", Description: "Produced Water Separator Package", Level: 6, ParentCode: "JI-JL-AG-11-PW"},
		{Code: "JI-JL-AG-11-V101", Description: "High Pressure Inlet Slug Catcher", Level: 6, ParentCode: "JI-JL-AG-11-IS"},
		{Code: "JI-JL-AG-12-MCC01", Description: "Motor Control Center 480V", Level: 6, ParentCode: "JI-JL-AG-12-ECTB"},
		{Code: "JI-JL-AG-68-WH01", Description: "Production Wellhead X-Tree", Level: 6, ParentCode: "JI-JL-AG-68-WS"},

		// Level 7: Maintainable Item
		{Code: "JI-JL-AG-11-P101A", Description: "Produced Water Charge Pump A", Level: 7, ParentCode: "JI-JL-AG-11-PW-PKG"},
		{Code: "JI-JL-AG-11-P101B", Description: "Produced Water Charge Pump B (Standby)", Level: 7, ParentCode: "JI-JL-AG-11-PW-PKG"},
		{Code: "JI-JL-AG-11-V101-PSV", Description: "Safety Relief Valve Assembly", Level: 7, ParentCode: "JI-JL-AG-11-V101"},

		// Level 8: Part / Component
		{Code: "JI-JL-AG-11-P101A-SEAL", Description: "Pump Mechanical Seal Cartridge", Level: 8, ParentCode: "JI-JL-AG-11-P101A"},
		{Code: "JI-JL-AG-11-P101A-IMP", Description: "Closed Impeller Titanium Gr.2", Level: 8, ParentCode: "JI-JL-AG-11-P101A"},
	}

	codeToID := make(map[string]int)
	now := time.Now()

	for _, s := range seeds {
		var parentID *int
		if s.ParentCode != "" {
			if pid, ok := codeToID[s.ParentCode]; ok {
				parentID = &pid
			}
		}

		insertQuery := `
			INSERT INTO functional_locations (tenant_id, parent_id, code, description, level, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, true, $6, $7)
			ON CONFLICT (tenant_id, code) DO UPDATE SET description = EXCLUDED.description, level = EXCLUDED.level
			RETURNING id`

		var newID int
		err := r.db.QueryRowContext(ctx, insertQuery, tenantID, parentID, s.Code, s.Description, s.Level, now, now).Scan(&newID)
		if err != nil {
			return fmt.Errorf("failed to seed functional location %s: %w", s.Code, err)
		}
		codeToID[s.Code] = newID
	}

	// Also check if any assets exist with status 'Installed' that could be linked to seed FLOCs
	pwID := codeToID["JI-JL-AG-11-PW"]
	isID := codeToID["JI-JL-AG-11-IS"]
	if pwID > 0 || isID > 0 {
		_ = r.linkSampleAssetsToFloc(ctx, tenantID, pwID, isID)
	}

	return nil
}

func (r *functionalLocationRepository) linkSampleAssetsToFloc(ctx context.Context, tenantID, pwID, isID int) error {
	// If there are existing assets without installed_floc_id, link a few of them for demo
	updatePW := `
		UPDATE assets
		SET installed_floc_id = $1, has_funcloc = true
		WHERE id IN (
			SELECT id FROM assets
			WHERE tenant_id = $2 AND installed_floc_id IS NULL AND COALESCE(status, '') <> 'deleted'
			LIMIT 3
		)`
	_, _ = r.db.ExecContext(ctx, updatePW, pwID, tenantID)

	updateIS := `
		UPDATE assets
		SET installed_floc_id = $1, has_funcloc = true
		WHERE id IN (
			SELECT id FROM assets
			WHERE tenant_id = $2 AND installed_floc_id IS NULL AND COALESCE(status, '') <> 'deleted'
			LIMIT 2
		)`
	_, _ = r.db.ExecContext(ctx, updateIS, isID, tenantID)

	return nil
}

// GetTree returns the entire hierarchical Functional Location tree with installed equipment counts
func (r *functionalLocationRepository) GetTree(ctx context.Context, tenantID int) ([]*models.FunctionalLocationNode, error) {
	// Auto-seed if empty
	_ = r.SeedDefaultFlocsIfEmpty(ctx, tenantID)

	// 1. Fetch all functional locations for the tenant
	flocQuery := `
		SELECT id, tenant_id, parent_id, code, COALESCE(description, '') AS description, level, is_active
		FROM functional_locations
		WHERE tenant_id = $1 AND is_active = true
		ORDER BY level ASC, code ASC`

	var flocRows []rawFlocRow
	if err := r.db.SelectContext(ctx, &flocRows, flocQuery, tenantID); err != nil {
		return nil, fmt.Errorf("failed to fetch functional locations: %w", err)
	}

	// 2. Fetch all installed equipment for the tenant
	equipQuery := `
		SELECT id, installed_floc_id, COALESCE(tag_number, '') AS tag_number, COALESCE(name, '') AS name,
		       COALESCE(asset_class, '') AS asset_class, COALESCE(asset_type, '') AS asset_type,
		       COALESCE(NULLIF(lifecycle_status, ''), status, 'Installed') AS status, criticality
		FROM assets
		WHERE tenant_id = $1 AND installed_floc_id IS NOT NULL AND COALESCE(status, '') <> 'deleted'
		  AND (COALESCE(NULLIF(lifecycle_status, ''), status) ILIKE 'installed' OR status = 'Installed' OR lifecycle_status = 'Installed')
		ORDER BY tag_number ASC`

	var equipRows []rawEquipmentRow
	if err := r.db.SelectContext(ctx, &equipRows, equipQuery, tenantID); err != nil {
		// Log or fallback to empty equipment if query fails (e.g. column nuances)
		equipRows = []rawEquipmentRow{}
	}

	// Group equipments by functional location ID
	equipMap := make(map[int][]models.EquipmentSummary)
	for _, eq := range equipRows {
		crit := eq.Criticality
		summary := models.EquipmentSummary{
			ID:          eq.ID,
			TagNumber:   eq.TagNumber,
			Name:        eq.Name,
			AssetClass:  eq.AssetClass,
			AssetType:   eq.AssetType,
			Status:      eq.Status,
			Criticality: crit,
		}
		equipMap[eq.InstalledFlocID] = append(equipMap[eq.InstalledFlocID], summary)
	}

	// 3. Construct all nodes
	nodeMap := make(map[int]*models.FunctionalLocationNode, len(flocRows))
	for _, row := range flocRows {
		eqs := equipMap[row.ID]
		if eqs == nil {
			eqs = []models.EquipmentSummary{}
		}
		node := &models.FunctionalLocationNode{
			ID:                      row.ID,
			TenantID:                row.TenantID,
			ParentID:                row.ParentID,
			Code:                    row.Code,
			Description:             row.Description,
			Level:                   row.Level,
			IsActive:                row.IsActive,
			InstalledEquipmentCount: len(eqs),
			Equipments:              eqs,
			InstalledEquipments:     eqs,
			Children:                []*models.FunctionalLocationNode{},
		}
		nodeMap[row.ID] = node
	}

	// 4. Assemble tree
	var roots []*models.FunctionalLocationNode
	for _, row := range flocRows {
		node := nodeMap[row.ID]
		if row.ParentID != nil {
			if parent, exists := nodeMap[*row.ParentID]; exists {
				parent.Children = append(parent.Children, node)
				continue
			}
		}
		roots = append(roots, node)
	}

	// 5. Populate full hierarchy path for each node (e.g., Company > Site > Area > Unit)
	var populatePaths func(nodes []*models.FunctionalLocationNode, parentPath string)
	populatePaths = func(nodes []*models.FunctionalLocationNode, parentPath string) {
		for _, n := range nodes {
			label := strings.TrimSpace(n.Description)
			if label == "" {
				label = strings.TrimSpace(n.Code)
			}
			if parentPath == "" {
				n.Path = label
			} else {
				n.Path = parentPath + " > " + label
			}
			populatePaths(n.Children, n.Path)
		}
	}
	populatePaths(roots, "")

	if roots == nil {
		roots = []*models.FunctionalLocationNode{}
	}

	return roots, nil
}

// GetAll returns flat list of all functional locations
func (r *functionalLocationRepository) GetAll(ctx context.Context, tenantID int) ([]models.FunctionalLocation, error) {
	_ = r.SeedDefaultFlocsIfEmpty(ctx, tenantID)

	var list []models.FunctionalLocation
	query := `SELECT * FROM functional_locations WHERE tenant_id = $1 AND is_active = true ORDER BY level ASC, code ASC`
	if err := r.db.SelectContext(ctx, &list, query, tenantID); err != nil {
		return nil, fmt.Errorf("failed to list functional locations: %w", err)
	}
	return list, nil
}

// GetByID retrieves a single functional location by ID
func (r *functionalLocationRepository) GetByID(ctx context.Context, tenantID, id int) (*models.FunctionalLocation, error) {
	var floc models.FunctionalLocation
	query := `SELECT * FROM functional_locations WHERE id = $1 AND tenant_id = $2`
	if err := r.db.GetContext(ctx, &floc, query, id, tenantID); err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get functional location by ID: %w", err)
	}
	return &floc, nil
}

// GetEquipments retrieves the list of installed equipments for a specific functional location
func (r *functionalLocationRepository) GetEquipments(ctx context.Context, tenantID, flocID int) ([]models.EquipmentSummary, error) {
	query := `
		SELECT id, installed_floc_id, COALESCE(tag_number, '') AS tag_number, COALESCE(name, '') AS name,
		       COALESCE(asset_class, '') AS asset_class, COALESCE(asset_type, '') AS asset_type,
		       COALESCE(NULLIF(lifecycle_status, ''), status, 'Installed') AS status, criticality
		FROM assets
		WHERE tenant_id = $1 AND installed_floc_id = $2 AND COALESCE(status, '') <> 'deleted'
		  AND (COALESCE(NULLIF(lifecycle_status, ''), status) ILIKE 'installed' OR status = 'Installed' OR lifecycle_status = 'Installed')
		ORDER BY tag_number ASC`

	var equipRows []rawEquipmentRow
	if err := r.db.SelectContext(ctx, &equipRows, query, tenantID, flocID); err != nil {
		return nil, fmt.Errorf("failed to get equipment for functional location: %w", err)
	}

	result := make([]models.EquipmentSummary, 0, len(equipRows))
	for _, eq := range equipRows {
		result = append(result, models.EquipmentSummary{
			ID:          eq.ID,
			TagNumber:   eq.TagNumber,
			Name:        eq.Name,
			AssetClass:  eq.AssetClass,
			AssetType:   eq.AssetType,
			Status:      eq.Status,
			Criticality: eq.Criticality,
		})
	}
	return result, nil
}

