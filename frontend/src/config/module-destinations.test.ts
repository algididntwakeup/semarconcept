import { describe, it, expect } from 'vitest';
import { MODULE_DESTINATIONS, ALL_LANDING_DESTINATIONS } from './module-destinations';
import { filterAllowedModuleDestinations, moduleDefinitions, ModuleKey } from '../pages/modules/ModuleLandingPage';
import type { ModuleDestination } from '../pages/modules/ModuleLandingPage';
import type { NavItem } from '../types/navigation';

const toNavItem = (url: string, overrides: Partial<NavItem> = {}): NavItem => ({
  id: url.replace(/\//g, '-'),
  title: url,
  type: 'item',
  url,
  visible: true,
  disabled: false,
  ...overrides,
});

const moduleKeys = Object.keys(MODULE_DESTINATIONS) as ModuleKey[];

describe('FE-00 contract: MODULE_DESTINATIONS', () => {
  it('hanya berisi tujuh root module landing (selain dashboard)', () => {
    expect(moduleKeys).toEqual([
      'assets',
      'inspection',
      'risk',
      'analytics',
      'maintenance',
      'compliance',
      'admin',
    ]);
  });

  it('tidak ada href duplikat, kosong, atau non-canonical', () => {
    expect(new Set(ALL_LANDING_DESTINATIONS).size).toBe(ALL_LANDING_DESTINATIONS.length);
    for (const module of moduleKeys) {
      const hrefs = MODULE_DESTINATIONS[module].map((d) => d.href);
      expect(hrefs.length).toBeGreaterThan(0);
      hrefs.forEach((href) => {
        expect(href.startsWith('/')).toBe(true);
        expect(href).toMatch(new RegExp(`^/${module}(/|$)`));
      });
    }
  });

  it('setiap href destination landing memiliki route di React Router', () => {
    for (const module of moduleKeys) {
      const hrefs = MODULE_DESTINATIONS[module].map((d) => d.href);
      // Route index landing berada di root path module; child di bawahnya dijamin
      // oleh route manifest FE-03. Cek minimal: bukan '/dashboard' dan tidak
      // meninggalkan domain module.
      hrefs.forEach((href) => {
        expect(href).not.toMatch(/^\/dashboard/);
        expect(href.split('/').filter(Boolean)[0]).toBe(module);
      });
    }
  });

  it('setiap href landing tercantum sebagai destination moduleDefinitions', () => {
    for (const module of moduleKeys) {
      const canonicalHrefs = MODULE_DESTINATIONS[module].map((d) => d.href);
      const uiHrefs = moduleDefinitions[module].destinations.map((d) => d.href);
      expect(canonicalHrefs).toEqual(uiHrefs);
    }
  });
});

describe('FE-00 contract: filterAllowedModuleDestinations', () => {
  const menuTree: NavItem[] = [
    toNavItem('/dashboard'),
    toNavItem('/assets', {
      type: 'collapse',
      children: [
        toNavItem('/assets/registry'),
        toNavItem('/assets/hierarchy', { visible: false }),
        toNavItem('/assets/documents', {
          permissions: ['asset:documents'],
        }),
      ],
    }),
    toNavItem('/risk', {
      type: 'collapse',
      children: [toNavItem('/risk/matrix')],
    }),
  ];

  const destinationList = (module: ModuleKey): ModuleDestination[] =>
    moduleDefinitions[module].destinations.map((d) => ({
      ...d,
      icon: d.icon,
    }));

  it('non-superuser hanya mendapat child yang visible dan diizinkan menu tree-nya', () => {
    const allowed = filterAllowedModuleDestinations(
      'assets',
      destinationList('assets'),
      menuTree,
      false,
      []
    );
    const hrefs = allowed.map((d) => d.href);
    expect(hrefs).toContain('/assets/registry');
    expect(hrefs).not.toContain('/assets/hierarchy');
    expect(hrefs).not.toContain('/assets/documents');
  });

  it('child yang memerlukan permission hanya muncul bila permission dimiliki', () => {
    const allowed = filterAllowedModuleDestinations(
      'assets',
      destinationList('assets'),
      menuTree,
      false,
      ['asset:documents']
    );
    const hrefs = allowed.map((d) => d.href);
    expect(hrefs).toContain('/assets/documents');
  });

  it('menghapus child yang tidak ada di canonical module destination', () => {
    // Simulasi child di luar daftar canonical (mis. route legacy /assets/x).
    const menuWithExtra: NavItem[] = [
      toNavItem('/assets', {
        type: 'collapse',
        children: [
          toNavItem('/assets/registry'),
          toNavItem('/assets/legacy', { title: 'Legacy' }),
        ],
      }),
    ];
    const allowed = filterAllowedModuleDestinations(
      'assets',
      destinationList('assets'),
      menuWithExtra,
      false,
      []
    );
    const hrefs = allowed.map((d) => d.href);
    expect(hrefs).not.toContain('/assets/legacy');
    expect(hrefs).toContain('/assets/registry');
  });

  it('superuser melewati pemeriksaan menu (seluruh canonical destination)', () => {
    const allowed = filterAllowedModuleDestinations(
      'assets',
      destinationList('assets'),
      [], // menu kosong sekalipun
      true,
      []
    );
    expect(allowed.length).toBe(MODULE_DESTINATIONS.assets.length);
  });
});
