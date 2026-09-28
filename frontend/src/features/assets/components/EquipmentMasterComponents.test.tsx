import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AssetDataGrid from './AssetDataGrid';
import LifecycleDropdown from './LifecycleDropdown';
import RowActions from './RowActions';
import StatCard from './StatCard';

describe('Equipment Master reusable components', () => {
  it('shows dynamic metric values and invokes the card action', () => {
    const onClick = vi.fn();
    render(<StatCard title="Installed Assets" count={27} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Installed Assets: 27' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText('27')).toBeInTheDocument();
  });

  it('renders equipment fields, action callbacks, and the pagination slot', () => {
    const onView = vi.fn();
    const asset = {
      id: 12,
      tag_number: 'P-101',
      name: 'Feed Pump',
      description: 'Main process pump',
      asset_class: 'rotating_equipment',
    };

    render(
      <AssetDataGrid
        assets={[asset]}
        onView={onView}
        paginationSlot={<button type="button">Next page</button>}
      />
    );

    expect(screen.getByText('P-101')).toBeInTheDocument();
    expect(screen.getByText('Main process pump')).toBeInTheDocument();
    expect(screen.getByText('rotating equipment')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View P-101' }));
    expect(onView).toHaveBeenCalledWith(asset);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('shows the five row action menu choices and dispatches the selected action', () => {
    const onAction = vi.fn();
    const asset = { id: 21, tag_number: 'E-210' };
    render(<RowActions asset={asset} onAction={onAction} />);

    fireEvent.click(screen.getByRole('button', { name: 'Actions for E-210' }));
    expect(screen.getByRole('menuitem', { name: 'Manage asset' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Add component' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'View timeline' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete asset' }));
    expect(onAction).toHaveBeenCalledWith('delete', asset);
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
