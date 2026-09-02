// platform/frontend-mui/src/components/layout/menu/NavItem.tsx - ANIMATION FIXES
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
  styled,
  Chip,
  Tooltip,
  Box,
} from '@mui/material';
import { NavItem as NavItemType } from '../../../types/navigation';

// 🔥 FIXED: Removed ALL hover animations and transforms
const ModernListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.25, 1.5),
  borderRadius: 12,
  minHeight: 48,
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '0.875rem',
  // 🚫 REMOVED: All transition properties
  '&:hover': {
    backgroundColor: alpha('#4285F4', 0.08),
    color: '#4285F4',
  },
  '&.active': {
    backgroundColor: '#4285F4',
    color: '#ffffff',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#4285F4',
    },
    '& .MuiListItemIcon-root': {
      color: '#ffffff',
    },
  },
}));

// 🔥 FIXED: Removed child item animations
const ChildItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.25, 1.5),
  marginLeft: theme.spacing(3),
  borderRadius: 12,
  minHeight: 40,
  fontSize: '0.8125rem',
  paddingLeft: theme.spacing(3),
  // 🚫 REMOVED: All transition properties
  '&:hover': {
    backgroundColor: alpha('#4285F4', 0.08),
    color: '#4285F4',
  },
  '&.active': {
    backgroundColor: '#4285F4',
    color: '#ffffff',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#4285F4',
    },
  },
}));

// 🔥 FIXED: Removed status badge animations
const StatusBadge = styled(Chip)(({ theme }) => ({
  height: 18,
  fontSize: '0.7rem',
  fontWeight: 600,
  '& .MuiChip-label': {
    paddingX: theme.spacing(0.75),
  },
}));

interface NavItemProps {
  item: NavItemType;
  level: number;
  collapsed?: boolean;
  onItemClick?: (item: NavItemType) => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  item, 
  level, 
  collapsed = false,
  onItemClick 
}) => {
  const theme = useTheme();
  const location = useLocation();

  // Check if current path matches this item
  const isActive = React.useMemo(() => {
    if (!item.url) return false;
    return location.pathname === item.url || location.pathname.startsWith(item.url + '/');
  }, [location.pathname, item.url]);

  // Create icon element if item.icon exists
  const ItemIcon = item.icon ? (
    React.createElement(item.icon, { 
      sx: { 
        fontSize: 20,
        color: 'inherit',
      }
    })
  ) : null;

  // Handle external URLs
  const isExternal = item.url?.startsWith('http');

  // Get badge styling
  const getBadgeProps = (badge: any) => {
    const badgeStr = typeof badge === 'object' ? String(badge.count ?? '') : String(badge ?? '');
    const props: any = {
      size: "small",
      sx: {
        height: 18,
        fontSize: '0.7rem',
        fontWeight: 600,
        ml: 1,
        '& .MuiChip-label': { px: 0.75 }
      }
    };

    if (badgeStr.toLowerCase() === 'new') {
      props.sx.backgroundColor = isActive ? alpha('#ffffff', 0.2) : alpha('#34A853', 0.1);
      props.sx.color = isActive ? '#ffffff' : '#34A853';
    } else if (!isNaN(Number(badgeStr)) && badgeStr !== '') {
      props.sx.backgroundColor = isActive ? alpha('#ffffff', 0.2) : alpha('#4285F4', 0.1);
      props.sx.color = isActive ? '#ffffff' : '#4285F4';
    } else {
      props.color = "primary";
    }

    return props;
  };

  // Enhanced click handler
  const handleClick = (event: React.MouseEvent) => {
    console.log('🔥 NavItem clicked:', item.title, 'URL:', item.url);
    
    // Prevent default for NavLink to handle our own navigation
    if (!isExternal && item.url) {
      event.preventDefault();
    }
    
    // Call the parent click handler if provided
    if (onItemClick) {
      onItemClick(item);
    }
    
    // For external links, let the default behavior handle it
    if (isExternal) {
      return;
    }
  };

  const listItemProps = isExternal
    ? {
        component: 'a' as React.ElementType,
        href: item.url,
        target: item.target || '_blank',
        rel: 'noopener noreferrer',
        onClick: handleClick,
      }
    : { 
        component: NavLink, 
        to: item.url || '#', 
        target: item.target || '_self',
        onClick: handleClick,
      };

  // Choose the appropriate button component based on level
  const ButtonComponent = level > 0 ? ChildItemButton : ModernListItemButton;

  const buttonContent = (
    <ButtonComponent
      {...listItemProps}
      disabled={item.disabled}
      className={isActive ? 'active' : ''}
      sx={{
        pl: collapsed ? 2 : (level > 0 ? 3 : 3),
        justifyContent: collapsed ? 'center' : 'flex-start',
        opacity: item.disabled ? 0.5 : 1,
        cursor: item.disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {ItemIcon && (
        <ListItemIcon 
          sx={{ 
            minWidth: collapsed ? 'auto' : 40,
            color: 'inherit',
            justifyContent: 'center',
          }}
        >
          {ItemIcon}
        </ListItemIcon>
      )}

      {!collapsed && (
        <>
          <ListItemText
            primary={
              <Typography 
                variant="body2" 
                sx={{
                  fontWeight: isActive ? 600 : (level > 0 ? 400 : 500),
                  fontSize: level > 0 ? '0.8125rem' : '0.875rem',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: 'inherit',
                }}
              >
                {item.title}
              </Typography>
            }
            secondary={item.description && level === 0 ? (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'inherit',
                  fontSize: '0.7rem',
                  lineHeight: 1.2,
                  opacity: 0.8,
                }}
              >
                {item.description}
              </Typography>
            ) : null}
          />

          {/* Badge/Chip for notifications or status */}
          {item.badge && (
            <StatusBadge
              label={typeof item.badge === 'object' ? String((item.badge as any).count || '') : String(item.badge)}
              {...getBadgeProps(item.badge)}
            />
          )}
        </>
      )}
    </ButtonComponent>
  );

  return (
    <ListItem 
      disablePadding 
      sx={{ 
        display: 'block',
        opacity: item.visible === false ? 0 : 1,
        // 🚫 REMOVED: All transition properties
      }}
    >
      {collapsed && item.title ? (
        <Tooltip 
          title={
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                {item.title}
              </Typography>
              {item.description && (
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                  {item.description}
                </Typography>
              )}
              {item.badge && (
                <Typography variant="caption" sx={{ 
                  display: 'block',
                  mt: 0.5,
                  color: theme.palette.primary.light,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}>
                  🔥 {typeof item.badge === 'object' ? (item.badge as any).count : item.badge}
                </Typography>
              )}
            </Box>
          }
          placement="right"
          arrow
          sx={{
            '& .MuiTooltip-tooltip': {
              backgroundColor: '#202124',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: 2,
              padding: theme.spacing(1, 1.5),
              maxWidth: 250,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            },
            '& .MuiTooltip-arrow': {
              color: '#202124',
            },
          }}
        >
          <Box sx={{ width: '100%' }}>
            {buttonContent}
          </Box>
        </Tooltip>
      ) : (
        buttonContent
      )}
    </ListItem>
  );
};

export default NavItem;