// platform/backend/app/database/seeder.go
package database

import (
	"backend/app/models"
	"backend/app/utils"
	"log"

	"gorm.io/gorm"
)

// Seeder handles database seeding operations
type Seeder struct {
	DB *gorm.DB
}

// NewSeeder creates a new seeder instance
func NewSeeder(db *gorm.DB) *Seeder {
	return &Seeder{DB: db}
}

// SeedAll runs all seeders
func (s *Seeder) SeedAll() error {
	log.Println("Starting database seeding...")

	//  SEEDING: Populate data
	if err := s.SeedDefaultTenant(); err != nil {
		return err
	}

	if err := s.SeedPermissions(); err != nil {
		return err
	}

	if err := s.SeedRoles(); err != nil {
		return err
	}

	if err := s.SeedDefaultUser(); err != nil {
		return err
	}

	if err := s.SeedRolePermissions(); err != nil {
		return err
	}

	if err := s.SeedISO14224Taxonomy(); err != nil {
		return err
	}

	if err := s.SeedMenuItems(); err != nil {
		return err
	}

	log.Println("Database seeding completed successfully!")
	return nil
}

// SeedMenuItems creates default system menu items
func (s *Seeder) SeedMenuItems() error {
	log.Println("Seeding menu items...")

	strPtr := func(s string) *string { return &s }

	// 1. Root Items
	rootItems := []models.Menu{
		{Title: "Dashboard", Slug: "dashboard", Icon: strPtr("LayoutDashboard"), Route: strPtr("/dashboard/overview"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Analytics", Slug: "analytics", Icon: strPtr("BarChart3"), Route: strPtr("/analytics/dashboard"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Asset Management", Slug: "assets", Icon: strPtr("Package"), Route: strPtr("/asset/registry"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Inspection Management", Slug: "inspection", Icon: strPtr("ClipboardCheck"), Route: strPtr("/inspection/tasks"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Risk Management", Slug: "risk", Icon: strPtr("ShieldAlert"), Route: strPtr("/risk/assessments"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Maintenance Management", Slug: "maintenance", Icon: strPtr("Wrench"), Route: strPtr("/maintenance/work-orders"), OrderIndex: 6, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Compliance Management", Slug: "compliance", Icon: strPtr("CheckCircle"), Route: strPtr("/compliance/standards"), OrderIndex: 7, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Content Management", Slug: "content", Icon: strPtr("FileText"), Route: strPtr("/content/items"), OrderIndex: 8, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Administration", Slug: "administration", Icon: strPtr("Settings"), Route: strPtr("/admin/users"), OrderIndex: 9, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "collapse", IsSystemMenu: true},
		{Title: "Templates/Starter", Slug: "templates", Icon: strPtr("LayoutTemplate"), Route: strPtr("/templates/dashboards/analytics"), OrderIndex: 10, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "collapse", IsSystemMenu: true},
	}

	slugToID := make(map[string]int)

	// Upsert Roots
	for _, item := range rootItems {
		var existing models.Menu
		if err := s.DB.Where("slug = ? AND tenant_id = ?", item.Slug, item.TenantID).First(&existing).Error; err != nil {
			if err := s.DB.Create(&item).Error; err != nil {
				return err
			}
			slugToID[item.Slug] = item.ID
			log.Printf("Created root menu: %s", item.Title)
		} else {
			item.ID = existing.ID
			if err := s.DB.Save(&item).Error; err != nil {
				return err
			}
			slugToID[item.Slug] = existing.ID
			log.Printf("Updated root menu: %s", item.Title)
		}
	}

	// 2. Define Children (using slug pointers)
	childItems := []struct {
		ParentSlug string
		Menu       models.Menu
	}{
		// Dashboard children
		{"dashboard", models.Menu{Title: "Overview", Slug: "dashboard-overview", Route: strPtr("/dashboard/overview"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"dashboard", models.Menu{Title: "Asset Dashboard", Slug: "dashboard-asset", Route: strPtr("/dashboard/asset"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		
		// Analytics children
		{"analytics", models.Menu{Title: "Performance Metrics", Slug: "analytics-performance", Route: strPtr("/analytics/performance"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"analytics", models.Menu{Title: "Risk Analysis", Slug: "analytics-risk", Route: strPtr("/analytics/risk"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"analytics", models.Menu{Title: "Inspection Coverage", Slug: "analytics-inspection", Route: strPtr("/analytics/inspection"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"analytics", models.Menu{Title: "Maintenance Effectiveness", Slug: "analytics-maintenance", Route: strPtr("/analytics/maintenance"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"analytics", models.Menu{Title: "Compliance Status", Slug: "analytics-compliance", Route: strPtr("/analytics/compliance"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"analytics", models.Menu{Title: "Custom Reports", Slug: "analytics-reports", Route: strPtr("/analytics/reports"), OrderIndex: 6, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Asset Management children
		{"assets", models.Menu{Title: "Asset Registry", Slug: "asset-registry", Route: strPtr("/asset/registry"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"assets", models.Menu{Title: "Asset Hierarchy", Slug: "asset-hierarchy", Route: strPtr("/asset/hierarchy"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"assets", models.Menu{Title: "Technical Data", Slug: "asset-technical-data", Route: strPtr("/asset/technical-data"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"assets", models.Menu{Title: "Documents", Slug: "asset-documents", Route: strPtr("/asset/documents"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"assets", models.Menu{Title: "Import/Export", Slug: "asset-import-export", Route: strPtr("/asset/import-export"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Administration children
		{"administration", models.Menu{Title: "Users", Slug: "admin-users", Route: strPtr("/admin/users"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "item"}},
		{"administration", models.Menu{Title: "Roles", Slug: "admin-roles", Route: strPtr("/admin/roles"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "item"}},
		{"administration", models.Menu{Title: "Permissions", Slug: "admin-permissions", Route: strPtr("/admin/permissions"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "item"}},
		{"administration", models.Menu{Title: "Menu Management", Slug: "menu-management", Route: strPtr("/admin/menu"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "item"}},
		{"administration", models.Menu{Title: "System Configuration", Slug: "system-config", Route: strPtr("/admin/system-config"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "item"}},
		{"administration", models.Menu{Title: "Backup & Restore", Slug: "backup-restore", Route: strPtr("/admin/backup-restore"), OrderIndex: 6, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "admin", MenuType: "item"}},

		// Inspection Management children
		{"inspection", models.Menu{Title: "Findings", Slug: "inspection-findings", Route: strPtr("/inspection/findings"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"inspection", models.Menu{Title: "Inspection Plans", Slug: "inspection-plans", Route: strPtr("/inspection/plans"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"inspection", models.Menu{Title: "Inspection Tasks", Slug: "inspection-tasks", Route: strPtr("/inspection/tasks"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"inspection", models.Menu{Title: "Inspection Types", Slug: "inspection-types", Route: strPtr("/inspection/types"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"inspection", models.Menu{Title: "Inspection Calendar", Slug: "inspection-calendar", Route: strPtr("/inspection/calendar"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Risk Management children
		{"risk", models.Menu{Title: "Risk Assessments", Slug: "risk-assessments", Route: strPtr("/risk/assessments"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"risk", models.Menu{Title: "Risk Matrix", Slug: "risk-matrix", Route: strPtr("/risk/matrix"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"risk", models.Menu{Title: "Degradation Mechanisms", Slug: "risk-degradation", Route: strPtr("/risk/degradation"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"risk", models.Menu{Title: "Integrity Windows", Slug: "risk-integrity", Route: strPtr("/risk/integrity"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"risk", models.Menu{Title: "Risk Reports", Slug: "risk-reports", Route: strPtr("/risk/reports"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Maintenance Management children
		{"maintenance", models.Menu{Title: "Work Orders", Slug: "maintenance-work-orders", Route: strPtr("/maintenance/work-orders"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"maintenance", models.Menu{Title: "Maintenance Plans", Slug: "maintenance-plans", Route: strPtr("/maintenance/plans"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"maintenance", models.Menu{Title: "Maintenance Tasks", Slug: "maintenance-tasks", Route: strPtr("/maintenance/tasks"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"maintenance", models.Menu{Title: "Resources", Slug: "maintenance-resources", Route: strPtr("/maintenance/resources"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"maintenance", models.Menu{Title: "Maintenance Calendar", Slug: "maintenance-calendar", Route: strPtr("/maintenance/calendar"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Compliance Management children
		{"compliance", models.Menu{Title: "Standards", Slug: "compliance-standards", Route: strPtr("/compliance/standards"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"compliance", models.Menu{Title: "Requirements", Slug: "compliance-requirements", Route: strPtr("/compliance/requirements"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"compliance", models.Menu{Title: "Compliance Tasks", Slug: "compliance-tasks", Route: strPtr("/compliance/tasks"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"compliance", models.Menu{Title: "Audits", Slug: "compliance-audits", Route: strPtr("/compliance/audits"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"compliance", models.Menu{Title: "Certifications", Slug: "compliance-certifications", Route: strPtr("/compliance/certifications"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Content Management children
		{"content", models.Menu{Title: "Content Types", Slug: "content-types", Route: strPtr("/content/types"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"content", models.Menu{Title: "Content Items", Slug: "content-items", Route: strPtr("/content/items"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"content", models.Menu{Title: "Media Library", Slug: "content-media", Route: strPtr("/content/media"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"content", models.Menu{Title: "Categories", Slug: "content-categories", Route: strPtr("/content/categories"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"content", models.Menu{Title: "Tags", Slug: "content-tags", Route: strPtr("/content/tags"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},

		// Templates/Starter children
		{"templates", models.Menu{Title: "Dashboards", Slug: "templates-dashboards", Route: strPtr("/templates/dashboards"), OrderIndex: 1, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"templates", models.Menu{Title: "Apps", Slug: "templates-apps", Route: strPtr("/templates/apps"), OrderIndex: 2, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"templates", models.Menu{Title: "UI Elements", Slug: "templates-ui", Route: strPtr("/templates/ui"), OrderIndex: 3, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"templates", models.Menu{Title: "Forms & Tables", Slug: "templates-forms", Route: strPtr("/templates/forms"), OrderIndex: 4, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"templates", models.Menu{Title: "Charts & Maps", Slug: "templates-charts", Route: strPtr("/templates/charts"), OrderIndex: 5, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
		{"templates", models.Menu{Title: "Pages", Slug: "templates-pages", Route: strPtr("/templates/pages"), OrderIndex: 6, IsActive: true, IsVisible: true, TenantID: 1, AccessLevel: "user", MenuType: "item"}},
	}

	// Upsert Children
	for _, mapping := range childItems {
		parentID, ok := slugToID[mapping.ParentSlug]
		if !ok {
			log.Printf("Warning: Parent slug %s not found for child %s", mapping.ParentSlug, mapping.Menu.Title)
			continue
		}
		
		item := mapping.Menu
		item.ParentID = &parentID
		
		var existing models.Menu
		if err := s.DB.Where("slug = ? AND tenant_id = ?", item.Slug, item.TenantID).First(&existing).Error; err != nil {
			if err := s.DB.Create(&item).Error; err != nil {
				return err
			}
			log.Printf("Created child menu: %s", item.Title)
		} else {
			item.ID = existing.ID
			if err := s.DB.Save(&item).Error; err != nil {
				return err
			}
			log.Printf("Updated child menu: %s", item.Title)
		}
	}

	return nil
}

// SeedRoles creates default system roles
func (s *Seeder) SeedRoles() error {
	log.Println("Seeding roles...")

	// Fixed: Use direct string values instead of string pointers
	adminDesc := "Has all permissions"
	managerDesc := "Manages users and system settings"
	editorDesc := "Manages content"
	contributorDesc := "Can create content but needs approval"
	viewerDesc := "Can view content"

	roles := []models.Role{
		{
			Name:        "Super Administrator",
			Code:        "super_admin",
			Description: adminDesc,
			Level:       1,
			IsSystem:    true,
			IsDefault:   false,
			IsActive:    true,
		},
		{
			Name:        "Administrator",
			Code:        "admin",
			Description: managerDesc,
			Level:       2,
			IsSystem:    true,
			IsDefault:   false,
			IsActive:    true,
		},
		{
			Name:        "Manager",
			Code:        "manager",
			Description: editorDesc,
			Level:       3,
			IsSystem:    true,
			IsDefault:   false,
			IsActive:    true,
		},
		{
			Name:        "User",
			Code:        "user",
			Description: contributorDesc,
			Level:       4,
			IsSystem:    true,
			IsDefault:   true,
			IsActive:    true,
		},
		{
			Name:        "Viewer",
			Code:        "viewer",
			Description: viewerDesc,
			Level:       5,
			IsSystem:    true,
			IsDefault:   false,
			IsActive:    true,
		},
	}

	for _, role := range roles {
		// Set default tenant ID to satisfy validation
		role.TenantID = 1

		var existingRole models.Role
		if err := s.DB.Where("code = ?", role.Code).First(&existingRole).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := s.DB.Create(&role).Error; err != nil {
					log.Printf("Error creating role %s: %v", role.Name, err)
					return err
				}
				log.Printf("Created role: %s", role.Name)
			} else {
				return err
			}
		} else {
			log.Printf("Role %s already exists, skipping", role.Name)
		}
	}

	return nil
}

// SeedPermissions creates default system permissions
func (s *Seeder) SeedPermissions() error {
	log.Println("Seeding permissions...")

	// Helper function to create string pointers
// stringPtr removed
	permissions := []models.Permission{
		// User Management
		{Name: "Create Users", Resource: "user", Action: "create", Scope: "tenant", Description: "Create new users"},
		{Name: "Read Users", Resource: "user", Action: "view", Scope: "tenant", Description: "Read user information"},
		{Name: "Update Users", Resource: "user", Action: "update", Scope: "tenant", Description: "Update user information"},
		{Name: "Delete Users", Resource: "user", Action: "delete", Scope: "tenant", Description: "Delete users"},

		// Role Management
		{Name: "Create Roles", Resource: "role", Action: "create", Scope: "tenant", Description: "Create new roles"},
		{Name: "Read Roles", Resource: "role", Action: "view", Scope: "tenant", Description: "Read role information"},
		{Name: "Update Roles", Resource: "role", Action: "update", Scope: "tenant", Description: "Update role information"},
		{Name: "Delete Roles", Resource: "role", Action: "delete", Scope: "tenant", Description: "Delete roles"},

		// Permission Management
		{Name: "Create Permissions", Resource: "permission", Action: "create", Scope: "system", Description: "Create new permissions"},
		{Name: "Read Permissions", Resource: "permission", Action: "view", Scope: "tenant", Description: "Read permission information"},
		{Name: "Update Permissions", Resource: "permission", Action: "update", Scope: "system", Description: "Update permission information"},
		{Name: "Delete Permissions", Resource: "permission", Action: "delete", Scope: "system", Description: "Delete permissions"},

		// Tenant Management
		{Name: "Create Tenants", Resource: "tenant", Action: "create", Scope: "system", Description: "Create new tenants"},
		{Name: "Read Tenants", Resource: "tenant", Action: "view", Scope: "system", Description: "Read tenant information"},
		{Name: "Update Tenants", Resource: "tenant", Action: "update", Scope: "system", Description: "Update tenant information"},
		{Name: "Delete Tenants", Resource: "tenant", Action: "delete", Scope: "system", Description: "Delete tenants"},

		// Content Management
		{Name: "Create Content", Resource: "content", Action: "create", Scope: "tenant", Description: "Create new content"},
		{Name: "Read Content", Resource: "content", Action: "view", Scope: "tenant", Description: "Read content"},
		{Name: "Update Content", Resource: "content", Action: "update", Scope: "own", Description: "Update own content"},
		{Name: "Delete Content", Resource: "content", Action: "delete", Scope: "own", Description: "Delete own content"},
		{Name: "Publish Content", Resource: "content", Action: "publish", Scope: "tenant", Description: "Publish content"},

		// Dashboard Management
		{Name: "Create Dashboards", Resource: "dashboard", Action: "create", Scope: "tenant", Description: "Create new dashboards"},
		{Name: "Read Dashboards", Resource: "dashboard", Action: "view", Scope: "tenant", Description: "Read dashboards"},
		{Name: "Update Dashboards", Resource: "dashboard", Action: "update", Scope: "own", Description: "Update own dashboards"},
		{Name: "Delete Dashboards", Resource: "dashboard", Action: "delete", Scope: "own", Description: "Delete own dashboards"},

		// Media Management
		{Name: "Upload Media", Resource: "media", Action: "upload", Scope: "tenant", Description: "Upload media files"},
		{Name: "Read Media", Resource: "media", Action: "view", Scope: "tenant", Description: "Read media files"},
		{Name: "Update Media", Resource: "media", Action: "update", Scope: "own", Description: "Update own media"},
		{Name: "Delete Media", Resource: "media", Action: "delete", Scope: "own", Description: "Delete own media"},

		// System Administration
		{Name: "System Configuration", Resource: "system", Action: "config", Scope: "system", Description: "Configure system settings"},
		{Name: "View Audit Logs", Resource: "audit", Action: "view", Scope: "system", Description: "View audit logs"},
		{Name: "System Backup", Resource: "system", Action: "backup", Scope: "system", Description: "Create system backups"},
		{Name: "System Restore", Resource: "system", Action: "restore", Scope: "system", Description: "Restore system from backup"},

		{Name: "View User Stats", Resource: "user", Action: "stats", Scope: "tenant", Description: "View user statistics"},
		{Name: "List Managers", Resource: "user", Action: "list", Scope: "tenant", Description: "List managers"},
		{Name: "View Role Stats", Resource: "role", Action: "stats", Scope: "tenant", Description: "View role statistics"},
		{Name: "View Permission Stats", Resource: "permission", Action: "stats", Scope: "tenant", Description: "View permission statistics"},
		{Name: "Create Menu Items", Resource: "menu", Action: "create", Scope: "tenant", Description: "Create menu items"},
		{Name: "Read Menu Items", Resource: "menu", Action: "view", Scope: "tenant", Description: "Read menu items"},
		{Name: "Update Menu Items", Resource: "menu", Action: "update", Scope: "tenant", Description: "Update menu items"},
		{Name: "Delete Menu Items", Resource: "menu", Action: "delete", Scope: "tenant", Description: "Delete menu items"},
	}

	for _, permission := range permissions {
		// Set default tenant ID to satisfy validation
		permission.TenantID = 1
		
		var existingPermission models.Permission
		if err := s.DB.Where("name = ?", permission.Name).First(&existingPermission).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := s.DB.Create(&permission).Error; err != nil {
					log.Printf("Error creating permission %s: %v", permission.Name, err)
					return err
				}
				log.Printf("Created permission: %s", permission.Name)
			} else {
				return err
			}
		} else {
			log.Printf("Permission %s already exists, skipping", permission.Name)
		}
	}

	return nil
}

// SeedDefaultTenant creates a default tenant
func (s *Seeder) SeedDefaultTenant() error {
	log.Println("Seeding default tenant...")

	tenant := models.Tenant{
		Name:             "Reksolindo Organization",
		Subdomain:        "reksolindo",
		Status:           "active",
		SubscriptionPlan: "premium",
		MaxUsers:         100,
		MaxStorageGB:     10,
	}

	var existingTenant models.Tenant
	if err := s.DB.Where("subdomain = ?", tenant.Subdomain).First(&existingTenant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			if err := s.DB.Create(&tenant).Error; err != nil {
				log.Printf("Error creating default tenant: %v", err)
				return err
			}
			log.Printf("Created default tenant: %s", tenant.Name)
		} else {
			return err
		}
	} else {
		log.Printf("Default tenant already exists, skipping")
	}

	return nil
}

// SeedDefaultUser creates a default admin user
func (s *Seeder) SeedDefaultUser() error {
	log.Println("Seeding default user...")

	// Get the default tenant
	var tenant models.Tenant
	if err := s.DB.Where("subdomain = ?", "reksolindo").First(&tenant).Error; err != nil {
		log.Printf("Error finding default tenant: %v", err)
		return err
	}

	// Create default admin user
	user := models.User{
		TenantID:  tenant.ID,
		Username:  "admin",
		Email:     "admin@reksolindo.com",
		FirstName: "System",
		LastName:  "Administrator",
		FullName:  func(s string) *string { return &s }("System Administrator"),
		IsAdmin:      true,
		IsSuperuser:  true,
		IsActive:     true,
	}

	// Set password
	passwordHash, err := utils.HashPassword("admin123!")
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return err
	}
	user.PasswordHash = passwordHash

	var existingUser models.User
	if err := s.DB.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			if err := s.DB.Create(&user).Error; err != nil {
				log.Printf("Error creating default user: %v", err)
				return err
			}
			log.Printf("Created default user: %s", user.Email)

			// Assign super admin role
			if err := s.AssignSuperAdminRole(user.ID, tenant.ID); err != nil {
				log.Printf("Error assigning super admin role: %v", err)
				return err
			}
		} else {
			return err
		}
	} else {
		log.Printf("Default user already exists, skipping")
	}

	return nil
}

// AssignSuperAdminRole assigns the super admin role to a user
func (s *Seeder) AssignSuperAdminRole(userID, tenantID int) error {
	// Get super admin role
	var role models.Role
	if err := s.DB.Where("code = ?", "super_admin").First(&role).Error; err != nil {
		return err
	}

	// Check if role assignment already exists
	var userRole models.UserRole
	if err := s.DB.Where("user_id = ? AND role_id = ? AND tenant_id = ?", userID, role.ID, tenantID).First(&userRole).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create user role assignment
			userRole = models.UserRole{
				UserID:   userID,
				RoleID:   role.ID,
				TenantID: tenantID,
			}

			if err := s.DB.Create(&userRole).Error; err != nil {
				return err
			}
			log.Printf("Assigned super admin role to user %d", userID)
		} else {
			return err
		}
	}

	return nil
}

// SeedRolePermissions assigns permissions to roles
func (s *Seeder) SeedRolePermissions() error {
	log.Println("Seeding role permissions...")

	// Super Admin gets all permissions
	var superAdminRole models.Role
	if err := s.DB.Where("code = ?", "super_admin").First(&superAdminRole).Error; err != nil {
		return err
	}

	var permissions []models.Permission
	if err := s.DB.Find(&permissions).Error; err != nil {
		return err
	}

	for _, permission := range permissions {
		var rolePermission models.RolePermission
		if err := s.DB.Where("role_id = ? AND permission_id = ?", superAdminRole.ID, permission.ID).First(&rolePermission).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				rolePermission = models.RolePermission{
					RoleID:       superAdminRole.ID,
					PermissionID: permission.ID,
				}
				if err := s.DB.Create(&rolePermission).Error; err != nil {
					log.Printf("Error assigning permission %s to super admin: %v", permission.Name, err)
					return err
				}
			}
		}
	}

	log.Printf("Assigned all permissions to super admin role")
	return nil
}
