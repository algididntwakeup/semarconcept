import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material'; // Removed Typography
import { AppDispatch, RootState } from '../../store';
import { setLoading, setError } from '../../store/slices/authSlice'; // Using existing actions
import { useNavigate } from 'react-router-dom'; // To redirect after success

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setError(null));
    setFormError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    dispatch(setLoading(true));

    // Placeholder for actual API call
    console.log('Resetting password with token:', token);
    // Simulate API call
    setTimeout(() => {
      // TODO: Replace with actual API call using the token and new password
      // On success:
      setSuccessMessage('Your password has been successfully reset. Redirecting to login...');
      dispatch(setLoading(false));
      setTimeout(() => navigate('/login'), 3000); // Redirect after a delay
      // On error (e.g., invalid token, server error):
      // setFormError('Failed to reset password. The link may be invalid or expired.');
      // dispatch(setError('Failed to reset password.')); // Or use formError
      // dispatch(setLoading(false));
    }, 1500);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || formError}
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
        name="password"
        label="New Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading || !!successMessage}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading || !!successMessage}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading || !!successMessage}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>
    </Box>
  );
};

export default ResetPasswordForm;
