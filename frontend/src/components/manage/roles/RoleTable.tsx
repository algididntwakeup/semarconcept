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

// TODO: Define Role type based on API
interface Role {
  id: string;
  name: string;
  description: string;
  // permissionCount: number; // Example derived data
}

// TODO: Fetch roles from API/store
const mockRoles: Role[] = [
  { id: '1', name: 'Administrator', description: 'Full system access' },
  { id: '2', name: 'Editor', description: 'Can manage content' },
  { id: '3', name: 'Viewer', description: 'Read-only access' },
];

const RoleTable: React.FC = () => {
  const handleEdit = (id: string) => {
    console.log('Edit role:', id);
    // TODO: Navigate to edit page or open modal
  };

  const handleDelete = (id: string) => {
    console.log('Delete role:', id);
    // TODO: Implement delete confirmation and API call
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="role table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockRoles.map((role) => (
            <TableRow key={role.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {role.name}
              </TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit Role">
                  <IconButton onClick={() => handleEdit(role.id)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Role">
                  <IconButton onClick={() => handleDelete(role.id)} size="small" sx={{ ml: 1 }}>
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

export default RoleTable;
