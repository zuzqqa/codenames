import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SettingsModal from "../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../components/UserProfileOverlay/ProfileModal";
import { getCookie } from "../shared/utils";
import { apiUrl } from "../config/api";
import { useToast } from "../components/Toast/ToastContext";

type ModalContextValue = {
  openSettings: () => void;
  closeSettings: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  canOpenProfile: boolean | null;
}

const ModalContext = createContext<ModalContextValue>({
  openSettings: () => {},
  closeSettings: () => {},
  openProfile: () => {},
  closeProfile: () => {},
  canOpenProfile: null,
});

type Props = { children: ReactNode };

export const ModalProvider: React.FC<Props> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [canOpenProfile, setCanOpenProfile] = useState<boolean | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    // Determine if current user can open profile (is authenticated and not guest)
    const check = async () => {
      const token = getCookie('authToken');
      if (!token) {
        setCanOpenProfile(false);
        return;
      }
      try {
        const resp = await fetch(`${apiUrl}/api/users/is-guest`, {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          setCanOpenProfile(false);
          return;
        }
        const isGuest = await resp.json();
        setCanOpenProfile(!isGuest);
      } catch (e) {
        setCanOpenProfile(false);
        addToast('Failed to determine profile availability', 'error');
      }
    };
    check();
  }, []);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const openProfile = () => {
    if (canOpenProfile) setIsProfileOpen(true);
  };
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <ModalContext.Provider value={{ openSettings, closeSettings, openProfile, closeProfile, canOpenProfile }}>
      {children}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        // props will be noop when not provided by consumer; consumers should manage volumes via global state
        musicVolume={Number(localStorage.getItem('musicVolume')) || 50}
        soundFXVolume={Number(localStorage.getItem('soundFXVolume')) || 50}
        setMusicVolume={(v: number) => { localStorage.setItem('musicVolume', String(v)); }}
        setSoundFXVolume={(v: number) => { localStorage.setItem('soundFXVolume', String(v)); }}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={closeProfile}
        soundFXVolume={Number(localStorage.getItem('soundFXVolume')) || 50}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);

