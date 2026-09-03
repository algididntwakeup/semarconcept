import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import FileUpload from './FileUpload';

// Mock the onUpload function
const mockOnUpload = vi.fn(() => Promise.resolve());

describe('FileUpload Component', () => {
  beforeEach(() => {
    mockOnUpload.mockClear();
  });

  it('renders the dropzone text', () => {
    render(<FileUpload onUpload={mockOnUpload} />);
    expect(screen.getByText(/drag 'n' drop some files here/i)).toBeInTheDocument();
    expect(screen.getByText(/click to select files/i)).toBeInTheDocument();
  });

  it('displays accepted file types and max size', () => {
    render(
      <FileUpload
        onUpload={mockOnUpload}
        acceptedFileTypes="image/png,image/jpeg"
        maxFileSize={2 * 1024 * 1024}
      />
    );
    expect(
      screen.getByText(/\(Accepted: image\/png,image\/jpeg, Max size: 2MB\)/i)
    ).toBeInTheDocument();
  });

  // Note: Testing the actual drop event is complex with @testing-library/user-event
  // It often requires mocking the DataTransfer object.
  // We'll focus on testing the state changes after files are conceptually added.

  it('shows added files in the list', async () => {
    const file = new File(['image'], 'hello.png', { type: 'image/png' });
    const { container } = render(<FileUpload onUpload={mockOnUpload} />);

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });

    expect(await screen.findByText('hello.png')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload 1 file/i })).toBeEnabled();
  });

  it('calls onUpload when upload button is clicked', async () => {
    const user = userEvent.setup();
    const file = new File(['image'], 'asset.png', { type: 'image/png' });
    const { container } = render(<FileUpload onUpload={mockOnUpload} />);

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });
    await user.click(await screen.findByRole('button', { name: /upload 1 file/i }));

    await waitFor(() => expect(mockOnUpload).toHaveBeenCalledWith([file]));
    expect(await screen.findByText('Uploaded')).toBeInTheDocument();
  });
});
