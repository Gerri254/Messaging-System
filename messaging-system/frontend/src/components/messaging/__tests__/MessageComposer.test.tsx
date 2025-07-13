import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../../test/test-utils';
import MessageComposer from '../MessageComposer';
import { createMockContact, createMockTemplate } from '../../../test/test-utils';

// Mock the store hooks
vi.mock('../../../store/messageStore', () => ({
  useMessageStore: () => ({
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
    sendBulkMessage: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../../../hooks/useSmsService', () => ({
  useSmsService: () => ({
    calculateCost: vi.fn().mockReturnValue({
      segments: 1,
      costPerSegment: 0.0075,
      totalCost: 0.0075,
    }),
    validateMessage: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
    }),
    estimateDeliveryTime: vi.fn().mockReturnValue({
      estimatedMinutes: 1,
      description: 'Within 1 minute',
    }),
  }),
}));

describe('MessageComposer Component', () => {
  const defaultProps = {
    selectedContacts: [createMockContact()],
    selectedTemplate: null,
    onContactsChange: vi.fn(),
    onTemplateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders message composer interface', () => {
    render(<MessageComposer {...defaultProps} />);
    
    expect(screen.getByText('Compose Message')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('displays selected contacts count', () => {
    const contacts = [createMockContact(), createMockContact({ id: 'contact-2' })];
    render(<MessageComposer {...defaultProps} selectedContacts={contacts} />);
    
    expect(screen.getByText('2 recipients selected')).toBeInTheDocument();
  });

  it('shows template content when template is selected', () => {
    const template = createMockTemplate({
      content: 'Hello {{name}}, this is a template message.',
    });
    
    render(<MessageComposer {...defaultProps} selectedTemplate={template} />);
    
    expect(screen.getByDisplayValue('Hello {{name}}, this is a template message.')).toBeInTheDocument();
  });

  it('enables send button when message and contacts are provided', async () => {
    render(<MessageComposer {...defaultProps} />);
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Initially disabled
    expect(sendButton).toBeDisabled();
    
    // Type message
    await userEvent.type(messageInput, 'Test message');
    
    // Should be enabled now
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('disables send button when no contacts selected', async () => {
    render(<MessageComposer {...defaultProps} selectedContacts={[]} />);
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(messageInput, 'Test message');
    
    expect(sendButton).toBeDisabled();
  });

  it('shows character count', async () => {
    render(<MessageComposer {...defaultProps} />);
    
    const messageInput = screen.getByRole('textbox');
    await userEvent.type(messageInput, 'Hello world');
    
    expect(screen.getByText('11/1600 characters')).toBeInTheDocument();
  });

  it('shows SMS segments when message is long', async () => {
    render(<MessageComposer {...defaultProps} />);
    
    const messageInput = screen.getByRole('textbox');
    const longMessage = 'A'.repeat(161); // More than 160 characters
    
    await userEvent.type(messageInput, longMessage);
    
    expect(screen.getByText(/2 SMS segments/)).toBeInTheDocument();
  });

  it('displays cost estimation', () => {
    render(<MessageComposer {...defaultProps} />);
    
    expect(screen.getByText('$0.0075')).toBeInTheDocument();
  });

  it('displays delivery time estimation', () => {
    render(<MessageComposer {...defaultProps} />);
    
    expect(screen.getByText('Within 1 minute')).toBeInTheDocument();
  });

  it('shows scheduling options when schedule toggle is enabled', async () => {
    render(<MessageComposer {...defaultProps} />);
    
    const scheduleToggle = screen.getByLabelText(/schedule for later/i);
    await userEvent.click(scheduleToggle);
    
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
  });

  it('processes template variables correctly', async () => {
    const template = createMockTemplate({
      content: 'Hello {{name}}, welcome to {{company}}!',
    });
    const contact = createMockContact({
      name: 'John Doe',
      customFields: { company: 'Test Corp' },
    });
    
    render(
      <MessageComposer
        {...defaultProps}
        selectedTemplate={template}
        selectedContacts={[contact]}
      />
    );
    
    expect(screen.getByDisplayValue('Hello {{name}}, welcome to {{company}}!')).toBeInTheDocument();
  });

  it('sends message when send button is clicked', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(require('../../../store/messageStore').useMessageStore).mockReturnValue({
      sendMessage,
      sendBulkMessage: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(<MessageComposer {...defaultProps} />);
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        content: 'Test message',
        recipients: expect.arrayContaining([
          expect.objectContaining({
            phone: '+1234567890',
            name: 'John Doe',
          }),
        ]),
      });
    });
  });

  it('sends bulk message for multiple recipients', async () => {
    const sendBulkMessage = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(require('../../../store/messageStore').useMessageStore).mockReturnValue({
      sendMessage: vi.fn(),
      sendBulkMessage,
      isLoading: false,
      error: null,
    });
    
    const contacts = [
      createMockContact(),
      createMockContact({ id: 'contact-2' }),
    ];
    
    render(<MessageComposer {...defaultProps} selectedContacts={contacts} />);
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(messageInput, 'Test bulk message');
    await userEvent.click(sendButton);
    
    await waitFor(() => {
      expect(sendBulkMessage).toHaveBeenCalledWith({
        content: 'Test bulk message',
        contactIds: ['test-contact-id', 'contact-2'],
      });
    });
  });

  it('includes scheduled date when scheduling is enabled', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(require('../../../store/messageStore').useMessageStore).mockReturnValue({
      sendMessage,
      sendBulkMessage: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(<MessageComposer {...defaultProps} />);
    
    const messageInput = screen.getByRole('textbox');
    const scheduleToggle = screen.getByLabelText(/schedule for later/i);
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(messageInput, 'Scheduled message');
    await userEvent.click(scheduleToggle);
    
    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    
    await userEvent.type(dateInput, '2024-12-31');
    await userEvent.type(timeInput, '15:30');
    
    await userEvent.click(sendButton);
    
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledAt: expect.any(Date),
        })
      );
    });
  });

  it('shows success message after sending', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(require('../../../store/messageStore').useMessageStore).mockReturnValue({
      sendMessage,
      sendBulkMessage: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(<MessageComposer {...defaultProps} />);
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });

  it('resets form after successful send', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ success: true });
    const onContactsChange = vi.fn();
    const onTemplateChange = vi.fn();
    
    vi.mocked(require('../../../store/messageStore').useMessageStore).mockReturnValue({
      sendMessage,
      sendBulkMessage: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(
      <MessageComposer
        {...defaultProps}
        onContactsChange={onContactsChange}
        onTemplateChange={onTemplateChange}
      />
    );
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
      expect(onContactsChange).toHaveBeenCalledWith([]);
      expect(onTemplateChange).toHaveBeenCalledWith(null);
    });
  });
});