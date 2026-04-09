// frontend-mui/src/pages/auth/ForgotPasswordPage.tsx

import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm'; // Assuming ForgotPasswordForm will be created here

const ForgotPasswordPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        <ForgotPasswordForm />
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;
