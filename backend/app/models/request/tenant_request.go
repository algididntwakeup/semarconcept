// platform/backend/app/models/request/tenant_request.go
package request

import (
	"time"
)

// CreateTenantRequest represents the request to create a new tenant
type CreateTenantRequest struct {
	Name             string                 `json:"name" validate:"required,min=2,max=100"`
	Subdomain        string                 `json:"subdomain" validate:"required,min=3,max=50,alphanum"`
	Domain           *string                `json:"domain,omitempty" validate:"omitempty,fqdn"`
	SubscriptionPlan string                 `json:"subscription_plan" validate:"required,oneof=basic premium enterprise"`
	MaxUsers         *int                   `json:"max_users,omitempty" validate:"omitempty,min=1,max=10000"`
	MaxStorageGB     *int                   `json:"max_storage_gb,omitempty" validate:"omitempty,min=1,max=1000"`
	Settings         map[string]interface{} `json:"settings,omitempty"`
	Metadata         map[string]interface{} `json:"metadata,omitempty"`

	// Admin user details
	AdminFirstName string `json:"admin_first_name" validate:"required,min=1,max=100"`
	AdminLastName  string `json:"admin_last_name" validate:"required,min=1,max=100"`
	AdminEmail     string `json:"admin_email" validate:"required,email"`
	AdminPassword  string `json:"admin_password" validate:"required,min=8"`

	// Branding (optional)
	Branding *CreateTenantBrandingRequest `json:"branding,omitempty"`

	// Billing (optional)
	Billing *CreateTenantBillingRequest `json:"billing,omitempty"`
}

// UpdateTenantRequest represents the request to update a tenant
type UpdateTenantRequest struct {
	Name             *string                `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Subdomain        *string                `json:"subdomain,omitempty" validate:"omitempty,min=3,max=50,alphanum"`
	Domain           *string                `json:"domain,omitempty" validate:"omitempty,fqdn"`
	Status           *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive suspended"`
	SubscriptionPlan *string                `json:"subscription_plan,omitempty" validate:"omitempty,oneof=basic premium enterprise"`
	MaxUsers         *int                   `json:"max_users,omitempty" validate:"omitempty,min=1,max=10000"`
	MaxStorageGB     *int                   `json:"max_storage_gb,omitempty" validate:"omitempty,min=1,max=1000"`
	Settings         map[string]interface{} `json:"settings,omitempty"`
	Metadata         map[string]interface{} `json:"metadata,omitempty"`
}

// CreateTenantBrandingRequest represents the request to create tenant branding
type CreateTenantBrandingRequest struct {
	CompanyName     *string                `json:"company_name,omitempty" validate:"omitempty,max=100"`
	LogoURL         *string                `json:"logo_url,omitempty" validate:"omitempty,url"`
	FaviconURL      *string                `json:"favicon_url,omitempty" validate:"omitempty,url"`
	PrimaryColor    *string                `json:"primary_color,omitempty" validate:"omitempty,hexcolor"`
	SecondaryColor  *string                `json:"secondary_color,omitempty" validate:"omitempty,hexcolor"`
	AccentColor     *string                `json:"accent_color,omitempty" validate:"omitempty,hexcolor"`
	BackgroundColor *string                `json:"background_color,omitempty" validate:"omitempty,hexcolor"`
	Theme           *string                `json:"theme,omitempty" validate:"omitempty,oneof=light dark auto"`
	CustomCSS       *string                `json:"custom_css,omitempty"`
	EmailTemplate   map[string]interface{} `json:"email_template,omitempty"`
}

// UpdateTenantBrandingRequest represents the request to update tenant branding
type UpdateTenantBrandingRequest struct {
	CompanyName     *string                `json:"company_name,omitempty" validate:"omitempty,max=100"`
	LogoURL         *string                `json:"logo_url,omitempty" validate:"omitempty,url"`
	FaviconURL      *string                `json:"favicon_url,omitempty" validate:"omitempty,url"`
	PrimaryColor    *string                `json:"primary_color,omitempty" validate:"omitempty,hexcolor"`
	SecondaryColor  *string                `json:"secondary_color,omitempty" validate:"omitempty,hexcolor"`
	AccentColor     *string                `json:"accent_color,omitempty" validate:"omitempty,hexcolor"`
	BackgroundColor *string                `json:"background_color,omitempty" validate:"omitempty,hexcolor"`
	Theme           *string                `json:"theme,omitempty" validate:"omitempty,oneof=light dark auto"`
	CustomCSS       *string                `json:"custom_css,omitempty"`
	EmailTemplate   map[string]interface{} `json:"email_template,omitempty"`
}

// CreateTenantBillingRequest represents the request to create tenant billing
type CreateTenantBillingRequest struct {
	SubscriptionPlan  string                 `json:"subscription_plan" validate:"required,oneof=basic premium enterprise"`
	BillingCycle      string                 `json:"billing_cycle" validate:"required,oneof=monthly yearly"`
	BillingEmail      *string                `json:"billing_email,omitempty" validate:"omitempty,email"`
	BillingAddress    map[string]interface{} `json:"billing_address,omitempty"`
	SubscriptionStart *time.Time             `json:"subscription_start,omitempty"`
	SubscriptionEnd   *time.Time             `json:"subscription_end,omitempty"`
	TrialEnd          *time.Time             `json:"trial_end,omitempty"`
	PaymentMethod     map[string]interface{} `json:"payment_method,omitempty"`
}

// UpdateTenantBillingRequest represents the request to update tenant billing
type UpdateTenantBillingRequest struct {
	SubscriptionPlan  *string                `json:"subscription_plan,omitempty" validate:"omitempty,oneof=basic premium enterprise"`
	BillingCycle      *string                `json:"billing_cycle,omitempty" validate:"omitempty,oneof=monthly yearly"`
	BillingEmail      *string                `json:"billing_email,omitempty" validate:"omitempty,email"`
	BillingAddress    map[string]interface{} `json:"billing_address,omitempty"`
	SubscriptionStart *time.Time             `json:"subscription_start,omitempty"`
	SubscriptionEnd   *time.Time             `json:"subscription_end,omitempty"`
	TrialEnd          *time.Time             `json:"trial_end,omitempty"`
	PaymentMethod     map[string]interface{} `json:"payment_method,omitempty"`
	BillingStatus     *string                `json:"billing_status,omitempty" validate:"omitempty,oneof=active inactive overdue suspended"`
}

// TenantConfigRequest represents the request to create/update tenant configuration
type TenantConfigRequest struct {
	ConfigKey   string `json:"config_key" validate:"required,min=1,max=100"`
	ConfigValue string `json:"config_value" validate:"required"`
	DataType    string `json:"data_type" validate:"required,oneof=string integer float boolean json"`
	Category    string `json:"category" validate:"required,max=50"`
}

// InviteTenantUserRequest represents the request to invite a user to a tenant
type InviteTenantUserRequest struct {
	Email       string                 `json:"email" validate:"required,email"`
	Role        string                 `json:"role" validate:"required,min=1,max=50"`
	Permissions map[string]interface{} `json:"permissions,omitempty"`
	Message     *string                `json:"message,omitempty" validate:"omitempty,max=500"`
}

// UpdateTenantUserRequest represents the request to update a tenant user
type UpdateTenantUserRequest struct {
	Role        *string                `json:"role,omitempty" validate:"omitempty,min=1,max=50"`
	Status      *string                `json:"status,omitempty" validate:"omitempty,oneof=active inactive suspended"`
	Permissions map[string]interface{} `json:"permissions,omitempty"`
}

// TenantListRequest represents the request parameters for listing tenants
type TenantListRequest struct {
	Page             int    `json:"page" form:"page" validate:"min=1"`
	PerPage          int    `json:"per_page" form:"per_page" validate:"min=1,max=100"`
	Search           string `json:"search" form:"search"`
	Status           string `json:"status" form:"status" validate:"omitempty,oneof=active inactive suspended"`
	SubscriptionPlan string `json:"subscription_plan" form:"subscription_plan" validate:"omitempty,oneof=basic premium enterprise"`
	SortBy           string `json:"sort_by" form:"sort_by" validate:"omitempty,oneof=name created_at updated_at"`
	SortOrder        string `json:"sort_order" form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

// TenantUserListRequest represents the request parameters for listing tenant users
type TenantUserListRequest struct {
	Page      int    `json:"page" form:"page" validate:"min=1"`
	PerPage   int    `json:"per_page" form:"per_page" validate:"min=1,max=100"`
	Search    string `json:"search" form:"search"`
	Role      string `json:"role" form:"role"`
	Status    string `json:"status" form:"status" validate:"omitempty,oneof=active inactive suspended"`
	SortBy    string `json:"sort_by" form:"sort_by" validate:"omitempty,oneof=joined_at last_activity"`
	SortOrder string `json:"sort_order" form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

// SuspendTenantRequest represents the request to suspend a tenant
type SuspendTenantRequest struct {
	Reason    string     `json:"reason" validate:"required,min=10,max=500"`
	Duration  *int       `json:"duration,omitempty" validate:"omitempty,min=1,max=365"` // Days
	UntilDate *time.Time `json:"until_date,omitempty"`
}

// RestoreTenantRequest represents the request to restore a suspended tenant
type RestoreTenantRequest struct {
	Reason string `json:"reason" validate:"required,min=10,max=500"`
}

// TenantStatsRequest represents the request parameters for tenant statistics
type TenantStatsRequest struct {
	Period    string     `json:"period" form:"period" validate:"omitempty,oneof=day week month quarter year"`
	StartDate *time.Time `json:"start_date" form:"start_date"`
	EndDate   *time.Time `json:"end_date" form:"end_date"`
	Metrics   []string   `json:"metrics" form:"metrics"`
}

// TransferTenantOwnershipRequest represents the request to transfer tenant ownership
type TransferTenantOwnershipRequest struct {
	NewOwnerEmail   string `json:"new_owner_email" validate:"required,email"`
	TransferReason  string `json:"transfer_reason" validate:"required,min=10,max=500"`
	ConfirmTransfer bool   `json:"confirm_transfer" validate:"required"`
}

// TenantBackupRequest represents the request to create a tenant backup
type TenantBackupRequest struct {
	BackupType   string   `json:"backup_type" validate:"required,oneof=full incremental"`
	IncludeData  bool     `json:"include_data"`
	IncludeMedia bool     `json:"include_media"`
	Compression  bool     `json:"compression"`
	Encryption   bool     `json:"encryption"`
	Components   []string `json:"components,omitempty"` // Which components to backup
}

// TenantRestoreRequest represents the request to restore a tenant from backup
type TenantRestoreRequest struct {
	BackupID       string   `json:"backup_id" validate:"required"`
	RestoreType    string   `json:"restore_type" validate:"required,oneof=full selective"`
	Components     []string `json:"components,omitempty"`
	OverwriteData  bool     `json:"overwrite_data"`
	OverwriteMedia bool     `json:"overwrite_media"`
}

// BulkTenantOperationRequest represents a request for bulk operations on tenants
type BulkTenantOperationRequest struct {
	TenantIDs []int  `json:"tenant_ids" validate:"required,min=1,max=100"`
	Operation string `json:"operation" validate:"required,oneof=activate suspend delete export"`
	Reason    string `json:"reason" validate:"required,min=10,max=500"`
}

// TenantMigrationRequest represents a request to migrate tenant data
type TenantMigrationRequest struct {
	SourceTenantID      int                    `json:"source_tenant_id" validate:"required"`
	DestinationTenantID int                    `json:"destination_tenant_id" validate:"required"`
	MigrationType       string                 `json:"migration_type" validate:"required,oneof=copy move merge"`
	Components          []string               `json:"components,omitempty"`
	Mapping             map[string]interface{} `json:"mapping,omitempty"`
	PreserveSources     bool                   `json:"preserve_sources"`
}

// === ALIASES FOR SERVICE COMPATIBILITY ===

// TenantListQuery represents query parameters for listing tenants (alias for compatibility)
type TenantListQuery struct {
	Page             int    `json:"page" form:"page" validate:"min=1"`
	Limit            int    `json:"limit" form:"limit" validate:"min=1,max=100"`
	Search           string `json:"search" form:"search"`
	Status           string `json:"status" form:"status" validate:"omitempty,oneof=active inactive suspended"`
	SubscriptionPlan string `json:"subscription_plan" form:"subscription_plan" validate:"omitempty,oneof=basic premium enterprise"`
}

// UpdateTenantConfigRequest represents the request to update tenant configuration
type UpdateTenantConfigRequest struct {
	Settings map[string]interface{} `json:"settings" validate:"required"`
}

// AddUserToTenantRequest represents the request to add a user to a tenant
type AddUserToTenantRequest struct {
	TenantID    int                    `json:"tenant_id" validate:"required"`
	UserID      int                    `json:"user_id" validate:"required"`
	Role        string                 `json:"role" validate:"required"`
	Permissions map[string]interface{} `json:"permissions,omitempty"`
}

// TenantUserListQuery represents query parameters for listing tenant users (alias for compatibility)
type TenantUserListQuery struct {
	Page   int    `json:"page" form:"page" validate:"min=1"`
	Limit  int    `json:"limit" form:"limit" validate:"min=1,max=100"`
	Search string `json:"search" form:"search"`
	Role   string `json:"role" form:"role"`
	Status string `json:"status" form:"status" validate:"omitempty,oneof=active inactive suspended"`
}

// InviteUserToTenantRequest represents the request to invite a user to a tenant (alias for compatibility)
type InviteUserToTenantRequest struct {
	TenantID int    `json:"tenant_id" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Role     string `json:"role" validate:"required,min=1,max=50"`
}

// BulkUpdateTenantStatusRequest represents the request to bulk update tenant status (alias for compatibility)
type BulkUpdateTenantStatusRequest struct {
	TenantIDs []int  `json:"tenant_ids" validate:"required,min=1,max=100"`
	Status    string `json:"status" validate:"required,oneof=active inactive suspended"`
	Reason    string `json:"reason" validate:"required,min=10,max=500"`
}
