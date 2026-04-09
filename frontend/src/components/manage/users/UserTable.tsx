import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define a basic User type - replace with actual type from API/store later
interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Assuming role is a simple string for now
  status: 'active' | 'inactive' | 'pending'; // Example statuses
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  // Add handlers for edit/delete actions later
  // onEditUser: (userId: string) => void;
  // onDeleteUser: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  error /*, onEditUser, onDeleteUser */,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        Error loading users: {error}
      </Typography>
    );
  }

  if (!users || users.length === 0) {
    return <Typography sx={{ p: 3 }}>No users found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="user table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit User">
                  <IconButton
                    size="small"
                    // onClick={() => onEditUser(user.id)} // TODO: Implement
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete User">
                  <IconButton
                    size="small"
                    // onClick={() => onDeleteUser(user.id)} // TODO: Implement
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

export default UserTable;
