import Button from "../../components/Button/Button";
import BackgroundContainer from "../../containers/Background/Background";
import settingsIcon from "../../assets/icons/settings.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import RoomLobby from "../../components/RoomLobby/RoomLobby";
import React, {useState} from "react";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";

// Define the type for props passed to the Home component
interface GameLobbyProps {
    setVolume: (volume: number) => void; // Function to set global volume
    soundFXVolume: number; // Current sound effects volume level
    setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

const GameLobby: React.FC<GameLobbyProps> = ({
                                       setVolume,
                                       soundFXVolume,
                                       setSoundFXVolume,
                                   }) => {
    const [musicVolume, setMusicVolume] = useState(50); // Music volume level
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open

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
}

export default GameLobby;