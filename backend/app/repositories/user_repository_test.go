// platform/backend/app/repositories/user_repository_test.go

package repositories

import (
	"backend/app/models"
	"context"
	"database/sql/driver"
	"errors"
	"regexp" // Required for sqlmock query matching
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Helper function to setup mock DB and GORM
func setupMockDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening a stub database connection", err)
	}

	// Use silent logger for tests
	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening gorm database", err)
	}

	return gormDB, mock
}

// AnyTime argument matcher for sqlmock
type AnyTime struct{}

// Match satisfies sqlmock.Argument interface
func (a AnyTime) Match(v driver.Value) bool {
	_, ok := v.(time.Time)
	return ok
}

func TestUserRepository_GetByUsername(t *testing.T) {
	gormDB, mock := setupMockDB(t)
	repo := NewGormUserRepository(gormDB)

	usernameToFind := "testuser"
	expectedUser := &models.User{
		ID:           1,
		Username:     usernameToFind,
		Email:        "test@example.com",
		PasswordHash: "hashed_password",
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		Roles:        []*models.Role{{ID: 1, Name: "User"}}, // Example role
	}

	testCases := []struct {
		name          string
		username      string
		setupMock     func(mock sqlmock.Sqlmock)
		expectError   bool
		expectedError string
	}{
		{
			name:     "Found User",
			username: usernameToFind,
			setupMock: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows([]string{"id", "username", "email", "password_hash", "is_active", "is_superuser", "last_login", "created_at", "updated_at"}).
					AddRow(expectedUser.ID, expectedUser.Username, expectedUser.Email, expectedUser.PasswordHash, expectedUser.IsActive, expectedUser.IsAdmin, expectedUser.LastLogin, expectedUser.CreatedAt, expectedUser.UpdatedAt)

				// Expect the main query for the user
				mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE username = $1 ORDER BY "users"."id" LIMIT 1`)).
					WithArgs(usernameToFind).
					WillReturnRows(rows)

				// Expect the preload query for roles
				roleRows := sqlmock.NewRows([]string{"id", "name"}).AddRow(expectedUser.Roles[0].ID, expectedUser.Roles[0].Name)
				mock.ExpectQuery(regexp.QuoteMeta(`SELECT "roles".* FROM "roles" JOIN "user_roles" ON "user_roles"."role_id" = "roles"."id" WHERE "user_roles"."user_id" = $1`)).
					WithArgs(expectedUser.ID).
					WillReturnRows(roleRows)
			},
			expectError: false,
		},
		{
			name:     "User Not Found",
			username: "unknown",
			setupMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE username = $1 ORDER BY "users"."id" LIMIT 1`)).
					WithArgs("unknown").
					WillReturnError(gorm.ErrRecordNotFound)
			},
			expectError:   true,
			expectedError: "user not found",
		},
		{
			name:     "Database Error",
			username: usernameToFind,
			setupMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE username = $1 ORDER BY "users"."id" LIMIT 1`)).
					WithArgs(usernameToFind).
					WillReturnError(errors.New("db query error"))
			},
			expectError:   true,
			expectedError: "db query error", // Expect the underlying DB error message
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			tc.setupMock(mock) // Pass mock to setup function

			ctx := context.Background()
			user, err := repo.GetByUsername(ctx, tc.username)

			// Assertions
			if tc.expectError {
				assert.Error(t, err)
				assert.Nil(t, user)
				if tc.expectedError != "" {
					assert.Contains(t, err.Error(), tc.expectedError)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, expectedUser.Username, user.Username)
				assert.Equal(t, expectedUser.Email, user.Email)
				assert.Equal(t, expectedUser.IsActive, user.IsActive)
				assert.NotNil(t, user.Roles) // Check roles were preloaded
				assert.Len(t, user.Roles, 1)
				if len(user.Roles) > 0 {
					assert.Equal(t, expectedUser.Roles[0].Name, user.Roles[0].Name)
				}
			}
			// Ensure all expectations were met
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

// TODO: Add test functions for other UserRepository methods
// (e.g., GetByID, GetByEmail, Create, Update, Delete, List, UpdateLastLogin)
