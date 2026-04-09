export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  // Add any other relevant fields for a category
}

// You can add other system configuration related types here later

export interface ConfigurationItemData {
  id: string;
  key: string;
  value: string; // This might be the actual value or a placeholder if encrypted
  categoryId: string;
  isEncrypted?: boolean;
  description?: string;
  valuePlaceholder?: string; // e.g., "********" or "Encrypted Value"
}