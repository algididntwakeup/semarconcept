// platform/frontend-mui/src/pages/floc/FunctionalLocationsPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FunctionalLocationsPage } from './FunctionalLocationsPage';
import * as flocQueries from '../../features/floc/api/flocQueries';
import type { FlocNode } from '../../types/floc';

const mockFlocTreeData: FlocNode[] = [
  {
    id: 1,
    tenant_id: 1,
    code: 'CORP-REK',
    description: 'PT Reksolindo Energy Corp',
    level: 1,
    is_active: true,
    installed_equipment_count: 0,
    path: 'PT Reksolindo Energy Corp',
    equipments: [],
    children: [
      {
        id: 2,
        tenant_id: 1,
        parent_id: 1,
        code: 'REG-WJ',
        description: 'Upstream Oil & Gas - West Java',
        level: 2,
        is_active: true,
        installed_equipment_count: 0,
        path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java',
        equipments: [],
        children: [
          {
            id: 3,
            tenant_id: 1,
            parent_id: 2,
            code: 'SITE-JTB',
            description: 'Jatibarang Onshore Field',
            level: 3,
            is_active: true,
            installed_equipment_count: 0,
            path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field',
            equipments: [],
            children: [
              {
                id: 4,
                tenant_id: 1,
                parent_id: 3,
                code: 'AREA-AGB',
                description: 'Gathering Station Akasia Bagus',
                level: 4,
                is_active: true,
                installed_equipment_count: 0,
                path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus',
                equipments: [],
                children: [
                  {
                    id: 6,
                    tenant_id: 1,
                    parent_id: 4,
                    code: 'JI-JL-AG-11-PW',
                    description: 'Produced Water Treatment System',
                    level: 5,
                    is_active: true,
                    installed_equipment_count: 1,
                    path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Produced Water Treatment System',
                    equipments: [
                      {
                        id: 101,
                        tag_number: 'P-101A',
                        name: 'Produced Water Charge Pump A',
                        asset_class: 'Pump',
                        asset_type: 'Centrifugal',
                        status: 'Installed',
                        criticality: 4,
                      },
                    ],
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('FunctionalLocationsPage', () => {
  it('renders split screen with left tree view and right detail panel', async () => {
    vi.spyOn(flocQueries, 'useFlocTree').mockReturnValue({
      data: mockFlocTreeData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithClient(<FunctionalLocationsPage />);

    // Header title
    expect(screen.getByText('Visual FLOC Tree (ISO 14224)')).toBeInTheDocument();

    // Left Column Tree elements
    expect(screen.getByRole('region', { name: /Tree View Functional Location/i })).toBeInTheDocument();
    expect(screen.getByText('CORP-REK')).toBeInTheDocument();
    expect(screen.getAllByText('L1').length).toBeGreaterThanOrEqual(1);

    // Right Column Detail Panel elements
    expect(screen.getByRole('region', { name: /Detail Panel Functional Location/i })).toBeInTheDocument();
    expect(screen.getByText('Path Hierarki Lengkap (Hierarchy Path)')).toBeInTheDocument();
  });

  it('switches detail panel instantly when another node is clicked', async () => {
    vi.spyOn(flocQueries, 'useFlocTree').mockReturnValue({
      data: mockFlocTreeData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithClient(<FunctionalLocationsPage />);

    // Click Expand All to ensure JI-JL-AG-11-PW is visible
    fireEvent.click(screen.getByText('Expand All'));

    // Click the L5 node in the tree
    const nodeL5 = screen.getAllByText('JI-JL-AG-11-PW')[0];
    fireEvent.click(nodeL5);

    // Right panel immediately displays the L5 details and its installed equipment
    expect(screen.getByText('— Produced Water Treatment System')).toBeInTheDocument();
    expect(screen.getByText('P-101A')).toBeInTheDocument();
    expect(screen.getByText('Produced Water Charge Pump A')).toBeInTheDocument();
  });

  it('collapses and expands all branches with the toggle buttons', () => {
    vi.spyOn(flocQueries, 'useFlocTree').mockReturnValue({
      data: mockFlocTreeData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithClient(<FunctionalLocationsPage />);

    // Collapse all
    fireEvent.click(screen.getByText('Collapse All'));
    expect(screen.queryByText('REG-WJ')).not.toBeInTheDocument();

    // Expand all
    fireEvent.click(screen.getByText('Expand All'));
    expect(screen.getByText('REG-WJ')).toBeInTheDocument();
  });

  it('filters nodes in tree view when searching', () => {
    vi.spyOn(flocQueries, 'useFlocTree').mockReturnValue({
      data: mockFlocTreeData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithClient(<FunctionalLocationsPage />);

    const searchInput = screen.getByPlaceholderText('Cari FLOC code, nama, level...');
    fireEvent.change(searchInput, { target: { value: 'Produced Water' } });

    expect(screen.getAllByText('JI-JL-AG-11-PW').length).toBeGreaterThanOrEqual(1);
  });
});
