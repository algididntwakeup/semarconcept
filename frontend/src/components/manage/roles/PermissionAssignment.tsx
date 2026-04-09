import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Divider,
} from '@mui/material';

// TODO: Define Permission type based on API
interface Permission {
  id: string;
  name: string; // e.g., 'users:read', 'posts:write'
  description: string;
}

// TODO: Fetch available permissions from API/store
const mockPermissions: Permission[] = [
  { id: 'p1', name: 'users:read', description: 'View user list and details' },
  { id: 'p2', name: 'users:write', description: 'Create and update users' },
  { id: 'p3', name: 'users:delete', description: 'Delete users' },
  { id: 'p4', name: 'roles:read', description: 'View roles and permissions' },
  { id: 'p5', name: 'roles:write', description: 'Create and update roles' },
  { id: 'p6', name: 'settings:manage', description: 'Manage system settings' },
];

interface PermissionAssignmentProps {
  assignedPermissionIds: string[]; // IDs of permissions currently assigned to the role
  onChange: (newPermissionIds: string[]) => void; // Callback when selection changes
}

const PermissionAssignment: React.FC<PermissionAssignmentProps> = ({
  assignedPermissionIds,
  onChange,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(assignedPermissionIds)
  );

  const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const permissionId = event.target.name;
    const isChecked = event.target.checked;
    const newSelectedPermissions = new Set(selectedPermissions);

    if (isChecked) {
      newSelectedPermissions.add(permissionId);
    } else {
      newSelectedPermissions.delete(permissionId);
    }

    setSelectedPermissions(newSelectedPermissions);
    onChange(Array.from(newSelectedPermissions)); // Notify parent component
  };

  // TODO: Group permissions by category/module if needed for better UI

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Assign Permissions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <FormGroup>
        {mockPermissions.map((permission) => (
          <FormControlLabel
            key={permission.id}
            control={
              <Checkbox
                checked={selectedPermissions.has(permission.id)}
                onChange={handlePermissionChange}
                name={permission.id}
              />
            }
            label={
              <Box>
                <Typography variant="body1">{permission.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {permission.description}
                </Typography>
              </Box>
            }
            sx={{ mb: 1 }}
          />
        ))}
      </FormGroup>
    </Paper>
  );
};

export default PermissionAssignment;
