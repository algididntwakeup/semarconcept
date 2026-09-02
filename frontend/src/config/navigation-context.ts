// platform/frontend-mui/src/config/navigation-context.ts
import { createContext, useContext } from 'react';
import { NavItem } from '../types/navigation';

// Kontrak navigasi bersama: MainLayout mengisi state runtime, sedangkan
// module landing page membaca top-level menu untuk filter destination.
export interface NavigationContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeHorizontalTab: number;
  setActiveHorizontalTab: (tab: number) => void;
  openCollapseMenus: Record<string, boolean>;
  setOpenCollapseMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  topLevelMenuItems: NavItem[];
  handleMenuItemClick: (item: NavItem, fromHorizontal?: boolean) => void;
  toggleCollapseMenu: (id: string) => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
