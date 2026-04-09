// platform/backend/app/models/tenant_stats.go
package models

import (
	"math"
	"time"
)

// TenantStats represents usage statistics for a tenant
type TenantStats struct {
	TenantID        int        `json:"tenant_id"`
	UserCount       int64      `json:"user_count"`
	ActiveUserCount int64      `json:"active_user_count"`
	AssetCount      int64      `json:"asset_count"`
	InspectionCount int64      `json:"inspection_count"`
	WorkOrderCount  int64      `json:"work_order_count"`
	StorageUsedGB   float64    `json:"storage_used_gb"`
	ApiCallsCount   int64      `json:"api_calls_count"`
	LastActivity    *time.Time `json:"last_activity,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

// SystemStats represents system-wide statistics
type SystemStats struct {
	TotalTenants            int64     `json:"total_tenants"`
	ActiveTenants           int64     `json:"active_tenants"`
	TrialTenants            int64     `json:"trial_tenants"`
	SuspendedTenants        int64     `json:"suspended_tenants"`
	TotalUsers              int64     `json:"total_users"`
	ActiveUsers             int64     `json:"active_users"`
	TotalAssets             int64     `json:"total_assets"`
	TotalInspections        int64     `json:"total_inspections"`
	TotalWorkOrders         int64     `json:"total_work_orders"`
	TotalStorageGB          float64   `json:"total_storage_gb"`
	AverageStoragePerTenant float64   `json:"average_storage_per_tenant"`
	AverageUsersPerTenant   float64   `json:"average_users_per_tenant"`
	TotalApiCalls           int64     `json:"total_api_calls"`
	CalculatedAt            time.Time `json:"calculated_at"`
}

// Helper methods for TenantStats
func (ts *TenantStats) GetUserUtilization(maxUsers int) float64 {
	if maxUsers == 0 {
		return 0
	}
	return float64(ts.UserCount) / float64(maxUsers) * 100
}

func (ts *TenantStats) GetStorageUtilization(maxStorageGB int) float64 {
	if maxStorageGB == 0 {
		return 0
	}
	return ts.StorageUsedGB / float64(maxStorageGB) * 100
}

func (ts *TenantStats) IsResourceCritical(maxUsers int, maxStorageGB int) bool {
	userUtil := ts.GetUserUtilization(maxUsers)
	storageUtil := ts.GetStorageUtilization(maxStorageGB)

	// Consider critical if any resource is above 90% utilization
	return userUtil > 90 || storageUtil > 90
}

func (ts *TenantStats) GetActivityScore() float64 {
	// Simple activity score based on recent activity
	if ts.LastActivity == nil {
		return 0
	}

	daysSinceActivity := time.Since(*ts.LastActivity).Hours() / 24
	if daysSinceActivity > 30 {
		return 0
	}

	// Score decreases as days increase (max 100 for today, 0 for 30+ days)
	return math.Max(0, 100-daysSinceActivity*3.33)
}

func (ts *TenantStats) IsActivelyUsed() bool {
	if ts.LastActivity == nil {
		return false
	}

	// Consider actively used if activity within last 7 days
	return time.Since(*ts.LastActivity) <= 7*24*time.Hour
}

// Helper methods for SystemStats
func (ss *SystemStats) GetTenantActivationRate() float64 {
	if ss.TotalTenants == 0 {
		return 0
	}
	return float64(ss.ActiveTenants) / float64(ss.TotalTenants) * 100
}

func (ss *SystemStats) GetUserActivationRate() float64 {
	if ss.TotalUsers == 0 {
		return 0
	}
	return float64(ss.ActiveUsers) / float64(ss.TotalUsers) * 100
}

func (ss *SystemStats) GetTrialTenantRate() float64 {
	if ss.TotalTenants == 0 {
		return 0
	}
	return float64(ss.TrialTenants) / float64(ss.TotalTenants) * 100
}

func (ss *SystemStats) GetSuspendedTenantRate() float64 {
	if ss.TotalTenants == 0 {
		return 0
	}
	return float64(ss.SuspendedTenants) / float64(ss.TotalTenants) * 100
}

func (ss *SystemStats) GetStorageEfficiency() float64 {
	if ss.TotalTenants == 0 {
		return 0
	}
	return ss.TotalStorageGB / float64(ss.TotalTenants)
}

func (ss *SystemStats) IsSystemHealthy() bool {
	activationRate := ss.GetTenantActivationRate()
	suspendedRate := ss.GetSuspendedTenantRate()

	// System is healthy if > 80% tenants are active and < 5% are suspended
	return activationRate > 80 && suspendedRate < 5
}

// Add missing import for math package
