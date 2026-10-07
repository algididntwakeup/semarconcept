import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ManageAssetImageTab from './ManageAssetImageTab';
import ManageAssetFileTab from './ManageAssetFileTab';
import { assetService } from '../../../../services/assetServices';
import type * as AssetServicesModule from '../../../../services/assetServices';
import { categoryBadgeClass, formatFileSize, formatUploadDate } from './manageAssetDocuments';

vi.mock('../../../../services/assetServices', async () => {
  const actual = await vi.importActual<typeof AssetServicesModule>('../../../../services/assetServices');
  return {
    ...actual,
    assetService: {
      ...actual.assetService,
      getEquipmentDocuments: vi.fn(),
      uploadEquipmentDocument: vi.fn(),
      deleteEquipmentDocument: vi.fn(),
    },
  };
});

const renderTab = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

const documentRow = (overrides: Partial<Awaited<ReturnType<typeof assetService.getEquipmentDocuments>>[number]> = {}) => ({
  id: 1,
  tenant_id: 1,
  equipment_id: 42,
  file_name: 'P&ID-1200-Rev-C.pdf',
  file_url: '/static/uploads/equipments/42/abc.pdf',
  file_type: 'Drawing' as const,
  file_size: 3_460_000,
  uploaded_at: '2026-09-30T10:00:00Z',
  ...overrides,
});

describe('manageAssetDocuments helpers', () => {
  it('formats file sizes and upload dates like the legacy list', () => {
    expect(formatFileSize(3_460_000)).toBe('3.3 MB');
    expect(formatFileSize(245_000)).toBe('239 KB');
    expect(formatFileSize(undefined)).toBe('—');
    expect(formatUploadDate('2026-09-30')).toBe('30 Sept 2026');
    expect(formatUploadDate('not-a-date')).toBe('—');
  });

  it('colours badges per category and falls back for unknown ones', () => {
    expect(categoryBadgeClass('Drawing')).toContain('purple');
    expect(categoryBadgeClass('REPORT')).toContain('blue');
    expect(categoryBadgeClass('Certificate')).toContain('emerald');
    expect(categoryBadgeClass('Unknown')).toContain('slate');
  });
});

describe('ManageAssetImageTab', () => {
  beforeEach(() => {
    vi.mocked(assetService.getEquipmentDocuments).mockReset();
    vi.mocked(assetService.uploadEquipmentDocument).mockReset();
  });

  it('renders the header, action bar, and empty dropzone when there are no images', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([]);
    renderTab(<ManageAssetImageTab assetId={42} tag="P-101" onFilesAdded={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '[P-101] Image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Data Source' })).toBeInTheDocument();
    // The dropzone only renders once the document query settles.
    expect(await screen.findByText('No images yet')).toBeInTheDocument();
    expect(screen.getByText('Image Annotations (0 images)')).toBeInTheDocument();
    expect(screen.getByText('Click or drag & drop to upload')).toBeInTheDocument();
  }, 15000);

  it('lists images returned by the API with a link to the served file', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([
      documentRow({ id: 9, file_name: 'photo.png', file_type: 'Image', file_url: '/static/uploads/equipments/42/photo.png' }),
      documentRow({ id: 10, file_name: 'drawing.pdf', file_type: 'Drawing' }),
    ]);
    renderTab(<ManageAssetImageTab assetId={42} tag="P-101" onFilesAdded={vi.fn()} />);

    // Only the image row belongs to this tab.
    expect(await screen.findByText('Image Annotations (1 images)')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'photo.png' });
    expect(link).toHaveAttribute('href', '/static/uploads/equipments/42/photo.png');
    expect(screen.queryByText('drawing.pdf')).not.toBeInTheDocument();
  }, 15000);

  it('uploads a dropped image through the API', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([]);
    vi.mocked(assetService.uploadEquipmentDocument).mockResolvedValue(documentRow({ file_type: 'Image' }));
    const onFilesAdded = vi.fn();
    const { container } = renderTab(
      <ManageAssetImageTab assetId={42} tag="P-101" onFilesAdded={onFilesAdded} />
    );

    await waitFor(() => expect(assetService.getEquipmentDocuments).toHaveBeenCalled());
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'pid.png', { type: 'image/png' });
    await userEvent.upload(input, file);

    await waitFor(() =>
      expect(assetService.uploadEquipmentDocument).toHaveBeenCalledWith(42, file, undefined)
    );
    expect(onFilesAdded).toHaveBeenCalledWith([file]);
  }, 15000);
});

describe('ManageAssetFileTab', () => {
  beforeEach(() => {
    vi.mocked(assetService.getEquipmentDocuments).mockReset();
    vi.mocked(assetService.uploadEquipmentDocument).mockReset();
    vi.mocked(assetService.deleteEquipmentDocument).mockReset();
  });

  it('lists the documents from the API with badges, size, date, and a served URL', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([
      documentRow({ id: 1, file_name: 'P&ID-1200-Rev-C.pdf', file_type: 'Drawing', file_size: 3_460_000, uploaded_at: '2026-09-30T00:00:00Z' }),
      documentRow({ id: 2, file_name: 'Inspection-Report.docx', file_type: 'Report', file_size: 812_000 }),
      documentRow({ id: 3, file_name: 'Certificate.pdf', file_type: 'Certificate', file_size: 245_000 }),
    ]);
    renderTab(<ManageAssetFileTab assetId={42} onFilesAdded={vi.fn()} />);

    expect(await screen.findByText('Files (3)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'P&ID-1200-Rev-C.pdf' })).toHaveAttribute(
      'href',
      '/static/uploads/equipments/42/abc.pdf'
    );
    expect(screen.getByText('3.3 MB · 30 Sept 2026')).toBeInTheDocument();

    const list = screen.getByRole('list');
    expect(within(list).getByText('Drawing')).toBeInTheDocument();
    expect(within(list).getByText('Report')).toBeInTheDocument();
    expect(within(list).getByText('Certificate')).toBeInTheDocument();
  }, 15000);

  it('offers the category picker and uploads with the chosen category', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([]);
    vi.mocked(assetService.uploadEquipmentDocument).mockResolvedValue(documentRow());
    const onFilesAdded = vi.fn();
    const { container } = renderTab(
      <ManageAssetFileTab assetId={42} onFilesAdded={onFilesAdded} />
    );

    await waitFor(() => expect(assetService.getEquipmentDocuments).toHaveBeenCalled());
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Report');

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['pdf'], 'report.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    await waitFor(() =>
      expect(assetService.uploadEquipmentDocument).toHaveBeenCalledWith(42, file, 'Report')
    );
    expect(onFilesAdded).toHaveBeenCalledWith([file]);
  }, 15000);

  it('deletes a document through the API after confirmation', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([documentRow({ id: 5 })]);
    vi.mocked(assetService.deleteEquipmentDocument).mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderTab(<ManageAssetFileTab assetId={42} onFilesAdded={vi.fn()} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Delete P&ID-1200-Rev-C.pdf' }));

    await waitFor(() => expect(assetService.deleteEquipmentDocument).toHaveBeenCalledWith(42, 5));
    confirmSpy.mockRestore();
  }, 15000);

  it('collapses and expands the Files list', async () => {
    vi.mocked(assetService.getEquipmentDocuments).mockResolvedValue([documentRow()]);
    renderTab(<ManageAssetFileTab assetId={42} onFilesAdded={vi.fn()} />);

    const header = await screen.findByRole('button', { name: /Files \(/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(header);
    expect(screen.getByRole('button', { name: /Files \(/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByText('P&ID-1200-Rev-C.pdf')).not.toBeInTheDocument();
  }, 15000);
});
