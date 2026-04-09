// platform/backend/app/utils/encryption.go
package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"os" // To read encryption key from environment
)

// encryptionKey holds the key used for AES encryption.
// WARNING: Storing the key directly in code is insecure.
// It should be loaded securely, e.g., from environment variables or a secrets manager.
var encryptionKey []byte

func init() {
	// Load key from environment variable (recommended)
	keyString := os.Getenv("REKSOLINDO_ENCRYPTION_KEY")
	if keyString == "" {
		log.Println("WARNING: REKSOLINDO_ENCRYPTION_KEY environment variable not set. Using insecure default key for encryption.")
		// Use a default key ONLY for development/testing if no env var is set.
		// Ensure this default key is NEVER used in production.
		keyString = "a-very-secret-key-for-dev-32byte" // Must be 16, 24, or 32 bytes for AES
	}

	// Ensure the key has a valid length for AES (16, 24, or 32 bytes)
	keyBytes := []byte(keyString)
	keyLen := len(keyBytes)
	if keyLen != 16 && keyLen != 24 && keyLen != 32 {
		log.Fatalf("Invalid encryption key length: %d bytes. Must be 16, 24, or 32 bytes.", keyLen)
	}
	encryptionKey = keyBytes
}

// Encrypt encrypts plaintext using AES-GCM and returns base64 encoded ciphertext.
func Encrypt(plaintext string) (string, error) {
	if len(encryptionKey) == 0 {
		return "", errors.New("encryption key not initialized")
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		log.Printf("Error creating AES cipher: %v", err)
		return "", fmt.Errorf("failed to create cipher block: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		log.Printf("Error creating GCM: %v", err)
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		log.Printf("Error generating nonce: %v", err)
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	// Seal encrypts and authenticates plaintext, appends the result to nonce,
	// and returns the updated slice. The nonce is prepended to the ciphertext.
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts base64 encoded ciphertext using AES-GCM.
func Decrypt(ciphertextBase64 string) (string, error) {
	if len(encryptionKey) == 0 {
		return "", errors.New("encryption key not initialized")
	}

	ciphertext, err := base64.StdEncoding.DecodeString(ciphertextBase64)
	if err != nil {
		log.Printf("Error decoding base64 ciphertext: %v", err)
		return "", fmt.Errorf("failed to decode ciphertext: %w", err)
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		log.Printf("Error creating AES cipher for decryption: %v", err)
		return "", fmt.Errorf("failed to create cipher block: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		log.Printf("Error creating GCM for decryption: %v", err)
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		log.Println("Error decrypting: ciphertext too short")
		return "", errors.New("ciphertext too short")
	}

	nonce, encryptedMessage := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintextBytes, err := gcm.Open(nil, nonce, encryptedMessage, nil)
	if err != nil {
		// This often means the key is wrong or the ciphertext was tampered with.
		log.Printf("Error opening GCM (decryption failed): %v", err)
		return "", fmt.Errorf("failed to decrypt data: %w", err)
	}

	return string(plaintextBytes), nil
}
