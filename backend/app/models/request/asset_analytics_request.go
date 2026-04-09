// platform/backend/app/models/request/asset_analytics_request.go
package request

import (
	"time"
)

// AssetDistributionRequest represents a request for asset distribution analytics
type AssetDistributionRequest struct {
	SiteID           *int       `json:"site_id,omitempty" form:"site_id"`
	UnitID           *int       `json:"unit_id,omitempty" form:"unit_id"`
	AssetID          *int       `json:"asset_id,omitempty" form:"asset_id"`
	AssetTypes       []string   `json:"asset_types,omitempty" form:"asset_types" validate:"omitempty,dive,oneof=site unit Asset component"`
	DateFrom         *time.Time `json:"date_from,omitempty" form:"date_from"`
	DateTo           *time.Time `json:"date_to,omitempty" form:"date_to"`
	GroupBy          string     `json:"group_by,omitempty" form:"group_by" validate:"omitempty,oneof=type status criticality site unit location"`
	DistributionType string     `json:"distribution_type,omitempty" form:"distribution_type" validate:"omitempty,oneof=count percentage hierarchy geographic"`
	IncludeInactive  bool       `json:"include_inactive" form:"include_inactive"`
	DetailLevel      string     `json:"detail_level,omitempty" form:"detail_level" validate:"omitempty,oneof=summary detailed full"`
}

// CriticalAssetsRequest represents a request for critical assets analytics
type CriticalAssetsRequest struct {
	SiteID               *int     `json:"site_id,omitempty" form:"site_id"`
	UnitID               *int     `json:"unit_id,omitempty" form:"unit_id"`
	AssetID              *int     `json:"asset_id,omitempty" form:"asset_id"`
	AssetTypes           []string `json:"asset_types,omitempty" form:"asset_types" validate:"omitempty,dive,oneof=site unit Asset component"`
	MinCriticality       *int     `json:"min_criticality,omitempty" form:"min_criticality" validate:"omitempty,min=1,max=5"`
	CriticalityThreshold int      `json:"criticality_threshold,omitempty" form:"criticality_threshold" validate:"omitempty,min=1,max=5"`
	SafetyCriticalOnly   bool     `json:"safety_critical_only" form:"safety_critical_only"`
	EnvironmentalOnly    bool     `json:"environmental_only" form:"environmental_only"`
	IncludeMetrics       bool     `json:"include_metrics" form:"include_metrics"`
	IncludeInspections   bool     `json:"include_inspections" form:"include_inspections"`
	IncludeRiskFactors   bool     `json:"include_risk_factors" form:"include_risk_factors"`
	SortBy               string   `json:"sort_by,omitempty" form:"sort_by" validate:"omitempty,oneof=criticality name risk_score last_inspection"`
	SortOrder            string   `json:"sort_order,omitempty" form:"sort_order" validate:"omitempty,oneof=asc desc"`
	Limit                int      `json:"limit,omitempty" form:"limit" validate:"omitempty,min=1,max=1000"`
}

// SiteStatisticsRequest represents a request for site-specific statistics
type SiteStatisticsRequest struct {
	SiteID           int        `json:"site_id" validate:"required"`
	DateFrom         *time.Time `json:"date_from,omitempty" form:"date_from"`
	DateTo           *time.Time `json:"date_to,omitempty" form:"date_to"`
	IncludeUnits     bool       `json:"include_units" form:"include_units"`
	IncludeAsset bool       `json:"include_Asset" form:"include_Asset"`
	IncludeInactive  bool       `json:"include_inactive" form:"include_inactive"`
	GroupBy          string     `json:"group_by,omitempty" form:"group_by" validate:"omitempty,oneof=unit Asset criticality status"`
	MetricTypes      []string   `json:"metric_types,omitempty" form:"metric_types" validate:"omitempty,dive,oneof=count health criticality performance"`
}

// AssetDashboardRequest represents a request for dashboard analytics data
type AssetDashboardRequest struct {
	SiteID          *int       `json:"site_id,omitempty" form:"site_id"`
	UnitID          *int       `json:"unit_id,omitempty" form:"unit_id"`
	AssetID         *int       `json:"asset_id,omitempty" form:"asset_id"`
	DashboardType   string     `json:"dashboard_type,omitempty" form:"dashboard_type" validate:"omitempty,oneof=overview performance maintenance inspection risk compliance"`
	DateFrom        *time.Time `json:"date_from,omitempty" form:"date_from"`
	DateTo          *time.Time `json:"date_to,omitempty" form:"date_to"`
	RefreshInterval *int       `json:"refresh_interval,omitempty" form:"refresh_interval" validate:"omitempty,min=5,max=300"`
	IncludeRealTime bool       `json:"include_real_time" form:"include_real_time"`
	WidgetFilters   []string   `json:"widget_filters,omitempty" form:"widget_filters"`
}

// AssetPathRequest represents a request for asset hierarchy path
type AssetPathRequest struct {
	AssetID      int    `json:"asset_id" validate:"required"`
	AssetType    string `json:"asset_type" validate:"required,oneof=site unit Asset component"`
	PathFormat   string `json:"path_format,omitempty" validate:"omitempty,oneof=full short breadcrumb json"`
	IncludeIDs   bool   `json:"include_ids" form:"include_ids"`
	IncludeCodes bool   `json:"include_codes" form:"include_codes"`
	Separator    string `json:"separator,omitempty" validate:"omitempty,max=10"`
}

// AssetHierarchyValidationRequest represents a request for hierarchy validation
type AssetHierarchyValidationRequest struct {
	AssetID         *int     `json:"asset_id,omitempty"`
	AssetType       *string  `json:"asset_type,omitempty" validate:"omitempty,oneof=site unit Asset component"`
	SiteID          *int     `json:"site_id,omitempty"`
	UnitID          *int     `json:"unit_id,omitempty"`
	ValidationType  string   `json:"validation_type" validate:"required,oneof=structure integrity relationships constraints all"`
	CheckDepth      *int     `json:"check_depth,omitempty" validate:"omitempty,min=1,max=10"`
	FixErrors       bool     `json:"fix_errors" form:"fix_errors"`
	ReportFormat    string   `json:"report_format,omitempty" validate:"omitempty,oneof=summary detailed json csv"`
	IncludeWarnings bool     `json:"include_warnings" form:"include_warnings"`
	RuleSet         []string `json:"rule_set,omitempty" form:"rule_set"`
}

// AssetCriticalityUpdate represents a single criticality update item
type AssetCriticalityUpdate struct {
	AssetID     int    `json:"asset_id" validate:"required"`
	AssetType   string `json:"asset_type" validate:"required,oneof=site unit Asset component"`
	Criticality int    `json:"criticality" validate:"required,min=1,max=5"`
}

// AssetCriticalityUpdateRequest represents a request for updating asset criticality
type AssetCriticalityUpdateRequest struct {
	AssetID        int                    `json:"asset_id" validate:"required"`
	AssetType      string                 `json:"asset_type" validate:"required,oneof=site unit Asset component"`
	NewCriticality int                    `json:"new_criticality" validate:"required,min=1,max=5"`
	Reason         string                 `json:"reason" validate:"required,min=10,max=500"`
	EffectiveDate  *time.Time             `json:"effective_date,omitempty"`
	UpdateChildren bool                   `json:"update_children" form:"update_children"`
	UpdateStrategy string                 `json:"update_strategy,omitempty" validate:"omitempty,oneof=cascade override inherit"`
	Justification  string                 `json:"justification,omitempty" validate:"omitempty,max=1000"`
	ReviewRequired bool                   `json:"review_required" form:"review_required"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`

	// Added Updates field for asset service compatibility
	Updates []AssetCriticalityUpdate `json:"updates" validate:"required,min=1,dive"`
}

//  ADDED: AssetHealthRequest - Missing request type for asset_handler.go line 852
type AssetHealthRequest struct {
	SiteID               *int       `json:"site_id,omitempty" form:"site_id"`
	UnitID               *int       `json:"unit_id,omitempty" form:"unit_id"`
	AssetID              *int       `json:"asset_id,omitempty" form:"asset_id"`
	AssetType            string     `json:"asset_type,omitempty" form:"asset_type" validate:"omitempty,oneof=site unit Asset component all"`
	AssetTypes           []string   `json:"asset_types,omitempty" form:"asset_types" validate:"omitempty,dive,oneof=site unit Asset component"`
	DateFrom             *time.Time `json:"date_from,omitempty" form:"date_from"`
	DateTo               *time.Time `json:"date_to,omitempty" form:"date_to"`
	HealthMetrics        []string   `json:"health_metrics,omitempty" form:"health_metrics" validate:"omitempty,dive,oneof=overall Asset component integrity maintenance inspection"`
	Criticality          []int      `json:"criticality,omitempty" form:"criticality" validate:"omitempty,dive,min=1,max=5"`
	IncludeInactive      bool       `json:"include_inactive" form:"include_inactive"`
	IncludeSubComponents bool       `json:"include_sub_components" form:"include_sub_components"`
	GroupBy              string     `json:"group_by,omitempty" form:"group_by" validate:"omitempty,oneof=type status criticality site unit Asset"`
}

//  ADDED: InspectionDueRequest - Missing request type for asset_handler.go line 975
type InspectionDueRequest struct {
	SiteID             *int       `json:"site_id,omitempty" form:"site_id"`
	UnitID             *int       `json:"unit_id,omitempty" form:"unit_id"`
	AssetID            *int       `json:"asset_id,omitempty" form:"asset_id"`
	ComponentTypes     []string   `json:"component_types,omitempty" form:"component_types" validate:"omitempty,dive,oneof=shell head nozzle tube_bundle internals piping support insulation foundation"`
	DaysAhead          int        `json:"days_ahead,omitempty" form:"days_ahead" validate:"omitempty,min=0,max=365"`
	DueDateFrom        *time.Time `json:"due_date_from,omitempty" form:"due_date_from"`
	DueDateTo          *time.Time `json:"due_date_to,omitempty" form:"due_date_to"`
	InspectionTypes    []string   `json:"inspection_types,omitempty" form:"inspection_types"`
	Criticality        []int      `json:"criticality,omitempty" form:"criticality" validate:"omitempty,dive,min=1,max=5"`
	SafetyCriticalOnly bool       `json:"safety_critical_only" form:"safety_critical_only"`
	OverdueOnly        bool       `json:"overdue_only" form:"overdue_only"`
	IncludeCompleted   bool       `json:"include_completed" form:"include_completed"`
	SortBy             string     `json:"sort_by,omitempty" form:"sort_by" validate:"omitempty,oneof=due_date criticality name Asset_name"`
	SortOrder          string     `json:"sort_order,omitempty" form:"sort_order" validate:"omitempty,oneof=asc desc"`
	Limit              int        `json:"limit,omitempty" form:"limit" validate:"omitempty,min=1,max=1000"`
}
