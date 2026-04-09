// platform/backend/app/models/identity_provider.go

package models

import (
	"time"
	// "gorm.io/gorm"
)

// IdentityProvider stores configuration for an external OIDC or SAML provider.
type IdentityProvider struct {
	ID           uint   `gorm:"primaryKey"`
	Name         string `gorm:"type:varchar(100);unique;not null"` // User-friendly name (e.g., "Google Workspace", "Okta Prod")
	ProviderType string `gorm:"type:varchar(10);not null;index"`   // "oidc" or "saml"
	IsEnabled    bool   `gorm:"not null;default:false"`
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Configuration details stored as JSONB for flexibility.
	// The structure within depends on ProviderType.
	// For OIDC: ClientID, ClientSecret, IssuerURL, Scopes, RedirectURL
	// For SAML: IdpMetadataURL, SpEntityID, AcsURL, SloURL, Cert/Key info (or reference to stored secrets)
	Configuration string `gorm:"type:jsonb;not null;default:'{}'"`

	// Optional: Fields for attribute mapping configuration
	// AttributeMapping string `gorm:"type:jsonb"`
}

// TableName specifies the table name.
func (IdentityProvider) TableName() string {
	return "identity_providers"
}

// Example OIDC Configuration structure (for JSONB field)
// type OIDCConfigJSON struct {
// 	ClientID     string   `json:"client_id"`
// 	ClientSecret string   `json:"client_secret"` // Store securely (e.g., encrypted or reference to secret manager)
// 	IssuerURL    string   `json:"issuer_url"`
// 	Scopes       []string `json:"scopes"`
// 	RedirectURL  string   `json:"redirect_url"` // Usually derived, but can be stored
// }

// Example SAML Configuration structure (for JSONB field)
// type SAMLConfigJSON struct {
// 	IdpMetadataURL   string `json:"idp_metadata_url"`
// 	SpEntityID       string `json:"sp_entity_id"`
// 	AcsURL           string `json:"acs_url"`
// 	SloURL           string `json:"slo_url,omitempty"`
// 	AllowIDPInitiated bool  `json:"allow_idp_initiated"`
// 	// Reference to stored SP private key and certificate
// 	SpPrivateKeyRef string `json:"sp_private_key_ref"`
// 	SpCertRef       string `json:"sp_cert_ref"`
// }
