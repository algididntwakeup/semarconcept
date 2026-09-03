import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material'; // Removed Typography
import { AppDispatch, RootState } from '../../store';
import { setLoading, setError } from '../../store/slices/authSlice'; // Using existing actions

const ForgotPasswordForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setError(null));
    setSuccessMessage(null);
    dispatch(setLoading(true));

    // Placeholder for actual API call
    console.log('Requesting password reset for:', email);
    // Simulate API call
    setTimeout(() => {
      // TODO: Replace with actual API call and success/error handling
      // On success:
      setSuccessMessage(
        'If an account exists for this email, a password reset link has been sent.'
      );
      dispatch(setLoading(false));
      // On error:
      // dispatch(setError('Failed to send reset link. Please try again.'));
      // dispatch(setLoading(false));
    }, 1500);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading || !!successMessage}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading || !!successMessage}
      >
        {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
      </Button>
      {/* Add link back to Login page if needed */}
    </Box>
  );
};

export default ForgotPasswordForm;
