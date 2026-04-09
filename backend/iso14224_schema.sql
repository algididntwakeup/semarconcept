-- Database schema migration for ISO 14224 Asset Management

-- Create taxonomy_categories table
CREATE TABLE IF NOT EXISTS taxonomy_categories (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES taxonomy_categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_taxonomy_categories_tenant_id ON taxonomy_categories(tenant_id);
CREATE INDEX idx_taxonomy_categories_parent_id ON taxonomy_categories(parent_id);
CREATE INDEX idx_taxonomy_categories_code ON taxonomy_categories(code);

-- Create taxonomy_attributes table
CREATE TABLE IF NOT EXISTS taxonomy_attributes (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES taxonomy_categories(id) ON DELETE CASCADE,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_key VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL DEFAULT 'string',
    is_required BOOLEAN DEFAULT false,
    unit_of_measure VARCHAR(50),
    default_value VARCHAR(255),
    options JSONB,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_taxonomy_attributes_tenant_id ON taxonomy_attributes(tenant_id);
CREATE INDEX idx_taxonomy_attributes_category_id ON taxonomy_attributes(category_id);
CREATE INDEX idx_taxonomy_attributes_key ON taxonomy_attributes(attribute_key);

-- Add taxonomy_category_id to equipment table
ALTER TABLE equipment ADD COLUMN taxonomy_category_id INTEGER REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
CREATE INDEX idx_equipment_taxonomy_category_id ON equipment(taxonomy_category_id);
