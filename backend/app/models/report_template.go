// platform/backend/app/models/report_template.go

package models

import (
	"time"
	// "gorm.io/gorm"
)

// ReportTemplate defines the structure for a report definition.
type ReportTemplate struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"type:varchar(150);unique;not null"` // Unique name for the report template
	Description string `gorm:"type:text"`
	DataSource  string `gorm:"type:varchar(100);not null"` // Identifier for the data source (e.g., "users", "orders", "custom_query")
	// TemplateDefinition stores the actual template structure/query.
	// The format depends on the reporting engine used (e.g., JSON, SQL, template string).
	TemplateDefinition string `gorm:"type:text;not null"`
	// ParametersDefinition defines the input parameters the report accepts.
	// Stored as JSONB for flexibility. See ReportParameterDef struct below for example structure.
	ParametersDefinition string `gorm:"type:jsonb;default:'[]'"`
	OutputType           string `gorm:"type:varchar(50);not null;default:'csv'"` // e.g., "csv", "pdf", "json", "html_table"
	IsActive             bool   `gorm:"not null;default:true"`
	CreatedByUserID      *uint  // Optional: Link to the user who created it
	UpdatedByUserID      *uint  // Optional: Link to the user who last updated it
	CreatedAt            time.Time
	UpdatedAt            time.Time

	// Optional: Relationships if parameters are stored separately
	// Parameters []ReportParameter `gorm:"foreignKey:TemplateID"`
}

// TableName specifies the table name for the ReportTemplate model.
func (ReportTemplate) TableName() string {
	return "report_templates"
}

// ReportParameterDef defines the structure for a single parameter within ParametersDefinition JSONB field.
type ReportParameterDef struct {
	Name         string `json:"name"`  // e.g., "start_date", "user_id"
	Label        string `json:"label"` // e.g., "Start Date", "User"
	Type         string `json:"type"`  // e.g., "date", "text", "number", "select_user", "select_role"
	Required     bool   `json:"required"`
	DefaultValue string `json:"defaultValue,omitempty"`
	// Options could be predefined or dynamically fetched based on Type (e.g., list of users for 'select_user')
	Options []struct {
		Label string `json:"label"`
		Value string `json:"value"`
	} `json:"options,omitempty"`
}
