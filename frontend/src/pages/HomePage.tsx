import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { clearAuth } from '../features/auth/authSlice';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Log component render
  React.useEffect(() => {
    logger.info('HomePage component rendered', {
      component: 'HomePage',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Proper logout logic using Redux
  const handleLogout = () => {
    logger.logUserAction('logout');
    dispatch(clearAuth());
    navigate('/auth/login');
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Home Page (Protected)
      </Typography>
      <Typography paragraph>Welcome to the application!</Typography>
      
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
