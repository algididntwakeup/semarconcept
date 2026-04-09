// platform/backend/app/repositories/base_repository.go
package repositories

import (
	"os"
	"log"
	"github.com/lib/pq"
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"gorm.io/gorm"
)

// BaseRepository provides common functionality for all repositories with tenant isolation
type BaseRepository struct {
	logger    *log.Logger
	db        *gorm.DB
	sqlxDB    *sqlx.DB
	tableName string
}

// NewBaseRepository creates a new base repository
func NewBaseRepository(db *gorm.DB, sqlxDB *sqlx.DB, tableName string) *BaseRepository {
	return &BaseRepository{
		db:        db,
		sqlxDB:    sqlxDB,
		tableName: tableName,
		logger:    log.New(os.Stderr, "", log.LstdFlags),
	}
}

// NewBaseRepositoryWithLogger creates a new base repository with custom logger
func NewBaseRepositoryWithLogger(db *gorm.DB, sqlxDB *sqlx.DB, tableName string, logger *log.Logger) *BaseRepository {
	return &BaseRepository{
		db:        db,
		sqlxDB:    sqlxDB,
		tableName: tableName,
	}
}

// TenantScope applies tenant isolation to GORM queries
func (r *BaseRepository) TenantScope(tenantID int) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if tenantID > 0 {
			return db.Where("tenant_id = ?", tenantID)
		}
		return db
	}
}

// WithTenant returns a new GORM DB instance with tenant scope applied
func (r *BaseRepository) WithTenant(tenantID int) *gorm.DB {
	if tenantID > 0 {
		return r.db.Scopes(r.TenantScope(tenantID))
	}
	return r.db
}

// WithTenantAndTx returns a GORM DB instance with tenant scope and transaction
func (r *BaseRepository) WithTenantAndTx(tenantID int, tx *gorm.DB) *gorm.DB {
	db := tx
	if db == nil {
		db = r.db
	}

	if tenantID > 0 {
		return db.Scopes(r.TenantScope(tenantID))
	}
	return db
}

// BuildTenantQuery builds a SQL query with tenant isolation for sqlx
func (r *BaseRepository) BuildTenantQuery(baseQuery string, tenantID int, additionalWhere ...string) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	// Add tenant condition if tenantID is provided
	if tenantID > 0 {
		conditions = append(conditions, "tenant_id = ?")
		args = append(args, tenantID)
	}

	// Add additional where conditions
	for _, condition := range additionalWhere {
		if condition != "" {
			conditions = append(conditions, condition)
		}
	}

	// Build the final query
	if len(conditions) > 0 {
		if strings.Contains(strings.ToUpper(baseQuery), "WHERE") {
			baseQuery += " AND " + strings.Join(conditions, " AND ")
		} else {
			baseQuery += " WHERE " + strings.Join(conditions, " AND ")
		}
	}

	return baseQuery, args
}

// ValidateTenantAccess ensures the resource belongs to the specified tenant
func (r *BaseRepository) ValidateTenantAccess(ctx context.Context, resourceTenantID, userTenantID int) error {
	if userTenantID == 0 {
		return nil // Super admin access - no tenant restriction
	}

	if resourceTenantID != userTenantID {
		return fmt.Errorf("tenant isolation violation: resource belongs to tenant %d but user belongs to tenant %d",
			resourceTenantID, userTenantID)
	}

	return nil
}

// GetDB returns the GORM database instance
func (r *BaseRepository) GetDB() *gorm.DB {
	return r.db
}

// GetSQLXDB returns the SQLX database instance
func (r *BaseRepository) GetSQLXDB() *sqlx.DB {
	return r.sqlxDB
}

// GetTableName returns the table name
func (r *BaseRepository) GetTableName() string {
	return r.tableName
}

// Transaction executes a function within a database transaction
func (r *BaseRepository) Transaction(ctx context.Context, fn func(*gorm.DB) error) error {
	return r.db.WithContext(ctx).Transaction(fn)
}

// TenantAwareRepository interface that all tenant-aware repositories should implement
type TenantAwareRepository interface {
	// SetTenantContext sets the tenant context for the repository
	SetTenantContext(tenantID int)

	// GetTenantContext gets the current tenant context
	GetTenantContext() int

	// ValidateAccess validates that the user can access the resource
	ValidateAccess(ctx context.Context, resourceTenantID, userTenantID int) error
}

// TenantAwareBase provides tenant-aware functionality that can be embedded
type TenantAwareBase struct {
	*BaseRepository
	currentTenantID int
}

// NewTenantAwareBase creates a new tenant-aware base repository
func NewTenantAwareBase(db *gorm.DB, sqlxDB *sqlx.DB, tableName string) *TenantAwareBase {
	return &TenantAwareBase{
		BaseRepository:  NewBaseRepository(db, sqlxDB, tableName),
		currentTenantID: 0,
	}
}

// SetTenantContext sets the tenant context for the repository
func (r *TenantAwareBase) SetTenantContext(tenantID int) {
	r.currentTenantID = tenantID
}

// GetTenantContext gets the current tenant context
func (r *TenantAwareBase) GetTenantContext() int {
	return r.currentTenantID
}

// ValidateAccess validates that the user can access the resource
func (r *TenantAwareBase) ValidateAccess(ctx context.Context, resourceTenantID, userTenantID int) error {
	return r.ValidateTenantAccess(ctx, resourceTenantID, userTenantID)
}

// DB returns the GORM database with current tenant scope
func (r *TenantAwareBase) DB() *gorm.DB {
	return r.WithTenant(r.currentTenantID)
}

// QueryBuilder helps build complex queries with tenant isolation
type QueryBuilder struct {
	baseQuery  string
	conditions []string
	args       []interface{}
	tenantID   int
	orderBy    string
	limit      int
	offset     int
}

// NewQueryBuilder creates a new query builder
func NewQueryBuilder(baseQuery string, tenantID int) *QueryBuilder {
	return &QueryBuilder{
		baseQuery: baseQuery,
		tenantID:  tenantID,
	}
}

// Where adds a WHERE condition
func (qb *QueryBuilder) Where(condition string, args ...interface{}) *QueryBuilder {
	qb.conditions = append(qb.conditions, condition)
	qb.args = append(qb.args, args...)
	return qb
}

// WhereIf adds a WHERE condition only if the condition is true
func (qb *QueryBuilder) WhereIf(shouldAdd bool, condition string, args ...interface{}) *QueryBuilder {
	if shouldAdd {
		return qb.Where(condition, args...)
	}
	return qb
}

// OrderBy sets the ORDER BY clause
func (qb *QueryBuilder) OrderBy(orderBy string) *QueryBuilder {
	qb.orderBy = orderBy
	return qb
}

// Limit sets the LIMIT
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder {
	qb.limit = limit
	return qb
}

// Offset sets the OFFSET
func (qb *QueryBuilder) Offset(offset int) *QueryBuilder {
	qb.offset = offset
	return qb
}

// Build builds the final query with all conditions
func (qb *QueryBuilder) Build() (string, []interface{}) {
	query := qb.baseQuery
	args := make([]interface{}, 0)

	// Collect all conditions including tenant isolation
	allConditions := make([]string, 0)

	// Add tenant condition first
	if qb.tenantID > 0 {
		allConditions = append(allConditions, "tenant_id = ?")
		args = append(args, qb.tenantID)
	}

	// Add user conditions
	allConditions = append(allConditions, qb.conditions...)
	args = append(args, qb.args...)

	// Add WHERE clause if we have conditions
	if len(allConditions) > 0 {
		if strings.Contains(strings.ToUpper(query), "WHERE") {
			query += " AND " + strings.Join(allConditions, " AND ")
		} else {
			query += " WHERE " + strings.Join(allConditions, " AND ")
		}
	}

	// Add ORDER BY
	if qb.orderBy != "" {
		query += " ORDER BY " + qb.orderBy
	}

	// Add LIMIT and OFFSET
	if qb.limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", qb.limit)
	}
	if qb.offset > 0 {
		query += fmt.Sprintf(" OFFSET %d", qb.offset)
	}

	return query, args
}

// Common repository operations that can be reused

// ExistsInTenant checks if a record exists in the specified tenant
func (r *BaseRepository) ExistsInTenant(ctx context.Context, tenantID int, condition string, args ...interface{}) (bool, error) {
	query := fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM %s WHERE %s", r.tableName, condition)

	if tenantID > 0 {
		query += " AND tenant_id = ?"
		args = append(args, tenantID)
	}

	query += ")"

	var exists bool
	err := r.sqlxDB.GetContext(ctx, &exists, query, args...)
	return exists, err
}

// CountInTenant counts records in the specified tenant
func (r *BaseRepository) CountInTenant(ctx context.Context, tenantID int, condition string, args ...interface{}) (int64, error) {
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", r.tableName)

	if condition != "" || tenantID > 0 {
		query += " WHERE "

		var conditions []string
		if tenantID > 0 {
			conditions = append(conditions, "tenant_id = ?")
			args = append([]interface{}{tenantID}, args...)
		}
		if condition != "" {
			conditions = append(conditions, condition)
		}

		query += strings.Join(conditions, " AND ")
	}

	var count int64
	err := r.sqlxDB.GetContext(ctx, &count, query, args...)
	return count, err
}

// PaginationHelper helps with pagination calculations
type PaginationHelper struct {
	Page     int
	PageSize int
	Total    int64
}

// GetOffset calculates the offset for pagination
func (p *PaginationHelper) GetOffset() int {
	if p.Page <= 0 {
		p.Page = 1
	}
	return (p.Page - 1) * p.PageSize
}

// GetTotalPages calculates total pages
func (p *PaginationHelper) GetTotalPages() int {
	if p.Total <= 0 || p.PageSize <= 0 {
		return 0
	}
	return int((p.Total + int64(p.PageSize) - 1) / int64(p.PageSize))
}

// HasNext checks if there's a next page
func (p *PaginationHelper) HasNext() bool {
	return p.Page < p.GetTotalPages()
}

// HasPrev checks if there's a previous page
func (p *PaginationHelper) HasPrev() bool {
	return p.Page > 1
}

// IsUniqueConstraintError checks if the error is a unique constraint violation
func (r *BaseRepository) IsUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	
	// Check for PostgreSQL unique constraint violation
	if pqErr, ok := err.(*pq.Error); ok {
		return pqErr.Code == "23505" // unique_violation
	}
	
	// Check for error message patterns
	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "unique constraint") ||
		   strings.Contains(errMsg, "duplicate key") ||
		   strings.Contains(errMsg, "already exists")
}

// IsForeignKeyConstraintError checks if the error is a foreign key constraint violation
func (r *BaseRepository) IsForeignKeyConstraintError(err error) bool {
	if err == nil {
		return false
	}
	
	// Check for PostgreSQL foreign key constraint violation
	if pqErr, ok := err.(*pq.Error); ok {
		return pqErr.Code == "23503" // foreign_key_violation
	}
	
	// Check for error message patterns
	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "foreign key constraint") ||
		   strings.Contains(errMsg, "violates foreign key")
}

// IsNotNullConstraintError checks if the error is a not null constraint violation
func (r *BaseRepository) IsNotNullConstraintError(err error) bool {
	if err == nil {
		return false
	}
	
	// Check for PostgreSQL not null constraint violation
	if pqErr, ok := err.(*pq.Error); ok {
		return pqErr.Code == "23502" // not_null_violation
	}
	
	// Check for error message patterns
	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "not null constraint") ||
		   strings.Contains(errMsg, "null value")
}
