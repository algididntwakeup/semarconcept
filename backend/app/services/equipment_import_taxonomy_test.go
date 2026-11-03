// platform/backend/app/services/equipment_import_taxonomy_test.go

package services_test

import (
	"testing"

	"backend/app/models"
	"backend/app/services"

	"github.com/stretchr/testify/assert"
)

// TestEquipmentTaxonomyResolverFallsBackToBuiltin proves an empty (or missing)
// tenant dictionary still resolves the legacy codes.
func TestEquipmentTaxonomyResolverFallsBackToBuiltin(t *testing.T) {
	resolver := services.NewEquipmentTaxonomyResolver(nil)
	assert.Equal(t, "Piping (PI)", resolver.ResolveClass("PI"))
	assert.Equal(t, "Piping (PI)", resolver.ResolveClass("pi"))
	assert.Equal(t, "Carbon Steel (Ca) (CA)", resolver.ResolveType("CA"))
	unmapped := resolver.UnmappedValues()
	assert.Empty(t, unmapped[models.EquipmentTaxonomyKindClass])
	assert.Empty(t, unmapped[models.EquipmentTaxonomyKindType])
}

// TestEquipmentTaxonomyResolverUsesTenantDictionary proves a tenant can define
// its own code and aliases, and that they win over the built-in dictionary.
func TestEquipmentTaxonomyResolverUsesTenantDictionary(t *testing.T) {
	values := []models.EquipmentTaxonomyValue{
		{
			Kind:          models.EquipmentTaxonomyKindClass,
			CanonicalCode: "PMP",
			CanonicalName: "Pumps",
			Aliases:       models.JSONBArray{"PUMP", "centrifugal pump"},
			IsActive:      true,
		},
		{
			Kind:          models.EquipmentTaxonomyKindType,
			CanonicalCode: "CS",
			CanonicalName: "Carbon Steel",
			Aliases:       models.JSONBArray{"CS-01", "carbon  steel"},
			IsActive:      true,
		},
	}
	resolver := services.NewEquipmentTaxonomyResolver(values)

	// Tenant alias and code both resolve to the tenant canonical label.
	assert.Equal(t, "Pumps (PMP)", resolver.ResolveClass("PUMP"))
	assert.Equal(t, "Pumps (PMP)", resolver.ResolveClass("pmp"))
	assert.Equal(t, "Pumps (PMP)", resolver.ResolveClass("Centrifugal Pump"))
	// Internal whitespace collapses, so "carbon  steel" == "carbon steel".
	assert.Equal(t, "Carbon Steel (CS)", resolver.ResolveType("carbon steel"))
	assert.Equal(t, "Carbon Steel (CS)", resolver.ResolveType("CS-01"))

	// A tenant code overrides the built-in meaning of the same code.
	assert.Equal(t, "Carbon Steel (CS)", resolver.ResolveType("CS"))

	// Built-in values still work when the tenant did not override them.
	assert.Equal(t, "Piping (PI)", resolver.ResolveClass("PI"))
}

// TestEquipmentTaxonomyResolverReportsUnmapped proves unknown values are kept
// verbatim and collected for the import report.
func TestEquipmentTaxonomyResolverReportsUnmapped(t *testing.T) {
	resolver := services.NewEquipmentTaxonomyResolver(nil)
	assert.Equal(t, "Mystery Class", resolver.ResolveClass("Mystery Class"))
	assert.Equal(t, "widget-9000", resolver.ResolveType("widget-9000"))

	unmapped := resolver.UnmappedValues()
	assert.Equal(t, []string{"Mystery Class"}, unmapped[models.EquipmentTaxonomyKindClass])
	assert.Equal(t, []string{"widget-9000"}, unmapped[models.EquipmentTaxonomyKindType])
}

// TestEquipmentTaxonomyResolverIgnoresInactiveEntries proves a disabled entry
// does not resolve.
func TestEquipmentTaxonomyResolverIgnoresInactiveEntries(t *testing.T) {
	values := []models.EquipmentTaxonomyValue{
		{
			Kind:          models.EquipmentTaxonomyKindClass,
			CanonicalCode: "ZZ",
			CanonicalName: "Zeta",
			Aliases:       models.JSONBArray{"ZZ"},
			IsActive:      false,
		},
	}
	resolver := services.NewEquipmentTaxonomyResolver(values)
	assert.Equal(t, "ZZ", resolver.ResolveClass("ZZ"))
	assert.Equal(t, []string{"ZZ"}, resolver.UnmappedValues()[models.EquipmentTaxonomyKindClass])
}
