export interface Permission {
  id: string; // Assuming ID is a string
  name: string; // e.g., 'users:create', 'content:edit'
  description?: string;
  group?: string; // Optional grouping for display (e.g., 'User Management', 'Content')
}
