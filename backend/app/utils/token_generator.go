// platform/backend/app/utils/token_generator.go
package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateSecureToken generates a random hex-encoded string of a specified byte length.
// For example, length 32 will produce a 64-character hex string.
func GenerateSecureToken(length int) (string, error) {
	if length <= 0 {
		return "", fmt.Errorf("token length must be positive")
	}
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate random bytes for token: %w", err)
	}
	return hex.EncodeToString(b), nil
}
