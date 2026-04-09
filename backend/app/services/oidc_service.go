// platform/backend/app/services/oidc_service.go
package services

import (
	"backend/app/config"
	"backend/app/models"
	"backend/app/repositories"
	"backend/app/utils"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"log"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

// OIDCProviderConfig holds configuration for a specific OIDC provider.
// This might be loaded from database or a separate config file.
type OIDCProviderConfig struct {
	ProviderName string // e.g., "google", "okta"
	ClientID     string
	ClientSecret string
	RedirectURL  string
	IssuerURL    string // e.g., "https://accounts.google.com"
	Scopes       []string
	// Add fields for custom claims mapping, etc.
}

// OIDCService defines the interface for OIDC authentication operations.
type OIDCService interface {
	// GetAuthorizationURL generates the URL to redirect the user to the OIDC provider.
	GetAuthorizationURL(ctx context.Context, providerName string, state string) (string, error)

	// HandleCallback processes the callback from the OIDC provider, exchanges code for tokens,
	// validates the ID token, and finds/creates a local user.
	// Returns local JWT tokens (access & refresh) on success.
	HandleCallback(ctx context.Context, providerName string, state string, code string) (accessToken string, refreshToken string, user *models.User, err error)
}

// oidcService implements the OIDCService interface.
type oidcService struct {
	cfg         *config.Config
	userRepo    repositories.UserRepository
	authService AuthService // To generate local JWTs after successful OIDC login
	// Store provider configs (could be map or loaded from DB/config service)
	providerConfigs map[string]*OIDCProviderConfig
	// Store initialized OIDC providers and OAuth2 configs
	oidcProviders map[string]*oidc.Provider
	oauth2Configs map[string]*oauth2.Config
}

// NewOIDCService creates a new instance of OIDCService.
func NewOIDCService(cfg *config.Config, userRepo repositories.UserRepository, authService AuthService) (OIDCService, error) {
	// TODO: Load providerConfigs from database or config file instead of hardcoding
	// Now using values from config struct (populated by .env)
	mockProviderConfigs := map[string]*OIDCProviderConfig{
		"google": { // Example for Google
			ProviderName: "google",
			ClientID:     cfg.OIDC.ClientID,
			ClientSecret: cfg.OIDC.ClientSecret,
			RedirectURL:  cfg.OIDC.RedirectURL,
			IssuerURL:    cfg.OIDC.IssuerURL,
			Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
		},
		// Add other providers here
	}

	s := &oidcService{
		cfg:             cfg,
		userRepo:        userRepo,
		authService:     authService,
		providerConfigs: mockProviderConfigs, // Use loaded configs
		oidcProviders:   make(map[string]*oidc.Provider),
		oauth2Configs:   make(map[string]*oauth2.Config),
	}

	// Initialize providers and configs
	for name, pCfg := range s.providerConfigs {
		provider, err := oidc.NewProvider(context.Background(), pCfg.IssuerURL)
		if err != nil {
			log.Printf("Failed to initialize OIDC provider '%s': %v", name, err)
			// Decide if this should be fatal or just log and disable the provider
			return nil, fmt.Errorf("failed to initialize OIDC provider '%s': %w", name, err)
		}
		s.oidcProviders[name] = provider
		s.oauth2Configs[name] = &oauth2.Config{
			ClientID:     pCfg.ClientID,
			ClientSecret: pCfg.ClientSecret,
			RedirectURL:  pCfg.RedirectURL,
			Endpoint:     provider.Endpoint(),
			Scopes:       pCfg.Scopes,
		}
	}

	return s, nil
}

// generateState creates a random string for OAuth2 state parameter.
func generateState() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// GetAuthorizationURL generates the URL to redirect the user to the OIDC provider
func (s *oidcService) GetAuthorizationURL(ctx context.Context, providerName string, state string) (string, error) {
	oauth2Config, ok := s.oauth2Configs[providerName]
	if !ok {
		return "", fmt.Errorf("OIDC provider '%s' not configured", providerName)
	}

	// Generate state if not provided (or validate provided state against session)
	if state == "" {
		var err error
		state, err = generateState()
		if err != nil {
			return "", fmt.Errorf("failed to generate state: %w", err)
		}
		// TODO: Store state in user's session (e.g., secure cookie) for later validation
	}

	// Redirect user to consent page to ask for permission
	// for the scopes specified above.
	return oauth2Config.AuthCodeURL(state), nil
}

// HandleCallback processes the callback from the OIDC provider
func (s *oidcService) HandleCallback(ctx context.Context, providerName string, state string, code string) (accessToken string, refreshToken string, user *models.User, err error) {
	oauth2Config, ok := s.oauth2Configs[providerName]
	if !ok {
		err = fmt.Errorf("OIDC provider '%s' not configured", providerName)
		return
	}
	provider, ok := s.oidcProviders[providerName]
	if !ok {
		err = fmt.Errorf("OIDC provider '%s' not initialized", providerName)
		return
	}

	// TODO: Validate received state against the one stored in the session/cookie
	// storedState := // ... get state from session ...
	// if state != storedState {
	//   err = errors.New("invalid OIDC state parameter")
	//   return
	// }

	// Exchange authorization code for token
	oauth2Token, err := oauth2Config.Exchange(ctx, code)
	if err != nil {
		log.Printf("Failed to exchange OIDC code for token: %v", err)
		err = fmt.Errorf("failed to exchange code: %w", err)
		return
	}

	// Extract the ID Token from OAuth2 token.
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		err = errors.New("no id_token field in oauth2 token")
		return
	}

	// Parse and verify ID Token payload.
	idToken, err := provider.Verifier(&oidc.Config{ClientID: oauth2Config.ClientID}).Verify(ctx, rawIDToken)
	if err != nil {
		log.Printf("Failed to verify OIDC ID token: %v", err)
		err = fmt.Errorf("failed to verify ID token: %w", err)
		return
	}

	// Extract custom claims (like email, name)
	var claims struct {
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		GivenName     string `json:"given_name"`
		FamilyName    string `json:"family_name"`
	}
	if err = idToken.Claims(&claims); err != nil {
		log.Printf("Failed to extract claims from OIDC ID token: %v", err)
		err = fmt.Errorf("failed to extract claims: %w", err)
		return
	}

	// Find or create user based on email
	user, err = s.userRepo.FindByEmail(ctx, claims.Email)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			// User doesn't exist, create a new one
			log.Printf("OIDC: User with email %s not found, creating new user.", claims.Email)

			// Create user according to actual User model structure
			newUser := &models.User{
				Email:        claims.Email,
				Username:     claims.Email, // Consider a more robust username generation strategy
				PasswordHash: "oidc_user",  // Placeholder password for OIDC-only users
				FirstName:    claims.GivenName,
				LastName:     claims.FamilyName,
				IsActive:     true,
				TenantID:     1, // Default tenant - should be determined based on your business logic
			}

			createdUser, createErr := s.userRepo.Create(ctx, newUser)
			if createErr != nil {
				log.Printf("Failed to create new user from OIDC callback for email %s: %v", claims.Email, createErr)
				err = fmt.Errorf("failed to provision user: %w", createErr)
				return
			}

			// Use the created user
			user = createdUser

		} else {
			// Other database error
			log.Printf("Database error finding user by email %s: %v", claims.Email, err)
			err = fmt.Errorf("database error finding user: %w", err)
			return
		}
	}

	// User found or created, now generate local JWT tokens for them
	// TODO: Implement proper token generation with AuthService
	// For now, using placeholder tokens
	accessToken = "placeholder_oidc_access_token"
	refreshToken = "placeholder_oidc_refresh_token"

	// Update LastLogin for the user
	if user != nil {
		errUpdate := s.userRepo.UpdateLastLogin(ctx, user.ID)
		if errUpdate != nil {
			log.Printf("OIDC: Failed to update last login for user %s (ID: %d): %v", user.Email, user.ID, errUpdate)
			// Non-critical, so don't return error
		}
	}

	log.Printf("OIDC login successful for user: %s (ID: %d)", user.Email, user.ID)
	return accessToken, refreshToken, user, nil
}

// Ensure implementation satisfies the interface
var _ OIDCService = (*oidcService)(nil)
