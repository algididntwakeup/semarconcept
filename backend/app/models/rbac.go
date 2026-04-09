// platform/backend/app/models/rbac.go

package models

// This file previously contained non-GORM struct definitions for Role, Permission, etc.
// These have been moved to individual model files (role.go, permission.go)
// and adapted for use with GORM.

// The join table structs (UserRole, RolePermission) are implicitly handled by GORM's
// many-to-many relationship definitions in the User, Role, and Permission models.

// Validation logic previously here has been removed. GORM validation or
// service-layer validation should be implemented as needed.
