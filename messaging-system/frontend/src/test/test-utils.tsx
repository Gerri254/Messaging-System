import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect } from 'vitest';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockContact = (overrides = {}) => ({
  id: 'test-contact-id',
  userId: 'test-user-id',
  name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com',
  notes: 'Test contact',
  tags: ['friend'],
  customFields: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  userId: 'test-user-id',
  content: 'Test message content',
  messageType: 'SMS',
  status: 'SENT',
  totalRecipients: 1,
  successCount: 1,
  failedCount: 0,
  cost: 0.0075,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockTemplate = (overrides = {}) => ({
  id: 'test-template-id',
  userId: 'test-user-id',
  name: 'Test Template',
  content: 'Hello {{name}}, this is a test message.',
  variables: ['{{name}}'],
  category: 'Testing',
  isActive: true,
  usageCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  data: {
    message: 'Success',
    data,
  },
  status,
  headers: {},
});

export const mockApiError = (message = 'Test error', status = 400) => ({
  response: {
    data: {
      error: message,
    },
    status,
  },
});

// Custom matchers
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  expect(element).toHaveClass(className);
};

export const expectToBeDisabled = (element: HTMLElement | null) => {
  expect(element).toBeDisabled();
};

// Re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override render method
export { customRender as render };