import { describe, expect, it } from 'vitest';
import { loadMenuItems, restrictToActiveNavigation } from './menu-loader';
import type { NavItem } from '../types/navigation';

describe('active navigation scope', () => {
  it('fallback exposes Dashboard and RBI Equipment Master only', () => {
    const menu = loadMenuItems();

    expect(menu.map(({ id, url }) => ({ id, url }))).toEqual([
      { id: 'dashboard', url: '/dashboard' },
      { id: 'risk', url: '/risk' },
    ]);
    expect(menu[0].children).toBeUndefined();
    expect(menu[1].children?.map(({ id, url }) => ({ id, url }))).toEqual([
      { id: 'equipment-master', url: '/risk/equipment-master' },
    ]);
  });

  it('filters old database menu entries, even if they are still active in API data', () => {
    const oldMenus: NavItem[] = [
      {
        id: 'dashboard', title: 'Dashboard', type: 'collapse', url: '/dashboard', visible: true,
        children: [{ id: 'dashboard-asset', title: 'Asset dashboard', type: 'item', url: '/dashboard/asset', visible: true }],
      },
      {
        id: 'assets', title: 'Assets', type: 'collapse', url: '/assets', visible: true,
        children: [{ id: 'asset-registry', title: 'Asset Registry', type: 'item', url: '/assets/registry', visible: true }],
      },
      {
        id: 'risk', title: 'Risk', type: 'collapse', url: '/risk', visible: true,
        children: [
          { id: 'equipment-master', title: 'Equipment Master', type: 'item', url: '/risk/equipment-master', visible: true },
          { id: 'risk-matrix', title: 'Risk Matrix', type: 'item', url: '/risk/matrix', visible: true },
        ],
      },
    ];

    expect(restrictToActiveNavigation(oldMenus).map((item) => item.id)).toEqual(['dashboard', 'risk']);
    expect(restrictToActiveNavigation(oldMenus)[1].children?.map((item) => item.id)).toEqual([
      'equipment-master',
    ]);
  });
});
