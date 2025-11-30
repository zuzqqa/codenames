import React, { useEffect, useState } from "react";

import Button from "../../components/Button/Button";
import BackgroundContainer from "../../containers/Background/Background";
import settingsIcon from "../../assets/icons/settings.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import RoomLobby from "../../components/RoomLobby/RoomLobby";

import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";
import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";
import Profile from "../../components/Profile/Profile.tsx";

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
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume} onClick={toggleSettings}>
          <img src={settingsIcon} alt="Settings"/>
        </Button>

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
        <Profile soundFXVolume={soundFXVolume}/>
        <>
          <GameTitleBar></GameTitleBar>
          <RoomLobby soundFXVolume={soundFXVolume}/>
          <UsernameContainer/>
        </>
      </BackgroundContainer>
    </>
  );
};

export default GameLobby;
