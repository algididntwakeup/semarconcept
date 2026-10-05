// platform/frontend-mui/src/features/assets/components/StatDetailModal.test.tsx
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import StatDetailModal from './StatDetailModal';
import { assetService } from '../../../services/assetServices';
import type * as AssetServicesModule from '../../../services/assetServices';

vi.mock('../../../services/assetServices', async (importOriginal) => {
  const actual = await importOriginal<typeof AssetServicesModule>();
  return {
    ...actual,
    assetService: { ...actual.assetService, getEquipmentAssets: vi.fn() },
  };
});

const renderModal = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <StatDetailModal open title="Piping" count={2} equipmentClass="Piping" onClose={vi.fn()} />
    </QueryClientProvider>
  );
};

const columnHeaders = () =>
  screen.getAllByRole('columnheader').map((cell) => cell.textContent);

describe('StatDetailModal table', () => {
  it('renders the legacy-aligned columns without a material column', async () => {
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [],
      total: 0,
      page: 1,
      limit: 8,
    });

    renderModal();

    expect(await screen.findByText('No assets match these filters.')).toBeInTheDocument();
    expect(columnHeaders()).toEqual([
      'Tag Number',
      'Class',
      'Type',
      'Parent Funcloc',
      'Level 6 Funcloc',
      'Installation',
    ]);
    expect(columnHeaders().some((header) => /material/i.test(header))).toBe(false);
  });

  it('renders funcloc columns from rbi_properties and an Installed badge', async () => {
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [
        {
          id: 1,
          tag_number: '12-V-1104',
          asset_class: 'Pressure Vessels (VE)',
          asset_type: 'Scrubber (Sb) (SB)',
          status: 'Installed',
          rbi_properties: {
            parent_funcloc: '12-ICTA (INLET COMPRESSOR AFTERCOOLER A)',
            level6_funcloc: '10"-PG-12009-3C3-P (12-V-1104)',
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 8,
    });

    renderModal();

    const row = (await screen.findByText('12-V-1104')).closest('tr');
    expect(row).not.toBeNull();
    const cells = within(row as HTMLElement).getAllByRole('cell');
    expect(cells[3]).toHaveTextContent('12-ICTA (INLET COMPRESSOR AFTERCOOLER A)');
    expect(cells[4]).toHaveTextContent('10"-PG-12009-3C3-P (12-V-1104)');
    const badge = within(cells[5]).getByText('Installed');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('renders an Available badge in grey and a dash for missing funcloc values', async () => {
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [
        {
          id: 2,
          tag_number: 'TAG-2',
          asset_class: 'Piping',
          asset_type: 'Carbon Steel',
          status: 'Available',
          rbi_properties: {},
        },
      ],
      total: 1,
      page: 1,
      limit: 8,
    });

    renderModal();

    const row = (await screen.findByText('TAG-2')).closest('tr');
    const cells = within(row as HTMLElement).getAllByRole('cell');
    expect(cells[3]).toHaveTextContent('—');
    expect(cells[4]).toHaveTextContent('—');
    const badge = within(cells[5]).getByText('Available');
    expect(badge.className).toContain('bg-slate-100');
    expect(badge.className).toContain('text-slate-600');
  });

  it('falls back to the legacy flattened funcloc keys for older imports', async () => {
    vi.mocked(assetService.getEquipmentAssets).mockResolvedValue({
      assets: [
        {
          id: 3,
          tag_number: 'TAG-3',
          asset_class: 'Piping (PI)',
          asset_type: 'Carbon Steel (Ca) (CA)',
          status: 'Installed',
          rbi_properties: {
            'General.Parent FunLoc': 'JI-JL-AG-11-IM',
            'General.Installed FunLoc': `1"-CI-66002-6S0`,
          },
        },
        {
          id: 4,
          tag_number: 'TAG-4',
          asset_class: 'Piping (PI)',
          asset_type: 'Carbon Steel (Ca) (CA)',
          status: 'Installed',
          rbi_properties: {
            parent_funcloc_code: 'JI-JL-AG-11-IS',
            installed_funcloc: '11-IS-11-V-1101',
          },
        },
      ],
      total: 2,
      page: 1,
      limit: 8,
    });

    renderModal();

    const legacyRow = (await screen.findByText('TAG-3')).closest('tr');
    const legacyCells = within(legacyRow as HTMLElement).getAllByRole('cell');
    expect(legacyCells[3]).toHaveTextContent('JI-JL-AG-11-IM');
    expect(legacyCells[4]).toHaveTextContent(`1"-CI-66002-6S0`);

    const previousRow = (await screen.findByText('TAG-4')).closest('tr');
    const previousCells = within(previousRow as HTMLElement).getAllByRole('cell');
    expect(previousCells[3]).toHaveTextContent('JI-JL-AG-11-IS');
    expect(previousCells[4]).toHaveTextContent('11-IS-11-V-1101');
  });
});
