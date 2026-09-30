// platform/backend/app/models/Asset.go
package models

import (
	"fmt"
	"gorm.io/gorm"
	"time"
)

// Asset represents major assets within units or sites (locations, vessels, pumps, heat exchangers)
type Asset struct {
	ID                      int        `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID                int        `gorm:"index;not null;index:idx_assets_tenant_status,priority:1;index:idx_assets_tenant_tag,priority:1;index:idx_assets_tenant_type,priority:1;index:idx_assets_tenant_lifecycle,priority:1" db:"tenant_id" json:"tenant_id"`
	ParentID                *int       `gorm:"index" db:"parent_id" json:"parent_id,omitempty"`
	UnitID                  *int       `gorm:"index" db:"unit_id" json:"unit_id,omitempty"`
	FunctionalLocationID    *int       `gorm:"index;index:idx_assets_tenant_functional_location,priority:2" db:"functional_location_id" json:"functional_location_id,omitempty"`
	Name                    string     `gorm:"not null;size:255" db:"name" json:"name"`
	Description             *string    `gorm:"type:text" db:"description" json:"description,omitempty"`
	TagNumber               *string    `gorm:"size:100;uniqueIndex:idx_assets_unique_tag_number;index:idx_assets_tag_number;index:idx_assets_tenant_tag,priority:2" db:"tag_number" json:"tag_number"`
	AssetType               *string    `gorm:"size:100;index:idx_assets_asset_type;index:idx_assets_tenant_type,priority:2" db:"asset_type" json:"asset_type"`
	AssetClass              *string    `gorm:"size:100" db:"asset_class" json:"asset_class"`
	Manufacturer            *string    `gorm:"size:255" db:"manufacturer" json:"manufacturer"`
	Model                   *string    `gorm:"size:255" db:"model" json:"model"`
	SerialNumber            *string    `gorm:"size:255" db:"serial_number" json:"serial_number"`
	ManufactureDate         *time.Time `db:"manufacture_date" json:"manufacture_date,omitempty"`
	InstallationDate        *time.Time `db:"installation_date" json:"installation_date,omitempty"`
	CommissioningDate       *time.Time `db:"commissioning_date" json:"commissioning_date,omitempty"`
	WarrantyExpiry          *time.Time `db:"warranty_expiry" json:"warranty_expiry,omitempty"`
	DesignLifeYears         *int       `db:"design_life_years" json:"design_life_years"`
	RemainingLifeYears      *float64   `db:"remaining_life_years" json:"remaining_life_years"`
	Specifications          JSONBMap   `gorm:"type:jsonb" db:"specifications" json:"specifications,omitempty"`
	RBIProperties           JSONBMap   `gorm:"column:rbi_properties;type:jsonb;not null;default:'{}'" db:"rbi_properties" json:"rbi_properties,omitempty"`
	OperatingParameters     JSONBMap   `gorm:"type:jsonb" db:"operating_parameters" json:"operating_parameters,omitempty"`
	DesignConditions        JSONBMap   `gorm:"type:jsonb" db:"design_conditions" json:"design_conditions,omitempty"`
	Materials               JSONBMap   `gorm:"type:jsonb" db:"materials" json:"materials,omitempty"`
	DrawingsReferences      JSONBMap   `gorm:"type:jsonb" db:"drawings_references" json:"drawings_references,omitempty"`
	MaintenanceStrategy     *string    `gorm:"size:100" db:"maintenance_strategy" json:"maintenance_strategy"`
	InspectionStrategy      *string    `gorm:"size:100" db:"inspection_strategy" json:"inspection_strategy"`
	Status                  *string    `gorm:"size:50;default:active;index:idx_assets_status;index:idx_assets_tenant_status,priority:2" db:"status" json:"status"`
	LifecycleStatus         *string    `gorm:"size:50;index;index:idx_assets_tenant_lifecycle,priority:2" db:"lifecycle_status" json:"lifecycle_status,omitempty"`
	Criticality             *int       `gorm:"default:3" db:"criticality" json:"criticality"`
	SafetyCritical          *bool      `gorm:"default:false" db:"safety_critical" json:"safety_critical"`
	EnvironmentallyCritical *bool      `gorm:"default:false" db:"environmentally_critical" json:"environmentally_critical"`
	Metadata                JSONBMap   `gorm:"type:jsonb" db:"metadata" json:"metadata,omitempty"`
	TaxonomyCategoryID      *int       `gorm:"index" db:"taxonomy_category_id" json:"taxonomy_category_id,omitempty"`
	CreatedAt               time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt               time.Time  `db:"updated_at" json:"updated_at"`
	CreatedBy               *int       `gorm:"index" db:"created_by" json:"created_by,omitempty"`
	UpdatedBy               *int       `gorm:"index" db:"updated_by" json:"updated_by,omitempty"`

	// Relationships
	Parent           *Asset            `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children         []Asset           `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Tenant           *Tenant           `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Unit             *Unit             `gorm:"foreignKey:UnitID" json:"unit,omitempty"`
	TaxonomyCategory *TaxonomyCategory `gorm:"foreignKey:TaxonomyCategoryID" json:"taxonomy_category,omitempty"`
	Components       []Component       `gorm:"foreignKey:AssetID" json:"components,omitempty"`
}

// Asset status constants
const (
	AssetStatusActive         = "active"
	AssetStatusInactive       = "inactive"
	AssetStatusMaintenance    = "maintenance"
	AssetStatusOutOfService   = "out_of_service"
	AssetStatusDecommissioned = "decommissioned"
)

// Asset type constants
const (
	AssetTypePressureVessel  = "pressure_vessel"
	AssetTypeHeatExchanger   = "heat_exchanger"
	AssetTypePump            = "pump"
	AssetTypeCompressor      = "compressor"
	AssetTypeTurbine         = "turbine"
	AssetTypeTank            = "tank"
	AssetTypePiping          = "piping"
	AssetTypeValve           = "valve"
	AssetTypeInstrumentation = "instrumentation"
)

// Maintenance strategy constants
const (
	MaintenanceStrategyPreventive   = "preventive"
	MaintenanceStrategyPredictive   = "predictive"
	MaintenanceStrategyCorrective   = "corrective"
	MaintenanceStrategyCondition    = "condition_based"
	MaintenanceStrategyRunToFailure = "run_to_failure"
)

// Inspection strategy constants
const (
	InspectionStrategyRBI       = "RBI"
	InspectionStrategyRCM       = "RCM"
	InspectionStrategyTimeased  = "time_based"
	InspectionStrategyCondition = "condition_based"
	InspectionStrategyRiskBased = "risk_based"
)

// Table name
func (Asset) TableName() string {
	return "assets"
}

// ToMap converts asset to map for audit logging
func (e *Asset) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":                       e.ID,
		"tenant_id":                e.TenantID,
		"parent_id":                e.ParentID,
		"unit_id":                  e.UnitID,
		"functional_location_id":   e.FunctionalLocationID,
		"name":                     e.Name,
		"description":              e.Description,
		"tag_number":               e.TagNumber,
		"asset_type":               e.AssetType,
		"asset_class":              e.AssetClass,
		"manufacturer":             e.Manufacturer,
		"model":                    e.Model,
		"serial_number":            e.SerialNumber,
		"manufacture_date":         e.ManufactureDate,
		"installation_date":        e.InstallationDate,
		"commissioning_date":       e.CommissioningDate,
		"warranty_expiry":          e.WarrantyExpiry,
		"design_life_years":        e.DesignLifeYears,
		"remaining_life_years":     e.RemainingLifeYears,
		"specifications":           e.Specifications,
		"rbi_properties":           e.RBIProperties,
		"operating_parameters":     e.OperatingParameters,
		"design_conditions":        e.DesignConditions,
		"materials":                e.Materials,
		"drawings_references":      e.DrawingsReferences,
		"maintenance_strategy":     e.MaintenanceStrategy,
		"inspection_strategy":      e.InspectionStrategy,
		"status":                   e.Status,
		"lifecycle_status":         e.LifecycleStatus,
		"criticality":              e.Criticality,
		"safety_critical":          e.SafetyCritical,
		"environmentally_critical": e.EnvironmentallyCritical,
		"metadata":                 e.Metadata,
		"taxonomy_category_id":     e.TaxonomyCategoryID,
		"created_at":               e.CreatedAt,
		"updated_at":               e.UpdatedAt,
		"created_by":               e.CreatedBy,
		"updated_by":               e.UpdatedBy,
	}
}

// Helper methods
func (e *Asset) IsActive() bool {
	return e.Status != nil && *e.Status == AssetStatusActive
}

func (e *Asset) IsOperational() bool {
	return e.Status != nil && *e.Status == AssetStatusActive && (e.CommissioningDate == nil || time.Now().After(*e.CommissioningDate))
}

func (e *Asset) IsCritical() bool {
	return (e.Criticality != nil && *e.Criticality >= 4) || (e.SafetyCritical != nil && *e.SafetyCritical) || (e.EnvironmentallyCritical != nil && *e.EnvironmentallyCritical)
}

func (e *Asset) IsWarrantyValid() bool {
	return e.WarrantyExpiry != nil && time.Now().Before(*e.WarrantyExpiry)
}

func (e *Asset) CalculateAge() float64 {
	if e.InstallationDate == nil {
		return 0
	}
	return time.Since(*e.InstallationDate).Hours() / (24 * 365.25)
}

func (e *Asset) SetMetadata(key string, value interface{}) {
	if e.Metadata == nil {
		e.Metadata = make(JSONBMap)
	}
	e.Metadata[key] = value
}

func (e *Asset) GetMetadata(key string) interface{} {
	if e.Metadata == nil {
		return nil
	}
	return e.Metadata[key]
}

func (e *Asset) GenerateTagNumber() {
	if (e.TagNumber == nil || *e.TagNumber == "") && e.Name != "" {
		// Generate tag number based on Asset type and ID
		typePrefix := "AS"
		if e.AssetType != nil {
			switch *e.AssetType {
			case AssetTypePressureVessel:
				typePrefix = "PV"
			case AssetTypeHeatExchanger:
				typePrefix = "HE"
			case AssetTypePump:
				typePrefix = "P"
			case AssetTypeCompressor:
				typePrefix = "C"
			case AssetTypeTurbine:
				typePrefix = "T"
			case AssetTypeTank:
				typePrefix = "TK"
			}
		}
		tag := fmt.Sprintf("%s-%03d", typePrefix, e.ID)
		e.TagNumber = &tag
	}
}

func (e *Asset) Validate() error {
	if e.Name == "" {
		return fmt.Errorf("asset name is required")
	}

	if e.TenantID <= 0 {
		return fmt.Errorf("tenant ID is required")
	}

	// UnitID is no longer strictly required for all assets (e.g. locations)

	if e.Criticality != nil && (*e.Criticality < 1 || *e.Criticality > 5) {
		return fmt.Errorf("criticality must be between 1 and 5")
	}

	if e.DesignLifeYears != nil && *e.DesignLifeYears < 0 {
		return fmt.Errorf("design life years cannot be negative")
	}

	if e.Status == nil || *e.Status == "" {
		active := AssetStatusActive
		e.Status = &active
	}

	return nil
}

// BeforeCreate hook
func (e *Asset) BeforeCreate(tx *gorm.DB) error {
	if e.Metadata == nil {
		e.Metadata = make(JSONBMap)
	}
	if e.Criticality == nil || *e.Criticality == 0 {
		criticality := 3
		e.Criticality = &criticality
	}
	if e.DesignLifeYears == nil || *e.DesignLifeYears == 0 {
		designLife := 20
		e.DesignLifeYears = &designLife // Default design life
	}
	remainingLife := float64(*e.DesignLifeYears) - e.CalculateAge()
	e.RemainingLifeYears = &remainingLife
	return e.Validate()
}

// BeforeUpdate hook
func (e *Asset) BeforeUpdate(tx *gorm.DB) error {
	if e.DesignLifeYears != nil {
		remainingLife := float64(*e.DesignLifeYears) - e.CalculateAge()
		e.RemainingLifeYears = &remainingLife
	}
	return e.Validate()
}
