// frontend-mui/src/pages/auth/ResetPasswordPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper } from '@mui/material';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm'; // Assuming ResetPasswordForm will be created here

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Get the reset token from the URL

  if (!token) {
    // Handle case where token is missing, maybe redirect or show an error
    return (
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ mt: 8, p: 4, textAlign: 'center' }}>
          <Typography color="error">Invalid or missing password reset token.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Reset Password
        </Typography>
        <ResetPasswordForm token={token} />
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
