import { useNavigate } from "react-router-dom"; // Importing the navigate hook from React Router
import { useState } from "react"; // Importing useState hook for managing component state

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

// Defining the props interface for the SelectGame component
interface SelectGameProps {
  setVolume: (volume: number) => void; // Function to set the global volume
  soundFXVolume: number; // Current sound effect volume level
  setSoundFXVolume: (volume: number) => void; // Function to set the sound effect volume
}

// Main SelectGame component definition
const SelectGame: React.FC<SelectGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // State to manage music volume
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State to track if settings modal is open

  const navigate = useNavigate(); // Hook for navigation

  // Toggles the settings modal visibility
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <BackgroundContainer>
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

        {/* Main content of the SelectGame page */}
        <TitleComponent soundFXVolume={soundFXVolume}>
          Codenames
        </TitleComponent>
        <CharactersComponent /> {/* Renders the characters component */}
        <SubtitleComponent variant="primary">
          Your mission begins now
        </SubtitleComponent>

        {/* Menu section with options for creating or joining a room */}
        <MenuContainer>
          <div className="first-column">
            <Button
              variant="room" // Button variant for creating a room
              onClick={() => navigate("/create-game")} // Navigates to create game page
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">Create room</span>
            </Button>
          </div>
          <div className="gold-bar"></div>
          <div className="second-column">
            <Button
              variant="room" // Button variant for joining a room
              onClick={() => navigate("/join-game")} // Navigates to join game page
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">Join room</span>
            </Button>
          </div>
        </MenuContainer>
      </BackgroundContainer>
    </>
  );
};

export default SelectGame;
