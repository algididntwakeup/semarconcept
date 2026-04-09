// platform/backend/app/middleware/rate_limit_middleware.go
package middleware

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// RateLimitTier defines different rate limit tiers for different types of endpoints
type RateLimitTier string

const (
	// Public tier for unauthenticated endpoints like login and register
	PublicTier RateLimitTier = "public"

	// Standard tier for most authenticated endpoints
	StandardTier RateLimitTier = "standard"

	// Elevated tier for data-intensive endpoints
	ElevatedTier RateLimitTier = "elevated"

	// High tier for file uploads and resource-intensive operations
	HighTier RateLimitTier = "high"
)

// getRateLimitForTier returns the rate limit and burst values for a given tier
func getRateLimitForTier(tier RateLimitTier) (limit float64, burst int) {
	switch tier {
	case PublicTier:
		// 5.0 requests per second (300 requests per minute)
		// Allows reasonable authentication attempts while preventing abuse
		return 5.0, 15
	case StandardTier:
		// 10.0 requests per second (600 requests per minute)
		// Provides better user experience for API calls
		return 10.0, 25
	case ElevatedTier:
		// 3.0 requests per second (180 requests per minute)
		// Better for data-intensive operations while maintaining control
		return 3.0, 20
	case HighTier:
		//  SURGICAL ADD: High tier for file uploads - higher burst but controlled rate
		// Allows for large file uploads while preventing abuse
		return 2.0, 50
	default:
		// Default to standard tier
		return 10.0, 25
	}
}

// visitor stores the last seen time and the rate limiter for each visitor.
type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// Store limiters in a map protected by a mutex. Key can be IP or UserID.
var limiters = make(map[string]*visitor)
var mu sync.Mutex

// cleanupInterval defines how often to clean up old visitor entries.
const cleanupInterval = time.Minute * 10

func init() {
	// Run a background goroutine to clean up old entries from the limiters map.
	go cleanupLimiters()
}

// cleanupLimiters removes entries that haven't been seen for a while.
func cleanupLimiters() {
	for {
		time.Sleep(cleanupInterval)
		mu.Lock()
		for key, v := range limiters {
			// Remove if not seen in 3 * cleanupInterval (e.g., 30 minutes)
			if time.Since(v.lastSeen) > 3*cleanupInterval {
				delete(limiters, key)
			}
		}
		mu.Unlock()
	}
}

// getLimiter returns the rate limiter for the given identifier (IP or UserID).
func getLimiter(identifier string, limit rate.Limit, burst int) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	v, exists := limiters[identifier]
	if !exists {
		// Create a new rate limiter.
		limiter := rate.NewLimiter(limit, burst)
		limiters[identifier] = &visitor{limiter, time.Now()}
		log.Printf("Created new rate limiter for identifier: %s (limit: %.2f req/sec, burst: %d)", identifier, float64(limit), burst)
		return limiter
	}

	// Update the last seen time.
	v.lastSeen = time.Now()
	return v.limiter
}

// RateLimitMiddleware creates a Gin middleware for rate limiting.
// It prioritizes UserID if available in the context (set by AuthMiddleware),
// otherwise falls back to IP-based limiting.
// Ensure this runs *after* AuthMiddleware if user-based limiting is desired.
// tier: the rate limit tier to use (public, standard, elevated, high)
func RateLimitMiddleware(tier RateLimitTier) gin.HandlerFunc {
	limit, burst := getRateLimitForTier(tier)
	rateLimit := rate.Limit(limit)

	return func(c *gin.Context) {
		var identifier string
		var limiter *rate.Limiter

		// Check if user ID exists in context (set by AuthMiddleware)
		userIDValue, exists := c.Get(string(ContextUserIDKey)) // Cast ContextKey to string
		if exists {
			// Attempt to assert UserID to int (since we changed it from uint)
			if userID, ok := userIDValue.(int); ok {
				identifier = fmt.Sprintf("user:%d", userID)
				// TODO: Consider different limits for authenticated users vs. IPs
				// limiter = getLimiter(identifier, userRateLimit, userBurst)
				limiter = getLimiter(identifier, rateLimit, burst) // Using same limit for now
				// Reduced log noise - only log when creating new limiters
			}
		}

		// Fallback to IP address if user ID not found or type assertion failed
		if identifier == "" {
			identifier = c.ClientIP()
			limiter = getLimiter(identifier, rateLimit, burst)
			// Reduced log noise - only log when creating new limiters
		}

		// Check if the request is allowed
		now := time.Now()
		// Use AllowN for better compatibility with getting limiter state, though 1 is default
		allowed := limiter.AllowN(now, 1)

		// Get current state of the limiter for headers (best effort)
		currentLimit := limiter.Limit()
		currentBurst := limiter.Burst()

		// Set rate limit headers on every response
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", int(currentLimit*60))) // Convert to requests per minute

		// Calculate tokens remaining (approximate)
		tokensRemaining := limiter.Tokens()
		if tokensRemaining > float64(currentBurst) {
			tokensRemaining = float64(currentBurst)
		}
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", int(tokensRemaining)))

		// Calculate reset time (approximate)
		// Time until a full burst is available
		resetTime := time.Now().Add(time.Duration(float64(currentBurst-int(tokensRemaining))/float64(currentLimit)) * time.Second)
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime.Unix()))

		if !allowed {
			// Calculate Retry-After (time until 1 token is available)
			reservation := limiter.Reserve()
			retryAfter := reservation.Delay()
			if retryAfter > 0 {
				c.Header("Retry-After", fmt.Sprintf("%.0f", retryAfter.Seconds()))
			} else {
				// If delay is 0 or negative, use a short default retry
				c.Header("Retry-After", "1")
			}

			// IMPROVED: Better structured logging with clearer information
			log.Printf(
				`{"message": "Rate limit exceeded", "identifier": "%s", "path": "%s", "method": "%s", "limit_per_sec": %.2f, "burst": %d, "tier": "%s"}`,
				identifier,
				c.Request.URL.Path,
				c.Request.Method,
				float64(currentLimit),
				currentBurst,
				tier,
			)

			// Use standard error format as specified in API documentation
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Please try again later.",
				"details": map[string]interface{}{
					"limit_per_minute": int(currentLimit * 60), // Requests per minute
					"limit_per_second": float64(currentLimit),  // Requests per second for clarity
					"retry_after":      c.Writer.Header().Get("Retry-After"),
					"tier":             string(tier),
				},
			})
			return
		}

		c.Next()
	}
}
