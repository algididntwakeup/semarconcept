import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EquipmentTaxonomyModal from './EquipmentTaxonomyModal';
import { assetService } from '../../../services/assetServices';
import type * as AssetServicesModule from '../../../services/assetServices';

vi.mock('../../../services/assetServices', async () => {
  const actual = await vi.importActual<typeof AssetServicesModule>('../../../services/assetServices');
  return {
    ...actual,
    assetService: {
      ...actual.assetService,
      getEquipmentTaxonomy: vi.fn(),
      createEquipmentTaxonomyValue: vi.fn(),
      updateEquipmentTaxonomyValue: vi.fn(),
      deleteEquipmentTaxonomyValue: vi.fn(),
      reapplyEquipmentTaxonomy: vi.fn(),
    },
  };
});

const renderModal = (props: Partial<React.ComponentProps<typeof EquipmentTaxonomyModal>> = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <EquipmentTaxonomyModal open onClose={vi.fn()} {...props} />
    </QueryClientProvider>
  );
};

describe('EquipmentTaxonomyModal', () => {
  beforeEach(() => {
    vi.mocked(assetService.getEquipmentTaxonomy).mockReset();
    vi.mocked(assetService.createEquipmentTaxonomyValue).mockReset();
    vi.mocked(assetService.deleteEquipmentTaxonomyValue).mockReset();
    vi.mocked(assetService.reapplyEquipmentTaxonomy).mockReset();
  });

  it('lists class and type mappings with their aliases', async () => {
    vi.mocked(assetService.getEquipmentTaxonomy).mockResolvedValue([
      {
        id: 1,
        tenant_id: 1,
        kind: 'class',
        canonical_code: 'PI',
        canonical_name: 'Piping',
        aliases: ['PI', 'Piping', 'Piping (PI)'],
        is_active: true,
      },
      {
        id: 2,
        tenant_id: 1,
        kind: 'type',
        canonical_code: 'CA',
        canonical_name: 'Carbon Steel',
        aliases: ['CA', 'Carbon Steel'],
        is_active: true,
      },
    ]);

    renderModal();

    // Class tab is active first, so Piping shows and Carbon Steel does not yet.
    // "PI" and "Piping" each appear twice (code chip + canonical name + alias),
    // so assert presence via getAllByText rather than a single-match query.
    expect(await screen.findAllByText('PI')).not.toHaveLength(0);
    expect(screen.getAllByText('Piping').length).toBeGreaterThan(0);
    expect(screen.queryByText('Carbon Steel')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Equipment Type \(1\)/ }));
    expect(await screen.findAllByText('Carbon Steel')).not.toHaveLength(0);
  }, 20000);

  it('adds a mapping with the entered aliases', async () => {
    vi.mocked(assetService.getEquipmentTaxonomy).mockResolvedValue([]);
    vi.mocked(assetService.createEquipmentTaxonomyValue).mockResolvedValue({
      id: 9,
      tenant_id: 1,
      kind: 'type',
      canonical_code: 'PG',
      canonical_name: 'Process Gas',
      aliases: ['PG', 'Process Gas'],
      is_active: true,
    });

    renderModal();

    await userEvent.click(screen.getByRole('button', { name: /Equipment Type/ }));
    await userEvent.type(screen.getByLabelText('Canonical code'), 'pg');
    await userEvent.type(screen.getByLabelText('Canonical name'), 'Process Gas');
    await userEvent.type(screen.getByLabelText('Aliases'), 'PG, Process Gas');
    await userEvent.click(screen.getByRole('button', { name: 'Add mapping' }));

    await waitFor(() =>
      expect(assetService.createEquipmentTaxonomyValue).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'type',
          canonical_code: 'pg',
          canonical_name: 'Process Gas',
          aliases: ['PG', 'Process Gas'],
        })
      )
    );
  }, 20000);

  it('surfaces unmapped import values as one-click suggestions', async () => {
    vi.mocked(assetService.getEquipmentTaxonomy).mockResolvedValue([]);

    renderModal({ suggestedUnmapped: { class: [], type: ['PG'] } });

    const suggestion = await screen.findByRole('button', { name: /PG/ });
    await userEvent.click(suggestion);

    // Clicking the suggestion prefills the type form with the raw code.
    expect(screen.getByLabelText('Canonical code')).toHaveValue('PG');
    expect(screen.getByLabelText('Aliases')).toHaveValue('PG');
  });

  it('re-applies the dictionary to imported equipment after confirmation', async () => {
    vi.mocked(assetService.getEquipmentTaxonomy).mockResolvedValue([]);
    vi.mocked(assetService.reapplyEquipmentTaxonomy).mockResolvedValue({
      checked_count: 2141,
      updated_count: 2141,
      unmapped_class: [],
      unmapped_type: ['PG'],
      dry_run: false,
    });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onNotify = vi.fn();

    renderModal({ onNotify });

    await userEvent.click(await screen.findByRole('button', { name: /Apply to equipment/ }));

    await waitFor(() => expect(assetService.reapplyEquipmentTaxonomy).toHaveBeenCalledWith(false));
    expect(onNotify).toHaveBeenCalledWith(
      expect.stringContaining('Dictionary re-applied to 2141 of 2141'),
      'info'
    );
    confirmSpy.mockRestore();
  }, 20000);

  it('deletes a mapping after confirmation', async () => {
    vi.mocked(assetService.getEquipmentTaxonomy).mockResolvedValue([
      {
        id: 5,
        tenant_id: 1,
        kind: 'class',
        canonical_code: 'ZZ',
        canonical_name: 'Zeta',
        aliases: ['ZZ'],
        is_active: true,
      },
    ]);
    vi.mocked(assetService.deleteEquipmentTaxonomyValue).mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderModal();

    await userEvent.click(await screen.findByRole('button', { name: 'Delete ZZ' }));

    await waitFor(() =>
      expect(assetService.deleteEquipmentTaxonomyValue).toHaveBeenCalledWith(5)
    );
    confirmSpy.mockRestore();
  });
});
