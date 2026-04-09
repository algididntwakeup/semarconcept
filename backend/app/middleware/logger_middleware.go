// platform/backend/app/middleware/logger_middleware.go

package middleware

import (
	"backend/app/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// LoggingConfig holds configuration for the logging middleware
type LoggingConfig struct {
	LogRequestBody  bool
	LogResponseBody bool
	LogHeaders      bool
	SkipPaths       []string
}

// DefaultLoggingConfig returns the default logging configuration
func DefaultLoggingConfig() LoggingConfig {
	return LoggingConfig{
		LogRequestBody:  os.Getenv("REKSOLINDO_LOG_REQUEST_BODY") == "true",
		LogResponseBody: os.Getenv("REKSOLINDO_LOG_RESPONSE_BODY") == "true",
		LogHeaders:      true,
		SkipPaths:       []string{"/api/v1/health", "/swagger"},
	}
}

// responseBodyWriter is a custom response writer that captures the response body
type responseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

// Write captures the response body
func (w *responseBodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// LoggingMiddleware returns a middleware that logs HTTP requests and responses
func LoggingMiddleware() gin.HandlerFunc {
	config := DefaultLoggingConfig()
	return func(c *gin.Context) {
		// Get path and method
		path := c.Request.URL.Path
		method := c.Request.Method

		// Special handling for OPTIONS requests to auth endpoints
		if method == "OPTIONS" && strings.Contains(path, "/api/v1/auth/") {
			// Print directly to console for immediate visibility
			fmt.Printf("\n\n==== OPTIONS REQUEST TO AUTH ENDPOINT ====\n")
			fmt.Printf("PATH: %s\n", path)
			fmt.Printf("METHOD: %s\n", method)
			fmt.Printf("HEADERS:\n")
			for k, v := range c.Request.Header {
				fmt.Printf("  %s: %s\n", k, strings.Join(v, ", "))
			}
			fmt.Printf("ORIGIN: %s\n", c.Request.Header.Get("Origin"))
			fmt.Printf("ACCESS-CONTROL-REQUEST-METHOD: %s\n", c.Request.Header.Get("Access-Control-Request-Method"))
			fmt.Printf("ACCESS-CONTROL-REQUEST-HEADERS: %s\n", c.Request.Header.Get("Access-Control-Request-Headers"))
			fmt.Printf("CLIENT IP: %s\n", c.ClientIP())
			fmt.Printf("==========================================\n\n")
		}

		// Skip logging for certain paths (except OPTIONS to auth)
		if method != "OPTIONS" || !strings.Contains(path, "/api/v1/auth/") {
			for _, skipPath := range config.SkipPaths {
				if strings.HasPrefix(path, skipPath) {
					c.Next()
					return
				}
			}
		}

		// Start timer
		start := time.Now()

		// Generate request ID if not present
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
			c.Request.Header.Set("X-Request-ID", requestID)
		}
		c.Set("RequestID", requestID)

		// Log request
		logRequest(c, config, requestID)

		// Create a custom response writer to capture the response body
		var responseBody *bytes.Buffer
		if config.LogResponseBody {
			responseBody = &bytes.Buffer{}
			writer := &responseBodyWriter{
				ResponseWriter: c.Writer,
				body:           responseBody,
			}
			c.Writer = writer
		}

		// Process request
		c.Next()

		// Log response
		duration := time.Since(start)
		logResponse(c, config, requestID, duration, responseBody)
	}
}

// logRequest logs the HTTP request
func logRequest(c *gin.Context, config LoggingConfig, requestID string) {
	method := c.Request.Method
	path := c.Request.URL.Path
	query := c.Request.URL.RawQuery
	clientIP := c.ClientIP()
	userAgent := c.Request.UserAgent()

	// Prepare log fields
	logFields := map[string]interface{}{
		"request_id": requestID,
		"method":     method,
		"path":       path,
		"client_ip":  clientIP,
		"user_agent": userAgent,
	}

	// Add query parameters if present
	if query != "" {
		logFields["query"] = query
	}

	// Add headers if configured
	if config.LogHeaders {
		headers := make(map[string]string)
		for k, v := range c.Request.Header {
			// Skip sensitive headers
			if !isSensitiveHeader(k) {
				headers[k] = strings.Join(v, ", ")
			}
		}
		logFields["headers"] = headers
	}

	// Log request body if configured
	if config.LogRequestBody && c.Request.Body != nil && c.Request.ContentLength > 0 {
		// Read the request body
		bodyBytes, _ := io.ReadAll(c.Request.Body)
		// Restore the request body for further processing
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		// Try to parse as JSON for better logging
		var bodyJSON interface{}
		if err := json.Unmarshal(bodyBytes, &bodyJSON); err == nil {
			logFields["body"] = bodyJSON
		} else {
			// If not JSON, log as string (truncated if too large)
			bodyStr := string(bodyBytes)
			if len(bodyStr) > 1000 {
				bodyStr = bodyStr[:1000] + "... (truncated)"
			}
			logFields["body"] = bodyStr
		}
	}

	// Log the request
	utils.Info("HTTP Request", logFields)
}

// logResponse logs the HTTP response
func logResponse(c *gin.Context, config LoggingConfig, requestID string, duration time.Duration, responseBody *bytes.Buffer) {
	status := c.Writer.Status()
	size := c.Writer.Size()
	path := c.Request.URL.Path
	method := c.Request.Method

	// Prepare log fields
	logFields := map[string]interface{}{
		"request_id":  requestID,
		"method":      method,
		"path":        path,
		"status":      status,
		"size":        size,
		"duration":    duration.String(),
		"duration_ms": float64(duration.Microseconds()) / 1000.0,
	}

	// Add response body if configured
	if config.LogResponseBody && responseBody != nil && responseBody.Len() > 0 {
		bodyBytes := responseBody.Bytes()

		// Try to parse as JSON for better logging
		var bodyJSON interface{}
		if err := json.Unmarshal(bodyBytes, &bodyJSON); err == nil {
			logFields["response_body"] = bodyJSON
		} else {
			// If not JSON, log as string (truncated if too large)
			bodyStr := string(bodyBytes)
			if len(bodyStr) > 1000 {
				bodyStr = bodyStr[:1000] + "... (truncated)"
			}
			logFields["response_body"] = bodyStr
		}
	}

	// Log with appropriate level based on status code
	if status >= 500 {
		utils.Error("HTTP Response", logFields)
	} else if status >= 400 {
		utils.Warn("HTTP Response", logFields)
	} else {
		utils.Info("HTTP Response", logFields)
	}
}

// isSensitiveHeader checks if a header is sensitive and should not be logged
func isSensitiveHeader(header string) bool {
	header = strings.ToLower(header)
	sensitiveHeaders := []string{
		"authorization",
		"cookie",
		"set-cookie",
		"x-api-key",
		"x-auth-token",
		"x-csrf-token",
	}

	for _, h := range sensitiveHeaders {
		if header == h {
			return true
		}
	}
	return false
}
