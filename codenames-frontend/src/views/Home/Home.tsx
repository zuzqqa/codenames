import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation
import React, { useState, useEffect } from "react"; // Hook for managing component state and effects
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
import Cookies from "js-cookie"; // Import js-cookie for cookie handling
import { apiUrl } from "../../config/api.tsx";
import { secure } from "../../config/api.tsx";

export async function createGuestUser(apiUrl: string, secure: string) {
  console.log(apiUrl);
  try {
    const response = await fetch(`${apiUrl}/api/users/create-guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      document.cookie = `authToken=${data.token}; max-age=36000; path=/; ${secure}`;
      document.cookie = `loggedIn=true; max-age=36000; path=/; ${secure}`;
      window.location.href = "/loading";
    } else {
      console.error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error creating guest account:", error);
  }
}

/**
 * Props type definition for the Home component.
 */
interface HomeProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

/**
 * Home component representing the main menu of the application.
 *
 * @param {HomeProps} props - Component props.
 * @returns {JSX.Element} The rendered Home component.
 */
const Home: React.FC<HomeProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  // State variables for managing component behavior
  const [isGameStarted, setIsGameStarted] = useState(false); // Tracks if the game has started
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const { t } = useTranslation(); // Hook for translation
  const navigate = useNavigate(); // Hook for navigation

  /**
   * Starts the game by updating the state.
   */
  const startGame = () => {
    setIsGameStarted(true);
  };

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  /**
   * Effect that checks if the user is logged in using cookies and navigates to the games page if authenticated.
   */
  useEffect(() => {
    const loggedIn = Cookies.get("loggedIn"); // Retrieve the cookie value

    if (sessionStorage.getItem("gameId") && loggedIn === "true") {
      // If a game ID exists in localStorage and the user is logged in, navigate to the loading page
      navigate("/game-lobby");
    }

    // Ensure 'loggedIn' is true
    if (loggedIn === "true") {
      navigate("/games"); // Redirect to /games if logged in
    }
  }, [navigate]);

  /**
   * Updates the music volume and sets the global volume accordingly.
   *
   * @param {number} volume - The new volume level.
   */
  const updateMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    setVolume(volume); // Update global volume
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
          setMusicVolume={updateMusicVolume}
          setSoundFXVolume={setSoundFXVolume}
        />

        {isGameStarted ? (
          <>
            <Button variant="circle" soundFXVolume={soundFXVolume}>
              <img
                src={settingsIcon}
                onClick={toggleSettings}
                alt="Settings"
                className="settings-icon"
              />
            </Button>
            <TitleComponent soundFXVolume={soundFXVolume}>
              Codenames
            </TitleComponent>
            <CharactersComponent />
            <SubtitleComponent variant="primary">
              {t("home-subtitle")}
            </SubtitleComponent>
            <MenuContainer>
              <div className="first-column">
                <div className="row1">
                  <Button
                    variant="primary"
                    soundFXVolume={soundFXVolume}
                    onClick={() => navigate("/login")}
                  >
                    <span className="button-text">
                      {t("login-button-text")}
                    </span>
                  </Button>
                </div>
                <div className="row2">
                  <Button
                    variant="primary"
                    soundFXVolume={soundFXVolume}
                    onClick={() => navigate("/register")}
                  >
                    <span className="button-text">
                      {t("register-button-text")}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="gold-bar"></div>
              <div className="second-column">
                <Button
                  variant="primary"
                  onClick={() => createGuestUser(apiUrl, secure)}
                  soundFXVolume={soundFXVolume}
                >
                  <span className="button-text">
                    {t("play-as-guest-button-text")}
                  </span>
                </Button>
              </div>
            </MenuContainer>
          </>
        ) : (
          <>
            <div className="start-container">
              {/* Initial state before starting the game */}
              <div className="character-image-start">
                <img src={characters} alt="Characters" />
              </div>
              <div className="start-text-container">
                <TitleComponent
                  soundFXVolume={soundFXVolume}
                  variant="start-title"
                >
                  Codenames
                </TitleComponent>
                <SubtitleComponent variant="start">
                  Your mission begins now
                </SubtitleComponent>
                <div className="start-button">
                  {/* Start game button */}
                  <Button
                    variant="primary"
                    onClick={startGame}
                    soundFXVolume={soundFXVolume}
                  >
                    <span className="button-text">
                      {" "}
                      {t("play-button-text")}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </BackgroundContainer>
    </>
  );
};

export default Home;
