// platform/frontend-mui/src/features/floc/components/FlocTreeNode.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlocTreeNode } from './FlocTreeNode';
import type { FlocNode } from '../../../types/floc';

const sampleNodeWithChildren: FlocNode = {
  id: 1,
  tenant_id: 1,
  code: 'CORP-REK',
  description: 'PT Reksolindo Energy Corp',
  level: 1,
  is_active: true,
  installed_equipment_count: 0,
  children: [
    {
      id: 2,
      tenant_id: 1,
      parent_id: 1,
      code: 'JI-JL-AG-11-PW',
      description: 'Produced Water System',
      level: 5,
      is_active: true,
      installed_equipment_count: 3,
      equipments: [
        {
          id: 101,
          tag_number: 'P-101A',
          name: 'Produced Water Pump A',
          asset_class: 'Pump',
          asset_type: 'Centrifugal',
          status: 'Installed',
          criticality: 4,
        },
      ],
      children: [],
    },
  ],
};

describe('FlocTreeNode', () => {
  it('renders node code, description, and level badge', () => {
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    render(
      <FlocTreeNode
        node={sampleNodeWithChildren}
        selectedId={null}
        expandedIds={new Set()}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('CORP-REK')).toBeInTheDocument();
    expect(screen.getByText('PT Reksolindo Energy Corp')).toBeInTheDocument();
    expect(screen.getByText('L1')).toBeInTheDocument();
  });

  it('renders chevron button for nodes with children and triggers onToggle', () => {
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    render(
      <FlocTreeNode
        node={sampleNodeWithChildren}
        selectedId={null}
        expandedIds={new Set()}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    const chevronBtn = screen.getByRole('button', { name: /Toggle CORP-REK/i });
    expect(chevronBtn).toBeInTheDocument();

    fireEvent.click(chevronBtn);
    expect(onToggle).toHaveBeenCalledWith(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects node when the row is clicked', () => {
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    render(
      <FlocTreeNode
        node={sampleNodeWithChildren}
        selectedId={null}
        expandedIds={new Set()}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('CORP-REK'));
    expect(onSelect).toHaveBeenCalledWith(sampleNodeWithChildren);
  });

  it('renders recursive children when expanded', () => {
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    // Expanded with ID 1
    const { rerender } = render(
      <FlocTreeNode
        node={sampleNodeWithChildren}
        selectedId={null}
        expandedIds={new Set([1])}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('JI-JL-AG-11-PW')).toBeInTheDocument();
    expect(screen.getByText('Produced Water System')).toBeInTheDocument();
    expect(screen.getByText('L5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Installed equipment count badge

    // Re-render collapsed
    rerender(
      <FlocTreeNode
        node={sampleNodeWithChildren}
        selectedId={null}
        expandedIds={new Set()}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    expect(screen.queryByText('JI-JL-AG-11-PW')).not.toBeInTheDocument();
  });
});

