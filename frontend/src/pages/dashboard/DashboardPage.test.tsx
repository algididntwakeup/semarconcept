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

  it('shows lifecycle totals from Equipment Master stats and no unrelated module cards', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([
      { asset_type: 'pump', lifecycle_status: 'Installed', count: 8 },
      { asset_type: 'vessel', lifecycle_status: 'Installed', count: 4 },
      { asset_type: 'pump', lifecycle_status: 'Sent to repair', count: 3 },
      { asset_type: 'vessel', lifecycle_status: 'Retired', count: 2 },
      { asset_type: 'tank', lifecycle_status: 'Condemned', count: 1 },
    ]);

    renderDashboard();

    expect(await screen.findByTestId('equipment-count-total-equipment')).toHaveTextContent('18');
    expect(screen.getByTestId('equipment-count-installed')).toHaveTextContent('12');
    expect(screen.getByTestId('equipment-count-sent-to-repair')).toHaveTextContent('3');
    expect(screen.getByTestId('equipment-count-retired')).toHaveTextContent('2');
    expect(screen.getByTestId('equipment-count-condemned')).toHaveTextContent('1');
    for (const inactiveModuleLabel of ['Inspection Plans', 'Work Orders', 'Compliance Rating', 'Asset Inventory']) {
      expect(screen.queryByText(inactiveModuleLabel, { exact: true })).not.toBeInTheDocument();
    }
    expect(assetService.getEquipmentAssetStats).toHaveBeenCalledOnce();
  });

  it('renders loading placeholders while the equipment summary is fetching', () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getAllByLabelText(/Loading/)).toHaveLength(5);
  });

  it('shows an error with a retry action when the stats request fails', async () => {
    vi.mocked(assetService.getEquipmentAssetStats)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ asset_type: 'pump', lifecycle_status: 'Installed', count: 2 }]);

    renderDashboard();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load Equipment Master overview.');

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(screen.getByTestId('equipment-count-total-equipment')).toHaveTextContent('2'));
    expect(assetService.getEquipmentAssetStats).toHaveBeenCalledTimes(2);
  });

  it('navigates to Equipment Master from either dashboard action', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([]);
    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: /open equipment master/i }));
    expect(navigate).toHaveBeenCalledWith('/risk/equipment-master');
  });
});
