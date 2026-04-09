// platform/backend/app/models/tenant_branding.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// TenantBranding represents branding configuration for a tenant
type TenantBranding struct {
	ID              int        `json:"id" gorm:"primaryKey;autoIncrement"`
	TenantID        int        `json:"tenant_id" gorm:"not null;uniqueIndex;index"`
	CompanyName     string     `json:"company_name" gorm:"size:200"`
	LogoURL         string     `json:"logo_url" gorm:"size:500"`
	FaviconURL      string     `json:"favicon_url" gorm:"size:500"`
	PrimaryColor    string     `json:"primary_color" gorm:"size:7;default:#1976D2"`
	SecondaryColor  string     `json:"secondary_color" gorm:"size:7;default:#FF5722"`
	AccentColor     string     `json:"accent_color" gorm:"size:7;default:#4CAF50"`
	BackgroundColor string     `json:"background_color" gorm:"size:7;default:#FAFAFA"` // Match DB default
	Theme           string     `json:"theme" gorm:"size:20;default:light"`
	CustomCSS       string     `json:"custom_css" gorm:"type:text"`
	EmailTemplate   string     `json:"email_template" gorm:"type:jsonb;default:'{}'"` // Match DB: string with default
	CreatedAt       time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" gorm:"index"` // Add missing field

	// Relationships
	Tenant *Tenant `json:"tenant,omitempty" gorm:"foreignKey:TenantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName specifies the table name for GORM
func (TenantBranding) TableName() string {
	return "tenant_branding"
}

// Theme constants
const (
	ThemeLight = "light"
	ThemeDark  = "dark"
	ThemeAuto  = "auto"
)

// BeforeCreate GORM hook
func (tb *TenantBranding) BeforeCreate(tx *gorm.DB) error {
	// Ensure default values are set
	if tb.PrimaryColor == "" {
		tb.PrimaryColor = "#1976D2"
	}
	if tb.SecondaryColor == "" {
		tb.SecondaryColor = "#FF5722"
	}
	if tb.AccentColor == "" {
		tb.AccentColor = "#4CAF50"
	}
	if tb.BackgroundColor == "" {
		tb.BackgroundColor = "#FAFAFA"
	}
	if tb.Theme == "" {
		tb.Theme = ThemeLight
	}
	if tb.EmailTemplate == "" {
		tb.EmailTemplate = "{}"
	}
	return nil
}

// Helper methods
func (tb *TenantBranding) IsDarkTheme() bool {
	return tb.Theme == ThemeDark
}

func (tb *TenantBranding) IsLightTheme() bool {
	return tb.Theme == ThemeLight
}

func (tb *TenantBranding) IsSoftDeleted() bool {
	return tb.DeletedAt != nil
}

func (tb *TenantBranding) GetDefaultColors() map[string]string {
	return map[string]string{
		"primary":    "#1976D2",
		"secondary":  "#FF5722",
		"accent":     "#4CAF50",
		"background": "#FAFAFA", // Match DB default
	}
}

// GetDefaultTenantBranding returns default branding configuration
// This is the ONLY implementation of this function in the entire codebase
func GetDefaultTenantBranding() TenantBranding {
	return TenantBranding{
		CompanyName:     "",
		LogoURL:         "",
		FaviconURL:      "",
		PrimaryColor:    "#1976D2",
		SecondaryColor:  "#FF5722",
		AccentColor:     "#4CAF50",
		BackgroundColor: "#FAFAFA", // Match DB default
		Theme:           ThemeLight,
		CustomCSS:       "",
		EmailTemplate:   "{}", // Match DB default (string, not pointer)
	}
}

// NewDefaultTenantBranding creates a new TenantBranding with default values for a specific tenant
func NewDefaultTenantBranding(tenantID int) *TenantBranding {
	defaultBranding := GetDefaultTenantBranding()
	defaultBranding.TenantID = tenantID
	return &defaultBranding
}

// SetDefaultColors applies default color scheme
func (tb *TenantBranding) SetDefaultColors() {
	colors := tb.GetDefaultColors()
	tb.PrimaryColor = colors["primary"]
	tb.SecondaryColor = colors["secondary"]
	tb.AccentColor = colors["accent"]
	tb.BackgroundColor = colors["background"]
}

// ApplyTheme applies a theme to the branding
func (tb *TenantBranding) ApplyTheme(theme string) {
	tb.Theme = theme
	switch theme {
	case ThemeDark:
		tb.BackgroundColor = "#121212"
		tb.PrimaryColor = "#BB86FC"
		tb.SecondaryColor = "#03DAC6"
		tb.AccentColor = "#CF6679"
	case ThemeLight:
		tb.SetDefaultColors()
	case ThemeAuto:
		// Keep current colors, just set theme
		tb.Theme = ThemeAuto
	default:
		tb.SetDefaultColors()
		tb.Theme = ThemeLight
	}
}

// Validate ensures all required fields have valid values
func (tb *TenantBranding) Validate() error {
	if tb.TenantID <= 0 {
		return fmt.Errorf("tenant_id is required")
	}

	// Validate color formats (basic hex validation)
	colors := []string{tb.PrimaryColor, tb.SecondaryColor, tb.AccentColor, tb.BackgroundColor}
	for _, color := range colors {
		if color != "" && !isValidHexColor(color) {
			return fmt.Errorf("invalid color format: %s", color)
		}
	}

	// Validate theme
	validThemes := []string{ThemeLight, ThemeDark, ThemeAuto}
	if tb.Theme != "" {
		isValid := false
		for _, validTheme := range validThemes {
			if tb.Theme == validTheme {
				isValid = true
				break
			}
		}
		if !isValid {
			return fmt.Errorf("invalid theme: %s", tb.Theme)
		}
	}

	return nil
}

// isValidHexColor validates hex color format
func isValidHexColor(color string) bool {
	if len(color) != 7 || color[0] != '#' {
		return false
	}
	for i := 1; i < 7; i++ {
		c := color[i]
		if !((c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f')) {
			return false
		}
	}
	return true
}
