// platform/backend/app/services/auth_service_test.go

package services

import (
	"context"
	"testing"

	"backend/app/config"
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// MockUserRepository is a mock type for the UserRepository interface
type MockUserRepository struct {
	repositories.UserRepository
	mock.Mock
}

func (m *MockUserRepository) FindByUsernameOrEmail(ctx context.Context, username, email string) (*models.User, error) {
	args := m.Called(ctx, username, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) UpdateLastLogin(ctx context.Context, id int) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestAuthService_Login(t *testing.T) {
	testSecret := "test-secret-key-that-is-sufficiently-long-for-hmac-sha256"
	testIssuer := "reksolindo-test"
	jwtService := utils.NewJWTService(testSecret, testIssuer)

	cfg := &config.Config{
		JWT: config.JWTConfig{
			SecretKey:            testSecret,
			AccessTokenDuration:  60, // 60 minutes
			RefreshTokenDuration: 24, // 24 hours
		},
	}

	// Pre-hash password for testing
	hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	assert.NoError(t, err)
	hashedPassword := string(hashedPasswordBytes)

	testUser := &models.User{
		ID:           1,
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: hashedPassword,
		FirstName:    "Test",
		LastName:     "User",
		IsActive:     true,
		IsSuperuser:  false,
		TenantID:     1,
	}

	inactiveUser := &models.User{
		ID:           2,
		Username:     "inactiveuser",
		Email:        "inactive@example.com",
		PasswordHash: hashedPassword,
		FirstName:    "Inactive",
		LastName:     "User",
		IsActive:     false,
		IsSuperuser:  false,
		TenantID:     1,
	}

	testCases := []struct {
		name          string
		loginRequest  request.LoginRequest
		setupMocks    func(mockUserRepo *MockUserRepository)
		expectError   bool
		expectedError string
	}{
		{
			name: "Successful Login via Username",
			loginRequest: request.LoginRequest{
				Identifier: "testuser",
				Password:   "password123",
			},
			setupMocks: func(mockUserRepo *MockUserRepository) {
				mockUserRepo.On("FindByUsernameOrEmail", mock.Anything, "testuser", "testuser").Return(testUser, nil).Once()
				mockUserRepo.On("UpdateLastLogin", mock.Anything, testUser.ID).Return(nil).Once()
			},
			expectError: false,
		},
		{
			name: "Successful Login via Email",
			loginRequest: request.LoginRequest{
				Identifier: "test@example.com",
				Password:   "password123",
			},
			setupMocks: func(mockUserRepo *MockUserRepository) {
				mockUserRepo.On("FindByUsernameOrEmail", mock.Anything, "test@example.com", "test@example.com").Return(testUser, nil).Once()
				mockUserRepo.On("UpdateLastLogin", mock.Anything, testUser.ID).Return(nil).Once()
			},
			expectError: false,
		},
		{
			name: "User Not Found",
			loginRequest: request.LoginRequest{
				Identifier: "unknownuser",
				Password:   "password123",
			},
			setupMocks: func(mockUserRepo *MockUserRepository) {
				mockUserRepo.On("FindByUsernameOrEmail", mock.Anything, "unknownuser", "unknownuser").Return(nil, utils.ErrUserNotFound).Once()
			},
			expectError:   true,
			expectedError: "invalid credentials",
		},
		{
			name: "Incorrect Password",
			loginRequest: request.LoginRequest{
				Identifier: "testuser",
				Password:   "wrongpassword",
			},
			setupMocks: func(mockUserRepo *MockUserRepository) {
				mockUserRepo.On("FindByUsernameOrEmail", mock.Anything, "testuser", "testuser").Return(testUser, nil).Once()
			},
			expectError:   true,
			expectedError: "invalid credentials",
		},
		{
			name: "Inactive User",
			loginRequest: request.LoginRequest{
				Identifier: "inactiveuser",
				Password:   "password123",
			},
			setupMocks: func(mockUserRepo *MockUserRepository) {
				mockUserRepo.On("FindByUsernameOrEmail", mock.Anything, "inactiveuser", "inactiveuser").Return(inactiveUser, nil).Once()
			},
			expectError:   true,
			expectedError: "user account is inactive",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockUserRepo := new(MockUserRepository)
			authService := NewAuthService(
				mockUserRepo,
				nil, // roleRepo
				nil, // userRoleRepo
				nil, // passwordResetRepo
				nil, // tenantService (falls back to default tenant)
				jwtService,
				cfg,
			)

			tc.setupMocks(mockUserRepo)

			ctx := context.Background()
			loginResponse, err := authService.Login(ctx, tc.loginRequest)

			if tc.expectError {
				assert.Error(t, err)
				assert.Nil(t, loginResponse)
				if tc.expectedError != "" {
					assert.Contains(t, err.Error(), tc.expectedError)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, loginResponse)
				assert.NotEmpty(t, loginResponse.AccessToken)
				assert.NotEmpty(t, loginResponse.RefreshToken)
				assert.NotNil(t, loginResponse.User)
				assert.Equal(t, testUser.Username, loginResponse.User.Username)
				assert.Equal(t, testUser.Email, loginResponse.User.Email)
				assert.NotNil(t, loginResponse.Tenant)
			}

			mockUserRepo.AssertExpectations(t)
		})
	}
}
