import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation


import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import settingsIcon from "../../assets/icons/settings.png";
import compassImg from "../../assets/images/compass.png";
import profilePicImg from "../../assets/images/profile-pic.png";



import "./ChooseLeader.css";

// Define the type for props passed to the Gameplay component
interface ChooseLeaderProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

interface Player {
  username: string;
  profilePic: string;
}

// Main component definition
const ChooseLeader: React.FC<ChooseLeaderProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const navigate = useNavigate(); // Hook for navigation


  // Toggles the settings modal visibility
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const myTeam = [
    { username: "Player1", profilePic: profilePicImg },
    { username: "Player2", profilePic: profilePicImg },
    { username: "Player3", profilePic: profilePicImg },
  ];

  const opposingTeam = [
    { username: "Opponent1", profilePic: profilePicImg },
    { username: "Opponent2", profilePic: profilePicImg },
    { username: "Opponent3", profilePic: profilePicImg },
  ];

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player); // Update selected player
  };

  return (
    <>
      <BackgroundContainer>
        <GameTitleBar />
        {/* Settings button */}
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
        <div className="content-container flex-start">
            <div className="timer-container">
                <div className="horizontal-gold-bar"></div>
                <span className="timer">00:00</span>
            </div>
            <div className="compass-container">
            {selectedPlayer ? (
              <>
                <img src={compassImg} alt="compass" className="Compass"/>
                <div className="center align-center">
                  <span className="choose-leader-label">
                    You've chosen:
                  </span>
                  <div className="selected-player-info">
                  <img
                    src={selectedPlayer.profilePic}
                    alt={selectedPlayer.username}
                    className="selected-profile-pic"
                  />
                  <span className="selected-username">
                    {selectedPlayer.username}
                  </span>
                </div>
                  <Button variant="room" soundFXVolume={soundFXVolume} onClick={() => navigate("/gameplay")}>
                  <span className="button-text">Lock in</span>
                  </Button>  
                </div>            
              </>
            ) : (
              <>
                <img src={compassImg} alt="compass" className="Compass"/>
                <span className="choose-leader-label center">
                  Choose your<br />team leader
                </span>
              </>
            )}
          </div>
            <div className="teams-container">
            <div className="team my-team">
                {myTeam.map((player, index) => (
                  <div
                    key={index}
                    className={`player ${selectedPlayer?.username === player.username ? "selected" : ""}`}
                    onClick={() => handlePlayerClick(player)}
                  >
                    <img
                      src={player.profilePic}
                      alt={player.username}
                      className="profile-pic"
                    />
                    <span className="username my-team">{player.username}</span>
                  </div>
                ))}
            </div>

            <div className="team opposing-team">
                {opposingTeam.map((player, index) => (
                <div key={index} className="player opposing-player">
                    <span className="username opposing-team">{player.username}</span>
                    <img src={player.profilePic} alt={player.username} className="profile-pic" />
                </div>
                ))}
            </div>
            </div>
        </div>
      </BackgroundContainer>
    </>
  );
};

export default ChooseLeader;
