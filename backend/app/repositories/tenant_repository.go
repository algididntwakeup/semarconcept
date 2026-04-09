// backend/app/repositories/tenant_repository.go
package repositories

import (
	"backend/app/models"
	"backend/app/utils"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

// tenantRepository implements the TenantRepository interface
type tenantRepository struct {
	db *gorm.DB
}

// NewTenantRepository creates a new tenant repository instance
func NewTenantRepository(db *gorm.DB) TenantRepository {
	return &tenantRepository{db: db}
}

// Create creates a new tenant with default settings and branding
func (r *tenantRepository) Create(ctx context.Context, tenant *models.Tenant) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Set default settings if not provided
		if tenant.Settings == nil {
			defaultSettings := models.GetDefaultTenantSettings()
			tenant.Settings = &defaultSettings
		}

		// Create the tenant
		if err := tx.Create(tenant).Error; err != nil {
			return fmt.Errorf("failed to create tenant: %w", err)
		}

		// Create default branding - FIXED: Use actual TenantBranding fields
		branding := &models.TenantBranding{
			TenantID:        tenant.ID,
			CompanyName:     tenant.Name,
			PrimaryColor:    "#1976D2",
			SecondaryColor:  "#FF5722",
			AccentColor:     "#4CAF50",
			BackgroundColor: "#FFFFFF",
			Theme:           "light",
		}
		if err := tx.Create(branding).Error; err != nil {
			return fmt.Errorf("failed to create tenant branding: %w", err)
		}

		// Create default billing record - FIXED: Use actual TenantBilling fields
		billing := &models.TenantBilling{
			TenantID:         tenant.ID,
			SubscriptionPlan: "basic",
			BillingCycle:     "monthly",
			BillingStatus:    "active",
		}
		if err := tx.Create(billing).Error; err != nil {
			return fmt.Errorf("failed to create tenant billing: %w", err)
		}

		return nil
	})
}

// FindByID finds a tenant by ID with all associations
func (r *tenantRepository) FindByID(ctx context.Context, id int) (*models.Tenant, error) {
	var tenant models.Tenant
	err := r.db.WithContext(ctx).
		First(&tenant, id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrTenantNotFound
		}
		return nil, fmt.Errorf("failed to find tenant by ID: %w", err)
	}

	return &tenant, nil
}

// FindBySubdomain finds a tenant by subdomain
func (r *tenantRepository) FindBySubdomain(ctx context.Context, subdomain string) (*models.Tenant, error) {
	var tenant models.Tenant
	err := r.db.WithContext(ctx).
		Where("subdomain = ? AND status != ?", strings.ToLower(subdomain), models.TenantStatusDeleted).
		First(&tenant).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrTenantNotFound
		}
		return nil, fmt.Errorf("failed to find tenant by subdomain: %w", err)
	}

	return &tenant, nil
}

// FindByDomain finds a tenant by custom domain
func (r *tenantRepository) FindByDomain(ctx context.Context, domain string) (*models.Tenant, error) {
	var tenant models.Tenant

	// Query branding table for custom domain since Tenant model doesn't have Domain field
	var branding models.TenantBranding
	err := r.db.WithContext(ctx).
		Where("LOWER(company_name) = ? OR LOWER(logo_url) LIKE ?",
			strings.ToLower(domain), "%"+strings.ToLower(domain)+"%").
		First(&branding).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrTenantNotFound
		}
		return nil, fmt.Errorf("failed to find tenant by domain: %w", err)
	}

	// Get the tenant
	err = r.db.WithContext(ctx).
		Where("id = ? AND status != ?", branding.TenantID, models.TenantStatusDeleted).
		First(&tenant).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrTenantNotFound
		}
		return nil, fmt.Errorf("failed to find tenant by domain: %w", err)
	}

	return &tenant, nil
}

// Update updates an existing tenant
func (r *tenantRepository) Update(ctx context.Context, tenant *models.Tenant) error {
	result := r.db.WithContext(ctx).Save(tenant)
	if result.Error != nil {
		return fmt.Errorf("failed to update tenant: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrTenantNotFound
	}

	return nil
}

// Delete soft deletes a tenant by setting status to deleted
func (r *tenantRepository) Delete(ctx context.Context, id int) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update tenant status to deleted
		result := tx.Model(&models.Tenant{}).
			Where("id = ?", id).
			Update("status", models.TenantStatusDeleted)

		if result.Error != nil {
			return fmt.Errorf("failed to delete tenant: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return utils.ErrTenantNotFound
		}

		return nil
	})
}

// List returns a paginated list of tenants
func (r *tenantRepository) List(ctx context.Context, limit, offset int) ([]models.Tenant, int64, error) {
	var tenants []models.Tenant
	var total int64

	// Count total records
	if err := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("status != ?", models.TenantStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count tenants: %w", err)
	}

	// Get paginated results
	err := r.db.WithContext(ctx).
		Where("status != ?", models.TenantStatusDeleted).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tenants).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to list tenants: %w", err)
	}

	return tenants, total, nil
}

// Activate activates a tenant
func (r *tenantRepository) Activate(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("id = ?", id).
		Update("status", models.TenantStatusActive)

	if result.Error != nil {
		return fmt.Errorf("failed to activate tenant: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrTenantNotFound
	}

	return nil
}

// Deactivate deactivates a tenant
func (r *tenantRepository) Deactivate(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("id = ?", id).
		Update("status", models.TenantStatusInactive)

	if result.Error != nil {
		return fmt.Errorf("failed to deactivate tenant: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrTenantNotFound
	}

	return nil
}

// Suspend suspends a tenant
func (r *tenantRepository) Suspend(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("id = ?", id).
		Update("status", models.TenantStatusSuspended)

	if result.Error != nil {
		return fmt.Errorf("failed to suspend tenant: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrTenantNotFound
	}

	return nil
}

// GetActiveTenantsCount returns the count of active tenants
func (r *tenantRepository) GetActiveTenantsCount(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("status = ?", models.TenantStatusActive).
		Count(&count).Error

	if err != nil {
		return 0, fmt.Errorf("failed to count active tenants: %w", err)
	}

	return count, nil
}

// UpdateConfig updates tenant configuration
func (r *tenantRepository) UpdateConfig(ctx context.Context, tenantID int, config map[string]interface{}) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Get existing tenant
		var tenant models.Tenant
		if err := tx.First(&tenant, tenantID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return utils.ErrTenantNotFound
			}
			return fmt.Errorf("failed to find tenant: %w", err)
		}

		// Parse existing settings from *string to map
		var settings map[string]interface{}
		if tenant.Settings != nil && *tenant.Settings != "" {
			if err := json.Unmarshal([]byte(*tenant.Settings), &settings); err != nil {
				settings = make(map[string]interface{})
			}
		} else {
			settings = make(map[string]interface{})
		}

		// Update settings
		for key, value := range config {
			settings[key] = value
		}

		// Convert back to JSON string
		settingsJSON, err := json.Marshal(settings)
		if err != nil {
			return fmt.Errorf("failed to marshal settings: %w", err)
		}
		settingsStr := string(settingsJSON)
		tenant.Settings = &settingsStr

		// Save tenant
		if err := tx.Save(&tenant).Error; err != nil {
			return fmt.Errorf("failed to update tenant config: %w", err)
		}

		return nil
	})
}

// GetConfig gets tenant configuration
func (r *tenantRepository) GetConfig(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	var tenant models.Tenant
	err := r.db.WithContext(ctx).First(&tenant, tenantID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrTenantNotFound
		}
		return nil, fmt.Errorf("failed to find tenant: %w", err)
	}

	// Parse *string to map[string]interface{}
	if tenant.Settings == nil || *tenant.Settings == "" {
		return make(map[string]interface{}), nil
	}

	var settings map[string]interface{}
	if err := json.Unmarshal([]byte(*tenant.Settings), &settings); err != nil {
		return nil, fmt.Errorf("failed to parse tenant settings: %w", err)
	}

	return settings, nil
}

// SetConfigValue sets a specific configuration value
func (r *tenantRepository) SetConfigValue(ctx context.Context, tenantID int, key string, value interface{}) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var tenant models.Tenant
		if err := tx.First(&tenant, tenantID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return utils.ErrTenantNotFound
			}
			return fmt.Errorf("failed to find tenant: %w", err)
		}

		// Parse existing settings
		var settings map[string]interface{}
		if tenant.Settings != nil && *tenant.Settings != "" {
			if err := json.Unmarshal([]byte(*tenant.Settings), &settings); err != nil {
				settings = make(map[string]interface{})
			}
		} else {
			settings = make(map[string]interface{})
		}

		settings[key] = value

		// Convert back to JSON string
		settingsJSON, err := json.Marshal(settings)
		if err != nil {
			return fmt.Errorf("failed to marshal settings: %w", err)
		}
		settingsStr := string(settingsJSON)
		tenant.Settings = &settingsStr

		if err := tx.Save(&tenant).Error; err != nil {
			return fmt.Errorf("failed to update tenant config: %w", err)
		}

		return nil
	})
}

// GetConfigValue gets a specific configuration value
func (r *tenantRepository) GetConfigValue(ctx context.Context, tenantID int, key string) (interface{}, error) {
	config, err := r.GetConfig(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	return config[key], nil
}

// UpdateBranding updates tenant branding
func (r *tenantRepository) UpdateBranding(ctx context.Context, branding *models.TenantBranding) error {
	var existingBranding models.TenantBranding
	err := r.db.WithContext(ctx).Where("tenant_id = ?", branding.TenantID).First(&existingBranding).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new branding
			if err := r.db.WithContext(ctx).Create(branding).Error; err != nil {
				return fmt.Errorf("failed to create tenant branding: %w", err)
			}
			return nil
		}
		return fmt.Errorf("failed to find existing branding: %w", err)
	}

	// Update existing branding
	branding.ID = existingBranding.ID
	if err := r.db.WithContext(ctx).Save(branding).Error; err != nil {
		return fmt.Errorf("failed to update tenant branding: %w", err)
	}

	return nil
}

// GetBranding gets tenant branding
func (r *tenantRepository) GetBranding(ctx context.Context, tenantID int) (*models.TenantBranding, error) {
	var branding models.TenantBranding
	err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).First(&branding).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrBrandingNotFound
		}
		return nil, fmt.Errorf("failed to find tenant branding: %w", err)
	}

	return &branding, nil
}

// DeleteBranding deletes tenant branding
func (r *tenantRepository) DeleteBranding(ctx context.Context, tenantID int) error {
	result := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Delete(&models.TenantBranding{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete tenant branding: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrBrandingNotFound
	}

	return nil
}

// UpdateBilling updates tenant billing
func (r *tenantRepository) UpdateBilling(ctx context.Context, billing *models.TenantBilling) error {
	var existingBilling models.TenantBilling
	err := r.db.WithContext(ctx).Where("tenant_id = ?", billing.TenantID).First(&existingBilling).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new billing
			if err := r.db.WithContext(ctx).Create(billing).Error; err != nil {
				return fmt.Errorf("failed to create tenant billing: %w", err)
			}
			return nil
		}
		return fmt.Errorf("failed to find existing billing: %w", err)
	}

	// Update existing billing
	billing.ID = existingBilling.ID
	if err := r.db.WithContext(ctx).Save(billing).Error; err != nil {
		return fmt.Errorf("failed to update tenant billing: %w", err)
	}

	return nil
}

// GetBilling gets tenant billing
func (r *tenantRepository) GetBilling(ctx context.Context, tenantID int) (*models.TenantBilling, error) {
	var billing models.TenantBilling
	err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).First(&billing).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, utils.ErrBillingNotFound
		}
		return nil, fmt.Errorf("failed to find tenant billing: %w", err)
	}

	return &billing, nil
}

// GetTenantsForBilling gets tenants that need billing processing
func (r *tenantRepository) GetTenantsForBilling(ctx context.Context, status string) ([]models.Tenant, error) {
	var tenants []models.Tenant
	query := r.db.WithContext(ctx).
		Joins("JOIN tenant_billing ON tenants.id = tenant_billing.tenant_id")

	if status != "" {
		query = query.Where("tenant_billing.billing_status = ?", status)
	}

	err := query.Find(&tenants).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get tenants for billing: %w", err)
	}

	return tenants, nil
}

// AddUserToTenant adds a user to a tenant
func (r *tenantRepository) AddUserToTenant(ctx context.Context, tenantUser *models.TenantUser) error {
	// Check if association already exists
	var existing models.TenantUser
	err := r.db.WithContext(ctx).
		Where("tenant_id = ? AND user_id = ?", tenantUser.TenantID, tenantUser.UserID).
		First(&existing).Error

	if err == nil {
		// Update existing association
		existing.Role = tenantUser.Role
		existing.Status = tenantUser.Status
		existing.Permissions = tenantUser.Permissions
		existing.LastActivity = tenantUser.LastActivity
		return r.db.WithContext(ctx).Save(&existing).Error
	}

	if err != gorm.ErrRecordNotFound {
		return fmt.Errorf("failed to check existing tenant user: %w", err)
	}

	// Create new association
	if err := r.db.WithContext(ctx).Create(tenantUser).Error; err != nil {
		return fmt.Errorf("failed to add user to tenant: %w", err)
	}

	return nil
}

// RemoveUserFromTenant removes a user from a tenant
func (r *tenantRepository) RemoveUserFromTenant(ctx context.Context, tenantID, userID int) error {
	result := r.db.WithContext(ctx).
		Where("tenant_id = ? AND user_id = ?", tenantID, userID).
		Delete(&models.TenantUser{})

	if result.Error != nil {
		return fmt.Errorf("failed to remove user from tenant: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrTenantUserNotFound
	}

	return nil
}

// GetTenantUsers gets users for a tenant
func (r *tenantRepository) GetTenantUsers(ctx context.Context, tenantID int, limit, offset int) ([]models.TenantUser, int64, error) {
	var tenantUsers []models.TenantUser
	var total int64

	// Count total records
	if err := r.db.WithContext(ctx).
		Model(&models.TenantUser{}).
		Where("tenant_id = ?", tenantID).
		Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count tenant users: %w", err)
	}

	// Get paginated results
	err := r.db.WithContext(ctx).
		Preload("User").
		Where("tenant_id = ?", tenantID).
		Order("joined_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tenantUsers).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to get tenant users: %w", err)
	}

	return tenantUsers, total, nil
}

// GetUserTenants gets tenants for a user
func (r *tenantRepository) GetUserTenants(ctx context.Context, userID int) ([]models.TenantUser, error) {
	var tenantUsers []models.TenantUser
	err := r.db.WithContext(ctx).
		Preload("Tenant").
		Where("user_id = ? AND status = ?", userID, models.TenantUserStatusActive).
		Find(&tenantUsers).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get user tenants: %w", err)
	}

	return tenantUsers, nil
}

// UpdateTenantUserRole updates a user's role in a tenant
func (r *tenantRepository) UpdateTenantUserRole(ctx context.Context, tenantID, userID int, role string) error {
	result := r.db.WithContext(ctx).
		Model(&models.TenantUser{}).
		Where("tenant_id = ? AND user_id = ?", tenantID, userID).
		Update("role", role)

	if result.Error != nil {
		return fmt.Errorf("failed to update tenant user role: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return utils.ErrTenantUserNotFound
	}

	return nil
}

// Continue with remaining methods...
// (Implementing rest of the methods without domain/subscription_plan references)

// GetTenantStats gets statistics for a tenant
func (r *tenantRepository) GetTenantStats(ctx context.Context, tenantID int) (*models.TenantStats, error) {
	stats := &models.TenantStats{
		TenantID:  tenantID,
		CreatedAt: time.Now(),
	}

	// Get user count
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("tenant_id = ?", tenantID).
		Count(&stats.UserCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	// Get active user count
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("tenant_id = ? AND is_active = ?", tenantID, true).
		Count(&stats.ActiveUserCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count active users: %w", err)
	}

	// Get last activity
	var lastActivity sql.NullTime
	if err := r.db.WithContext(ctx).
		Model(&models.TenantUser{}).
		Where("tenant_id = ?", tenantID).
		Select("MAX(last_activity)").
		Scan(&lastActivity).Error; err != nil {
		return nil, fmt.Errorf("failed to get last activity: %w", err)
	}

	if lastActivity.Valid {
		stats.LastActivity = &lastActivity.Time
	}

	return stats, nil
}

// GetSystemStats gets system-wide statistics
func (r *tenantRepository) GetSystemStats(ctx context.Context) (*models.SystemStats, error) {
	stats := &models.SystemStats{
		CalculatedAt: time.Now(),
	}

	// Get total tenants
	if err := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("status != ?", models.TenantStatusDeleted).
		Count(&stats.TotalTenants).Error; err != nil {
		return nil, fmt.Errorf("failed to count total tenants: %w", err)
	}

	// Get active tenants
	if err := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("status = ?", models.TenantStatusActive).
		Count(&stats.ActiveTenants).Error; err != nil {
		return nil, fmt.Errorf("failed to count active tenants: %w", err)
	}

	// Get total users
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("tenant_id IS NOT NULL").
		Count(&stats.TotalUsers).Error; err != nil {
		return nil, fmt.Errorf("failed to count total users: %w", err)
	}

	// Get active users
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("tenant_id IS NOT NULL AND is_active = ?", true).
		Count(&stats.ActiveUsers).Error; err != nil {
		return nil, fmt.Errorf("failed to count active users: %w", err)
	}

	// Calculate average storage per tenant (placeholder)
	if stats.ActiveTenants > 0 {
		stats.AverageStoragePerTenant = stats.TotalStorageGB / float64(stats.ActiveTenants)
	}

	return stats, nil
}

// SearchTenants searches tenants with filters
func (r *tenantRepository) SearchTenants(ctx context.Context, filter *models.TenantFilter, limit, offset int) ([]models.Tenant, int64, error) {
	var tenants []models.Tenant
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Tenant{}).Where("status != ?", models.TenantStatusDeleted)

	// Apply filters
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}

	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("name ILIKE ? OR subdomain ILIKE ?", searchTerm, searchTerm)
	}

	if filter.CreatedAfter != nil {
		query = query.Where("created_at >= ?", *filter.CreatedAfter)
	}

	if filter.CreatedBefore != nil {
		query = query.Where("created_at <= ?", *filter.CreatedBefore)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count filtered tenants: %w", err)
	}

	// Get paginated results
	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tenants).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to search tenants: %w", err)
	}

	return tenants, total, nil
}

// GetTenantsBySubscriptionPlan gets tenants by subscription plan
func (r *tenantRepository) GetTenantsBySubscriptionPlan(ctx context.Context, plan string) ([]models.Tenant, error) {
	// Join with billing table since subscription plan is there
	var tenants []models.Tenant
	err := r.db.WithContext(ctx).
		Joins("JOIN tenant_billing ON tenants.id = tenant_billing.tenant_id").
		Where("tenant_billing.subscription_plan = ? AND tenants.status = ?", plan, models.TenantStatusActive).
		Find(&tenants).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get tenants by subscription plan: %w", err)
	}

	return tenants, nil
}

// GetExpiredTrialTenants gets tenants with expired trials
func (r *tenantRepository) GetExpiredTrialTenants(ctx context.Context) ([]models.Tenant, error) {
	var tenants []models.Tenant
	err := r.db.WithContext(ctx).
		Joins("JOIN tenant_billing ON tenants.id = tenant_billing.tenant_id").
		Where("tenant_billing.trial_end < ? AND tenant_billing.billing_status = ?", time.Now(), "trial").
		Find(&tenants).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get expired trial tenants: %w", err)
	}

	return tenants, nil
}

// GetTenantUsageStats gets usage statistics for all tenants
func (r *tenantRepository) GetTenantUsageStats(ctx context.Context) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	rows, err := r.db.WithContext(ctx).Raw(`
		SELECT 
			t.id,
			t.name,
			t.subdomain,
			t.status,
			tb.subscription_plan,
			COUNT(u.id) as user_count,
			COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_user_count,
			10 as max_users,
			COALESCE(MAX(tu.last_activity), t.created_at) as last_activity
		FROM public.tenants t
		LEFT JOIN users u ON t.id = u.tenant_id
		LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
		LEFT JOIN tenant_billing tb ON t.id = tb.tenant_id
		WHERE t.status != ?
		GROUP BY t.id, t.name, t.subdomain, t.status, tb.subscription_plan, t.created_at
		ORDER BY t.created_at DESC
	`, models.TenantStatusDeleted).Rows()

	if err != nil {
		return nil, fmt.Errorf("failed to get tenant usage stats: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			id               int
			name             string
			subdomain        string
			status           string
			subscriptionPlan sql.NullString
			userCount        int
			activeUserCount  int
			maxUsers         int
			lastActivity     time.Time
		)

		if err := rows.Scan(&id, &name, &subdomain, &status, &subscriptionPlan, &userCount, &activeUserCount, &maxUsers, &lastActivity); err != nil {
			return nil, fmt.Errorf("failed to scan tenant usage stats: %w", err)
		}

		planStr := "basic"
		if subscriptionPlan.Valid {
			planStr = subscriptionPlan.String
		}

		result := map[string]interface{}{
			"id":                id,
			"name":              name,
			"subdomain":         subdomain,
			"status":            status,
			"subscription_plan": planStr,
			"user_count":        userCount,
			"active_user_count": activeUserCount,
			"max_users":         maxUsers,
			"user_utilization":  float64(userCount) / float64(maxUsers) * 100,
			"last_activity":     lastActivity,
		}

		results = append(results, result)
	}

	return results, nil
}

// CheckSubdomainAvailability checks if a subdomain is available
func (r *tenantRepository) CheckSubdomainAvailability(ctx context.Context, subdomain string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("subdomain = ? AND status != ?", strings.ToLower(subdomain), models.TenantStatusDeleted).
		Count(&count).Error

	if err != nil {
		return false, fmt.Errorf("failed to check subdomain availability: %w", err)
	}

	return count == 0, nil
}

// CheckDomainAvailability checks if a custom domain is available
func (r *tenantRepository) CheckDomainAvailability(ctx context.Context, domain string) (bool, error) {
	// Check in branding table since we don't have domain field in tenant
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.TenantBranding{}).
		Where("LOWER(company_name) = ? OR LOWER(logo_url) LIKE ?",
			strings.ToLower(domain), "%"+strings.ToLower(domain)+"%").
		Count(&count).Error

	if err != nil {
		return false, fmt.Errorf("failed to check domain availability: %w", err)
	}

	return count == 0, nil
}

// BulkUpdateTenantStatus updates status for multiple tenants
func (r *tenantRepository) BulkUpdateTenantStatus(ctx context.Context, tenantIDs []int, status string) error {
	if len(tenantIDs) == 0 {
		return fmt.Errorf("no tenant IDs provided")
	}

	result := r.db.WithContext(ctx).
		Model(&models.Tenant{}).
		Where("id IN ?", tenantIDs).
		Update("status", status)

	if result.Error != nil {
		return fmt.Errorf("failed to bulk update tenant status: %w", result.Error)
	}

	utils.LogInfof("BulkUpdateTenantStatus: Updated %d tenants to status %s", result.RowsAffected, status)
	return nil
}

// GetTenantResourceUsage gets detailed resource usage for a tenant
func (r *tenantRepository) GetTenantResourceUsage(ctx context.Context, tenantID int) (map[string]interface{}, error) {
	usage := make(map[string]interface{})

	// Get user count and limits
	var userCount int64
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("tenant_id = ?", tenantID).
		Count(&userCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	// Default limits since tenant model doesn't have these fields yet
	maxUsers := 10
	maxStorage := 1.0

	usage["users"] = map[string]interface{}{
		"used":        userCount,
		"limit":       maxUsers,
		"utilization": float64(userCount) / float64(maxUsers) * 100,
		"available":   maxUsers - int(userCount),
	}

	usage["storage"] = map[string]interface{}{
		"used_gb":      0.0, // TODO: Calculate actual storage usage
		"limit_gb":     maxStorage,
		"utilization":  0.0, // TODO: Calculate actual utilization
		"available_gb": maxStorage,
	}

	return usage, nil
}

// CleanupDeletedTenants permanently removes tenant data for tenants marked as deleted
func (r *tenantRepository) CleanupDeletedTenants(ctx context.Context, olderThanDays int) error {
	cutoffDate := time.Now().AddDate(0, 0, -olderThanDays)

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Find tenants to cleanup
		var tenantsToCleanup []models.Tenant
		if err := tx.Where("status = ? AND updated_at < ?", models.TenantStatusDeleted, cutoffDate).
			Find(&tenantsToCleanup).Error; err != nil {
			return fmt.Errorf("failed to find tenants for cleanup: %w", err)
		}

		for _, tenant := range tenantsToCleanup {
			utils.LogInfof("CleanupDeletedTenants: Cleaning up tenant %d (%s)", tenant.ID, tenant.Name)

			// Delete tenant-related data
			if err := tx.Where("tenant_id = ?", tenant.ID).Delete(&models.TenantUser{}).Error; err != nil {
				return fmt.Errorf("failed to delete tenant users: %w", err)
			}

			if err := tx.Where("tenant_id = ?", tenant.ID).Delete(&models.TenantConfig{}).Error; err != nil {
				return fmt.Errorf("failed to delete tenant configs: %w", err)
			}

			if err := tx.Where("tenant_id = ?", tenant.ID).Delete(&models.TenantBranding{}).Error; err != nil {
				return fmt.Errorf("failed to delete tenant branding: %w", err)
			}

			if err := tx.Where("tenant_id = ?", tenant.ID).Delete(&models.TenantBilling{}).Error; err != nil {
				return fmt.Errorf("failed to delete tenant billing: %w", err)
			}

			// Finally delete the tenant itself
			if err := tx.Unscoped().Delete(&tenant).Error; err != nil {
				return fmt.Errorf("failed to permanently delete tenant: %w", err)
			}
		}

		utils.LogInfof("CleanupDeletedTenants: Cleaned up %d tenants", len(tenantsToCleanup))
		return nil
	})
}
