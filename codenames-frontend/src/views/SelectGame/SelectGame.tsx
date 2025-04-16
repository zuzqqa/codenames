import { useNavigate } from "react-router-dom"; // Importing the navigate hook from React Router
import { useState } from "react"; // Importing useState hook for managing component state
import { useTranslation } from "react-i18next"; // Importing the useTranslation hook from react-i18next

import BackgroundContainer from "../../containers/Background/Background";
import MenuContainer from "../../containers/Menu/Menu";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";
import Button from "../../components/Button/Button";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import settingsIcon from "../../assets/icons/settings.png";

import "../../styles/App.css";
import "./SelectGame.css";
import {logout} from "../../shared/utils.tsx";
import Cookies from 'js-cookie';
import logoutButton from "../../assets/icons/logout.svg";

/**
 * Props for the SelectGame component.
 * @typedef {Object} SelectGameProps
 * @property {function(number): void} setVolume - Function to set the global volume.
 * @property {number} soundFXVolume - Current sound effect volume level.
 * @property {function(number): void} setSoundFXVolume - Function to set the sound effect volume.
 */
interface SelectGameProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * SelectGame component allows users to create or join a game.
 *
 * @param {SelectGameProps} props - Component properties.
 * @returns {JSX.Element} The rendered SelectGame component.
 */
const SelectGame: React.FC<SelectGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // State to manage music volume
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State to track if settings modal is open
  const { t } = useTranslation(); // Hook for translations

  const navigate = useNavigate(); // Hook for navigation

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  /**
   * Updates the music volume both locally and globally.
   *
   * @param {number} volume - The new music volume level.
   */
  const updateMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    setVolume(volume); // Update global volume
  };
  
  return (
    <>
      <BackgroundContainer>
        {/* Settings button */}
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>
    
        {/* Logout button */}
        {document.cookie.split('; ').find(cookie => cookie.startsWith('loggedIn=')) && (
                <Button variant="logout" soundFXVolume={soundFXVolume}>
                <img
                    src={logoutButton}
                    onClick={logout}
                    alt="Logout"
                />
            </Button>
        )}

        {/* Settings modal */}
        <SettingsModal
          isOpen={isSettingsOpen} 
          onClose={toggleSettings}
          musicVolume={musicVolume} 
          soundFXVolume={soundFXVolume}
          setMusicVolume={updateMusicVolume}
          setSoundFXVolume={setSoundFXVolume}
        />

        {/* Main content of the SelectGame page */}
        <TitleComponent soundFXVolume={soundFXVolume}>
          Codenames
        </TitleComponent>
        <CharactersComponent /> {/* Renders the characters component */}
        <SubtitleComponent variant="primary">
          { t('home-subtitle') }
        </SubtitleComponent>

        {/* Menu section with options for creating or joining a room */}
        <MenuContainer>
          <div className="first-column">
            <Button
              variant="room" // Button variant for creating a room
              onClick={() => navigate("/create-game")} // Navigates to create game page
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{ t('create-game-button') }</span>
            </Button>
          </div>
          <div className="gold-bar"></div>
          <div className="second-column">
            <Button
              variant="room" // Button variant for joining a room
              onClick={() => navigate("/join-game")} // Navigates to join game page
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{ t('join-room-button') }</span>
            </Button>
          </div>
        </MenuContainer>
      </BackgroundContainer>
    </>
  );
};

export default SelectGame;
