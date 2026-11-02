// platform/frontend-mui/src/features/floc/components/FlocDetailPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlocDetailPanel } from './FlocDetailPanel';
import type { FlocNode } from '../../../types/floc';

const sampleNodeWithEquipments: FlocNode = {
  id: 6,
  tenant_id: 1,
  code: 'JI-JL-AG-11-PW',
  description: 'Produced Water Treatment System',
  level: 5,
  is_active: true,
  installed_equipment_count: 2,
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
    {
      id: 102,
      tag_number: 'P-101B',
      name: 'Produced Water Charge Pump B (Standby)',
      asset_class: 'Pump',
      asset_type: 'Centrifugal',
      status: 'Installed',
      criticality: 3,
    },
  ],
  children: [],
};

const emptyNode: FlocNode = {
  id: 1,
  tenant_id: 1,
  code: 'CORP-REK',
  description: 'PT Reksolindo Energy Corp',
  level: 1,
  is_active: true,
  installed_equipment_count: 0,
  path: 'PT Reksolindo Energy Corp',
  equipments: [],
  children: [],
};

describe('FlocDetailPanel', () => {
  it('renders prompt when no node is selected', () => {
    render(<FlocDetailPanel selectedNode={null} />);
    expect(screen.getByText('Pilih Functional Location')).toBeInTheDocument();
  });

  it('renders node details, full hierarchy path, and installed equipment table', () => {
    const onSelectByCode = vi.fn();
    render(
      <FlocDetailPanel
        selectedNode={sampleNodeWithEquipments}
        onSelectNodeByCode={onSelectByCode}
      />
    );

    // Code & Description
    expect(screen.getAllByText('JI-JL-AG-11-PW').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('— Produced Water Treatment System')).toBeInTheDocument();
    expect(screen.getByText('Level 5 • L5')).toBeInTheDocument();

    // Full Hierarchy Path Breadcrumbs
    expect(screen.getByText('Path Hierarki Lengkap (Hierarchy Path)')).toBeInTheDocument();
    expect(screen.getByText('Jatibarang Onshore Field')).toBeInTheDocument();
    expect(screen.getByText('Gathering Station Akasia Bagus')).toBeInTheDocument();

    // Installed Equipments Table
    expect(screen.getByText('Daftar Equipment Terpasang (Installed)')).toBeInTheDocument();
    expect(screen.getByText('P-101A')).toBeInTheDocument();
    expect(screen.getByText('Produced Water Charge Pump A')).toBeInTheDocument();
    expect(screen.getByText('P-101B')).toBeInTheDocument();
    expect(screen.getAllByText('Installed').length).toBeGreaterThanOrEqual(2);
  });

  it('filters equipment list when user types in search box', () => {
    render(<FlocDetailPanel selectedNode={sampleNodeWithEquipments} />);

    const searchInput = screen.getByPlaceholderText('Cari tag, nama, kelas...');
    expect(searchInput).toBeInTheDocument();

    // Filter for Pump A
    fireEvent.change(searchInput, { target: { value: 'P-101A' } });
    expect(screen.getByText('Produced Water Charge Pump A')).toBeInTheDocument();
    expect(screen.queryByText('Produced Water Charge Pump B (Standby)')).not.toBeInTheDocument();
  });

  it('shows empty equipment notification when node has no installed equipment', () => {
    render(<FlocDetailPanel selectedNode={emptyNode} />);
    expect(
      screen.getByText('Tidak ada peralatan yang terpasang di lokasi fungsional ini.')
    ).toBeInTheDocument();
  });
});
