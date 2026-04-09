import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// TODO: Define Permission type based on API (should match PermissionAssignment)
interface Permission {
  id: string;
  name: string; // e.g., 'users:read', 'posts:write'
  description: string;
  // category?: string; // Optional category for grouping
}

// TODO: Fetch permissions from API/store
const mockPermissions: Permission[] = [
  { id: 'p1', name: 'users:read', description: 'View user list and details' },
  { id: 'p2', name: 'users:write', description: 'Create and update users' },
  { id: 'p3', name: 'users:delete', description: 'Delete users' },
  { id: 'p4', name: 'roles:read', description: 'View roles and permissions' },
  { id: 'p5', name: 'roles:write', description: 'Create and update roles' },
  { id: 'p6', name: 'settings:manage', description: 'Manage system settings' },
];

const PermissionTable: React.FC = () => {
  const handleEdit = (id: string) => {
    console.log('Edit permission:', id);
    // TODO: Navigate to edit page or open modal
  };

  const handleDelete = (id: string) => {
    console.log('Delete permission:', id);
    // TODO: Implement delete confirmation and API call
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="permission table">
        <TableHead>
          <TableRow>
            <TableCell>Name (Identifier)</TableCell>
            <TableCell>Description</TableCell>
            {/* <TableCell>Category</TableCell> */}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockPermissions.map((permission) => (
            <TableRow
              key={permission.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {permission.name}
              </TableCell>
              <TableCell>{permission.description}</TableCell>
              {/* <TableCell>{permission.category || 'N/A'}</TableCell> */}
              <TableCell align="right">
                <Tooltip title="Edit Permission">
                  <IconButton onClick={() => handleEdit(permission.id)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Permission">
                  <IconButton
                    onClick={() => handleDelete(permission.id)}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PermissionTable;
