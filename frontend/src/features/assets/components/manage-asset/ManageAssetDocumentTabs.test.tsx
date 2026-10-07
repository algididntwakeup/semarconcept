import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ManageAssetImageTab from './ManageAssetImageTab';
import ManageAssetFileTab from './ManageAssetFileTab';
import {
  SAMPLE_DOCUMENTS,
  categoryBadgeClass,
  formatFileSize,
  formatUploadDate,
} from './manageAssetDocuments';

describe('manageAssetDocuments helpers', () => {
  it('formats file sizes and upload dates like the legacy list', () => {
    expect(formatFileSize(3_460_000)).toBe('3.3 MB');
    expect(formatFileSize(245_000)).toBe('239 KB');
    expect(formatFileSize(undefined)).toBe('—');
    expect(formatUploadDate('2026-09-30')).toBe('30 Sept 2026');
    expect(formatUploadDate('not-a-date')).toBe('—');
  });

  it('colours badges per category and falls back for unknown ones', () => {
    expect(categoryBadgeClass('Drawing')).toContain('purple');
    expect(categoryBadgeClass('REPORT')).toContain('blue');
    expect(categoryBadgeClass('Certificate')).toContain('emerald');
    expect(categoryBadgeClass('Unknown')).toContain('slate');
  });
});

describe('ManageAssetImageTab', () => {
  it('renders the header, action bar, and empty dropzone', () => {
    render(<ManageAssetImageTab tag="P-101" onFilesAdded={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '[P-101] Image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Data Source' })).toBeInTheDocument();
    expect(screen.getByText('Image Annotations (0 images)')).toBeInTheDocument();
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText('No images yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Upload P&ID drawings, maps, or photos to annotate and link with asset locations'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Click or drag & drop to upload')).toBeInTheDocument();
  });

  it('counts and lists images added through the dropzone', async () => {
    const onFilesAdded = vi.fn();
    const { container } = render(<ManageAssetImageTab tag="P-101" onFilesAdded={onFilesAdded} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'pid-1200.png', { type: 'image/png' });
    await userEvent.upload(input, file);

    expect(onFilesAdded).toHaveBeenCalledWith([file]);
    expect(screen.getByText('Image Annotations (1 images)')).toBeInTheDocument();
    expect(screen.getByText('pid-1200.png')).toBeInTheDocument();
    expect(screen.queryByText('No images yet')).not.toBeInTheDocument();
  }, 15000);
});

describe('ManageAssetFileTab', () => {
  it('lists the seeded documents with badges, size, and date', () => {
    render(<ManageAssetFileTab onFilesAdded={vi.fn()} />);

    expect(screen.getByText(`Files (${SAMPLE_DOCUMENTS.length})`)).toBeInTheDocument();
    expect(screen.getByText('P&ID-1200-Rev-C.pdf')).toBeInTheDocument();
    expect(screen.getByText('3.3 MB · 30 Sept 2026')).toBeInTheDocument();
    // "Drawing"/"Document" also appear in the category picker, so scope the
    // badge assertions to the list items.
    const list = screen.getByRole('list');
    expect(within(list).getByText('Drawing')).toBeInTheDocument();
    expect(within(list).getByText('Report')).toBeInTheDocument();
    expect(within(list).getByText('Certificate')).toBeInTheDocument();
    // The external link renders with its URL as the name.
    expect(
      screen.getByText('https://dms.example.com/assets/P-101/overview')
    ).toBeInTheDocument();
  });

  it('offers the category picker and an Add External Link action', () => {
    render(<ManageAssetFileTab onFilesAdded={vi.fn()} />);

    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add External Link/ })).toBeInTheDocument();
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
  });

  it('adds a dropped file to the list and bumps the count', async () => {
    const onFilesAdded = vi.fn();
    const { container } = render(<ManageAssetFileTab onFilesAdded={onFilesAdded} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['pdf'], 'Datasheet-P101.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    expect(onFilesAdded).toHaveBeenCalledWith([file]);
    expect(screen.getByText(`Files (${SAMPLE_DOCUMENTS.length + 1})`)).toBeInTheDocument();
    expect(screen.getByText('Datasheet-P101.pdf')).toBeInTheDocument();
  }, 15000);

  it('adds an external link through the dialog and rejects an invalid URL', async () => {
    const onNotify = vi.fn();
    render(<ManageAssetFileTab onFilesAdded={vi.fn()} onNotify={onNotify} />);

    await userEvent.click(screen.getByRole('button', { name: /Add External Link/ }));
    const dialog = screen.getByRole('dialog', { name: 'Add External Link' });

    // A bare value is rejected instead of being saved.
    await userEvent.type(within(dialog).getByLabelText('External link URL'), 'not-a-url');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add Link' }));
    expect(screen.getByRole('alert')).toHaveTextContent('http://');

    await userEvent.clear(within(dialog).getByLabelText('External link URL'));
    await userEvent.type(
      within(dialog).getByLabelText('External link URL'),
      'https://dms.example.com/new-doc'
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add Link' }));

    expect(screen.getByText('https://dms.example.com/new-doc')).toBeInTheDocument();
    expect(onNotify).toHaveBeenCalledWith(
      expect.stringContaining('https://dms.example.com/new-doc')
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }, 15000);

  it('collapses and expands the Files list', async () => {
    render(<ManageAssetFileTab onFilesAdded={vi.fn()} />);

    const header = screen.getByRole('button', { name: /Files \(/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(header);
    expect(screen.getByRole('button', { name: /Files \(/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByText('P&ID-1200-Rev-C.pdf')).not.toBeInTheDocument();
  }, 15000);
});
