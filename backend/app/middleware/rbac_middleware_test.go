// platform/backend/app/middleware/rbac_middleware_test.go

package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/app/models"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRBACRoleProvider mocks the RBACRoleProvider interface
type MockRBACRoleProvider struct {
	mock.Mock
}

func (m *MockRBACRoleProvider) FindRolesByUserID(ctx context.Context, userID int) ([]models.Role, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Role), args.Error(1)
}

func (m *MockRBACRoleProvider) GetRolePermissions(ctx context.Context, roleID int) ([]models.Permission, error) {
	args := m.Called(ctx, roleID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Permission), args.Error(1)
}

func setupTestGinRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	return router
}

func TestRBACMiddleware_NoUserIdentity(t *testing.T) {
	mockProvider := new(MockRBACRoleProvider)
	router := setupTestGinRouter()

	router.GET("/test", RBACMiddleware(mockProvider, "asset:read"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.Contains(t, w.Body.String(), "Access denied: user identity not found")
}

func TestRBACMiddleware_SuperuserBypass(t *testing.T) {
	mockProvider := new(MockRBACRoleProvider)
	router := setupTestGinRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set(string(ContextUserIDKey), 1)
		c.Set(string(ContextIsSuperuserKey), true)
		c.Next()
	}, RBACMiddleware(mockProvider, "asset:delete"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "ok")
	// Provider should not even be called when user is superuser
	mockProvider.AssertNotCalled(t, "FindRolesByUserID")
}

func TestRBACMiddleware_GrantedPermission(t *testing.T) {
	mockProvider := new(MockRBACRoleProvider)
	userID := 10
	roleID := 2

	InvalidatePermissionCache(userID)

	mockProvider.On("FindRolesByUserID", mock.Anything, userID).Return([]models.Role{
		{ID: roleID, Name: "AssetManager"},
	}, nil).Once()

	mockProvider.On("GetRolePermissions", mock.Anything, roleID).Return([]models.Permission{
		{Resource: "asset", Action: "read"},
	}, nil).Once()

	router := setupTestGinRouter()
	router.GET("/test", func(c *gin.Context) {
		c.Set(string(ContextUserIDKey), userID)
		c.Set(string(ContextIsSuperuserKey), false)
		c.Next()
	}, RBACMiddleware(mockProvider, "asset:read"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "ok")
	mockProvider.AssertExpectations(t)
}

func TestRBACMiddleware_WildcardPermission(t *testing.T) {
	mockProvider := new(MockRBACRoleProvider)
	userID := 20
	roleID := 3

	InvalidatePermissionCache(userID)

	mockProvider.On("FindRolesByUserID", mock.Anything, userID).Return([]models.Role{
		{ID: roleID, Name: "Admin"},
	}, nil).Once()

	mockProvider.On("GetRolePermissions", mock.Anything, roleID).Return([]models.Permission{
		{Resource: "*", Action: "*"},
	}, nil).Once()

	router := setupTestGinRouter()
	router.GET("/test", func(c *gin.Context) {
		c.Set(string(ContextUserIDKey), userID)
		c.Set(string(ContextIsSuperuserKey), false)
		c.Next()
	}, RBACMiddleware(mockProvider, "any:permission:here"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockProvider.AssertExpectations(t)
}

func TestRBACMiddleware_DeniedPermission(t *testing.T) {
	mockProvider := new(MockRBACRoleProvider)
	userID := 30
	roleID := 4

	InvalidatePermissionCache(userID)

	mockProvider.On("FindRolesByUserID", mock.Anything, userID).Return([]models.Role{
		{ID: roleID, Name: "Viewer"},
	}, nil).Once()

	mockProvider.On("GetRolePermissions", mock.Anything, roleID).Return([]models.Permission{
		{Resource: "asset", Action: "read"},
	}, nil).Once()

	router := setupTestGinRouter()
	router.GET("/test", func(c *gin.Context) {
		c.Set(string(ContextUserIDKey), userID)
		c.Set(string(ContextIsSuperuserKey), false)
		c.Next()
	}, RBACMiddleware(mockProvider, "asset:delete"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.Contains(t, w.Body.String(), "Access denied: you do not have the required permission")
	mockProvider.AssertExpectations(t)
}
