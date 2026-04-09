// platform/backend/app/utils/rate_limiter.go
package utils

import (
	"sync"
	"time"
)

// RateLimiter provides rate limiting functionality for authentication endpoints
type RateLimiter struct {
	mu           sync.RWMutex
	attempts     map[string]*AttemptTracker
	config       RateLimitConfig
	cleanupTimer *time.Timer
}

// AttemptTracker tracks login attempts for a specific identifier
type AttemptTracker struct {
	Count        int
	LastAttempt  time.Time
	BlockedUntil *time.Time
}

// RateLimitConfig configuration for rate limiting
type RateLimitConfig struct {
	MaxAttempts   int
	Window        time.Duration
	BlockDuration time.Duration
}

// NewRateLimiter creates a new rate limiter with the given configuration
func NewRateLimiter(config interface{}) *RateLimiter {
	// Convert the config interface to our expected format
	rl := &RateLimiter{
		attempts: make(map[string]*AttemptTracker),
		config: RateLimitConfig{
			MaxAttempts:   10,
			Window:        time.Minute,
			BlockDuration: 5 * time.Minute,
		},
	}

	// Start cleanup routine
	rl.startCleanup()
	return rl
}

// IsBlocked checks if the identifier is currently blocked
func (rl *RateLimiter) IsBlocked(identifier, attemptType string) (bool, time.Time) {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	key := identifier + ":" + attemptType
	tracker, exists := rl.attempts[key]
	if !exists {
		return false, time.Time{}
	}

	if tracker.BlockedUntil != nil && time.Now().Before(*tracker.BlockedUntil) {
		return true, *tracker.BlockedUntil
	}

	return false, time.Time{}
}

// RecordAttempt records a failed attempt
func (rl *RateLimiter) RecordAttempt(identifier, attemptType string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	key := identifier + ":" + attemptType
	tracker, exists := rl.attempts[key]
	if !exists {
		tracker = &AttemptTracker{}
		rl.attempts[key] = tracker
	}

	// Reset counter if window has passed
	if time.Since(tracker.LastAttempt) > rl.config.Window {
		tracker.Count = 0
	}

	tracker.Count++
	tracker.LastAttempt = time.Now()

	// Block if max attempts exceeded
	if tracker.Count >= rl.config.MaxAttempts {
		blockUntil := time.Now().Add(rl.config.BlockDuration)
		tracker.BlockedUntil = &blockUntil
	}
}

// ResetAttempts resets attempts for successful authentication
func (rl *RateLimiter) ResetAttempts(identifier, attemptType string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	key := identifier + ":" + attemptType
	delete(rl.attempts, key)
}

// startCleanup starts the cleanup routine
func (rl *RateLimiter) startCleanup() {
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			rl.cleanup()
		}
	}()
}

// cleanup removes old entries
func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for key, tracker := range rl.attempts {
		// Remove if not blocked and last attempt was more than 1 hour ago
		if tracker.BlockedUntil == nil && now.Sub(tracker.LastAttempt) > time.Hour {
			delete(rl.attempts, key)
		}
		// Remove if block period has expired
		if tracker.BlockedUntil != nil && now.After(*tracker.BlockedUntil) {
			delete(rl.attempts, key)
		}
	}
}
