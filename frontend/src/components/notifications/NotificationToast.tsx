import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Snackbar, 
  Alert, 
  AlertTitle, 
  Button, 
  IconButton, 
  Stack, 
  Typography,
  Box
} from '@mui/material';
import { 
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { 
  selectNotifications, 
  selectNotificationPreferences,
  NotificationType,
  Notification
} from '../../store/slices/notificationSlice';
import { RootState } from '../../store';

// Maximum number of toasts to show at once
const MAX_TOASTS = 3;

// Toast duration in milliseconds
const TOAST_DURATION = 6000;

/**
 * NotificationToast component
 * 
 * This component displays toast notifications for new notifications
 * that arrive via WebSocket or other means.
 */
const NotificationToast: React.FC = () => {
  // Get notifications and preferences from Redux store
  const notifications = useSelector((state: RootState) => 
    selectNotifications(state)
  );
  const preferences = useSelector((state: RootState) => 
    selectNotificationPreferences(state)
  );
  
  // Local state for active toasts
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  
  // Update active toasts when new notifications arrive
  useEffect(() => {
    if (!preferences.showToasts) {
      return;
    }
    
    // Get unread notifications that aren't already in activeToasts
    const newNotifications = notifications
      .filter(notification => !notification.read)
      .filter(notification => !activeToasts.some(toast => toast.id === notification.id))
      .slice(0, MAX_TOASTS - activeToasts.length);
    
    if (newNotifications.length > 0) {
      setActiveToasts(prev => [...prev, ...newNotifications].slice(-MAX_TOASTS));
      
      // Play sound if enabled
      if (preferences.soundEnabled) {
        playNotificationSound();
      }
    }
  }, [notifications, activeToasts, preferences]);
  
  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.play().catch(error => {
        console.error('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.error('Failed to create audio element:', error);
    }
  };
  
  // Handle closing a toast
  const handleClose = (notificationId: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== notificationId));
  };
  
  // Handle clicking the action button
  const handleAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    handleClose(notification.id);
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <SuccessIcon />;
      case NotificationType.WARNING:
        return <WarningIcon />;
      case NotificationType.ERROR:
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Get severity based on notification type
  const getSeverity = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.ERROR:
        return 'error';
      default:
        return 'info';
    }
  };
  
  // Render toasts
  return (
    <>
      {activeToasts.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={TOAST_DURATION}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ 
            top: `${(index * 80) + 24}px`,
            maxWidth: '400px'
          }}
        >
          <Alert
            severity={getSeverity(notification.type)}
            icon={getNotificationIcon(notification.type)}
            action={
              <Stack direction="row" spacing={1}>
                {notification.actionUrl && notification.actionLabel && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => handleAction(notification)}
                  >
                    {notification.actionLabel}
                  </Button>
                )}
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => handleClose(notification.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
            sx={{ width: '100%' }}
          >
            <AlertTitle>{notification.title}</AlertTitle>
            <Typography variant="body2">{notification.message}</Typography>
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                {notification.entityType && (
                  <Typography variant="caption" component="div">
                    {notification.entityType}: {notification.entityId}
                  </Typography>
                )}
              </Box>
            )}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationToast;