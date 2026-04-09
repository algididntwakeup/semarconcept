import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  LinearProgress,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  Refresh as RefreshIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { SECURITY } from '../../config';

interface SessionTimeoutDialogProps {
  /**
   * Function to refresh the user's session
   */
  onRefresh: () => Promise<void>;
  
  /**
   * Function to log the user out
   */
  onLogout: () => void;
  
  /**
   * Time in milliseconds before the session expires
   * Default is from config (30 minutes)
   */
  sessionTimeout?: number;
  
  /**
   * Time in milliseconds before showing the warning dialog
   * Default is from config (5 minutes before expiry)
   */
  warningTime?: number;
  
  /**
   * Whether the user is currently authenticated
   */
  isAuthenticated: boolean;
}

/**
 * SessionTimeoutDialog component
 * 
 * This component displays a dialog warning the user that their session is about to expire.
 * It provides options to refresh the session or log out.
 * The dialog automatically appears when the session is about to expire.
 */
const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  onRefresh,
  onLogout,
  sessionTimeout = SECURITY.SESSION_TIMEOUT,
  warningTime = SECURITY.SESSION_TIMEOUT_WARNING,
  isAuthenticated
}) => {
  // State for dialog visibility
  const [open, setOpen] = useState(false);
  
  // State for remaining time (in seconds)
  const [remainingTime, setRemainingTime] = useState(warningTime / 1000);
  
  // State for refresh in progress
  const [refreshing, setRefreshing] = useState(false);
  
  // Last activity timestamp
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Calculate progress percentage (0-100)
  const progressPercentage = (remainingTime / (warningTime / 1000)) * 100;
  
  // Format remaining time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle user activity
  const handleUserActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);
  
  // Handle session refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      setOpen(false);
      setLastActivity(Date.now());
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };
  
  // Check session status periodically
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
    // Check session status every second
    const checkSessionStatus = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastActivity;
      
      // If session is about to expire, show warning dialog
      if (elapsedTime >= sessionTimeout - warningTime && !open) {
        setOpen(true);
        setRemainingTime(warningTime / 1000);
      }
      
      // If session has expired, log out
      if (elapsedTime >= sessionTimeout) {
        handleLogout();
      }
    };
    
    const intervalId = setInterval(checkSessionStatus, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, lastActivity, open, sessionTimeout, warningTime, onLogout]);
  
  // Countdown timer for warning dialog
  useEffect(() => {
    if (!open) {
      return;
    }
    
    // Update remaining time every second
    const countdownInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval);
          handleLogout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(countdownInterval);
    };
  }, [open, handleLogout]);
  
  // Add event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
    // Events to track user activity
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      // Remove event listeners
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, handleUserActivity]);
  
  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing by clicking outside
        if (reason === 'backdropClick') {
          return;
        }
        setOpen(false);
      }}
      aria-labelledby="session-timeout-dialog-title"
      aria-describedby="session-timeout-dialog-description"
    >
      <DialogTitle id="session-timeout-dialog-title">
        <Box display="flex" alignItems="center">
          <ClockIcon color="warning" sx={{ mr: 1 }} />
          Session Timeout Warning
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="session-timeout-dialog-description">
          Your session is about to expire due to inactivity. You will be automatically logged out in:
        </DialogContentText>
        
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography variant="h4" align="center" color="warning.main">
            {formatTime(remainingTime)}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage} 
          color="warning"
          sx={{ height: 10, borderRadius: 5 }}
        />
        
        <Box sx={{ mt: 3 }}>
          <DialogContentText>
            Would you like to continue your session or log out?
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleLogout} 
          color="error"
          startIcon={<LogoutIcon />}
        >
          Log Out
        </Button>
        <Button 
          onClick={handleRefresh} 
          color="primary" 
          variant="contained"
          disabled={refreshing}
          startIcon={refreshing ? null : <RefreshIcon />}
        >
          {refreshing ? 'Refreshing...' : 'Continue Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;