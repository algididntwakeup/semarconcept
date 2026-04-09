import React, { useEffect } from 'react';
import { Box, Button, Typography, Container, Paper, Grid } from '@mui/material';
import logger from '../utils/logger';

const TestLoggingPage: React.FC = () => {
  useEffect(() => {
    // Log page load
    logger.info('TestLoggingPage loaded', {
      timestamp: new Date().toISOString(),
      page: 'TestLoggingPage'
    });
    
    // Log some debug information
    logger.debug('Browser details', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    
    return () => {
      // Log page unload
      logger.info('TestLoggingPage unloaded', {
        timestamp: new Date().toISOString(),
        page: 'TestLoggingPage'
      });
    };
  }, []);
  
  // Test functions for different log levels
  const logInfo = () => {
    logger.info('User clicked Info button', {
      action: 'button_click',
      buttonType: 'info',
      timestamp: new Date().toISOString()
    });
  };
  
  const logWarning = () => {
    logger.warn('This is a warning message', {
      action: 'button_click',
      buttonType: 'warning',
      timestamp: new Date().toISOString()
    });
  };
  
  const logError = () => {
    logger.error('This is an error message', {
      action: 'button_click',
      buttonType: 'error',
      timestamp: new Date().toISOString()
    });
  };
  
  const logConsole = () => {
    console.log('This is a direct console.log message');
    console.error('This is a direct console.error message');
  };
  
  const causeError = () => {
    try {
      // Intentionally cause an error
      const obj: any = null;
      obj.nonExistentMethod();
    } catch (error) {
      logger.error('An error occurred', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Logging Test Page
        </Typography>
        
        <Typography paragraph>
          This page demonstrates the enhanced logging capabilities. 
          Click the buttons below to generate different types of logs.
          Check both the browser console and the server console to see the logs.
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={logInfo}
            >
              Log Info Message
            </Button>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button 
              variant="contained" 
              color="warning" 
              fullWidth
              onClick={logWarning}
            >
              Log Warning Message
            </Button>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth
              onClick={logError}
            >
              Log Error Message
            </Button>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={logConsole}
            >
              Direct Console Log
            </Button>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={causeError}
            >
              Cause Error
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography paragraph>
            1. Open your browser's developer console (F12 or Ctrl+Shift+I)
          </Typography>
          <Typography paragraph>
            2. Click the buttons above to generate different types of logs
          </Typography>
          <Typography paragraph>
            3. Check the server console to see the logs appearing there as well
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestLoggingPage;