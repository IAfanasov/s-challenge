import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import Home from './page';

global.React = React;

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}));

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(() => ({
    matches: false,
  })),
});

type MockResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

global.fetch = vi.fn() as unknown as typeof fetch;

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: [],
    error: null,
    refetch: vi.fn(),
    isLoading: false
  }),
  useQueryClient: vi.fn().mockReturnValue({
    setQueryData: vi.fn()
  })
}));

vi.mock('@/lib/SocketContext', () => ({
  useSocket: vi.fn().mockReturnValue({
    socket: { on: vi.fn(), off: vi.fn() },
    isConnected: true
  }),
  SocketProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/lib/logger/LoggerContext', () => ({
  useLogger: vi.fn().mockReturnValue({
    error: console.error
  }),
  LoggerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => []
    } as MockResponse);
  });

  const renderComponent = () => {
    return render(<Home />);
  };

  it('should not call the API when message is empty', async () => {
    renderComponent();
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);
    
    expect(global.fetch).not.toHaveBeenCalledWith('/api/messages', expect.anything());
  });

  it('should not call the API when user name is empty', async () => {
    renderComponent();
    const messageInput = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(messageInput, { target: { value: 'Hello world' } });
    
    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);
    
    expect(global.fetch).not.toHaveBeenCalledWith('/api/messages', expect.anything());
  });

  it('calls the API when both user name and message are filled', async () => {
    renderComponent();
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    const messageInput = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(messageInput, { target: { value: 'Hello world' } });
    
    const form = screen.getByRole('button', { name: 'Send' }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'Test User',
          content: 'Hello world',
        }),
      });
    });
  });
}); 