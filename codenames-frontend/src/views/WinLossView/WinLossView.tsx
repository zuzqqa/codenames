/**
 * The `WinLossView` component in TypeScript React displays a victory or defeat message with a timer
 * for automatic redirection and cleanup of chat messages.
 * @returns The `WinLossView` component is being returned. It is a functional component in React that
 * displays a victory or defeat message based on the result passed through the location state. If there
 * is no result, it navigates back to the home page. The component also includes hooks for translation,
 * programmatic navigation, and managing component state and effects.
 */
import { useNavigate, useLocation } from "react-router-dom"; // Hook for programmatic navigation
import React, { useEffect } from "react"; // Hook for managing component state and effects
import { useTranslation } from "react-i18next"; // Hook for translation

import BackgroundContainer from "../../containers/Background/Background";
import characters from "../../assets/images/characters.png";

import "../../styles/App.css";
import "../Home/Home.css";
import "./WinLossView.css";

const WinLossView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {};
  const resultText = result === "Victory" ? t("Victory") : t("Defeat");

  if (!result) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if(localStorage.getItem("chatMessages")) {
      localStorage.removeItem("chatMessages");
    }
  }, []);

  return (
    <BackgroundContainer>
      <div className="start-container">
        {/* Initial state before starting the game */}
        <div className="character-image-start">
          <img src={characters} alt="Characters" />
        </div>
        <div
          className={`blurred-rectangle ${
            result === "Victory" ? "victory" : "defeat"
          }`}
        />
        <div className="horizontal-line" />
        <div className="win-loss-container">
          <span className="">{resultText}</span>
        </div>
        <div className="progressContainer" />
      </div>
    </BackgroundContainer>
  );
};

export default WinLossView;
