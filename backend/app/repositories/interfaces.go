// platform/backend/app/repositories/interfaces.go
package repositories

import (
	"backend/app/models"
	"backend/app/models/request"
	"context"
)

// ManagerInfo represents manager information with additional stats
type ManagerInfo struct {
	models.User
	DepartmentID   *int    `db:"department_id"`
	DepartmentName *string `db:"department_name"`
	TeamSize       int     `db:"team_size"`
	DirectReports  int     `db:"direct_reports"`
}

// TenantRepository interface
type TenantRepository interface {
	Create(ctx context.Context, tenant *models.Tenant) error
	FindByID(ctx context.Context, id int) (*models.Tenant, error)
	FindBySubdomain(ctx context.Context, subdomain string) (*models.Tenant, error)
	FindByDomain(ctx context.Context, domain string) (*models.Tenant, error)
	Update(ctx context.Context, tenant *models.Tenant) error
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, limit, offset int) ([]models.Tenant, int64, error)

	// Status management
	Activate(ctx context.Context, id int) error
	Deactivate(ctx context.Context, id int) error
	Suspend(ctx context.Context, id int) error

	// Configuration management
	UpdateConfig(ctx context.Context, tenantID int, config map[string]interface{}) error
	GetConfig(ctx context.Context, tenantID int) (map[string]interface{}, error)
	SetConfigValue(ctx context.Context, tenantID int, key string, value interface{}) error
	GetConfigValue(ctx context.Context, tenantID int, key string) (interface{}, error)

	// Branding management
	UpdateBranding(ctx context.Context, branding *models.TenantBranding) error
	GetBranding(ctx context.Context, tenantID int) (*models.TenantBranding, error)
	DeleteBranding(ctx context.Context, tenantID int) error

	// Billing management
	UpdateBilling(ctx context.Context, billing *models.TenantBilling) error
	GetBilling(ctx context.Context, tenantID int) (*models.TenantBilling, error)
	GetTenantsForBilling(ctx context.Context, status string) ([]models.Tenant, error)

	// User management
	AddUserToTenant(ctx context.Context, tenantUser *models.TenantUser) error
	RemoveUserFromTenant(ctx context.Context, tenantID, userID int) error
	GetTenantUsers(ctx context.Context, tenantID int, limit, offset int) ([]models.TenantUser, int64, error)
	GetUserTenants(ctx context.Context, userID int) ([]models.TenantUser, error)
	UpdateTenantUserRole(ctx context.Context, tenantID, userID int, role string) error

	// Statistics
	GetTenantStats(ctx context.Context, tenantID int) (*models.TenantStats, error)
	GetSystemStats(ctx context.Context) (*models.SystemStats, error)
	GetActiveTenantsCount(ctx context.Context) (int64, error)
	SearchTenants(ctx context.Context, filter *models.TenantFilter, limit, offset int) ([]models.Tenant, int64, error)
	GetTenantsBySubscriptionPlan(ctx context.Context, plan string) ([]models.Tenant, error)
	GetExpiredTrialTenants(ctx context.Context) ([]models.Tenant, error)
	GetTenantUsageStats(ctx context.Context) ([]map[string]interface{}, error)

	// Utility methods
	CheckSubdomainAvailability(ctx context.Context, subdomain string) (bool, error)
	CheckDomainAvailability(ctx context.Context, domain string) (bool, error)
	BulkUpdateTenantStatus(ctx context.Context, tenantIDs []int, status string) error
	GetTenantResourceUsage(ctx context.Context, tenantID int) (map[string]interface{}, error)
	CleanupDeletedTenants(ctx context.Context, olderThanDays int) error
}

// UserRepository interface - ENHANCED with Statistics and Department methods
type UserRepository interface {
	// EXISTING USER METHODS
	Create(ctx context.Context, user *models.User) (*models.User, error)
	FindByID(ctx context.Context, id int) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByUsername(ctx context.Context, username string) (*models.User, error)
	FindByUsernameOrEmail(ctx context.Context, username, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, limit, offset int) ([]models.User, int64, error)
	UpdateLastLogin(ctx context.Context, id int) error

	// MISSING SERVICE METHODS
	GetAllWithFilters(ctx context.Context, tenantID, page, limit int, search, status, role string) ([]models.User, int, error)
	UpdateByID(ctx context.Context, userID int, updates map[string]interface{}) (*models.User, error)
	DeleteByID(ctx context.Context, userID int) error
	CountUsers(ctx context.Context) (int64, error)
	CountActiveUsers(ctx context.Context) (int64, error)
	GetManagersWithFilters(ctx context.Context, page, limit int, search string, departmentID *int) ([]models.User, int, error)

	// NEW USER STATISTICS METHODS
	GetTotalUsersCount(ctx context.Context, tenantID int) (int64, error)
	GetActiveUsersCount(ctx context.Context, tenantID int) (int64, error)
	GetSuperusersCount(ctx context.Context, tenantID int) (int64, error)
	GetRecentLoginsCount(ctx context.Context, tenantID int, hours int) (int64, error)
	GetAdminsCount(ctx context.Context, tenantID int) (int64, error)
	GetUserCountByDepartment(ctx context.Context, tenantID int) ([]models.DepartmentUserCount, error)
	GetUserCountByRole(ctx context.Context, tenantID int) ([]models.RoleUserCount, error)
	GetMonthlyUserGrowth(ctx context.Context, tenantID int, months int) ([]models.MonthlyUserGrowth, error)
	GetManagers(ctx context.Context, limit, offset int, search string, departmentID *int) ([]ManagerInfo, int64, error)

	// NEW DEPARTMENT METHODS
	CreateDepartment(ctx context.Context, dept *models.Department) (*models.Department, error)
	GetDepartmentByID(ctx context.Context, id int) (*models.Department, error)
	GetDepartmentByCode(ctx context.Context, code string) (*models.Department, error)
	ListDepartments(ctx context.Context, query request.DepartmentListQuery) ([]models.Department, int64, error)
	UpdateDepartment(ctx context.Context, dept *models.Department) (*models.Department, error)
	DeleteDepartment(ctx context.Context, id int, actorID int) error
	GetDepartmentUserCount(ctx context.Context, departmentID int) (int, error)
	GetSubDepartmentsCount(ctx context.Context, parentID int) (int, error)
	GetSubDepartments(ctx context.Context, parentID int) ([]models.Department, error)

	// NEW: Bulk delete method
	BulkDelete(ctx context.Context, ids []int, tenantID int) error
}

// RoleRepository interface
type RoleRepository interface {
	Create(ctx context.Context, role *models.Role) error
	FindByID(ctx context.Context, id int) (*models.Role, error)
	FindByName(ctx context.Context, name string) (*models.Role, error)
	Update(ctx context.Context, role *models.Role) error
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, limit, offset int) ([]models.Role, int64, error)
	AssignPermissionToRole(ctx context.Context, roleID int, permissionID int) error
	RevokePermissionFromRole(ctx context.Context, roleID int, permissionID int) error
	GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error)
	BulkDelete(ctx context.Context, ids []int, tenantID int) error
}

// RoleRepositoryInterface - Enhanced interface for role service
type RoleRepositoryInterface interface {
	Create(ctx context.Context, role *models.Role) (*models.Role, error)
	FindByID(ctx context.Context, id int) (*models.Role, error)
	FindByName(ctx context.Context, name string) (*models.Role, error)
	Update(ctx context.Context, id int, updateData map[string]interface{}) (*models.Role, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, limit, offset int) ([]models.Role, int64, error)
	AssignPermissionToRole(ctx context.Context, roleID int, permissionID int) error
	RevokePermissionFromRole(ctx context.Context, roleID int, permissionID int) error
	GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error)

	// Multi-tenant methods
	GetAllByTenant(ctx context.Context, tenantID int, page, limit int, search string) ([]models.Role, int, error)
	GetByIDAndTenant(ctx context.Context, id, tenantID int) (*models.Role, error)
	GetByCode(ctx context.Context, code string, tenantID int) (*models.Role, error)

	// NEW: Bulk delete method
	BulkDelete(ctx context.Context, ids []int, tenantID int) error
}

// UserRoleRepository interface
type UserRoleRepository interface {
	AssignRoleToUser(ctx context.Context, userID int, roleID int) error
	RemoveRoleFromUser(ctx context.Context, userID int, roleID int) error
	FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error)
}

// PermissionRepository interface
type PermissionRepository interface {
	Create(ctx context.Context, permission *models.Permission) error
	FindByID(ctx context.Context, id int) (*models.Permission, error)
	FindByName(ctx context.Context, name string) (*models.Permission, error)
	Update(ctx context.Context, permission *models.Permission) error
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, limit, offset int) ([]models.Permission, int64, error)
	ListByNames(ctx context.Context, names []string) ([]models.Permission, error)
	FindPermissionsByRoleID(ctx context.Context, roleID int) ([]models.Permission, error)
	CheckUserPermission(ctx context.Context, userID int, permissionName string) (bool, error)
	BulkDelete(ctx context.Context, ids []int, tenantID int) error
}

// PermissionRepositoryInterface - Enhanced interface for permission service
type PermissionRepositoryInterface interface {
	Create(ctx context.Context, permission *models.Permission) (*models.Permission, error)
	FindByID(ctx context.Context, id int) (*models.Permission, error)
	FindByName(ctx context.Context, name string) (*models.Permission, error)
	Update(ctx context.Context, id int, updateData map[string]interface{}) (*models.Permission, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, limit, offset int) ([]models.Permission, int64, error)
	ListByNames(ctx context.Context, names []string) ([]models.Permission, error)
	FindPermissionsByRoleID(ctx context.Context, roleID int) ([]models.Permission, error)
	CheckUserPermission(ctx context.Context, userID int, permissionName string) (bool, error)

	// Multi-tenant methods
	GetAllByTenant(ctx context.Context, tenantID int, page, limit int, search string) ([]models.Permission, int, error)
	GetByIDAndTenant(ctx context.Context, id, tenantID int) (*models.Permission, error)
	GetByName(ctx context.Context, name string, tenantID int) (*models.Permission, error)
	GetByResource(ctx context.Context, resource string, tenantID int) ([]models.Permission, error)
	GetByScope(ctx context.Context, scope string, tenantID int) ([]models.Permission, error)

	// SURGICAL ADD: Permission statistics method
	GetPermissionStats(ctx context.Context, tenantID int) (map[string]interface{}, error)

	// NEW: Bulk delete method
	BulkDelete(ctx context.Context, ids []int, tenantID int) error
}

// DashboardLayoutRepository interface
type DashboardLayoutRepository interface {
	Create(ctx context.Context, dashboard *models.Dashboard) error
	FindByID(ctx context.Context, dashboardID string, userID int) (*models.Dashboard, error)
	Update(ctx context.Context, dashboard *models.Dashboard) error
	Delete(ctx context.Context, dashboardID string, userID int) error
	ListByOwner(ctx context.Context, userID int, limit, offset int) ([]models.Dashboard, int64, error)
	CreateShare(ctx context.Context, share *models.DashboardShare) error
	DeleteShare(ctx context.Context, shareID int, userID int) error
	GetDashboardShares(ctx context.Context, dashboardID string) ([]models.DashboardShare, error)
	FindShareByID(ctx context.Context, shareID int) (*models.DashboardShare, error)
}

// PasswordResetRepository interface
type PasswordResetRepository interface {
	Create(ctx context.Context, pr *models.PasswordReset) error
	FindByToken(ctx context.Context, token string) (*models.PasswordReset, error)
	Delete(ctx context.Context, token string) error
	DeleteByUserID(ctx context.Context, userID int) error
}

//  ONLY IN INTERFACES.GO: Core interfaces that should be centralized
// These interfaces are ONLY declared here and should NOT exist in individual repository files

// AssetRepository interface for analytics service
type AssetRepository interface {
	// Basic CRUD operations for all asset types
	Create(ctx context.Context, asset *models.Asset) error
	FindByID(ctx context.Context, tenantID int, id int) (*models.Asset, error)
	FindByTag(ctx context.Context, tenantID int, unitID int, tag string) (*models.Asset, error)
	FindByName(ctx context.Context, tenantID int, unitID int, name string) (*models.Asset, error)
	Update(ctx context.Context, asset *models.Asset) error
	Delete(ctx context.Context, tenantID int, id int) error
	List(ctx context.Context, tenantID int, query *request.AssetListQuery) ([]models.Asset, int64, error)
	GetAssetStats(ctx context.Context, tenantID int) ([]AssetTypeStatusCount, error)
	UpdateLifecycle(ctx context.Context, tenantID, assetID int, status string, userID int) error
	DiagnoseDuplicateTags(ctx context.Context, tenantID int) ([]DuplicateAssetTag, error)
	FixBrokenParentLinks(ctx context.Context, tenantID, userID int, dryRun bool) (int64, error)
	ValidateFLOCLinks(ctx context.Context, tenantID, userID int, dryRun bool) (*FLOCSyncResult, error)
	ListAssetsForExport(ctx context.Context, tenantID int, assetType, status string) ([]models.Asset, error)
	FindByTagNumber(ctx context.Context, tenantID int, tagNumber string) (*models.Asset, error)
	HasActiveComponents(ctx context.Context, tenantID int, id int) (bool, error)

	GetSiteByID(ctx context.Context, id int, tenantID int) (*models.Site, error)
	GetUnitByID(ctx context.Context, id int, tenantID int) (*models.Unit, error)
	GetAssetByID(ctx context.Context, id int, tenantID int) (*models.Asset, error)
	GetComponentByID(ctx context.Context, id int, tenantID int) (*models.Component, error)

	// Asset statistics for analytics
	GetAssetCounts(ctx context.Context, tenantID int) (map[string]int, error)
	GetAssetCriticalityBreakdown(ctx context.Context, tenantID int) (map[string]map[string]int, error)
	GetComponentIntegrityStatus(ctx context.Context, tenantID int, AssetID *int) (map[string]int, error)
	GetInspectionDueAnalytics(ctx context.Context, tenantID int, daysAhead int) (map[string]interface{}, error)

	// Asset health calculations
	CalculateAssetHealthScore(ctx context.Context, tenantID int, assetType string) (float64, error)
	GetCriticalAssets(ctx context.Context, tenantID int) ([]interface{}, error)
	GetAssetsRequiringAttention(ctx context.Context, tenantID int) ([]interface{}, error)
}

// AssetTypeStatusCount is one grouped asset-type/lifecycle-status aggregate.
type AssetTypeStatusCount struct {
	AssetType       string `db:"asset_type" json:"asset_type"`
	LifecycleStatus string `db:"lifecycle_status" json:"lifecycle_status"`
	Count           int64  `db:"count" json:"count"`
}

type DuplicateAssetTag struct {
	TagNumber string `db:"tag_number" json:"tag_number"`
	Count     int64  `db:"count" json:"count"`
	AssetIDs  []int  `db:"-" json:"asset_ids"`
}

type FLOCSyncResult struct {
	CheckedAssets      int64 `json:"checked_assets"`
	ValidComponents    int64 `json:"valid_components"`
	OrphanedComponents int64 `json:"orphaned_components"`
	BrokenFLOCLinks    int64 `json:"broken_floc_links"`
	ClearedFLOCLinks   int64 `json:"cleared_floc_links"`
}

// DashboardRepository interface for widget data
type DashboardRepository interface {
	// Widget data fetching methods
	GetUserCount(ctx context.Context) (int64, error)
	GetActiveUsersCount(ctx context.Context, since int) (int64, error)
	GetSystemHealthMetrics(ctx context.Context) (map[string]interface{}, error)
	GetRecentActivityFeed(ctx context.Context, limit int) ([]map[string]interface{}, error)

	// Performance metrics for dashboard widgets
	GetAssetPerformanceMetrics(ctx context.Context, tenantID int) (map[string]interface{}, error)
	GetMaintenanceMetrics(ctx context.Context, tenantID int) (map[string]interface{}, error)
	GetComplianceMetrics(ctx context.Context, tenantID int) (map[string]interface{}, error)
}

// MediaRepository interface for media service - FIXED method signatures
type MediaRepository interface {
	Create(ctx context.Context, media *models.Media) error
	GetByID(ctx context.Context, id interface{}) (*models.Media, error) // Support both UUID and string
	Delete(ctx context.Context, id interface{}) error
	ListByUploader(ctx context.Context, uploaderID interface{}, limit, offset int) ([]models.Media, int64, error)
	ListByType(ctx context.Context, mimeType string, limit, offset int) ([]models.Media, int64, error)
	UpdateMetadata(ctx context.Context, id interface{}, metadata map[string]interface{}) error
}

// AnalyticsRepository interface - ENHANCED with Real Database Integration
type AnalyticsRepository interface {
	// Event tracking methods
	CreateEvent(ctx context.Context, event *models.AnalyticsEvent) error
	CreateEvents(ctx context.Context, events []*models.AnalyticsEvent) error
	QueryEvents(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]models.AnalyticsEvent, int64, error)
	AggregateEvents(ctx context.Context, aggregationType string, filters map[string]interface{}, groupBy []string, timeBucket string) (interface{}, error)
	GetUsersInSegment(ctx context.Context, segmentDefinition interface{}) ([]uint, error)
	CalculateFunnelConversion(ctx context.Context, funnelDefinition interface{}) (map[string]int64, error)

	// ENHANCED: Real Asset Health Analytics using Database Views
	GetAssetHealthMetrics(ctx context.Context, tenantID int, assetType string) (map[string]interface{}, error)
	GetCriticalityBreakdown(ctx context.Context, tenantID int) (map[string]interface{}, error)
	GetIntegrityStatusSummary(ctx context.Context, tenantID int, AssetID *int) (map[string]interface{}, error)
	GetInspectionDueAnalytics(ctx context.Context, tenantID int, daysAhead int) (map[string]interface{}, error)
}

// ReportRepository interface
type ReportRepository interface {
	CreateTemplate(ctx context.Context, template *models.ReportTemplate) error
	GetTemplateByID(ctx context.Context, id uint) (*models.ReportTemplate, error)
	ListTemplates(ctx context.Context) ([]models.ReportTemplate, error)
	UpdateTemplate(ctx context.Context, template *models.ReportTemplate) error
	DeleteTemplate(ctx context.Context, id uint) error
}

// ContentEntryRepository interface
type ContentEntryRepository interface {
	Create(ctx context.Context, entry *models.ContentEntry) error
	GetByID(ctx context.Context, id uint) (*models.ContentEntry, error)
	GetBySlug(ctx context.Context, slug string) (*models.ContentEntry, error)
	Update(ctx context.Context, entry *models.ContentEntry) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]models.ContentEntry, int64, error)
}

// ContentVersionRepository interface
type ContentVersionRepository interface {
	CreateVersion(ctx context.Context, version *models.ContentVersion) error
	CreateVersionFromEntry(ctx context.Context, entry *models.ContentEntry, userID uint) (*models.ContentVersion, error)
	GetVersionByID(ctx context.Context, id uint) (*models.ContentVersion, error)
	ListVersionsByEntryID(ctx context.Context, entryID uint, limit, offset int) ([]models.ContentVersion, int64, error)
}

// WorkflowRepository interface
type WorkflowRepository interface {
	// Workflow CRUD
	CreateWorkflow(ctx context.Context, workflow *models.Workflow) error
	GetWorkflowByID(ctx context.Context, id uint) (*models.Workflow, error)
	GetWorkflowByName(ctx context.Context, name string) (*models.Workflow, error)
	UpdateWorkflow(ctx context.Context, workflow *models.Workflow) error
	DeleteWorkflow(ctx context.Context, id uint) error
	ListWorkflows(ctx context.Context, limit, offset int) ([]models.Workflow, int64, error)

	// Stage operations
	CreateStage(ctx context.Context, stage *models.WorkflowStage) error
	GetStageByID(ctx context.Context, id uint) (*models.WorkflowStage, error)
	ListStagesByWorkflow(ctx context.Context, workflowID uint) ([]models.WorkflowStage, error)
	FindInitialStage(ctx context.Context, workflowID uint) (*models.WorkflowStage, error)

	// Transition operations
	CreateTransition(ctx context.Context, transition *models.WorkflowTransition) error
	GetTransitionByID(ctx context.Context, id uint) (*models.WorkflowTransition, error)
	FindTransitionsFromStage(ctx context.Context, workflowID uint, fromStageID uint) ([]models.WorkflowTransition, error)
	CheckUserPermissionForTransition(ctx context.Context, userID uint, transitionID uint) (bool, error)
}
