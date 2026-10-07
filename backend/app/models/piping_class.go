package models

import "time"

// PipingClass is the tenant's piping-class master data. An asset references one
// class by code (rbi_properties["Component Design.Piping Class"]); the Risk
// Analysis tab reads the class to show design & material properties that live
// on the master rather than on the asset itself.
type PipingClass struct {
	ID       int    `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID int    `gorm:"index;not null;uniqueIndex:idx_piping_class_tenant_code,priority:1" db:"tenant_id" json:"tenant_id"`
	Code     string `gorm:"size:100;not null;uniqueIndex:idx_piping_class_tenant_code,priority:2" db:"code" json:"code"`
	Material string `gorm:"size:255" db:"material" json:"material"`
	// CorrosionAllowance is stored as text because the workbook carries mixed
	// formats ("1.6", "1.6 mm"); the UI renders whatever the master holds.
	CorrosionAllowance string    `gorm:"size:50" db:"corrosion_allowance" json:"corrosion_allowance"`
	PipeSchedule       string    `gorm:"size:50" db:"pipe_schedule" json:"pipe_schedule"`
	RatingClass        string    `gorm:"size:50" db:"rating_class" json:"rating_class"`
	NominalPipeSize    string    `gorm:"size:50" db:"nominal_pipe_size" json:"nominal_pipe_size"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`

	Tenant *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// TableName returns the physical table name.
func (PipingClass) TableName() string {
	return "piping_classes"
}
