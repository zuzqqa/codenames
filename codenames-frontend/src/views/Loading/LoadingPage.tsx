import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

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
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
  duration?: number;
}

/**
 * LoadingPage component that displays a loading screen before navigating to the game selection page.
 *
 * @param {LoadingPageProps} props - Component props.
 * @returns {JSX.Element} The rendered LoadingPage component.
 */
const LoadingPage: React.FC<LoadingPageProps> = ({ soundFXVolume, duration }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const defaultDuration = 3;
    const effectiveDuration = duration ?? defaultDuration;
    const timer = setTimeout(() => {
      const endpoint = localStorage.getItem("userId") ? "/game-lobby" : "/";
      navigate(endpoint);
    }, effectiveDuration * 1000);

    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.setProperty(
        "--progress-duration",
        `${effectiveDuration}s`
      );
    }

    return () => clearTimeout(timer);
  }, [navigate, duration]);

  return (
    <BackgroundContainer>
      <div className="start-container">
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
          <div className="progressContainer">
            <div id="progressBar"></div>
          </div>
        </div>
      </div>
    </BackgroundContainer>
  );
};

export default LoadingPage;
