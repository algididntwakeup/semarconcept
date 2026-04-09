import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import logger from '../utils/logger';

const HomePage: React.FC = () => {
  // Log component render
  React.useEffect(() => {
    logger.info('HomePage component rendered', {
      component: 'HomePage',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Placeholder logout logic with logging
  const handleLogout = () => {
    logger.logUserAction('logout');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Home Page (Protected)
      </Typography>
      <Typography paragraph>Welcome to the application!</Typography>
      
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          component={Link}
          to="/logging-example"
          variant="contained"
          color="primary"
          onClick={() => logger.logUserAction('navigate_to_logging_example')}
          sx={{ mb: 2 }}
        >
          View Logging Examples
        </Button>
        
        <Button
          component={Link}
          to="/test-logging"
          variant="contained"
          color="secondary"
          onClick={() => logger.logUserAction('navigate_to_test_logging')}
          sx={{ mb: 2 }}
        >
          Test Logging (Server Console)
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{ mb: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
