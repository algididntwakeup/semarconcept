// platform/frontend-mui/src/layouts/AuthLayout.tsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { RootState } from '../store';

const AuthLayout: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        display: 'block',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;