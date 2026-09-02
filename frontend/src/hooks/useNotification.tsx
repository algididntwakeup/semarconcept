// platform/frontend-mui/src/hooks/useNotification.tsx

import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { Alert, Snackbar, AlertColor } from '@mui/material';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, autoHideDuration?: number) => void;
  hideNotification: () => void;
  notification: NotificationState;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotificationState = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 6000,
  });

  const showNotification = useCallback((
    message: string,
    severity: AlertColor = 'info',
    autoHideDuration = 6000
  ) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notificationState = useNotificationState();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
      <Snackbar
        open={notificationState.notification.open}
        autoHideDuration={notificationState.notification.autoHideDuration}
        onClose={notificationState.hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={notificationState.hideNotification}
          severity={notificationState.notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notificationState.notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};