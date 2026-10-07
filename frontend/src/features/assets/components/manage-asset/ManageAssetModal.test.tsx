import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ManageAssetModal from './ManageAssetModal';
import {
  EMPTY_MANAGE_ASSET_FORM,
  manageAssetFormFromRow,
  manageAssetPayloadFromForm,
} from './manageAssetFields';
import type { EquipmentAssetRow } from '../AssetDataGrid';

const asset: EquipmentAssetRow = {
  id: 42,
  tag_number: 'P-101',
  description: 'Feed Pump',
  asset_class: 'Piping (PI)',
  asset_type: 'Carbon Steel (CA)',
  rbi_properties: {
    parent_funcloc: 'JI-JL-AG-11-PW',
    'Equipment References.P&ID Drawing No.': 'PID-001',
    'Equipment References.Latitude (degrees(decimal))': '-6.2',
  },
};

describe('manageAssetFields mapping', () => {
  it('hydrates the form from asset columns and rbi_properties', () => {
    const form = manageAssetFormFromRow(asset);
    expect(form.equipmentId).toBe('42');
    expect(form.funcloc).toBe('JI-JL-AG-11-PW');
    expect(form.description).toBe('Feed Pump');
    expect(form.equipmentClass).toBe('Piping (PI)');
    expect(form.equipmentType).toBe('Carbon Steel (CA)');
    expect(form.pidDrawingNo).toBe('PID-001');
    expect(form.latitude).toBe('-6.2');
    // Unset references fall back to empty strings, never undefined.
    expect(form.elevation).toBe('');
  });

  it('splits the form back into columns and rbi_properties keys', () => {
    const { columns, rbiProperties } = manageAssetPayloadFromForm({
      ...EMPTY_MANAGE_ASSET_FORM,
      description: 'Updated pump',
      equipmentClass: 'Piping (PI)',
      funcloc: 'JI-JL-AG-99-ZZ',
      inspectionDrawingNo: 'INS-9',
    });

    expect(columns.description).toBe('Updated pump');
    expect(columns.asset_class).toBe('Piping (PI)');
    // Equipment ID is read-only and never submitted.
    expect(columns.id).toBeUndefined();
    // Funcloc and references round-trip through the import JSONB keys.
    expect(rbiProperties.parent_funcloc).toBe('JI-JL-AG-99-ZZ');
    expect(rbiProperties['Equipment References.Inspection Drawing No.']).toBe('INS-9');
  });
});

describe('ManageAssetModal', () => {
  it('shows the title, tabs, and sub-navigation', () => {
    render(<ManageAssetModal open asset={asset} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Manage Asset — P-101' })).toBeInTheDocument();
    for (const tab of ['Data Source', 'Image', 'File']) {
      expect(screen.getByRole('tab', { name: new RegExp(tab) })).toBeInTheDocument();
    }
    for (const section of [
      'General Data',
      'Design Data',
      'Operating Data',
      'Risk Analysis',
      'Other Data',
    ]) {
      expect(screen.getByRole('button', { name: section })).toBeInTheDocument();
    }
  });

  it('prefills General Data and submits mapped columns + rbi keys', async () => {
    const onSave = vi.fn();
    render(<ManageAssetModal open asset={asset} onClose={vi.fn()} onSave={onSave} />);

    expect(screen.getByLabelText('Equipment ID')).toHaveValue('42');
    expect(screen.getByLabelText('Funcloc')).toHaveValue('JI-JL-AG-11-PW');

    await userEvent.clear(screen.getByLabelText('Description'));
    await userEvent.type(screen.getByLabelText('Description'), 'Feed Pump v2');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: expect.objectContaining({ description: 'Feed Pump v2' }),
        rbiProperties: expect.objectContaining({ parent_funcloc: 'JI-JL-AG-11-PW' }),
      }),
      asset
    );
  }, 15000);

  it('renders the Equipment References accordion under Other Data', async () => {
    render(<ManageAssetModal open asset={asset} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Other Data' }));

    expect(screen.getByRole('button', { name: /Equipment References/ })).toBeInTheDocument();
    for (const label of [
      'Asset ID',
      'P&ID Drawing No.',
      'Inspection Drawing No.',
      'Jurisdiction Registration No.',
      'Juris Serial No.',
      'Latitude (degrees(decimal))',
      'Longitude (degrees(decimal))',
      'Elevation (m)',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText('P&ID Drawing No.')).toHaveValue('PID-001');
  }, 15000);
});
