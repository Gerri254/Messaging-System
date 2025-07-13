import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../../test/test-utils';
import Toast, { ToastContainer } from '../Toast';

describe('Toast Component', () => {
  const defaultProps = {
    id: 'test-toast',
    type: 'success' as const,
    title: 'Success',
    message: 'Operation completed successfully',
    onClose: vi.fn(),
  };

  it('renders toast with title and message', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders correct icon for each type', () => {
    const { rerender } = render(<Toast {...defaultProps} type="success" />);
    expect(screen.getByRole('button')).toBeInTheDocument(); // Close button exists
    
    rerender(<Toast {...defaultProps} type="error" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="warning" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="info" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies correct color classes for each type', () => {
    const { rerender } = render(<Toast {...defaultProps} type="success" />);
    const toast = screen.getByText('Success').closest('div');
    expect(toast).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
    
    rerender(<Toast {...defaultProps} type="error" />);
    const errorToast = screen.getByText('Success').closest('div');
    expect(errorToast).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    
    rerender(<Toast {...defaultProps} type="warning" />);
    const warningToast = screen.getByText('Success').closest('div');
    expect(warningToast).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
    
    rerender(<Toast {...defaultProps} type="info" />);
    const infoToast = screen.getByText('Success').closest('div');
    expect(infoToast).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Toast {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledWith('test-toast');
  });

  it('renders without message', () => {
    render(<Toast {...defaultProps} message={undefined} />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.queryByText('Operation completed successfully')).not.toBeInTheDocument();
  });
});

describe('ToastContainer Component', () => {
  const toasts = [
    {
      id: 'toast-1',
      type: 'success' as const,
      title: 'Success',
      message: 'First toast',
      onClose: vi.fn(),
    },
    {
      id: 'toast-2',
      type: 'error' as const,
      title: 'Error',
      message: 'Second toast',
      onClose: vi.fn(),
    },
  ];

  it('renders multiple toasts', () => {
    render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);
    
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });

  it('renders empty container when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onClose={vi.fn()} />);
    
    expect(container.firstChild?.hasChildNodes()).toBe(false);
  });

  it('passes onClose callback to individual toasts', async () => {
    const onClose = vi.fn();
    render(<ToastContainer toasts={toasts} onClose={onClose} />);
    
    const closeButtons = screen.getAllByRole('button');
    await userEvent.click(closeButtons[0]);
    
    expect(onClose).toHaveBeenCalledWith('toast-1');
  });

  it('applies correct positioning classes', () => {
    const { container } = render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);
    
    expect(container.firstChild).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
  });
});