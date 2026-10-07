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
  it('maps Design and Operating fields into their rbi_properties categories', () => {
    const { rbiProperties } = manageAssetPayloadFromForm({
      ...EMPTY_MANAGE_ASSET_FORM,
      designCode: 'ASME VIII Div. 1',
      designPressure: '150',
      designTemperature: '650',
      weldEfficiency: '0.85',
      postWeldHeatTreatment: 'YES',
      equipmentStartDate: '2024-05-01',
      vaporVolume: '12.5',
      liquidVolume: '3',
      totalMass: '900',
      processFluid: 'Natural Gas',
      consequenceModel: 'Advanced',
    });

    // Existing export keys are reused so values round-trip with import/export.
    expect(rbiProperties['Component Design.Design Code']).toBe('ASME VIII Div. 1');
    expect(rbiProperties['Component Design.Design Pressure']).toBe('150');
    expect(rbiProperties['Component Design.Design Temperature']).toBe('650');
    // New fields derive `Category.Label`, the same convention the import uses.
    expect(rbiProperties['Equipment Design.Weld Efficiency']).toBe('0.85');
    expect(rbiProperties['Equipment Design.Post Weld Heat Treatment']).toBe('YES');
    expect(rbiProperties['Equipment Design.Equipment Start Date']).toBe('2024-05-01');
    expect(rbiProperties['Fluid Inventory.Equipment Vapor Volume (m³)']).toBe('12.5');
    expect(rbiProperties['Fluid Inventory.Total Equipment Mass (kg)']).toBe('900');
    expect(rbiProperties['Equipment Fluid Definition.Process Fluid']).toBe('Natural Gas');
    expect(rbiProperties['Fluid Definition.Consequence Model']).toBe('Advanced');
    // The Design Equipment Type mirrors the asset column, never its own key.
    expect(rbiProperties['Equipment Design.Equipment Type']).toBeUndefined();
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

  it('renders the Equipment Design accordion with its fields', async () => {
    render(<ManageAssetModal open asset={asset} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Design Data' }));

    expect(screen.getByRole('button', { name: /Equipment Design/ })).toBeInTheDocument();
    // Equipment Type is disabled because General Data already provides it.
    expect(screen.getByLabelText('Equipment Type')).toBeDisabled();
    expect(screen.getByLabelText('Design Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Equipment Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Design Pressure (psig)')).toBeInTheDocument();
    expect(screen.getByLabelText('Design Temperature (°F)')).toBeInTheDocument();
    expect(screen.getByLabelText('Weld Efficiency')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'YES' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'NO' })).toBeInTheDocument();
  }, 15000);

  it('renders the Operating Data two-column layout with Detail Specs placeholders', async () => {
    render(<ManageAssetModal open asset={asset} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Operating Data' }));

    expect(screen.getByRole('button', { name: /Fluid Inventory/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Equipment Vapor Volume (m³)')).toBeInTheDocument();
    expect(screen.getByLabelText('Equipment Liquid Volume (m³)')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Equipment Mass (kg)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Equipment Fluid Definition/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Process Fluid')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fluid Definition' })).toBeInTheDocument();
    expect(screen.getByLabelText('Consequence Model')).toBeInTheDocument();

    // Detail Specs lists the thickness properties with an Apply button each.
    expect(screen.getByRole('button', { name: 'Detail Specs' })).toBeInTheDocument();
    for (const property of ['Furnished Thickness', 'Corrosion Allowance', 'Pipe Schedule']) {
      expect(screen.getByText(property)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: 'Apply' })).toHaveLength(3);
  }, 15000);

  it('collapses and expands an accordion', async () => {
    render(<ManageAssetModal open asset={asset} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Design Data' }));
    const header = screen.getByRole('button', { name: /Equipment Design/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(header);
    expect(screen.getByRole('button', { name: /Equipment Design/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByLabelText('Design Code')).not.toBeInTheDocument();
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
