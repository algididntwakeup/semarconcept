// platform/backend/app/services/auth_service_test.go

package services

import (
	"backend/app/config"
	"backend/app/models"
	"context"
	"errors"

	// "backend/app/repositories" // Interface is used, but mock implements it below
	"backend/app/utils" // Assuming CheckPasswordHash is here
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserRepository is a mock type for the UserRepository interface
type MockUserRepository struct {
	mock.Mock
}

// Implement mock methods for UserRepository interface here...
func (m *MockUserRepository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) UpdateLastLogin(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// Add other required methods to satisfy the interface
func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}
func (m *MockUserRepository) GetByID(ctx context.Context, id uint) (*models.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}
func (m *MockUserRepository) Update(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}
func (m *MockUserRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockUserRepository) List(ctx context.Context, limit, offset int) ([]models.User, int64, error) {
	args := m.Called(ctx, limit, offset)
	if args.Get(0) == nil {
		return nil, int64(args.Int(1)), args.Error(2)
	}
	return args.Get(0).([]models.User), int64(args.Int(1)), args.Error(2)
}

// --- We will use the actual utils.CheckPasswordHash for simplicity in this example ---
// --- Assuming utils.GenerateAccessToken and utils.GenerateRefreshToken are deterministic enough for testing or can be mocked if needed ---

func TestAuthService_Login(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	// Use a fixed, known test secret and durations, matching config.JWTConfig fields
	mockJwtConfig := &config.JWTConfig{
		SecretKey:            "test-secret-key-that-is-long-enough",
		AccessTokenDuration:  60, // 60 minutes = 1 hour
		RefreshTokenDuration: 24, // 24 hours
	}

	// Initialize the AuthService with mocks
	authService := NewAuthService(mockUserRepo, mockJwtConfig)

	// Pre-hash a password for testing
	hashedPassword, _ := utils.HashPassword("password123")

	testUser := &models.User{
		ID:           1,
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: hashedPassword,
		IsActive:     true,
		IsSuperuser:  false, // Changed IsAdmin to IsSuperuser
	}

	inactiveUser := &models.User{
		ID:           2,
		Username:     "inactiveuser",
		Email:        "inactive@example.com",
		PasswordHash: hashedPassword, // Use same hash for simplicity
		IsActive:     false,
		IsSuperuser:  false, // Changed IsAdmin to IsSuperuser
	}

	// Define test cases
	testCases := []struct {
		name          string
		loginRequest  LoginRequest
		setupMocks    func()
		expectError   bool
		expectedError string // Specific error message if expectError is true
	}{
		{
			name: "Successful Login via Username",
			loginRequest: LoginRequest{
				Identifier: "testuser",
				Password:   "password123",
			},
			setupMocks: func() {
				mockUserRepo.On("GetByUsername", mock.Anything, "testuser").Return(testUser, nil).Once()
				// Expect UpdateLastLogin to be called
				mockUserRepo.On("UpdateLastLogin", mock.Anything, testUser.ID).Return(nil).Once()
			},
			expectError: false,
		},
		{
			name: "Successful Login via Email",
			loginRequest: LoginRequest{
				Identifier: "test@example.com",
				Password:   "password123",
			},
			setupMocks: func() {
				// Simulate user not found by username, then found by email
				mockUserRepo.On("GetByUsername", mock.Anything, "test@example.com").Return(nil, errors.New("user not found")).Once()
				mockUserRepo.On("GetByEmail", mock.Anything, "test@example.com").Return(testUser, nil).Once()
				mockUserRepo.On("UpdateLastLogin", mock.Anything, testUser.ID).Return(nil).Once()
			},
			expectError: false,
		},
		{
			name: "User Not Found",
			loginRequest: LoginRequest{
				Identifier: "unknownuser",
				Password:   "password123",
			},
			setupMocks: func() {
				mockUserRepo.On("GetByUsername", mock.Anything, "unknownuser").Return(nil, errors.New("user not found")).Once()
				mockUserRepo.On("GetByEmail", mock.Anything, "unknownuser").Return(nil, errors.New("user not found")).Once()
				// UpdateLastLogin should not be called
			},
			expectError:   true,
			expectedError: "invalid credentials", // Service returns generic error
		},
		{
			name: "Incorrect Password",
			loginRequest: LoginRequest{
				Identifier: "testuser",
				Password:   "wrongpassword",
			},
			setupMocks: func() {
				mockUserRepo.On("GetByUsername", mock.Anything, "testuser").Return(testUser, nil).Once()
				// UpdateLastLogin should not be called
			},
			expectError:   true,
			expectedError: "invalid credentials",
		},
		{
			name: "Inactive User",
			loginRequest: LoginRequest{
				Identifier: "inactiveuser",
				Password:   "password123", // Correct password for inactive user
			},
			setupMocks: func() {
				mockUserRepo.On("GetByUsername", mock.Anything, "inactiveuser").Return(inactiveUser, nil).Once()
				// UpdateLastLogin should not be called
			},
			expectError:   true,
			expectedError: "account is inactive",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Reset mocks for each run if necessary (though .Once() helps)
			mockUserRepo = new(MockUserRepository)                    // Recreate mock for clean state
			authService = NewAuthService(mockUserRepo, mockJwtConfig) // Re-inject
			tc.setupMocks()

			ctx := context.Background()
			loginResponse, err := authService.Login(ctx, tc.loginRequest)

			// Assertions using testify/assert
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
				assert.Equal(t, testUser.Username, loginResponse.User.Username) // Check correct user returned
				assert.Empty(t, loginResponse.User.PasswordHash)                // Ensure hash is cleared
			}

			mockUserRepo.AssertExpectations(t) // Verify mock expectations were met
		})
	}
}

// TODO: Add tests for RefreshToken
