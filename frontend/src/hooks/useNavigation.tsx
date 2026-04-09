// platform/frontend-mui/src/hooks/useNavigation.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { NavItem } from '../types/navigation';

interface NavigationState {
  open: boolean;
  mobileOpen: boolean;
  activeMenuPath: string[];
  openCollapseMenus: Record<string, boolean>;
}

interface NavigationActions {
  toggleDesktopDrawer: () => void;
  toggleMobileDrawer: () => void;
  openDesktopDrawer: () => void;
  closeDesktopDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleCollapseMenu: (id: string) => void;
  setActiveMenuPath: (path: string[]) => void;
  expandParentMenus: (path: string[]) => void;
}

interface UseNavigationProps {
  menuItems: NavItem[];
  persistState?: boolean;
  autoExpandActive?: boolean;
  mobileBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface UseNavigationReturn extends NavigationState, NavigationActions {
  isMobile: boolean;
  isTablet: boolean;
  findActiveMenuPath: (items: NavItem[], currentPath: string, path?: string[]) => string[] | null;
  isMenuItemActive: (itemId: string, itemUrl?: string) => boolean;
  isParentOfActive: (itemId: string) => boolean;
}

const STORAGE_KEY = 'navigation-state';

export const useNavigation = ({
  menuItems,
  persistState = true,
  autoExpandActive = true,
  mobileBreakpoint = 'md'
}: UseNavigationProps): UseNavigationReturn => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Initialize state from localStorage if persistState is enabled
  const getInitialState = useCallback((): NavigationState => {
    if (persistState && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedState = JSON.parse(saved);
          return {
            ...parsedState,
            mobileOpen: false, // Always start with mobile drawer closed
            open: isMobile ? false : parsedState.open, // Respect mobile breakpoint
          };
        }
      } catch (error) {
        console.warn('Failed to load navigation state from localStorage:', error);
      }
    }
    
    return {
      open: !isMobile,
      mobileOpen: false,
      activeMenuPath: [],
      openCollapseMenus: {},
    };
  }, [isMobile, persistState]);

  const [state, setState] = useState<NavigationState>(getInitialState);

  // Save state to localStorage when it changes (excluding mobileOpen)
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      try {
        const stateToSave = {
          ...state,
          mobileOpen: false, // Don't persist mobile drawer state
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.warn('Failed to save navigation state to localStorage:', error);
      }
    }
  }, [state, persistState]);

  // Handle responsive behavior
  useEffect(() => {
    setState(prev => ({
      ...prev,
      open: isMobile ? false : prev.open,
      mobileOpen: false, // Close mobile drawer when switching to desktop
    }));
  }, [isMobile]);

  // Find active menu path recursively
  const findActiveMenuPath = useCallback((
    items: NavItem[], 
    currentPath: string, 
    path: string[] = []
  ): string[] | null => {
    for (const item of items) {
      const currentItemPath = [...path, item.id];
      
      // Check for exact match or path that starts with the URL
      if (item.url) {
        if (currentPath === item.url || currentPath.startsWith(item.url + '/')) {
          return currentItemPath;
        }
      }
      
      // Check children recursively
      if (item.children && item.children.length > 0) {
        const childPath = findActiveMenuPath(item.children, currentPath, currentItemPath);
        if (childPath) {
          return childPath;
        }
      }
    }
    return null;
  }, []);

  // Update active path when location changes
  useEffect(() => {
    const activePath = findActiveMenuPath(menuItems, location.pathname);
    
    if (activePath && autoExpandActive) {
      setState(prev => {
        const newOpenCollapseMenus = { ...prev.openCollapseMenus };
        
        // Auto-expand parent menus for active item
        for (let i = 0; i < activePath.length - 1; i++) {
          newOpenCollapseMenus[activePath[i]] = true;
        }
        
        return {
          ...prev,
          activeMenuPath: activePath,
          openCollapseMenus: newOpenCollapseMenus,
        };
      });
    } else if (activePath) {
      setState(prev => ({
        ...prev,
        activeMenuPath: activePath,
      }));
    }
  }, [location.pathname, menuItems, findActiveMenuPath, autoExpandActive]);

  // Check if menu item is active
  const isMenuItemActive = useCallback((itemId: string, itemUrl?: string): boolean => {
    if (itemUrl && (location.pathname === itemUrl || location.pathname.startsWith(itemUrl + '/'))) {
      return true;
    }
    return state.activeMenuPath.includes(itemId);
  }, [location.pathname, state.activeMenuPath]);

  // Check if item is parent of active item
  const isParentOfActive = useCallback((itemId: string): boolean => {
    const activeIndex = state.activeMenuPath.indexOf(itemId);
    return activeIndex >= 0 && activeIndex < state.activeMenuPath.length - 1;
  }, [state.activeMenuPath]);

  // Actions
  const toggleDesktopDrawer = useCallback(() => {
    setState(prev => ({ ...prev, open: !prev.open }));
  }, []);

  const toggleMobileDrawer = useCallback(() => {
    setState(prev => ({ ...prev, mobileOpen: !prev.mobileOpen }));
  }, []);

  const openDesktopDrawer = useCallback(() => {
    setState(prev => ({ ...prev, open: true }));
  }, []);

  const closeDesktopDrawer = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setState(prev => ({ ...prev, mobileOpen: false }));
  }, []);

  const toggleCollapseMenu = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      openCollapseMenus: {
        ...prev.openCollapseMenus,
        [id]: !prev.openCollapseMenus[id],
      },
    }));
  }, []);

  const setActiveMenuPath = useCallback((path: string[]) => {
    setState(prev => ({ ...prev, activeMenuPath: path }));
  }, []);

  const expandParentMenus = useCallback((path: string[]) => {
    setState(prev => {
      const newOpenCollapseMenus = { ...prev.openCollapseMenus };
      for (let i = 0; i < path.length - 1; i++) {
        newOpenCollapseMenus[path[i]] = true;
      }
      return {
        ...prev,
        openCollapseMenus: newOpenCollapseMenus,
      };
    });
  }, []);

  return {
    // State
    ...state,
    isMobile,
    isTablet,
    
    // Actions
    toggleDesktopDrawer,
    toggleMobileDrawer,
    openDesktopDrawer,
    closeDesktopDrawer,
    closeMobileDrawer,
    toggleCollapseMenu,
    setActiveMenuPath,
    expandParentMenus,
    
    // Utilities
    findActiveMenuPath,
    isMenuItemActive,
    isParentOfActive,
  };
};