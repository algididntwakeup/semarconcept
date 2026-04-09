// platform/frontend-mui/src/components/NotificationProvider.tsx

import React, { ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { NotificationContext, useNotificationState } from '../hooks/useNotification';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
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