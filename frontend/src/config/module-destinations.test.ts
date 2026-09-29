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
  it('hanya mengaktifkan destination RBI Equipment Master', () => {
    expect(moduleKeys).toEqual([
      'assets',
      'inspection',
      'risk',
      'analytics',
      'maintenance',
      'compliance',
      'admin',
    ]);
    expect(MODULE_DESTINATIONS.risk).toEqual([
      { title: 'Equipment Master', href: '/risk/equipment-master' },
    ]);
    for (const module of moduleKeys.filter((key) => key !== 'risk')) {
      expect(MODULE_DESTINATIONS[module]).toEqual([]);
    }
  });

  it('tidak ada href duplikat, kosong, atau non-canonical', () => {
    expect(new Set(ALL_LANDING_DESTINATIONS).size).toBe(ALL_LANDING_DESTINATIONS.length);
    for (const module of moduleKeys) {
      const hrefs = MODULE_DESTINATIONS[module].map((d) => d.href);
        expect(hrefs.length).toBe(module === 'risk' ? 1 : 0);
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
      const uiHrefs = moduleDefinitions[module].destinations
        .map((d) => d.href)
        .filter((href) => canonicalHrefs.includes(href));
      expect(canonicalHrefs).toEqual(uiHrefs);
    }
  });
});

describe('FE-00 contract: filterAllowedModuleDestinations', () => {
  const menuTree: NavItem[] = [
    toNavItem('/dashboard'),
    toNavItem('/risk', {
      type: 'collapse',
      children: [toNavItem('/risk/equipment-master', { permissions: ['risk:view'] })],
    }),
  ];

  const destinationList = (module: ModuleKey): ModuleDestination[] =>
    moduleDefinitions[module].destinations.map((d) => ({
      ...d,
      icon: d.icon,
    }));

  it('non-superuser hanya mendapat Equipment Master yang visible dan diizinkan', () => {
    const allowed = filterAllowedModuleDestinations(
      'risk',
      destinationList('risk'),
      menuTree,
      false,
      ['risk:view']
    );
    const hrefs = allowed.map((d) => d.href);
    expect(hrefs).toEqual(['/risk/equipment-master']);
  });

  it('Equipment Master ditolak bila permission tidak dimiliki', () => {
    const allowed = filterAllowedModuleDestinations(
      'risk',
      destinationList('risk'),
      menuTree,
      false,
      []
    );
    const hrefs = allowed.map((d) => d.href);
    expect(hrefs).toEqual([]);
  });

  it('menghapus child yang tidak ada di canonical module destination', () => {
    // Simulasi child di luar daftar canonical (mis. route legacy /assets/x).
    const menuWithExtra: NavItem[] = [
      toNavItem('/risk', {
        type: 'collapse',
        children: [
          toNavItem('/risk/equipment-master'),
          toNavItem('/risk/legacy', { title: 'Legacy' }),
        ],
      }),
    ];
    const allowed = filterAllowedModuleDestinations(
      'risk',
      destinationList('risk'),
      menuWithExtra,
      false,
      []
    );
    const hrefs = allowed.map((d) => d.href);
    expect(hrefs).not.toContain('/risk/legacy');
    expect(hrefs).toContain('/risk/equipment-master');
  });

  it('superuser tetap hanya mendapat destination Equipment Master yang aktif', () => {
    const allowed = filterAllowedModuleDestinations(
      'risk',
      destinationList('risk'),
      [], // menu kosong sekalipun
      true,
      []
    );
    expect(allowed.map((d) => d.href)).toEqual(['/risk/equipment-master']);
  });
});
