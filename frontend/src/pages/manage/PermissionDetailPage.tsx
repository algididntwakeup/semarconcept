import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PermissionForm from '../../components/manage/permissions/PermissionForm'; // Placeholder for the form

// Define Permission type (should match PermissionTable)
interface Permission {
  id: string;
  name: string;
  description: string;
  // category?: string;
}

const PermissionDetailPage: React.FC = () => {
  const { permissionId } = useParams<{ permissionId: string }>();
  const navigate = useNavigate();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = permissionId !== 'new'; // Determine if creating or editing

  useEffect(() => {
    if (isEditMode && permissionId) {
      setLoading(true);
      setError(null);
      // TODO: Fetch permission data from API using permissionId
      console.log('Fetching permission data for ID:', permissionId);
      // Simulate API call
      setTimeout(() => {
        // Replace with actual API call result
        const fetchedPermission: Permission = {
          id: permissionId,
          name: `permission:${permissionId}`,
          description: `Description for permission ${permissionId}`,
        };
        setPermission(fetchedPermission);
        setLoading(false);
        // Handle fetch error:
        // setError('Failed to load permission data.');
        // setLoading(false);
      }, 1000);
    } else {
      // If 'new', initialize an empty permission
      setPermission(null);
      setLoading(false);
    }
  }, [permissionId, isEditMode]);

  const handleBack = () => {
    navigate('/manage/permissions'); // Navigate back to the permission list
  };

  // Placeholder form submission handler
  const handleSavePermission = async (formData: { name: string; description: string }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    console.log('Saving permission:', formData);
    // TODO: Implement actual API call (create or update)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Permission saved successfully (simulated)');
      setIsSubmitting(false);
      // navigate('/manage/permissions'); // Navigate back after successful save
    } catch (err) {
      console.error('Failed to save permission:', err);
      setSubmitError('Failed to save permission. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back to Permissions
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Permission' : 'Add New Permission'}
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
          <PermissionForm
            initialData={permission}
            onSubmit={handleSavePermission}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </Paper>
    </Container>
  );
};

export default PermissionDetailPage;
