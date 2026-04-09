// platform/backend/app/models/request/analytics_request.go

package request

import (
	"time"
)

// AnalyticsQueryRequest represents a general analytics query
type AnalyticsQueryRequest struct {
	StartDate   *time.Time `json:"start_date,omitempty" form:"start_date"`
	EndDate     *time.Time `json:"end_date,omitempty" form:"end_date"`
	Granularity string     `json:"granularity,omitempty" form:"granularity" validate:"omitempty,oneof=hour day week month quarter year"`
	Timezone    string     `json:"timezone,omitempty" form:"timezone"`
	Filters     []Filter   `json:"filters,omitempty"`
	GroupBy     []string   `json:"group_by,omitempty" form:"group_by"`
	Limit       int        `json:"limit,omitempty" form:"limit" validate:"omitempty,min=1,max=1000"`
	Offset      int        `json:"offset,omitempty" form:"offset" validate:"omitempty,min=0"`
}

// Filter represents a query filter
type Filter struct {
	Field    string      `json:"field" validate:"required"`
	Operator string      `json:"operator" validate:"required,oneof=eq ne gt gte lt lte in nin like"`
	Value    interface{} `json:"value" validate:"required"`
}

// EventAnalyticsRequest for event-based analytics
type EventAnalyticsRequest struct {
	AnalyticsQueryRequest
	EventTypes []string `json:"event_types,omitempty" form:"event_types"`
	UserIDs    []int    `json:"user_ids,omitempty" form:"user_ids"`
	SessionID  string   `json:"session_id,omitempty" form:"session_id"`
}

// AggregationRequest for aggregated analytics
type AggregationRequest struct {
	AnalyticsQueryRequest
	AggregationType string   `json:"aggregation_type" validate:"required,oneof=count sum avg min max"`
	AggregateField  string   `json:"aggregate_field,omitempty"`
	Dimensions      []string `json:"dimensions,omitempty"`
}

// FunnelAnalyticsRequest for funnel analysis
type FunnelAnalyticsRequest struct {
	AnalyticsQueryRequest
	Steps []FunnelStep `json:"steps" validate:"required,min=2"`
}

// FunnelStep represents a step in funnel analysis
type FunnelStep struct {
	Name      string    `json:"name" validate:"required"`
	EventType string    `json:"event_type" validate:"required"`
	Filters   []Filter  `json:"filters,omitempty"`
	TimeLimit *Duration `json:"time_limit,omitempty"`
}

// Duration represents a time duration
type Duration struct {
	Value int    `json:"value" validate:"required,min=1"`
	Unit  string `json:"unit" validate:"required,oneof=second minute hour day week month"`
}

// UserSegmentRequest for user segmentation
type UserSegmentRequest struct {
	AnalyticsQueryRequest
	SegmentDefinition SegmentDefinition `json:"segment_definition" validate:"required"`
}

// SegmentDefinition defines user segment criteria
type SegmentDefinition struct {
	Name        string      `json:"name" validate:"required"`
	Description string      `json:"description,omitempty"`
	Criteria    []Criterion `json:"criteria" validate:"required,min=1"`
	Logic       string      `json:"logic" validate:"omitempty,oneof=and or"`
}

// Criterion represents a single segmentation criterion
type Criterion struct {
	Type      string      `json:"type" validate:"required,oneof=event property behavior"`
	Field     string      `json:"field" validate:"required"`
	Operator  string      `json:"operator" validate:"required"`
	Value     interface{} `json:"value" validate:"required"`
	TimeFrame *Duration   `json:"time_frame,omitempty"`
}

// RealtimeAnalyticsRequest for real-time analytics
type RealtimeAnalyticsRequest struct {
	Metrics    []string `json:"metrics" validate:"required" form:"metrics"`
	Interval   int      `json:"interval,omitempty" form:"interval" validate:"omitempty,min=1,max=300"`          // seconds
	TimeWindow int      `json:"time_window,omitempty" form:"time_window" validate:"omitempty,min=60,max=86400"` // seconds
}

// DashboardAnalyticsRequest for dashboard data
type DashboardAnalyticsRequest struct {
	DashboardID string   `json:"dashboard_id,omitempty" form:"dashboard_id"`
	Widgets     []string `json:"widgets,omitempty" form:"widgets"`
	RefreshRate int      `json:"refresh_rate,omitempty" form:"refresh_rate" validate:"omitempty,min=5,max=3600"` // seconds
}

// ComparisonAnalyticsRequest for period comparison
type ComparisonAnalyticsRequest struct {
	AnalyticsQueryRequest
	ComparisonPeriod string   `json:"comparison_period" validate:"required,oneof=previous_period previous_year same_period_last_year"`
	Metrics          []string `json:"metrics" validate:"required"`
}

// ValidationMethods

// ValidateAnalyticsQuery validates basic analytics query
func (r *AnalyticsQueryRequest) ValidateAnalyticsQuery() error {
	if r.StartDate != nil && r.EndDate != nil {
		if r.StartDate.After(*r.EndDate) {
			return NewValidationError("start_date", "Start date must be before end date")
		}
	}

	if r.Limit == 0 {
		r.Limit = 100 // Default limit
	}

	return nil
}

// ValidateEventAnalytics validates event analytics request
func (r *EventAnalyticsRequest) ValidateEventAnalytics() error {
	if err := r.ValidateAnalyticsQuery(); err != nil {
		return err
	}

	if len(r.EventTypes) == 0 {
		return NewValidationError("event_types", "At least one event type is required")
	}

	return nil
}

// ValidateAggregation validates aggregation request
func (r *AggregationRequest) ValidateAggregation() error {
	if err := r.ValidateAnalyticsQuery(); err != nil {
		return err
	}

	if r.AggregationType == "" {
		return NewValidationError("aggregation_type", "Aggregation type is required")
	}

	// For sum, avg, min, max we need an aggregate field
	if r.AggregationType != "count" && r.AggregateField == "" {
		return NewValidationError("aggregate_field", "Aggregate field is required for non-count aggregations")
	}

	return nil
}

// NewValidationError creates a new validation error
func NewValidationError(field, message string) error {
	return &ValidationError{
		Field:   field,
		Message: message,
	}
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e *ValidationError) Error() string {
	return e.Message
}
