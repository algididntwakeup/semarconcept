// platform/backend/app/cache/service.go

package cache

import (
	"encoding/json"
	"fmt"
	"time"
)

// DefaultExpiration is the default expiration time for cached items
const DefaultExpiration = 5 * time.Minute

// Service provides caching functionality for the application
type Service struct {
	cache *Cache
}

// NewService creates a new cache service
func NewService() *Service {
	return &Service{
		cache: New(),
	}
}

// Get retrieves an item from the cache and unmarshals it into the provided value
func (s *Service) Get(key string, value interface{}) bool {
	data, found := s.cache.Get(key)
	if !found {
		return false
	}

	// If the data is already of the correct type, just assign it
	if v, ok := data.(interface{}); ok && value == nil {
		value = v
		return true
	}

	// Otherwise, try to unmarshal it
	jsonData, err := json.Marshal(data)
	if err != nil {
		return false
	}

	err = json.Unmarshal(jsonData, value)
	if err != nil {
		return false
	}

	return true
}

// Set adds an item to the cache with the given expiration duration
func (s *Service) Set(key string, value interface{}, duration time.Duration) {
	s.cache.Set(key, value, duration)
}

// Delete removes an item from the cache
func (s *Service) Delete(key string) {
	s.cache.Delete(key)
}

// Clear removes all items from the cache
func (s *Service) Clear() {
	s.cache.Clear()
}

// GetOrSet retrieves an item from the cache if it exists, otherwise it sets it
// using the provided function and returns the result
func (s *Service) GetOrSet(key string, value interface{}, duration time.Duration, fn func() (interface{}, error)) error {
	// Try to get the item from the cache
	if s.Get(key, value) {
		return nil
	}

	// If not found, call the function to get the value
	result, err := fn()
	if err != nil {
		return err
	}

	// Set the value in the cache
	s.cache.Set(key, result, duration)

	// Unmarshal the result into the value
	jsonData, err := json.Marshal(result)
	if err != nil {
		return err
	}

	err = json.Unmarshal(jsonData, value)
	if err != nil {
		return err
	}

	return nil
}

// InvalidateByPrefix removes all items from the cache with the given prefix
func (s *Service) InvalidateByPrefix(prefix string) {
	s.cache.mu.Lock()
	defer s.cache.mu.Unlock()

	for k := range s.cache.items {
		if len(k) >= len(prefix) && k[:len(prefix)] == prefix {
			delete(s.cache.items, k)
		}
	}
}

// InvalidateByKeys removes all items from the cache with the given keys
func (s *Service) InvalidateByKeys(keys []string) {
	for _, key := range keys {
		s.cache.Delete(key)
	}
}

// GenerateKey generates a cache key for the given entity and ID
func (s *Service) GenerateKey(entity string, id interface{}) string {
	return fmt.Sprintf("%s:%v", entity, id)
}

// GenerateListKey generates a cache key for a list of entities with the given parameters
func (s *Service) GenerateListKey(entity string, params map[string]interface{}) string {
	key := entity + ":list"
	for k, v := range params {
		key += fmt.Sprintf(":%s=%v", k, v)
	}
	return key
}
