// platform/backend/app/models/statistics.go

package models

import "time"

// Missing types causing compilation errors
// DepartmentUserCount represents user count by department
type DepartmentUserCount struct {
	DepartmentID   int    `json:"department_id" db:"department_id"`
	DepartmentName string `json:"department_name" db:"department_name"`
	UserCount      int    `json:"user_count" db:"user_count"`
}

// RoleUserCount represents user count by role
type RoleUserCount struct {
	RoleID    int    `json:"role_id" db:"role_id"`
	RoleName  string `json:"role_name" db:"role_name"`
	UserCount int    `json:"user_count" db:"user_count"`
}

// MonthlyUserGrowth represents monthly user growth statistics
type MonthlyUserGrowth struct {
	Month     string    `json:"month" db:"month"`
	Year      int       `json:"year" db:"year"`
	UserCount int       `json:"user_count" db:"user_count"`
	Growth    int       `json:"growth" db:"growth"`
	Date      time.Time `json:"date" db:"date"`
}

// Existing code - preserving existing functionality
// SiteStatistics holds statistics for sites
type SiteStatistics struct {
	TotalSites          int64            `json:"total_sites"`
	ActiveSites         int64            `json:"active_sites"`
	InactiveSites       int64            `json:"inactive_sites"`
	StatusDistribution  map[string]int64 `json:"status_distribution"`
	TypeDistribution    map[string]int64 `json:"type_distribution"`
	CriticalSites       int64            `json:"critical_sites"`
	SitesWithUnits      int64            `json:"sites_with_units"`
	AverageUnitsPerSite float64          `json:"average_units_per_site"`
	CreatedThisMonth    int64            `json:"created_this_month"`
	UpdatedThisWeek     int64            `json:"updated_this_week"`

	// Additional fields for compatibility with repository code
	Total    int64            `json:"total"`
	Active   int64            `json:"active"`
	Inactive int64            `json:"inactive"`
	ByStatus map[string]int64 `json:"by_status"`
	ByType   map[string]int64 `json:"by_type"`
}

// UnitStatistics holds statistics for units
type UnitStatistics struct {
	TotalUnits              int64            `json:"total_units"`
	ActiveUnits             int64            `json:"active_units"`
	InactiveUnits           int64            `json:"inactive_units"`
	StatusDistribution      map[string]int64 `json:"status_distribution"`
	TypeDistribution        map[string]int64 `json:"type_distribution"`
	CriticalityDistribution map[int]int64    `json:"criticality_distribution"`
	CriticalUnits           int64            `json:"critical_units"`
	UnitsWithAsset      int64            `json:"units_with_Asset"`
	AverageAssetPerUnit float64          `json:"average_Asset_per_unit"`
	CreatedThisMonth        int64            `json:"created_this_month"`
	UpdatedThisWeek         int64            `json:"updated_this_week"`
}

// AssetStatistics holds statistics for Asset
type AssetStatistics struct {
	TotalAsset                int64            `json:"total_Asset"`
	ActiveAsset               int64            `json:"active_Asset"`
	InactiveAsset             int64            `json:"inactive_Asset"`
	StatusDistribution            map[string]int64 `json:"status_distribution"`
	TypeDistribution              map[string]int64 `json:"type_distribution"`
	CriticalityDistribution       map[int]int64    `json:"criticality_distribution"`
	CriticalAsset             int64            `json:"critical_Asset"`
	SafetyCriticalAsset       int64            `json:"safety_critical_Asset"`
	AssetWithComponents       int64            `json:"asset_with_components"`
	AverageComponentsPerAsset float64          `json:"average_components_per_Asset"`
	CreatedThisMonth              int64            `json:"created_this_month"`
	UpdatedThisWeek               int64            `json:"updated_this_week"`
}

// ComponentStatistics holds statistics for components
type ComponentStatistics struct {
	TotalComponents               int64            `json:"total_components"`
	ActiveComponents              int64            `json:"active_components"`
	InactiveComponents            int64            `json:"inactive_components"`
	StatusDistribution            map[string]int64 `json:"status_distribution"`
	TypeDistribution              map[string]int64 `json:"type_distribution"`
	MaterialDistribution          map[string]int64 `json:"material_distribution"`
	IntegrityDistribution         map[string]int64 `json:"integrity_distribution"`
	CriticalityDistribution       map[int]int64    `json:"criticality_distribution"`
	CriticalComponents            int64            `json:"critical_components"`
	SafetyCriticalComponents      int64            `json:"safety_critical_components"`
	ComponentsRequiringInspection int64            `json:"components_requiring_inspection"`
	OverdueComponents             int64            `json:"overdue_components"`
	CreatedThisMonth              int64            `json:"created_this_month"`
	UpdatedThisWeek               int64            `json:"updated_this_week"`
}

// OverallAssetStatistics holds overall asset statistics
type OverallAssetStatistics struct {
	Sites      *SiteStatistics      `json:"sites"`
	Units      *UnitStatistics      `json:"units"`
	Asset      *AssetStatistics     `json:"Asset"`
	Components *ComponentStatistics `json:"components"`
	Summary    *AssetSummary        `json:"summary"`
}

// AssetSummary holds summary statistics
type AssetSummary struct {
	TotalAssets               int64   `json:"total_assets"`
	CriticalAssets            int64   `json:"critical_assets"`
	AssetsRequiringInspection int64   `json:"assets_requiring_inspection"`
	OverdueInspections        int64   `json:"overdue_inspections"`
	HealthScore               float64 `json:"health_score"`
	ComplianceScore           float64 `json:"compliance_score"`
}

// AssetHierarchy represents asset hierarchy structure
type AssetHierarchy struct {
	Sites []SiteWithHierarchy `json:"sites"`
}

// SiteWithHierarchy represents a site with its hierarchy
type SiteWithHierarchy struct {
	*Site  `json:",inline"`
	Units  []UnitWithHierarchy `json:"units,omitempty"`
	Counts *HierarchyCounts    `json:"counts,omitempty"`
}

// UnitWithHierarchy represents a unit with its hierarchy
type UnitWithHierarchy struct {
	*Unit     `json:",inline"`
	Asset []AssetWithHierarchy `json:"Asset,omitempty"`
	Counts    *HierarchyCounts         `json:"counts,omitempty"`
}

// AssetWithHierarchy represents Asset with its hierarchy
type AssetWithHierarchy struct {
	*Asset `json:",inline"`
	Components []Component      `json:"components,omitempty"`
	Counts     *HierarchyCounts `json:"counts,omitempty"`
}

// ComponentHierarchy represents component with its full hierarchy
type ComponentHierarchy struct {
	Component *Component `json:"component"`
	Asset *Asset `json:"Asset"`
	Unit      *Unit      `json:"unit"`
	Site      *Site      `json:"site"`
}

// UnitHierarchy represents unit with its hierarchy
type UnitHierarchy struct {
	Unit      *Unit       `json:"unit"`
	Site      *Site       `json:"site"`
	Asset []Asset `json:"Asset,omitempty"`
}

// HierarchyCounts holds counts for hierarchy items
type HierarchyCounts struct {
	Total               int64 `json:"total"`
	Active              int64 `json:"active"`
	Inactive            int64 `json:"inactive"`
	Critical            int64 `json:"critical"`
	RequiringInspection int64 `json:"requiring_inspection"`
}

// AssetDistribution represents distribution of assets
type AssetDistribution struct {
	Dimension string                 `json:"dimension"`
	AssetType string                 `json:"asset_type,omitempty"`
	Data      map[string]interface{} `json:"data"`
	Total     int64                  `json:"total"`
}

// AssetHealth represents asset health information
type AssetHealth struct {
	OverallScore       float64            `json:"overall_score"`
	HealthDistribution map[string]int64   `json:"health_distribution"`
	TrendData          []AssetHealthTrend `json:"trend_data,omitempty"`
	CriticalIssues     []AssetHealthIssue `json:"critical_issues"`
	Recommendations    []string           `json:"recommendations"`
}

// AssetHealthTrend represents health trend over time
type AssetHealthTrend struct {
	Date  time.Time `json:"date"`
	Score float64   `json:"score"`
}

// AssetHealthIssue represents a health issue
type AssetHealthIssue struct {
	AssetType   string `json:"asset_type"`
	AssetID     int    `json:"asset_id"`
	AssetName   string `json:"asset_name"`
	IssueType   string `json:"issue_type"`
	Severity    string `json:"severity"`
	Description string `json:"description"`
}

// CriticalAssets represents critical assets response
type CriticalAssets struct {
	Sites      []Site                 `json:"sites,omitempty"`
	Units      []Unit                 `json:"units,omitempty"`
	Asset  []Asset            `json:"Asset,omitempty"`
	Components []Component            `json:"components,omitempty"`
	Summary    *CriticalAssetsSummary `json:"summary"`
}

// CriticalAssetsSummary holds summary of critical assets
type CriticalAssetsSummary struct {
	TotalCritical         int64 `json:"total_critical"`
	SafetyCritical        int64 `json:"safety_critical"`
	EnvironmentalCritical int64 `json:"environmental_critical"`
	BusinessCritical      int64 `json:"business_critical"`
}

// InspectionDueAssets represents assets requiring inspection
type InspectionDueAssets struct {
	Asset  []Asset           `json:"Asset,omitempty"`
	Components []Component           `json:"components,omitempty"`
	Summary    *InspectionDueSummary `json:"summary"`
}

// InspectionDueSummary holds summary of inspection due assets
type InspectionDueSummary struct {
	TotalDue     int64 `json:"total_due"`
	Overdue      int64 `json:"overdue"`
	DueThisWeek  int64 `json:"due_this_week"`
	DueThisMonth int64 `json:"due_this_month"`
	DueNextMonth int64 `json:"due_next_month"`
}

// AssetDashboard represents comprehensive dashboard data
type AssetDashboard struct {
	Overview    *AssetSummary          `json:"overview"`
	Statistics  *AssetStatistics       `json:"statistics"`
	Health      *AssetHealth           `json:"health"`
	Critical    *CriticalAssetsSummary `json:"critical"`
	Inspections *InspectionDueSummary  `json:"inspections"`
	Trends      []DashboardTrend       `json:"trends"`
	Alerts      []DashboardAlert       `json:"alerts"`
}

// DashboardTrend represents trend data for dashboard
type DashboardTrend struct {
	Metric string           `json:"metric"`
	Period string           `json:"period"`
	Data   []TrendDataPoint `json:"data"`
}

// TrendDataPoint represents a single trend data point
type TrendDataPoint struct {
	Date  time.Time `json:"date"`
	Value float64   `json:"value"`
}

// DashboardAlert represents an alert on the dashboard
type DashboardAlert struct {
	ID           int       `json:"id"`
	Type         string    `json:"type"`
	Severity     string    `json:"severity"`
	Title        string    `json:"title"`
	Message      string    `json:"message"`
	AssetType    string    `json:"asset_type,omitempty"`
	AssetID      int       `json:"asset_id,omitempty"`
	AssetName    string    `json:"asset_name,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	Acknowledged bool      `json:"acknowledged"`
}
