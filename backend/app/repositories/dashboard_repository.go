// platform/backend/app/repositories/dashboard_repository.go

package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

//  REMOVED: DashboardRepository interface declaration (now only in interfaces.go)

// dashboardRepository implements the DashboardRepository interface using SQLX
type dashboardRepository struct {
	db *sqlx.DB
}

// NewDashboardRepository creates a new DashboardRepository implementation
func NewDashboardRepository(db *sqlx.DB) DashboardRepository {
	return &dashboardRepository{db: db}
}

// GetUserCount returns the total number of users in the system
func (r *dashboardRepository) GetUserCount(ctx context.Context) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`

	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		log.Printf("Error getting user count: %v", err)
		return 0, fmt.Errorf("failed to get user count: %w", err)
	}

	return count, nil
}

// GetActiveUsersCount returns the number of active users since specified hours
func (r *dashboardRepository) GetActiveUsersCount(ctx context.Context, since int) (int64, error) {
	var count int64
	query := `
		SELECT COUNT(DISTINCT user_id) 
		FROM analytics_events 
		WHERE timestamp >= NOW() - INTERVAL '%d hours'
	`

	err := r.db.GetContext(ctx, &count, fmt.Sprintf(query, since))
	if err != nil {
		// If analytics_events table doesn't exist or is empty, fallback to last_login
		fallbackQuery := `
			SELECT COUNT(*) 
			FROM users 
			WHERE last_login >= NOW() - INTERVAL '%d hours' 
			AND deleted_at IS NULL
		`
		err = r.db.GetContext(ctx, &count, fmt.Sprintf(fallbackQuery, since))
		if err != nil {
			log.Printf("Error getting active users count: %v", err)
			return 0, fmt.Errorf("failed to get active users count: %w", err)
		}
	}

	return count, nil
}

// GetSystemHealthMetrics returns various system health metrics
func (r *dashboardRepository) GetSystemHealthMetrics(ctx context.Context) (map[string]interface{}, error) {
	metrics := make(map[string]interface{})

	// Database connection health
	if err := r.db.PingContext(ctx); err != nil {
		metrics["database_status"] = "unhealthy"
		metrics["database_error"] = err.Error()
	} else {
		metrics["database_status"] = "healthy"
	}

	// Get database stats
	var tableCount int
	err := r.db.GetContext(ctx, &tableCount,
		"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
	if err != nil {
		log.Printf("Error getting table count: %v", err)
		metrics["table_count"] = 0
	} else {
		metrics["table_count"] = tableCount
	}

	// Get total records in key tables
	keyTables := []string{"users", "tenants", "sites", "units", "equipment", "components"}
	for _, table := range keyTables {
		var count int
		query := fmt.Sprintf("SELECT COUNT(*) FROM %s", table)
		err := r.db.GetContext(ctx, &count, query)
		if err != nil {
			log.Printf("Error getting count for table %s: %v", table, err)
			metrics[fmt.Sprintf("%s_count", table)] = 0
		} else {
			metrics[fmt.Sprintf("%s_count", table)] = count
		}
	}

	return metrics, nil
}

// GetRecentActivityFeed returns recent system activity
func (r *dashboardRepository) GetRecentActivityFeed(ctx context.Context, limit int) ([]map[string]interface{}, error) {
	activities := []map[string]interface{}{}

	// Try to get from audit_logs table
	query := `
		SELECT 
			al.action,
			al.resource_type,
			al.resource_id,
			al.created_at,
			u.username,
			u.first_name,
			u.last_name
		FROM audit_logs al
		LEFT JOIN users u ON al.user_id = u.id
		ORDER BY al.created_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		log.Printf("Error getting recent activity from audit_logs: %v", err)
		// Fallback to user creation activity
		return r.getFallbackActivity(ctx, limit)
	}
	defer rows.Close()

	for rows.Next() {
		var action, resourceType, username, firstName, lastName sql.NullString
		var resourceID sql.NullInt64
		var createdAt sql.NullTime

		err := rows.Scan(&action, &resourceType, &resourceID, &createdAt,
			&username, &firstName, &lastName)
		if err != nil {
			continue
		}

		activity := map[string]interface{}{
			"action":        action.String,
			"resource_type": resourceType.String,
			"resource_id":   resourceID.Int64,
			"timestamp":     createdAt.Time,
			"username":      username.String,
			"user_name":     fmt.Sprintf("%s %s", firstName.String, lastName.String),
		}

		activities = append(activities, activity)
	}

	return activities, nil
}

// getFallbackActivity provides fallback activity data when audit_logs is not available
func (r *dashboardRepository) getFallbackActivity(ctx context.Context, limit int) ([]map[string]interface{}, error) {
	activities := []map[string]interface{}{}

	query := `
		SELECT 
			'user_created' as action,
			'user' as resource_type,
			id as resource_id,
			created_at,
			username,
			first_name,
			last_name
		FROM users 
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		log.Printf("Error getting fallback activity: %v", err)
		return activities, fmt.Errorf("failed to get recent activity: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var action, resourceType, username, firstName, lastName string
		var resourceID int64
		var createdAt sql.NullTime

		err := rows.Scan(&action, &resourceType, &resourceID, &createdAt,
			&username, &firstName, &lastName)
		if err != nil {
			continue
		}

		activity := map[string]interface{}{
			"action":        action,
			"resource_type": resourceType,
			"resource_id":   resourceID,
			"timestamp":     createdAt.Time,
			"username":      username,
			"user_name":     fmt.Sprintf("%s %s", firstName, lastName),
		}

		activities = append(activities, activity)
	}

	return activities, nil
}

// GetAssetPerformanceMetrics returns asset performance metrics for a tenant
func (r *dashboardRepository) GetAssetPerformanceMetrics(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	metrics := make(map[string]interface{})

	// Get Asset health distribution
	query := `
		SELECT 
			COUNT(*) as total_Asset,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_Asset,
			COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_Asset,
			COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_Asset
		FROM equipment 
		WHERE tenant_id = $1
	`

	var total, active, maintenance, inactive int
	err := r.db.QueryRowContext(ctx, query, tenantID).Scan(&total, &active, &maintenance, &inactive)
	if err != nil {
		log.Printf("Error getting asset performance metrics: %v", err)
		return metrics, fmt.Errorf("failed to get asset performance metrics: %w", err)
	}

	metrics["total_Asset"] = total
	metrics["active_Asset"] = active
	metrics["maintenance_Asset"] = maintenance
	metrics["inactive_Asset"] = inactive

	// Get component integrity distribution
	integrityQuery := `
		SELECT 
			integrity_status,
			COUNT(*) as count
		FROM components 
		WHERE tenant_id = $1 AND status = 'active'
		GROUP BY integrity_status
	`

	integrityRows, err := r.db.QueryContext(ctx, integrityQuery, tenantID)
	if err != nil {
		log.Printf("Error getting component integrity metrics: %v", err)
	} else {
		defer integrityRows.Close()
		integrityMap := make(map[string]int)

		for integrityRows.Next() {
			var status string
			var count int
			if err := integrityRows.Scan(&status, &count); err == nil {
				integrityMap[status] = count
			}
		}
		metrics["integrity_status"] = integrityMap
	}

	return metrics, nil
}

// GetMaintenanceMetrics returns maintenance-related metrics for a tenant
func (r *dashboardRepository) GetMaintenanceMetrics(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	metrics := make(map[string]interface{})

	// Get maintenance task counts
	query := `
		SELECT 
			COUNT(*) as total_tasks,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
			COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
		FROM maintenance_tasks 
		WHERE tenant_id = $1
	`

	var total, pending, inProgress, completed int
	err := r.db.QueryRowContext(ctx, query, tenantID).Scan(&total, &pending, &inProgress, &completed)
	if err != nil {
		log.Printf("Error getting maintenance metrics: %v", err)
		return metrics, fmt.Errorf("failed to get maintenance metrics: %w", err)
	}

	metrics["total_tasks"] = total
	metrics["pending_tasks"] = pending
	metrics["in_progress_tasks"] = inProgress
	metrics["completed_tasks"] = completed

	// Calculate completion rate
	if total > 0 {
		metrics["completion_rate"] = float64(completed) / float64(total) * 100
	} else {
		metrics["completion_rate"] = 0.0
	}

	return metrics, nil
}

// GetComplianceMetrics returns compliance-related metrics for a tenant
func (r *dashboardRepository) GetComplianceMetrics(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	metrics := make(map[string]interface{})

	// Get compliance task counts
	query := `
		SELECT 
			COUNT(*) as total_tasks,
			COUNT(CASE WHEN compliance_status = 'compliant' THEN 1 END) as compliant_tasks,
			COUNT(CASE WHEN compliance_status = 'non_compliant' THEN 1 END) as non_compliant_tasks,
			COUNT(CASE WHEN compliance_status = 'pending' THEN 1 END) as pending_tasks
		FROM compliance_tasks 
		WHERE tenant_id = $1
	`

	var total, compliant, nonCompliant, pending int
	err := r.db.QueryRowContext(ctx, query, tenantID).Scan(&total, &compliant, &nonCompliant, &pending)
	if err != nil {
		log.Printf("Error getting compliance metrics: %v", err)
		return metrics, fmt.Errorf("failed to get compliance metrics: %w", err)
	}

	metrics["total_tasks"] = total
	metrics["compliant_tasks"] = compliant
	metrics["non_compliant_tasks"] = nonCompliant
	metrics["pending_tasks"] = pending

	// Calculate compliance rate
	if total > 0 {
		metrics["compliance_rate"] = float64(compliant) / float64(total) * 100
	} else {
		metrics["compliance_rate"] = 0.0
	}

	return metrics, nil
}

// Ensure implementation satisfies the interface
var _ DashboardRepository = (*dashboardRepository)(nil)
