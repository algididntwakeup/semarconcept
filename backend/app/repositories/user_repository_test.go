// platform/backend/app/repositories/user_repository_test.go

package repositories

import (
	"context"
	"database/sql"
	"errors"
	"regexp"
	"testing"
	"time"

	"backend/app/models"
	"backend/app/utils"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

// Helper function to setup mock DB and sqlx
func setupMockSQLX(t *testing.T) (*sqlx.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening a stub database connection", err)
	}

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	return sqlxDB, mock
}

func TestUserRepository_FindByUsername(t *testing.T) {
	sqlxDB, mock := setupMockSQLX(t)
	repo := NewUserRepository(sqlxDB)

	usernameToFind := "testuser"
	now := time.Now()
	expectedUser := &models.User{
		ID:           1,
		Username:     usernameToFind,
		Email:        "test@example.com",
		PasswordHash: "hashed_password",
		FirstName:    "Test",
		LastName:     "User",
		IsActive:     true,
		IsSuperuser:  false,
		IsAdmin:      false,
		TenantID:     1,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	columns := []string{
		"id", "username", "email", "password_hash", "first_name", "last_name", "full_name",
		"is_superuser", "is_admin", "is_active", "tenant_id", "department_id", "last_login",
		"created_at", "updated_at", "deleted_at", "created_by", "updated_by",
	}

	testCases := []struct {
		name          string
		username      string
		setupMock     func(mock sqlmock.Sqlmock)
		expectError   bool
		expectedError error
	}{
		{
			name:     "Found User",
			username: usernameToFind,
			setupMock: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows(columns).
					AddRow(
						expectedUser.ID, expectedUser.Username, expectedUser.Email, expectedUser.PasswordHash,
						expectedUser.FirstName, expectedUser.LastName, expectedUser.FullName,
						expectedUser.IsSuperuser, expectedUser.IsAdmin, expectedUser.IsActive, expectedUser.TenantID,
						nil, nil, expectedUser.CreatedAt, expectedUser.UpdatedAt, nil, nil, nil,
					)

				mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, username, email, password_hash`)).
					WithArgs(usernameToFind).
					WillReturnRows(rows)
			},
			expectError: false,
		},
		{
			name:     "User Not Found",
			username: "unknown",
			setupMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, username, email, password_hash`)).
					WithArgs("unknown").
					WillReturnError(sql.ErrNoRows)
			},
			expectError:   true,
			expectedError: utils.ErrUserNotFound,
		},
		{
			name:     "Database Error",
			username: usernameToFind,
			setupMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, username, email, password_hash`)).
					WithArgs(usernameToFind).
					WillReturnError(errors.New("db query error"))
			},
			expectError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			tc.setupMock(mock)

			ctx := context.Background()
			user, err := repo.FindByUsername(ctx, tc.username)

			if tc.expectError {
				assert.Error(t, err)
				assert.Nil(t, user)
				if tc.expectedError != nil {
					assert.ErrorIs(t, err, tc.expectedError)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, expectedUser.Username, user.Username)
				assert.Equal(t, expectedUser.Email, user.Email)
				assert.Equal(t, expectedUser.IsActive, user.IsActive)
			}
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

