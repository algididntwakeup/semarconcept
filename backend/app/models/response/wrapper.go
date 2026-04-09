// platform/backend/app/models/response/wrapper.go
package response

// DataResponse is a wrapper for all successful responses.
// It wraps the actual response data in a "data" field.
type DataResponse struct {
	Data interface{} `json:"data"`
}

// NewDataResponse creates a new DataResponse with the given data.
func NewDataResponse(data interface{}) DataResponse {
	return DataResponse{
		Data: data,
	}
}

// MessageResponse is a simple response with a message.
type MessageResponse struct {
	Message string `json:"message"`
}

// NewMessageResponse creates a new MessageResponse with the given message.
func NewMessageResponse(message string) MessageResponse {
	return MessageResponse{
		Message: message,
	}
}
