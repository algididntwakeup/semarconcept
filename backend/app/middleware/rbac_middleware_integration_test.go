//go:build integration

// platform/backend/app/middleware/rbac_middleware_integration_test.go

package middleware

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/app/config"
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/services"
	"backend/app/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
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

	teardown := func() {}

	if rbacTestDB == nil {
		t.Log("WARN: Test database not available. Integration test will be skipped.")
		return teardown
	}

	jwtService := utils.NewJWTService(cfg.JWT.SecretKey, "reksolindo-test")
	roleRepo := repositories.NewGormRoleRepository(rbacTestDB)
	basicRoleRepo := repositories.NewBasicRoleRepository(rbacTestDB)
	userRoleRepo := repositories.NewBasicUserRoleRepository(rbacTestDB)

	authService := services.NewAuthService(
		nil,
		basicRoleRepo,
		userRoleRepo,
		nil,
		nil,
		jwtService,
		&cfg,
	)
	_ = authService

	// Setup Gin router
	gin.SetMode(gin.TestMode)
	rbacTestRouter = gin.New()
	apiV1 := rbacTestRouter.Group("/api/v1")

	// Register Protected Routes with RBAC Middleware
	protected := apiV1.Group("/protected-rbac")
	protected.Use(AuthMiddleware(jwtService)) // Apply Auth first
	{
		// Endpoint requiring 'edit:posts'
		protected.GET("/posts", RBACMiddleware(roleRepo, "edit:posts"), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You can edit posts!"})
		})
		// Endpoint requiring 'view:users'
		protected.GET("/users", RBACMiddleware(roleRepo, "view:users"), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You can view users!"})
		})
		// Endpoint requiring admin status
		protected.GET("/admin-only", RBACMiddleware(roleRepo, "admin:access"), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "Welcome Admin!"})
		})
	}

	return teardown
}

// seedRBACData populates the test database with users, roles, permissions.
func seedRBACData(t *testing.T, db *gorm.DB) {
	if db == nil {
		t.Log("Skipping test data seeding: DB not initialized.")
		return
	}
	// Hash password
	password := "password123"
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	// Create Permissions
	permEditPosts := models.Permission{Name: "edit:posts", Description: "Can edit posts", Resource: "posts", Action: "edit", TenantID: 1}
	permViewUsers := models.Permission{Name: "view:users", Description: "Can view users", Resource: "users", Action: "view", TenantID: 1}
	permAdmin := models.Permission{Name: "admin:access", Description: "Admin access", Resource: "admin", Action: "access", TenantID: 1}
	db.Create(&[]models.Permission{permEditPosts, permViewUsers, permAdmin})

	// Create Roles
	roleAdmin := models.Role{Name: "Admin", Code: "admin", Description: "Administrator Role", TenantID: 1}
	roleEditor := models.Role{Name: "Editor", Code: "editor", Description: "Editor Role", TenantID: 1}
	roleViewer := models.Role{Name: "Viewer", Code: "viewer", Description: "Viewer Role", TenantID: 1}
	db.Create(&[]models.Role{roleAdmin, roleEditor, roleViewer})

	// Assign Permissions to Roles
	db.Model(&roleAdmin).Association("Permissions").Append(&[]models.Permission{permEditPosts, permViewUsers, permAdmin})
	db.Model(&roleEditor).Association("Permissions").Append(&permEditPosts)
	db.Model(&roleViewer).Association("Permissions").Append(&permViewUsers)

	// Create Users
	userAdmin := models.User{Username: "rbac_admin", Email: "rbac_admin@test.com", PasswordHash: hashedPassword, IsActive: true, IsAdmin: true, TenantID: 1}
	userEditor := models.User{Username: "rbac_editor", Email: "rbac_editor@test.com", PasswordHash: hashedPassword, IsActive: true, TenantID: 1}
	userViewer := models.User{Username: "rbac_viewer", Email: "rbac_viewer@test.com", PasswordHash: hashedPassword, IsActive: true, TenantID: 1}
	userNoPerms := models.User{Username: "rbac_noperms", Email: "rbac_noperms@test.com", PasswordHash: hashedPassword, IsActive: true, TenantID: 1}
	db.Create(&[]models.User{userAdmin, userEditor, userViewer, userNoPerms})

	// Assign Roles to Users
	db.Model(&userAdmin).Association("Roles").Append(&roleAdmin)
	db.Model(&userEditor).Association("Roles").Append(&roleEditor)
	db.Model(&userViewer).Association("Roles").Append(&roleViewer)
}

// Helper to perform login and get token
func loginUserForRBAC(t *testing.T, username, password string) string {
	loginPayload := request.LoginRequest{Identifier: username, Password: password}
	payloadBytes, _ := json.Marshal(loginPayload)
	reqLogin, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(payloadBytes))
	reqLogin.Header.Set("Content-Type", "application/json")
	wLogin := httptest.NewRecorder()
	rbacTestRouter.ServeHTTP(wLogin, reqLogin)
	assert.Equal(t, http.StatusOK, wLogin.Code, "Login failed for user "+username)
	var loginResp response.LoginResponse
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
