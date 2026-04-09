// platform/backend/app/models/response/pagination.go

package response

// PaginationResponse represents pagination information in API responses
type PaginationResponse struct {
	Total       int `json:"total"`
	PerPage     int `json:"per_page"`
	CurrentPage int `json:"current_page"`
	LastPage    int `json:"last_page"`
	From        int `json:"from"`
	To          int `json:"to"`
}

// NewPaginationResponse creates a new pagination response
func NewPaginationResponse(total, perPage, currentPage int) PaginationResponse {
	lastPage := (total + perPage - 1) / perPage
	if lastPage < 1 {
		lastPage = 1
	}

	from := (currentPage-1)*perPage + 1
	if total == 0 {
		from = 0
	}

	to := currentPage * perPage
	if to > total {
		to = total
	}

	return PaginationResponse{
		Total:       total,
		PerPage:     perPage,
		CurrentPage: currentPage,
		LastPage:    lastPage,
		From:        from,
		To:          to,
	}
}
