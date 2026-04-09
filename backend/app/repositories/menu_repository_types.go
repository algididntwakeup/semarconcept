// platform/backend/app/repositories/menu_repository_types.go

package repositories

// OrderUpdate represents an order index update operation
type OrderUpdate struct {
	ID         int  `json:"id"`
	OrderIndex int  `json:"order_index"`
	ParentID   *int `json:"parent_id,omitempty"`
}
