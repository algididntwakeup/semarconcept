// platform/backend/app/database/iso14224_seeder.go
package database

import (
	"backend/app/models"
	"log"
)

// SeedISO14224Taxonomy seeds initial ISO 14224 taxonomy categories and attributes
func (s *Seeder) SeedISO14224Taxonomy() error {
	log.Println("Seeding ISO 14224 Taxonomy...")

	// Default tenant for seeding
	tenantID := 1
	var defaultTenant models.Tenant
	if err := s.DB.First(&defaultTenant, tenantID).Error; err != nil {
		log.Println("Default tenant not found, skipping taxonomy seeding")
		return nil
	}

	// Define hierarchy
	type node struct {
		Name       string
		Code       string
		Level      int
		Attributes []models.TaxonomyAttribute
		Children   []node
	}

	// Helper function for string pointers
	strPtr := func(s string) *string { return &s }

	hierarchy := []node{
		{
			Name:  "Industry",
			Code:  "L1-IND",
			Level: 1,
			Children: []node{
				{
					Name:  "Petroleum",
					Code:  "L2-PET",
					Level: 2,
					Children: []node{
						{
							Name:  "Offshore Platform",
							Code:  "L3-OFF",
							Level: 3,
							Children: []node{
								{
									Name:  "Compression Plant",
									Code:  "L4-CMP",
									Level: 4,
									Children: []node{
										{
											Name:  "Gas Compression System",
											Code:  "L5-GCS",
											Level: 5,
											Children: []node{
												{
													Name:  "Compressors",
													Code:  "L6-CMPR",
													Level: 6,
													Attributes: []models.TaxonomyAttribute{
														{AttributeName: "Design Pressure", AttributeKey: "design_pressure", DataType: "number", UnitOfMeasure: "bar", IsRequired: true, DefaultValue: strPtr("0")},
														{AttributeName: "Flow Rate", AttributeKey: "flow_rate", DataType: "number", UnitOfMeasure: "m3/h", IsRequired: true, DefaultValue: strPtr("0")},
														{AttributeName: "Power", AttributeKey: "power", DataType: "number", UnitOfMeasure: "kW", IsRequired: true, DefaultValue: strPtr("0")},
														{AttributeName: "Type", AttributeKey: "type", DataType: "string", IsRequired: false},
													},
													Children: []node{
														{
															Name:  "Centrifugal Compressor",
															Code:  "L7-C-CMPR",
															Level: 7,
															Children: []node{
																{
																	Name:  "Lube Oil System",
																	Code:  "L8-LOS",
																	Level: 8,
																	Children: []node{
																		{
																			Name:  "Oil Pump",
																			Code:  "L9-OP",
																			Level: 9,
																		},
																	},
																},
															},
														},
													},
												},
												{
													Name:  "Pumps",
													Code:  "L6-PUMP",
													Level: 6,
													Attributes: []models.TaxonomyAttribute{
														{AttributeName: "Head", AttributeKey: "head", DataType: "number", UnitOfMeasure: "m", IsRequired: true, DefaultValue: strPtr("0")},
														{AttributeName: "Flow Rate", AttributeKey: "flow_rate", DataType: "number", UnitOfMeasure: "m3/h", IsRequired: true, DefaultValue: strPtr("0")},
														{AttributeName: "Power", AttributeKey: "power", DataType: "number", UnitOfMeasure: "kW", IsRequired: true, DefaultValue: strPtr("0")},
													},
													Children: []node{
														{
															Name:  "Centrifugal Pump",
															Code:  "L7-C-PUMP",
															Level: 7,
															Children: []node{
																{
																	Name:  "Power Transmission",
																	Code:  "L8-PT",
																	Level: 8,
																	Children: []node{
																		{
																			Name:  "Coupling",
																			Code:  "L9-CPL",
																			Level: 9,
																		},
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	var processNode func(n node, parentID *int) error
	processNode = func(n node, parentID *int) error {
		cat := models.TaxonomyCategory{
			TenantID: tenantID,
			Name:     n.Name,
			Code:     n.Code,
			Level:    n.Level,
			ParentID: parentID,
		}

		// Check if exists
		var existing models.TaxonomyCategory
		err := s.DB.Where("tenant_id = ? AND code = ?", tenantID, n.Code).First(&existing).Error
		if err != nil {
			// Create
			if err := s.DB.Create(&cat).Error; err != nil {
				return err
			}
			existing = cat
			log.Printf("Created Category: %s (L%d)\n", n.Name, n.Level)
		} else {
			// Optionally update
		}

		// Seed attributes
		for _, attr := range n.Attributes {
			attr.TenantID = tenantID
			attr.CategoryID = existing.ID
			var existAttr models.TaxonomyAttribute
			err := s.DB.Where("tenant_id = ? AND category_id = ? AND attribute_name = ?", tenantID, existing.ID, attr.AttributeName).First(&existAttr).Error
			if err != nil {
				if err := s.DB.Create(&attr).Error; err != nil {
					return err
				}
				log.Printf("Created Attribute: %s for %s\n", attr.AttributeName, existing.Name)
			}
		}

		// Process children
		for _, child := range n.Children {
			if err := processNode(child, &existing.ID); err != nil {
				return err
			}
		}
		return nil
	}

	for _, root := range hierarchy {
		if err := processNode(root, nil); err != nil {
			log.Printf("Error seeding ISO 14224 taxonomy tree %s: %v\n", root.Name, err)
			return err
		}
	}

	log.Println("ISO 14224 Taxonomy Seeding Completed.")
	return nil
}
