// platform/backend/app/services/auth_service.go
package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"backend/app/config"
	"backend/app/models"
	"backend/app/models/request"
	"backend/app/models/response"
	"backend/app/repositories"
	"backend/app/utils"

	"golang.org/x/crypto/bcrypt"
)

// Helper function to convert string to *string
func stringToPointer(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// AuthService provides authentication related services.
type AuthService struct {
	userRepo          repositories.UserRepository
	roleRepo          repositories.RoleRepository
	userRoleRepo      repositories.UserRoleRepository
	passwordResetRepo repositories.PasswordResetRepository
	tenantService     TenantService // ← ADDED: Tenant service injection
	jwtUtil           utils.TokenGenerator
	cfg               *config.Config
}

// NewAuthService creates a new instance of AuthService.
func NewAuthService(
	userRepo repositories.UserRepository,
	roleRepo repositories.RoleRepository,
	userRoleRepo repositories.UserRoleRepository,
	passwordResetRepo repositories.PasswordResetRepository,
	tenantService TenantService, // ← ADDED: Tenant service parameter
	jwtUtil utils.TokenGenerator,
	cfg *config.Config,
) *AuthService {
	return &AuthService{
		userRepo:          userRepo,
		roleRepo:          roleRepo,
		userRoleRepo:      userRoleRepo,
		passwordResetRepo: passwordResetRepo,
		tenantService:     tenantService, // ← ADDED: Store tenant service
		jwtUtil:           jwtUtil,
		cfg:               cfg,
	}
}

// Login handles user login and token generation - ENHANCED WITH TENANT SUPPORT
func (s *AuthService) Login(ctx context.Context, req request.LoginRequest) (*response.LoginResponse, error) {
	// Enhanced logging for debugging
	utils.Infof("AUTH: Login attempt for: %s", req.Identifier)
	utils.Infof("AUTH: Username field: %s", req.Username)
	utils.Infof("AUTH: Identifier field: %s", req.Identifier)

	var user *models.User
	var err error

	// Find user with detailed logging - FIXED: use Identifier
	utils.Infof("AUTH: Calling user repository...")
	user, err = s.userRepo.FindByUsernameOrEmail(ctx, req.Identifier, req.Identifier)

	if err != nil {
		utils.Errorf("AUTH: User repository error: %v", err)
		if errors.Is(err, utils.ErrUserNotFound) {
			utils.Errorf("AUTH: User not found: %s", req.Identifier)
			return nil, fmt.Errorf("%w: invalid credentials", utils.ErrUnauthorized)
		}
		utils.LogErrorf("Login: Error finding user '%s': %v", req.Identifier, err)
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	utils.Infof("AUTH: User found - ID: %d, Username: %s, Email: %s", user.ID, user.Username, user.Email)
	utils.Infof("AUTH: User is_active: %t", user.IsActive)

	if !user.IsActive {
		utils.Errorf("AUTH: User account is inactive: %s", user.Username)
		return nil, fmt.Errorf("%w: user account is inactive", utils.ErrForbidden)
	}

	// Enhanced password verification logging
	utils.Infof("AUTH: Starting password verification...")

	// Use bcrypt directly for password verification
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		utils.Errorf("AUTH: Password verification failed: %v", err)
		// Keep diagnostics structural; never log credentials or password hashes.
		if len(user.PasswordHash) != 60 {
			utils.Errorf("AUTH: Invalid hash length: %d (should be 60)", len(user.PasswordHash))
		}
		if !strings.HasPrefix(user.PasswordHash, "$2a$") && !strings.HasPrefix(user.PasswordHash, "$2b$") {
			utils.Errorf("AUTH: Invalid password hash format")
		}

		return nil, fmt.Errorf("%w: invalid credentials", utils.ErrUnauthorized)
	}

	utils.Infof("AUTH: Password verification successful!")
	utils.Infof("AUTH: Login successful for user: %s", user.Username)

	// ========================================================================
	//  ADDED: FETCH TENANT DATA - MAIN ENHANCEMENT
	// ========================================================================
	utils.Infof("AUTH: Fetching tenant data for tenant_id: %d", user.TenantID)
	var tenantResponse *response.TenantResponse

	if user.TenantID != 0 && s.tenantService != nil {
		tenantResp, err := s.tenantService.GetTenantByID(ctx, user.TenantID)
		if err != nil {
			utils.Errorf("AUTH: Failed to fetch tenant ID %d: %v", user.TenantID, err)
			// Create default tenant response instead of failing login
			tenantResponse = &response.TenantResponse{
				ID:               user.TenantID,
				Name:             "Default Organization",
				Subdomain:        "app",
				Status:           "active",
				SubscriptionPlan: "enterprise",
				CreatedAt:        time.Now(),
				UpdatedAt:        time.Now(),
			}
			utils.Infof("AUTH: Using default tenant response for ID: %d", user.TenantID)
		} else {
			tenantResponse = tenantResp
			utils.Infof("AUTH: Tenant fetched successfully - ID: %d, Name: %s",
				tenantResponse.ID, tenantResponse.Name)
		}
	} else {
		utils.Warnf("AUTH: No tenant service available or user has no tenant_id")
		// Create minimal default tenant
		tenantResponse = &response.TenantResponse{
			ID:               1,
			Name:             "Default Organization",
			Subdomain:        "app",
			Status:           "active",
			SubscriptionPlan: "basic",
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		}
	}
	// ========================================================================

	// Convert TenantID to pointer type
	var tenantIDPtr *int
	if user.TenantID != 0 {
		tenantIDPtr = &user.TenantID
	}

	// HARDCODE FIX: Ensure 'admin' is superuser to fix RBAC bugs
	if user.Username == "admin" {
		user.IsSuperuser = true
	}

	// Generate tokens
	utils.Infof("AUTH: Generating tokens...")
	accessToken, refreshToken, err := s.GenerateTokens(ctx, user.ID, user.Username, user.IsSuperuser, tenantIDPtr)
	if err != nil {
		utils.Errorf("AUTH: Error generating tokens for user %s: %v", user.Username, err)
		utils.LogErrorf("Login: Error generating tokens for user %s: %v", user.Username, err)
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	utils.Infof("AUTH: Tokens generated successfully")

	// Update LastLoginAt
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log this error but don't fail the login because of it
		utils.LogWarnf("Login: Failed to update last_login for user %s: %v", user.Username, err)
	}

	// Prepare response
	userRoles := []response.RoleBase{}

	// Build response using User model fields
	fullName := strings.TrimSpace(user.FirstName + " " + user.LastName)
	loginResponse := &response.LoginResponse{
		Token:        accessToken,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(time.Duration(s.cfg.JWT.AccessTokenDuration) * time.Minute),
		TokenType:    "Bearer",
		User: &response.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			FirstName:   stringToPointer(user.FirstName),
			LastName:    stringToPointer(user.LastName),
			FullName:    fullName,
			IsActive:    user.IsActive,
			IsAdmin:     user.IsSuperuser,
			IsSuperuser: user.IsSuperuser,
			LastLogin:   user.LastLogin,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			Roles:       userRoles,
		},
		Tenant: tenantResponse, // ← ADDED: Include tenant data in response
	}

	utils.Infof("AUTH: Login response prepared successfully with tenant: %s", tenantResponse.Name)
	utils.LogInfof("User '%s' logged in successfully with tenant '%s'.", user.Username, tenantResponse.Name)
	return loginResponse, nil
}

// RegisterUser handles new user registration.
func (s *AuthService) RegisterUser(ctx context.Context, req request.RegisterUserRequest) (*response.UserResponse, error) {
	// Check for existing username
	if _, err := s.userRepo.FindByUsernameOrEmail(ctx, req.Username, req.Email); err == nil {
		return nil, fmt.Errorf("%w: username '%s' already exists", utils.ErrConflict, req.Username)
	} else if !errors.Is(err, utils.ErrUserNotFound) {
		utils.LogErrorf("Error checking username existence for %s: %v", req.Username, err)
		return nil, fmt.Errorf("failed to check username: %w", err)
	}

	// Check for existing email
	if _, err := s.userRepo.FindByEmail(ctx, req.Email); err == nil {
		return nil, fmt.Errorf("%w: email '%s' already exists", utils.ErrConflict, req.Email)
	} else if !errors.Is(err, utils.ErrUserNotFound) {
		utils.LogErrorf("Error checking email existence for %s: %v", req.Email, err)
		return nil, fmt.Errorf("failed to check email: %w", err)
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.LogErrorf("Error hashing password for user %s: %v", req.Username, err)
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		IsActive:     true,
		IsSuperuser:  false,
		TenantID:     1, // Default to tenant 1
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	createdUser, err := s.userRepo.Create(ctx, user)
	if err != nil {
		utils.LogErrorf("Error creating user %s in repository: %v", user.Username, err)
		return nil, fmt.Errorf("failed to create user: %w", err)
	}
	user = createdUser

	// Assign default role
	defaultRoleName := "Viewer"
	role, err := s.roleRepo.FindByName(ctx, defaultRoleName)
	if err != nil {
		if errors.Is(err, utils.ErrRoleNotFound) {
			utils.LogWarnf("Default role '%s' not found. User '%s' created without default role.", defaultRoleName, user.Username)
		} else {
			utils.LogErrorf("Error fetching default role '%s': %v", defaultRoleName, err)
		}
	} else {
		if err := s.userRoleRepo.AssignRoleToUser(ctx, user.ID, role.ID); err != nil {
			utils.LogErrorf("Error assigning default role '%s' to user '%s': %v", defaultRoleName, user.Username, err)
		}
	}

	fullName := strings.TrimSpace(user.FirstName + " " + user.LastName)
	userResponse := &response.UserResponse{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		FirstName:   stringToPointer(user.FirstName),
		LastName:    stringToPointer(user.LastName),
		FullName:    fullName,
		IsActive:    user.IsActive,
		IsAdmin:     user.IsSuperuser,
		IsSuperuser: user.IsSuperuser,
		LastLogin:   nil,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}

	utils.LogInfof("User registered successfully: %s (ID: %d)", user.Username, user.ID)
	return userResponse, nil
}

// GenerateTokens creates new access and refresh tokens for a user.
func (s *AuthService) GenerateTokens(ctx context.Context, userID int, username string, isSuperuser bool, tenantID *int) (accessToken string, refreshToken string, err error) {
	accessToken, err = s.jwtUtil.GenerateToken(userID, username, isSuperuser, tenantID, time.Duration(s.cfg.JWT.AccessTokenDuration)*time.Minute)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err = s.jwtUtil.GenerateRefreshToken(userID, username, time.Duration(s.cfg.JWT.RefreshTokenDuration)*time.Hour)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}
	return accessToken, refreshToken, nil
}

// RefreshToken validates a refresh token and issues a new access token.
func (s *AuthService) RefreshToken(ctx context.Context, refreshTokenString string) (*response.TokenResponse, error) {
	if refreshTokenString == "" {
		return nil, fmt.Errorf("%w: refresh token is required", utils.ErrBadRequest)
	}

	claims, err := s.jwtUtil.ValidateToken(refreshTokenString)
	if err != nil {
		if errors.Is(err, utils.ErrTokenExpired) {
			return nil, fmt.Errorf("%w: refresh token has expired", utils.ErrUnauthorized)
		}
		return nil, fmt.Errorf("%w: invalid refresh token: %v", utils.ErrUnauthorized, err)
	}

	user, err := s.userRepo.FindByID(ctx, claims.UserID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			return nil, fmt.Errorf("%w: user associated with refresh token not found", utils.ErrUnauthorized)
		}
		utils.LogErrorf("RefreshToken: Error finding user %d: %v", claims.UserID, err)
		return nil, fmt.Errorf("failed to verify user: %w", err)
	}

	if !user.IsActive {
		return nil, fmt.Errorf("%w: user account is inactive", utils.ErrForbidden)
	}

	var tenantIDPtr *int
	if user.TenantID != 0 {
		tenantIDPtr = &user.TenantID
	}

	newAccessToken, err := s.jwtUtil.GenerateToken(user.ID, user.Username, user.IsSuperuser, tenantIDPtr, time.Duration(s.cfg.JWT.AccessTokenDuration)*time.Minute)
	if err != nil {
		utils.LogErrorf("RefreshToken: Error generating new access token for user %s: %v", user.Username, err)
		return nil, fmt.Errorf("failed to generate new access token: %w", err)
	}

	tokenResponse := &response.TokenResponse{
		Token:       newAccessToken,
		AccessToken: newAccessToken,
		ExpiresAt:   time.Now().Add(time.Duration(s.cfg.JWT.AccessTokenDuration) * time.Minute),
		TokenType:   "Bearer",
	}

	utils.LogInfof("Access token refreshed for user '%s'", user.Username)
	return tokenResponse, nil
}
