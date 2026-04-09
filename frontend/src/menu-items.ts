// platform/frontend-mui/src/menu-items.ts

import { NavItem } from './types/navigation';
import { loadMenuItems } from './config/menu-loader';

/**
 * Menu items for the Reksolindo Enterprise Asset Management System
 * 
 * This file now loads menu items from JSON configuration instead of
 * hardcoded TypeScript arrays. This approach provides:
 * 
 * 1. Better separation of data and code
 * 2. Easier configuration management
 * 3. Future database integration readiness
 * 4. Runtime menu modifications
 * 5. Permission-based filtering
 * 
 * To modify menu items:
 * - Edit /src/config/menu-items.json for structure changes
 * - Edit /src/config/icon-mapping.ts to add new icons
 * - Use loadMenuItems() with user permissions for filtering
 */

// Load default menu items (without permission filtering)
const menuItems: NavItem[] = loadMenuItems();

export default menuItems;

// Export the loader function for components that need permission filtering
export { loadMenuItems };

// Export helper functions for menu management
export {
  getMenuMetadata,
  findMenuItemById,
  getMenuItemPath,
  validateMenuStructure
} from './config/menu-loader';