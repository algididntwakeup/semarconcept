// platform/backend/app/cache/cache.go

package cache

import (
	"sync"
	"time"
)

// Item represents a cached item with expiration
type Item struct {
	Value      interface{}
	Expiration int64
}

// IsExpired returns true if the item has expired
func (item Item) IsExpired() bool {
	if item.Expiration == 0 {
		return false
	}
	return time.Now().UnixNano() > item.Expiration
}

// Cache is a simple in-memory cache with expiration
type Cache struct {
	items map[string]Item
	mu    sync.RWMutex
}

// New creates a new cache
func New() *Cache {
	cache := &Cache{
		items: make(map[string]Item),
	}

	// Start the janitor to clean up expired items
	go cache.janitor()

	return cache
}

// Set adds an item to the cache with the given expiration duration
func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
	var expiration int64
	if duration > 0 {
		expiration = time.Now().Add(duration).UnixNano()
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = Item{
		Value:      value,
		Expiration: expiration,
	}
}

// Get retrieves an item from the cache
// Returns the item and a boolean indicating whether the item was found
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	// Check if the item has expired
	if item.IsExpired() {
		return nil, false
	}

	return item.Value, true
}

// Delete removes an item from the cache
func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
}

// Clear removes all items from the cache
func (c *Cache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]Item)
}

// janitor runs periodically and removes expired items from the cache
func (c *Cache) janitor() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C
		c.deleteExpired()
	}
}

// deleteExpired removes all expired items from the cache
func (c *Cache) deleteExpired() {
	now := time.Now().UnixNano()

	c.mu.Lock()
	defer c.mu.Unlock()

	for k, v := range c.items {
		if v.Expiration > 0 && now > v.Expiration {
			delete(c.items, k)
		}
	}
}

// GetOrSet retrieves an item from the cache if it exists, otherwise it sets it
// using the provided function and returns the result
func (c *Cache) GetOrSet(key string, duration time.Duration, fn func() (interface{}, error)) (interface{}, error) {
	// Try to get the item from the cache
	if value, found := c.Get(key); found {
		return value, nil
	}

	// If not found, call the function to get the value
	value, err := fn()
	if err != nil {
		return nil, err
	}

	// Set the value in the cache
	c.Set(key, value, duration)

	return value, nil
}
