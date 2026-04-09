import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { AppDispatch, RootState } from '../../store'; // Assuming these are exported from store
import { setLoading, setError } from '../../store/slices/authSlice'; // Use existing actions

const RegisterForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { isLoading, error } = useSelector((state: RootState) => state.auth); // Use isLoading
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setError(null)); // Clear previous API errors using setError(null)
    setFormError(null); // Clear previous form errors

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    // Placeholder for actual registration logic
    console.log('Registering user:', { name, email }); // Log for now
    dispatch(setLoading(true));
    // Simulate API call delay and error/success
    setTimeout(() => {
      // TODO: Replace with actual API call and success/error handling (e.g., dispatch(loginSuccess(...)))
      dispatch(setError('Registration feature not fully implemented yet.'));
      // dispatch(setLoading(false)); // Should be set in the actual async thunk
    }, 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || formError}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isLoading} // Use isLoading
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading} // Use isLoading
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading} // Use isLoading
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading} // Use isLoading
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign Up'} {/* Use isLoading */}
      </Button>
      {/* Add link to Sign In page if needed */}
    </Box>
  );
};

export default RegisterForm;
