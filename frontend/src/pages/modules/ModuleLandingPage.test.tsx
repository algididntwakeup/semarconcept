import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ModuleLandingPage from './ModuleLandingPage';
import { MODULE_DESTINATIONS } from '../../config/module-destinations';
import { NavigationContext } from '../../config/navigation-context';
import type { NavItem } from '../../types/navigation';
import authReducer from '../../store/slices/authSlice';

const makeRoot = (moduleUrl: string, childHrefs: string[]): NavItem => ({
  id: moduleUrl.replace(/\//g, '-'),
  title: moduleUrl,
  type: 'collapse',
  url: moduleUrl,
  visible: true,
  disabled: false,
  children: childHrefs.map((href) => ({
    id: href.replace(/\//g, '-'),
    title: href.split('/').pop() ?? href,
    type: 'item',
    url: href,
    visible: true,
    disabled: false,
  })),
});

const fullMenu = (moduleKey: string): NavItem[] => [
  makeRoot(
    `/${moduleKey}`,
    MODULE_DESTINATIONS[moduleKey as keyof typeof MODULE_DESTINATIONS].map((d) => d.href)
  ),
];

const navValue = (topLevelMenuItems: NavItem[]) => ({
  sidebarOpen: true,
  setSidebarOpen: vi.fn(),
  mobileOpen: false,
  setMobileOpen: vi.fn(),
  activeHorizontalTab: 0,
  setActiveHorizontalTab: vi.fn(),
  openCollapseMenus: {},
  setOpenCollapseMenus: vi.fn(),
  topLevelMenuItems,
  handleMenuItemClick: vi.fn(),
  toggleCollapseMenu: vi.fn(),
});

const renderLanding = (
  moduleKey: string,
  options: { menu?: NavItem[]; permissions?: string[]; superuser?: boolean } = {}
) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        token: 't',
        refreshToken: null,
        user: {
          id: 1,
          permissions: options.permissions ?? [],
          is_superuser: options.superuser ?? false,
        },
        tenant: null,
        loading: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
      },
    },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });

  return render(
    <Provider store={store}>
      <NavigationContext.Provider value={navValue(options.menu ?? fullMenu(moduleKey))}>
        <MemoryRouter>
          <ModuleLandingPage module={moduleKey as never} />
        </MemoryRouter>
      </NavigationContext.Provider>
    </Provider>
  );
};

describe('ModuleLandingPage a11y & keyboard', () => {
  it('menampilkan Equipment Master sebagai satu-satunya destination RBI dan mendukung keyboard', async () => {
    const user = userEvent.setup();
    renderLanding('risk');

    const canonical = MODULE_DESTINATIONS.risk;
    for (const dest of canonical) {
      const link = screen.getByRole('link', { name: new RegExp(dest.title, 'i') });
      expect(link).toHaveAttribute('href', dest.href);
    }
    expect(screen.getAllByRole('link')).toHaveLength(1);

    await user.tab();
    const active = document.activeElement as HTMLElement | null;
    expect(active?.tagName.toLowerCase()).toBe('a');
    expect(active?.getAttribute('href')).toBe(canonical[0].href);
  });

  it('menampilkan accessible empty-state saat menu RBI tidak memiliki Equipment Master', () => {
    renderLanding('risk', {
      menu: [{ ...makeRoot('/risk', ['/risk/matrix']) }].filter(() => false), // empty menu
      permissions: [],
      superuser: false,
    });
    // Dengan menu kosong dan non-superuser, landing tidak menampilkan card.
    expect(screen.getByText(/tidak ada area kerja yang dapat diakses/i)).toBeInTheDocument();
  });
});

describe('ModuleLandingPage permission filtering', () => {
  it('hanya menampilkan Equipment Master bila ada di menu user', () => {
    renderLanding('risk', {
      menu: [makeRoot('/risk', ['/risk/equipment-master'])],
      permissions: [],
    });
    expect(screen.getByRole('link', { name: /Equipment Master/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Risk Matrix/i })).not.toBeInTheDocument();
  });

  it('empty-state saat menu tidak memuat root RBI', () => {
    renderLanding('risk', {
      menu: [makeRoot('/dashboard', [])],
      permissions: [],
    });
    expect(screen.getByText(/tidak ada area kerja yang dapat diakses/i)).toBeInTheDocument();
  });

  it('superuser tetap melihat Equipment Master saja', () => {
    renderLanding('risk', {
      menu: [makeRoot('/risk', ['/risk/equipment-master'])],
      superuser: true,
    });
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Equipment Master/i })).toBeInTheDocument();
  });
});
