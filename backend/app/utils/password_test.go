// platform/backend/app/utils/password_test.go
package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestHashPassword(t *testing.T) {
	password := "mysecretpassword"
	hash, err := HashPassword(password)

	assert.NoError(t, err, "Hashing password should not produce an error")
	assert.NotEmpty(t, hash, "Generated hash should not be empty")

	// Verify the hash is a valid bcrypt hash
	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	assert.NoError(t, err, "Generated hash should be verifiable with the original password")

	// Verify hashing the same password again yields a different hash (due to salt)
	hash2, err2 := HashPassword(password)
	assert.NoError(t, err2)
	assert.NotEqual(t, hash, hash2, "Hashing the same password twice should produce different hashes")
}

func TestCheckPasswordHash(t *testing.T) {
	password := "password123"
	correctHash, _ := HashPassword(password) // Assume HashPassword works correctly based on previous test
	wrongPassword := "wrongpassword"
	invalidHash := "not_a_valid_bcrypt_hash"

	testCases := []struct {
		name           string
		inputPassword  string
		inputHash      string
		expectedResult bool
	}{
		{
			name:           "Correct Password and Hash",
			inputPassword:  password,
			inputHash:      correctHash,
			expectedResult: true,
		},
		{
			name:           "Incorrect Password",
			inputPassword:  wrongPassword,
			inputHash:      correctHash,
			expectedResult: false,
		},
		{
			name:           "Correct Password, Invalid Hash",
			inputPassword:  password,
			inputHash:      invalidHash,
			expectedResult: false,
		},
		{
			name:           "Empty Password",
			inputPassword:  "",
			inputHash:      correctHash,
			expectedResult: false,
		},
		{
			name:           "Empty Hash",
			inputPassword:  password,
			inputHash:      "",
			expectedResult: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := CheckPasswordHash(tc.inputPassword, tc.inputHash)
			assert.Equal(t, tc.expectedResult, result)
		})
	}
}
