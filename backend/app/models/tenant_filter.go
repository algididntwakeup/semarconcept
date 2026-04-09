// platform/backend/app/models/tenant_filter.go
package models

import (
	"time"
)

// TenantFilter represents filter criteria for tenant searches
type TenantFilter struct {
	Search           string     `json:"search,omitempty"`
	Status           *string    `json:"status,omitempty"`
	SubscriptionPlan *string    `json:"subscription_plan,omitempty"`
	HasCustomDomain  *bool      `json:"has_custom_domain,omitempty"`
	CreatedAfter     *time.Time `json:"created_after,omitempty"`
	CreatedBefore    *time.Time `json:"created_before,omitempty"`
	MinUsers         *int       `json:"min_users,omitempty"`
	MaxUsers         *int       `json:"max_users,omitempty"`
	IsActive         *bool      `json:"is_active,omitempty"`
	IsTrial          *bool      `json:"is_trial,omitempty"`
	MinStorageGB     *float64   `json:"min_storage_gb,omitempty"`
	MaxStorageGB     *float64   `json:"max_storage_gb,omitempty"`
}

// BuildWhereClause builds SQL WHERE conditions from filter
func (tf *TenantFilter) BuildWhereClause() (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if tf.Search != "" {
		conditions = append(conditions, "(name ILIKE ? OR subdomain ILIKE ? OR domain ILIKE ?)")
		searchPattern := "%" + tf.Search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
	}

	if tf.Status != nil {
		conditions = append(conditions, "status = ?")
		args = append(args, *tf.Status)
	}

	if tf.SubscriptionPlan != nil {
		conditions = append(conditions, "subscription_plan = ?")
		args = append(args, *tf.SubscriptionPlan)
	}

	if tf.HasCustomDomain != nil {
		if *tf.HasCustomDomain {
			conditions = append(conditions, "domain IS NOT NULL AND domain != ''")
		} else {
			conditions = append(conditions, "(domain IS NULL OR domain = '')")
		}
	}

	if tf.CreatedAfter != nil {
		conditions = append(conditions, "created_at >= ?")
		args = append(args, *tf.CreatedAfter)
	}

	if tf.CreatedBefore != nil {
		conditions = append(conditions, "created_at <= ?")
		args = append(args, *tf.CreatedBefore)
	}

	if tf.MinUsers != nil {
		conditions = append(conditions, "max_users >= ?")
		args = append(args, *tf.MinUsers)
	}

	if tf.MaxUsers != nil {
		conditions = append(conditions, "max_users <= ?")
		args = append(args, *tf.MaxUsers)
	}

	if tf.IsActive != nil {
		if *tf.IsActive {
			conditions = append(conditions, "status = 'active'")
		} else {
			conditions = append(conditions, "status != 'active'")
		}
	}

	if tf.MinStorageGB != nil {
		conditions = append(conditions, "max_storage_gb >= ?")
		args = append(args, *tf.MinStorageGB)
	}

	if tf.MaxStorageGB != nil {
		conditions = append(conditions, "max_storage_gb <= ?")
		args = append(args, *tf.MaxStorageGB)
	}

	if len(conditions) == 0 {
		return "", args
	}

	whereClause := ""
	for i, condition := range conditions {
		if i == 0 {
			whereClause = condition
		} else {
			whereClause += " AND " + condition
		}
	}

	return whereClause, args
}

// IsEmpty checks if the filter has any conditions
func (tf *TenantFilter) IsEmpty() bool {
	return tf.Search == "" &&
		tf.Status == nil &&
		tf.SubscriptionPlan == nil &&
		tf.HasCustomDomain == nil &&
		tf.CreatedAfter == nil &&
		tf.CreatedBefore == nil &&
		tf.MinUsers == nil &&
		tf.MaxUsers == nil &&
		tf.IsActive == nil &&
		tf.IsTrial == nil &&
		tf.MinStorageGB == nil &&
		tf.MaxStorageGB == nil
}

// ApplyDefaults sets default values for the filter
func (tf *TenantFilter) ApplyDefaults() {
	// Apply any default filtering logic here
	// For example, exclude deleted tenants by default
	if tf.Status == nil && tf.IsActive == nil {
		activeStatus := "active"
		tf.Status = &activeStatus
	}
}
