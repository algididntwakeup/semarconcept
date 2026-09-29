// platform/frontend-mui/src/config/route-manifest.test.ts
import { describe, it, expect } from 'vitest';
import {
  ROUTE_MANIFEST,
  getAllRoutes,
  getRouteById,
  getRouteByPath,
  isPathValid,
  getLandingDestinations,
  isPathProtected,
  getRequiredPermissions,
} from './route-manifest';
import { MODULE_DESTINATIONS, ALL_LANDING_DESTINATIONS } from './module-destinations';
import menuItemsData from './menu-items.json';
import { iconExists, getIconByName } from './icon-mapping';

describe('Route Manifest Contract Tests', () => {
  it('Contract 1: guarantees unique semantic IDs across all routes', () => {
    const ids = ROUTE_MANIFEST.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('Contract 2: guarantees unique canonical paths across all routes', () => {
    const paths = ROUTE_MANIFEST.map((r) => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('Contract 3: guarantees bidirectional parity between manifest landing destinations and module-destinations', () => {
    const manifestLandingRoutes = ROUTE_MANIFEST.filter((r) => r.isLandingDestination);
    const manifestLandingPaths = manifestLandingRoutes.map((r) => r.path);

    // Every landing route in manifest must exist in ALL_LANDING_DESTINATIONS
    manifestLandingPaths.forEach((path) => {
      expect(ALL_LANDING_DESTINATIONS).toContain(path);
    });

    // Every destination in ALL_LANDING_DESTINATIONS must exist in manifest as a landing destination
    ALL_LANDING_DESTINATIONS.forEach((path) => {
      expect(manifestLandingPaths).toContain(path);
    });

    expect(manifestLandingPaths.length).toBe(ALL_LANDING_DESTINATIONS.length);
  });

  it('Contract 4: guarantees every module in module-destinations maps 1:1 with getLandingDestinations(module)', () => {
    const modules = Object.keys(MODULE_DESTINATIONS) as (keyof typeof MODULE_DESTINATIONS)[];
    modules.forEach((module) => {
      const derivedDestinations = getLandingDestinations(module);
      const configuredDestinations = MODULE_DESTINATIONS[module];

      expect(derivedDestinations.length).toBe(configuredDestinations.length);

      derivedDestinations.forEach((r, idx) => {
        expect(configuredDestinations[idx].href).toBe(r.path);
        expect(configuredDestinations[idx].title).toBe(r.title);
      });
    });
  });

  it('Contract 5: guarantees all menu items with URLs in menu-items.json map to valid routes', () => {
    const extractMenuUrls = (items: any[]): string[] => {
      let urls: string[] = [];
      items.forEach((item) => {
        if (item.url) urls.push(item.url);
        if (item.children && Array.isArray(item.children)) {
          urls = urls.concat(extractMenuUrls(item.children));
        }
      });
      return urls;
    };

    const allMenuUrls = extractMenuUrls(menuItemsData.menuItems);
    expect(allMenuUrls.length).toBeGreaterThan(0);

    const invalidUrls: string[] = [];
    allMenuUrls.forEach((url) => {
      if (!isPathValid(url)) {
        invalidUrls.push(url);
      }
    });

    expect(invalidUrls).toEqual([]);
  });

  it('exposes Risk Management beside Dashboard and Equipment Master within Risk', () => {
    const orderedMenus = [...menuItemsData.menuItems].sort((left, right) => left.order - right.order);
    const dashboardIndex = orderedMenus.findIndex((item) => item.id === 'dashboard');
    const risk = orderedMenus[dashboardIndex + 1];
    const equipmentMaster = risk.children?.find((item) => item.id === 'equipment-master');

    expect(risk).toMatchObject({ id: 'risk', title: 'Risk & Reliability', url: '/risk', order: 2 });
    expect(equipmentMaster).toMatchObject({
      id: 'equipment-master',
      title: 'Equipment Master',
      type: 'item',
      url: '/risk/equipment-master',
      order: 1,
    });
    expect(getRouteByPath(equipmentMaster!.url)?.id).toBe('risk.equipment-master');
  });

  it('Contract 6: guarantees route icons resolve in icon-mapping', () => {
    const routesWithIcons = ROUTE_MANIFEST.filter((r) => r.icon);
    routesWithIcons.forEach((r) => {
      const resolved = getIconByName(r.icon!);
      expect(resolved).toBeDefined();
    });
  });

  it('Contract 7: helper functions getRouteById and getRouteByPath work with aliases', () => {
    // Exact lookup
    const assetRegistry = getRouteById('assets.registry');
    expect(assetRegistry).toBeDefined();
    expect(assetRegistry?.path).toBe('/assets/registry');

    // Canonical path lookup
    expect(getRouteByPath('/assets/registry')?.id).toBe('assets.registry');

    // Alias lookup (legacy /asset/registry)
    expect(getRouteByPath('/asset/registry')?.id).toBe('assets.registry');

    // Dashboard alias lookup (/dashboard/overview)
    expect(getRouteByPath('/dashboard/overview')?.id).toBe('dashboard.home');

    // Parameterized path matching
    expect(isPathValid('/reset-password/abc-123-xyz')).toBe(true);
    expect(isPathValid('/content/entry/edit/42')).toBe(true);
    expect(isPathValid('/completely/nonexistent/path')).toBe(false);
  });

  it('Contract 8: protection and permission checking logic matches manifest specification', () => {
    // Auth routes are unprotected
    expect(isPathProtected('/login')).toBe(false);
    expect(isPathProtected('/register')).toBe(false);
    expect(isPathProtected('/forgot-password')).toBe(false);

    // Core app routes are protected
    expect(isPathProtected('/dashboard')).toBe(true);
    expect(isPathProtected('/assets/registry')).toBe(true);

    // Required permissions retrieval
    expect(getRequiredPermissions('/assets/registry')).toContain('asset:registry');
    expect(getRequiredPermissions('/admin/users')).toContain('admin:users');
    expect(getRequiredPermissions('/login')).toEqual([]);
  });
});
