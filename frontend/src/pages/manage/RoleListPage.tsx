import React from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
// import Grid from '@mui/material/Grid'; // Removed Grid import
import { Add as AddIcon } from '@mui/icons-material';
// import MainCard from 'components/ui/MainCard'; // Removed incorrect import
import RoleTable from '../../components/manage/roles/RoleTable'; // Corrected import path

const RoleListPage: React.FC = () => {
  const handleAddRole = () => {
    // TODO: Implement navigation or modal opening for adding a new role
    console.log('Add new role clicked');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Role Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRole}>
          Add Role
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        {/* Replaced Grid with Box/Flexbox */}
        <Box sx={{ mb: 2 }}>
          {' '}
          {/* Equivalent to the first Grid item */}
          <Typography variant="body1" gutterBottom>
            Manage user roles and their associated permissions.
          </Typography>
        </Box>
        <Box>
          {' '}
          {/* Equivalent to the second Grid item */}
          <RoleTable />
        </Box>
      </Paper>
    </Container>
  );
};

export default RoleListPage;
