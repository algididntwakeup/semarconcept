// platform/backend/app/services/tenant_service.go
package services

import (
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/utils"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// TenantService interface defines tenant service operations
type TenantService interface {
	// Basic CRUD operations
	CreateTenant(ctx context.Context, req request.CreateTenantRequest, actorID int) (*response.TenantResponse, error)
	GetTenantByID(ctx context.Context, id int) (*response.TenantResponse, error)
	GetTenantBySubdomain(ctx context.Context, subdomain string) (*response.TenantResponse, error)
	UpdateTenant(ctx context.Context, id int, req request.UpdateTenantRequest, actorID int) (*response.TenantResponse, error)
	DeleteTenant(ctx context.Context, id int, actorID int) error
	GetTenants(ctx context.Context, query request.TenantListQuery) (*response.TenantListResponse, error)

	// Tenant management operations
	ActivateTenant(ctx context.Context, id int, actorID int) error
	DeactivateTenant(ctx context.Context, id int, actorID int) error
	SuspendTenant(ctx context.Context, id int, actorID int) error

	// Configuration management
	UpdateTenantConfig(ctx context.Context, tenantID int, req request.UpdateTenantConfigRequest, actorID int) error
	GetTenantConfig(ctx context.Context, tenantID int) (*response.TenantConfigResponse, error)

	// Branding management
	UpdateTenantBranding(ctx context.Context, tenantID int, req request.UpdateTenantBrandingRequest, actorID int) error
	GetTenantBranding(ctx context.Context, tenantID int) (*response.TenantBrandingResponse, error)

	// User management
	AddUserToTenant(ctx context.Context, req request.AddUserToTenantRequest, actorID int) error
	RemoveUserFromTenant(ctx context.Context, tenantID, userID int, actorID int) error
	GetTenantUsers(ctx context.Context, tenantID int, query request.TenantUserListQuery) (*response.TenantUserListResponse, error)

	// Analytics and statistics
	GetTenantStats(ctx context.Context, tenantID int) (*response.TenantStatsResponse, error)
	GetSystemStats(ctx context.Context) (*response.SystemStatsResponse, error)

	// Validation and availability
	CheckSubdomainAvailability(ctx context.Context, subdomain string) (bool, error)
	CheckDomainAvailability(ctx context.Context, domain string) (bool, error)
}

// tenantService implements the TenantService interface
type tenantService struct {
	tenantRepo repositories.TenantRepository
	userRepo   repositories.UserRepository
	auditRepo  repositories.AuditLogRepository
}

// NewTenantService creates a new tenant service instance
func NewTenantService(
	tenantRepo repositories.TenantRepository,
	userRepo repositories.UserRepository,
	auditRepo repositories.AuditLogRepository,
) TenantService {
	return &tenantService{
		tenantRepo: tenantRepo,
		userRepo:   userRepo,
		auditRepo:  auditRepo,
	}
}

// CreateTenant creates a new tenant with default settings
func (s *tenantService) CreateTenant(ctx context.Context, req request.CreateTenantRequest, actorID int) (*response.TenantResponse, error) {
	// Validate subdomain availability
	available, err := s.tenantRepo.CheckSubdomainAvailability(ctx, req.Subdomain)
	if err != nil {
		return nil, fmt.Errorf("failed to check subdomain availability: %w", err)
	}
	if !available {
		return nil, utils.ErrSubdomainTaken
	}

	// Validate custom domain if provided
	if req.Domain != nil && *req.Domain != "" {
		domainAvailable, err := s.tenantRepo.CheckDomainAvailability(ctx, *req.Domain)
		if err != nil {
			return nil, fmt.Errorf("failed to check domain availability: %w", err)
		}
		if !domainAvailable {
			return nil, utils.ErrDomainTaken
		}
	}

	// Create tenant model
	defaultSettings := models.GetDefaultTenantSettings()
	tenant := &models.Tenant{
		Name:             req.Name,
		Subdomain:        strings.ToLower(req.Subdomain),
		Domain:           req.Domain,                     // Now exists in model
		Slug:             strings.ToLower(req.Subdomain), // Generate slug from subdomain
		Status:           models.TenantStatusActive,
		SubscriptionPlan: req.SubscriptionPlan,             // Now exists in model
		MaxUsers:         getIntValue(req.MaxUsers, 10),    // Now exists in model
		MaxStorageGB:     getIntValue(req.MaxStorageGB, 5), // Now exists in model
		Settings:         &defaultSettings,                 // Convert string to *string
		CreatedBy:        &actorID,                         // Now exists in model
		UpdatedBy:        &actorID,                         // Now exists in model
	}

	// Apply custom settings if provided
	if req.Settings != nil {
		for key, value := range req.Settings {
			// Use the SetSetting method (now implemented as placeholder)
			err := tenant.SetSetting(key, value)
			if err != nil {
				return nil, fmt.Errorf("failed to set tenant setting %s: %w", key, err)
			}
		}
	}

	// Create tenant
	if err := s.tenantRepo.Create(ctx, tenant); err != nil {
		return nil, fmt.Errorf("failed to create tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant", tenant.ID, "create", nil, map[string]interface{}{
		"id":                tenant.ID,
		"name":              tenant.Name,
		"subdomain":         tenant.Subdomain,
		"domain":            tenant.Domain, // Now accessible
		"status":            tenant.Status,
		"subscription_plan": tenant.SubscriptionPlan, // Now accessible
		"max_users":         tenant.MaxUsers,         // Now accessible
		"max_storage_gb":    tenant.MaxStorageGB,     // Now accessible
	})

	// Get the created tenant with associations
	createdTenant, err := s.tenantRepo.FindByID(ctx, tenant.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve created tenant: %w", err)
	}

	return s.mapTenantToResponse(createdTenant), nil
}

// GetTenantByID retrieves a tenant by ID
func (s *tenantService) GetTenantByID(ctx context.Context, id int) (*response.TenantResponse, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.mapTenantToResponse(tenant), nil
}

// GetTenantBySubdomain retrieves a tenant by subdomain
func (s *tenantService) GetTenantBySubdomain(ctx context.Context, subdomain string) (*response.TenantResponse, error) {
	tenant, err := s.tenantRepo.FindBySubdomain(ctx, subdomain)
	if err != nil {
		return nil, err
	}

	return s.mapTenantToResponse(tenant), nil
}

// UpdateTenant updates an existing tenant
func (s *tenantService) UpdateTenant(ctx context.Context, id int, req request.UpdateTenantRequest, actorID int) (*response.TenantResponse, error) {
	// Get existing tenant
	tenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Store old values for audit
	oldValues := map[string]interface{}{
		"id":                tenant.ID,
		"name":              tenant.Name,
		"subdomain":         tenant.Subdomain,
		"domain":            tenant.Domain,
		"status":            tenant.Status,
		"subscription_plan": tenant.SubscriptionPlan,
		"max_users":         tenant.MaxUsers,
		"max_storage_gb":    tenant.MaxStorageGB,
	}

	// Update fields
	if req.Name != nil {
		tenant.Name = *req.Name
	}
	if req.Subdomain != nil {
		newSubdomain := strings.ToLower(*req.Subdomain)
		if newSubdomain != tenant.Subdomain {
			// Check availability of new subdomain
			available, err := s.tenantRepo.CheckSubdomainAvailability(ctx, newSubdomain)
			if err != nil {
				return nil, fmt.Errorf("failed to check subdomain availability: %w", err)
			}
			if !available {
				return nil, utils.ErrSubdomainTaken
			}
			tenant.Subdomain = newSubdomain
		}
	}
	if req.Domain != nil {
		if *req.Domain != "" && (tenant.Domain == nil || *req.Domain != *tenant.Domain) {
			// Check availability of new domain
			available, err := s.tenantRepo.CheckDomainAvailability(ctx, *req.Domain)
			if err != nil {
				return nil, fmt.Errorf("failed to check domain availability: %w", err)
			}
			if !available {
				return nil, utils.ErrDomainTaken
			}
		}
		tenant.Domain = req.Domain
	}
	if req.Status != nil {
		tenant.Status = *req.Status
	}
	if req.SubscriptionPlan != nil {
		tenant.SubscriptionPlan = *req.SubscriptionPlan
	}
	if req.MaxUsers != nil {
		tenant.MaxUsers = *req.MaxUsers
	}
	if req.MaxStorageGB != nil {
		tenant.MaxStorageGB = *req.MaxStorageGB
	}

	// Update settings
	if req.Settings != nil {
		for key, value := range req.Settings {
			tenant.SetSetting(key, value)
		}
	}

	tenant.UpdatedBy = &actorID

	// Save changes
	if err := s.tenantRepo.Update(ctx, tenant); err != nil {
		return nil, fmt.Errorf("failed to update tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant", tenant.ID, "update", oldValues, map[string]interface{}{
		"id":                tenant.ID,
		"name":              tenant.Name,
		"subdomain":         tenant.Subdomain,
		"domain":            tenant.Domain,
		"status":            tenant.Status,
		"subscription_plan": tenant.SubscriptionPlan,
		"max_users":         tenant.MaxUsers,
		"max_storage_gb":    tenant.MaxStorageGB,
	})

	// Get updated tenant with associations
	updatedTenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated tenant: %w", err)
	}

	return s.mapTenantToResponse(updatedTenant), nil
}

// DeleteTenant deletes a tenant (soft delete)
func (s *tenantService) DeleteTenant(ctx context.Context, id int, actorID int) error {
	// Get existing tenant for audit
	tenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Soft delete
	if err := s.tenantRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant", id, "delete", map[string]interface{}{
		"id":                tenant.ID,
		"name":              tenant.Name,
		"subdomain":         tenant.Subdomain,
		"domain":            tenant.Domain,
		"status":            tenant.Status,
		"subscription_plan": tenant.SubscriptionPlan,
		"max_users":         tenant.MaxUsers,
		"max_storage_gb":    tenant.MaxStorageGB,
	}, nil)

	return nil
}

// GetTenants retrieves a paginated list of tenants
func (s *tenantService) GetTenants(ctx context.Context, query request.TenantListQuery) (*response.TenantListResponse, error) {
	// Set default values
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	offset := (query.Page - 1) * query.Limit

	// Build filter
	filter := &models.TenantFilter{
		Search: query.Search,
	}

	if query.Status != "" {
		filter.Status = &query.Status
	}
	if query.SubscriptionPlan != "" {
		filter.SubscriptionPlan = &query.SubscriptionPlan
	}

	// Get tenants
	tenants, total, err := s.tenantRepo.SearchTenants(ctx, filter, query.Limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get tenants: %w", err)
	}

	// Map to response
	tenantResponses := make([]response.TenantResponse, len(tenants))
	for i, tenant := range tenants {
		tenantResponses[i] = *s.mapTenantToResponse(&tenant)
	}

	return &response.TenantListResponse{
		Tenants: tenantResponses,
		Total:   total,
		Page:    query.Page,
		Limit:   query.Limit,
	}, nil
}

// ActivateTenant activates a tenant
func (s *tenantService) ActivateTenant(ctx context.Context, id int, actorID int) error {
	// Get tenant for audit
	tenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	oldStatus := tenant.Status

	if err := s.tenantRepo.Activate(ctx, id); err != nil {
		return fmt.Errorf("failed to activate tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant", id, "activate",
		map[string]interface{}{"status": oldStatus},
		map[string]interface{}{"status": models.TenantStatusActive})

	return nil
}

// DeactivateTenant deactivates a tenant
func (s *tenantService) DeactivateTenant(ctx context.Context, id int, actorID int) error {
	// Get tenant for audit
	tenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	oldStatus := tenant.Status

	if err := s.tenantRepo.Deactivate(ctx, id); err != nil {
		return fmt.Errorf("failed to deactivate tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant", id, "deactivate",
		map[string]interface{}{"status": oldStatus},
		map[string]interface{}{"status": models.TenantStatusInactive})

	return nil
}

// SuspendTenant suspends a tenant
func (s *tenantService) SuspendTenant(ctx context.Context, id int, actorID int) error {
	// Get tenant for audit
	tenant, err := s.tenantRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	oldStatus := tenant.Status

	if err := s.tenantRepo.Suspend(ctx, id); err != nil {
		return fmt.Errorf("failed to suspend tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant", id, "suspend",
		map[string]interface{}{"status": oldStatus},
		map[string]interface{}{"status": models.TenantStatusSuspended})

	return nil
}

// UpdateTenantConfig updates tenant configuration
func (s *tenantService) UpdateTenantConfig(ctx context.Context, tenantID int, req request.UpdateTenantConfigRequest, actorID int) error {
	// Get existing config for audit
	oldConfig, err := s.tenantRepo.GetConfig(ctx, tenantID)
	if err != nil {
		return fmt.Errorf("failed to get existing config: %w", err)
	}

	// Update config
	if err := s.tenantRepo.UpdateConfig(ctx, tenantID, req.Settings); err != nil {
		return fmt.Errorf("failed to update tenant config: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant_config", tenantID, "update", oldConfig, req.Settings)

	return nil
}

// GetTenantConfig retrieves tenant configuration
func (s *tenantService) GetTenantConfig(ctx context.Context, tenantID int) (*response.TenantConfigResponse, error) {
	config, err := s.tenantRepo.GetConfig(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	return &response.TenantConfigResponse{
		TenantID: tenantID,
		Settings: config,
	}, nil
}

// UpdateTenantBranding updates tenant branding
func (s *tenantService) UpdateTenantBranding(ctx context.Context, tenantID int, req request.UpdateTenantBrandingRequest, actorID int) error {
	// Get existing branding for audit
	oldBranding, err := s.tenantRepo.GetBranding(ctx, tenantID)
	if err != nil && err != utils.ErrBrandingNotFound {
		return fmt.Errorf("failed to get existing branding: %w", err)
	}

	// Create branding model
	branding := &models.TenantBranding{
		TenantID:        tenantID,
		CompanyName:     utils.GetStringValueOrDefault(req.CompanyName, ""),
		LogoURL:         utils.GetStringValueOrDefault(req.LogoURL, ""),
		FaviconURL:      utils.GetStringValueOrDefault(req.FaviconURL, ""),
		PrimaryColor:    utils.GetStringValueOrDefault(req.PrimaryColor, "#1976D2"),
		SecondaryColor:  utils.GetStringValue(req.SecondaryColor),
		AccentColor:     utils.GetStringValue(req.AccentColor),
		BackgroundColor: utils.GetStringValue(req.BackgroundColor),
		Theme:           utils.GetStringValue(req.Theme),
		CustomCSS:       utils.GetStringValue(req.CustomCSS),
		EmailTemplate:   convertMapToJSONString(req.EmailTemplate),
	}

	// Update branding
	if err := s.tenantRepo.UpdateBranding(ctx, branding); err != nil {
		return fmt.Errorf("failed to update tenant branding: %w", err)
	}

	// Create audit log
	var oldValues map[string]interface{}
	if oldBranding != nil {
		oldValues = map[string]interface{}{
			"company_name":     oldBranding.CompanyName,
			"logo_url":         oldBranding.LogoURL,
			"favicon_url":      oldBranding.FaviconURL,
			"primary_color":    oldBranding.PrimaryColor,
			"secondary_color":  oldBranding.SecondaryColor,
			"accent_color":     oldBranding.AccentColor,
			"background_color": oldBranding.BackgroundColor,
			"theme":            oldBranding.Theme,
			"custom_css":       oldBranding.CustomCSS,
			"email_template":   oldBranding.EmailTemplate,
		}
	}

	newValues := map[string]interface{}{
		"company_name":     branding.CompanyName,
		"logo_url":         branding.LogoURL,
		"favicon_url":      branding.FaviconURL,
		"primary_color":    branding.PrimaryColor,
		"secondary_color":  branding.SecondaryColor,
		"accent_color":     branding.AccentColor,
		"background_color": branding.BackgroundColor,
		"theme":            branding.Theme,
		"custom_css":       branding.CustomCSS,
		"email_template":   branding.EmailTemplate,
	}

	s.createAuditLog(ctx, actorID, "tenant_branding", tenantID, "update", oldValues, newValues)

	return nil
}

// GetTenantBranding retrieves tenant branding
func (s *tenantService) GetTenantBranding(ctx context.Context, tenantID int) (*response.TenantBrandingResponse, error) {
	branding, err := s.tenantRepo.GetBranding(ctx, tenantID)
	if err != nil {
		if err == utils.ErrBrandingNotFound {
			// Return default branding
			defaultBranding := models.GetDefaultTenantBranding()
			defaultBranding.TenantID = tenantID
			return s.mapBrandingToResponse(&defaultBranding), nil
		}
		return nil, err
	}

	return s.mapBrandingToResponse(branding), nil
}

// AddUserToTenant adds a user to a tenant
func (s *tenantService) AddUserToTenant(ctx context.Context, req request.AddUserToTenantRequest, actorID int) error {
	// Validate tenant exists
	tenant, err := s.tenantRepo.FindByID(ctx, req.TenantID)
	if err != nil {
		return err
	}

	// Check if tenant can add more users
	if !tenant.CanAddUsers() {
		return utils.ErrTenantUserLimitExceeded
	}

	// Validate user exists
	user, err := s.userRepo.FindByID(ctx, req.UserID)
	if err != nil {
		return err
	}

	// Create tenant user relationship
	tenantUser := &models.TenantUser{
		TenantID:    req.TenantID,
		UserID:      req.UserID,
		Role:        req.Role,
		Status:      models.TenantUserStatusActive,
		Permissions: convertMapToJSONStringPointer(req.Permissions),
		InvitedBy:   &actorID,
		JoinedAt:    time.Now(),
	}

	if err := s.tenantRepo.AddUserToTenant(ctx, tenantUser); err != nil {
		return fmt.Errorf("failed to add user to tenant: %w", err)
	}

	// Update user's tenant_id if not set
	if user.TenantID == 0 {
		user.TenantID = req.TenantID
		if err := s.userRepo.Update(ctx, user); err != nil {
			utils.LogErrorf("Failed to update user tenant_id: %v", err)
		}
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant_user", req.TenantID, "add_user", nil, map[string]interface{}{
		"user_id": req.UserID,
		"role":    req.Role,
	})

	return nil
}

// RemoveUserFromTenant removes a user from a tenant
func (s *tenantService) RemoveUserFromTenant(ctx context.Context, tenantID, userID int, actorID int) error {
	// Validate tenant exists
	_, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return err
	}

	// Remove user from tenant
	if err := s.tenantRepo.RemoveUserFromTenant(ctx, tenantID, userID); err != nil {
		return fmt.Errorf("failed to remove user from tenant: %w", err)
	}

	// Create audit log
	s.createAuditLog(ctx, actorID, "tenant_user", tenantID, "remove_user", map[string]interface{}{
		"user_id": userID,
	}, nil)

	return nil
}

// GetTenantUsers retrieves users for a tenant
func (s *tenantService) GetTenantUsers(ctx context.Context, tenantID int, query request.TenantUserListQuery) (*response.TenantUserListResponse, error) {
	// Set default values
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	offset := (query.Page - 1) * query.Limit

	// Get tenant users
	tenantUsers, total, err := s.tenantRepo.GetTenantUsers(ctx, tenantID, query.Limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get tenant users: %w", err)
	}

	// Map to response
	userResponses := make([]response.TenantUserResponse, len(tenantUsers))
	for i, tenantUser := range tenantUsers {
		userResponses[i] = response.TenantUserResponse{
			ID:           tenantUser.ID,
			TenantID:     tenantUser.TenantID,
			UserID:       tenantUser.UserID,
			Role:         tenantUser.Role,
			Status:       tenantUser.Status,
			Permissions:  convertJSONStringToMap(tenantUser.Permissions),
			JoinedAt:     tenantUser.JoinedAt,
			InvitedAt:    tenantUser.InvitedAt,
			InvitedBy:    tenantUser.InvitedBy,
			LastActivity: tenantUser.LastActivity,
		}

		// Add user details if preloaded
		if tenantUser.User != nil {
			userResponses[i].User = &response.UserResponse{
				ID:        tenantUser.User.ID,
				Username:  tenantUser.User.Username,
				Email:     tenantUser.User.Email,
				FirstName: utils.GetStringPointer(tenantUser.User.FirstName),
				LastName:  utils.GetStringPointer(tenantUser.User.LastName),
				FullName:  tenantUser.User.GetFullName(),
				IsActive:  tenantUser.User.IsActive,
				CreatedAt: tenantUser.User.CreatedAt,
				UpdatedAt: tenantUser.User.UpdatedAt,
			}
		}
	}

	return &response.TenantUserListResponse{
		Users: userResponses,
		Total: total,
		Page:  query.Page,
		Limit: query.Limit,
	}, nil
}

// GetTenantStats retrieves tenant statistics
func (s *tenantService) GetTenantStats(ctx context.Context, tenantID int) (*response.TenantStatsResponse, error) {
	stats, err := s.tenantRepo.GetTenantStats(ctx, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tenant stats: %w", err)
	}

	return &response.TenantStatsResponse{
		TenantID:           stats.TenantID,
		UserCount:          int(stats.UserCount),
		ActiveUserCount:    int(stats.ActiveUserCount),
		StorageUsedGB:      stats.StorageUsedGB,
		StorageUtilization: 0.0, // TODO: Calculate storage utilization
		AssetCount:         int(stats.AssetCount),
		InspectionCount:    int(stats.InspectionCount),
		WorkOrderCount:     int(stats.WorkOrderCount),
		LastActivity:       stats.LastActivity,
		CreatedAt:          stats.CreatedAt,
	}, nil
}

// GetSystemStats retrieves system-wide statistics
func (s *tenantService) GetSystemStats(ctx context.Context) (*response.SystemStatsResponse, error) {
	stats, err := s.tenantRepo.GetSystemStats(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get system stats: %w", err)
	}

	return &response.SystemStatsResponse{
		TotalTenants:            int(stats.TotalTenants),
		ActiveTenants:           int(stats.ActiveTenants),
		TotalUsers:              int(stats.TotalUsers),
		ActiveUsers:             int(stats.ActiveUsers),
		TotalStorageGB:          stats.TotalStorageGB,
		AverageStoragePerTenant: stats.AverageStoragePerTenant,
		CalculatedAt:            stats.CalculatedAt,
	}, nil
}

// CheckSubdomainAvailability checks if a subdomain is available
func (s *tenantService) CheckSubdomainAvailability(ctx context.Context, subdomain string) (bool, error) {
	return s.tenantRepo.CheckSubdomainAvailability(ctx, subdomain)
}

// CheckDomainAvailability checks if a domain is available
func (s *tenantService) CheckDomainAvailability(ctx context.Context, domain string) (bool, error) {
	return s.tenantRepo.CheckDomainAvailability(ctx, domain)
}

// Helper methods

// mapTenantToResponse maps a tenant model to response
func (s *tenantService) mapTenantToResponse(tenant *models.Tenant) *response.TenantResponse {
	resp := &response.TenantResponse{
		ID:               tenant.ID,
		Name:             tenant.Name,
		Subdomain:        tenant.Subdomain,
		Domain:           tenant.Domain,
		Slug:             tenant.Slug,
		Status:           tenant.Status,
		SubscriptionPlan: tenant.SubscriptionPlan,
		MaxUsers:         tenant.MaxUsers,
		MaxStorageGB:     tenant.MaxStorageGB,
		Settings:         convertJSONStringToMap(tenant.Settings),
		Metadata:         convertJSONStringToMap(tenant.Metadata),
		CreatedAt:        tenant.CreatedAt,
		UpdatedAt:        tenant.UpdatedAt,
		CreatedBy:        tenant.CreatedBy,
		UpdatedBy:        tenant.UpdatedBy,
	}

	// Add branding if preloaded
	if tenant.Branding != nil {
		resp.Branding = s.mapBrandingToResponse(tenant.Branding)
	}

	// Add billing if preloaded
	if tenant.Billing != nil {
		resp.Billing = &response.TenantBillingResponse{
			ID:                tenant.Billing.ID,
			TenantID:          tenant.Billing.TenantID,
			SubscriptionPlan:  tenant.Billing.SubscriptionPlan,
			BillingCycle:      tenant.Billing.BillingCycle,
			BillingEmail:      getBillingEmailPointer(tenant.Billing.BillingEmail),
			BillingAddress:    convertJSONStringToMap(tenant.Billing.BillingAddress),
			SubscriptionStart: &tenant.Billing.SubscriptionStart,
			SubscriptionEnd:   tenant.Billing.SubscriptionEnd,
			TrialEnd:          tenant.Billing.TrialEnd,
			PaymentMethod:     convertJSONStringToMap(tenant.Billing.PaymentMethod),
			BillingStatus:     tenant.Billing.BillingStatus,
			CreatedAt:         tenant.Billing.CreatedAt,
			UpdatedAt:         tenant.Billing.UpdatedAt,
		}
	}

	return resp
}

// mapBrandingToResponse maps branding model to response
func (s *tenantService) mapBrandingToResponse(branding *models.TenantBranding) *response.TenantBrandingResponse {
	return &response.TenantBrandingResponse{
		ID:              branding.ID,
		TenantID:        branding.TenantID,
		CompanyName:     getStringPointer(branding.CompanyName),
		LogoURL:         getStringPointer(branding.LogoURL),
		FaviconURL:      getStringPointer(branding.FaviconURL),
		PrimaryColor:    getStringPointer(branding.PrimaryColor),
		SecondaryColor:  getStringPointer(branding.SecondaryColor),
		AccentColor:     getStringPointer(branding.AccentColor),
		BackgroundColor: getStringPointer(branding.BackgroundColor),
		Theme:           getStringPointer(branding.Theme),
		CustomCSS:       getStringPointer(branding.CustomCSS),
		EmailTemplate:   convertJSONStringToMapFromString(branding.EmailTemplate),
		CreatedAt:       branding.CreatedAt,
		UpdatedAt:       branding.UpdatedAt,
	}
}

// createAuditLog creates an audit log entry
func (s *tenantService) createAuditLog(ctx context.Context, userID int, resource string, resourceID int, action string, oldValues, newValues map[string]interface{}) {
	if s.auditRepo == nil {
		return
	}

	// Convert resource to entity type and resourceID to entity ID
	entityType := &resource
	entityIDStr := fmt.Sprintf("%d", resourceID)
	entityID := &entityIDStr

	auditLog := &models.AuditLog{
		ID:         uuid.New(),
		Timestamp:  time.Now(),
		UserID:     getUserIDPointer(userID), // Convert int to *uuid.UUID
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		Status:     "success",
		// Note: OldValues and NewValues are not in the current AuditLog model
		// Details could be used to store this information as JSON
	}

	if err := s.auditRepo.Create(ctx, auditLog); err != nil {
		utils.LogErrorf("Failed to create audit log: %v", err)
	}
}

// Helper functions for pointer value extraction
func getIntValue(ptr *int, defaultValue int) int {
	if ptr != nil {
		return *ptr
	}
	return defaultValue
}

// Helper function to convert string to *string for billing email
func getBillingEmailPointer(email string) *string {
	if email == "" {
		return nil
	}
	return &email
}

// Helper function to convert string to *string for branding fields
func getStringPointer(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// Helper function to convert int to *uuid.UUID for audit logs
func getUserIDPointer(userID int) *uuid.UUID {
	// For now, we'll skip UUID conversion and return nil
	// TODO: Implement proper user ID to UUID mapping
	return nil
}

func convertMapToJSONString(data map[string]interface{}) string {
	if data == nil {
		return "{}"
	}

	jsonBytes, err := json.Marshal(data)
	if err != nil {
		utils.LogErrorf("Failed to marshal map to JSON: %v", err)
		return "{}"
	}

	return string(jsonBytes)
}

// convertJSONStringToMap converts a JSON string to map[string]interface{}
func convertJSONStringToMap(jsonStr *string) map[string]interface{} {
	if jsonStr == nil || *jsonStr == "" {
		return make(map[string]interface{})
	}

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(*jsonStr), &result); err != nil {
		utils.LogErrorf("Failed to unmarshal JSON string to map: %v", err)
		return make(map[string]interface{})
	}

	return result
}

// convertStringPointerToMap converts a *string (JSON) to map[string]interface{}
func convertStringPointerToMap(jsonStr *string) map[string]interface{} {
	if jsonStr == nil || *jsonStr == "" {
		return make(map[string]interface{})
	}

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(*jsonStr), &result); err != nil {
		utils.LogErrorf("Failed to unmarshal JSON string to map: %v", err)
		return make(map[string]interface{})
	}

	return result
}

func convertMapToJSONStringPointer(data map[string]interface{}) *string {
	if data == nil {
		return nil
	}

	jsonStr := convertMapToJSONString(data)
	return &jsonStr
}

// convertJSONStringToMapFromString converts string (not *string) to map
func convertJSONStringToMapFromString(jsonStr string) map[string]interface{} {
	if jsonStr == "" {
		return make(map[string]interface{})
	}

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		utils.LogErrorf("Failed to unmarshal JSON string to map: %v", err)
		return make(map[string]interface{})
	}

	return result
}
