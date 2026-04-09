import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const ServerErrorPage: React.FC = () => {
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
      <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
      <Typography variant="h1" component="h1" gutterBottom>
        500
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Server Error
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        Sorry, something went wrong on our server. We are working to fix the problem.
        Please try again later.
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

export default ServerErrorPage;