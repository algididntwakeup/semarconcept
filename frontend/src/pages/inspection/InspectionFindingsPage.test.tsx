// platform/frontend-mui/src/pages/inspection/InspectionFindingsPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InspectionFindingsPage from './InspectionFindingsPage';
import { inspectionService } from '../../services/inspectionService';

vi.mock('../../services/inspectionService', () => ({
  inspectionService: {
    getFindings: vi.fn(),
    getStatistics: vi.fn(),
    createFinding: vi.fn(),
    updateFinding: vi.fn(),
    deleteFinding: vi.fn(),
  },
}));

describe('InspectionFindingsPage with TanStack Query', () => {
  let queryClient: QueryClient;

  const mockFindings = [
    {
      id: 'FND-001',
      title: 'Pipe Wall Thinning',
      description: 'Localized wall thinning detected by ultrasonic inspection',
      severity: 'critical' as const,
      category: 'Corrosion',
      assetId: 'AST-101',
      assetName: 'Crude Pipe 8"',
      location: 'Refinery Unit 01',
      inspector: 'Budi Santoso',
      inspectionDate: '2026-08-25',
      status: 'open' as const,
      priority: 'urgent' as const,
      photos: 2,
      attachments: 1,
    },
    {
      id: 'FND-002',
      title: 'Flange Gasket Leakage',
      description: 'Minor gas leakage at bolt connection',
      severity: 'high' as const,
      category: 'Mechanical',
      assetId: 'AST-202',
      assetName: 'Gas Separator',
      location: 'Plant Area 2',
      inspector: 'Ahmad Fauzi',
      inspectionDate: '2026-08-28',
      status: 'in_progress' as const,
      priority: 'high' as const,
      photos: 1,
      attachments: 0,
    },
  ];

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
        <InspectionFindingsPage />
      </QueryClientProvider>
    );
  };

  it('renders hero title and findings rows when query succeeds', async () => {
    vi.mocked(inspectionService.getFindings).mockResolvedValue({
      data: mockFindings,
      total: 2,
    });
    vi.mocked(inspectionService.getStatistics).mockResolvedValue({
      totalPlans: 10,
      activePlans: 8,
      overduePlans: 2,
      totalFindings: 2,
      criticalFindings: 1,
      openFindings: 1,
      resolvedFindings: 0,
      complianceRate: 95,
    });

    renderComponent();

    expect(screen.getByRole('heading', { level: 1, name: /Audit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Finding/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pipe Wall Thinning')).toBeInTheDocument();
      expect(screen.getByText('Flange Gasket Leakage')).toBeInTheDocument();
    });
  });

  it('renders error banner and retry button when query fails', async () => {
    vi.mocked(inspectionService.getFindings).mockRejectedValue(new Error('Failed to fetch findings'));
    vi.mocked(inspectionService.getStatistics).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat temuan inspeksi/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
    });
  });

  it('filters findings by search term interactively', async () => {
    vi.mocked(inspectionService.getFindings).mockImplementation(async (params) => {
      if (params?.search === 'Separator') {
        return {
          data: [mockFindings[1]],
          total: 1,
        };
      }
      return { data: mockFindings, total: 2 };
    });
    vi.mocked(inspectionService.getStatistics).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pipe Wall Thinning')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search findings, equipment, or location.../i);
    fireEvent.change(searchInput, { target: { value: 'Separator' } });

    await waitFor(() => {
      expect(screen.getByText('Flange Gasket Leakage')).toBeInTheDocument();
      expect(screen.queryByText('Pipe Wall Thinning')).not.toBeInTheDocument();
    });
  });
});
