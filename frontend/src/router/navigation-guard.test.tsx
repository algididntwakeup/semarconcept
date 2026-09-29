// platform/frontend-mui/src/router/navigation-guard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from './index';

// Helper component to inspect location state in test
const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return (
    <div>
      <div data-testid="pathname">{location.pathname}</div>
      <div data-testid="from-path">
        {(location.state as any)?.from?.pathname || 'none'}
      </div>
    </div>
  );
};

const createMockStore = (authState: {
  isAuthenticated: boolean;
  token: string | null;
  user?: any;
}) => {
  return configureStore({
    reducer: {
      auth: () => ({
        ...authState,
        loading: false,
        error: null,
      }),
    },
  });
};

describe('Navigation Guards & Route Protection', () => {
  it('redirects unauthenticated user from protected route to /login and preserves original location in state.from', () => {
    const store = createMockStore({
      isAuthenticated: false,
      token: null,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/assets/registry']}>
          <Routes>
            <Route
              path="/assets/registry"
              element={
                <ProtectedRoute>
                  <div data-testid="asset-content">Asset Registry Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Protected content should NOT be rendered
    expect(screen.queryByTestId('asset-content')).not.toBeInTheDocument();

    // Should be redirected to /login
    expect(screen.getByTestId('pathname').textContent).toBe('/login');

    // state.from should preserve the deep link /assets/registry
    expect(screen.getByTestId('from-path').textContent).toBe('/assets/registry');
  });

  it('allows authenticated user with valid token to access protected route directly', () => {
    const store = createMockStore({
      isAuthenticated: true,
      token: 'valid-test-bearer-token',
      user: { id: 'usr-1', email: 'engineer@reksolindo.com', is_superuser: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/assets/registry']}>
          <Routes>
            <Route
              path="/assets/registry"
              element={
                <ProtectedRoute>
                  <div data-testid="asset-content">Asset Registry Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Protected content should be rendered
    expect(screen.getByTestId('asset-content')).toBeInTheDocument();
    expect(screen.getByText('Asset Registry Protected Content')).toBeInTheDocument();
  });

  it('preserves deep link search query when redirecting unauthenticated user', () => {
    const store = createMockStore({
      isAuthenticated: false,
      token: null,
    });

    let capturedLocation: any = null;
    const LoginCapture = () => {
      const location = useLocation();
      capturedLocation = location;
      return <div data-testid="login-page">Login Page</div>;
    };

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/assets/registry?status=active&search=pump']}>
          <Routes>
            <Route
              path="/assets/registry"
              element={
                <ProtectedRoute>
                  <div>Protected</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginCapture />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(capturedLocation.pathname).toBe('/login');
    expect(capturedLocation.state?.from?.pathname).toBe('/assets/registry');
    expect(capturedLocation.state?.from?.search).toBe('?status=active&search=pump');
  });
});

import { checkRouteAccess } from '../config/route-manifest';
import type { NavItem } from '../types/navigation';

describe('Menu & Tenant Route Access Guard (checkRouteAccess)', () => {
  const sampleMenu: NavItem[] = [
    {
      id: 'assets',
      title: 'Asset Management',
      type: 'collapse',
      url: '/assets',
      visible: true,
      disabled: false,
      children: [
        {
          id: 'assets-registry',
          title: 'Asset Registry',
          type: 'item',
          url: '/assets/registry',
          visible: true,
          disabled: false,
        },
        {
          id: 'assets-sites',
          title: 'Sites',
          type: 'item',
          url: '/assets/sites',
          visible: false, // Inactive / Hidden
          disabled: false,
        },
        {
          id: 'assets-import-export',
          title: 'Import / Export',
          type: 'item',
          url: '/assets/import-export',
          visible: true,
          disabled: true, // Disabled feature
        },
      ],
    },
    {
      id: 'inspection',
      title: 'Inspection Management',
      type: 'collapse',
      url: '/inspection',
      visible: false, // Inactive entire module for tenant
      disabled: false,
      children: [
        {
          id: 'inspection-plans',
          title: 'Plans',
          type: 'item',
          url: '/inspection/plans',
          visible: true,
          disabled: false,
        },
      ],
    },
  ];

  it('allows access to whitelisted public and dashboard routes regardless of menu', () => {
    expect(checkRouteAccess([], '/', false).allowed).toBe(true);
    expect(checkRouteAccess([], '/dashboard', false).allowed).toBe(true);
    expect(checkRouteAccess([], '/dashboard/overview', false).allowed).toBe(true);
    expect(checkRouteAccess([], '/login', false).allowed).toBe(true);
    expect(checkRouteAccess([], '/access-inactive', false).allowed).toBe(true);
  });

  it('allows active Equipment Master for users regardless of superuser status', () => {
    const activeMenu: NavItem[] = [{
      id: 'risk', title: 'Risk Based Inspection', type: 'collapse', url: '/risk', visible: true,
      children: [{ id: 'equipment-master', title: 'Equipment Master', type: 'item', url: '/risk/equipment-master', visible: true }],
    }];
    expect(checkRouteAccess(activeMenu, '/risk/equipment-master', false).allowed).toBe(true);
    expect(checkRouteAccess(activeMenu, '/risk/equipment-master', true).allowed).toBe(true);
  });

  it('blocks all backlog deep links, including for superusers', () => {
    for (const path of ['/assets/registry', '/inspection/plans', '/risk/matrix', '/admin/users']) {
      expect(checkRouteAccess(sampleMenu, path, false).allowed).toBe(false);
      expect(checkRouteAccess(sampleMenu, path, true).allowed).toBe(false);
    }
  });
});
