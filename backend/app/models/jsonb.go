// platform/backend/app/models/jsonb.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"reflect"

	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

// JSONBMap represents a JSONB field in PostgreSQL with complete GORM support
type JSONBMap map[string]interface{}

// Value implements the driver.Valuer interface for database serialization
func (j JSONBMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for database deserialization
func (j *JSONBMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, j)
}

// GormDataType tells GORM what data type to use for this field
func (JSONBMap) GormDataType() string {
	return "jsonb"
}

// GormDBDataType returns the database data type based on the current database driver
func (JSONBMap) GormDBDataType(db *gorm.DB, field *schema.Field) string {
	switch db.Dialector.Name() {
	case "postgres":
		return "JSONB"
	case "mysql":
		return "JSON"
	case "sqlite":
		return "TEXT"
	default:
		return "TEXT"
	}
}

// Helper methods for JSONBMap
func (j JSONBMap) Set(key string, value interface{}) {
	if j == nil {
		j = make(JSONBMap)
	}
	j[key] = value
}

func (j JSONBMap) Get(key string) interface{} {
	if j == nil {
		return nil
	}
	return j[key]
}

func (j JSONBMap) GetString(key string) string {
	if val := j.Get(key); val != nil {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func (j JSONBMap) GetBool(key string) bool {
	if val := j.Get(key); val != nil {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}

func (j JSONBMap) GetInt(key string) int {
	if val := j.Get(key); val != nil {
		if i, ok := val.(int); ok {
			return i
		}
		if f, ok := val.(float64); ok {
			return int(f)
		}
	}
	return 0
}

func (j JSONBMap) GetFloat64(key string) float64 {
	if val := j.Get(key); val != nil {
		if f, ok := val.(float64); ok {
			return f
		}
		if i, ok := val.(int); ok {
			return float64(i)
		}
	}
	return 0.0
}

func (j JSONBMap) GetArray(key string) []interface{} {
	if val := j.Get(key); val != nil {
		if arr, ok := val.([]interface{}); ok {
			return arr
		}
	}
	return nil
}

func (j JSONBMap) GetStringArray(key string) []string {
	if val := j.GetArray(key); val != nil {
		result := make([]string, 0, len(val))
		for _, v := range val {
			if str, ok := v.(string); ok {
				result = append(result, str)
			}
		}
		return result
	}
	return nil
}

func (j JSONBMap) Has(key string) bool {
	if j == nil {
		return false
	}
	_, exists := j[key]
	return exists
}

func (j JSONBMap) Delete(key string) {
	if j != nil {
		delete(j, key)
	}
}

func (j JSONBMap) IsEmpty() bool {
	return len(j) == 0
}

func (j JSONBMap) Keys() []string {
	if j == nil {
		return nil
	}
	keys := make([]string, 0, len(j))
	for key := range j {
		keys = append(keys, key)
	}
	return keys
}

func (j JSONBMap) Copy() JSONBMap {
	if j == nil {
		return nil
	}
	copy := make(JSONBMap, len(j))
	for key, value := range j {
		copy[key] = value
	}
	return copy
}

func (j JSONBMap) Merge(other JSONBMap) {
	if j == nil || other == nil {
		return
	}
	for key, value := range other {
		j[key] = value
	}
}

func (j JSONBMap) String() string {
	if j == nil {
		return "{}"
	}
	data, err := json.Marshal(j)
	if err != nil {
		return "{}"
	}
	return string(data)
}

// JSONBArray represents a JSONB array field in PostgreSQL
type JSONBArray []interface{}

// Value implements the driver.Valuer interface for database serialization
func (j JSONBArray) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for database deserialization
func (j *JSONBArray) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, j)
}

// GormDataType tells GORM what data type to use for this field
func (JSONBArray) GormDataType() string {
	return "jsonb"
}

// GormDBDataType returns the database data type based on the current database driver
func (JSONBArray) GormDBDataType(db *gorm.DB, field *schema.Field) string {
	switch db.Dialector.Name() {
	case "postgres":
		return "JSONB"
	case "mysql":
		return "JSON"
	case "sqlite":
		return "TEXT"
	default:
		return "TEXT"
	}
}

// Helper methods for JSONBArray
func (j JSONBArray) Length() int {
	return len(j)
}

func (j JSONBArray) IsEmpty() bool {
	return len(j) == 0
}

func (j *JSONBArray) Append(value interface{}) {
	*j = append(*j, value)
}

func (j *JSONBArray) Prepend(value interface{}) {
	*j = append([]interface{}{value}, *j...)
}

func (j JSONBArray) Get(index int) interface{} {
	if index < 0 || index >= len(j) {
		return nil
	}
	return j[index]
}

func (j JSONBArray) GetString(index int) string {
	if val := j.Get(index); val != nil {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func (j JSONBArray) GetInt(index int) int {
	if val := j.Get(index); val != nil {
		if i, ok := val.(int); ok {
			return i
		}
		if f, ok := val.(float64); ok {
			return int(f)
		}
	}
	return 0
}

func (j JSONBArray) GetBool(index int) bool {
	if val := j.Get(index); val != nil {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}

func (j JSONBArray) Contains(value interface{}) bool {
	for _, item := range j {
		if reflect.DeepEqual(item, value) {
			return true
		}
	}
	return false
}

func (j JSONBArray) ContainsString(value string) bool {
	for _, item := range j {
		if str, ok := item.(string); ok && str == value {
			return true
		}
	}
	return false
}

func (j *JSONBArray) Remove(index int) {
	if index < 0 || index >= len(*j) {
		return
	}
	*j = append((*j)[:index], (*j)[index+1:]...)
}

func (j *JSONBArray) RemoveValue(value interface{}) {
	for i := len(*j) - 1; i >= 0; i-- {
		if reflect.DeepEqual((*j)[i], value) {
			j.Remove(i)
		}
	}
}

func (j JSONBArray) ToStringArray() []string {
	result := make([]string, 0, len(j))
	for _, item := range j {
		if str, ok := item.(string); ok {
			result = append(result, str)
		}
	}
	return result
}

func (j JSONBArray) ToIntArray() []int {
	result := make([]int, 0, len(j))
	for _, item := range j {
		if i, ok := item.(int); ok {
			result = append(result, i)
		} else if f, ok := item.(float64); ok {
			result = append(result, int(f))
		}
	}
	return result
}

func (j JSONBArray) String() string {
	if j == nil {
		return "[]"
	}
	data, err := json.Marshal(j)
	if err != nil {
		return "[]"
	}
	return string(data)
}

// JSONBString represents a JSONB string field (for when you need JSONB storage but string access)
type JSONBString string

// Value implements the driver.Valuer interface for database serialization
func (j JSONBString) Value() (driver.Value, error) {
	if j == "" {
		return nil, nil
	}
	return json.Marshal(string(j))
}

// Scan implements the sql.Scanner interface for database deserialization
func (j *JSONBString) Scan(value interface{}) error {
	if value == nil {
		*j = ""
		return nil
	}

	var str string
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("type assertion failed")
	}

	if err := json.Unmarshal(bytes, &str); err != nil {
		// If it's not valid JSON, treat as plain string
		*j = JSONBString(string(bytes))
		return nil
	}

	*j = JSONBString(str)
	return nil
}

// GormDataType tells GORM what data type to use for this field
func (JSONBString) GormDataType() string {
	return "jsonb"
}

// GormDBDataType returns the database data type based on the current database driver
func (JSONBString) GormDBDataType(db *gorm.DB, field *schema.Field) string {
	switch db.Dialector.Name() {
	case "postgres":
		return "JSONB"
	case "mysql":
		return "JSON"
	case "sqlite":
		return "TEXT"
	default:
		return "TEXT"
	}
}

func (j JSONBString) String() string {
	return string(j)
}

func (j JSONBString) IsEmpty() bool {
	return j == ""
}

// Utility functions for creating JSONB types
func NewJSONBMap() JSONBMap {
	return make(JSONBMap)
}

func NewJSONBArray() JSONBArray {
	return make(JSONBArray, 0)
}

func JSONBMapFrom(data map[string]interface{}) JSONBMap {
	if data == nil {
		return nil
	}
	result := make(JSONBMap, len(data))
	for key, value := range data {
		result[key] = value
	}
	return result
}

func JSONBArrayFrom(data []interface{}) JSONBArray {
	if data == nil {
		return nil
	}
	result := make(JSONBArray, len(data))
	copy(result, data)
	return result
}

func JSONBArrayFromStrings(data []string) JSONBArray {
	if data == nil {
		return nil
	}
	result := make(JSONBArray, len(data))
	for i, str := range data {
		result[i] = str
	}
	return result
}

func JSONBArrayFromInts(data []int) JSONBArray {
	if data == nil {
		return nil
	}
	result := make(JSONBArray, len(data))
	for i, num := range data {
		result[i] = num
	}
	return result
}
