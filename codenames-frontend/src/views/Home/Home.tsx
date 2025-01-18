import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation
import React, { useState } from "react"; // Hook for managing component state
import { useTranslation } from "react-i18next"; // Hook for translation

import BackgroundContainer from "../../containers/Background/Background";
import MenuContainer from "../../containers/Menu/Menu";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";
import Button from "../../components/Button/Button";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import settingsIcon from "../../assets/icons/settings.png";
import characters from "../../assets/images/characters.png";

import "../../styles/App.css";
import "./Home.css";

// Define the type for props passed to the Home component
interface HomeProps {
    setVolume: (volume: number) => void; // Function to set global volume
    soundFXVolume: number; // Current sound effects volume level
    setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

// Main component definition
const Home: React.FC<HomeProps> = ({
                                       setVolume,
                                       soundFXVolume,
                                       setSoundFXVolume,
                                   }) => {
    // State variables for managing component behavior
    const [isGameStarted, setIsGameStarted] = useState(false); // Tracks if the game has started
    const [musicVolume, setMusicVolume] = useState(50); // Music volume level
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
    const { t } = useTranslation(); // Hook for translation
    const navigate = useNavigate(); // Hook for navigation

    // Handler to start the game
    const startGame = () => {
        setIsGameStarted(true);
    };

    // Toggles the settings modal visibility
    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    return (
        <>
            <BackgroundContainer>
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

                {/* Render content based on game state */}
                {isGameStarted ? (
                    <>
                        {/* Settings button */}
                        <Button variant="circle" soundFXVolume={soundFXVolume}>
                            <img src={settingsIcon} onClick={toggleSettings} alt="Settings" className="settings-icon"/>
                        </Button>
                        {/* Game content when started */}
                        <TitleComponent soundFXVolume={soundFXVolume}>
                            Codenames
                        </TitleComponent>
                        <CharactersComponent />
                        <SubtitleComponent variant="primary">
                            { t("home-subtitle") }
       
                        </SubtitleComponent>
                        <MenuContainer>
                            {/* Menu for login and registration */}
                            <div className="first-column">
                                <div className="row1">
                                    <Button
                                        variant="primary"
                                        soundFXVolume={soundFXVolume}
                                        onClick={() => navigate("/login")}
                                    >
                                        <span className="button-text">{ t('login-button-text') }</span>
                                    </Button>
                                </div>
                                <div className="row2">
                                    <Button
                                        variant="primary"
                                        soundFXVolume={soundFXVolume}
                                        onClick={() => navigate("/register")}
                                    >
                                        <span className="button-text">{ t('register-button-text') }</span>
                                    </Button>
                                </div>
                            </div>
                            {/* Decorative gold bar */}
                            <div className="gold-bar"></div>
                            <div className="second-column">
                                {/* Option to play as a guest */}
                                <Button
                                    variant="primary"
                                    onClick={() => navigate("/games")}
                                    soundFXVolume={soundFXVolume}
                                >
                                    <span className="button-text">{ t('play-as-guest-button-text') }</span>
                                </Button>
                            </div>
                        </MenuContainer>
                    </>
                ) : (
                    <>
                        <div className="start-container">
                            {/* Initial state before starting the game */}
                            <div className="character-image-start">
                                <img src={characters} alt="Characters"/>
                            </div>
                            <div className="start-text-container">
                                <TitleComponent soundFXVolume={soundFXVolume} variant="start-title">
                                    Codenames
                                </TitleComponent>
                                <SubtitleComponent variant="start">
                                    Your mission begins now
                                </SubtitleComponent>
                            </div>
                            <div className="start-button">
                                {/* Start game button */}
                                <Button
                                    variant="primary"
                                    onClick={startGame}
                                    soundFXVolume={soundFXVolume}
                                >
                                    <span className="button-text"> { t('play-button-text') }</span>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </BackgroundContainer>
        </>
    );
};

export default Home;