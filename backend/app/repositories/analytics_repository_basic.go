// platform/backend/app/repositories/analytics_repository_basic.go

package repositories

import (
	"backend/app/models"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

// analyticsRepository implements AnalyticsRepository interface using SQLX
type analyticsRepository struct {
	db *sqlx.DB
}

// NewAnalyticsRepository creates a new AnalyticsRepository implementation
func NewAnalyticsRepository(db *sqlx.DB) AnalyticsRepository {
	return &analyticsRepository{db: db}
}

// CreateEvent stores a single analytics event
func (r *analyticsRepository) CreateEvent(ctx context.Context, event *models.AnalyticsEvent) error {
	query := `
		INSERT INTO analytics_events (user_id, session_id, event_type, properties, ip_address, user_agent, timestamp, tenant_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	propertiesJSON, err := json.Marshal(event.Properties)
	if err != nil {
		return fmt.Errorf("failed to marshal properties: %w", err)
	}

	_, err = r.db.ExecContext(ctx, query,
		event.UserID, event.SessionID, event.EventType, propertiesJSON,
		event.IPAddress, event.UserAgent, event.Timestamp, event.TenantID,
	)
	if err != nil {
		return fmt.Errorf("failed to create analytics event: %w", err)
	}

	return nil
}

// CreateEvents stores multiple analytics events efficiently (batch insert)
func (r *analyticsRepository) CreateEvents(ctx context.Context, events []*models.AnalyticsEvent) error {
	if len(events) == 0 {
		return nil
	}

	// Use transaction for batch insert
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO analytics_events (user_id, session_id, event_type, properties, ip_address, user_agent, timestamp, tenant_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	for _, event := range events {
		propertiesJSON, err := json.Marshal(event.Properties)
		if err != nil {
			return fmt.Errorf("failed to marshal properties for event: %w", err)
		}

		_, err = tx.ExecContext(ctx, query,
			event.UserID, event.SessionID, event.EventType, propertiesJSON,
			event.IPAddress, event.UserAgent, event.Timestamp, event.TenantID,
		)
		if err != nil {
			return fmt.Errorf("failed to insert analytics event: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit batch insert: %w", err)
	}

	return nil
}

// QueryEvents retrieves events based on filters
func (r *analyticsRepository) QueryEvents(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]models.AnalyticsEvent, int64, error) {
	// Build dynamic query based on filters
	baseQuery := `SELECT user_id, session_id, event_type, properties, ip_address, user_agent, timestamp, tenant_id FROM analytics_events WHERE 1=1`
	countQuery := `SELECT COUNT(*) FROM analytics_events WHERE 1=1`

	var args []interface{}
	var conditions string
	argIndex := 1

	// Add filter conditions
	if tenantID, ok := filters["tenant_id"]; ok {
		conditions += fmt.Sprintf(" AND tenant_id = $%d", argIndex)
		args = append(args, tenantID)
		argIndex++
	}

	if eventType, ok := filters["event_type"]; ok {
		conditions += fmt.Sprintf(" AND event_type = $%d", argIndex)
		args = append(args, eventType)
		argIndex++
	}

	if userID, ok := filters["user_id"]; ok {
		conditions += fmt.Sprintf(" AND user_id = $%d", argIndex)
		args = append(args, userID)
		argIndex++
	}

	if startDate, ok := filters["start_date"]; ok {
		conditions += fmt.Sprintf(" AND timestamp >= $%d", argIndex)
		args = append(args, startDate)
		argIndex++
	}

	if endDate, ok := filters["end_date"]; ok {
		conditions += fmt.Sprintf(" AND timestamp <= $%d", argIndex)
		args = append(args, endDate)
		argIndex++
	}

	// Get total count
	var totalCount int64
	err := r.db.GetContext(ctx, &totalCount, countQuery+conditions, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get event count: %w", err)
	}

	// Get events with pagination
	finalQuery := baseQuery + conditions + fmt.Sprintf(" ORDER BY timestamp DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, finalQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query events: %w", err)
	}
	defer rows.Close()

	var events []models.AnalyticsEvent
	for rows.Next() {
		var event models.AnalyticsEvent
		var propertiesJSON []byte

		err := rows.Scan(&event.UserID, &event.SessionID, &event.EventType,
			&propertiesJSON, &event.IPAddress, &event.UserAgent, &event.Timestamp, &event.TenantID)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan event: %w", err)
		}

		if len(propertiesJSON) > 0 {
			if err := json.Unmarshal(propertiesJSON, &event.Properties); err != nil {
				event.Properties = make(map[string]interface{}) // Default to empty map on error
			}
		}

		events = append(events, event)
	}

	return events, totalCount, nil
}

// AggregateEvents performs aggregation queries
func (r *analyticsRepository) AggregateEvents(ctx context.Context, aggregationType string, filters map[string]interface{}, groupBy []string, timeBucket string) (interface{}, error) {
	// This is a simplified implementation - in production you might want more sophisticated aggregation
	switch aggregationType {
	case "count":
		return r.countEvents(ctx, filters, groupBy, timeBucket)
	case "dau":
		return r.dailyActiveUsers(ctx, filters, timeBucket)
	case "page_views":
		return r.pageViews(ctx, filters, timeBucket)
	default:
		return nil, fmt.Errorf("unsupported aggregation type: %s", aggregationType)
	}
}

// countEvents helper for count aggregation
func (r *analyticsRepository) countEvents(ctx context.Context, filters map[string]interface{}, groupBy []string, timeBucket string) (interface{}, error) {
	query := `SELECT COUNT(*) as count FROM analytics_events WHERE 1=1`

	var args []interface{}
	var conditions string
	argIndex := 1

	if tenantID, ok := filters["tenant_id"]; ok {
		conditions += fmt.Sprintf(" AND tenant_id = $%d", argIndex)
		args = append(args, tenantID)
		argIndex++
	}

	if startDate, ok := filters["start_date"]; ok {
		conditions += fmt.Sprintf(" AND timestamp >= $%d", argIndex)
		args = append(args, startDate)
		argIndex++
	}

	if endDate, ok := filters["end_date"]; ok {
		conditions += fmt.Sprintf(" AND timestamp <= $%d", argIndex)
		args = append(args, endDate)
		argIndex++
	}

	var count int64
	err := r.db.GetContext(ctx, &count, query+conditions, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count events: %w", err)
	}

	return map[string]interface{}{
		"count":   count,
		"filters": filters,
	}, nil
}

// dailyActiveUsers helper for DAU calculation
func (r *analyticsRepository) dailyActiveUsers(ctx context.Context, filters map[string]interface{}, timeBucket string) (interface{}, error) {
	query := `
		SELECT COUNT(DISTINCT user_id) as dau
		FROM analytics_events 
		WHERE timestamp >= $1 AND timestamp < $2
	`

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -1) // Last 24 hours

	if start, ok := filters["start_date"]; ok {
		if startTime, ok := start.(time.Time); ok {
			startDate = startTime
		}
	}

	if end, ok := filters["end_date"]; ok {
		if endTime, ok := end.(time.Time); ok {
			endDate = endTime
		}
	}

	var dau int64
	err := r.db.GetContext(ctx, &dau, query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate DAU: %w", err)
	}

	return map[string]interface{}{
		"dau": dau,
		"date_range": map[string]interface{}{
			"start": startDate,
			"end":   endDate,
		},
	}, nil
}

// pageViews helper for page view analysis
func (r *analyticsRepository) pageViews(ctx context.Context, filters map[string]interface{}, timeBucket string) (interface{}, error) {
	// This would extract page path from properties and count views
	query := `
		SELECT 
			properties->>'path' as page_path,
			COUNT(*) as views
		FROM analytics_events 
		WHERE event_type = 'page_view' 
		AND timestamp >= $1 
		AND timestamp < $2
		GROUP BY properties->>'path'
		ORDER BY views DESC
		LIMIT 20
	`

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -7) // Last 7 days

	rows, err := r.db.QueryContext(ctx, query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get page views: %w", err)
	}
	defer rows.Close()

	var pageViews []map[string]interface{}
	for rows.Next() {
		var path string
		var views int64

		if err := rows.Scan(&path, &views); err != nil {
			continue
		}

		pageViews = append(pageViews, map[string]interface{}{
			"path":  path,
			"views": views,
		})
	}

	return map[string]interface{}{
		"page_views": pageViews,
		"date_range": map[string]interface{}{
			"start": startDate,
			"end":   endDate,
		},
	}, nil
}

// GetUsersInSegment retrieves user IDs belonging to a defined segment
func (r *analyticsRepository) GetUsersInSegment(ctx context.Context, segmentDefinition interface{}) ([]uint, error) {
	// This is a placeholder implementation
	// In a real system, segmentDefinition would define user behavior patterns
	return []uint{}, fmt.Errorf("segment analysis not yet implemented")
}

// CalculateFunnelConversion calculates funnel conversion rates
func (r *analyticsRepository) CalculateFunnelConversion(ctx context.Context, funnelDefinition interface{}) (map[string]int64, error) {
	// This is a placeholder implementation
	// In a real system, funnelDefinition would define the funnel steps
	return map[string]int64{
		"step1": 100,
		"step2": 75,
		"step3": 50,
	}, nil
}

//  SURGICAL ADD: Real Asset Health Analytics using Database Views

// GetAssetHealthMetrics gets real-time asset health data using v_asset_integrity_summary
func (r *analyticsRepository) GetAssetHealthMetrics(ctx context.Context, tenantID int, assetType string) (map[string]interface{}, error) {
	// Query from v_asset_integrity_summary view for real data
	query := `
		SELECT 
			equipment_id,
			Asset_name,
			tag_number,
			total_components,
			excellent_count,
			good_count,
			fair_count,
			poor_count,
			critical_count,
			safety_critical_count,
			COALESCE(highest_risk_score, 0) as highest_risk_score
		FROM v_asset_integrity_summary 
		WHERE tenant_id = $1
		ORDER BY highest_risk_score DESC, critical_count DESC
	`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get asset health metrics: %w", err)
	}
	defer rows.Close()

	var AssetList []map[string]interface{}
	var totalAssets, totalComponents, totalExcellent, totalGood, totalFair, totalPoor, totalCritical, totalSafetyCritical int

	for rows.Next() {
		var AssetID int
		var AssetName, tagNumber string
		var totalComp, excellent, good, fair, poor, critical, safetyCritical int
		var highestRisk sql.NullFloat64

		err := rows.Scan(&AssetID, &AssetName, &tagNumber, &totalComp,
			&excellent, &good, &fair, &poor, &critical, &safetyCritical, &highestRisk)
		if err != nil {
			continue
		}

		riskScore := 0.0
		if highestRisk.Valid {
			riskScore = highestRisk.Float64
		}

		AssetList = append(AssetList, map[string]interface{}{
			"asset_id":          AssetID,
			"asset_name":        AssetName,
			"tag_number":            tagNumber,
			"total_components":      totalComp,
			"excellent_count":       excellent,
			"good_count":            good,
			"fair_count":            fair,
			"poor_count":            poor,
			"critical_count":        critical,
			"safety_critical_count": safetyCritical,
			"highest_risk_score":    riskScore,
		})

		// Aggregate totals
		totalAssets++
		totalComponents += totalComp
		totalExcellent += excellent
		totalGood += good
		totalFair += fair
		totalPoor += poor
		totalCritical += critical
		totalSafetyCritical += safetyCritical
	}

	// Calculate overall health score (0-100 scale)
	healthScore := 0.0
	if totalComponents > 0 {
		healthScore = float64(totalExcellent*100+totalGood*80+totalFair*60+totalPoor*30+totalCritical*0) / float64(totalComponents*100) * 100
	}

	return map[string]interface{}{
		"tenant_id":             tenantID,
		"asset_type":            assetType,
		"generated_at":          time.Now(),
		"health_score":          healthScore,
		"total_assets":          totalAssets,
		"total_components":      totalComponents,
		"excellent_count":       totalExcellent,
		"good_count":            totalGood,
		"fair_count":            totalFair,
		"poor_count":            totalPoor,
		"critical_count":        totalCritical,
		"safety_critical_count": totalSafetyCritical,
		"asset_details":     AssetList,
	}, nil
}

// GetCriticalityBreakdown gets real criticality data using v_asset_criticality_summary
func (r *analyticsRepository) GetCriticalityBreakdown(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	// Query from v_asset_criticality_summary view
	query := `
		SELECT 
			asset_type,
			total_count,
			critical_count,
			high_count,
			medium_count,
			low_count
		FROM v_asset_criticality_summary 
		WHERE tenant_id = $1
		ORDER BY asset_type
	`

	rows, err := r.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get criticality breakdown: %w", err)
	}
	defer rows.Close()

	breakdown := make(map[string]map[string]int)

	for rows.Next() {
		var assetType string
		var total, critical, high, medium, low int

		err := rows.Scan(&assetType, &total, &critical, &high, &medium, &low)
		if err != nil {
			continue
		}

		breakdown[assetType] = map[string]int{
			"total":    total,
			"critical": critical,
			"high":     high,
			"medium":   medium,
			"low":      low,
		}
	}

	return map[string]interface{}{
		"tenant_id":    tenantID,
		"breakdown":    breakdown,
		"generated_at": time.Now(),
	}, nil
}

// GetIntegrityStatusSummary gets integrity status using v_asset_integrity_summary
func (r *analyticsRepository) GetIntegrityStatusSummary(ctx context.Context, tenantID int, AssetID *int) (map[string]interface{}, error) {
	var query string
	var args []interface{}

	if AssetID != nil {
		// Get specific Asset integrity summary
		query = `
			SELECT 
				equipment_id,
				Asset_name,
				tag_number,
				total_components,
				excellent_count,
				good_count,
				fair_count,
				poor_count,
				critical_count,
				safety_critical_count
			FROM v_asset_integrity_summary 
			WHERE tenant_id = $1 AND equipment_id = $2
		`
		args = []interface{}{tenantID, *AssetID}
	} else {
		// Get tenant-wide integrity summary (aggregated)
		query = `
			SELECT 
				0 as equipment_id,
				'All Asset' as Asset_name,
				'' as tag_number,
				SUM(total_components) as total_components,
				SUM(excellent_count) as excellent_count,
				SUM(good_count) as good_count,
				SUM(fair_count) as fair_count,
				SUM(poor_count) as poor_count,
				SUM(critical_count) as critical_count,
				SUM(safety_critical_count) as safety_critical_count
			FROM v_asset_integrity_summary 
			WHERE tenant_id = $1
		`
		args = []interface{}{tenantID}
	}

	var eqID int
	var eqName, tagNumber string
	var total, excellent, good, fair, poor, critical, safetyCritical int

	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&eqID, &eqName, &tagNumber, &total, &excellent, &good, &fair, &poor, &critical, &safetyCritical)
	if err != nil {
		if err == sql.ErrNoRows {
			// Return empty summary for Asset with no components
			return map[string]interface{}{
				"tenant_id":    tenantID,
				"asset_id": AssetID,
				"integrity_summary": map[string]int{
					"excellent": 0,
					"good":      0,
					"fair":      0,
					"poor":      0,
					"critical":  0,
				},
				"safety_critical_count": 0,
				"total_components":      0,
			}, nil
		}
		return nil, fmt.Errorf("failed to get integrity status summary: %w", err)
	}

	return map[string]interface{}{
		"tenant_id":      tenantID,
		"asset_id":   AssetID,
		"asset_name": eqName,
		"tag_number":     tagNumber,
		"integrity_summary": map[string]int{
			"excellent": excellent,
			"good":      good,
			"fair":      fair,
			"poor":      poor,
			"critical":  critical,
		},
		"safety_critical_count": safetyCritical,
		"total_components":      total,
		"generated_at":          time.Now(),
	}, nil
}

// GetInspectionDueAnalytics gets inspection due analytics using components table
func (r *analyticsRepository) GetInspectionDueAnalytics(ctx context.Context, tenantID int, daysAhead int) (map[string]interface{}, error) {
	// Query components with inspection due dates
	query := `
		SELECT 
			CASE 
				WHEN next_inspection_date < CURRENT_DATE THEN 'overdue'
				WHEN next_inspection_date <= CURRENT_DATE + INTERVAL '%d days' THEN 'due_soon'
				ELSE 'current'
			END as status,
			criticality,
			COUNT(*) as count
		FROM components c
		JOIN equipment e ON c.equipment_id = e.id
		WHERE c.tenant_id = $1 
		AND c.status = 'active'
		AND e.status = 'active'
		AND c.next_inspection_date IS NOT NULL
		GROUP BY 
			CASE 
				WHEN next_inspection_date < CURRENT_DATE THEN 'overdue'
				WHEN next_inspection_date <= CURRENT_DATE + INTERVAL '%d days' THEN 'due_soon'
				ELSE 'current'
			END,
			criticality
		ORDER BY status, criticality DESC
	`

	formattedQuery := fmt.Sprintf(query, daysAhead, daysAhead)

	rows, err := r.db.QueryContext(ctx, formattedQuery, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get inspection due analytics: %w", err)
	}
	defer rows.Close()

	inspections := map[string]int{
		"overdue":  0,
		"due_soon": 0,
		"current":  0,
		"future":   0,
	}

	byCriticality := map[string]int{
		"critical_overdue":  0,
		"high_overdue":      0,
		"critical_due_soon": 0,
		"high_due_soon":     0,
	}

	for rows.Next() {
		var status string
		var criticality sql.NullInt32
		var count int

		err := rows.Scan(&status, &criticality, &count)
		if err != nil {
			continue
		}

		inspections[status] += count

		// Track high-criticality items
		if criticality.Valid {
			if status == "overdue" {
				if criticality.Int32 == 5 {
					byCriticality["critical_overdue"] += count
				} else if criticality.Int32 == 4 {
					byCriticality["high_overdue"] += count
				}
			} else if status == "due_soon" {
				if criticality.Int32 == 5 {
					byCriticality["critical_due_soon"] += count
				} else if criticality.Int32 == 4 {
					byCriticality["high_due_soon"] += count
				}
			}
		}
	}

	return map[string]interface{}{
		"tenant_id":       tenantID,
		"analysis_period": daysAhead,
		"inspections":     inspections,
		"by_criticality":  byCriticality,
		"generated_at":    time.Now(),
	}, nil
}
