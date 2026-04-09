// platform/backend/app/models/response/tenant_responses.go
package response

import (
	"time"
)

// TenantResponse represents a tenant in API responses
type TenantResponse struct {
	ID               int                     `json:"id"`
	Name             string                  `json:"name"`
	Subdomain        string                  `json:"subdomain"`
	Domain           *string                 `json:"domain,omitempty"`
	Slug             string                  `json:"slug"`
	Status           string                  `json:"status"`
	SubscriptionPlan string                  `json:"subscription_plan"`
	MaxUsers         int                     `json:"max_users"`
	MaxStorageGB     int                     `json:"max_storage_gb"`
	Settings         map[string]interface{}  `json:"settings,omitempty"`
	Metadata         map[string]interface{}  `json:"metadata,omitempty"`
	CreatedAt        time.Time               `json:"created_at"`
	UpdatedAt        time.Time               `json:"updated_at"`
	CreatedBy        *int                    `json:"created_by,omitempty"`
	UpdatedBy        *int                    `json:"updated_by,omitempty"`
	Branding         *TenantBrandingResponse `json:"branding,omitempty"`
	Billing          *TenantBillingResponse  `json:"billing,omitempty"`
}

// TenantBrandingResponse represents tenant branding information
type TenantBrandingResponse struct {
	ID              int                    `json:"id"`
	TenantID        int                    `json:"tenant_id"`
	CompanyName     *string                `json:"company_name,omitempty"`
	LogoURL         *string                `json:"logo_url,omitempty"`
	FaviconURL      *string                `json:"favicon_url,omitempty"`
	PrimaryColor    *string                `json:"primary_color,omitempty"`
	SecondaryColor  *string                `json:"secondary_color,omitempty"`
	AccentColor     *string                `json:"accent_color,omitempty"`
	BackgroundColor *string                `json:"background_color,omitempty"`
	Theme           *string                `json:"theme,omitempty"`
	CustomCSS       *string                `json:"custom_css,omitempty"`
	EmailTemplate   map[string]interface{} `json:"email_template,omitempty"`
	CreatedAt       time.Time              `json:"created_at"`
	UpdatedAt       time.Time              `json:"updated_at"`
}

// TenantBillingResponse represents tenant billing information
type TenantBillingResponse struct {
	ID                int                    `json:"id"`
	TenantID          int                    `json:"tenant_id"`
	SubscriptionPlan  string                 `json:"subscription_plan"`
	BillingCycle      string                 `json:"billing_cycle"`
	BillingEmail      *string                `json:"billing_email,omitempty"`
	BillingAddress    map[string]interface{} `json:"billing_address,omitempty"`
	SubscriptionStart *time.Time             `json:"subscription_start,omitempty"`
	SubscriptionEnd   *time.Time             `json:"subscription_end,omitempty"`
	TrialEnd          *time.Time             `json:"trial_end,omitempty"`
	PaymentMethod     map[string]interface{} `json:"payment_method,omitempty"`
	BillingStatus     string                 `json:"billing_status"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

// TenantConfigResponse represents tenant configuration
type TenantConfigResponse struct {
	TenantID int                    `json:"tenant_id"`
	Settings map[string]interface{} `json:"settings"`
}

// TenantUserResponse represents a user within a tenant context
type TenantUserResponse struct {
	ID           int                    `json:"id"`
	TenantID     int                    `json:"tenant_id"`
	UserID       int                    `json:"user_id"`
	Role         string                 `json:"role"`
	Status       string                 `json:"status"`
	Permissions  map[string]interface{} `json:"permissions,omitempty"`
	JoinedAt     time.Time              `json:"joined_at"`
	InvitedAt    *time.Time             `json:"invited_at,omitempty"`
	InvitedBy    *int                   `json:"invited_by,omitempty"`
	LastActivity *time.Time             `json:"last_activity,omitempty"`
	// User details embedded
	User *UserResponse `json:"user,omitempty"`
}

// TenantStatsResponse represents tenant statistics
type TenantStatsResponse struct {
	TenantID           int        `json:"tenant_id"`
	UserCount          int        `json:"user_count"`
	ActiveUserCount    int        `json:"active_user_count"`
	StorageUsedGB      float64    `json:"storage_used_gb"`
	StorageUtilization float64    `json:"storage_utilization"`
	AssetCount         int        `json:"asset_count"`
	InspectionCount    int        `json:"inspection_count"`
	WorkOrderCount     int        `json:"work_order_count"`
	LastActivity       *time.Time `json:"last_activity,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
}

// TenantListResponse represents a paginated list of tenants
type TenantListResponse struct {
	Tenants []TenantResponse `json:"tenants"`
	Total   int64            `json:"total"`
	Page    int              `json:"page"`
	Limit   int              `json:"limit"`
}

// TenantUserListResponse represents a list of tenant users
type TenantUserListResponse struct {
	Users []TenantUserResponse `json:"users"`
	Total int64                `json:"total"`
	Page  int                  `json:"page"`
	Limit int                  `json:"limit"`
}

// SystemStatsResponse represents system-wide statistics
type SystemStatsResponse struct {
	TotalTenants            int       `json:"total_tenants"`
	ActiveTenants           int       `json:"active_tenants"`
	TotalUsers              int       `json:"total_users"`
	ActiveUsers             int       `json:"active_users"`
	TotalStorageGB          float64   `json:"total_storage_gb"`
	AverageStoragePerTenant float64   `json:"average_storage_per_tenant"`
	CalculatedAt            time.Time `json:"calculated_at"`
}

// TenantResourceUsageResponse represents tenant resource usage
type TenantResourceUsageResponse struct {
	TenantID int                    `json:"tenant_id"`
	Usage    map[string]interface{} `json:"usage"`
}

// TenantInvitationResponse represents a tenant invitation
type TenantInvitationResponse struct {
	ID        int       `json:"id"`
	TenantID  int       `json:"tenant_id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	Token     string    `json:"token,omitempty"`
	ExpiresAt time.Time `json:"expires_at"`
	InvitedBy int       `json:"invited_by"`
	CreatedAt time.Time `json:"created_at"`
	// Tenant details
	Tenant *TenantResponse `json:"tenant,omitempty"`
}

// AvailabilityCheckResponse represents the response for checking tenant subdomain availability
type AvailabilityCheckResponse struct {
	Available bool   `json:"available" example:"true"`
	Subdomain string `json:"subdomain" example:"mycompany"`
	Message   string `json:"message,omitempty" example:"Subdomain is available"`
}
