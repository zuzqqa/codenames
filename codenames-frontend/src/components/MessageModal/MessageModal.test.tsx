import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MessageModal from './MessageModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../config/api.tsx', () => ({
  apiUrl: 'http://localhost:8080',
}));

vi.mock('../Modal/Modal', () => ({
  default: ({ children, isOpen }: any) => (isOpen ? <div>{children}</div> : null),
}));

vi.mock('../TitleModal/TitleModal', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../Button/Button', () => ({
  default: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('MessageModal', () => {
  const mockOnClose = vi.fn();
  const mockSetIsConfirmationModalOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as any;

    globalThis.alert = vi.fn();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    expect(screen.getByText('message-us-title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-MAIL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MESSAGE')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MessageModal
        isOpen={false}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows alert when submitting with empty fields', async () => {
    const user = userEvent.setup();
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    const submitButton = screen.getByText('submit-button');
    await user.click(submitButton);

    expect(globalThis.alert).toHaveBeenCalledWith('Please fill in all fields.');
  });

  it('sends email successfully and opens confirmation modal', async () => {
    const user = userEvent.setup();
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    const emailInput = screen.getByPlaceholderText('E-MAIL');
    const messageTextarea = screen.getByPlaceholderText('MESSAGE');

    await user.type(emailInput, 'test@example.com');
    await user.type(messageTextarea, 'Test message');

    const submitButton = screen.getByText('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/email/send-report',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            dataToSend: 'MESSAGE: Test message',
          }),
        })
      );
    });

    expect(mockSetIsConfirmationModalOpen).toHaveBeenCalledWith(true);
  });

  it('clears form fields after successful submission', async () => {
    const user = userEvent.setup();
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    const emailInput = screen.getByPlaceholderText('E-MAIL') as HTMLInputElement;
    const messageTextarea = screen.getByPlaceholderText('MESSAGE') as HTMLTextAreaElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(messageTextarea, 'Test message');

    const submitButton = screen.getByText('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('');
      expect(messageTextarea.value).toBe('');
    });
  });

  it('shows loading spinner during submission', async () => {
    globalThis.fetch = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({}),
              }),
            100
          )
        )
    ) as any;

    const user = userEvent.setup();
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    const emailInput = screen.getByPlaceholderText('E-MAIL');
    const messageTextarea = screen.getByPlaceholderText('MESSAGE');

    await user.type(emailInput, 'test@example.com');
    await user.type(messageTextarea, 'Test message');

    const submitButton = screen.getByText('submit-button');
    await user.click(submitButton);

    expect(screen.getByAltText('Loading...')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByAltText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('handles API error gracefully', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    const emailInput = screen.getByPlaceholderText('E-MAIL');
    const messageTextarea = screen.getByPlaceholderText('MESSAGE');

    await user.type(emailInput, 'test@example.com');
    await user.type(messageTextarea, 'Test message');

    const submitButton = screen.getByText('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSetIsConfirmationModalOpen).not.toHaveBeenCalled();
    });
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MessageModal
        isOpen={true}
        onClose={mockOnClose}
        soundFXVolume={50}
        setIsConfirmationModalOpen={mockSetIsConfirmationModalOpen}
      />
    );

    const closeButton = screen.getByAltText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});