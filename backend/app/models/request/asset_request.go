// platform/backend/app/models/request/asset_request.go
package request

import (
	"time"
)

// ===== SITE REQUESTS =====

type CreateSiteRequest struct {
	Name                 string                 `json:"name" validate:"required,min=2,max=255"`
	Code                 *string                `json:"code,omitempty" validate:"omitempty,max=50"`
	SiteType             string                 `json:"site_type" validate:"required"`
	Location             string                 `json:"location" validate:"omitempty,max=500"`
	Address              map[string]interface{} `json:"address,omitempty"`
	Coordinates          map[string]interface{} `json:"coordinates,omitempty"`
	CommissionDate       *time.Time             `json:"commission_date,omitempty"`
	DecommissionDate     *time.Time             `json:"decommission_date,omitempty"`
	Description          *string                `json:"description,omitempty" validate:"omitempty,max=1000"`
	ContactInfo          map[string]interface{} `json:"contact_info,omitempty"`
	OperatingConditions  map[string]interface{} `json:"operating_conditions,omitempty"`
	EnvironmentalFactors map[string]interface{} `json:"environmental_factors,omitempty"`
	Status               *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive commissioning decommissioned maintenance"`
	Metadata             map[string]interface{} `json:"metadata,omitempty"`
}

type UpdateSiteRequest struct {
	Name                 *string                `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	Code                 *string                `json:"code,omitempty" validate:"omitempty,max=50"`
	SiteType             *string                `json:"site_type,omitempty" validate:"omitempty"`
	Location             *string                `json:"location,omitempty" validate:"omitempty,max=500"`
	Address              map[string]interface{} `json:"address,omitempty"`
	Coordinates          map[string]interface{} `json:"coordinates,omitempty"`
	CommissionDate       *time.Time             `json:"commission_date,omitempty"`
	DecommissionDate     *time.Time             `json:"decommission_date,omitempty"`
	Description          *string                `json:"description,omitempty" validate:"omitempty,max=1000"`
	ContactInfo          map[string]interface{} `json:"contact_info,omitempty"`
	OperatingConditions  map[string]interface{} `json:"operating_conditions,omitempty"`
	EnvironmentalFactors map[string]interface{} `json:"environmental_factors,omitempty"`
	Status               *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive commissioning decommissioned maintenance"`
	Metadata             map[string]interface{} `json:"metadata,omitempty"`
}

// ===== UNIT REQUESTS =====

type CreateUnitRequest struct {
	SiteID             int                    `json:"site_id" validate:"required"`
	Name               string                 `json:"name" validate:"required,min=2,max=255"`
	Code               *string                `json:"code,omitempty" validate:"omitempty,max=50"`
	UnitType           string                 `json:"unit_type" validate:"required"`
	ProcessDescription *string                `json:"process_description,omitempty" validate:"omitempty,max=2000"`
	DesignCapacity     *string                `json:"design_capacity,omitempty" validate:"omitempty,max=100"`
	OperatingCapacity  *string                `json:"operating_capacity,omitempty" validate:"omitempty,max=100"`
	CommissionDate     *time.Time             `json:"commission_date,omitempty"`
	DecommissionDate   *time.Time             `json:"decommission_date,omitempty"`
	ProcessConditions  map[string]interface{} `json:"process_conditions,omitempty"`
	SafetySystems      map[string]interface{} `json:"safety_systems,omitempty"`
	ControlSystems     map[string]interface{} `json:"control_systems,omitempty"`
	Status             *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive commissioning decommissioned maintenance shutdown"`
	Criticality        *int                   `json:"criticality,omitempty" validate:"omitempty,min=1,max=5"`
	Metadata           map[string]interface{} `json:"metadata,omitempty"`
}

type UpdateUnitRequest struct {
	SiteID             *int                   `json:"site_id,omitempty" validate:"omitempty"`
	Name               *string                `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	Code               *string                `json:"code,omitempty" validate:"omitempty,max=50"`
	UnitType           *string                `json:"unit_type,omitempty" validate:"omitempty"`
	ProcessDescription *string                `json:"process_description,omitempty" validate:"omitempty,max=2000"`
	DesignCapacity     *string                `json:"design_capacity,omitempty" validate:"omitempty,max=100"`
	OperatingCapacity  *string                `json:"operating_capacity,omitempty" validate:"omitempty,max=100"`
	CommissionDate     *time.Time             `json:"commission_date,omitempty"`
	DecommissionDate   *time.Time             `json:"decommission_date,omitempty"`
	ProcessConditions  map[string]interface{} `json:"process_conditions,omitempty"`
	SafetySystems      map[string]interface{} `json:"safety_systems,omitempty"`
	ControlSystems     map[string]interface{} `json:"control_systems,omitempty"`
	Status             *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive commissioning decommissioned maintenance shutdown"`
	Criticality        *int                   `json:"criticality,omitempty" validate:"omitempty,min=1,max=5"`
	Metadata           map[string]interface{} `json:"metadata,omitempty"`
}

// ===== Asset REQUESTS =====

type CreateAssetRequest struct {
	UnitID                  *int                   `json:"unit_id,omitempty" validate:"omitempty"`
	ParentID                *int                   `json:"parent_id,omitempty" validate:"omitempty"`
	TaxonomyCategoryID      *int                   `json:"taxonomy_category_id,omitempty" validate:"omitempty"`
	Name                    string                 `json:"name" validate:"required,min=2,max=255"`
	TagNumber               *string                `json:"tag_number,omitempty" validate:"omitempty,max=100"`
	AssetType               *string                `json:"asset_type" validate:"required"`
	AssetClass              *string                `json:"asset_class,omitempty" validate:"omitempty,max=100"`
	Manufacturer            *string                `json:"manufacturer,omitempty" validate:"omitempty,max=255"`
	Model                   *string                `json:"model,omitempty" validate:"omitempty,max=255"`
	SerialNumber            *string                `json:"serial_number,omitempty" validate:"omitempty,max=255"`
	ManufactureDate         *time.Time             `json:"manufacture_date,omitempty"`
	InstallationDate        *time.Time             `json:"installation_date,omitempty"`
	CommissioningDate       *time.Time             `json:"commissioning_date,omitempty"`
	WarrantyExpiry          *time.Time             `json:"warranty_expiry,omitempty"`
	DesignLifeYears         *int                   `json:"design_life_years,omitempty" validate:"omitempty,min=0,max=100"`
	Specifications          map[string]interface{} `json:"specifications,omitempty"`
	OperatingParameters     map[string]interface{} `json:"operating_parameters,omitempty"`
	DesignConditions        map[string]interface{} `json:"design_conditions,omitempty"`
	Materials               map[string]interface{} `json:"materials,omitempty"`
	DrawingsReferences      map[string]interface{} `json:"drawings_references,omitempty"`
	MaintenanceStrategy     *string                `json:"maintenance_strategy,omitempty" validate:"omitempty,oneof=preventive predictive corrective condition_based run_to_failure"`
	InspectionStrategy      *string                `json:"inspection_strategy,omitempty" validate:"omitempty,oneof=RBI RCM time_based condition_based risk_based"`
	Status                  *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive maintenance out_of_service decommissioned planned"`
	Criticality             *int                   `json:"criticality,omitempty" validate:"omitempty,min=1,max=5"`
	SafetyCritical          *bool                  `json:"safety_critical,omitempty"`
	EnvironmentallyCritical *bool                  `json:"environmentally_critical,omitempty"`
	Metadata                map[string]interface{} `json:"metadata,omitempty"`
}

type UpdateAssetRequest struct {
	UnitID                  *int                   `json:"unit_id,omitempty" validate:"omitempty"`
	ParentID                *int                   `json:"parent_id,omitempty" validate:"omitempty"`
	TaxonomyCategoryID      *int                   `json:"taxonomy_category_id,omitempty" validate:"omitempty"`
	Name                    *string                `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	TagNumber               *string                `json:"tag_number,omitempty" validate:"omitempty,max=100"`
	AssetType               *string                `json:"asset_type,omitempty" validate:"omitempty"`
	AssetClass              *string                `json:"asset_class,omitempty" validate:"omitempty,max=100"`
	Manufacturer            *string                `json:"manufacturer,omitempty" validate:"omitempty,max=255"`
	Model                   *string                `json:"model,omitempty" validate:"omitempty,max=255"`
	SerialNumber            *string                `json:"serial_number,omitempty" validate:"omitempty,max=255"`
	ManufactureDate         *time.Time             `json:"manufacture_date,omitempty"`
	InstallationDate        *time.Time             `json:"installation_date,omitempty"`
	CommissioningDate       *time.Time             `json:"commissioning_date,omitempty"`
	WarrantyExpiry          *time.Time             `json:"warranty_expiry,omitempty"`
	DesignLifeYears         *int                   `json:"design_life_years,omitempty" validate:"omitempty,min=0,max=100"`
	Specifications          map[string]interface{} `json:"specifications,omitempty"`
	OperatingParameters     map[string]interface{} `json:"operating_parameters,omitempty"`
	DesignConditions        map[string]interface{} `json:"design_conditions,omitempty"`
	Materials               map[string]interface{} `json:"materials,omitempty"`
	DrawingsReferences      map[string]interface{} `json:"drawings_references,omitempty"`
	MaintenanceStrategy     *string                `json:"maintenance_strategy,omitempty" validate:"omitempty,oneof=preventive predictive corrective condition_based run_to_failure"`
	InspectionStrategy      *string                `json:"inspection_strategy,omitempty" validate:"omitempty,oneof=RBI RCM time_based condition_based risk_based"`
	Status                  *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive maintenance out_of_service decommissioned planned"`
	Criticality             *int                   `json:"criticality,omitempty" validate:"omitempty,min=1,max=5"`
	SafetyCritical          *bool                  `json:"safety_critical,omitempty"`
	EnvironmentallyCritical *bool                  `json:"environmentally_critical,omitempty"`
	Metadata                map[string]interface{} `json:"metadata,omitempty"`
}

// ===== COMPONENT REQUESTS =====

type CreateComponentRequest struct {
	AssetID               int                    `json:"asset_id" validate:"required"`
	Name                      string                 `json:"name" validate:"required,min=2,max=255"`
	ComponentCode             *string                `json:"component_code,omitempty" validate:"omitempty,max=100"`
	ComponentType             *string                `json:"component_type" validate:"required"`
	ComponentClass            *string                `json:"component_class,omitempty" validate:"omitempty,max=100"`
	Material                  *string                `json:"material,omitempty" validate:"omitempty,max=255"`
	DesignThicknessMM         *float64               `json:"design_thickness_mm,omitempty" validate:"omitempty,min=0"`
	CurrentThicknessMM        *float64               `json:"current_thickness_mm,omitempty" validate:"omitempty,min=0"`
	MinimumThicknessMM        *float64               `json:"minimum_thickness_mm,omitempty" validate:"omitempty,min=0"`
	DesignPressureBar         *float64               `json:"design_pressure_bar,omitempty" validate:"omitempty,min=0"`
	DesignTemperatureC        *float64               `json:"design_temperature_c,omitempty"`
	OperatingPressureBar      *float64               `json:"operating_pressure_bar,omitempty" validate:"omitempty,min=0"`
	OperatingTemperatureC     *float64               `json:"operating_temperature_c,omitempty"`
	InstallationDate          *time.Time             `json:"installation_date,omitempty"`
	LastReplacementDate       *time.Time             `json:"last_replacement_date,omitempty"`
	NextReplacementDate       *time.Time             `json:"next_replacement_date,omitempty"`
	Specifications            map[string]interface{} `json:"specifications,omitempty"`
	Dimensions                map[string]interface{} `json:"dimensions,omitempty"`
	LocationDescription       *string                `json:"location_description,omitempty" validate:"omitempty,max=1000"`
	Accessibility             *string                `json:"accessibility,omitempty" validate:"omitempty,oneof=full limited restricted no_access"`
	InsulationType            *string                `json:"insulation_type,omitempty" validate:"omitempty,max=100"`
	CoatingType               *string                `json:"coating_type,omitempty" validate:"omitempty,max=100"`
	CathodicProtection        *bool                  `json:"cathodic_protection,omitempty"`
	InspectionAccess          *string                `json:"inspection_access,omitempty" validate:"omitempty,oneof=full limited restricted no_access"`
	InspectionFrequencyMonths *int                   `json:"inspection_frequency_months,omitempty" validate:"omitempty,min=1,max=120"`
	LastInspectionDate        *time.Time             `json:"last_inspection_date,omitempty"`
	IntegrityStatus           *string                `json:"integrity_status,omitempty" validate:"omitempty,oneof=excellent good fair poor critical"`
	FitnessForService         *string                `json:"fitness_for_service,omitempty" validate:"omitempty,oneof=fit fit_reduced monitor repair replace"`
	ConfidenceLevel           *string                `json:"confidence_level,omitempty" validate:"omitempty,oneof=high medium low"`
	Status                    *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive maintenance replaced retired"`
	Criticality               *int                   `json:"criticality,omitempty" validate:"omitempty,min=1,max=5"`
	ConsequenceOfFailure      *string                `json:"consequence_of_failure,omitempty" validate:"omitempty,max=100"`
	SafetyCritical            *bool                  `json:"safety_critical,omitempty"`
	EnvironmentallyCritical   *bool                  `json:"environmentally_critical,omitempty"`
	Metadata                  map[string]interface{} `json:"metadata,omitempty"`
}

type UpdateComponentRequest struct {
	AssetID               *int                   `json:"asset_id,omitempty" validate:"omitempty"`
	Name                      *string                `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	ComponentCode             *string                `json:"component_code,omitempty" validate:"omitempty,max=100"`
	ComponentType             *string                `json:"component_type,omitempty" validate:"omitempty"`
	ComponentClass            *string                `json:"component_class,omitempty" validate:"omitempty,max=100"`
	Material                  *string                `json:"material,omitempty" validate:"omitempty,max=255"`
	DesignThicknessMM         *float64               `json:"design_thickness_mm,omitempty" validate:"omitempty,min=0"`
	CurrentThicknessMM        *float64               `json:"current_thickness_mm,omitempty" validate:"omitempty,min=0"`
	MinimumThicknessMM        *float64               `json:"minimum_thickness_mm,omitempty" validate:"omitempty,min=0"`
	DesignPressureBar         *float64               `json:"design_pressure_bar,omitempty" validate:"omitempty,min=0"`
	DesignTemperatureC        *float64               `json:"design_temperature_c,omitempty"`
	OperatingPressureBar      *float64               `json:"operating_pressure_bar,omitempty" validate:"omitempty,min=0"`
	OperatingTemperatureC     *float64               `json:"operating_temperature_c,omitempty"`
	InstallationDate          *time.Time             `json:"installation_date,omitempty"`
	LastReplacementDate       *time.Time             `json:"last_replacement_date,omitempty"`
	NextReplacementDate       *time.Time             `json:"next_replacement_date,omitempty"`
	Specifications            map[string]interface{} `json:"specifications,omitempty"`
	Dimensions                map[string]interface{} `json:"dimensions,omitempty"`
	LocationDescription       *string                `json:"location_description,omitempty" validate:"omitempty,max=1000"`
	Accessibility             *string                `json:"accessibility,omitempty" validate:"omitempty,oneof=full limited restricted no_access"`
	InsulationType            *string                `json:"insulation_type,omitempty" validate:"omitempty,max=100"`
	CoatingType               *string                `json:"coating_type,omitempty" validate:"omitempty,max=100"`
	CathodicProtection        *bool                  `json:"cathodic_protection,omitempty"`
	InspectionAccess          *string                `json:"inspection_access,omitempty" validate:"omitempty,oneof=full limited restricted no_access"`
	InspectionFrequencyMonths *int                   `json:"inspection_frequency_months,omitempty" validate:"omitempty,min=1,max=120"`
	LastInspectionDate        *time.Time             `json:"last_inspection_date,omitempty"`
	IntegrityStatus           *string                `json:"integrity_status,omitempty" validate:"omitempty,oneof=excellent good fair poor critical"`
	FitnessForService         *string                `json:"fitness_for_service,omitempty" validate:"omitempty,oneof=fit fit_reduced monitor repair replace"`
	ConfidenceLevel           *string                `json:"confidence_level,omitempty" validate:"omitempty,oneof=high medium low"`
	Status                    *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive maintenance replaced retired"`
	Criticality               *int                   `json:"criticality,omitempty" validate:"omitempty,min=1,max=5"`
	ConsequenceOfFailure      *string                `json:"consequence_of_failure,omitempty" validate:"omitempty,max=100"`
	SafetyCritical            *bool                  `json:"safety_critical,omitempty"`
	EnvironmentallyCritical   *bool                  `json:"environmentally_critical,omitempty"`
	Metadata                  map[string]interface{} `json:"metadata,omitempty"`
}

// ===== LIST QUERY REQUESTS =====

type SiteListQuery struct {
	Page      int    `json:"page" form:"page" validate:"min=1"`
	Limit     int    `json:"limit" form:"limit" validate:"min=1,max=100"`
	Search    string `json:"search" form:"search"`
	SiteType  string `json:"site_type" form:"site_type"`
	Status    string `json:"status" form:"status"`
	Location  string `json:"location" form:"location"`
	SortBy    string `json:"sort_by" form:"sort_by" validate:"omitempty,oneof=name created_at updated_at"`
	SortOrder string `json:"sort_order" form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

type UnitListQuery struct {
	Page                 int      `json:"page" form:"page" validate:"min=1"`
	Limit                int      `json:"limit" form:"limit" validate:"min=1,max=100"`
	Search               string   `json:"search" form:"search"`
	SiteID               *int     `json:"site_id" form:"site_id"`
	UnitType             string   `json:"unit_type" form:"unit_type"`
	Status               string   `json:"status" form:"status"`
	Criticality          *int     `json:"criticality" form:"criticality" validate:"omitempty,min=1,max=5"`
	CommissionDateFrom   *string  `json:"commission_date_from" form:"commission_date_from"`
	CommissionDateTo     *string  `json:"commission_date_to" form:"commission_date_to"`
	DecommissionDateFrom *string  `json:"decommission_date_from" form:"decommission_date_from"`
	DecommissionDateTo   *string  `json:"decommission_date_to" form:"decommission_date_to"`
	MinCapacity          *float64 `json:"min_capacity" form:"min_capacity"`
	MaxCapacity          *float64 `json:"max_capacity" form:"max_capacity"`
	SortBy               string   `json:"sort_by" form:"sort_by" validate:"omitempty,oneof=name created_at updated_at criticality commission_date"`
	SortOrder            string   `json:"sort_order" form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

type AssetListQuery struct {
	Page               int    `json:"page" form:"page" validate:"min=1"`
	Limit              int    `json:"limit" form:"limit" validate:"min=1,max=100"`
	Search             string `json:"search" form:"search"`
	SiteID             *int   `json:"site_id" form:"site_id"`
	UnitID             *int   `json:"unit_id" form:"unit_id"`
	TaxonomyCategoryID *int   `json:"taxonomy_category_id" form:"taxonomy_category_id"`
	AssetType          string `json:"asset_type" form:"asset_type"`
	Status             string `json:"status" form:"status"`
	Criticality        *int   `json:"criticality" form:"criticality" validate:"omitempty,min=1,max=5"`
	SafetyCritical *bool  `json:"safety_critical" form:"safety_critical"`
	SortBy         string `json:"sort_by" form:"sort_by" validate:"omitempty,oneof=name tag_number created_at updated_at criticality"`
	SortOrder      string `json:"sort_order" form:"sort_order" validate:"omitempty,oneof=asc desc"`
	Manufacturer   string `json:"manufacturer" form:"manufacturer"`
	SortDirection  string `json:"sort_direction" form:"sort_direction"`
	Offset         int    `json:"offset" form:"offset"`
}

type ComponentListQuery struct {
	Page                    int      `json:"page" form:"page" validate:"min=1"`
	Limit                   int      `json:"limit" form:"limit" validate:"min=1,max=100"`
	Search                  string   `json:"search" form:"search"`
	AssetID                 *int     `json:"asset_id" form:"asset_id"`
	ComponentType           string   `json:"component_type" form:"component_type"`
	Material                string   `json:"material" form:"material"`
	Status                  string   `json:"status" form:"status"`
	IntegrityStatus         string   `json:"integrity_status" form:"integrity_status"`
	Criticality             *int     `json:"criticality" form:"criticality" validate:"omitempty,min=1,max=5"`
	SafetyCritical          *bool    `json:"safety_critical" form:"safety_critical"`
	EnvironmentallyCritical *bool    `json:"environmentally_critical" form:"environmentally_critical"`
	MinThickness            *float64 `json:"min_thickness" form:"min_thickness"`
	MaxThickness            *float64 `json:"max_thickness" form:"max_thickness"`
	MinPressure             *float64 `json:"min_pressure" form:"min_pressure"`
	MaxPressure             *float64 `json:"max_pressure" form:"max_pressure"`
	LastInspectionFrom      *string  `json:"last_inspection_from" form:"last_inspection_from"`
	LastInspectionTo        *string  `json:"last_inspection_to" form:"last_inspection_to"`
	NextInspectionFrom      *string  `json:"next_inspection_from" form:"next_inspection_from"`
	NextInspectionTo        *string  `json:"next_inspection_to" form:"next_inspection_to"`
	SortBy                  string   `json:"sort_by" form:"sort_by" validate:"omitempty,oneof=name created_at updated_at criticality remaining_life_years"`
	SortOrder               string   `json:"sort_order" form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

// ===== BULK OPERATION REQUESTS =====

type BulkAssetOperationRequest struct {
	AssetIDs     []int                  `json:"asset_ids" validate:"required,min=1,max=100"`
	AssetType    string                 `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	Operation    string                 `json:"operation" validate:"required,oneof=activate deactivate delete export update_status bulk_update"`
	Value        string                 `json:"value,omitempty"`
	Reason       string                 `json:"reason" validate:"required,min=10,max=500"`
	UpdateFields map[string]interface{} `json:"update_fields,omitempty"`
}

type AssetBulkDeleteRequest struct {
	AssetIDs       []int  `json:"asset_ids" validate:"required,min=1,max=100"`
	AssetType      string `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	Reason         string `json:"reason" validate:"required,min=10,max=500"`
	ForceDelete    bool   `json:"force_delete"`
	DeleteChildren bool   `json:"delete_children"`
}

type BulkStatusUpdateRequest struct {
	AssetIDs      []int      `json:"asset_ids" validate:"required,min=1,max=100"`
	AssetType     string     `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	NewStatus     string     `json:"new_status" validate:"required"`
	Reason        string     `json:"reason" validate:"required,min=10,max=500"`
	EffectiveDate *time.Time `json:"effective_date,omitempty"`
}

// ===== IMPORT/EXPORT REQUESTS =====

type AssetImportRequest struct {
	AssetType      string                 `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	ImportType     string                 `json:"import_type" validate:"required,oneof=create update upsert replace"`
	FileFormat     string                 `json:"file_format" validate:"required,oneof=csv xlsx json"`
	FileName       string                 `json:"file_name" validate:"required"`
	BatchSize      int                    `json:"batch_size,omitempty" validate:"omitempty,min=1,max=1000"`
	ValidateOnly   bool                   `json:"validate_only"`
	SkipErrors     bool                   `json:"skip_errors"`
	UpdateExisting bool                   `json:"update_existing"`
	CreateMissing  bool                   `json:"create_missing"`
	DryRun         bool                   `json:"dry_run"`
	Mapping        map[string]interface{} `json:"mapping,omitempty"`
	DefaultValues  map[string]interface{} `json:"default_values,omitempty"`
	ImportOptions  map[string]interface{} `json:"import_options,omitempty"`
}

type AssetExportRequest struct {
	AssetType        string                 `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	ExportType       string                 `json:"export_type" validate:"required,oneof=full incremental filtered custom"`
	AssetIDs         []int                  `json:"asset_ids,omitempty"`
	AssetTypes       []string               `json:"asset_types,omitempty"`
	SiteIDs          []int                  `json:"site_ids,omitempty"`
	UnitIDs          []int                  `json:"unit_ids,omitempty"`
	ComponentTypes   []string               `json:"component_types,omitempty"`
	Status           string                 `json:"status,omitempty"`
	Statuses         []string               `json:"statuses,omitempty"`
	CreatedFrom      *time.Time             `json:"created_from,omitempty"`
	CreatedTo        *time.Time             `json:"created_to,omitempty"`
	DateFrom         *time.Time             `json:"date_from,omitempty"`
	DateTo           *time.Time             `json:"date_to,omitempty"`
	IncludeRelations bool                   `json:"include_relations"`
	IncludeChildren  bool                   `json:"include_children"`
	IncludeFields    []string               `json:"include_fields,omitempty"`
	FileFormat       string                 `json:"file_format" validate:"required,oneof=csv xlsx json pdf"`
	Format           string                 `json:"format" validate:"required,oneof=csv xlsx json pdf xml"`
	FileName         *string                `json:"file_name,omitempty"`
	Filters          map[string]interface{} `json:"filters,omitempty"`
}

// ===== HIERARCHY REQUESTS =====

type AssetHierarchyRequest struct {
	SiteID          *int   `json:"site_id,omitempty" form:"site_id"`
	UnitID          *int   `json:"unit_id,omitempty" form:"unit_id"`
	AssetID     *int   `json:"asset_id,omitempty" form:"asset_id"`
	MaxDepth        *int   `json:"max_depth,omitempty" form:"max_depth" validate:"omitempty,min=1,max=10"`
	IncludeStats    bool   `json:"include_stats" form:"include_stats"`
	IncludeMetadata bool   `json:"include_metadata" form:"include_metadata"`
	StatusFilter    string `json:"status_filter,omitempty" form:"status_filter"`
	ActiveOnly      bool   `json:"active_only" form:"active_only"`
}

type AssetHierarchyMoveRequest struct {
	AssetID       int    `json:"asset_id" validate:"required"`
	AssetType     string `json:"asset_type" validate:"required,oneof=unit Asset component"`
	NewParentID   int    `json:"new_parent_id" validate:"required"`
	NewParentType string `json:"new_parent_type" validate:"required,oneof=site unit Asset"`
	Reason        string `json:"reason" validate:"required,min=10,max=500"`
}

// ===== VALIDATION REQUESTS =====

type AssetValidationRequest struct {
	AssetType      string                 `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	AssetData      map[string]interface{} `json:"asset_data" validate:"required"`
	ValidationType string                 `json:"validation_type" validate:"required,oneof=create update"`
	StrictMode     bool                   `json:"strict_mode"`
}

// ===== SEARCH REQUESTS =====

type AssetSearchRequest struct {
	Query         string                 `json:"query" validate:"required,min=1"`
	AssetTypes    []string               `json:"asset_types,omitempty" validate:"omitempty,dive,oneof=site unit Asset component inspection_point degradation_mechanism"`
	Filters       map[string]interface{} `json:"filters,omitempty"`
	Statuses      []string               `json:"statuses,omitempty"`
	Criticalities []int                  `json:"criticalities,omitempty"`
	Offset        int                    `json:"offset" validate:"min=0"`
	Page          int                    `json:"page" validate:"min=1"`
	Limit         int                    `json:"limit" validate:"min=1,max=100"`
	SortBy        string                 `json:"sort_by,omitempty"`
	SortOrder     string                 `json:"sort_order,omitempty" validate:"omitempty,oneof=asc desc"`
	Highlight     bool                   `json:"highlight"`
	FuzzySearch   bool                   `json:"fuzzy_search"`
	SearchFields  []string               `json:"search_fields,omitempty"`
}

// ===== COPY/CLONE REQUESTS =====

type AssetCopyRequest struct {
	SourceAssetID             int                    `json:"source_asset_id" validate:"required"`
	AssetType                 string                 `json:"asset_type" validate:"required,oneof=site unit Asset component"`
	NewName                   string                 `json:"new_name" validate:"required,min=2,max=255"`
	NewCode                   *string                `json:"new_code,omitempty"`
	TargetParentID            *int                   `json:"target_parent_id,omitempty"`
	CopyChildren              bool                   `json:"copy_children"`
	CopyInspectionPoints      bool                   `json:"copy_inspection_points"`
	CopyDegradationMechanisms bool                   `json:"copy_degradation_mechanisms"`
	FieldUpdates              map[string]interface{} `json:"field_updates,omitempty"`
	Reason                    string                 `json:"reason" validate:"required,min=10,max=500"`
}

// ===== STATISTICS REQUESTS =====

type AssetStatisticsRequest struct {
	SiteID          *int       `json:"site_id,omitempty" form:"site_id"`
	UnitID          *int       `json:"unit_id,omitempty" form:"unit_id"`
	AssetID     *int       `json:"asset_id,omitempty" form:"asset_id"`
	AssetTypes      []string   `json:"asset_types,omitempty" form:"asset_types" validate:"omitempty,dive,oneof=site unit Asset component"`
	DateFrom        *time.Time `json:"date_from,omitempty" form:"date_from"`
	DateTo          *time.Time `json:"date_to,omitempty" form:"date_to"`
	GroupBy         string     `json:"group_by,omitempty" form:"group_by" validate:"omitempty,oneof=type status criticality site unit"`
	IncludeInactive bool       `json:"include_inactive" form:"include_inactive"`
}

// ===== MAINTENANCE REQUESTS =====

type AssetMaintenanceScheduleRequest struct {
	AssetID     int       `json:"asset_id" validate:"required"`
	AssetType   string    `json:"asset_type" validate:"required,oneof=Asset component"`
	DateFrom    time.Time `json:"date_from" validate:"required"`
	DateTo      time.Time `json:"date_to" validate:"required"`
	IncludePast bool      `json:"include_past"`
	TaskTypes   []string  `json:"task_types,omitempty"`
}

// ===== COMPLIANCE REQUESTS =====

type AssetComplianceRequest struct {
	AssetID        int        `json:"asset_id" validate:"required"`
	AssetType      string     `json:"asset_type" validate:"required,oneof=site unit Asset component"`
	Standards      []string   `json:"standards,omitempty"`
	DateFrom       *time.Time `json:"date_from,omitempty"`
	DateTo         *time.Time `json:"date_to,omitempty"`
	IncludeOverdue bool       `json:"include_overdue"`
}

// ===== AUDIT REQUESTS =====

type AssetAuditRequest struct {
	AssetID   int        `json:"asset_id" validate:"required"`
	AssetType string     `json:"asset_type" validate:"required,oneof=site unit Asset component inspection_point degradation_mechanism"`
	DateFrom  *time.Time `json:"date_from,omitempty"`
	DateTo    *time.Time `json:"date_to,omitempty"`
	Actions   []string   `json:"actions,omitempty" validate:"omitempty,dive,oneof=create update delete"`
	UserID    *int       `json:"user_id,omitempty"`
	Page      int        `json:"page" validate:"min=1"`
	Limit     int        `json:"limit" validate:"min=1,max=100"`
}

// NOTE: AssetDistributionRequest, CriticalAssetsRequest, SiteStatisticsRequest,
// AssetDashboardRequest, AssetPathRequest, AssetCriticalityUpdateRequest,
// AssetHierarchyValidationRequest are defined in asset_analytics_request.go to avoid duplication
