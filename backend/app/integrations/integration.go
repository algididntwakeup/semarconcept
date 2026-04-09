// platform/backend/app/integrations/integration.go

package integrations

import (
	"context"
)

// Integration represents the interface for connecting with external systems.
type Integration interface {
	// Name returns the unique name of the integration (e.g., "salesforce", "sap_b1").
	Name() string

	// Description provides a brief overview of the integration.
	Description() string

	// Configure validates and stores necessary configuration (e.g., API keys, endpoints).
	// configData could be map[string]interface{} or a specific struct.
	Configure(ctx context.Context, configData map[string]string) error

	// TestConnection attempts to connect to the external system with current config.
	TestConnection(ctx context.Context) error

	// IsEnabled returns true if the integration is configured and active.
	IsEnabled() bool

	// GetConfigurationFields defines the fields required to configure this integration.
	// This helps the UI dynamically generate configuration forms.
	GetConfigurationFields() []ConfigurationField

	// --- Optional methods for specific integration patterns ---

	// Example: Pattern for scheduled data synchronization (e.g., polling an API)
	// SyncData(ctx context.Context, dataType string, lastSync time.Time) (nextSyncSuggestion time.Time, err error)

	// Example: Pattern for handling incoming webhooks
	// HandleWebhook(ctx context.Context, requestHeaders http.Header, requestBody io.Reader) (responseBody interface{}, statusCode int, err error)

	// Example: Pattern for fetching data on demand and mapping to internal models
	// FetchData(ctx context.Context, queryParams map[string]string) ([]models.SomeStandardModel, error)

	// Example: Pattern for sending data to the external system
	// SendData(ctx context.Context, data models.SomeStandardModel) (externalID string, err error)
}

// ConfigurationField describes a single configuration field needed by an integration.
type ConfigurationField struct {
	Name         string     `json:"name"`  // e.g., "api_key", "endpoint_url"
	Label        string     `json:"label"` // User-friendly label, e.g., "API Key"
	Type         string     `json:"type"`  // e.g., "text", "password", "select", "boolean"
	Required     bool       `json:"required"`
	Description  string     `json:"description"`  // Help text for the user
	DefaultValue string     `json:"defaultValue"` // Optional default value
	Options      []struct { // Optional: For 'select' type
		Label string `json:"label"`
		Value string `json:"value"`
	} `json:"options,omitempty"`
}

// BaseIntegration provides default implementations (optional).
type BaseIntegration struct{}

func (b *BaseIntegration) Configure(ctx context.Context, configData map[string]string) error {
	// Default: No-op, assumes config is handled elsewhere or not needed initially.
	// Validation should happen here in a real implementation.
	return nil
}

func (b *BaseIntegration) TestConnection(ctx context.Context) error {
	// Default: Assume connection is okay or test is not implemented.
	return nil
}

func (b *BaseIntegration) IsEnabled() bool {
	// Default: Assume disabled unless configured. Needs proper state management.
	return false
}

func (b *BaseIntegration) GetConfigurationFields() []ConfigurationField {
	// Default: No configuration fields.
	return []ConfigurationField{}
}

// IntegrationManager (Conceptual - would live in core app setup)
// type IntegrationManager struct {
//   integrations map[string]Integration
//   // db connection, config service, etc.
// }
// func (im *IntegrationManager) Register(integration Integration) { ... }
// func (im *IntegrationManager) GetIntegration(name string) (Integration, error) { ... }
// func (im *IntegrationManager) ConfigureIntegration(ctx context.Context, name string, configData map[string]string) error { ... }
// func (im *IntegrationManager) ListIntegrations() []IntegrationInfo { ... } // IntegrationInfo similar to ModuleInfo
