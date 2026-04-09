export interface Role {
  id: string; // Assuming ID is a string, adjust if it's a number
  name: string;
  description?: string;
  permissionIds?: string[]; // Add array to hold associated permission IDs
}

// You might also want a Permission type if managing them separately
// export interface Permission {
//   id: string;
//   name: string;
//   description?: string;
// }
