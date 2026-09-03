// platform/frontend-mui/src/pages/assets/AssetRegistryPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssetRegistryPage from './AssetRegistryPage';
import { assetService } from '../../services/assetServices';

// Mock assetService
vi.mock('../../services/assetServices', () => ({
  assetService: {
    getAssets: vi.fn(),
    deleteAsset: vi.fn(),
  },
}));

// Mock AssetFormModal
vi.mock('../../components/AssetFormModal', () => ({
  default: () => <div data-testid="mock-asset-form-modal" />,
  ASSET_LEVELS: {
    pump: { label: 'Pump', group: 'Rotating Equipment', placeholder: 'e.g. Pump', allowedParentTypes: [] },
    vessel: { label: 'Vessel', group: 'Mechanical Equipment', placeholder: 'e.g. Vessel', allowedParentTypes: [] },
  },
}));

describe('AssetRegistryPage with TanStack Query', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AssetRegistryPage />
      </QueryClientProvider>
    );
  };

  it('renders loading state initially while query is pending', () => {
    vi.mocked(assetService.getAssets).mockReturnValue(new Promise(() => {})); // Never resolves
    renderComponent();

    expect(screen.getByText(/Loading assets.../i)).toBeInTheDocument();
  });

  it('renders asset rows when query succeeds', async () => {
    const mockAssets = [
      {
        id: 'AST-001',
        name: 'Centrifugal Pump A',
        tagNumber: 'P-101A',
        type: 'pump',
        status: 'active',
        criticality: 4,
        health: { overallScore: 92 },
        location: { building: 'Area 1' },
      },
      {
        id: 'AST-002',
        name: 'HP Flash Vessel',
        tagNumber: 'V-201',
        type: 'vessel',
        status: 'maintenance',
        criticality: 5,
        health: { overallScore: 65 },
        location: { building: 'Area 2' },
      },
    ];

    vi.mocked(assetService.getAssets).mockResolvedValue({
      data: mockAssets,
      total: 2,
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Centrifugal Pump A')).toBeInTheDocument();
      expect(screen.getByText('HP Flash Vessel')).toBeInTheDocument();
    });

    expect(screen.getByText('P-101A')).toBeInTheDocument();
    expect(screen.getByText('V-201')).toBeInTheDocument();
  });

  it('renders error state and retry button when query fails', async () => {
    vi.mocked(assetService.getAssets).mockRejectedValue(new Error('Network error loading assets'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load assets/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error loading assets/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('filters assets by search term interactively', async () => {
    const mockAssets = [
      { id: 'AST-001', name: 'Alpha Pump', tagNumber: 'P-101', type: 'pump', status: 'active', criticality: 3 },
      { id: 'AST-002', name: 'Beta Compressor', tagNumber: 'K-201', type: 'compressor', status: 'active', criticality: 4 },
    ];

    vi.mocked(assetService.getAssets).mockResolvedValue({ data: mockAssets } as any);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alpha Pump')).toBeInTheDocument();
      expect(screen.getByText('Beta Compressor')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by ID or name.../i);
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    expect(screen.getByText('Alpha Pump')).toBeInTheDocument();
    expect(screen.queryByText('Beta Compressor')).not.toBeInTheDocument();
  });
});
