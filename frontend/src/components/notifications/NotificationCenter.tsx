import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as MarkReadIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  selectNotifications,
  selectUnreadCount,
  markNotificationAsRead,
  removeNotification,
  markAllNotificationsAsRead,
  clearNotifications,
  NotificationType,
  Notification
} from '../../store/slices/notificationSlice';
import { RootState } from '../../store';
import NotificationPreferences from './NotificationPreferences';

interface NotificationCenterProps {
  maxHeight?: number | string;
  showBadge?: boolean;
}

/**
 * NotificationCenter component
 * 
 * This component displays a notification center with a list of notifications,
 * tabs for filtering, and actions for managing notifications.
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxHeight = 400,
  showBadge = true
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get notifications and unread count from Redux store
  const notifications = useSelector((state: RootState) => 
    selectNotifications(state)
  );
  const unreadCount = useSelector((state: RootState) => 
    selectUnreadCount(state)
  );
  
  // Local state
  const [open, setOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  
  // Filter notifications based on tab
  const filteredNotifications = React.useMemo(() => {
    switch (tabValue) {
      case 0: // All
        return notifications;
      case 1: // Unread
        return notifications.filter(notification => !notification.read);
      case 2: // Read
        return notifications.filter(notification => notification.read);
      default:
        return notifications;
    }
  }, [notifications, tabValue]);
  
  // Toggle notification center
  const toggleNotificationCenter = () => {
    setOpen(!open);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    // Close notification center on mobile
    if (isMobile) {
      setOpen(false);
    }
  };
  
  // Handle notification menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  // Handle notification menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };
  
  // Handle mark as read
  const handleMarkAsRead = () => {
    if (selectedNotification) {
      dispatch(markNotificationAsRead(selectedNotification.id));
      handleMenuClose();
    }
  };
  
  // Handle remove notification
  const handleRemoveNotification = () => {
    if (selectedNotification) {
      dispatch(removeNotification(selectedNotification.id));
      handleMenuClose();
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };
  
  // Handle clear all notifications
  const handleClearAll = () => {
    dispatch(clearNotifications());
  };
  
  // Handle open preferences
  const handleOpenPreferences = () => {
    setShowPreferences(true);
    setOpen(false);
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircleIcon color="success" />;
      case NotificationType.WARNING:
        return <WarningIcon color="warning" />;
      case NotificationType.ERROR:
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Render notification button
  const renderNotificationButton = () => (
    <Tooltip title="Notifications">
      <IconButton
        color="inherit"
        onClick={toggleNotificationCenter}
        size="large"
      >
        <Badge
          badgeContent={showBadge ? unreadCount : 0}
          color="error"
          invisible={!showBadge || unreadCount === 0}
        >
          {unreadCount > 0 ? (
            <NotificationsActiveIcon />
          ) : notifications.length === 0 ? (
            <NotificationsOffIcon />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>
    </Tooltip>
  );
  
  // Render notification list
  const renderNotificationList = () => (
    <List sx={{ width: '100%', p: 0 }}>
      {filteredNotifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </Box>
      ) : (
        filteredNotifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <ListItem
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuOpen(e, notification)}
                >
                  <MoreVertIcon />
                </IconButton>
              }
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemButton onClick={() => handleNotificationClick(notification)}>
                <ListItemAvatar>
                  {getNotificationIcon(notification.type)}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: notification.read ? 'normal' : 'bold',
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: 'inline',
                          fontWeight: notification.read ? 'normal' : 'medium',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))
      )}
    </List>
  );
  
  // Render notification menu
  const renderNotificationMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {selectedNotification && !selectedNotification.read && (
        <MenuItem onClick={handleMarkAsRead}>
          <ListItemAvatar>
            <MarkReadIcon fontSize="small" />
          </ListItemAvatar>
          <ListItemText primary="Mark as read" />
        </MenuItem>
      )}
      <MenuItem onClick={handleRemoveNotification}>
        <ListItemAvatar>
          <DeleteIcon fontSize="small" />
        </ListItemAvatar>
        <ListItemText primary="Remove" />
      </MenuItem>
    </Menu>
  );
  
  // Render notification center content
  const renderContent = () => (
    <Box sx={{ width: isMobile ? '100vw' : 350, maxWidth: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        <Box>
          <Tooltip title="Settings">
            <IconButton onClick={handleOpenPreferences}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark all as read">
            <IconButton onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <MarkReadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear all">
            <IconButton onClick={handleClearAll} disabled={notifications.length === 0}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider />
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="All" />
        <Tab label={`Unread (${unreadCount})`} />
        <Tab label="Read" />
      </Tabs>
      
      <Box sx={{ overflow: 'auto', maxHeight }}>
        {renderNotificationList()}
      </Box>
    </Box>
  );
  
  return (
    <>
      {renderNotificationButton()}
      
      {isMobile ? (
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
        >
          {renderContent()}
        </Drawer>
      ) : (
        <Popover
          open={open}
          anchorEl={document.getElementById('notification-button')}
          onClose={() => setOpen(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {renderContent()}
        </Popover>
      )}
      
      {renderNotificationMenu()}
      
      <NotificationPreferences
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
};

export default NotificationCenter;