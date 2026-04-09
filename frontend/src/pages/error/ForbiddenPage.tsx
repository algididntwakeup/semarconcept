import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const ForbiddenPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: 5
      }}
    >
      <BlockIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
      <Typography variant="h1" component="h1" gutterBottom>
        403
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Access Forbidden
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        You do not have permission to access this page or resource.
        Please contact your administrator if you believe this is an error.
      </Typography>
      <Button
        component={RouterLink}
        to="/dashboard"
        variant="contained"
        color="primary"
        size="large"
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default ForbiddenPage;