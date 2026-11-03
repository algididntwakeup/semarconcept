package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"backend/app/models"
	"gorm.io/gorm"
)

// DuplicateAssetDetail holds detailed information about a duplicate asset row.
type DuplicateAssetDetail struct {
	ID              int        `json:"id" db:"id"`
	AssetID         int        `json:"asset_id" db:"asset_id"`
	TenantID        int        `json:"tenant_id" db:"tenant_id"`
	TagNumber       string     `json:"tag_number" db:"tag_number"`
	Name            string     `json:"name" db:"name"`
	Description     *string    `json:"description,omitempty" db:"description"`
	AssetClass      *string    `json:"asset_class,omitempty" db:"asset_class"`
	AssetType       *string    `json:"asset_type,omitempty" db:"asset_type"`
	Status          *string    `json:"status,omitempty" db:"status"`
	LifecycleStatus *string    `json:"lifecycle_status,omitempty" db:"lifecycle_status"`
	ParentID        *int       `json:"parent_id,omitempty" db:"parent_id"`
	InstalledFlocID *int       `json:"installed_floc_id,omitempty" db:"installed_floc_id"`
	HasFuncloc      bool       `json:"has_funcloc" db:"has_funcloc"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

// DuplicateTagGroup groups duplicate assets sharing the same tag_number.
type DuplicateTagGroup struct {
	TagNumber      string                 `json:"tag_number"`
	DuplicateCount int                    `json:"duplicate_count"`
	Duplicates     []DuplicateAssetDetail `json:"duplicates"`
}

// ResolveDuplicateRequest specifies which duplicate asset to keep and which ones to remove.
type ResolveDuplicateRequest struct {
	KeptAssetID     int   `json:"kept_asset_id"`
	DeletedAssetIDs []int `json:"deleted_asset_ids"`
}

// ResolveDuplicateResult returns the resolution summary.
type ResolveDuplicateResult struct {
	KeptAssetID      int             `json:"kept_asset_id"`
	DeletedCount     int64           `json:"deleted_count"`
	DeletedAssetIDs  []int           `json:"deleted_asset_ids"`
	MergedProperties models.JSONBMap `json:"merged_properties,omitempty"`
}

// FixLinksResult contains the count of component links repaired.
type FixLinksResult struct {
	Count         int64 `json:"count"`
	FixedCount    int64 `json:"fixed_count"`
	AffectedLinks int64 `json:"affected_links"`
	DryRun        bool  `json:"dry_run"`
}

// SyncFLOCResult contains the count of components synced to their parent's functional location.
type SyncFLOCResult struct {
	Count              int64 `json:"count"`
	SyncedCount        int64 `json:"synced_count"`
	ValidComponents    int64 `json:"valid_components"`
	OrphanedComponents int64 `json:"orphaned_components"`
	DryRun             bool  `json:"dry_run"`
}

// MaintenanceService interface defines data cleaning and maintenance operations.
type MaintenanceService interface {
	DiagnoseDuplicates(ctx context.Context, tenantID int) ([]DuplicateTagGroup, error)
	FixComponentLinks(ctx context.Context, tenantID int, userID int) (*FixLinksResult, error)
	SyncComponentsToFLOC(ctx context.Context, tenantID int, userID int) (*SyncFLOCResult, error)
	ResolveDuplicate(ctx context.Context, tenantID int, userID int, req *ResolveDuplicateRequest) (*ResolveDuplicateResult, error)
}

type maintenanceService struct {
	db *gorm.DB
}

// NewMaintenanceService creates a new MaintenanceService instance with GORM.
func NewMaintenanceService(db *gorm.DB) MaintenanceService {
	return &maintenanceService{db: db}
}

// DiagnoseDuplicates runs a GORM query to find assets with identical tag numbers within the tenant,
// returning structured groups containing full asset rows for comparison.
func (s *maintenanceService) DiagnoseDuplicates(ctx context.Context, tenantID int) ([]DuplicateTagGroup, error) {
	var tagCounts []struct {
		TagNumber string `gorm:"column:tag_number"`
		Count     int64  `gorm:"column:count"`
	}

	// GORM query to group by tag_number and filter having count > 1
	err := s.db.WithContext(ctx).
		Table("assets").
		Select("BTRIM(tag_number) AS tag_number, COUNT(*) AS count").
		Where("tenant_id = ? AND NULLIF(BTRIM(tag_number), '') IS NOT NULL AND COALESCE(status, '') <> 'deleted'", tenantID).
		Group("BTRIM(tag_number)").
		Having("COUNT(*) > 1").
		Order("count DESC, BTRIM(tag_number) ASC").
		Scan(&tagCounts).Error
	if err != nil {
		return nil, fmt.Errorf("failed to query duplicate asset tags: %w", err)
	}

	groups := make([]DuplicateTagGroup, 0, len(tagCounts))

	// Fetch full details for each duplicate tag group
	for _, tc := range tagCounts {
		var assets []models.Asset
		err := s.db.WithContext(ctx).
			Where("tenant_id = ? AND LOWER(BTRIM(tag_number)) = LOWER(BTRIM(?)) AND COALESCE(status, '') <> 'deleted'", tenantID, tc.TagNumber).
			Order("id ASC").
			Find(&assets).Error
		if err != nil {
			return nil, fmt.Errorf("load duplicate assets for tag %q: %w", tc.TagNumber, err)
		}

		details := make([]DuplicateAssetDetail, len(assets))
		for i, a := range assets {
			tag := ""
			if a.TagNumber != nil {
				tag = *a.TagNumber
			}
			details[i] = DuplicateAssetDetail{
				ID:              a.ID,
				AssetID:         a.ID,
				TenantID:        a.TenantID,
				TagNumber:       tag,
				Name:            a.Name,
				Description:     a.Description,
				AssetClass:      a.AssetClass,
				AssetType:       a.AssetType,
				Status:          a.Status,
				LifecycleStatus: a.LifecycleStatus,
				ParentID:        a.ParentID,
				InstalledFlocID: a.InstalledFlocID,
				HasFuncloc:      a.HasFuncloc,
				CreatedAt:       a.CreatedAt,
				UpdatedAt:       a.UpdatedAt,
			}
		}

		groups = append(groups, DuplicateTagGroup{
			TagNumber:      tc.TagNumber,
			DuplicateCount: len(details),
			Duplicates:     details,
		})
	}

	return groups, nil
}

// isValueEmpty checks if a value is nil, an empty string, or whitespace only.
func isValueEmpty(v interface{}) bool {
	if v == nil {
		return true
	}
	if s, ok := v.(string); ok {
		return strings.TrimSpace(s) == ""
	}
	return false
}

// toMapStringInterface converts various map types to map[string]interface{}.
func toMapStringInterface(v interface{}) (map[string]interface{}, bool) {
	if v == nil {
		return nil, false
	}
	switch m := v.(type) {
	case map[string]interface{}:
		return m, true
	case models.JSONBMap:
		return map[string]interface{}(m), true
	default:
		return nil, false
	}
}

// deepMergeMaps fills missing or empty properties (nil or "") in target using available values from source.
// Priority Rule: non-empty properties already populated in target are NEVER overwritten by source.
func deepMergeMaps(target map[string]interface{}, source map[string]interface{}) map[string]interface{} {
	if target == nil {
		target = make(map[string]interface{})
	}
	if source == nil {
		return target
	}

	for k, srcVal := range source {
		if isValueEmpty(srcVal) {
			continue
		}

		tgtVal, exists := target[k]
		if !exists || isValueEmpty(tgtVal) {
			target[k] = srcVal
			continue
		}

		// If both target and source values are maps, recursively deep merge them
		tgtSubMap, tgtIsMap := toMapStringInterface(tgtVal)
		srcSubMap, srcIsMap := toMapStringInterface(srcVal)
		if tgtIsMap && srcIsMap {
			target[k] = deepMergeMaps(tgtSubMap, srcSubMap)
		}
		// If target has a non-empty scalar or value, Priority Rule keeps target untouched.
	}

	return target
}

// parseRBIProperties safely extracts map[string]interface{} from raw JSONB data.
func parseRBIProperties(raw interface{}) map[string]interface{} {
	if raw == nil {
		return make(map[string]interface{})
	}
	switch v := raw.(type) {
	case map[string]interface{}:
		res := make(map[string]interface{}, len(v))
		for k, val := range v {
			res[k] = val
		}
		return res
	case models.JSONBMap:
		res := make(map[string]interface{}, len(v))
		for k, val := range v {
			res[k] = val
		}
		return res
	case []byte:
		var m map[string]interface{}
		if err := json.Unmarshal(v, &m); err == nil && m != nil {
			return m
		}
	case string:
		var m map[string]interface{}
		if err := json.Unmarshal([]byte(v), &m); err == nil && m != nil {
			return m
		}
	default:
		if b, err := json.Marshal(v); err == nil {
			var m map[string]interface{}
			if err := json.Unmarshal(b, &m); err == nil && m != nil {
				return m
			}
		}
	}
	return make(map[string]interface{})
}

// ResolveDuplicate resolves duplicate assets by keeping kept_asset_id, performing a Smart Merge
// on rbi_properties from deleted_asset_ids, and soft-deleting deleted_asset_ids.
func (s *maintenanceService) ResolveDuplicate(ctx context.Context, tenantID int, userID int, req *ResolveDuplicateRequest) (*ResolveDuplicateResult, error) {
	if req == nil {
		return nil, errors.New("request payload is required")
	}
	if req.KeptAssetID <= 0 {
		return nil, errors.New("kept_asset_id must be a positive integer")
	}
	if len(req.DeletedAssetIDs) == 0 {
		return nil, errors.New("deleted_asset_ids must not be empty")
	}

	// Validate kept_asset_id is not in deleted_asset_ids
	for _, id := range req.DeletedAssetIDs {
		if id == req.KeptAssetID {
			return nil, errors.New("kept_asset_id cannot be included in deleted_asset_ids")
		}
	}

	// 1. Fetch kept asset under tenant
	var keptAsset models.Asset
	err := s.db.WithContext(ctx).
		Where("id = ? AND tenant_id = ? AND COALESCE(status, '') <> 'deleted'", req.KeptAssetID, tenantID).
		First(&keptAsset).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("kept asset not found or does not belong to tenant")
		}
		return nil, fmt.Errorf("verify kept asset: %w", err)
	}

	// 2. Fetch duplicate assets to be merged and deleted
	var deletedAssets []models.Asset
	err = s.db.WithContext(ctx).
		Where("id IN (?) AND tenant_id = ? AND COALESCE(status, '') <> 'deleted'", req.DeletedAssetIDs, tenantID).
		Find(&deletedAssets).Error
	if err != nil {
		return nil, fmt.Errorf("fetch duplicate assets for smart merge: %w", err)
	}

	// 3. Smart Merge: Fill empty / null keys in keptAsset.rbi_properties from deletedAssets.
	// Priority Rule: Populated properties in keptAsset are NEVER overwritten.
	mergedRBI := parseRBIProperties(keptAsset.RBIProperties)
	for _, da := range deletedAssets {
		delRBI := parseRBIProperties(da.RBIProperties)
		mergedRBI = deepMergeMaps(mergedRBI, delRBI)
	}

	// 4. Execute re-parenting, RBI update, and deletion within database transaction
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Save merged rbi_properties to kept asset
	keptUpdates := map[string]interface{}{
		"rbi_properties": models.JSONBMap(mergedRBI),
		"updated_at":     time.Now().UTC(),
	}
	if userID > 0 {
		keptUpdates["updated_by"] = userID
	}
	if err := tx.Table("assets").
		Where("id = ? AND tenant_id = ?", req.KeptAssetID, tenantID).
		Updates(keptUpdates).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("update kept asset merged rbi_properties: %w", err)
	}

	// Re-parent any child assets referencing deleted assets to kept_asset_id
	if err := tx.Table("assets").
		Where("parent_id IN (?) AND tenant_id = ?", req.DeletedAssetIDs, tenantID).
		Update("parent_id", req.KeptAssetID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("re-parent child assets: %w", err)
	}

	// Soft-delete duplicate assets (status = 'deleted')
	updates := map[string]interface{}{
		"status":     "deleted",
		"updated_at": time.Now().UTC(),
	}
	if userID > 0 {
		updates["updated_by"] = userID
	}

	res := tx.Table("assets").
		Where("id IN (?) AND tenant_id = ? AND COALESCE(status, '') <> 'deleted'", req.DeletedAssetIDs, tenantID).
		Updates(updates)
	if res.Error != nil {
		tx.Rollback()
		return nil, fmt.Errorf("soft delete duplicate assets: %w", res.Error)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return &ResolveDuplicateResult{
		KeptAssetID:      req.KeptAssetID,
		DeletedCount:     res.RowsAffected,
		DeletedAssetIDs:  req.DeletedAssetIDs,
		MergedProperties: models.JSONBMap(mergedRBI),
	}, nil
}

// FixComponentLinks performs auto-linking for Level 7 / component assets whose parent_id is empty.
// If the component's tag_number contains a parent asset's tag_number, parent_id is updated to the parent's ID.
func (s *maintenanceService) FixComponentLinks(ctx context.Context, tenantID int, userID int) (*FixLinksResult, error) {
	var query string
	var args []interface{}

	if userID > 0 {
		query = `
			UPDATE assets AS comp
			SET parent_id = matched.parent_id,
			    updated_by = ?,
			    updated_at = CURRENT_TIMESTAMP
			FROM (
				SELECT DISTINCT ON (c.id) c.id AS comp_id, p.id AS parent_id
				FROM assets c
				JOIN assets p ON p.tenant_id = c.tenant_id
					AND p.id <> c.id
					AND COALESCE(p.status, '') <> 'deleted'
					AND p.parent_id IS NULL
					AND NULLIF(BTRIM(p.tag_number), '') IS NOT NULL
					AND LENGTH(BTRIM(p.tag_number)) >= 3
					AND UPPER(BTRIM(c.tag_number)) LIKE '%' || UPPER(BTRIM(p.tag_number)) || '%'
				WHERE c.tenant_id = ?
					AND c.parent_id IS NULL
					AND COALESCE(c.status, '') <> 'deleted'
					AND (
						c.rbi_properties->>'General.Hierarchy Level' IN ('7', '2')
						OR c.rbi_properties->>'hierarchy_level' = '7'
						OR c.specifications->>'hierarchy_level' = '7'
						OR LOWER(COALESCE(c.asset_type, '')) = 'component'
						OR LOWER(COALESCE(c.asset_class, '')) = 'component'
					)
				ORDER BY c.id, LENGTH(BTRIM(p.tag_number)) DESC
			) AS matched
			WHERE comp.id = matched.comp_id AND comp.tenant_id = ?`
		args = []interface{}{userID, tenantID, tenantID}
	} else {
		query = `
			UPDATE assets AS comp
			SET parent_id = matched.parent_id,
			    updated_at = CURRENT_TIMESTAMP
			FROM (
				SELECT DISTINCT ON (c.id) c.id AS comp_id, p.id AS parent_id
				FROM assets c
				JOIN assets p ON p.tenant_id = c.tenant_id
					AND p.id <> c.id
					AND COALESCE(p.status, '') <> 'deleted'
					AND p.parent_id IS NULL
					AND NULLIF(BTRIM(p.tag_number), '') IS NOT NULL
					AND LENGTH(BTRIM(p.tag_number)) >= 3
					AND UPPER(BTRIM(c.tag_number)) LIKE '%' || UPPER(BTRIM(p.tag_number)) || '%'
				WHERE c.tenant_id = ?
					AND c.parent_id IS NULL
					AND COALESCE(c.status, '') <> 'deleted'
					AND (
						c.rbi_properties->>'General.Hierarchy Level' IN ('7', '2')
						OR c.rbi_properties->>'hierarchy_level' = '7'
						OR c.specifications->>'hierarchy_level' = '7'
						OR LOWER(COALESCE(c.asset_type, '')) = 'component'
						OR LOWER(COALESCE(c.asset_class, '')) = 'component'
					)
				ORDER BY c.id, LENGTH(BTRIM(p.tag_number)) DESC
			) AS matched
			WHERE comp.id = matched.comp_id AND comp.tenant_id = ?`
		args = []interface{}{tenantID, tenantID}
	}

	res := s.db.WithContext(ctx).Exec(query, args...)
	if res.Error != nil {
		return nil, fmt.Errorf("failed to fix component links: %w", res.Error)
	}

	return &FixLinksResult{
		Count:         res.RowsAffected,
		FixedCount:    res.RowsAffected,
		AffectedLinks: res.RowsAffected,
		DryRun:        false,
	}, nil
}

// SyncComponentsToFLOC copies installed_floc_id from the parent asset to its child components (Level 7)
// when the child's installed_floc_id is empty or differs from the parent.
func (s *maintenanceService) SyncComponentsToFLOC(ctx context.Context, tenantID int, userID int) (*SyncFLOCResult, error) {
	var query string
	var args []interface{}

	if userID > 0 {
		query = `
			UPDATE assets AS comp
			SET installed_floc_id = parent.installed_floc_id,
			    has_funcloc = CASE WHEN parent.installed_floc_id IS NOT NULL THEN true ELSE false END,
			    updated_by = ?,
			    updated_at = CURRENT_TIMESTAMP
			FROM assets AS parent
			WHERE comp.parent_id = parent.id
			  AND comp.tenant_id = ?
			  AND parent.tenant_id = comp.tenant_id
			  AND COALESCE(comp.status, '') <> 'deleted'
			  AND COALESCE(parent.status, '') <> 'deleted'
			  AND (
			      (parent.installed_floc_id IS NOT NULL AND (comp.installed_floc_id IS NULL OR comp.installed_floc_id <> parent.installed_floc_id))
			      OR (parent.installed_floc_id IS NULL AND comp.installed_floc_id IS NOT NULL)
			  )
			  AND (
					comp.rbi_properties->>'General.Hierarchy Level' IN ('7', '2')
					OR comp.rbi_properties->>'hierarchy_level' = '7'
					OR comp.specifications->>'hierarchy_level' = '7'
					OR LOWER(COALESCE(comp.asset_type, '')) = 'component'
					OR LOWER(COALESCE(comp.asset_class, '')) = 'component'
			  )`
		args = []interface{}{userID, tenantID}
	} else {
		query = `
			UPDATE assets AS comp
			SET installed_floc_id = parent.installed_floc_id,
			    has_funcloc = CASE WHEN parent.installed_floc_id IS NOT NULL THEN true ELSE false END,
			    updated_at = CURRENT_TIMESTAMP
			FROM assets AS parent
			WHERE comp.parent_id = parent.id
			  AND comp.tenant_id = ?
			  AND parent.tenant_id = comp.tenant_id
			  AND COALESCE(comp.status, '') <> 'deleted'
			  AND COALESCE(parent.status, '') <> 'deleted'
			  AND (
			      (parent.installed_floc_id IS NOT NULL AND (comp.installed_floc_id IS NULL OR comp.installed_floc_id <> parent.installed_floc_id))
			      OR (parent.installed_floc_id IS NULL AND comp.installed_floc_id IS NOT NULL)
			  )
			  AND (
					comp.rbi_properties->>'General.Hierarchy Level' IN ('7', '2')
					OR comp.rbi_properties->>'hierarchy_level' = '7'
					OR comp.specifications->>'hierarchy_level' = '7'
					OR LOWER(COALESCE(comp.asset_type, '')) = 'component'
					OR LOWER(COALESCE(comp.asset_class, '')) = 'component'
			  )`
		args = []interface{}{tenantID}
	}

	res := s.db.WithContext(ctx).Exec(query, args...)
	if res.Error != nil {
		return nil, fmt.Errorf("failed to sync components to FLOC: %w", res.Error)
	}

	return &SyncFLOCResult{
		Count:              res.RowsAffected,
		SyncedCount:        res.RowsAffected,
		ValidComponents:    res.RowsAffected,
		OrphanedComponents: 0,
		DryRun:             false,
	}, nil
}
