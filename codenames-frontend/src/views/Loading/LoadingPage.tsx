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
}

/**
 * LoadingPage component that displays a loading screen before navigating to the game selection page.
 *
 * @param {LoadingPageProps} props - Component props.
 * @returns {JSX.Element} The rendered LoadingPage component.
 */
const LoadingPage: React.FC<LoadingPageProps> = ({ soundFXVolume }) => {
  const { t } = useTranslation(); // Hook for translation
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Random time between 2000ms (2s) and 4000ms (4s)
    const randomDuration = Math.random() * 2000 + 2000;

    // Set random navigation timeout
    const timer = setTimeout(() => {
      navigate("/games");
    }, randomDuration);

    // Dynamically set CSS variable for the animation duration
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.setProperty(
        "--progress-duration",
        `${randomDuration}ms`
      );
    }

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, [navigate]);

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
