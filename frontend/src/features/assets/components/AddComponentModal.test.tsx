import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddComponentModal from './AddComponentModal';
import { componentTypesForClass, componentTypeLabel } from '../data/componentTypes';
import type { EquipmentAssetRow } from './AssetDataGrid';

const heatExchanger: EquipmentAssetRow = {
  id: 42,
  tag_number: '1"-AI-12002-1G1',
  asset_class: 'Heat Exchangers',
};

const renderModal = (props: Partial<React.ComponentProps<typeof AddComponentModal>> = {}) =>
  render(
    <AddComponentModal
      open
      asset={heatExchanger}
      onClose={vi.fn()}
      onSubmit={vi.fn()}
      {...props}
    />
  );

describe('AddComponentModal', () => {
  it('shows a dynamic title with the parent tag and the Component Identity section', () => {
    renderModal();

    expect(
      screen.getByRole('heading', { name: 'Add Component to 1"-AI-12002-1G1' })
    ).toBeInTheDocument();
    expect(screen.getByText('Component Identity')).toBeInTheDocument();
    // The section icon is a decorative green badge.
    expect(screen.getByText('Component Identity').querySelector('.bg-emerald-100')).not.toBeNull();
  });

  it('renders the two-column identity grid with the specified placeholders', () => {
    renderModal();

    const functionalLocation = screen.getByLabelText(/Functional Location \(Optional\)/);
    expect(functionalLocation).toHaveAttribute('placeholder', 'e.g., TUBE-SECTION');

    const tagName = screen.getByLabelText(/Tag Name/);
    expect(tagName).toHaveAttribute('placeholder', 'e.g., 01');
    expect(tagName).toBeRequired();

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText(/Component Type \(Asset Type Mapping\)/)).toBeRequired();

    // Footer buttons.
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Component' })).toBeInTheDocument();
  });

  it('derives the component type options from the parent equipment class', () => {
    renderModal();

    const select = screen.getByLabelText(/Component Type \(Asset Type Mapping\)/);
    const options = within(select)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(options).toContain('Shell');
    expect(options).toContain('Tube Bundle');
    expect(options).toContain('Channel');
    // Piping-only components are not offered for a heat exchanger.
    expect(options).not.toContain('Elbow');
  });

  it('falls back to the full catalog when the parent class is unknown', () => {
    renderModal({ asset: { id: 7, tag_number: 'X-1', asset_class: 'Mystery Machine' } });

    const select = screen.getByLabelText(/Component Type \(Asset Type Mapping\)/);
    const options = within(select)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(options).toContain('Shell');
    expect(options).toContain('Elbow');
  });

  it('blocks submission until the required fields are filled', async () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });

    await userEvent.click(screen.getByRole('button', { name: 'Save Component' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Tag Name is required.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the collected form, inheriting the parent class', async () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });

    await userEvent.type(
      screen.getByLabelText(/Functional Location \(Optional\)/),
      'TUBE-SECTION'
    );
    await userEvent.type(screen.getByLabelText(/Tag Name/), '01');
    await userEvent.type(screen.getByLabelText('Description'), 'Tube bundle section A');
    await userEvent.selectOptions(
      screen.getByLabelText(/Component Type \(Asset Type Mapping\)/),
      'tube_bundle'
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save Component' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const [payload, asset] = onSubmit.mock.calls[0];
    expect(payload).toEqual({
      asset_id: 42,
      name: '01',
      functional_location: 'TUBE-SECTION',
      description: 'Tube bundle section A',
      component_type: 'tube_bundle',
      component_type_label: 'Tube Bundle',
      // Level 7 component descends the parent's equipment class.
      component_class: 'Heat Exchangers',
    });
    expect(asset).toBe(heatExchanger);
  });

  it('shows a spinner and disables Save while submitting', () => {
    renderModal({ isSubmitting: true });

    expect(screen.getByRole('button', { name: /Save Component/ })).toBeDisabled();
  });

  it('maps stored component type codes back to labels', () => {
    expect(componentTypeLabel('tube_bundle')).toBe('Tube Bundle');
    expect(componentTypeLabel('shell')).toBe('Shell');
    // Unknown codes are returned unchanged.
    expect(componentTypeLabel('mystery')).toBe('mystery');
  });

  it('offers heat-exchanger types for a class label carrying a code', () => {
    const codes = componentTypesForClass('Heat Exchangers (HX)').map((entry) => entry.code);
    expect(codes).toContain('shell');
    expect(codes).toContain('tube_bundle');
  });
});
