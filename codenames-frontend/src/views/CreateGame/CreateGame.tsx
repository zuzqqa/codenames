import { useState, useEffect } from "react"; // Hook for managing component state
import { useTranslation } from "react-i18next"; // Translation hook

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import CreateGameForm from "../../components/CreateGameForm/CreateGameForm";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../../components/UserProfileOverlay/ProfileModal";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";

import "../../styles/App.css";
import "../SelectGame/SelectGame.css";
import "./CreateGame.css";
import {logout} from "../../shared/utils.tsx";
import logoutButton from "../../assets/icons/logout.svg";

/**
 * Props interface for CreateGame component.
 * @typedef {Object} CreateGameProps
 * @property {function(number): void} setVolume - Function to set global volume
 * @property {number} soundFXVolume - Current sound effects volume level
 * @property {function(number): void} setSoundFXVolume - Function to set sound effects volume
 */
interface CreateGameProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * CreateGame component allows users to create a new game session.
 * It includes settings management and user logout functionality.
 * 
 * @component
 * @param {CreateGameProps} props - Component properties
 * @returns {JSX.Element} The rendered CreateGame component
 */
const CreateGame: React.FC<CreateGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Tracks if the profile modal is open
  const { t } = useTranslation(); // Translation hook
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

    useEffect(() => {
      const fetchGuestStatus = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/users/isGuest", {
            method: "GET",
            credentials: "include",
          });
    
          if (response.ok) {
            const guestStatus = await response.json();
            setIsGuest(guestStatus);
          } else {
            console.error("Nie udało się pobrać statusu gościa");
          }
        } catch (error) {
          console.error("Błąd podczas pobierania statusu gościa", error);
        }
      };
    
      fetchGuestStatus();
    }, []);
  
  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>
        {/* Profile button */}
        {isGuest === false && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}

        {document.cookie.split('; ').find(cookie => cookie.startsWith('loggedIn=')) && (
                <Button variant="logout" soundFXVolume={soundFXVolume}>
                    <img
                        src={logoutButton}
                        onClick={logout}
                        alt="Logout"
                    />
                </Button>
            )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          musicVolume={musicVolume}
          soundFXVolume={soundFXVolume}
          setMusicVolume={(volume) => {
            setMusicVolume(volume); // Update local music volume
            setVolume(volume / 100); // Update global volume
          }}
          setSoundFXVolume={setSoundFXVolume}
        />
        {/* Profie modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={toggleProfile}
          soundFXVolume={soundFXVolume}
        />
        <>
          <GameTitleBar></GameTitleBar>
          <CreateGameForm soundFXVolume={soundFXVolume} />
        </>
      </BackgroundContainer>
    </>
  );
};

export default CreateGame;
