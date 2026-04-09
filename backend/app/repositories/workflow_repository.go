// platform/backend/app/repositories/workflow_repository.go

package repositories

import (
	"backend/app/models"
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

//  REMOVED: WorkflowRepository interface declaration (now only in interfaces.go)

// workflowRepository implements the WorkflowRepository interface.
type workflowRepository struct {
	db *sqlx.DB
}

// NewWorkflowRepository creates a new WorkflowRepository implementation.
func NewWorkflowRepository(db *sqlx.DB) WorkflowRepository {
	return &workflowRepository{db: db}
}

// Workflow CRUD operations

func (r *workflowRepository) CreateWorkflow(ctx context.Context, workflow *models.Workflow) error {
	query := `
		INSERT INTO workflow_definitions (name, description, tenant_id, is_active, created_at, updated_at)
		VALUES (:name, :description, :tenant_id, :is_active, :created_at, :updated_at)
		RETURNING id
	`

	rows, err := r.db.NamedQueryContext(ctx, query, workflow)
	if err != nil {
		return fmt.Errorf("failed to create workflow: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		return rows.Scan(&workflow.ID)
	}

	return fmt.Errorf("failed to get created workflow ID")
}

func (r *workflowRepository) GetWorkflowByID(ctx context.Context, id uint) (*models.Workflow, error) {
	var workflow models.Workflow
	query := `SELECT * FROM workflow_definitions WHERE id = $1`

	err := r.db.GetContext(ctx, &workflow, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow by ID: %w", err)
	}

	return &workflow, nil
}

func (r *workflowRepository) GetWorkflowByName(ctx context.Context, name string) (*models.Workflow, error) {
	var workflow models.Workflow
	query := `SELECT * FROM workflow_definitions WHERE name = $1`

	err := r.db.GetContext(ctx, &workflow, query, name)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow by name: %w", err)
	}

	return &workflow, nil
}

func (r *workflowRepository) UpdateWorkflow(ctx context.Context, workflow *models.Workflow) error {
	query := `
		UPDATE workflow_definitions 
		SET name = :name, description = :description, is_active = :is_active, updated_at = :updated_at
		WHERE id = :id
	`

	_, err := r.db.NamedExecContext(ctx, query, workflow)
	if err != nil {
		return fmt.Errorf("failed to update workflow: %w", err)
	}

	return nil
}

func (r *workflowRepository) DeleteWorkflow(ctx context.Context, id uint) error {
	query := `DELETE FROM workflow_definitions WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete workflow: %w", err)
	}

	return nil
}

func (r *workflowRepository) ListWorkflows(ctx context.Context, limit, offset int) ([]models.Workflow, int64, error) {
	var workflows []models.Workflow
	var totalCount int64

	// Get total count
	countQuery := `SELECT COUNT(*) FROM workflow_definitions`
	err := r.db.GetContext(ctx, &totalCount, countQuery)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get workflows count: %w", err)
	}

	// Get workflows with pagination
	selectQuery := `
		SELECT * FROM workflow_definitions 
		ORDER BY created_at DESC 
		LIMIT $1 OFFSET $2
	`

	err = r.db.SelectContext(ctx, &workflows, selectQuery, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get workflows: %w", err)
	}

	return workflows, totalCount, nil
}

// Stage operations

func (r *workflowRepository) CreateStage(ctx context.Context, stage *models.WorkflowStage) error {
	query := `
		INSERT INTO workflow_stages (workflow_id, name, description, stage_type, order_index, is_initial, is_final, created_at, updated_at)
		VALUES (:workflow_id, :name, :description, :stage_type, :order_index, :is_initial, :is_final, :created_at, :updated_at)
		RETURNING id
	`

	rows, err := r.db.NamedQueryContext(ctx, query, stage)
	if err != nil {
		return fmt.Errorf("failed to create workflow stage: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		return rows.Scan(&stage.ID)
	}

	return fmt.Errorf("failed to get created workflow stage ID")
}

func (r *workflowRepository) GetStageByID(ctx context.Context, id uint) (*models.WorkflowStage, error) {
	var stage models.WorkflowStage
	query := `SELECT * FROM workflow_stages WHERE id = $1`

	err := r.db.GetContext(ctx, &stage, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow stage by ID: %w", err)
	}

	return &stage, nil
}

func (r *workflowRepository) ListStagesByWorkflow(ctx context.Context, workflowID uint) ([]models.WorkflowStage, error) {
	var stages []models.WorkflowStage
	query := `SELECT * FROM workflow_stages WHERE workflow_id = $1 ORDER BY order_index`

	err := r.db.SelectContext(ctx, &stages, query, workflowID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow stages: %w", err)
	}

	return stages, nil
}

func (r *workflowRepository) FindInitialStage(ctx context.Context, workflowID uint) (*models.WorkflowStage, error) {
	var stage models.WorkflowStage
	query := `SELECT * FROM workflow_stages WHERE workflow_id = $1 AND is_initial = true LIMIT 1`

	err := r.db.GetContext(ctx, &stage, query, workflowID)
	if err != nil {
		return nil, fmt.Errorf("failed to find initial workflow stage: %w", err)
	}

	return &stage, nil
}

// Transition operations

func (r *workflowRepository) CreateTransition(ctx context.Context, transition *models.WorkflowTransition) error {
	query := `
		INSERT INTO workflow_transitions (workflow_id, from_stage_id, to_stage_id, name, condition_type, condition_data, required_permission, created_at, updated_at)
		VALUES (:workflow_id, :from_stage_id, :to_stage_id, :name, :condition_type, :condition_data, :required_permission, :created_at, :updated_at)
		RETURNING id
	`

	rows, err := r.db.NamedQueryContext(ctx, query, transition)
	if err != nil {
		return fmt.Errorf("failed to create workflow transition: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		return rows.Scan(&transition.ID)
	}

	return fmt.Errorf("failed to get created workflow transition ID")
}

func (r *workflowRepository) GetTransitionByID(ctx context.Context, id uint) (*models.WorkflowTransition, error) {
	var transition models.WorkflowTransition
	query := `SELECT * FROM workflow_transitions WHERE id = $1`

	err := r.db.GetContext(ctx, &transition, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow transition by ID: %w", err)
	}

	return &transition, nil
}

func (r *workflowRepository) FindTransitionsFromStage(ctx context.Context, workflowID uint, fromStageID uint) ([]models.WorkflowTransition, error) {
	var transitions []models.WorkflowTransition
	query := `SELECT * FROM workflow_transitions WHERE workflow_id = $1 AND from_stage_id = $2`

	err := r.db.SelectContext(ctx, &transitions, query, workflowID, fromStageID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow transitions: %w", err)
	}

	return transitions, nil
}

func (r *workflowRepository) CheckUserPermissionForTransition(ctx context.Context, userID uint, transitionID uint) (bool, error) {
	// Get the transition's required permission
	var requiredPermission string
	query := `SELECT required_permission FROM workflow_transitions WHERE id = $1`

	err := r.db.GetContext(ctx, &requiredPermission, query, transitionID)
	if err != nil {
		return false, fmt.Errorf("failed to get transition permission: %w", err)
	}

	// If no permission required, allow
	if requiredPermission == "" {
		return true, nil
	}

	// Check if user has the required permission
	permissionQuery := `
		SELECT COUNT(*) FROM role_permissions rp
		JOIN user_roles ur ON rp.role_id = ur.role_id
		JOIN permissions p ON rp.permission_id = p.id
		WHERE ur.user_id = $1 AND p.name = $2
	`

	var count int
	err = r.db.GetContext(ctx, &count, permissionQuery, userID, requiredPermission)
	if err != nil {
		return false, fmt.Errorf("failed to check user permission: %w", err)
	}

	return count > 0, nil
}

// Ensure implementation satisfies the interface
var _ WorkflowRepository = (*workflowRepository)(nil)
