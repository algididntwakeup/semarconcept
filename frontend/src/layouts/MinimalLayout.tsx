import React, { ReactNode } from 'react';
import { Box, CssBaseline, Container } from '@mui/material';

interface MinimalLayoutProps {
  children: ReactNode;
}

const MinimalLayout: React.FC<MinimalLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        {children}
      </Container>
      {/* Add a minimal footer here if needed */}
    </Box>
  );
};

export default MinimalLayout;
