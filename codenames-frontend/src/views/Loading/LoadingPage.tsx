import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation
import React, { useEffect } from "react"; // Hook for managing component state and effects
import { useTranslation } from "react-i18next"; // Hook for translation

import BackgroundContainer from "../../containers/Background/Background";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import characters from "../../assets/images/characters.png";

import "../../styles/App.css";
import "../Home/Home.css";
import "./LoadingPage.css";

/**
 * Props type definition for the LoadingPage component.
 */
interface LoadingPageProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
  duration?: number; // Optional duration for the loading screen
}

/**
 * LoadingPage component that displays a loading screen before navigating to the game selection page.
 *
 * @param {LoadingPageProps} props - Component props.
 * @returns {JSX.Element} The rendered LoadingPage component.
 */
const LoadingPage: React.FC<LoadingPageProps> = ({ soundFXVolume, duration }) => {
  const { t } = useTranslation(); // Hook for translation
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const defaultDuration = 3; // Default duration in seconds
    const effectiveDuration = duration ?? defaultDuration;

    const timer = setTimeout(() => {
      navigate("/"); // Navigate to "/" after the progress bar is full
    }, effectiveDuration * 1000); // Convert seconds to milliseconds

    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.setProperty(
          "--progress-duration",
          `${effectiveDuration}s`
      );
    }

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigate, duration]);

  return (
    <BackgroundContainer>
      <div className="start-container">
        {/* Initial state before starting the game */}
        <div className="character-image-start">
          <img src={characters} alt="Characters" />
        </div>
        <div className="start-text-container">
          <TitleComponent soundFXVolume={soundFXVolume} variant="start-title">
            Codenames
          </TitleComponent>
          <SubtitleComponent variant="start">
            Your mission begins now
          </SubtitleComponent>
        </div>
        <div className="progressContainer">
          <div id="progressBar"></div>
        </div>
      </div>
    </BackgroundContainer>
  );
};

export default LoadingPage;
