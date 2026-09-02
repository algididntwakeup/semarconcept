// platform/frontend-mui/src/config/menu-loader.ts

import { NavItem } from '../types/navigation';
import { getIconByName } from './icon-mapping';
import menuItemsData from './menu-items.json';

/**
 * Interface for menu item JSON structure
 */
interface MenuItemJson {
  id: string;
  title: string;
  type: string;
  icon?: string;
  url?: string;
  visible?: boolean;
  order?: number;
  permissions?: string[];
  caption?: string;
  children?: MenuItemJson[];
  disabled?: boolean;
  external?: boolean;
  target?: any;
  breadcrumbs?: boolean;
  badge?: any;
  description?: string;
}

/**
 * 🔥 DEBUG: Check which icons are missing
 */
export const debugMissingIcons = () => {
  console.log('🔍 Starting icon debug...');
  const allIconNames = new Set<string>();
  
  const extractIcons = (items: MenuItemJson[]) => {
    items.forEach(item => {
      if (item.icon) {
        allIconNames.add(item.icon);
        // console.log(`📍 Found icon in menu: ${item.icon} (${item.title})`);
      }
      if (item.children) extractIcons(item.children);
    });
  };
  
  extractIcons(menuItemsData.menuItems);
  
  console.log('🔍 ALL ICONS USED IN MENU:', Array.from(allIconNames));
  
  const missingIcons: string[] = [];
  const foundIcons: string[] = [];
  
  Array.from(allIconNames).forEach(iconName => {
    const icon = getIconByName(iconName);
    if (!icon) {
      // console.error(`❌ MISSING ICON: ${iconName}`);
      missingIcons.push(iconName);
    } else {
      // console.log(`✅ FOUND ICON: ${iconName}`);
      foundIcons.push(iconName);
    }
  });
  
  if (missingIcons.length > 0) {
    console.error('🚨 MISSING ICONS COUNT:', missingIcons.length);
    console.error('🚨 MISSING ICONS LIST:', missingIcons);
    console.log('👉 ADD THESE IMPORTS TO icon-mapping.ts:');
    missingIcons.forEach(iconName => {
      const cleanName = iconName.replace('Icon', '');
      console.log(`import ${iconName} from '@mui/icons-material/${cleanName}';`);
    });
  } else {
    console.log('🎉 ALL ICONS FOUND! Total:', foundIcons.length);
  }
  
  return { missingIcons, foundIcons, totalIcons: allIconNames.size };
};

/**
 * Convert JSON menu item to NavItem with resolved icons
 */
const convertJsonToNavItem = (jsonItem: MenuItemJson): NavItem => {
  const navItem: NavItem = {
    id: jsonItem.id,
    title: jsonItem.title,
    type: jsonItem.type as any,
    url: jsonItem.url,
    visible: jsonItem.visible ?? true,
    disabled: jsonItem.disabled ?? false,
    external: jsonItem.external ?? false,
    target: jsonItem.target,
    breadcrumbs: jsonItem.breadcrumbs ?? false,
    caption: jsonItem.caption,
    badge: jsonItem.badge,
    description: jsonItem.description,
  };

  // Resolve icon with reliable fallback
  const resolvedIcon = jsonItem.icon ? getIconByName(jsonItem.icon) : getIconByName(jsonItem.title);
  navItem.icon = resolvedIcon as any;

  // Recursively convert children
  if (jsonItem.children && jsonItem.children.length > 0) {
    navItem.children = jsonItem.children
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Sort by order
      .map(convertJsonToNavItem);
  }

  return navItem;
};

/**
 * 🔥 NEW: Convert backend MenuItem to NavItem with resolved icons
 */
export const convertMenuItemToNavItem = (item: any): NavItem => {
  const navItem: NavItem = {
    // Slugs are stable across databases and deployments; numeric IDs are not.
    // Navigation behavior (including the canonical Dashboard click) relies on
    // these semantic IDs.
    id: item.slug || item.id.toString(),
    title: item.title,
    type: (item.menu_type === 'collapse' || item.menu_type === 'group' || item.menu_type === 'item') 
      ? item.menu_type 
      : (item.children && item.children.length > 0 ? 'collapse' : 'item'),
    url: item.route || undefined,
    visible: item.is_visible ?? true,
    disabled: !item.is_active,
  };

  // Resolve icon with reliable fallback
  const resolvedIcon = item.icon ? getIconByName(item.icon) : getIconByName(item.title);
  navItem.icon = resolvedIcon as any;

  // Recursively convert children
  if (item.children && item.children.length > 0) {
    navItem.children = item.children
      .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(convertMenuItemToNavItem);
  }

  return navItem;
};

/**
 * Filter menu items based on user permissions
 * @param items - Menu items to filter
 * @param userPermissions - Array of user permissions
 * @returns Filtered menu items
 */
const filterMenuByPermissions = (items: NavItem[], userPermissions: string[] = []): NavItem[] => {
  return items.filter(item => {
    // If no permissions required, show the item
    const jsonItem = menuItemsData.menuItems.find(json => json.id === item.id);
    if (!jsonItem?.permissions || jsonItem.permissions.length === 0) {
      return true;
    }

    // Check if user has any of the required permissions
    const hasPermission = jsonItem.permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      console.log(`🔒 Permission denied for menu item: ${item.title} (requires: ${jsonItem.permissions.join(', ')})`);
      return false;
    }

    // Recursively filter children
    if (item.children) {
      item.children = filterMenuByPermissions(item.children, userPermissions);
      // Hide parent if no children are visible and it's a collapse type
      if (item.children.length === 0 && item.type === 'collapse' && !item.url) {
        console.log(`🔒 Hiding parent menu item (no visible children): ${item.title}`);
        return false;
      }
    }

    return true;
  });
};

/**
 * 🔥 ENHANCED: Load menu items from JSON configuration with debugging
 * @param userPermissions - Optional array of user permissions for filtering
 * @returns Array of NavItem objects
 */
export const loadMenuItems = (userPermissions?: string[]): NavItem[] => {
  try {
    console.log('🔄 Loading menu items...');
    console.log('📊 Menu metadata:', menuItemsData.metadata);
    
    // 🔥 DEBUG: Check icons in development
    if (process.env.NODE_ENV === 'development') {
      const iconDebug = debugMissingIcons();
      console.log('📊 Icon debug results:', iconDebug);
    }
    
    // Convert JSON to NavItem objects
    const menuItems = menuItemsData.menuItems
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Sort by order
      .map(convertJsonToNavItem);

    console.log(`✅ Converted ${menuItems.length} menu items from JSON`);

    // Filter by permissions if provided
    if (userPermissions) {
      console.log(`🔒 Filtering menu items by permissions:`, userPermissions);
      const filteredItems = filterMenuByPermissions(menuItems, userPermissions);
      console.log(`✅ Filtered to ${filteredItems.length} accessible menu items`);
      return filteredItems;
    }

    console.log('✅ Returning all menu items (no permission filtering)');
    return menuItems;
  } catch (error) {
    console.error('❌ Error loading menu items:', error);
    console.error('📍 Menu data structure:', menuItemsData);
    return [];
  }
};

/**
 * 🔥 NEW: Load menu items from API (Database)
 */
export const loadDynamicMenuItems = async (apiCall: () => Promise<any>): Promise<NavItem[]> => {
  try {
    const response = await apiCall();
    const items = response.data.data;
    
    if (!Array.isArray(items)) return [];

    return items
      .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(convertMenuItemToNavItem);
  } catch (error) {
    console.error('❌ Error loading dynamic menu items:', error);
    return [];
  }
};

/**
 * Get menu metadata
 */
export const getMenuMetadata = () => {
  return menuItemsData.metadata;
};

/**
 * Find menu item by ID (recursive search)
 * @param items - Menu items to search
 * @param id - Menu item ID to find
 * @returns Found menu item or undefined
 */
export const findMenuItemById = (items: NavItem[], id: string): NavItem | undefined => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

/**
 * Get menu item path (breadcrumbs)
 * @param items - Menu items to search
 * @param id - Target menu item ID
 * @param path - Current path (used for recursion)
 * @returns Array of menu items representing the path
 */
export const getMenuItemPath = (items: NavItem[], id: string, path: NavItem[] = []): NavItem[] => {
  for (const item of items) {
    const currentPath = [...path, item];
    
    if (item.id === id) {
      return currentPath;
    }
    
    if (item.children) {
      const found = getMenuItemPath(item.children, id, currentPath);
      if (found.length > 0) {
        return found;
      }
    }
  }
  return [];
};

/**
 * 🔥 ENHANCED: Validate menu structure with detailed reporting
 * @param items - Menu items to validate
 * @returns Validation result with errors
 */
export const validateMenuStructure = (items: NavItem[]): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  
  const validateItem = (item: NavItem, parentPath = '') => {
    const fullPath = parentPath ? `${parentPath} > ${item.title}` : item.title;
    
    // Check for duplicate IDs
    if (seenIds.has(item.id)) {
      errors.push(`Duplicate menu item ID: "${item.id}" at ${fullPath}`);
    } else {
      seenIds.add(item.id);
    }
    
    // Check required fields
    if (!item.title) {
      errors.push(`Missing title for menu item with ID: "${item.id}" at ${fullPath}`);
    }
    
    if (!item.type) {
      errors.push(`Missing type for menu item: "${item.title}" at ${fullPath}`);
    }
    
    // Check type-specific requirements
    if (item.type === 'item' && !item.url) {
      errors.push(`Menu item of type "item" must have a URL: "${item.title}" at ${fullPath}`);
    }
    
    if (item.type === 'group' && !item.caption && !item.title) {
      errors.push(`Menu item of type "group" must have a caption or title: "${item.id}" at ${fullPath}`);
    }
    
    // Check for missing icons
    if (!item.icon && item.type !== 'group') {
      warnings.push(`Menu item "${item.title}" has no icon`);
    }
    
    // Validate children recursively
    if (item.children) {
      item.children.forEach(child => validateItem(child, fullPath));
    }
  };
  
  items.forEach(item => validateItem(item));
  
  // Log validation results
  if (errors.length > 0) {
    console.error('❌ Menu validation errors:', errors);
  }
  if (warnings.length > 0) {
    console.warn('⚠️ Menu validation warnings:', warnings);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * 🔥 NEW: Get menu statistics
 */
export const getMenuStatistics = (items: NavItem[] = loadMenuItems()) => {
  let totalItems = 0;
  let itemsWithIcons = 0;
  let itemsWithUrls = 0;
  let groupItems = 0;
  let collapseItems = 0;
  let leafItems = 0;
  
  const countItems = (menuItems: NavItem[]) => {
    menuItems.forEach(item => {
      totalItems++;
      if (item.icon) itemsWithIcons++;
      if (item.url) itemsWithUrls++;
      if (item.type === 'group') groupItems++;
      if (item.type === 'collapse') collapseItems++;
      if (item.type === 'item') leafItems++;
      
      if (item.children) {
        countItems(item.children);
      }
    });
  };
  
  countItems(items);
  
  const stats = {
    totalItems,
    itemsWithIcons,
    itemsWithUrls,
    groupItems,
    collapseItems,
    leafItems,
    iconCoverage: Math.round((itemsWithIcons / totalItems) * 100),
  };
  
  console.log('📊 Menu Statistics:', stats);
  return stats;
};

// 🔥 AUTO-RUN: Debug in development mode
if (process.env.NODE_ENV === 'development') {
  // Run validation and statistics after a short delay
  setTimeout(() => {
    console.log('🔍 Running menu validation and statistics...');
    const items = loadMenuItems();
    validateMenuStructure(items);
    getMenuStatistics(items);
  }, 1500);
}

export default loadMenuItems;
