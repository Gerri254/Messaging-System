import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../../test/test-utils';
import Modal from '../Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  it('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    // Click on the overlay (backdrop)
    const backdrop = screen.getByText('Modal Content').closest('div')?.parentElement;
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    }
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);
    
    const backdrop = screen.getByText('Modal Content').closest('div')?.parentElement;
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    const modal = screen.getByText('Modal Content').closest('div');
    expect(modal).toHaveClass('max-w-sm');
    
    rerender(<Modal {...defaultProps} size="lg" />);
    const modalLg = screen.getByText('Modal Content').closest('div');
    expect(modalLg).toHaveClass('max-w-lg');
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('handles escape key press', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    // Simulate escape key
    vi.spyOn(document, 'addEventListener');
    
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});