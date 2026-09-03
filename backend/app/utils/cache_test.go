// platform/backend/app/utils/cache_test.go
package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCache_SetAndGet(t *testing.T) {
	cache := NewInMemoryCache()

	// 1. Set and retrieve string value
	cache.Set("myKey", "myValue", 5*time.Minute)
	val, found := cache.Get("myKey")
	assert.True(t, found)
	assert.Equal(t, "myValue", val)

	// 2. Retrieve non-existent key
	val, found = cache.Get("nonExistentKey")
	assert.False(t, found)
	assert.Nil(t, val)

	// 3. Set different type (int)
	cache.Set("intKey", 123, 5*time.Minute)
	val, found = cache.Get("intKey")
	assert.True(t, found)
	assert.Equal(t, 123, val)

	// 4. Overwrite existing key
	cache.Set("myKey", "newValue", 5*time.Minute)
	val, found = cache.Get("myKey")
	assert.True(t, found)
	assert.Equal(t, "newValue", val)
}

func TestCache_Delete(t *testing.T) {
	cache := NewInMemoryCache()

	cache.Set("tempKey", "tempValue", 5*time.Minute)
	val, found := cache.Get("tempKey")
	assert.True(t, found)
	assert.Equal(t, "tempValue", val)

	cache.Delete("tempKey")
	val, found = cache.Get("tempKey")
	assert.False(t, found)
	assert.Nil(t, val)
}

func TestCache_Clear(t *testing.T) {
	cache := NewInMemoryCache()

	cache.Set("key1", "val1", 5*time.Minute)
	cache.Set("key2", "val2", 5*time.Minute)

	cache.Flush()

	_, found1 := cache.Get("key1")
	_, found2 := cache.Get("key2")
	assert.False(t, found1)
	assert.False(t, found2)
}

func TestCache_Expiration(t *testing.T) {
	cache := NewInMemoryCache()

	// Set with 20ms TTL
	cache.Set("expiringKey", "quickValue", 20*time.Millisecond)

	// Immediately accessible
	val, found := cache.Get("expiringKey")
	assert.True(t, found)
	assert.Equal(t, "quickValue", val)

	// Wait for expiration
	time.Sleep(30 * time.Millisecond)

	// Should be expired now
	val, found = cache.Get("expiringKey")
	assert.False(t, found)
	assert.Nil(t, val)
}
