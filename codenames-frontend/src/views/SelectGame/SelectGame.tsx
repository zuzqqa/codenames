import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";

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
import { logout } from "../../shared/utils.tsx";
import logoutButton from "../../assets/icons/logout.svg";
import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";
import Profile from "../../components/Profile/Profile.tsx";

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
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { t } = useTranslation();

  const navigate = useNavigate();

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
    setVolume(volume);
  };

  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  return (
    <>
      <BackgroundContainer>
        <Profile soundFXVolume={soundFXVolume}/>
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={toggleSettings}
        >
          <img src={settingsIcon} alt="Settings"/>
        </Button>
        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button variant="logout" soundFXVolume={soundFXVolume}>
            <img src={logoutButton} onClick={logout} alt="Logout"/>
          </Button>
        )}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          musicVolume={musicVolume}
          soundFXVolume={soundFXVolume}
          setMusicVolume={updateMusicVolume}
          setSoundFXVolume={setSoundFXVolume}
        />
        <TitleComponent soundFXVolume={soundFXVolume}>Codenames</TitleComponent>
        <CharactersComponent/>
        <SubtitleComponent variant="primary">
          {t("home-subtitle")}
        </SubtitleComponent>
        <MenuContainer>
          <div className="first-column">
            <Button
              variant="room"
              onClick={() => navigate("/create-game")}
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{t("create-game-button")}</span>
            </Button>
          </div>
          <div className="gold-bar"></div>
          <div className="second-column">
            <Button
              variant="room"
              onClick={() => navigate("/join-game")}
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{t("join-room-button")}</span>
            </Button>
          </div>
        </MenuContainer>
        <UsernameContainer/>
      </BackgroundContainer>
    </>
  );
};

export default SelectGame;
