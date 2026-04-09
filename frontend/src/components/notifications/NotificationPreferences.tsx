import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Switch,
  Typography
} from '@mui/material';
import {
  selectNotificationPreferences,
  updatePreferences
} from '../../store/slices/notificationSlice';
import { RootState } from '../../store';

interface NotificationPreferencesProps {
  open: boolean;
  onClose: () => void;
}

/**
 * NotificationPreferences component
 * 
 * This component displays a dialog for configuring notification preferences,
 * including toast notifications, desktop notifications, email notifications,
 * and sound settings.
 */
const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  open,
  onClose
}) => {
  const dispatch = useDispatch();
  
  // Get current preferences from Redux store
  const currentPreferences = useSelector((state: RootState) => 
    selectNotificationPreferences(state)
  );
  
  // Local state for form values
  const [preferences, setPreferences] = useState(currentPreferences);
  
  // Handle preference change
  const handlePreferenceChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [name]: event.target.checked
    });
  };
  
  // Handle save
  const handleSave = () => {
    dispatch(updatePreferences(preferences));
    onClose();
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset form values to current preferences
    setPreferences(currentPreferences);
    onClose();
  };
  
  // Handle test sound
  const handleTestSound = () => {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.play().catch(error => {
        console.error('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.error('Failed to create audio element:', error);
    }
  };
  
  // Request desktop notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    
    if (Notification.permission === 'granted') {
      // Already granted, show a test notification
      new Notification('Test Notification', {
        body: 'This is a test notification',
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification',
          icon: '/favicon.ico'
        });
      }
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Notification Preferences</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            In-App Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.showToasts}
                  onChange={handlePreferenceChange('showToasts')}
                />
              }
              label="Show toast notifications"
            />
            <FormHelperText>
              Display temporary notifications when new events occur
            </FormHelperText>
          </FormGroup>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Desktop Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.desktopNotifications}
                  onChange={handlePreferenceChange('desktopNotifications')}
                />
              }
              label="Enable desktop notifications"
            />
            <FormHelperText>
              Receive notifications even when the app is in the background
            </FormHelperText>
          </FormGroup>
          <Button
            variant="outlined"
            size="small"
            onClick={requestNotificationPermission}
            sx={{ mt: 1 }}
          >
            Test Desktop Notifications
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Email Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={handlePreferenceChange('emailNotifications')}
                />
              }
              label="Receive email notifications"
            />
            <FormHelperText>
              Get important notifications via email
            </FormHelperText>
          </FormGroup>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sound Settings
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.soundEnabled}
                  onChange={handlePreferenceChange('soundEnabled')}
                />
              }
              label="Play sound for new notifications"
            />
          </FormGroup>
          <Button
            variant="outlined"
            size="small"
            onClick={handleTestSound}
            disabled={!preferences.soundEnabled}
            sx={{ mt: 1 }}
          >
            Test Sound
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPreferences;