import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../hooks/useNotification';
import { assetService } from '../../services/assetServices';
import EquipmentMasterPage from './EquipmentMasterPage';

vi.mock('../../services/assetServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/assetServices')>();
  return {
    ...actual,
    assetService: {
      ...actual.assetService,
      getEquipmentAssetStats: vi.fn(),
      getEquipmentAssets: vi.fn(),
      diagnoseEquipmentDuplicates: vi.fn(),
      fixEquipmentComponentLinks: vi.fn(),
      syncEquipmentComponentsToFLOC: vi.fn(),
      importEquipmentAssets: vi.fn(),
      exportEquipmentAssets: vi.fn(),
    },
  };
});

describe('EquipmentMasterPage API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads stats and fetches the matching lifecycle list when a stat card is clicked', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([
      { asset_type: 'pump', lifecycle_status: 'Installed', count: 2 },
      { asset_type: 'vessel', lifecycle_status: 'Retired', count: 3 },
    ]);
    vi.mocked(assetService.getEquipmentAssets).mockImplementation(async (params = {}) => ({
      assets:
        params.lifecycle_status === 'Installed'
          ? [{ id: 1, tag_number: 'P-101', name: 'Installed pump', lifecycle_status: 'Installed' }]
          : [{ id: 1, tag_number: 'P-101', name: 'Installed pump', lifecycle_status: 'Installed' }],
      total: params.lifecycle_status === 'Installed' ? 2 : 5,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    }));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <EquipmentMasterPage />
        </NotificationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(assetService.getEquipmentAssetStats).toHaveBeenCalledOnce());
    expect(await screen.findByRole('button', { name: 'Installed Assets: 2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Installed Assets: 2' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await waitFor(() =>
      expect(assetService.getEquipmentAssets).toHaveBeenCalledWith(
        expect.objectContaining({ lifecycle_status: 'Installed', page: 1 })
      )
    );
    expect(screen.getAllByText('Installed pump')).toHaveLength(2);
  }, 15000);

  it('runs maintenance utilities and displays the success result as a toast', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([]);
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(assetService.diagnoseEquipmentDuplicates).mockResolvedValue({
      duplicate_count: 0,
      duplicates: [],
    });
    vi.mocked(assetService.fixEquipmentComponentLinks).mockResolvedValue({
      affected_links: 2,
      dry_run: false,
    });
    vi.mocked(assetService.syncEquipmentComponentsToFLOC).mockResolvedValue({
      checked_assets: 2,
      valid_components: 2,
      orphaned_components: 0,
      broken_floc_links: 0,
      cleared_floc_links: 0,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <EquipmentMasterPage />
        </NotificationProvider>
      </QueryClientProvider>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Diagnose duplicates' }));
    expect(
      await screen.findByText('Duplicate tag diagnosis complete: no duplicates found.')
    ).toBeInTheDocument();
    expect(assetService.diagnoseEquipmentDuplicates).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Fix component links' }));
    expect(
      await screen.findByText('Component links fixed: 2 link(s) updated.')
    ).toBeInTheDocument();
    expect(assetService.fixEquipmentComponentLinks).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: 'Sync components to FLOC' }));
    expect(
      await screen.findByText('FLOC sync complete: 2 valid, 0 orphaned components.')
    ).toBeInTheDocument();
    expect(assetService.syncEquipmentComponentsToFLOC).toHaveBeenCalledWith(false);
  }, 15000);

  it('shows import failure details and lets the user retry the selected workbook', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([]);
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(assetService.importEquipmentAssets)
      .mockRejectedValueOnce(new Error('Expected multipart XLSX upload'))
      .mockResolvedValueOnce({
        created_count: 2,
        updated_count: 1,
        imported_count: 3,
        total_count: 4,
        errors: ['row 5: Equipment Class is required'],
        validate_only: false,
      });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <EquipmentMasterPage />
        </NotificationProvider>
      </QueryClientProvider>
    );

    const workbook = new File(['xlsx'], 'equipment.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    fireEvent.change(screen.getByLabelText('Select XLSX asset import file'), {
      target: { files: [workbook] },
    });

    expect(await screen.findByRole('button', { name: 'Retry equipment.xlsx' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry equipment.xlsx' }));

    expect(await screen.findByRole('region', { name: 'XLSX import results' })).toHaveTextContent(
      '3 of 4 rows imported (2 created, 1 updated).'
    );
    expect(screen.getByText('row 5: Equipment Class is required')).toBeInTheDocument();
    expect(assetService.importEquipmentAssets).toHaveBeenCalledTimes(2);
    expect(vi.mocked(assetService.importEquipmentAssets).mock.calls[1][0]).toBe(workbook);
  }, 15000);

  it('rejects files larger than 100 MB with an error notification', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue([]);
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <EquipmentMasterPage />
        </NotificationProvider>
      </QueryClientProvider>
    );

    const oversizedFile = new File(['oversized'], 'oversized.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    Object.defineProperty(oversizedFile, 'size', {
      value: 101 * 1024 * 1024,
      configurable: true,
    });

    fireEvent.change(screen.getByLabelText('Select XLSX asset import file'), {
      target: { files: [oversizedFile] },
    });

    expect(await screen.findByText('XLSX files must be 100 MB or smaller.')).toBeInTheDocument();
    expect(assetService.importEquipmentAssets).not.toHaveBeenCalled();
  });
});

