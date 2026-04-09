// platform/backend/app/models/menu.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// Menu represents a navigation menu item - ALIGNED WITH DATABASE SCHEMA
type Menu struct {
	// Basic fields from menu_items table
	ID                   int       `db:"id" json:"id" gorm:"primaryKey"`
	Title                string    `db:"title" json:"title" gorm:"type:varchar(255);not null"`
	Slug                 string    `db:"slug" json:"slug" gorm:"type:varchar(100);index"`
	Icon                 *string   `db:"icon" json:"icon,omitempty" gorm:"type:varchar(100)"`
	Route                *string   `db:"route" json:"route,omitempty" gorm:"type:varchar(255)"`
	ParentID             *int      `db:"parent_id" json:"parent_id,omitempty" gorm:"index"`
	OrderIndex           int       `db:"order_index" json:"order_index" gorm:"not null;default:0"`
	IsActive             bool      `db:"is_active" json:"is_active" gorm:"not null;default:true"`
	RequiredPermissionID *int      `db:"required_permission_id" json:"required_permission_id,omitempty" gorm:"index"`
	CreatedAt            time.Time `db:"created_at" json:"created_at" gorm:"default:now()"`
	UpdatedAt            time.Time `db:"updated_at" json:"updated_at" gorm:"default:now()"`
	TenantID             int       `db:"tenant_id" json:"tenant_id" gorm:"not null;index"`

	// RBAC Enhancement Fields (matching database schema exactly)
	VisibilityRules        *MenuVisibilityRules `db:"visibility_rules" json:"visibility_rules,omitempty" gorm:"type:jsonb"`
	AccessLevel            string               `db:"access_level" json:"access_level" gorm:"type:varchar(50);default:'user'"`
	IsSystemMenu           bool                 `db:"is_system_menu" json:"is_system_menu" gorm:"default:false"`
	ConditionalPermissions StringArray          `db:"conditional_permissions" json:"conditional_permissions,omitempty" gorm:"type:jsonb"`
	MenuGroup              *string              `db:"menu_group" json:"menu_group,omitempty" gorm:"type:varchar(100)"`
	CustomPermissions      StringArray          `db:"custom_permissions" json:"custom_permissions,omitempty" gorm:"type:jsonb"`
	DisplayOrder           int                  `db:"display_order" json:"display_order" gorm:"default:0"`
	IsVisible              bool                 `db:"is_visible" json:"is_visible" gorm:"default:true"`
	Description            *string              `db:"description" json:"description,omitempty" gorm:"type:text"`
	MenuType               string               `db:"menu_type" json:"menu_type" gorm:"type:varchar(50);default:'standard'"`

	// Relations (not stored in DB, loaded via joins)
	Children           []*Menu     `json:"children,omitempty" gorm:"-"`
	Parent             *Menu       `json:"parent,omitempty" gorm:"-"`
	RequiredPermission *Permission `json:"required_permission,omitempty" gorm:"-"`
}

// MenuVisibilityRules defines complex visibility rules for menu items
type MenuVisibilityRules struct {
	RequireAll  []string `json:"require_all,omitempty"`  // User must have ALL these permissions
	RequireAny  []string `json:"require_any,omitempty"`  // User must have ANY of these permissions
	OnlyRoles   []string `json:"only_roles,omitempty"`   // Only users with these roles can see
	ExceptRoles []string `json:"except_roles,omitempty"` // Users with these roles cannot see
	UserGroups  []string `json:"user_groups,omitempty"`  // Only specific user groups
}

// Value implements driver.Valuer for database storage
func (r MenuVisibilityRules) Value() (driver.Value, error) {
	return json.Marshal(r)
}

// Scan implements sql.Scanner for database retrieval
func (r *MenuVisibilityRules) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into MenuVisibilityRules", value)
	}
	return json.Unmarshal(bytes, r)
}

// StringArray represents a JSON array of strings
type StringArray []string

// Value implements driver.Valuer for database storage
func (s StringArray) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}
	return json.Marshal(s)
}

// Scan implements sql.Scanner for database retrieval
func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = StringArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into StringArray", value)
	}
	return json.Unmarshal(bytes, s)
}

// MenuItemDTO represents a menu item for frontend consumption
type MenuItemDTO struct {
	ID          int            `json:"id"`
	Title       string         `json:"title"`
	Slug        string         `json:"slug"`
	Icon        *string        `json:"icon,omitempty"`
	Route       *string        `json:"route,omitempty"`
	ParentID    *int           `json:"parent_id,omitempty"`
	OrderIndex  int            `json:"order_index"`
	IsActive    bool           `json:"is_active"`
	AccessLevel string         `json:"access_level"`
	MenuGroup   *string        `json:"menu_group,omitempty"`
	Children    []*MenuItemDTO `json:"children,omitempty"`
	Permissions []string       `json:"permissions,omitempty"`
	IsVisible   bool           `json:"is_visible"`
	MenuType    string         `json:"menu_type"`
}

// MenuAccessLog represents audit trail for menu access
type MenuAccessLog struct {
	ID           int       `db:"id" json:"id" gorm:"primaryKey"`
	MenuID       int       `db:"menu_id" json:"menu_id" gorm:"not null;index"`
	UserID       int       `db:"user_id" json:"user_id" gorm:"not null;index"`
	TenantID     int       `db:"tenant_id" json:"tenant_id" gorm:"not null;index"`
	AccessTime   time.Time `db:"access_time" json:"access_time" gorm:"default:now()"`
	IPAddress    *string   `db:"ip_address" json:"ip_address,omitempty"`
	UserAgent    *string   `db:"user_agent" json:"user_agent,omitempty"`
	AccessType   string    `db:"access_type" json:"access_type" gorm:"type:varchar(50);default:'view'"`
	WasGranted   bool      `db:"was_granted" json:"was_granted" gorm:"default:true"`
	DeniedReason *string   `db:"denied_reason" json:"denied_reason,omitempty"`
}

// TableName returns the table name for Menu model
func (m Menu) TableName() string {
	return "menu_items"
}

// TableName returns the table name for MenuAccessLog model
func (mal MenuAccessLog) TableName() string {
	return "menu_access_logs"
}

// IsParent checks if this menu item has children
func (m *Menu) IsParent() bool {
	return len(m.Children) > 0
}

// HasPermission checks if menu requires a specific permission
func (m *Menu) HasPermission() bool {
	return m.RequiredPermissionID != nil
}

// GetAccessLevelWeight returns numeric weight for access level comparison
func (m *Menu) GetAccessLevelWeight() int {
	switch m.AccessLevel {
	case "system":
		return 4
	case "admin":
		return 3
	case "manager":
		return 2
	case "user":
		return 1
	default:
		return 0
	}
}

// IsAccessibleByLevel checks if menu is accessible for given access level
func (m *Menu) IsAccessibleByLevel(userLevel string) bool {
	userWeight := getAccessLevelWeight(userLevel)
	menuWeight := m.GetAccessLevelWeight()
	return userWeight >= menuWeight
}

// getAccessLevelWeight helper function
func getAccessLevelWeight(level string) int {
	switch level {
	case "system":
		return 4
	case "admin":
		return 3
	case "manager":
		return 2
	case "user":
		return 1
	default:
		return 0
	}
}

// ValidateAccessLevel validates the access level value
func ValidateAccessLevel(level string) bool {
	validLevels := []string{"user", "manager", "admin", "system"}
	for _, valid := range validLevels {
		if level == valid {
			return true
		}
	}
	return false
}

// ValidateMenuType validates the menu type value
func ValidateMenuType(menuType string) bool {
	validTypes := []string{"standard", "system", "dynamic", "external"}
	for _, valid := range validTypes {
		if menuType == valid {
			return true
		}
	}
	return false
}
