package models

import "time"

// EquipmentDocument is one file attached to an asset (image, drawing, report,
// datasheet, certificate, …). The physical file lives on the storage volume
// under `equipments/<equipment_id>/`; FileURL is the public path that the
// backend serves from /static/uploads so the UI can link to it directly.
type EquipmentDocument struct {
	ID       int `gorm:"primaryKey;autoIncrement" db:"id" json:"id"`
	TenantID int `gorm:"index;not null" db:"tenant_id" json:"tenant_id"`
	// EquipmentID is the owning asset; deleting an asset cascades here.
	EquipmentID int       `gorm:"index;not null" db:"equipment_id" json:"equipment_id"`
	FileName    string    `gorm:"size:255;not null" db:"file_name" json:"file_name"`
	FileURL     string    `gorm:"size:500;not null" db:"file_url" json:"file_url"`
	FileType    string    `gorm:"size:30;not null" db:"file_type" json:"file_type"`
	FileSize    int64     `gorm:"not null" db:"file_size" json:"file_size"`
	UploadedAt  time.Time `gorm:"default:now();not null" db:"uploaded_at" json:"uploaded_at"`
	UploadedBy  *int      `db:"uploaded_by" json:"uploaded_by,omitempty"`

	Tenant    *Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
	Equipment *Asset  `gorm:"foreignKey:EquipmentID" json:"equipment,omitempty"`
}

// Equipment document types. Image is used by the Image tab; the rest by the
// File tab's category picker.
const (
	EquipmentDocumentTypeImage       = "Image"
	EquipmentDocumentTypeDocument    = "Document"
	EquipmentDocumentTypeDrawing     = "Drawing"
	EquipmentDocumentTypeReport      = "Report"
	EquipmentDocumentTypeDatasheet   = "Datasheet"
	EquipmentDocumentTypeCertificate = "Certificate"
)

// EquipmentDocumentTypes is the closed set accepted from the UI.
var EquipmentDocumentTypes = []string{
	EquipmentDocumentTypeImage,
	EquipmentDocumentTypeDocument,
	EquipmentDocumentTypeDrawing,
	EquipmentDocumentTypeReport,
	EquipmentDocumentTypeDatasheet,
	EquipmentDocumentTypeCertificate,
}

// IsValidEquipmentDocumentType reports whether a UI category is accepted.
func IsValidEquipmentDocumentType(value string) bool {
	for _, allowed := range EquipmentDocumentTypes {
		if allowed == value {
			return true
		}
	}
	return false
}

// TableName returns the physical table name.
func (EquipmentDocument) TableName() string {
	return "equipment_documents"
}
