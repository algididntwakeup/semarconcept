// platform/backend/app/api/websocket/message.go

package websocket

import (
	"encoding/json"
	"time"
)

// MessageType defines the type of WebSocket message
type MessageType string

// Message types
const (
	MessageTypeAuth        MessageType = "auth"
	MessageTypeSubscribe   MessageType = "subscribe"
	MessageTypeUnsubscribe MessageType = "unsubscribe"
	MessageTypeUpdate      MessageType = "update"
	MessageTypeError       MessageType = "error"
	MessageTypePing        MessageType = "ping"
	MessageTypePong        MessageType = "pong"
)

// EntityType defines the type of entity for subscriptions and updates
type EntityType string

// Entity types
const (
	EntityTypeDashboard    EntityType = "dashboard"
	EntityTypeNotification EntityType = "notification"
	EntityTypeContent      EntityType = "content"
)

// BaseMessage is the base structure for all WebSocket messages
type BaseMessage struct {
	Type      MessageType `json:"type"`
	Timestamp int64       `json:"timestamp"`
	ID        string      `json:"id,omitempty"`
}

// NewBaseMessage creates a new base message with the given type
func NewBaseMessage(msgType MessageType) BaseMessage {
	return BaseMessage{
		Type:      msgType,
		Timestamp: time.Now().UnixMilli(),
	}
}

// AuthMessage is sent by the client to authenticate
type AuthMessage struct {
	BaseMessage
	Token string `json:"token"`
}

// NewAuthMessage creates a new authentication message
func NewAuthMessage(token string) AuthMessage {
	msg := AuthMessage{
		BaseMessage: NewBaseMessage(MessageTypeAuth),
		Token:       token,
	}
	return msg
}

// SubscriptionMessage is sent by the client to subscribe to updates
type SubscriptionMessage struct {
	BaseMessage
	Entity  EntityType             `json:"entity"`
	ID      interface{}            `json:"id"`
	Options map[string]interface{} `json:"options,omitempty"`
}

// NewSubscriptionMessage creates a new subscription message
func NewSubscriptionMessage(subscribe bool, entity EntityType, id interface{}, options map[string]interface{}) SubscriptionMessage {
	msgType := MessageTypeSubscribe
	if !subscribe {
		msgType = MessageTypeUnsubscribe
	}

	msg := SubscriptionMessage{
		BaseMessage: NewBaseMessage(msgType),
		Entity:      entity,
		ID:          id,
		Options:     options,
	}
	return msg
}

// UpdateMessage is sent by the server when an entity is updated
type UpdateMessage struct {
	BaseMessage
	Entity EntityType  `json:"entity"`
	ID     interface{} `json:"id"`
	Data   interface{} `json:"data"`
	Source string      `json:"source,omitempty"`
}

// NewUpdateMessage creates a new update message
func NewUpdateMessage(entity EntityType, id interface{}, data interface{}, source string) UpdateMessage {
	msg := UpdateMessage{
		BaseMessage: NewBaseMessage(MessageTypeUpdate),
		Entity:      entity,
		ID:          id,
		Data:        data,
		Source:      source,
	}
	return msg
}

// ErrorMessage is sent when an error occurs
type ErrorMessage struct {
	BaseMessage
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// NewErrorMessage creates a new error message
func NewErrorMessage(code string, message string, details interface{}) ErrorMessage {
	msg := ErrorMessage{
		BaseMessage: NewBaseMessage(MessageTypeError),
		Code:        code,
		Message:     message,
		Details:     details,
	}
	return msg
}

// PingMessage is sent to keep the connection alive
type PingMessage struct {
	BaseMessage
}

// NewPingMessage creates a new ping message
func NewPingMessage() PingMessage {
	return PingMessage{
		BaseMessage: NewBaseMessage(MessageTypePing),
	}
}

// PongMessage is sent in response to a ping
type PongMessage struct {
	BaseMessage
	Echo int64 `json:"echo,omitempty"`
}

// NewPongMessage creates a new pong message
func NewPongMessage(echo int64) PongMessage {
	return PongMessage{
		BaseMessage: NewBaseMessage(MessageTypePong),
		Echo:        echo,
	}
}

// ParseMessage parses a JSON message into the appropriate message type
func ParseMessage(data []byte) (interface{}, error) {
	// Parse base message to determine type
	var base BaseMessage
	if err := json.Unmarshal(data, &base); err != nil {
		return nil, err
	}

	// Parse specific message type
	switch base.Type {
	case MessageTypeAuth:
		var msg AuthMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			return nil, err
		}
		return msg, nil
	case MessageTypeSubscribe, MessageTypeUnsubscribe:
		var msg SubscriptionMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			return nil, err
		}
		return msg, nil
	case MessageTypeUpdate:
		var msg UpdateMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			return nil, err
		}
		return msg, nil
	case MessageTypeError:
		var msg ErrorMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			return nil, err
		}
		return msg, nil
	case MessageTypePing:
		var msg PingMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			return nil, err
		}
		return msg, nil
	case MessageTypePong:
		var msg PongMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			return nil, err
		}
		return msg, nil
	default:
		return base, nil
	}
}
