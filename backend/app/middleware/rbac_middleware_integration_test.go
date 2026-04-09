// platform/backend/app/middleware/rbac_middleware_integration_test.go

package middleware

import (
	"bytes"
	"encoding/json"

	// "errors" // Removed unused import
	// "fmt" // Removed unused import
	"backend/app/config"
	"net/http"
	"net/http/httptest"

	// "backend/app/database" // Assuming GetTestDB is here
	"backend/app/models"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
	// Import necessary DB drivers and potentially testcontainers later
)

// --- Test Setup ---

var rbacTestDB *gorm.DB
var rbacTestRouter *gin.Engine

// setupRBACIntegrationTest initializes DB, seeds RBAC data, and sets up router.
func setupRBACIntegrationTest(t *testing.T) func() {
	cfg, err := config.LoadConfig("../..")
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// --- Database Setup (Commented Out) ---
	// Use a real test DB setup function (replace placeholder)
	// rbacTestDB, err = database.GetTestDB(cfg) // Assumes GetTestDB exists and works
	// if err != nil {
	// 	t.Fatalf("Failed to connect to test database: %v", err)
	// }

	// Auto-migrate necessary models
	// err = rbacTestDB.AutoMigrate(&models.User{}, &models.Role{}, &models.Permission{}, &models.UserRole{}, &models.RolePermission{}) // Assuming UserRole and RolePermission models exist
	// if err != nil {
	// 	t.Fatalf("Failed to migrate test database: %v", err)
	// }

	// Seed RBAC test data
	// seedRBACData(t, rbacTestDB)
	// --- End Database Setup ---

	// Initialize dependencies (using nil DB for now)
	// TODO: Replace nil with actual testDB once GetTestDB is implemented
	var userRepo repositories.UserRepository
	var roleRepo repositories.RoleRepository // Declare roleRepo
	if rbacTestDB != nil {                   // Only create repo if DB setup succeeded
		userRepo = repositories.NewGormUserRepository(rbacTestDB)
		roleRepo = repositories.NewGormRoleRepository(rbacTestDB) // Assuming this exists
	} else {
		t.Log("WARN: Test database not available, repository operations requiring DB will fail or need mocks.")
	}

	// Ensure repos are not nil before passing to service
	if userRepo == nil || roleRepo == nil {
		t.Fatal("Repositories are nil, cannot proceed with test setup.")
	}

	authService := services.NewAuthService(userRepo, &cfg.JWT)

	// Setup Gin router
	gin.SetMode(gin.TestMode)
	rbacTestRouter = gin.New()
	apiV1 := rbacTestRouter.Group("/api/v1")

	// Register Auth routes (needed for login to get tokens)
	// Assuming RegisterAuthRoutes exists in the 'api' package and takes *gin.RouterGroup
	// If it's defined elsewhere or takes *gin.Engine, adjust this call.
	// RegisterAuthRoutes(apiV1, authService) // This needs to be imported or defined correctly

	// Register Protected Routes with RBAC Middleware
	protected := apiV1.Group("/protected-rbac")
	protected.Use(AuthMiddleware(&cfg.JWT)) // Apply Auth first
	{
		// Endpoint requiring 'edit:posts'
		protected.GET("/posts", RBACMiddleware(roleRepo, "edit:posts"), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You can edit posts!"})
		})
		// Endpoint requiring 'view:users'
		protected.GET("/users", RBACMiddleware(roleRepo, "view:users"), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You can view users!"})
		})
		// Endpoint requiring admin status (implicitly handled by RBACMiddleware)
		protected.GET("/admin-only", RBACMiddleware(roleRepo, "admin:access"), func(c *gin.Context) { // "admin:access" is arbitrary here
			c.JSON(http.StatusOK, gin.H{"message": "Welcome Admin!"})
		})
	}

	// Teardown function
	teardown := func() {
		// if rbacTestDB != nil {
		// 	sqlDB, _ := rbacTestDB.DB()
		// 	if sqlDB != nil {
		// 		// Drop tables in reverse order of creation/dependency
		// 		// rbacTestDB.Migrator().DropTable(&models.UserRole{}, &models.RolePermission{}) // Assuming these models exist
		// 		// rbacTestDB.Migrator().DropTable(&models.User{}, &models.Role{}, &models.Permission{})
		// 		sqlDB.Close()
		// 	}
		// }
	}

	return teardown
}

// Helper function to create string pointers for seeding
func strPtr(s string) *string {
	return &s
}

// seedRBACData populates the test database with users, roles, permissions.
// NOTE: This function will only work if testDB is initialized.
func seedRBACData(t *testing.T, db *gorm.DB) {
	if db == nil {
		t.Log("Skipping test data seeding: DB not initialized.")
		return
	}
	// Hash password
	password := "password123"
	hashedPassword, err := utils.HashPassword(password) // Correct package
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	// Create Permissions
	permEditPosts := models.Permission{Name: "edit:posts", Description: strPtr("Can edit posts")}
	permViewUsers := models.Permission{Name: "view:users", Description: strPtr("Can view users")}
	permAdmin := models.Permission{Name: "admin:access", Description: strPtr("Admin access")} // For admin-only route test
	db.Create(&[]models.Permission{permEditPosts, permViewUsers, permAdmin})

	// Create Roles
	roleAdmin := models.Role{Name: "Admin", Description: strPtr("Administrator Role")}
	roleEditor := models.Role{Name: "Editor", Description: strPtr("Editor Role")}
	roleViewer := models.Role{Name: "Viewer", Description: strPtr("Viewer Role")}
	db.Create(&[]models.Role{roleAdmin, roleEditor, roleViewer})

	// Assign Permissions to Roles
	// Ensure associations are handled correctly (might need explicit join table entries depending on GORM setup)
	db.Model(&roleAdmin).Association("Permissions").Append(&[]models.Permission{permEditPosts, permViewUsers, permAdmin})
	db.Model(&roleEditor).Association("Permissions").Append(&permEditPosts)
	db.Model(&roleViewer).Association("Permissions").Append(&permViewUsers)

	// Create Users
	userAdmin := models.User{Username: "rbac_admin", Email: "rbac_admin@test.com", PasswordHash: hashedPassword, IsActive: true, IsAdmin: true} // Explicitly Admin
	userEditor := models.User{Username: "rbac_editor", Email: "rbac_editor@test.com", PasswordHash: hashedPassword, IsActive: true}
	userViewer := models.User{Username: "rbac_viewer", Email: "rbac_viewer@test.com", PasswordHash: hashedPassword, IsActive: true}
	userNoPerms := models.User{Username: "rbac_noperms", Email: "rbac_noperms@test.com", PasswordHash: hashedPassword, IsActive: true}
	db.Create(&[]models.User{userAdmin, userEditor, userViewer, userNoPerms})

	// Assign Roles to Users
	// Ensure associations are handled correctly
	db.Model(&userAdmin).Association("Roles").Append(&roleAdmin)
	db.Model(&userEditor).Association("Roles").Append(&roleEditor)
	db.Model(&userViewer).Association("Roles").Append(&roleViewer)
	// userNoPerms has no roles assigned
}

// Helper to perform login and get token
func loginUserForRBAC(t *testing.T, username, password string) string {
	loginPayload := services.LoginRequest{Identifier: username, Password: password}
	payloadBytes, _ := json.Marshal(loginPayload)
	reqLogin, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(payloadBytes))
	reqLogin.Header.Set("Content-Type", "application/json")
	wLogin := httptest.NewRecorder()
	rbacTestRouter.ServeHTTP(wLogin, reqLogin)
	assert.Equal(t, http.StatusOK, wLogin.Code, "Login failed for user "+username)
	var loginResp services.LoginResponse
	err := json.Unmarshal(wLogin.Body.Bytes(), &loginResp)
	assert.NoError(t, err)
	return loginResp.AccessToken
}

// --- Test Cases ---

func TestRBACMiddleware(t *testing.T) {
	teardown := setupRBACIntegrationTest(t)
	defer teardown()

	if rbacTestDB == nil {
		t.Skip("Skipping RBAC test: Test database not available.")
	}

	// Get tokens for different users
	adminToken := loginUserForRBAC(t, "rbac_admin", "password123")
	editorToken := loginUserForRBAC(t, "rbac_editor", "password123")
	viewerToken := loginUserForRBAC(t, "rbac_viewer", "password123")
	noPermsToken := loginUserForRBAC(t, "rbac_noperms", "password123")

	testCases := []struct {
		name           string
		token          string
		path           string
		expectedStatus int
	}{
		// Admin Access
		{"Admin accessing edit:posts", adminToken, "/api/v1/protected-rbac/posts", http.StatusOK},
		{"Admin accessing view:users", adminToken, "/api/v1/protected-rbac/users", http.StatusOK},
		{"Admin accessing admin-only", adminToken, "/api/v1/protected-rbac/admin-only", http.StatusOK},

		// Editor Access (has edit:posts)
		{"Editor accessing edit:posts", editorToken, "/api/v1/protected-rbac/posts", http.StatusOK},
		{"Editor accessing view:users", editorToken, "/api/v1/protected-rbac/users", http.StatusForbidden},
		{"Editor accessing admin-only", editorToken, "/api/v1/protected-rbac/admin-only", http.StatusForbidden},

		// Viewer Access (has view:users)
		{"Viewer accessing edit:posts", viewerToken, "/api/v1/protected-rbac/posts", http.StatusForbidden},
		{"Viewer accessing view:users", viewerToken, "/api/v1/protected-rbac/users", http.StatusOK},
		{"Viewer accessing admin-only", viewerToken, "/api/v1/protected-rbac/admin-only", http.StatusForbidden},

		// No Permissions User Access
		{"NoPerms accessing edit:posts", noPermsToken, "/api/v1/protected-rbac/posts", http.StatusForbidden},
		{"NoPerms accessing view:users", noPermsToken, "/api/v1/protected-rbac/users", http.StatusForbidden},
		{"NoPerms accessing admin-only", noPermsToken, "/api/v1/protected-rbac/admin-only", http.StatusForbidden},

		// Unauthenticated Access
		{"Unauthenticated accessing edit:posts", "", "/api/v1/protected-rbac/posts", http.StatusUnauthorized},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, tc.path, nil)
			if tc.token != "" {
				req.Header.Set("Authorization", "Bearer "+tc.token)
			}
			w := httptest.NewRecorder()
			rbacTestRouter.ServeHTTP(w, req)
			assert.Equal(t, tc.expectedStatus, w.Code)
		})
	}
}
