import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EquipmentToolbar from './EquipmentToolbar';
import NewEquipmentModal from './NewEquipmentModal';
import { EQUIPMENT_TAXONOMY } from '../data/equipmentTaxonomy';

const toolbarProps = () => ({
  onDiagnoseDuplicates: vi.fn(),
  onFixComponentLinks: vi.fn(),
  onSyncComponentsToFLOC: vi.fn(),
  onClearAllEquipment: vi.fn(),
  onImport: vi.fn(),
  onExport: vi.fn(),
  onNewEquipment: vi.fn(),
  onManageDictionary: vi.fn(),
});

describe('EquipmentToolbar', () => {
  it('groups maintenance actions in a dropdown and dispatches the chosen one', async () => {
    const props = toolbarProps();
    render(<EquipmentToolbar {...props} />);

    const maintenance = screen.getByRole('button', { name: 'Maintenance actions' });
    expect(maintenance).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(maintenance);
    expect(screen.getByRole('button', { name: 'Maintenance actions' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    await userEvent.click(screen.getByRole('menuitem', { name: 'Diagnose duplicates' }));
    expect(props.onDiagnoseDuplicates).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu', { name: 'Maintenance actions' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Maintenance actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Fix component links' }));
    expect(props.onFixComponentLinks).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'Maintenance actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sync components to FLOC' }));
    expect(props.onSyncComponentsToFLOC).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'Maintenance actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Clear All Equipment' }));
    expect(props.onClearAllEquipment).toHaveBeenCalledOnce();
  }, 20000);

  it('groups import and export under Data Transfer and reports the export format', async () => {
    const props = toolbarProps();
    render(<EquipmentToolbar {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Data transfer' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Import Equipment' }));
    expect(props.onImport).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'Data transfer' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Export Equipment XLSX' }));
    expect(props.onExport).toHaveBeenCalledWith('xlsx');

    await userEvent.click(screen.getByRole('button', { name: 'Data transfer' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Export Equipment CSV' }));
    expect(props.onExport).toHaveBeenCalledWith('csv');
  });

  it('lists the four Data Transfer groups and routes unwired ones to the placeholder', async () => {
    const props = { ...toolbarProps(), onPlaceholderAction: vi.fn() };
    render(<EquipmentToolbar {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Data transfer' }));

    // Equipment is wired; the other three scopes are staged placeholders.
    for (const label of [
      'Import Equipment',
      'Export Equipment XLSX',
      'Export Equipment CSV',
      'Import Component',
      'Export Component',
      'Import All Asset',
      'Export All Asset',
      'Import Data Source',
      'Export Data Source',
    ]) {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole('menuitem', { name: 'Export Component' }));
    expect(props.onPlaceholderAction).toHaveBeenCalledWith('Export Component');

    await userEvent.click(screen.getByRole('button', { name: 'Data transfer' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Import Data Source' }));
    expect(props.onPlaceholderAction).toHaveBeenCalledWith('Import Data Source');
  });

  it('opens the New Equipment action from the primary button', async () => {
    const props = toolbarProps();
    render(<EquipmentToolbar {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'New Equipment' }));
    expect(props.onNewEquipment).toHaveBeenCalledOnce();
  });
});

describe('NewEquipmentModal', () => {
  it('renders the four sections and the footer actions when open', () => {
    render(
      <NewEquipmentModal
        open
        classes={EQUIPMENT_TAXONOMY}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: 'New Equipment' })).toBeInTheDocument();
    for (const section of ['General Info', 'Equipment Taxonomy', 'Lifecycle & Status', 'References']) {
      expect(screen.getByText(section)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Equipment' })).toBeInTheDocument();
  });

  it('rejects an empty required tag number before submitting', async () => {
    const onSubmit = vi.fn();
    render(
      <NewEquipmentModal
        open
        classes={EQUIPMENT_TAXONOMY}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.submit(screen.getByRole('dialog', { name: 'New Equipment' }).querySelector('form')!);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Asset ID / Tag Number is required.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cascades Equipment Type options from the chosen class and submits a payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <NewEquipmentModal
        open
        classes={EQUIPMENT_TAXONOMY}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const classSelect = screen.getByLabelText(/Equipment Class/);
    expect(screen.getByLabelText('Equipment Type')).toBeDisabled();

    await userEvent.selectOptions(classSelect, 'Pressure Vessels (VE)');
    const typeSelect = screen.getByLabelText('Equipment Type');
    expect(typeSelect).not.toBeDisabled();
    expect(screen.getByRole('option', { name: 'Separator (SE)' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Asset ID \/ Tag Number/), {
      target: { value: '12-V-1104' },
    });
    await userEvent.selectOptions(typeSelect, 'Separator (SE)');
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'Inlet separator' },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save Equipment' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tag_number: '12-V-1104',
          asset_class: 'Pressure Vessels (VE)',
          asset_type: 'Separator (SE)',
          description: 'Inlet separator',
        })
      )
    );
  });
});
