// Defines the structure for a single field within a content type
export interface ContentTypeField {
  id: string; // Unique ID for the field
  name: string; // Display name (e.g., "Blog Title", "Product Price")
  apiKey: string; // Machine name (e.g., "title", "price")
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'media'
    | 'relation'
    | 'json'; // Supported field types
  isRequired?: boolean;
  isList?: boolean; // For array fields
  // Add other field-specific settings, e.g., for relations:
  // relatedContentTypeId?: string;
  // For text fields:
  // minLength?: number;
  // maxLength?: number;
}

// Defines the structure for a Content Type
export interface ContentTypeData {
  id: string; // Unique ID for the content type
  name: string; // Display name (e.g., "Blog Post", "Product")
  apiKey: string; // API identifier (e.g., "blog_posts", "products")
  description?: string;
  fields: ContentTypeField[];
  // Timestamps for tracking
  createdAt?: string;
  updatedAt?: string;
}

// For form data when creating/editing a content type (excluding generated fields like id, createdAt, updatedAt)
export type ContentTypeFormData = Omit<ContentTypeData, 'id' | 'createdAt' | 'updatedAt'>;

// For form data when creating/editing a field (excluding id)
export type ContentTypeFieldFormData = Omit<ContentTypeField, 'id'>;

// Defines the structure for a Content Entry
export interface ContentEntryData {
  id: string;
  contentTypeId: string; // ID of the ContentTypeData
  status: 'draft' | 'published' | 'archived' | 'scheduled'; // Added scheduled
  fields: { [apiKey: string]: unknown }; // Field values, keyed by field apiKey
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null; // For scheduled publishing
  // Potentially authorId, etc.
}

// For form data when creating/editing a content entry
// Typically, id, contentTypeId, status, createdAt, updatedAt, publishedAt are managed by the system or through specific actions
export type ContentEntryFormData = {
  fields: { [apiKey: string]: unknown };
  // status might be set separately through workflow actions
};