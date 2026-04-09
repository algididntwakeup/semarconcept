import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import UserForm from '../../components/manage/users/UserForm'; // Placeholder for the form
// import Breadcrumbs from '../../components/layout/Breadcrumbs'; // Optional

// Define a basic User type - replace with actual type from API/store later
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // Add other fields as needed
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = userId !== 'new'; // Determine if creating or editing

  useEffect(() => {
    if (isEditMode && userId) {
      setLoading(true);
      setError(null);
      // TODO: Fetch user data from API using userId
      console.log('Fetching user data for ID:', userId);
      // Simulate API call
      setTimeout(() => {
        // Replace with actual API call result
        const fetchedUser: User = {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          role: 'Member',
        };
        setUser(fetchedUser);
        setLoading(false);
        // Handle fetch error:
        // setError('Failed to load user data.');
        // setLoading(false);
      }, 1000);
    } else {
      // If 'new', initialize an empty user or default values for the form
      setUser(null); // Or set default user structure
      setLoading(false);
    }
  }, [userId, isEditMode]);

  const handleBack = () => {
    navigate('/manage/users'); // Navigate back to the user list
  };

  // TODO: Implement form submission handler (onSaveUser)

  return (
    <Container maxWidth="md">
      {/* <Breadcrumbs /> */} {/* Optional */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back to Users
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit User' : 'Add New User'}
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
            {/* <UserForm initialData={user} onSubmit={onSaveUser} /> */} {/* Placeholder */}
            <Typography>User Form Placeholder (User ID: {userId})</Typography> {/* Temporary */}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default UserDetailPage;
