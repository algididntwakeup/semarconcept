// platform/backend/app/middleware/security_headers_middleware.go

package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware adds common security-related HTTP headers to responses.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent Clickjacking
		c.Header("X-Frame-Options", "DENY") // Or "SAMEORIGIN" if you need to embed in same-origin frames

		// Prevent MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// Control referrer information
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin") // A common default, adjust as needed

		// Basic XSS Protection (modern browsers have built-in protection, this adds an extra layer)
		c.Header("X-XSS-Protection", "1; mode=block")

		// Content Security Policy (CSP) - Placeholder
		// CSP is complex and requires careful configuration based on your application's resources.
		// Start with a restrictive policy and gradually allow necessary sources.
		// Example (VERY restrictive, likely needs modification):
		// c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none';")
		// Consider using a library or separate configuration for CSP.

		// HTTP Strict Transport Security (HSTS) - Placeholder
		// Enable HSTS only if your site is fully served over HTTPS and you understand the implications.
		// Example (preload requires submission to HSTS preload lists):
		// c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload") // max-age=1 year

		c.Next()
	}
}
