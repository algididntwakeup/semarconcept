// platform/frontend-mui/src/components/layout/Header.tsx - UPDATED WITH NAVIGATION AND AVATAR FIXES
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
  styled,
  useTheme,
  InputBase,
  Paper,
  Button,
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

// 🔥 FIXED: Removed all hover animations and transforms
const ModernAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: theme.palette.text.primary,
  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  zIndex: 1300,
}));

// 🔥 FIXED: Added cursor pointer and removed animations - MADE CLICKABLE
const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 3),
  minWidth: 240,
  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(135deg, ${alpha('#4285f4', 0.03)} 0%, ${alpha('#34a853', 0.03)} 100%)`,
  cursor: 'pointer !important', // 🆕 FIXED: Force cursor pointer
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#4285f4', 0.08), // 🆕 ADDED: More visible hover effect
  },
  '& *': {
    cursor: 'pointer !important', // 🆕 ADDED: Ensure all children have pointer cursor
  },
}));

// 🔥 FIXED: Removed all animations and pseudo-elements
const SearchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: alpha('#f8f9fa', 0.8),
  borderRadius: 12,
  padding: theme.spacing(0.5, 1.5),
  minWidth: 280,
  maxWidth: 400,
  marginLeft: theme.spacing(3),
  marginRight: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: 'none',
  '&:focus-within': {
    backgroundColor: '#ffffff',
    boxShadow: `0 0 0 3px ${alpha('#4285f4', 0.15)}`,
    borderColor: '#4285f4',
  },
  '&:hover': {
    backgroundColor: alpha('#f8f9fa', 0.95),
    borderColor: alpha('#4285f4', 0.3),
  },
}));

// 🔥 FIXED: Removed all hover animations
const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  fontSize: '0.875rem',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginLeft: theme.spacing(1),
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 0),
    '&::placeholder': {
      color: alpha(theme.palette.text.secondary, 0.7),
      opacity: 1,
      fontStyle: 'italic',
    },
  },
}));

// 🔥 FIXED: Removed ALL hover animations and transforms
const ModernIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: 12,
  '&:hover': {
    backgroundColor: alpha('#4285f4', 0.08),
  },
}));

// 🔥 FIXED: Removed notification button animations
const NotificationButton = styled(ModernIconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha('#4285f4', 0.08),
  },
}));

// 🔥 FIXED: Removed profile section animations
const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 16,
  cursor: 'pointer',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha('#f8f9fa', 0.8),
    borderColor: alpha('#4285f4', 0.2),
  },
}));

// 🔥 FIXED: Changed avatar style to EXACTLY match image - rectangular blue chip/badge style
const ModernAvatar = styled(Box)(({ theme }) => ({
  backgroundColor: '#4285f4', // Blue background
  color: '#ffffff', // White text
  width: 'auto', // 🆕 CHANGED: Auto width to fit content
  height: 32, // 🆕 CHANGED: Fixed height
  minWidth: 40, // 🆕 ADDED: Minimum width
  paddingLeft: theme.spacing(1.5), // 🆕 ADDED: Horizontal padding
  paddingRight: theme.spacing(1.5), // 🆕 ADDED: Horizontal padding
  borderRadius: 16, // 🆕 CHANGED: More rounded like a chip/badge
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  textAlign: 'center',
  boxShadow: 'none', // 🆕 REMOVED: Remove shadow for cleaner look
  border: 'none', // 🆕 REMOVED: Remove border
}));

// 🔥 FIXED: Removed keyboard shortcut animations
const KeyboardShortcut = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: alpha('#f8f9fa', 0.9),
  borderRadius: 6,
  padding: theme.spacing(0.25, 0.75),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontFamily: 'SF Mono, Monaco, Consolas, monospace',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  fontWeight: 600,
  display: 'none',
  '@media (min-width: 768px)': {
    display: 'block',
  },
}));

interface HeaderProps {
  onMenuToggle?: () => void;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle,
  sidebarCollapsed = false,
  onSidebarToggle 
}) => {
  const theme = useTheme();
  const navigate = useNavigate(); // 🆕 ADDED: Navigation hook
  
  // State management
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const isNotificationsOpen = Boolean(notificationsAnchorEl);

  // Mock data
  const currentUser = {
    name: 'Asset Manager',
    email: 'admin@semar.com',
    role: 'Administrator',
    avatar: null,
  };

  const notifications = [
    {
      id: 1,
      title: 'Maintenance Completed',
      message: 'Server maintenance on DB-01 completed successfully',
      time: '5 minutes ago',
      type: 'success',
      unread: true,
    },
    {
      id: 2,
      title: 'High CPU Usage Alert',
      message: 'CPU usage on APP-SERVER-02 exceeded 90%',
      time: '1 hour ago',
      type: 'warning',
      unread: true,
    },
    {
      id: 3,
      title: 'Backup Completed',
      message: 'Daily backup job completed successfully',
      time: '3 hours ago',
      type: 'info',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Event handlers
  const handleMenuToggle = () => {
    onSidebarToggle?.();
  };

  // 🆕 ADDED: Logo click handler with debugging
  const handleLogoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Logo clicked - navigating to dashboard'); // Debug log
    navigate('/dashboard/overview'); // Navigate to dashboard overview
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      console.log('Search:', searchValue);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    console.log('Logout clicked');
  };

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 🆕 CHANGED: Get initials for avatar - now shows "AM" like in image 2
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2); // Ensure max 2 characters
  };

  return (
    <>
      <ModernAppBar position="fixed">
        <Toolbar sx={{ px: 0, minHeight: '72px !important' }}>
          {/* Logo Section - NOW CLICKABLE WITH ENHANCED CURSOR */}
          <LogoSection 
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLogoClick(e as any);
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(66, 133, 244, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                  }}
                >
                  ✓
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Semar
              </Typography>
            </Box>
          </LogoSection>

          {/* Menu Toggle Button */}
          <Box sx={{ px: 2 }}>
            <Tooltip title={sidebarCollapsed ? "Expand Menu" : "Collapse Menu"}>
              <ModernIconButton 
                onClick={handleMenuToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </ModernIconButton>
            </Tooltip>
          </Box>

          {/* Search Section */}
          <SearchContainer>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <SearchInput
              placeholder="Search assets, locations, or reports..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              inputProps={{ 'aria-label': 'global search' }}
            />
            {searchValue && (
              <IconButton
                onClick={handleClearSearch}
                size="small"
                sx={{ p: 0.5, ml: 1 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <KeyboardShortcut>⌘K</KeyboardShortcut>
          </SearchContainer>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 3 }}>
            {/* Theme Toggle */}
            <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <ModernIconButton onClick={handleThemeToggle}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ModernIconButton>
            </Tooltip>

            {/* Fullscreen Toggle */}
            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
              <ModernIconButton onClick={handleFullscreenToggle}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </ModernIconButton>
            </Tooltip>

            {/* Add Button */}
            <Tooltip title="Quick Add">
              <ModernIconButton>
                <AddIcon />
              </ModernIconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <NotificationButton onClick={handleNotificationsOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </NotificationButton>
            </Tooltip>

            {/* Profile Section */}
            <ProfileSection onClick={handleProfileMenuOpen}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                  }}
                >
                  {currentUser.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.75rem',
                    lineHeight: 1,
                  }}
                >
                  {currentUser.role}
                </Typography>
              </Box>
              {/* 🆕 CHANGED: New avatar style matching image - blue chip/badge style */}
              <ModernAvatar>
                {getInitials(currentUser.name)}
              </ModernAvatar>
            </ProfileSection>
          </Box>
        </Toolbar>
      </ModernAppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha(theme.palette.grey[200], 0.8)}`,
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {currentUser.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            {currentUser.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Profile Settings</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Preferences</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={isNotificationsOpen}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 340,
            maxHeight: 420,
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha(theme.palette.grey[200], 0.8)}`,
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="primary" sx={{ fontSize: '0.8125rem' }}>
              {unreadCount} unread notifications
            </Typography>
          )}
        </Box>
        
        {notifications.map((notification, index) => (
          <MenuItem
            key={notification.id}
            onClick={handleNotificationsClose}
            sx={{
              alignItems: 'flex-start',
              py: 2,
              px: 2,
              borderBottom: index < notifications.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
              backgroundColor: notification.unread ? alpha('#4285f4', 0.02) : 'transparent',
              borderLeft: notification.unread ? `3px solid #4285f4` : '3px solid transparent',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {notification.title}
                </Typography>
                {notification.unread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#4285f4',
                      ml: 1,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.8125rem', lineHeight: 1.4, mb: 0.5 }}
              >
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        
        <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            variant="text" 
            size="small"
            onClick={handleNotificationsClose}
            sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default Header;