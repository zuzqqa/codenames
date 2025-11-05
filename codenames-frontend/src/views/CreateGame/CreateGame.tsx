import { useState, useEffect } from "react"; // Hook for managing component state
import { useTranslation } from "react-i18next";

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import CreateGameForm from "../../components/CreateGameForm/CreateGameForm";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../../components/UserProfileOverlay/ProfileModal";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";
import logoutButton from "../../assets/icons/logout.svg";

import "../../styles/App.css";
import "../SelectGame/SelectGame.css";
import "./CreateGame.css";

import { getCookie, logout } from "../../shared/utils.tsx";
import { apiUrl } from "../../config/api.tsx";
import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";
import Profile from "../../components/Profile/Profile.tsx";

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
  const { t } = useTranslation();

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <BackgroundContainer>
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={toggleSettings}
        >
          <img src={settingsIcon} alt="Settings" />
        </Button>
        <Profile soundFXVolume={soundFXVolume} />

        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button
            variant="logout"
            soundFXVolume={soundFXVolume}
            onClick={logout}
          >
            <img src={logoutButton} alt="Logout" />
          </Button>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          musicVolume={musicVolume}
          soundFXVolume={soundFXVolume}
          setMusicVolume={(volume) => {
            setMusicVolume(volume);
            setVolume(volume / 100);
          }}
          setSoundFXVolume={setSoundFXVolume}
        />
        <>
          <GameTitleBar></GameTitleBar>
          <CreateGameForm soundFXVolume={soundFXVolume} />
        </>
        <UsernameContainer />
      </BackgroundContainer>
    </>
  );
};

export default CreateGame;
