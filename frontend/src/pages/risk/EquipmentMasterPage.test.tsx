import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      purgeAllEquipmentAssets: vi.fn(),
      createEquipmentAsset: vi.fn(),
    },
  };
});

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <EquipmentMasterPage />
      </NotificationProvider>
    </QueryClientProvider>
  );
};

const openMaintenanceMenu = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Maintenance actions' }));

const openDataTransferMenu = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Data transfer' }));

describe('EquipmentMasterPage API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the stat cards above the equipment register with the toolbar inside the table header', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({
      classes: [{ class: 'Piping', count: 2 }],
      funcloc: { with: 1, without: 1 },
    });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    renderPage();

    const card = await screen.findByRole('button', { name: 'Piping: 2' });
    const registers = screen.getAllByRole('region', { name: 'Equipment register' });
    const register = registers[registers.length - 1];
    expect(card.compareDocumentPosition(register) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Toolbar lives in the grid header, next to the search box.
    expect(register.contains(screen.getByRole('button', { name: 'Maintenance actions' }))).toBe(true);
    expect(register.contains(screen.getByRole('button', { name: 'Data transfer' }))).toBe(true);
    expect(register.contains(screen.getByRole('button', { name: 'New Equipment' }))).toBe(true);
  }, 15000);

  it('downloads selected XLSX and CSV formats from the Data Transfer dropdown', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    const blob = new Blob(['equipment export']);
    vi.mocked(assetService.exportEquipmentAssets)
      .mockResolvedValueOnce({ blob, filename: 'equipment-master.xlsx' })
      .mockResolvedValueOnce({ blob, filename: 'equipment-master.csv' });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:equipment-export'),
      revokeObjectURL: vi.fn(),
    });
    let downloadedFilename: string | undefined;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloadedFilename = this.download;
    });

    renderPage();

    const transferButton = screen.getByRole('button', { name: 'Data transfer' });
    expect(transferButton).toHaveAttribute('aria-expanded', 'false');

    openDataTransferMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Export XLSX' }));
    await waitFor(() => expect(assetService.exportEquipmentAssets).toHaveBeenNthCalledWith(1, 'xlsx'));
    expect(downloadedFilename).toBe('equipment-master.xlsx');
    expect(await screen.findByText('Equipment export downloaded.')).toBeInTheDocument();

    openDataTransferMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Export CSV' }));
    await waitFor(() => expect(assetService.exportEquipmentAssets).toHaveBeenNthCalledWith(2, 'csv'));
    expect(downloadedFilename).toBe('equipment-master.csv');

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  }, 15000);

  it('closes the Data Transfer menu without exporting when dismissed', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    renderPage();

    openDataTransferMenu();
    expect(await screen.findByRole('menu', { name: 'Data transfer' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() =>
      expect(screen.queryByRole('menu', { name: 'Data transfer' })).not.toBeInTheDocument()
    );
    expect(assetService.exportEquipmentAssets).not.toHaveBeenCalled();
  }, 15000);

  it('loads stats and fetches the matching equipment class when a stat card is clicked', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({
      classes: [
        { class: 'Piping', count: 2 },
        { class: 'Storage Tanks', count: 3 },
      ],
      funcloc: { with: 4, without: 1 },
    });
    vi.mocked(assetService.getEquipmentAssets).mockImplementation(async (params = {}) => ({
      assets:
        params.equipment_class === 'Piping'
          ? [{ id: 1, tag_number: 'P-101', name: 'Installed pump', lifecycle_status: 'Installed' }]
          : [{ id: 1, tag_number: 'P-101', name: 'Installed pump', lifecycle_status: 'Installed' }],
      total: params.equipment_class === 'Piping' ? 2 : 5,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    }));

    renderPage();

    await waitFor(() => expect(assetService.getEquipmentAssetStats).toHaveBeenCalledOnce());
    expect(await screen.findByRole('button', { name: 'Piping: 2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Piping: 2' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await waitFor(() =>
      expect(assetService.getEquipmentAssets).toHaveBeenCalledWith(
        expect.objectContaining({ equipment_class: 'Piping', page: 1 })
      )
    );
    expect(screen.getAllByText('P-101')).toHaveLength(2);
  }, 15000);

  it('runs maintenance utilities from the Maintenance dropdown and shows toasts', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
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

    renderPage();

    openMaintenanceMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Diagnose duplicates' }));
    expect(
      await screen.findByText('Duplicate tag diagnosis complete: no duplicates found.')
    ).toBeInTheDocument();
    expect(assetService.diagnoseEquipmentDuplicates).toHaveBeenCalledOnce();

    openMaintenanceMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Fix component links' }));
    expect(
      await screen.findByText('Component links fixed: 2 link(s) updated.')
    ).toBeInTheDocument();
    expect(assetService.fixEquipmentComponentLinks).toHaveBeenCalledWith(false);

    openMaintenanceMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sync components to FLOC' }));
    expect(
      await screen.findByText('FLOC sync complete: 2 valid, 0 orphaned components.')
    ).toBeInTheDocument();
    expect(assetService.syncEquipmentComponentsToFLOC).toHaveBeenCalledWith(false);
  }, 15000);

  it('keeps Manage Asset and Add Component working from the Manage dropdown', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({
      classes: [{ class: 'Piping (PI)', count: 1 }],
      funcloc: { with: 1, without: 0 },
    });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [
        {
          id: 7,
          tag_number: 'P-101',
          name: 'Feed Pump',
          description: 'Main process pump',
          asset_class: 'Piping (PI)',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
    const assignSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign: assignSpy },
    });

    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Manage P-101' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Manage Asset' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Feed Pump')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Manage P-101' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Add Component' }));
    expect(assignSpy).toHaveBeenCalledWith('/assets/hierarchy');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  }, 15000);

  it('shows a placeholder toast and captures the id for the Manage → Edit Asset wiring', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({
      classes: [{ class: 'Piping (PI)', count: 1 }],
      funcloc: { with: 1, without: 0 },
    });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [{ id: 7, tag_number: 'P-101', name: 'Feed Pump', asset_class: 'Piping (PI)' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Manage P-101' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit Asset' }));
    expect(
      await screen.findByText('Feature Edit Asset is under development')
    ).toBeInTheDocument();
  }, 15000);

  it('shows a placeholder toast for Lifecycle row actions', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({
      classes: [{ class: 'Piping (PI)', count: 1 }],
      funcloc: { with: 1, without: 0 },
    });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [{ id: 7, tag_number: 'P-101', name: 'Feed Pump', asset_class: 'Piping (PI)' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Lifecycle P-101' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Relocate' }));
    expect(await screen.findByText('Feature Relocate is under development')).toBeInTheDocument();
  }, 15000);

  it('shows file preview with name and size and allows clearing with the X button', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    renderPage();

    const workbook = new File(['xlsx data'], 'equipment.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    fireEvent.change(screen.getByLabelText('Select XLSX or CSV asset import file'), {
      target: { files: [workbook] },
    });
    expect(screen.getByText('equipment.xlsx')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Import' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove file' }));
    expect(screen.queryByText('equipment.xlsx')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit Import' })).not.toBeInTheDocument();
  });

  it('accepts a CSV file through the hidden import input and uploads it', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(assetService.importEquipmentAssets).mockResolvedValue({
      created_count: 2,
      updated_count: 0,
      imported_count: 2,
      total_count: 2,
      errors: [],
      validate_only: false,
    });

    renderPage();

    const csv = new File(['Asset ID/Tag Number,Equipment Class\nTAG-1,PI\n'], 'equipment.csv', {
      type: 'text/csv',
    });
    fireEvent.change(screen.getByLabelText('Select XLSX or CSV asset import file'), {
      target: { files: [csv] },
    });
    expect(screen.getByText('equipment.csv')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit Import' }));
    await waitFor(() =>
      expect(assetService.importEquipmentAssets).toHaveBeenCalledWith(csv, expect.any(Function))
    );
    expect(await screen.findByText('equipment.csv: 2 created, 0 updated.')).toBeInTheDocument();
  }, 15000);

  it('opens the New Equipment modal and submits a cascaded class/type payload', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({
      classes: [{ class: 'Pressure Vessels (VE)', count: 3 }],
      funcloc: { with: 2, without: 1 },
    });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(assetService.createEquipmentAsset).mockResolvedValue({
      id: 99,
      tag_number: '12-V-1104',
    });

    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'New Equipment' }));
    expect(await screen.findByRole('dialog', { name: 'New Equipment' })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/Equipment Class/), 'Pressure Vessels (VE)');
    await userEvent.selectOptions(
      screen.getByLabelText('Equipment Type'),
      'Separator (Se) (SE)'
    );
    await userEvent.type(screen.getByLabelText(/Asset ID \/ Tag Number/), '12-V-1104');
    await userEvent.click(screen.getByRole('button', { name: 'Save Equipment' }));

    await waitFor(() =>
      expect(assetService.createEquipmentAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          tag_number: '12-V-1104',
          asset_class: 'Pressure Vessels (VE)',
          asset_type: 'Separator (Se) (SE)',
        })
      )
    );
    expect(await screen.findByText('Equipment 12-V-1104 created successfully.')).toBeInTheDocument();
  }, 15000);

  it('rejects a file whose extension is neither XLSX nor CSV', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    renderPage();

    const pdf = new File(['%PDF-1.4'], 'equipment.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Select XLSX or CSV asset import file'), {
      target: { files: [pdf] },
    });

    expect(
      await screen.findByText('Choose an .xlsx or .csv file to import.')
    ).toBeInTheDocument();
    expect(screen.queryByText('equipment.pdf')).not.toBeInTheDocument();
    expect(assetService.importEquipmentAssets).not.toHaveBeenCalled();
  }, 15000);

  it('shows import failure details, automatically resets uploader, and imports on submit', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
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

    renderPage();

    const workbook = new File(['xlsx'], 'equipment.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 1. Select file and Submit: fails with error
    fireEvent.change(screen.getByLabelText('Select XLSX or CSV asset import file'), {
      target: { files: [workbook] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Import' }));

    expect(await screen.findAllByText('Expected multipart XLSX upload')).not.toHaveLength(0);
    // Uploader is automatically reset so user can directly select again without refresh
    expect(screen.queryByText('equipment.xlsx')).not.toBeInTheDocument();

    // 2. Select file and submit again: succeeds and shows import results
    const retryWorkbook = new File(['retry data'], 'retry.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    fireEvent.change(screen.getByLabelText('Select XLSX or CSV asset import file'), {
      target: { files: [retryWorkbook] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Import' }));

    expect(await screen.findByRole('region', { name: 'Import results' })).toHaveTextContent(
      '3 of 4 rows imported (2 created, 1 updated).'
    );
    expect(screen.getByText('row 5: Equipment Class is required')).toBeInTheDocument();
    expect(assetService.importEquipmentAssets).toHaveBeenCalledTimes(2);
    expect(vi.mocked(assetService.importEquipmentAssets).mock.calls[1][0]).toBe(retryWorkbook);
  }, 15000);

  it('rejects files larger than 100 MB with an error notification', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    renderPage();

    const oversizedFile = new File(['oversized'], 'oversized.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    Object.defineProperty(oversizedFile, 'size', {
      value: 101 * 1024 * 1024,
      configurable: true,
    });

    fireEvent.change(screen.getByLabelText('Select XLSX or CSV asset import file'), {
      target: { files: [oversizedFile] },
    });

    expect(await screen.findByText('Import files must be 100 MB or smaller.')).toBeInTheDocument();
    expect(assetService.importEquipmentAssets).not.toHaveBeenCalled();
  });

  it('triggers purgeAllEquipmentAssets from the Maintenance dropdown after user confirms', async () => {
    vi.mocked(assetService.getEquipmentAssetStats).mockResolvedValue({ classes: [], funcloc: { with: 0, without: 0 } });
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(assetService.purgeAllEquipmentAssets).mockResolvedValue({ deleted_count: 1537 });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    openMaintenanceMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Clear All Equipment' }));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(assetService.purgeAllEquipmentAssets).toHaveBeenCalledOnce();
    });
    expect(
      await screen.findByText(/All equipment assets cleared successfully \(1537 record\(s\) removed\)\./)
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
