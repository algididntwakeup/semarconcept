// platform/frontend-mui/src/store/slices/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Re-export types from middleware
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  entityType?: string;
  entityId?: string | number;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  desktopNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  notificationTypes: {
    [NotificationType.INFO]: boolean;
    [NotificationType.SUCCESS]: boolean;
    [NotificationType.WARNING]: boolean;
    [NotificationType.ERROR]: boolean;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    desktopNotifications: true,
    emailNotifications: true,
    soundEnabled: true,
    notificationTypes: {
      [NotificationType.INFO]: true,
      [NotificationType.SUCCESS]: true,
      [NotificationType.WARNING]: true,
      [NotificationType.ERROR]: true,
    },
  },
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      
      // Limit the number of stored notifications
      if (state.notifications.length > 100) {
        const removed = state.notifications.pop();
        if (removed && !removed.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    // Receive real-time notification
    receiveRealTime: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    
    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    // Clear all notifications
    clearAll: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    // Update preferences
    updatePreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Load notifications (for initial load)
    loadNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  addNotification,
  receiveRealTime: receiveRealTimeNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAll,
  updatePreferences,
  setLoading,
  setError,
  loadNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications;

export const selectUnreadCount = (state: { notifications: NotificationState }) => 
  state.notifications.unreadCount;

export const selectUnreadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter(n => !n.read);

export const selectNotificationPreferences = (state: { notifications: NotificationState }) => 
  state.notifications.preferences;

export const selectNotificationsByType = (state: { notifications: NotificationState }, type: NotificationType) => 
  state.notifications.notifications.filter(n => n.type === type);

export const selectRecentNotifications = (state: { notifications: NotificationState }, limit: number = 5) => 
  state.notifications.notifications.slice(0, limit);