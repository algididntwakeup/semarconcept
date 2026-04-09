import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  Paper, 
  Typography 
} from '@mui/material';
import logger from '../../utils/logger';
import { useGet } from '../../hooks/useApi';

/**
 * Example component demonstrating enhanced logging capabilities
 */
export default function LoggingExample() {
  const [count, setCount] = useState(0);
  
  // Example API call with logging
  const { 
    data: healthData, 
    loading: healthLoading, 
    error: healthError, 
    execute: checkHealth 
  } = useGet<{ status: string; database: string }>('/api/v1/health');

  // Log component mount with performance measurement
  useEffect(() => {
    const endMeasure = logger.measure('LoggingExample Component Mount');
    
    logger.info('LoggingExample component mounted', {
      componentName: 'LoggingExample',
      timestamp: new Date().toISOString(),
    });
    
    // Simulate some initialization work
    setTimeout(() => {
      endMeasure();
    }, 100);
    
    // Log component unmount
    return () => {
      logger.info('LoggingExample component unmounted', {
        componentName: 'LoggingExample',
        mountDuration: Date.now() - performance.now(),
      });
    };
  }, []);
  
  // Log state changes
  useEffect(() => {
    if (count > 0) {
      logger.debug('Count state changed', { 
        previousCount: count - 1, 
        newCount: count 
      });
    }
  }, [count]);
  
  // Example handlers with logging
  const handleIncrement = () => {
    logger.logUserAction('increment_counter', { previousValue: count });
    setCount(prev => prev + 1);
  };
  
  const handleReset = () => {
    logger.logUserAction('reset_counter', { previousValue: count });
    setCount(0);
  };
  
  const handleCheckHealth = () => {
    logger.logUserAction('check_health');
    checkHealth();
  };
  
  const handleLogLevels = () => {
    logger.debug('This is a debug message', { level: 'debug' });
    logger.info('This is an info message', { level: 'info' });
    logger.warn('This is a warning message', { level: 'warn' });
    logger.error('This is an error message', { level: 'error' });
  };
  
  const handleSimulateError = () => {
    logger.logUserAction('simulate_error');
    try {
      // Deliberately cause an error
      const obj = null;
      // @ts-ignore - Intentional error for demonstration
      const result = obj.nonExistentMethod();
      console.log(result);
    } catch (error) {
      logger.error('Simulated error occurred', { 
        error,
        location: 'handleSimulateError',
      });
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Logging Examples
      </Typography>
      
      <Grid container spacing={3}>
        {/* Counter Example */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="State Change Logging" />
            <Divider />
            <CardContent>
              <Typography variant="body1" paragraph>
                Current count: {count}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleIncrement}>
                  Increment (Logged)
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Reset (Logged)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* API Call Example */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="API Call Logging" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={handleCheckHealth}
                  disabled={healthLoading}
                >
                  {healthLoading ? 'Checking...' : 'Check API Health (Logged)'}
                </Button>
              </Box>
              
              {healthData && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="body1">
                    Status: {healthData.status}
                  </Typography>
                  <Typography variant="body1">
                    Database: {healthData.database}
                  </Typography>
                </Paper>
              )}
              
              {healthError && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'error.light' }}>
                  <Typography variant="body1" color="error">
                    Error: {healthError.message}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Log Levels Example */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Log Levels" />
            <Divider />
            <CardContent>
              <Typography variant="body1" paragraph>
                Click the button to log messages at different levels.
                Check the browser console to see the formatted logs.
              </Typography>
              <Button variant="contained" onClick={handleLogLevels}>
                Log at All Levels
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Error Logging Example */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Error Logging" />
            <Divider />
            <CardContent>
              <Typography variant="body1" paragraph>
                Click to simulate an error that will be caught and logged.
              </Typography>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleSimulateError}
              >
                Simulate Error (Logged)
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Typography variant="body1">
          1. Open the browser console to see the formatted logs
        </Typography>
        <Typography variant="body1">
          2. Try the different buttons above to see various logging scenarios
        </Typography>
        <Typography variant="body1">
          3. Notice how user actions, API calls, and errors are all logged with context
        </Typography>
      </Box>
    </Box>
  );
}