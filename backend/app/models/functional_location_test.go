package models_test

import (
	"testing"

	"backend/app/models"
	"github.com/stretchr/testify/assert"
)

func TestFunctionalLocationValidate(t *testing.T) {
	cases := []struct {
		name    string
		floc    models.FunctionalLocation
		wantErr string
	}{
		{
			name:    "requires tenant",
			floc:    models.FunctionalLocation{Code: "L1-A", Level: 1},
			wantErr: "tenant ID is required",
		},
		{
			name:    "requires code",
			floc:    models.FunctionalLocation{TenantID: 1, Level: 1},
			wantErr: "functional location code is required",
		},
		{
			name:    "rejects level below range",
			floc:    models.FunctionalLocation{TenantID: 1, Code: "L0-A", Level: 0},
			wantErr: "level must be between 1 and 8",
		},
		{
			name:    "rejects level above range",
			floc:    models.FunctionalLocation{TenantID: 1, Code: "L9-A", Level: 9},
			wantErr: "level must be between 1 and 8",
		},
		{
			name: "accepts a root node at level 1",
			floc: models.FunctionalLocation{TenantID: 1, Code: "L1-A", Level: 1},
		},
		{
			name: "accepts a child node at the deepest level",
			floc: func() models.FunctionalLocation {
				parent := 7
				return models.FunctionalLocation{TenantID: 1, Code: "L8-A", Level: 8, ParentID: &parent}
			}(),
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.floc.Validate()
			if tc.wantErr == "" {
				assert.NoError(t, err)
				return
			}
			assert.ErrorContains(t, err, tc.wantErr)
		})
	}
}

func TestFunctionalLocationRejectsSelfParent(t *testing.T) {
	self := 5
	floc := models.FunctionalLocation{TenantID: 1, ID: 5, Code: "L1-A", Level: 1, ParentID: &self}
	assert.ErrorContains(t, floc.Validate(), "cannot be its own parent")
}

func TestIsValidEquipmentLifecycleAction(t *testing.T) {
	valid := []string{"Relocate", "Install", "Uninstall", "Repair", "Retire", "Condemn", "Send to repair"}
	for _, action := range valid {
		assert.True(t, models.IsValidEquipmentLifecycleAction(action), "expected %q to be valid", action)
	}
	for _, action := range []string{"", "Explode", "relocate", "Delete"} {
		assert.False(t, models.IsValidEquipmentLifecycleAction(action), "expected %q to be invalid", action)
	}
}

func TestEquipmentLifecycleLogValidate(t *testing.T) {
	oldValue := "FLOC-A"
	newValue := "FLOC-B"

	valid := models.EquipmentLifecycleLog{
		EquipmentID: 42,
		Action:      models.LifecycleActionRelocate,
		OldValue:    &oldValue,
		NewValue:    &newValue,
	}
	assert.NoError(t, valid.Validate())

	missingEquipment := models.EquipmentLifecycleLog{Action: models.LifecycleActionInstall}
	assert.ErrorContains(t, missingEquipment.Validate(), "equipment ID is required")

	badAction := models.EquipmentLifecycleLog{EquipmentID: 42, Action: "Explode"}
	assert.ErrorContains(t, badAction.Validate(), "invalid lifecycle action")
}

func TestNewModelTableNames(t *testing.T) {
	assert.Equal(t, "functional_locations", models.FunctionalLocation{}.TableName())
	assert.Equal(t, "equipment_lifecycle_logs", models.EquipmentLifecycleLog{}.TableName())
}
