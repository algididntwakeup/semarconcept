// frontend-mui/src/pages/auth/RegistrationPage.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import RegistrationForm from '../../components/auth/RegistrationForm'; // Import the form
import { Link } from 'react-router-dom'; // For linking back to login

const RegistrationPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      {' '}
      {/* Center content */}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <RegistrationForm /> {/* Use the RegistrationForm component */}
        <Box mt={2}>
          <Link to="/login">Already have an account? Sign in</Link>
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrationPage;
