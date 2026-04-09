// platform/backend/app/utils/cache.go
package utils

import (
	"sync"
	"time"
)

// CacheItem represents an item stored in the cache.
type CacheItem struct {
	Value      interface{}
	Expiration int64 // Unix timestamp
}

// InMemoryCache provides a simple thread-safe in-memory cache.
type InMemoryCache struct {
	items map[string]CacheItem
	mu    sync.RWMutex
}

// NewInMemoryCache creates a new InMemoryCache instance.
func NewInMemoryCache() *InMemoryCache {
	return &InMemoryCache{
		items: make(map[string]CacheItem),
	}
}

// Set adds an item to the cache with a specified duration.
func (c *InMemoryCache) Set(key string, value interface{}, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	expiration := time.Now().Add(duration).UnixNano()
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: expiration,
	}
}

// Get retrieves an item from the cache.
// It returns the item and true if found and not expired, otherwise nil and false.
func (c *InMemoryCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	if time.Now().UnixNano() > item.Expiration {
		// Item has expired, conceptually remove it (lazy deletion)
		// We could explicitly delete here, but Get failing is sufficient
		// delete(c.items, key) // Optional: explicit cleanup
		return nil, false
	}

	return item.Value, true
}

// Delete removes an item from the cache.
func (c *InMemoryCache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

// Flush removes all items from the cache.
func (c *InMemoryCache) Flush() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]CacheItem)
}
