// platform/frontend-mui/src/store/middleware/notificationMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { wsMessage } from '../slices/websocketSlice';

// Define notification types and priorities (since they're imported but not available)
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

// Define notification interface
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

// Mock notification slice actions (you'll need to create the actual slice)
export const receiveRealTimeNotification = (notification: Notification) => ({
  type: 'notifications/receiveRealTime',
  payload: notification
});

// Mock websocket subscribe action (you'll need to create this)
export const websocketSubscribe = (channel: string, scope: string) => ({
  type: 'websocket/subscribe',
  payload: { channel, scope }
});

// Notification middleware
// This middleware listens for WebSocket messages and processes notification-related messages
const notificationMiddleware: Middleware = store => next => action => {
  // Process WebSocket messages
  if (action.type === wsMessage.type) {
    const message = action.payload;
    
    // Check if this is a notification message
    if (
      message.type === 'notification' || 
      (message.type === 'update' && message.entity === 'notification')
    ) {
      // Process notification message
      processNotificationMessage(store, message);
    }
    
    // Check if this is a content update that should generate a notification
    if (message.type === 'update' && message.entity === 'content') {
      // Generate notification for content update
      generateContentUpdateNotification(store, message);
    }
    
    // Check if this is a workflow update that should generate a notification
    if (message.type === 'update' && message.entity === 'workflow') {
      // Generate notification for workflow update
      generateWorkflowUpdateNotification(store, message);
    }
  }
  
  // Subscribe to notifications when user logs in
  if (action.type === 'auth/login/fulfilled' || action.type === 'auth/refreshToken/fulfilled') {
    // Subscribe to notification updates
    store.dispatch(websocketSubscribe('notification', 'all'));
  }
  
  return next(action);
};

// Process a notification message from the WebSocket
const processNotificationMessage = (store: any, message: any) => {
  // Extract notification data
  const notificationData = message.data || {};
  
  // Create notification object
  const notification: Notification = {
    id: notificationData.id || uuidv4(),
    title: notificationData.title || 'New Notification',
    message: notificationData.message || '',
    type: mapNotificationType(notificationData.type),
    priority: mapNotificationPriority(notificationData.priority),
    read: false,
    createdAt: notificationData.timestamp || new Date().toISOString(),
    expiresAt: notificationData.expiresAt,
    actionUrl: notificationData.actionUrl,
    actionLabel: notificationData.actionLabel,
    entityType: notificationData.entityType || message.entity,
    entityId: notificationData.entityId || message.id,
    metadata: notificationData.metadata || {},
  };
  
  // Dispatch action to add notification
  store.dispatch(receiveRealTimeNotification(notification));
  
  // Show browser notification if enabled
  showBrowserNotification(store, notification);
};

// Generate a notification for content updates
const generateContentUpdateNotification = (store: any, message: any) => {
  const contentData = message.data || {};
  const contentId = message.id;
  const contentType = contentData.type || 'content';
  const contentTitle = contentData.title || `Content #${contentId}`;
  const action = contentData.action || 'updated';
  
  // Create notification object
  const notification: Notification = {
    id: uuidv4(),
    title: 'Content Update',
    message: `${contentTitle} has been ${action}`,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: `/content/${contentType}/${contentId}`,
    actionLabel: 'View Content',
    entityType: 'content',
    entityId: contentId,
    metadata: {
      contentType,
      action,
    },
  };
  
  // Dispatch action to add notification
  store.dispatch(receiveRealTimeNotification(notification));
  
  // Show browser notification if enabled
  showBrowserNotification(store, notification);
};

// Generate a notification for workflow updates
const generateWorkflowUpdateNotification = (store: any, message: any) => {
  const workflowData = message.data || {};
  const workflowId = message.id;
  const contentId = workflowData.contentId;
  const contentType = workflowData.contentType || 'content';
  const contentTitle = workflowData.contentTitle || `Content #${contentId}`;
  const fromState = workflowData.fromState || 'previous state';
  const toState = workflowData.toState || 'new state';
  const assignee = workflowData.assignee;
  
  // Create notification message
  let notificationMessage = `${contentTitle} moved from ${fromState} to ${toState}`;
  if (assignee) {
    notificationMessage += ` and assigned to ${assignee}`;
  }
  
  // Create notification object
  const notification: Notification = {
    id: uuidv4(),
    title: 'Workflow Update',
    message: notificationMessage,
    type: NotificationType.INFO,
    priority: NotificationPriority.HIGH,
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: `/content/${contentType}/${contentId}`,
    actionLabel: 'View Content',
    entityType: 'workflow',
    entityId: workflowId,
    metadata: {
      contentId,
      contentType,
      fromState,
      toState,
      assignee,
    },
  };
  
  // Dispatch action to add notification
  store.dispatch(receiveRealTimeNotification(notification));
  
  // Show browser notification if enabled
  showBrowserNotification(store, notification);
};

// Show browser notification if enabled
const showBrowserNotification = (store: any, notification: Notification) => {
  const state = store.getState();
  
  // Check if we have notification preferences, if not, default to enabled
  const preferences = state.notifications?.preferences || { desktopNotifications: true };
  
  // Check if desktop notifications are enabled
  if (preferences.desktopNotifications && 'Notification' in window) {
    // Check permission
    if (Notification.permission === 'granted') {
      // Create browser notification
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        }
      });
    }
  }
};

// Map notification type from server to client enum
const mapNotificationType = (type: string): NotificationType => {
  switch (type?.toLowerCase()) {
    case 'success':
      return NotificationType.SUCCESS;
    case 'warning':
      return NotificationType.WARNING;
    case 'error':
      return NotificationType.ERROR;
    default:
      return NotificationType.INFO;
  }
};

// Map notification priority from server to client enum
const mapNotificationPriority = (priority: string): NotificationPriority => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return NotificationPriority.HIGH;
    case 'low':
      return NotificationPriority.LOW;
    default:
      return NotificationPriority.MEDIUM;
  }
};

export default notificationMiddleware;