import React from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PermissionTable from '../../components/manage/permissions/PermissionTable'; // Assuming PermissionTable will be created here

const PermissionListPage: React.FC = () => {
  const handleAddPermission = () => {
    // TODO: Implement navigation or modal opening for adding a new permission
    console.log('Add new permission clicked');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Permission Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPermission}>
          Add Permission
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Manage system permissions that can be assigned to roles.
          </Typography>
        </Box>
        <Box>
          <PermissionTable />
        </Box>
      </Paper>
    </Container>
  );
};

export default PermissionListPage;
