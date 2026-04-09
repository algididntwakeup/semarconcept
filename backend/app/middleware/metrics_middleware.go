// platform/backend/app/middleware/metrics_middleware.go

package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// httpRequestsTotal counts the total number of HTTP requests received.
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests received.",
		},
		[]string{"method", "path", "status_code"}, // Labels to partition the metric
	)

	// httpRequestDuration observes the duration of HTTP requests.
	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Histogram of HTTP request latencies.",
			Buckets: prometheus.DefBuckets, // Default buckets: .005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10
		},
		[]string{"method", "path", "status_code"},
	)

	// TODO: Add more metrics as needed (e.g., active requests, error counts per type)
)

// MetricsMiddleware creates a Gin middleware function to collect Prometheus metrics for HTTP requests.
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process request
		c.Next()

		// After request processed, record metrics
		duration := time.Since(start).Seconds()
		statusCode := c.Writer.Status()
		method := c.Request.Method
		// Use matched route path if available (more stable than raw URL path)
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path // Fallback if route wasn't matched
		}

		// Record metrics with labels
		httpRequestsTotal.WithLabelValues(method, path, strconv.Itoa(statusCode)).Inc()
		httpRequestDuration.WithLabelValues(method, path, strconv.Itoa(statusCode)).Observe(duration)
	}
}
