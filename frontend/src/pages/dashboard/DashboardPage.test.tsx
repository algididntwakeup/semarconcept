import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer from '../../store/slices/authSlice';
import { assetService } from '../../services/assetServices';
import DashboardPage from './DashboardPage';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('../../services/assetServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/assetServices')>();
  return {
    ...actual,
    assetService: { ...actual.assetService, getEquipmentAssetStats: vi.fn() },
  };
});

const renderDashboard = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        token: 'test-token',
        refreshToken: null,
        user: { id: 1, first_name: 'RBI Operator' } as never,
        tenant: null,
        loading: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </Provider>
  );
};

describe('Dashboard Equipment Master overview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows dynamic equipment classes and opens the filtered asset detail modal', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([
      { class: 'Piping', count: 8 },
      { class: 'Storage Tanks', count: 4 },
    ]);

    renderDashboard();

    expect(await screen.findByRole('button', { name: 'Piping: 8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Storage Tanks: 4' })).toBeInTheDocument();
    for (const inactiveModuleLabel of ['Inspection Plans', 'Work Orders', 'Compliance Rating', 'Asset Inventory']) {
      expect(screen.queryByText(inactiveModuleLabel, { exact: true })).not.toBeInTheDocument();
    }
    expect(assetService.getEquipmentAssetStats).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Piping: 8' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('renders loading placeholders while the equipment summary is fetching', () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getByLabelText(/Loading Equipment class/)).toBeInTheDocument();
  });

  it('shows an error with a retry action when the stats request fails', async () => {
    vi.mocked(assetService.getEquipmentAssetStats)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ class: 'Piping', count: 2 }]);

    renderDashboard();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load Equipment Master overview.');

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Piping: 2' })).toBeInTheDocument());
    expect(assetService.getEquipmentAssetStats).toHaveBeenCalledTimes(2);
  });

  it('navigates to Equipment Master from either dashboard action', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([]);
    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: /open equipment master/i }));
    expect(navigate).toHaveBeenCalledWith('/risk/equipment-master');
  });
});
