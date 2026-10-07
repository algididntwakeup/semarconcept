import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LifecycleActionModal from './LifecycleActionModal';
import LifecycleConfirmModal from './LifecycleConfirmModal';

describe('LifecycleActionModal', () => {
  it('renders the Install title, tag, search box, and empty active selection', async () => {
    render(
      <LifecycleActionModal
        open
        action="Install"
        asset={{ id: 1, tag_number: 'P-101' }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Install Equipment to Hierarchy' })
    ).toBeInTheDocument();
    expect(screen.getByText('P-101')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Functional Location')).toBeInTheDocument();
    expect(screen.getByText('Click a node below to select')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm Install' })).toBeInTheDocument();
  }, 15000);

  it('uses the Relocate title and action label', () => {
    render(
      <LifecycleActionModal
        open
        action="Relocate"
        asset={{ id: 2, tag_number: 'P-202' }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Relocate Equipment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm Relocate' })).toBeInTheDocument();
  });

  it('fills the active selection from a clicked node and confirms it', async () => {
    const onConfirm = vi.fn();
    render(
      <LifecycleActionModal
        open
        action="Install"
        asset={{ id: 1, tag_number: 'P-101' }}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /JI-JL-AG-11-PW/ }));
    // The code now appears twice: in the node list and in the active selection.
    expect(screen.getAllByText('JI-JL-AG-11-PW').length).toBeGreaterThan(1);
    expect(screen.queryByText('Click a node below to select')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm Install' }));
    expect(onConfirm).toHaveBeenCalledWith('Install', expect.objectContaining({ id: 1 }), 'JI-JL-AG-11-PW');
  }, 15000);

  it('filters nodes by the search box', async () => {
    render(
      <LifecycleActionModal
        open
        action="Install"
        asset={{ id: 1, tag_number: 'P-101' }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText('Search Functional Location'), 'well');
    expect(screen.getByText('JI-JL-AG-68-WS')).toBeInTheDocument();
    expect(screen.queryByText('JI-JL-AG-11-PW')).not.toBeInTheDocument();
  }, 15000);

  it('closes when Cancel is pressed', async () => {
    const onClose = vi.fn();
    render(
      <LifecycleActionModal
        open
        action="Install"
        asset={{ id: 1, tag_number: 'P-101' }}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  }, 15000);
});

describe('LifecycleConfirmModal', () => {
  it('asks for confirmation with the action in the title', () => {
    render(
      <LifecycleConfirmModal
        open
        action="Retire"
        asset={{ id: 3, tag_number: 'P-303' }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Are you sure you want to retire this asset?' })
    ).toBeInTheDocument();
    expect(screen.getByText('P-303')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('confirms the action and closes', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <LifecycleConfirmModal
        open
        action="Condemn"
        asset={{ id: 4, tag_number: 'P-404' }}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledWith('Condemn', expect.objectContaining({ id: 4 }));
  }, 15000);

  it('cancels without confirming', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <LifecycleConfirmModal
        open
        action="Uninstall"
        asset={{ id: 5, tag_number: 'P-505' }}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  }, 15000);
});
