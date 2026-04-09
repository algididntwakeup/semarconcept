// platform/frontend-mui/src/components/layout/menu/MenuList.tsx - COMPLETE ANIMATION FIXES
import React, { useState, useEffect, useMemo } from 'react';
import { 
  List, 
  Collapse,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  alpha,
  styled,
  useTheme,
  Chip,
  Tooltip,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from '../../../menu-items';
import { NavItem as NavItemType } from '../../../types/navigation';
import { useNavigation } from '../../../layouts/MainLayout';

// 🚫 FIXED: Completely removed all animations and transforms
const CollapseButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.25, 1.5),
  borderRadius: 12,
  minHeight: 48,
  // 🚫 REMOVED: transition: 'all 0.15s ease',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '0.875rem',
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

const StatusBadge = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.7rem',
  fontWeight: 600,
  '& .MuiChip-label': {
    paddingX: theme.spacing(1),
  },
}));

// 🚫 FIXED: Completely removed all animations and transforms
const ChildItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.25, 1.5),
  marginLeft: theme.spacing(3),
  borderRadius: 12,
  minHeight: 40,
  // 🚫 REMOVED: transition: 'all 0.15s ease',
  fontSize: '0.8125rem',
  paddingLeft: theme.spacing(3),
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

interface MenuListProps {
  userPermissions?: string[];
  collapsed?: boolean;
}

const MenuList: React.FC<MenuListProps> = ({ 
  userPermissions = [], 
  collapsed = false 
}) => {
  const theme = useTheme();
  const location = useLocation();
  
  // 🔥 Get navigation context
  const { 
    openCollapseMenus, 
    setOpenCollapseMenus, 
    handleMenuItemClick, 
    toggleCollapseMenu,
    sidebarOpen
  } = useNavigation();
  
  // Filter menu items based on permissions
  const filteredMenuItems = useMemo(() => {
    const filterItems = (items: NavItemType[]): NavItemType[] => {
      return items.filter(item => {
        if (item.visible === false) return false;
        
        if (item.permissions && item.permissions.length > 0) {
          const hasPermission = item.permissions.some(permission => 
            userPermissions.includes(permission)
          );
          if (!hasPermission) return false;
        }
        
        if (item.children) {
          item.children = filterItems(item.children);
          if (item.children.length === 0 && !item.url) return false;
        }
        
        return true;
      });
    };
    
    return filterItems(menuItems);
  }, [userPermissions]);

  // Function to find active menu path
  const findActiveMenuPath = (items: NavItemType[], currentPath: string): string[] => {
    for (const item of items) {
      if (item.url && (currentPath === item.url || currentPath.startsWith(item.url + '/'))) {
        return [item.id];
      }
      
      if (item.children) {
        const childPath = findActiveMenuPath(item.children, currentPath);
        if (childPath.length > 0) {
          return [item.id, ...childPath];
        }
      }
    }
    return [];
  };

  // Auto-expand parent menus for active items
  useEffect(() => {
    if (!sidebarOpen) return;
    
    const activePath = findActiveMenuPath(filteredMenuItems, location.pathname);
    const newOpenItems: Record<string, boolean> = {};
    
    activePath.forEach(itemId => {
      newOpenItems[itemId] = true;
    });
    
    setOpenCollapseMenus(prev => ({ ...prev, ...newOpenItems }));
  }, [location.pathname, filteredMenuItems, sidebarOpen, setOpenCollapseMenus]);

  // Check if item or any child is active
  const isItemActive = (item: NavItemType): boolean => {
    if (item.url && (location.pathname === item.url || location.pathname.startsWith(item.url + '/'))) {
      return true;
    }
    
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    
    return false;
  };

  // Get badge color and styling
  const getBadgeProps = (badge: string, isActive: boolean) => {
    const props: any = {
      size: "small",
      sx: {
        height: 20,
        fontSize: '0.7rem',
        fontWeight: 600,
        marginLeft: 'auto',
        marginRight: theme.spacing(1),
        '& .MuiChip-label': { px: 1 }
      }
    };

    if (badge.toLowerCase() === 'new') {
      props.sx.backgroundColor = isActive ? alpha('#ffffff', 0.2) : alpha('#34A853', 0.1);
      props.sx.color = isActive ? '#ffffff' : '#34A853';
    } else if (!isNaN(Number(badge))) {
      props.sx.backgroundColor = isActive ? alpha('#ffffff', 0.2) : alpha('#4285F4', 0.1);
      props.sx.color = isActive ? '#ffffff' : '#4285F4';
    } else {
      props.color = "primary";
    }

    return props;
  };

  // 🚫 FIXED: Enhanced render menu item function - NO ANIMATIONS
  const renderMenuItem = (item: NavItemType, level: number = 0): React.ReactNode => {
    const isActive = isItemActive(item);
    const isOpen = openCollapseMenus[item.id];
    
    switch (item.type) {
      case 'group':
        return (
          <React.Fragment key={item.id}>
            <NavGroup 
              item={item} 
              showDivider={level === 0}
              collapsed={!sidebarOpen}
            />
            {item.children && item.children.map(child => renderMenuItem(child, level))}
          </React.Fragment>
        );
        
      case 'item':
        return (
          <React.Fragment key={item.id}>
            {sidebarOpen ? (
              <NavItem 
                item={item} 
                level={level}
                collapsed={false}
                onItemClick={(clickedItem) => handleMenuItemClick(clickedItem, false)}
              />
            ) : (
              <ListItem disablePadding>
                <Tooltip 
                  title={item.title}
                  placement="right"
                  arrow
                >
                  <CollapseButton
                    onClick={() => handleMenuItemClick(item, false)}
                    className={location.pathname === item.url ? 'active' : ''}
                    sx={{
                      justifyContent: 'center',
                      px: 0,
                    }}
                  >
                    {item.icon && (
                      <ListItemIcon
                        sx={{
                          minWidth: 'auto',
                          justifyContent: 'center',
                          color: 'inherit',
                        }}
                      >
                        <item.icon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                    )}
                  </CollapseButton>
                </Tooltip>
              </ListItem>
            )}
          </React.Fragment>
        );
        
      case 'collapse':
        const IconComponent = item.icon;
        
        return (
          <React.Fragment key={item.id}>
            <ListItem disablePadding>
              {sidebarOpen ? (
                <CollapseButton
                  onClick={() => {
                    console.log('🔥 Collapse menu clicked:', item.title);
                    toggleCollapseMenu(item.id);
                  }}
                  className={isActive ? 'active' : ''}
                  disabled={item.disabled}
                  sx={{
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                >
                  {IconComponent && (
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: 'inherit',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                  )}
                  
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.875rem',
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          color: 'inherit',
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                  />
                  
                  {/* Badge */}
                  {item.badge && (
                    <StatusBadge
                      label={item.badge}
                      {...getBadgeProps(item.badge, isActive)}
                    />
                  )}
                  
                  {/* 🚫 FIXED: Expand/Collapse Icon - NO ANIMATIONS */}
                  <Box
                    sx={{
                      // 🚫 REMOVED: transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'inherit',
                    }}
                  >
                    <ExpandMore sx={{ fontSize: 18 }} />
                  </Box>
                </CollapseButton>
              ) : (
                <Tooltip 
                  title={item.title}
                  placement="right"
                  arrow
                >
                  <CollapseButton
                    onClick={() => {
                      toggleCollapseMenu(item.id);
                      // Also trigger the horizontal menu click
                      handleMenuItemClick(item, true);
                    }}
                    className={isActive ? 'active' : ''}
                    sx={{
                      justifyContent: 'center',
                      px: 0,
                    }}
                  >
                    {IconComponent && (
                      <ListItemIcon
                        sx={{
                          minWidth: 'auto',
                          justifyContent: 'center',
                          color: 'inherit',
                        }}
                      >
                        <IconComponent sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                    )}
                  </CollapseButton>
                </Tooltip>
              )}
            </ListItem>
            
            {/* 🚫 FIXED: Render children with INSTANT collapse - NO ANIMATIONS */}
            {sidebarOpen && item.children && (
              <Collapse in={isOpen} timeout={0} unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map(child => (
                    <ListItem key={child.id} disablePadding>
                      <ChildItemButton
                        onClick={() => handleMenuItemClick(child, false)}
                        className={location.pathname === child.url ? 'active' : ''}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8125rem',
                                fontWeight: location.pathname === child.url ? 600 : 400,
                                color: 'inherit',
                              }}
                            >
                              {child.title}
                            </Typography>
                          }
                        />
                      </ChildItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
        
      default:
        console.warn(`Unknown menu item type: ${item.type}`, item);
        return null;
    }
  };

  // Group items by type for better organization
  const groupedItems = useMemo(() => {
    return filteredMenuItems.reduce((acc, item) => {
      if (item.type === 'group') {
        acc.groups.push(item);
      } else {
        acc.main.push(item);
      }
      return acc;
    }, { main: [] as NavItemType[], groups: [] as NavItemType[] });
  }, [filteredMenuItems]);

  return (
    <List 
      component="nav"
      sx={{ 
        pt: 1,
        pb: 2,
        px: 0,
        '& .MuiListItem-root': {
          // 🚫 REMOVED: transition: 'all 0.15s ease',
        },
      }}
    >
      {/* Render main navigation items */}
      {groupedItems.main.map(item => renderMenuItem(item))}
      
      {/* Render group items */}
      {groupedItems.groups.map(item => renderMenuItem(item))}
      
      {/* Show message if no items available */}
      {filteredMenuItems.length === 0 && sidebarOpen && (
        <ListItem>
          <Typography 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center', 
              width: '100%',
              py: 4,
              fontStyle: 'italic',
            }}
          >
            No menu items available
          </Typography>
        </ListItem>
      )}
    </List>
  );
};

export default MenuList;