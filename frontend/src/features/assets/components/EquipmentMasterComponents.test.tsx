import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AssetDataGrid from './AssetDataGrid';
import LifecycleDropdown from './LifecycleDropdown';
import RowActions from './RowActions';
import StatCard from './StatCard';
import { equipmentStatIcon } from './statCardIcons';
import { classWithCode, typeWithCode, typeWithDashCode } from '../data/equipmentDisplayCodes';
import { Boxes, Cable, Cog, Layers3, MapPin, PackageCheck, Route } from 'lucide-react';

describe('Equipment Master reusable components', () => {
  it('re-attaches short codes to stored class and type labels', () => {
    expect(classWithCode('Piping')).toBe('Piping (PI)');
    expect(classWithCode('Piping Line')).toBe('Piping Line (PL)');
    expect(classWithCode('Pressure Vessels')).toBe('Pressure Vessels (VE)');
    expect(classWithCode('Unknown Class')).toBe('Unknown Class');
    expect(typeWithCode('Carbon Steel')).toBe('Carbon Steel (CA)');
    expect(typeWithCode('Shell & Tube')).toBe('Shell & Tube (ST)');
    expect(typeWithCode('Unknown Type')).toBe('Unknown Type');
    expect(typeWithDashCode('Carbon Steel')).toBe('Carbon Steel - CA');
    expect(typeWithDashCode('Unknown Type')).toBe('Unknown Type');
  });

  it('maps stat card titles to their specific icons and falls back to Boxes', () => {
    expect(equipmentStatIcon('Total')).toBe(Layers3);
    expect(equipmentStatIcon('Equipment')).toBe(Cog);
    expect(equipmentStatIcon('Piping')).toBe(Cable);
    expect(equipmentStatIcon('Piping Line')).toBe(Route);
    expect(equipmentStatIcon('Installed')).toBe(PackageCheck);
    expect(equipmentStatIcon('Has Funcloc')).toBe(MapPin);
    // Class cards without a dedicated icon keep the default.
    expect(equipmentStatIcon('Storage Tanks')).toBe(Boxes);
    expect(equipmentStatIcon('Pressure Vessels')).toBe(Boxes);
  });

  it('shows dynamic metric values and invokes the card action', () => {
    const onClick = vi.fn();
    render(<StatCard title="Installed Assets" count={27} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Installed Assets: 27' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText('27')).toBeInTheDocument();
  });

  it('shows a loading skeleton instead of stale metric values', () => {
    render(<StatCard title="Installed Assets" count={27} onClick={vi.fn()} isLoading />);

    expect(screen.getByRole('button', { name: 'Loading Installed Assets' })).toBeDisabled();
    expect(screen.queryByText('27')).not.toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders equipment fields, the ACTION column, and the pagination slot', () => {
    const onAction = vi.fn();
    const asset = {
      id: 12,
      tag_number: 'P-101',
      name: 'Feed Pump',
      description: 'Main process pump',
      asset_class: 'Piping',
      asset_type: 'Carbon Steel',
      status: 'Installed',
    };

    render(
      <AssetDataGrid
        assets={[asset]}
        onAction={onAction}
        paginationSlot={<button type="button">Next page</button>}
      />
    );

    expect(screen.getByText('P-101')).toBeInTheDocument();
    expect(screen.getByText('Main process pump')).toBeInTheDocument();
    // Class/type carry the short code again, and the tag shows the type code.
    expect(screen.getByText('Piping (PI)')).toBeInTheDocument();
    expect(screen.getAllByText('Carbon Steel (CA)').length).toBeGreaterThan(0);
    expect(screen.getByText('Carbon Steel - CA')).toBeInTheDocument();
    // Status replaces the old Lifecycle column, with no Lifecycle header.
    expect(screen.getByText('Installed')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Lifecycle' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage P-101' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lifecycle P-101' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('selects rows and forwards the checked ids to the selection actions', () => {
    const onExportSelected = vi.fn();
    const onDeleteSelected = vi.fn();
    const assets = [
      { id: 1, tag_number: 'P-1', name: 'P-1', asset_class: 'Piping', status: 'Installed' },
      { id: 2, tag_number: 'P-2', name: 'P-2', asset_class: 'Piping', status: 'Available' },
    ];

    render(
      <AssetDataGrid
        assets={assets}
        onExportSelected={onExportSelected}
        onDeleteSelected={onDeleteSelected}
      />
    );

    // No selection bar until a row is checked.
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select P-1' }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Download selected' }));
    expect(onExportSelected).toHaveBeenCalledWith(['1']);

    fireEvent.click(screen.getByRole('button', { name: 'Remove selected' }));
    expect(onDeleteSelected).toHaveBeenCalledWith(['1']);

    // Select-all checks every row on the page.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all equipment on this page' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('dispatches status filter changes to the list owner', () => {
    const onLifecycleFilterChange = vi.fn();
    render(
      <AssetDataGrid
        assets={[]}
        onSearchChange={vi.fn()}
        lifecycleFilter=""
        onLifecycleFilterChange={onLifecycleFilterChange}
      />
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Filter equipment by status' }), {
      target: { value: 'Installed' },
    });
    expect(onLifecycleFilterChange).toHaveBeenCalledWith('Installed');
  });

  it('renders a helpful empty state for unmatched tag searches with a clear action', () => {
    const onClearSearch = vi.fn();
    render(
      <AssetDataGrid
        assets={[]}
        searchValue="P-404"
        onSearchChange={vi.fn()}
        onClearSearch={onClearSearch}
      />
    );

    expect(screen.getByText('No matching equipment found')).toBeInTheDocument();
    expect(screen.getByText(/P-404/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClearSearch).toHaveBeenCalledOnce();
  });

  it('renders loading skeleton rows instead of the empty state', () => {
    render(<AssetDataGrid assets={[]} isLoading />);

    expect(document.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(screen.queryByText('No equipment registered yet')).not.toBeInTheDocument();
  });

  it('lists the Manage actions and dispatches the selected one', () => {
    const onManage = vi.fn();
    const asset = { id: 21, tag_number: 'E-210' };
    render(<RowActions asset={asset} onManage={onManage} />);

    fireEvent.click(screen.getByRole('button', { name: 'Manage E-210' }));
    expect(screen.getByRole('menuitem', { name: 'Manage Asset' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Add Component' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'View Timeline' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit Asset' })).toBeInTheDocument();
    const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
    expect(deleteItem.className).toContain('text-rose-600');
    fireEvent.click(deleteItem);
    expect(onManage).toHaveBeenCalledWith('delete', asset);
  });

  it('lists the Lifecycle actions and dispatches the selected one', () => {
    const onLifecycle = vi.fn();
    const asset = { id: 21, tag_number: 'E-210' };
    render(<RowActions asset={asset} onLifecycle={onLifecycle} />);

    fireEvent.click(screen.getByRole('button', { name: 'Lifecycle E-210' }));
    for (const label of ['Relocate', 'Uninstall', 'Send to repair', 'Retire', 'Condemn']) {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('menuitem', { name: 'Relocate' }));
    expect(onLifecycle).toHaveBeenCalledWith('Relocate', asset);
  });

  it('sends lifecycle actions through the change callback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn().mockResolvedValue(undefined);
    render(<LifecycleDropdown currentStatus="Installed" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /Installed/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Send to repair' }));
    expect(onChange).toHaveBeenCalledWith('Send to repair');
    expect(await screen.findByRole('status')).toHaveTextContent('Send to repair status saved');
  });
});
