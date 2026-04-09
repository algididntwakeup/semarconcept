import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RoleForm from '../../components/manage/roles/RoleForm'; // Import RoleForm
import PermissionAssignment from '../../components/manage/roles/PermissionAssignment'; // Import PermissionAssignment

// Define a basic Role type - replace with actual type from API/store later
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Example
}

const RoleDetailPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null); // Keep role data state
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]); // State for assigned permissions
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Form submission state
  const [submitError, setSubmitError] = useState<string | null>(null); // Form submission error state

  const isEditMode = roleId !== 'new'; // Determine if creating or editing

  useEffect(() => {
    if (isEditMode && roleId) {
      setLoading(true);
      setError(null);
      // TODO: Fetch role data from API using roleId
      console.log('Fetching role data for ID:', roleId);
      // Simulate API call
      setTimeout(() => {
        // Replace with actual API call result
        const fetchedRole: Role = {
          id: roleId,
          name: `Role ${roleId}`,
          description: `Description for role ${roleId}`,
          permissions: ['p1', 'p4'], // Example using mock IDs
        };
        setRole(fetchedRole);
        setAssignedPermissions(fetchedRole.permissions); // Initialize assigned permissions from fetched data
        setLoading(false);
        // Handle fetch error:
        // setError('Failed to load role data.');
        // setLoading(false);
      }, 1000);
    } else {
      // If 'new', initialize an empty role and empty permissions
      setRole(null); // Or set default role structure
      setAssignedPermissions([]); // Start with no permissions for a new role
      setLoading(false);
    }
  }, [roleId, isEditMode]);

  const handleBack = () => {
    navigate('/manage/roles'); // Navigate back to the role list
  };

  // Placeholder form submission handler
  const handleSaveRole = async (formData: { name: string; description: string }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    console.log('Saving role:', { ...formData, permissions: assignedPermissions });
    // TODO: Implement actual API call (create or update)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // On success:
      // navigate('/manage/roles'); // Navigate back after successful save
      console.log('Role saved successfully (simulated)');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to save role:', err);
      setSubmitError('Failed to save role. Please try again.'); // Set error message
      setIsSubmitting(false);
    }
  };

  const handlePermissionsChange = (newPermissionIds: string[]) => {
    setAssignedPermissions(newPermissionIds);
    // TODO: Potentially update role state or prepare for saving
    console.log('Permissions changed:', newPermissionIds);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back to Roles
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Role' : 'Add New Role'}
        </Typography>
      </Box>
      <Paper sx={{ p: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <>
            {/* Render RoleForm */}
            <RoleForm
              initialData={role}
              onSubmit={handleSaveRole}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
            <Divider sx={{ my: 3 }} />
            {/* Render Permission Assignment */}
            <PermissionAssignment
              assignedPermissionIds={assignedPermissions}
              onChange={handlePermissionsChange}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default RoleDetailPage;
