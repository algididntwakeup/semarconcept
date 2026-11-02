import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import MainLayout from './MainLayout';
import { ThemeProvider } from '../contexts/ThemeContext';
import authReducer from '../store/slices/authSlice';

// Mock MenusAPI
vi.mock('../lib/api/endpoints', () => ({
  MenusAPI: {
    getUserMenuTree: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 1,
          first_name: 'Asset',
          last_name: 'Manager',
          email: 'admin@semar.com',
          is_superuser: true,
          roles: ['Super Admin'],
        },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  });

describe('MainLayout Dark Mode Toggle in Profile Dropdown', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.body.className = '';
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('renders the user profile menu and toggles Dark Mode with dynamic icon and switch', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light">
            <MemoryRouter initialEntries={['/dashboard']}>
              <MainLayout />
            </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    );

    // Profile button (shows initials "AM")
    const profileBtn = screen.getByRole('button', { name: /user profile menu/i });
    expect(profileBtn).toBeInTheDocument();

    // Initially light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click profile button to open dropdown
    fireEvent.click(profileBtn);

    // Verify Dark Mode row exists
    const darkModeRow = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(darkModeRow).toBeInTheDocument();
    expect(darkModeRow).toHaveTextContent('Dark Mode');

    // Toggle Dark Mode
    fireEvent.click(darkModeRow);

    // Verify dark mode class added to html root and body
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.body.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Toggle back to Light Mode
    fireEvent.click(darkModeRow);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.body.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});

