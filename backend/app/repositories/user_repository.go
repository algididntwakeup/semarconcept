// platform/backend/app/repositories/user_repository.go
package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"backend/app/models"
	"backend/app/models/request"
	"backend/app/utils"

	"github.com/jmoiron/sqlx"
)

type userRepository struct {
	db *sqlx.DB
}

// NewUserRepository creates a new UserRepository instance
func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

// Create creates a new user
func (r *userRepository) Create(ctx context.Context, user *models.User) (*models.User, error) {
	query := `
		INSERT INTO public.users (username, email, password_hash, first_name, last_name, 
		                         is_superuser, is_admin, is_active, tenant_id, department_id, 
		                         created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at`

	row := r.db.QueryRowContext(ctx, query,
		user.Username, user.Email, user.PasswordHash, user.FirstName, user.LastName,
		user.IsSuperuser, user.IsAdmin, user.IsActive, user.TenantID, user.DepartmentID,
		time.Now(), time.Now(), user.CreatedBy)

	err := row.Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// FindByID finds a user by their ID
func (r *userRepository) FindByID(ctx context.Context, id int) (*models.User, error) {
	var user models.User

	query := `
		SELECT id, username, email, password_hash, first_name, last_name, full_name,
		       is_superuser, is_admin, is_active, tenant_id, department_id, last_login, 
		       created_at, updated_at, deleted_at, created_by, updated_by
		FROM public.users 
		WHERE id = $1 AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by ID: %w", err)
	}

	return &user, nil
}

// FindByEmail finds a user by their email
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User

	query := `
		SELECT id, username, email, password_hash, first_name, last_name, full_name,
		       is_superuser, is_admin, is_active, tenant_id, department_id, last_login, 
		       created_at, updated_at, deleted_at, created_by, updated_by
		FROM public.users 
		WHERE email = $1 AND is_active = true AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &user, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	return &user, nil
}

// FindByUsername finds a user by their username
func (r *userRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User

	query := `
		SELECT id, username, email, password_hash, first_name, last_name, full_name,
		       is_superuser, is_admin, is_active, tenant_id, department_id, last_login, 
		       created_at, updated_at, deleted_at, created_by, updated_by
		FROM public.users 
		WHERE username = $1 AND is_active = true AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &user, query, username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, utils.ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by username: %w", err)
	}

	return &user, nil
}

// FindByUsernameOrEmail finds a user by username OR email
func (r *userRepository) FindByUsernameOrEmail(ctx context.Context, username, email string) (*models.User, error) {
	utils.Infof("REPO: FindByUsernameOrEmail called")
	utils.Infof("REPO: Username parameter: '%s'", username)
	utils.Infof("REPO: Email parameter: '%s'", email)

	var user models.User

	query := `
		SELECT id, username, email, password_hash, first_name, last_name, full_name,
		       is_superuser, is_admin, is_active, tenant_id, department_id, last_login, 
		       created_at, updated_at, deleted_at, created_by, updated_by
		FROM public.users 
		WHERE (username = $1 OR email = $1 OR username = $2 OR email = $2) 
		  AND is_active = true 
		  AND deleted_at IS NULL
		LIMIT 1`

	utils.Infof("REPO: Executing query: %s", query)
	utils.Infof("REPO: Query parameters: $1='%s', $2='%s'", username, email)

	err := r.db.GetContext(ctx, &user, query, username, email)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.Warnf("REPO: No user found with username/email: %s", username)
			return nil, utils.ErrUserNotFound
		}
		utils.Errorf("REPO: Database error: %v", err)
		return nil, fmt.Errorf("failed to find user by username or email: %w", err)
	}

	utils.Infof("REPO: User found successfully")
	utils.Infof("REPO: Found user ID: %d", user.ID)
	utils.Infof("REPO: Found username: %s", user.Username)
	utils.Infof("REPO: Found email: %s", user.Email)

	return &user, nil
}

// Update updates an existing user
func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE public.users 
		SET username = $2, email = $3, password_hash = $4, first_name = $5, last_name = $6,
		    full_name = $7, is_superuser = $8, is_admin = $9, is_active = $10, 
		    tenant_id = $11, department_id = $12, updated_at = $13, updated_by = $14
		WHERE id = $1 AND deleted_at IS NULL`

	_, err := r.db.ExecContext(ctx, query,
		user.ID, user.Username, user.Email, user.PasswordHash, user.FirstName, user.LastName,
		user.FullName, user.IsSuperuser, user.IsAdmin, user.IsActive, user.TenantID,
		user.DepartmentID, time.Now(), user.UpdatedBy)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

// UpdateByID updates a user by ID with provided fields
func (r *userRepository) UpdateByID(ctx context.Context, userID int, updates map[string]interface{}) (*models.User, error) {
	if len(updates) == 0 {
		return r.FindByID(ctx, userID)
	}

	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{userID}
	argIndex := 2

	for field, value := range updates {
		setParts = append(setParts, fmt.Sprintf("%s = $%d", field, argIndex))
		args = append(args, value)
		argIndex++
	}

	// 🚨 CRITICAL FIX: Only add updated_at if not already present
	// This prevents conflict with service layer and database trigger
	if _, hasUpdatedAt := updates["updated_at"]; !hasUpdatedAt {
		setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argIndex))
		args = append(args, time.Now())
	}

	query := fmt.Sprintf(`
		UPDATE public.users 
		SET %s
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING id, username, email, password_hash, first_name, last_name, full_name,
		          is_superuser, is_admin, is_active, tenant_id, department_id, last_login, 
		          created_at, updated_at, deleted_at, created_by, updated_by`,
		strings.Join(setParts, ", "))

	var user models.User
	err := r.db.GetContext(ctx, &user, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return &user, nil
}

// Delete soft deletes a user (sets deleted_at)
func (r *userRepository) Delete(ctx context.Context, id int) error {
	query := `UPDATE public.users SET deleted_at = $1, updated_at = $2 WHERE id = $3 AND deleted_at IS NULL`

	_, err := r.db.ExecContext(ctx, query, time.Now(), time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

// DeleteByID hard deletes a user by ID
func (r *userRepository) DeleteByID(ctx context.Context, userID int) error {
	query := `DELETE FROM public.users WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

// BulkDelete soft deletes multiple users by their IDs
func (r *userRepository) BulkDelete(ctx context.Context, ids []int, tenantID int) error {
	if len(ids) == 0 {
		return nil
	}

	query, args, err := sqlx.In(`UPDATE public.users SET deleted_at = ?, updated_at = ? WHERE id IN (?) AND tenant_id = ? AND deleted_at IS NULL`, time.Now(), time.Now(), ids, tenantID)
	if err != nil {
		return fmt.Errorf("failed to build bulk delete query: %w", err)
	}

	// Rebind for PostgreSQL
	query = r.db.Rebind(query)

	_, err = r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to bulk delete users: %w", err)
	}

	return nil
}

// List returns a paginated list of users
func (r *userRepository) List(ctx context.Context, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Get total count
	countQuery := `SELECT COUNT(*) FROM public.users WHERE deleted_at IS NULL`
	err := r.db.GetContext(ctx, &total, countQuery)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get user count: %w", err)
	}

	// Get users with pagination
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, full_name,
		       is_superuser, is_admin, is_active, tenant_id, department_id, last_login, 
		       created_at, updated_at, deleted_at, created_by, updated_by
		FROM public.users 
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	err = r.db.SelectContext(ctx, &users, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	return users, total, nil
}

// GetAllWithFilters retrieves users with pagination and filtering
func (r *userRepository) GetAllWithFilters(ctx context.Context, tenantID, page, limit int, search, status, role string) ([]models.User, int, error) {
	var users []models.User
	var total int64

	//  DEFENSIVE: Ensure valid pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	//  DEBUG: Log incoming parameters
	utils.Infof("REPO: GetAllWithFilters called - tenantID=%d, page=%d, limit=%d, search='%s', status='%s', role='%s'",
		tenantID, page, limit, search, status, role)

	// Build WHERE conditions
	whereConditions := []string{"u.tenant_id = $1", "u.deleted_at IS NULL"}
	args := []interface{}{tenantID}
	argCount := 1

	// Apply search filter
	if search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(u.first_name ILIKE $%d OR u.last_name ILIKE $%d OR u.email ILIKE $%d OR u.username ILIKE $%d)", argCount, argCount, argCount, argCount))
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern)
		utils.Infof("REPO: Applied search filter: '%s'", searchPattern)
	}

	// Apply status filter
	if status != "" && status != "all" {
		switch status {
		case "active":
			argCount++
			whereConditions = append(whereConditions, fmt.Sprintf("u.is_active = $%d", argCount))
			args = append(args, true)
			utils.Infof("REPO: Applied status filter: active")
		case "inactive":
			argCount++
			whereConditions = append(whereConditions, fmt.Sprintf("u.is_active = $%d", argCount))
			args = append(args, false)
			utils.Infof("REPO: Applied status filter: inactive")
		case "admin":
			argCount++
			whereConditions = append(whereConditions, fmt.Sprintf("u.is_admin = $%d", argCount))
			args = append(args, true)
			utils.Infof("REPO: Applied status filter: admin")
		case "superuser":
			argCount++
			whereConditions = append(whereConditions, fmt.Sprintf("u.is_superuser = $%d", argCount))
			args = append(args, true)
			utils.Infof("REPO: Applied status filter: superuser")
		}
	}

	// Apply role filter
	if role != "" && role != "all" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf(`EXISTS (
			SELECT 1 FROM user_roles ur 
			JOIN roles r ON r.id = ur.role_id 
			WHERE ur.user_id = u.id AND r.name = $%d
		)`, argCount))
		args = append(args, role)
		utils.Infof("REPO: Applied role filter: '%s'", role)
	}

	// Build complete WHERE clause
	whereClause := strings.Join(whereConditions, " AND ")
	utils.Infof("REPO: Final WHERE clause: %s", whereClause)
	utils.Infof("REPO: Query arguments: %+v", args)

	//  FIXED: Get total count with explicit logging
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM public.users u WHERE %s", whereClause)
	utils.Infof("REPO: Count query: %s", countQuery)

	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		utils.Errorf("REPO: Count query failed: %v", err)
		return nil, 0, fmt.Errorf("failed to get user count: %w", err)
	}

	utils.Infof("REPO: Total count result: %d", total)

	//  FIXED: Calculate offset with explicit logging
	offset := (page - 1) * limit
	utils.Infof("REPO: Pagination calculation - page=%d, limit=%d, offset=%d", page, limit, offset)

	//  FIXED: Get paginated results with detailed logging
	query := fmt.Sprintf(`
		SELECT u.id, u.username, u.email, u.password_hash, u.first_name, u.last_name, u.full_name,
		       u.is_superuser, u.is_admin, u.is_active, u.tenant_id, u.department_id, u.last_login, 
		       u.created_at, u.updated_at, u.deleted_at, u.created_by, u.updated_by
		FROM public.users u 
		WHERE %s
		ORDER BY u.created_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argCount+1, argCount+2)

	utils.Infof("REPO: Data query: %s", query)

	argsWithPagination := append(args, limit, offset)
	utils.Infof("REPO: Data query arguments: %+v", argsWithPagination)

	err = r.db.SelectContext(ctx, &users, query, argsWithPagination...)
	if err != nil {
		utils.Errorf("REPO: Data query failed: %v", err)
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	utils.Infof("REPO: Retrieved %d users (total=%d, page=%d, limit=%d, offset=%d)",
		len(users), total, page, limit, offset)

	//  DEFENSIVE: Ensure we return consistent total across all pages
	totalInt := int(total)
	if totalInt < 0 {
		totalInt = 0
	}

	utils.Infof("REPO: Returning users=%d, total=%d", len(users), totalInt)

	return users, totalInt, nil
}

// UpdateLastLogin updates the last login timestamp for a user
func (r *userRepository) UpdateLastLogin(ctx context.Context, userID int) error {
	query := `UPDATE public.users SET last_login = $1, updated_at = $2 WHERE id = $3 AND deleted_at IS NULL`

	_, err := r.db.ExecContext(ctx, query, time.Now(), time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

// CountUsers returns the total number of users
func (r *userRepository) CountUsers(ctx context.Context) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query)
	return count, err
}

// CountActiveUsers returns the number of active users
func (r *userRepository) CountActiveUsers(ctx context.Context) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE is_active = true AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query)
	return count, err
}

// GetManagersWithFilters retrieves managers with pagination and filtering
func (r *userRepository) GetManagersWithFilters(ctx context.Context, page, limit int, search string, departmentID *int) ([]models.User, int, error) {
	var users []models.User
	var total int64

	// Build WHERE conditions for managers
	whereConditions := []string{
		"u.deleted_at IS NULL",
		`EXISTS (
			SELECT 1 FROM user_roles ur 
			JOIN roles r ON r.id = ur.role_id 
			WHERE ur.user_id = u.id AND (r.name ILIKE '%manager%' OR r.name ILIKE '%supervisor%')
		)`}
	args := []interface{}{}
	argCount := 0

	// Apply search filter
	if search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(u.first_name ILIKE $%d OR u.last_name ILIKE $%d OR u.email ILIKE $%d)", argCount, argCount, argCount))
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern)
	}

	// Apply department filter
	if departmentID != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("u.department_id = $%d", argCount))
		args = append(args, *departmentID)
	}

	// Build complete WHERE clause
	whereClause := strings.Join(whereConditions, " AND ")

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(DISTINCT u.id) FROM public.users u WHERE %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get managers count: %w", err)
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := fmt.Sprintf(`
		SELECT DISTINCT u.id, u.username, u.email, u.password_hash, u.first_name, u.last_name, u.full_name,
		       u.is_superuser, u.is_admin, u.is_active, u.tenant_id, u.department_id, u.last_login, 
		       u.created_at, u.updated_at, u.deleted_at, u.created_by, u.updated_by
		FROM public.users u 
		WHERE %s
		ORDER BY u.created_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &users, query, argsWithPagination...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list managers: %w", err)
	}

	return users, int(total), nil
}

// Interface methods implementation

// GetActiveUsersCount returns the count of active users for a tenant
func (r *userRepository) GetActiveUsersCount(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE is_active = true AND tenant_id = $1 AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &count, query, tenantID)
	if err != nil {
		return 0, fmt.Errorf("failed to get active users count: %w", err)
	}

	return count, nil
}

// GetTotalUsersCount returns total users count
func (r *userRepository) GetTotalUsersCount(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE tenant_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, tenantID)
	return count, err
}

// GetSuperusersCount returns superuser count
func (r *userRepository) GetSuperusersCount(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE is_superuser = true AND tenant_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, tenantID)
	return count, err
}

// GetAdminsCount returns admin count
func (r *userRepository) GetAdminsCount(ctx context.Context, tenantID int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE is_admin = true AND tenant_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, tenantID)
	return count, err
}

// GetRecentLoginsCount returns users who logged in within specified hours
func (r *userRepository) GetRecentLoginsCount(ctx context.Context, tenantID int, hours int) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM public.users WHERE last_login >= NOW() - INTERVAL '%d hours' AND tenant_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, fmt.Sprintf(query, hours), tenantID)
	return count, err
}

// GetUserCountByDepartment returns user count grouped by department
func (r *userRepository) GetUserCountByDepartment(ctx context.Context, tenantID int) ([]models.DepartmentUserCount, error) {
	var counts []models.DepartmentUserCount
	query := `
		SELECT d.id as department_id, d.name as department_name, COUNT(u.id) as user_count
		FROM public.departments d
		LEFT JOIN public.users u ON d.id = u.department_id AND u.tenant_id = $1 AND u.deleted_at IS NULL
		WHERE d.tenant_id = $1
		GROUP BY d.id, d.name
		ORDER BY d.name`

	err := r.db.SelectContext(ctx, &counts, query, tenantID)
	return counts, err
}

// GetUserCountByRole returns user count grouped by role
func (r *userRepository) GetUserCountByRole(ctx context.Context, tenantID int) ([]models.RoleUserCount, error) {
	var counts []models.RoleUserCount
	query := `
		SELECT r.id as role_id, r.name as role_name, COUNT(ur.user_id) as user_count
		FROM public.roles r
		LEFT JOIN public.user_roles ur ON r.id = ur.role_id
		LEFT JOIN public.users u ON ur.user_id = u.id AND u.tenant_id = $1 AND u.deleted_at IS NULL
		WHERE r.tenant_id = $1
		GROUP BY r.id, r.name
		ORDER BY r.name`

	err := r.db.SelectContext(ctx, &counts, query, tenantID)
	return counts, err
}

// GetMonthlyUserGrowth returns monthly user growth statistics
func (r *userRepository) GetMonthlyUserGrowth(ctx context.Context, tenantID int, months int) ([]models.MonthlyUserGrowth, error) {
	var growth []models.MonthlyUserGrowth
	query := `
		SELECT 
			TO_CHAR(created_at, 'YYYY-MM') as month,
			EXTRACT(YEAR FROM created_at)::int as year,
			COUNT(*)::int as user_count,
			0 as growth,
			DATE_TRUNC('month', created_at) as date
		FROM public.users 
		WHERE created_at >= NOW() - INTERVAL '%d months' AND tenant_id = $1 AND deleted_at IS NULL
		GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'YYYY-MM'), EXTRACT(YEAR FROM created_at)
		ORDER BY date DESC`

	err := r.db.SelectContext(ctx, &growth, fmt.Sprintf(query, months), tenantID)
	return growth, err
}

// GetManagers returns managers with additional information
func (r *userRepository) GetManagers(ctx context.Context, limit, offset int, search string, departmentID *int) ([]ManagerInfo, int64, error) {
	var managers []ManagerInfo
	var total int64

	// Build WHERE conditions
	whereConditions := []string{"u.deleted_at IS NULL"}
	args := []interface{}{}
	argCount := 0

	// Add manager role condition
	whereConditions = append(whereConditions, `EXISTS (
		SELECT 1 FROM user_roles ur 
		JOIN roles r ON r.id = ur.role_id 
		WHERE ur.user_id = u.id AND (r.name ILIKE '%manager%' OR r.name ILIKE '%supervisor%')
	)`)

	if search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(u.first_name ILIKE $%d OR u.last_name ILIKE $%d OR u.email ILIKE $%d)", argCount, argCount, argCount))
		args = append(args, "%"+search+"%")
	}

	if departmentID != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("u.department_id = $%d", argCount))
		args = append(args, *departmentID)
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Get count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM public.users u WHERE %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	// Get managers
	query := fmt.Sprintf(`
		SELECT u.*, u.department_id, d.name as department_name,
			   0 as team_size, 0 as direct_reports
		FROM public.users u
		LEFT JOIN public.departments d ON u.department_id = d.id
		WHERE %s
		ORDER BY u.first_name, u.last_name
		LIMIT $%d OFFSET $%d`, whereClause, argCount+1, argCount+2)

	argsWithPagination := append(args, limit, offset)
	err = r.db.SelectContext(ctx, &managers, query, argsWithPagination...)

	return managers, total, err
}

// Department methods - based on interface expectations
// CreateDepartment creates a new department
func (r *userRepository) CreateDepartment(ctx context.Context, department *models.Department) (*models.Department, error) {
	query := `
		INSERT INTO public.departments (tenant_id, name, description, code, parent_department_id, 
		                               manager_id, budget, cost_center, location, phone, email, 
		                               status, is_active, hierarchy_level, sort_order, metadata, 
		                               created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		RETURNING id, created_at, updated_at`

	row := r.db.QueryRowContext(ctx, query,
		department.TenantID, department.Name, department.Description, department.Code,
		department.ParentDepartmentID, department.ManagerID, department.Budget,
		department.CostCenter, department.Location, department.Phone, department.Email,
		department.Status, department.IsActive, department.HierarchyLevel,
		department.SortOrder, department.Metadata, time.Now(), time.Now(), department.CreatedBy)

	err := row.Scan(&department.ID, &department.CreatedAt, &department.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create department: %w", err)
	}

	return department, nil
}

// GetDepartmentByID returns a department by ID
func (r *userRepository) GetDepartmentByID(ctx context.Context, id int) (*models.Department, error) {
	var dept models.Department
	query := `SELECT * FROM public.departments WHERE id = $1`
	err := r.db.GetContext(ctx, &dept, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("department not found")
		}
		return nil, err
	}
	return &dept, nil
}

// GetDepartmentByCode returns a department by code
func (r *userRepository) GetDepartmentByCode(ctx context.Context, code string) (*models.Department, error) {
	var dept models.Department
	query := `SELECT * FROM public.departments WHERE code = $1`
	err := r.db.GetContext(ctx, &dept, query, code)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("department not found")
		}
		return nil, err
	}
	return &dept, nil
}

// ListDepartments returns a list of departments
func (r *userRepository) ListDepartments(ctx context.Context, query request.DepartmentListQuery) ([]models.Department, int64, error) {
	var departments []models.Department
	var total int64

	// Use default pagination values since query doesn't have Offset/Limit fields
	limit := 20 // Default limit
	offset := 0 // Default offset

	// Build query with defaults
	sqlQuery := `SELECT * FROM public.departments ORDER BY name LIMIT $1 OFFSET $2`
	countQuery := `SELECT COUNT(*) FROM public.departments`

	err := r.db.GetContext(ctx, &total, countQuery)
	if err != nil {
		return nil, 0, err
	}

	err = r.db.SelectContext(ctx, &departments, sqlQuery, limit, offset)
	return departments, total, err
}

// UpdateDepartment updates a department
func (r *userRepository) UpdateDepartment(ctx context.Context, dept *models.Department) (*models.Department, error) {
	query := `
		UPDATE public.departments 
		SET name = $2, description = $3, code = $4, parent_department_id = $5,
		    manager_id = $6, budget = $7, cost_center = $8, location = $9,
		    phone = $10, email = $11, status = $12, is_active = $13,
		    hierarchy_level = $14, sort_order = $15, metadata = $16,
		    updated_at = $17, updated_by = $18
		WHERE id = $1
		RETURNING *`

	var updated models.Department
	err := r.db.GetContext(ctx, &updated, query,
		dept.ID, dept.Name, dept.Description, dept.Code, dept.ParentDepartmentID,
		dept.ManagerID, dept.Budget, dept.CostCenter, dept.Location,
		dept.Phone, dept.Email, dept.Status, dept.IsActive,
		dept.HierarchyLevel, dept.SortOrder, dept.Metadata,
		time.Now(), dept.UpdatedBy)

	return &updated, err
}

// DeleteDepartment deletes a department (updated signature to match interface)
func (r *userRepository) DeleteDepartment(ctx context.Context, id int, actorID int) error {
	query := `DELETE FROM public.departments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetDepartmentUserCount returns user count for a department
func (r *userRepository) GetDepartmentUserCount(ctx context.Context, departmentID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM public.users WHERE department_id = $1 AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query, departmentID)
	return count, err
}

// GetSubDepartmentsCount returns count of sub-departments
func (r *userRepository) GetSubDepartmentsCount(ctx context.Context, parentID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM public.departments WHERE parent_department_id = $1`
	err := r.db.GetContext(ctx, &count, query, parentID)
	return count, err
}

// GetSubDepartments returns sub-departments
func (r *userRepository) GetSubDepartments(ctx context.Context, parentID int) ([]models.Department, error) {
	var departments []models.Department
	query := `SELECT * FROM public.departments WHERE parent_department_id = $1 ORDER BY name`
	err := r.db.SelectContext(ctx, &departments, query, parentID)
	return departments, err
}
