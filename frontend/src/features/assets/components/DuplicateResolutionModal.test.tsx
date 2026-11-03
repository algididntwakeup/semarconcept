import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DuplicateResolutionModal from './DuplicateResolutionModal';
import type { DuplicateTagGroup } from '../../../services/assetServices';

const mockGroups: DuplicateTagGroup[] = [
  {
    tag_number: '12-H-1101',
    duplicate_count: 2,
    duplicates: [
      {
        id: 101,
        asset_id: 101,
        tenant_id: 1,
        tag_number: '12-H-1101',
        name: 'Exchanger A',
        description: 'Primary cooler',
        asset_class: 'HEATER',
        asset_type: 'SHELL_TUBE',
        status: 'active',
        has_funcloc: true,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
      },
      {
        id: 102,
        asset_id: 102,
        tenant_id: 1,
        tag_number: '12-H-1101',
        name: 'Exchanger A Copy',
        description: 'Duplicate record',
        asset_class: 'HEATER',
        asset_type: 'SHELL_TUBE',
        status: 'draft',
        has_funcloc: false,
        created_at: '2026-03-02T11:00:00Z',
        updated_at: '2026-03-02T11:00:00Z',
      },
    ],
  },
  {
    tag_number: '21-P-101A',
    duplicate_count: 2,
    duplicates: [
      {
        id: 201,
        asset_id: 201,
        tenant_id: 1,
        tag_number: '21-P-101A',
        name: 'Pump Main',
        asset_class: 'PUMP',
        status: 'operating',
        has_funcloc: true,
        created_at: '2026-02-15T08:00:00Z',
        updated_at: '2026-02-15T08:00:00Z',
      },
      {
        id: 202,
        asset_id: 202,
        tenant_id: 1,
        tag_number: '21-P-101A',
        name: 'Pump Ghost',
        asset_class: 'PUMP',
        status: 'pending',
        has_funcloc: false,
        created_at: '2026-02-16T09:00:00Z',
        updated_at: '2026-02-16T09:00:00Z',
      },
    ],
  },
];

describe('DuplicateResolutionModal', () => {
  it('does not render when open is false', () => {
    const { container } = render(
      <DuplicateResolutionModal
        open={false}
        groups={mockGroups}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders groups in accordions with Smart Merge banner, comparison rows and badges', () => {
    render(
      <DuplicateResolutionModal
        open={true}
        groups={mockGroups}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );

    expect(screen.getByText('Resolve Duplicate Equipment Tags')).toBeInTheDocument();
    // Smart Merge info banner
    expect(screen.getByText(/Smart Merge:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Missing properties in your kept asset will be safely filled using data from the deleted duplicates\./i
      )
    ).toBeInTheDocument();

    expect(screen.getByText('12-H-1101')).toBeInTheDocument();
    expect(screen.getByText('21-P-101A')).toBeInTheDocument();
    expect(screen.getByText('Exchanger A')).toBeInTheDocument();
    expect(screen.getByText('Exchanger A Copy')).toBeInTheDocument();
    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('#102')).toBeInTheDocument();
  });

  it('collapses and expands accordion groups when toggled', () => {
    render(
      <DuplicateResolutionModal
        open={true}
        groups={mockGroups}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /12-H-1101/i,
    });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Exchanger A')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Exchanger A')).toBeInTheDocument();
  });

  it('resolves duplicate when Keep & Merge Data is clicked', async () => {
    const handleResolve = vi.fn().mockResolvedValue(undefined);
    const handleRevalidate = vi.fn().mockResolvedValue(undefined);

    render(
      <DuplicateResolutionModal
        open={true}
        groups={[mockGroups[0]]}
        onClose={vi.fn()}
        onResolve={handleResolve}
        onRevalidate={handleRevalidate}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Keep & Merge Data/i });
    expect(buttons).toHaveLength(2);

    // Keep asset 101, merge and delete 102
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(handleResolve).toHaveBeenCalledWith({
        kept_asset_id: 101,
        deleted_asset_ids: [102],
      });
    });

    expect(handleRevalidate).toHaveBeenCalledOnce();
  });

  it('disables all resolve buttons while resolving is in-flight', async () => {
    let resolvePromise: (val?: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    const handleResolve = vi.fn().mockReturnValue(pendingPromise);

    render(
      <DuplicateResolutionModal
        open={true}
        groups={mockGroups}
        onClose={vi.fn()}
        onResolve={handleResolve}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Keep & Merge Data/i });
    fireEvent.click(buttons[0]);

    // During flight, resolving button shows spinner/text and other buttons are disabled
    expect(screen.getByText('Merging...')).toBeInTheDocument();
    const remainingButtons = screen.getAllByRole('button', { name: /Keep & Merge Data/i });
    remainingButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });

    await act(async () => {
      resolvePromise!();
    });
  });

  it('displays error message if onResolve fails', async () => {
    const handleResolve = vi.fn().mockRejectedValue(new Error('Network failure'));

    render(
      <DuplicateResolutionModal
        open={true}
        groups={[mockGroups[0]]}
        onClose={vi.fn()}
        onResolve={handleResolve}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Keep & Merge Data/i });
    fireEvent.click(buttons[0]);

    expect(await screen.findByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(/Network failure/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <DuplicateResolutionModal
        open={true}
        groups={mockGroups}
        onClose={handleClose}
        onResolve={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Close duplicate resolution modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledOnce();
  });
});
