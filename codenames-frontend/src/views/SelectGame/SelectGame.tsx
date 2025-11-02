import {useNavigate} from "react-router-dom"; // Importing the navigate hook from React Router
import {useTranslation} from "react-i18next"; // Importing the useTranslation hook from react-i18next
import React, {useEffect, useState} from "react"; // Hook for managing component state
import BackgroundContainer from "../../containers/Background/Background";
import MenuContainer from "../../containers/Menu/Menu";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";
import Button from "../../components/Button/Button";
import {useModal} from "../../providers/ModalProvider";

import settingsIcon from "../../assets/icons/settings.png";
import profileIcon from "../../assets/icons/profile.png";

import "../../styles/App.css";
import "./SelectGame.css";
import {logout} from "../../shared/utils.tsx";
import logoutButton from "../../assets/icons/logout.svg";
import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";

/**
 * Props for the SelectGame component.
 * @typedef {Object} SelectGameProps
 * @property {function(number): void} setVolume - Function to set the global volume.
 * @property {number} soundFXVolume - Current sound effect volume level.
 */
interface SelectGameProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
}

/**
 * SelectGame component allows users to create or join a game.
 *
 * @param {SelectGameProps} props - Component properties.
 * @returns {JSX.Element} The rendered SelectGame component.
 */
const SelectGame: React.FC<SelectGameProps> = ({ soundFXVolume }) => {
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const { openSettings, openProfile, canOpenProfile } = useModal();

  const { t } = useTranslation(); // Hook for translations

  const navigate = useNavigate(); // Hook for navigation

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    openSettings();
  };

  const toggleProfile = () => {
    openProfile();
  };

  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  return (
    <>
      <BackgroundContainer>
        {/* Settings button */}
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={toggleSettings}
        >
          <img src={settingsIcon} alt="Settings" />
        </Button>
        {/* Profile button */}
        {canOpenProfile && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}
        {/* Logout button */}
        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button variant="logout" soundFXVolume={soundFXVolume}>
            <img src={logoutButton} onClick={logout} alt="Logout" />
          </Button>
        )}
        {/* Settings/Profile modals are rendered by ModalProvider */}
        {/* Main content of the SelectGame page */}
        <TitleComponent soundFXVolume={soundFXVolume}>Codenames</TitleComponent>
        <CharactersComponent /> {/* Renders the characters component */}
        <SubtitleComponent variant="primary">
          {t("home-subtitle")}
        </SubtitleComponent>
        {/* Menu section with options for creating or joining a room */}
        <MenuContainer>
          <div className="first-column">
            <Button
              variant="room" // Button variant for creating a room
              onClick={() => navigate("/create-game")} // Navigates to create game page
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{t("create-game-button")}</span>
            </Button>
          </div>
          <div className="gold-bar"></div>
          <div className="second-column">
            <Button
              variant="room" // Button variant for joining a room
              onClick={() => navigate("/join-game")} // Navigates to join game page
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{t("join-room-button")}</span>
            </Button>
          </div>
        </MenuContainer>
        <UsernameContainer />
      </BackgroundContainer>
    </>
  );
};

export default SelectGame;
