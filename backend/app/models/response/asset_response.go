// platform/backend/app/models/response/asset_response.go
package response

import (
	"time"
)

// ===== SITE RESPONSES =====

// SiteResponse represents a site in API responses
type SiteResponse struct {
	ID                   int                    `json:"id"`
	TenantID             int                    `json:"tenant_id"`
	Name                 string                 `json:"name"`
	Code                 string                 `json:"code"`
	SiteType             string                 `json:"site_type"`
	Location             string                 `json:"location"`
	Address              map[string]interface{} `json:"address,omitempty"`
	Coordinates          map[string]interface{} `json:"coordinates,omitempty"`
	CommissionDate       *time.Time             `json:"commission_date,omitempty"`
	DecommissionDate     *time.Time             `json:"decommission_date,omitempty"`
	Description          *string                `json:"description,omitempty"`
	ContactInfo          map[string]interface{} `json:"contact_info,omitempty"`
	OperatingConditions  map[string]interface{} `json:"operating_conditions,omitempty"`
	EnvironmentalFactors map[string]interface{} `json:"environmental_factors,omitempty"`
	Status               string                 `json:"status"`
	Metadata             map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt            time.Time              `json:"created_at"`
	UpdatedAt            time.Time              `json:"updated_at"`
	CreatedBy            *int                   `json:"created_by,omitempty"`
	UpdatedBy            *int                   `json:"updated_by,omitempty"`

	// Statistics (optional, populated when requested)
	UnitsCount *int `json:"units_count,omitempty"`
	AssetCount *int `json:"asset_count,omitempty"`

	// Relationships (optional, populated when requested)
	Units []UnitResponse `json:"units,omitempty"`
}

// SiteListResponse represents a paginated list of sites
type SiteListResponse struct {
	Sites []SiteResponse `json:"sites"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}

// ===== UNIT RESPONSES =====

// UnitResponse represents a unit in API responses
type UnitResponse struct {
	ID                 int                    `json:"id"`
	TenantID           int                    `json:"tenant_id"`
	SiteID             int                    `json:"site_id"`
	Name               string                 `json:"name"`
	Code               string                 `json:"code"`
	UnitType           string                 `json:"unit_type"`
	ProcessDescription *string                `json:"process_description,omitempty"`
	DesignCapacity     *string                `json:"design_capacity,omitempty"`
	OperatingCapacity  *string                `json:"operating_capacity,omitempty"`
	CommissionDate     *time.Time             `json:"commission_date,omitempty"`
	DecommissionDate   *time.Time             `json:"decommission_date,omitempty"`
	ProcessConditions  map[string]interface{} `json:"process_conditions,omitempty"`
	SafetySystems      map[string]interface{} `json:"safety_systems,omitempty"`
	ControlSystems     map[string]interface{} `json:"control_systems,omitempty"`
	Status             string                 `json:"status"`
	Criticality        int                    `json:"criticality"`
	Metadata           map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt          time.Time              `json:"created_at"`
	UpdatedAt          time.Time              `json:"updated_at"`
	CreatedBy          *int                   `json:"created_by,omitempty"`
	UpdatedBy          *int                   `json:"updated_by,omitempty"`

	// Statistics (optional, populated when requested)
	AssetCount      *int `json:"asset_count,omitempty"`
	ComponentsCount *int `json:"components_count,omitempty"`

	// Relationships (optional, populated when requested)
	Site  *SiteResponse   `json:"site,omitempty"`
	Asset []AssetResponse `json:"assets,omitempty"`
}

// UnitListResponse represents a paginated list of units
type UnitListResponse struct {
	Units []UnitResponse `json:"units"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}

// ===== Asset RESPONSES =====

// AssetResponse represents Asset in API responses
type AssetResponse struct {
	ID                      int                    `json:"id"`
	TenantID                int                    `json:"tenant_id"`
	UnitID                  *int                   `json:"unit_id,omitempty"`
	ParentID                *int                   `json:"parent_id,omitempty"`
	FunctionalLocationID    *int                   `json:"functional_location_id,omitempty"`
	Name                    string                 `json:"name"`
	Description             string                 `json:"description,omitempty"`
	TagNumber               string                 `json:"tag_number"`
	AssetType               string                 `json:"asset_type"`
	AssetClass              string                 `json:"asset_class"`
	LifecycleStatus         string                 `json:"lifecycle_status"`
	Manufacturer            string                 `json:"manufacturer"`
	Model                   string                 `json:"model"`
	SerialNumber            string                 `json:"serial_number"`
	ManufactureDate         *time.Time             `json:"manufacture_date,omitempty"`
	InstallationDate        *time.Time             `json:"installation_date,omitempty"`
	CommissioningDate       *time.Time             `json:"commissioning_date,omitempty"`
	WarrantyExpiry          *time.Time             `json:"warranty_expiry,omitempty"`
	DesignLifeYears         int                    `json:"design_life_years"`
	RemainingLifeYears      float64                `json:"remaining_life_years"`
	Specifications          map[string]interface{} `json:"specifications,omitempty"`
	OperatingParameters     map[string]interface{} `json:"operating_parameters,omitempty"`
	DesignConditions        map[string]interface{} `json:"design_conditions,omitempty"`
	Materials               map[string]interface{} `json:"materials,omitempty"`
	RBIProperties           map[string]interface{} `json:"rbi_properties,omitempty"`
	ParentFLOC              string                 `json:"parent_floc,omitempty"`
	DrawingsReferences      map[string]interface{} `json:"drawings_references,omitempty"`
	MaintenanceStrategy     string                 `json:"maintenance_strategy"`
	InspectionStrategy      string                 `json:"inspection_strategy"`
	Status                  string                 `json:"status"`
	Criticality             int                    `json:"criticality"`
	SafetyCritical          bool                   `json:"safety_critical"`
	EnvironmentallyCritical bool                   `json:"environmentally_critical"`
	Metadata                map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt               time.Time              `json:"created_at"`
	UpdatedAt               time.Time              `json:"updated_at"`
	CreatedBy               *int                   `json:"created_by,omitempty"`
	UpdatedBy               *int                   `json:"updated_by,omitempty"`

	// Calculated fields (optional)
	Age             *float64 `json:"age_years,omitempty"`
	IsWarrantyValid *bool    `json:"is_warranty_valid,omitempty"`

	// Statistics (optional, populated when requested)
	ComponentsCount *int `json:"components_count,omitempty"`

	// Relationships (optional, populated when requested)
	Unit       *UnitResponse       `json:"unit,omitempty"`
	Components []ComponentResponse `json:"components,omitempty"`
}

// AssetListResponse represents a paginated list of Asset
type AssetListResponse struct {
	Asset []AssetResponse `json:"assets"`
	Total int64           `json:"total"`
	Page  int             `json:"page"`
	Limit int             `json:"limit"`
}

// ===== COMPONENT RESPONSES =====

// ComponentResponse represents a component in API responses
type ComponentResponse struct {
	ID                        int                    `json:"id"`
	TenantID                  int                    `json:"tenant_id"`
	AssetID                   int                    `json:"asset_id"`
	Name                      string                 `json:"name"`
	ComponentCode             string                 `json:"component_code"`
	ComponentType             string                 `json:"component_type"`
	ComponentClass            string                 `json:"component_class"`
	Material                  string                 `json:"material"`
	DesignThicknessMM         *float64               `json:"design_thickness_mm,omitempty"`
	CurrentThicknessMM        *float64               `json:"current_thickness_mm,omitempty"`
	MinimumThicknessMM        *float64               `json:"minimum_thickness_mm,omitempty"`
	DesignPressureBar         *float64               `json:"design_pressure_bar,omitempty"`
	DesignTemperatureC        *float64               `json:"design_temperature_c,omitempty"`
	OperatingPressureBar      *float64               `json:"operating_pressure_bar,omitempty"`
	OperatingTemperatureC     *float64               `json:"operating_temperature_c,omitempty"`
	InstallationDate          *time.Time             `json:"installation_date,omitempty"`
	LastReplacementDate       *time.Time             `json:"last_replacement_date,omitempty"`
	NextReplacementDate       *time.Time             `json:"next_replacement_date,omitempty"`
	Specifications            map[string]interface{} `json:"specifications,omitempty"`
	Dimensions                map[string]interface{} `json:"dimensions,omitempty"`
	LocationDescription       *string                `json:"location_description,omitempty"`
	Accessibility             string                 `json:"accessibility"`
	InsulationType            string                 `json:"insulation_type"`
	CoatingType               string                 `json:"coating_type"`
	CathodicProtection        bool                   `json:"cathodic_protection"`
	InspectionAccess          string                 `json:"inspection_access"`
	InspectionFrequencyMonths int                    `json:"inspection_frequency_months"`
	LastInspectionDate        *time.Time             `json:"last_inspection_date,omitempty"`
	NextInspectionDate        *time.Time             `json:"next_inspection_date,omitempty"`
	IntegrityStatus           string                 `json:"integrity_status"`
	FitnessForService         string                 `json:"fitness_for_service"`
	RemainingLifeYears        float64                `json:"remaining_life_years"`
	ConfidenceLevel           string                 `json:"confidence_level"`
	Status                    string                 `json:"status"`
	Criticality               int                    `json:"criticality"`
	ConsequenceOfFailure      string                 `json:"consequence_of_failure"`
	SafetyCritical            bool                   `json:"safety_critical"`
	EnvironmentallyCritical   bool                   `json:"environmentally_critical"`
	Metadata                  map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt                 time.Time              `json:"created_at"`
	UpdatedAt                 time.Time              `json:"updated_at"`
	CreatedBy                 *int                   `json:"created_by,omitempty"`
	UpdatedBy                 *int                   `json:"updated_by,omitempty"`

	// Calculated fields (optional)
	RemainingThickness   *float64 `json:"remaining_thickness_mm,omitempty"`
	ThicknessUtilization *float64 `json:"thickness_utilization_percent,omitempty"`
	RequiresInspection   *bool    `json:"requires_inspection,omitempty"`
	IsOverdue            *bool    `json:"is_overdue,omitempty"`

	// Statistics (optional, populated when requested)
	InspectionPointsCount      *int `json:"inspection_points_count,omitempty"`
	DegradationMechanismsCount *int `json:"degradation_mechanisms_count,omitempty"`

	// Relationships (optional, populated when requested)
	Asset                 *AssetResponse                 `json:"asset,omitempty"`
	InspectionPoints      []InspectionPointResponse      `json:"inspection_points,omitempty"`
	DegradationMechanisms []DegradationMechanismResponse `json:"degradation_mechanisms,omitempty"`
}

// ComponentListResponse represents a paginated list of components
type ComponentListResponse struct {
	Components []ComponentResponse `json:"components"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
}

// ===== INSPECTION POINT RESPONSES =====

// InspectionPointResponse represents an inspection point in API responses
type InspectionPointResponse struct {
	ID                        int                    `json:"id"`
	TenantID                  int                    `json:"tenant_id"`
	ComponentID               int                    `json:"component_id"`
	PointIdentifier           string                 `json:"point_identifier"`
	LocationDescription       *string                `json:"location_description,omitempty"`
	InspectionMethod          string                 `json:"inspection_method"`
	Accessibility             string                 `json:"accessibility"`
	Orientation               string                 `json:"orientation"`
	Coordinates               map[string]interface{} `json:"coordinates,omitempty"`
	GridReference             string                 `json:"grid_reference"`
	SurfaceCondition          string                 `json:"surface_condition"`
	InspectionFrequencyMonths int                    `json:"inspection_frequency_months"`
	LastInspectionDate        *time.Time             `json:"last_inspection_date,omitempty"`
	NextInspectionDate        *time.Time             `json:"next_inspection_date,omitempty"`
	BaselineThicknessMM       *float64               `json:"baseline_thickness_mm,omitempty"`
	MinimumThicknessMM        *float64               `json:"minimum_thickness_mm,omitempty"`
	CurrentThicknessMM        *float64               `json:"current_thickness_mm,omitempty"`
	CorrosionRateMMPY         *float64               `json:"corrosion_rate_mmpy,omitempty"`
	RemainingLifeYears        float64                `json:"remaining_life_years"`
	Status                    string                 `json:"status"`
	Notes                     *string                `json:"notes,omitempty"`
	Metadata                  map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt                 time.Time              `json:"created_at"`
	UpdatedAt                 time.Time              `json:"updated_at"`
	CreatedBy                 *int                   `json:"created_by,omitempty"`
	UpdatedBy                 *int                   `json:"updated_by,omitempty"`

	// Calculated fields (optional)
	RequiresInspection *bool `json:"requires_inspection,omitempty"`

	// Relationships (optional, populated when requested)
	Component *ComponentResponse `json:"component,omitempty"`
}

// InspectionPointListResponse represents a paginated list of inspection points
type InspectionPointListResponse struct {
	InspectionPoints []InspectionPointResponse `json:"inspection_points"`
	Total            int64                     `json:"total"`
	Page             int                       `json:"page"`
	Limit            int                       `json:"limit"`
}

// ===== DEGRADATION MECHANISM RESPONSES =====

// DegradationMechanismResponse represents a degradation mechanism in API responses
type DegradationMechanismResponse struct {
	ID                     int                    `json:"id"`
	TenantID               int                    `json:"tenant_id"`
	ComponentID            int                    `json:"component_id"`
	MechanismType          string                 `json:"mechanism_type"`
	MechanismName          string                 `json:"mechanism_name"`
	Description            *string                `json:"description,omitempty"`
	Susceptibility         float64                `json:"susceptibility"`
	DetectionMethod        string                 `json:"detection_method"`
	Rate                   float64                `json:"rate"`
	RateUnits              string                 `json:"rate_units"`
	IdentificationDate     *time.Time             `json:"identification_date,omitempty"`
	Parameters             map[string]interface{} `json:"parameters,omitempty"`
	EnvironmentalFactors   map[string]interface{} `json:"environmental_factors,omitempty"`
	MitigationMeasures     *string                `json:"mitigation_measures,omitempty"`
	MonitoringRequirements string                 `json:"monitoring_requirements"`
	Status                 string                 `json:"status"`
	CreatedAt              time.Time              `json:"created_at"`
	UpdatedAt              time.Time              `json:"updated_at"`
	CreatedBy              *int                   `json:"created_by,omitempty"`
	UpdatedBy              *int                   `json:"updated_by,omitempty"`

	// Calculated fields (optional)
	IsHighSusceptibility *bool `json:"is_high_susceptibility,omitempty"`
	IsSignificantRate    *bool `json:"is_significant_rate,omitempty"`

	// Relationships (optional, populated when requested)
	Component *ComponentResponse `json:"component,omitempty"`
}

// DegradationMechanismListResponse represents a paginated list of degradation mechanisms
type DegradationMechanismListResponse struct {
	DegradationMechanisms []DegradationMechanismResponse `json:"degradation_mechanisms"`
	Total                 int64                          `json:"total"`
	Page                  int                            `json:"page"`
	Limit                 int                            `json:"limit"`
}

// ===== HIERARCHY RESPONSES =====

// AssetHierarchyResponse represents the complete asset hierarchy
type AssetHierarchyResponse struct {
	Site       SiteResponse        `json:"site"`
	Units      []UnitResponse      `json:"units"`
	Asset      []AssetResponse     `json:"assets"`
	Components []ComponentResponse `json:"components"`
}

// AssetHierarchyNodeResponse represents a single node in the asset hierarchy tree
type AssetHierarchyNodeResponse struct {
	ID       int                          `json:"id"`
	Name     string                       `json:"name"`
	Code     string                       `json:"code"`
	Type     string                       `json:"type"` // site, unit, Asset, component
	Status   string                       `json:"status"`
	Level    int                          `json:"level"`
	ParentID *int                         `json:"parent_id,omitempty"`
	Children []AssetHierarchyNodeResponse `json:"children,omitempty"`

	// Summary information
	TotalChildren    int `json:"total_children"`
	ActiveChildren   int `json:"active_children"`
	InactiveChildren int `json:"inactive_children"`
	CriticalChildren int `json:"critical_children"`
}

// ===== SUMMARY AND STATISTICS RESPONSES =====

// AssetSummaryResponse represents asset summary statistics
type AssetSummaryResponse struct {
	TotalSites      int `json:"total_sites"`
	TotalUnits      int `json:"total_units"`
	TotalAsset      int `json:"total_assets"`
	TotalComponents int `json:"total_components"`

	ActiveSites      int `json:"active_sites"`
	ActiveUnits      int `json:"active_units"`
	ActiveAsset      int `json:"active_assets"`
	ActiveComponents int `json:"active_components"`

	CriticalAsset      int `json:"critical_assets"`
	CriticalComponents int `json:"critical_components"`

	SafetyCriticalAsset      int `json:"safety_critical_assets"`
	SafetyCriticalComponents int `json:"safety_critical_components"`

	EnvironmentallyCriticalAsset      int `json:"environmentally_critical_assets"`
	EnvironmentallyCriticalComponents int `json:"environmentally_critical_components"`
}

// AssetStatisticsResponse represents detailed asset statistics
type AssetStatisticsResponse struct {
	TenantID int `json:"tenant_id"`

	// Asset counts by type
	SiteStatistics      AssetTypeStatistics `json:"site_statistics"`
	UnitStatistics      AssetTypeStatistics `json:"unit_statistics"`
	AssetStatistics     AssetTypeStatistics `json:"asset_statistics"`
	ComponentStatistics AssetTypeStatistics `json:"component_statistics"`

	// Health indicators
	OverallHealth   HealthIndicators     `json:"overall_health"`
	IntegrityStatus IntegrityStatusStats `json:"integrity_status"`

	// Inspection statistics
	InspectionStats InspectionStatistics `json:"inspection_stats"`

	// Risk indicators
	RiskIndicators AssetRiskIndicators `json:"risk_indicators"`

	CalculatedAt time.Time `json:"calculated_at"`
}

// AssetTypeStatistics represents statistics for a specific asset type
type AssetTypeStatistics struct {
	Total         int            `json:"total"`
	Active        int            `json:"active"`
	Inactive      int            `json:"inactive"`
	Critical      int            `json:"critical"`
	ByStatus      map[string]int `json:"by_status"`
	ByCriticality map[string]int `json:"by_criticality"`
}

// HealthIndicators represents overall asset health indicators
type HealthIndicators struct {
	OverallScore      float64 `json:"overall_score"`
	AssetHealth       float64 `json:"asset_health"`
	ComponentHealth   float64 `json:"component_health"`
	MaintenanceHealth float64 `json:"maintenance_health"`
	InspectionHealth  float64 `json:"inspection_health"`
}

// IntegrityStatusStats represents integrity status distribution
type IntegrityStatusStats struct {
	Excellent int `json:"excellent"`
	Good      int `json:"good"`
	Fair      int `json:"fair"`
	Poor      int `json:"poor"`
	Critical  int `json:"critical"`
}

// InspectionStatistics represents inspection-related statistics
type InspectionStatistics struct {
	TotalInspectionPoints int     `json:"total_inspection_points"`
	DueForInspection      int     `json:"due_for_inspection"`
	OverdueInspections    int     `json:"overdue_inspections"`
	RecentlyInspected     int     `json:"recently_inspected"`
	AverageFrequency      float64 `json:"average_frequency_months"`
}

// AssetRiskIndicators represents risk-related indicators
type AssetRiskIndicators struct {
	HighRiskAssets   int `json:"high_risk_assets"`
	MediumRiskAssets int `json:"medium_risk_assets"`
	LowRiskAssets    int `json:"low_risk_assets"`
	SafetyCritical   int `json:"safety_critical"`
	Environmental    int `json:"environmental"`
	FinancialImpact  int `json:"financial_impact"`
}

// ===== BULK OPERATION RESPONSES =====

// BulkOperationResponse represents the result of a bulk operation
type BulkOperationResponse struct {
	Operation  string `json:"operation"`
	TotalItems int    `json:"total_items"`
	Successful int    `json:"successful"`
	Failed     int    `json:"failed"`
	Skipped    int    `json:"skipped"`

	SuccessfulIDs []int                `json:"successful_ids,omitempty"`
	Errors        []BulkOperationError `json:"errors,omitempty"`
	Warnings      []BulkOperationError `json:"warnings,omitempty"`
}

// BulkOperationError represents an error during bulk operations
type BulkOperationError struct {
	AssetID int    `json:"asset_id"`
	Error   string `json:"error"`
	Field   string `json:"field,omitempty"`
}

// ===== IMPORT/EXPORT RESPONSES =====

// ImportResultResponse represents the result of an import operation
type ImportResultResponse struct {
	JobID        string        `json:"job_id"`
	Status       string        `json:"status"`
	TotalRecords int           `json:"total_records"`
	Imported     int           `json:"imported"`
	Updated      int           `json:"updated"`
	Failed       int           `json:"failed"`
	Warnings     []string      `json:"warnings,omitempty"`
	Errors       []ImportError `json:"errors,omitempty"`
	StartedAt    time.Time     `json:"started_at"`
	CompletedAt  *time.Time    `json:"completed_at,omitempty"`
}

// ImportError represents an error during import
type ImportError struct {
	Row   int    `json:"row"`
	Field string `json:"field,omitempty"`
	Value string `json:"value,omitempty"`
	Error string `json:"error"`
}

// ExportResultResponse represents the result of an export operation
type ExportResultResponse struct {
	JobID       string     `json:"job_id"`
	Status      string     `json:"status"`
	FileURL     string     `json:"file_url,omitempty"`
	FileName    string     `json:"file_name"`
	FileSize    int64      `json:"file_size,omitempty"`
	RecordCount int        `json:"record_count"`
	StartedAt   time.Time  `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}

// ===== SEARCH RESPONSES ( MISSING TYPES ADDED) =====

// AssetSearchResponse represents unified search results for all asset types
type AssetSearchResponse struct {
	Query        string                 `json:"query"`
	TotalResults int64                  `json:"total_results"`
	Page         int                    `json:"page"`
	Limit        int                    `json:"limit"`
	Results      []AssetSearchResult    `json:"results"`
	Facets       map[string]interface{} `json:"facets,omitempty"`
	SearchTime   int64                  `json:"search_time_ms"`
}

// AssetSearchResult represents a single search result item
type AssetSearchResult struct {
	ID          int                    `json:"id"`
	Type        string                 `json:"type"` // site, unit, Asset, component
	Name        string                 `json:"name"`
	Code        string                 `json:"code"`
	Status      string                 `json:"status"`
	Criticality *int                   `json:"criticality,omitempty"`
	Location    *string                `json:"location,omitempty"`
	Path        []AssetPathItem        `json:"path,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	Score       float64                `json:"score,omitempty"`
	Highlights  []string               `json:"highlights,omitempty"`
}

// AssetPathItem represents a single item in the asset path
type AssetPathItem struct {
	ID   int    `json:"id"`
	Type string `json:"type"`
	Name string `json:"name"`
	Code string `json:"code"`
}
