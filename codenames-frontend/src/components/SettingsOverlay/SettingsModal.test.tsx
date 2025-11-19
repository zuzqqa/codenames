import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsModal from './SettingsModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../Modal/Modal', () => ({
  default: ({ children, isOpen }: any) => (isOpen ? <div>{children}</div> : null),
}));

vi.mock('../TitleModal/TitleModal', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../MessageModal/MessageModal', () => ({
  default: ({ isOpen, onClose, setIsConfirmationModalOpen }: any) =>
    isOpen ? (
      <div>
        <div>Message Modal</div>
        <button
          onClick={() => {
            setIsConfirmationModalOpen(true);
            onClose();
          }}
        >
          Send
        </button>
      </div>
    ) : null,
}));

vi.mock('../LanguageSlider/LanguageSlider', () => ({
  default: () => <div>Language Slider</div>,
}));

vi.mock('../SettingsOverlay/SettingsFooter', () => ({
  default: () => <div>Settings Footer</div>,
}));

vi.mock('../Button/Button', () => ({
  default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe('SettingsModal', () => {
  const mockOnClose = vi.fn();
  const mockSetMusicVolume = vi.fn();
  const mockSetSoundFXVolume = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    expect(screen.getByText('settings-title')).toBeInTheDocument();
    expect(screen.getByText('settings-modal-p-music')).toBeInTheDocument();
    expect(screen.getByText('settings-modal-p-sound-fx')).toBeInTheDocument();
    expect(screen.getByText('settings-modal-p-language')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SettingsModal
        isOpen={false}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls setMusicVolume when music slider changes', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    const sliders = screen.getAllByRole('slider');
    const musicSlider = sliders[0];

    fireEvent.change(musicSlider, { target: { value: '75' } });

    expect(mockSetMusicVolume).toHaveBeenCalledWith(75);
  });

  it('calls setSoundFXVolume when sound effects slider changes', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    const sliders = screen.getAllByRole('slider');
    const soundFXSlider = sliders[1];

    fireEvent.change(soundFXSlider, { target: { value: '80' } });

    expect(mockSetSoundFXVolume).toHaveBeenCalledWith(80);
  });

  it('opens message modal when help button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    const helpButton = screen.getByText('settings-modal-p-send-message');
    await user.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('Message Modal')).toBeInTheDocument();
    });
  });

  it('closes all modals when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    const closeButton = screen.getByAltText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders language slider component', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    expect(screen.getByText('Language Slider')).toBeInTheDocument();
  });

  it('renders settings footer component', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        musicVolume={50}
        soundFXVolume={50}
        setMusicVolume={mockSetMusicVolume}
        setSoundFXVolume={mockSetSoundFXVolume}
      />
    );

    expect(screen.getByText('Settings Footer')).toBeInTheDocument();
  });
});