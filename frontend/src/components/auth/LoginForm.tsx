// platform/frontend-mui/src/components/auth/LoginForm.tsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { clearError } from '../../store/slices/authSlice';
import { login } from '../../store/slices/authThunks';
import logger from '../../utils/logger';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Log component mount
  useEffect(() => {
    logger.debug('LoginForm component mounted', {
      component: 'LoginForm',
    });

    return () => {
      logger.debug('LoginForm component unmounted', {
        component: 'LoginForm',
      });
    };
  }, []);

  // Navigate to home page after successful login
  useEffect(() => {
    if (isAuthenticated) {
      logger.info('User authenticated, navigating to home page', {
        component: 'LoginForm',
        action: 'navigation',
        destination: '/',
      });
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Log errors when they change
  useEffect(() => {
    if (error) {
      logger.error('Login error occurred', {
        component: 'LoginForm',
        error,
      });
    }
  }, [error]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    logger.logUserAction('login_attempt', {
      username,
      // Don't log the actual password for security reasons
      hasPassword: Boolean(password),
    });
    
    dispatch(clearError());
    dispatch(login({ username, password }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    logger.debug('Username field changed', {
      component: 'LoginForm',
      fieldLength: e.target.value.length,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    logger.debug('Password field changed', {
      component: 'LoginForm',
      fieldLength: e.target.value.length,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={handleUsernameChange}
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={handlePasswordChange}
        disabled={loading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </Box>
  );
};

export default LoginForm;
