// platform/frontend-mui/src/types/navigation.ts
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export type IconType = OverridableComponent<SvgIconTypeMap<{}, "svg">>;

export interface NavItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: IconType;
  url?: string;
  visible?: boolean;
  target?: '_blank' | '_self';
  breadcrumbs?: boolean;
  disabled?: boolean;
  caption?: string;
  chip?: {
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    variant: 'filled' | 'outlined';
    size: 'small' | 'medium';
    label: string;
  };
  children?: NavItem[];
  permissions?: string[]; // For role-based access control
  external?: boolean; // For external links
  badge?: {
    count?: number;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    variant?: 'standard' | 'dot';
  };
  description?: string;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  isLast?: boolean;
}

export interface MenuState {
  open: boolean;
  mobileOpen: boolean;
  activeMenuPath: string[];
  openCollapseMenus: Record<string, boolean>;
}

export interface NavigationConfig {
  drawerWidth: number;
  collapsedDrawerWidth: number;
  autoCollapse: boolean;
  persistState: boolean;
  showBreadcrumbs: boolean;
  mobileBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}