// platform/backend/app/models/tenant_billing.go
package models

import (
	"time"
)

// TenantBilling represents billing information for a tenant
type TenantBilling struct {
	ID                int        `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantID          int        `gorm:"index;not null" json:"tenant_id"`
	SubscriptionPlan  string     `gorm:"size:50;default:basic" json:"subscription_plan"`
	BillingCycle      string     `gorm:"size:20;default:monthly" json:"billing_cycle"`
	BillingEmail      string     `gorm:"size:255" json:"billing_email"`
	BillingAddress    *string    `gorm:"type:jsonb" json:"billing_address"` // Changed to *string for consistency
	SubscriptionStart time.Time  `json:"subscription_start"`                // Required field, not pointer
	SubscriptionEnd   *time.Time `json:"subscription_end,omitempty"`
	TrialEnd          *time.Time `json:"trial_end,omitempty"`
	PaymentMethod     *string    `gorm:"type:jsonb" json:"payment_method"` // Changed to *string for consistency
	BillingStatus     string     `gorm:"size:20;default:active" json:"billing_status"`
	CreatedAt         time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Tenant *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// Table name
func (TenantBilling) TableName() string {
	return "tenant_billing"
}

// Billing status constants
const (
	BillingStatusActive    = "active"
	BillingStatusTrialEnd  = "trial_ended"
	BillingStatusSuspended = "suspended"
	BillingStatusCanceled  = "canceled"
	BillingStatusPastDue   = "past_due"
)

// Helper methods
func (tb *TenantBilling) IsActive() bool {
	return tb.BillingStatus == BillingStatusActive
}

func (tb *TenantBilling) IsTrialExpired() bool {
	return tb.TrialEnd != nil && time.Now().After(*tb.TrialEnd)
}

func (tb *TenantBilling) IsSubscriptionExpired() bool {
	return tb.SubscriptionEnd != nil && time.Now().After(*tb.SubscriptionEnd)
}

func (tb *TenantBilling) GetDefaultBilling() *TenantBilling {
	now := time.Now()
	return &TenantBilling{
		SubscriptionPlan:  "basic",
		BillingCycle:      "monthly",
		BillingStatus:     BillingStatusActive,
		SubscriptionStart: now,
		BillingAddress:    nil,
		PaymentMethod:     nil,
	}
}
