import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../components/Button/Button";
import BackgroundContainer from "../../containers/Background/Background";
import settingsIcon from "../../assets/icons/settings.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import RoomLobby from "../../components/RoomLobby/RoomLobby";

import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";

/**
 * Props interface for GameLobby component.
 * @typedef {Object} GameLobbyProps
 * @property {function(number): void} setVolume - Function to set global volume
 * @property {number} soundFXVolume - Current sound effects volume level
 * @property {function(number): void} setSoundFXVolume - Function to set sound effects volume
 */
interface GameLobbyProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * GameLobby component serves as the waiting area before a game starts.
 * It includes settings management and volume adjustments.
 *
 * @component
 * @param {GameLobbyProps} props - Component properties
 * @returns {JSX.Element} The rendered GameLobby component
 */
const GameLobby: React.FC<GameLobbyProps> = ({
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
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>

        {/* Settings modal */}
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
        <>
          <GameTitleBar></GameTitleBar>
          <RoomLobby soundFXVolume={soundFXVolume} />
        </>
      </BackgroundContainer>
    </>
  );
};

export default GameLobby;
