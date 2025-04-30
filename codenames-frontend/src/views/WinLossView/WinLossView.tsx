import { useNavigate, useLocation } from "react-router-dom"; // Hook for programmatic navigation
import React, { useEffect } from "react"; // Hook for managing component state and effects
import { useTranslation } from "react-i18next"; // Hook for translation

import BackgroundContainer from "../../containers/Background/Background";
import characters from "../../assets/images/characters.png";

import "../../styles/App.css";
import "../Home/Home.css";
import "./WinLossView.css";

/**
 * The `WinLossView` component displays a victory or defeat message and automatically redirects
 * the user to the home page after a timeout. It also clears stored chat messages on mount.
 *
 * @component
 * @returns {JSX.Element | null} The `WinLossView` component.
 */
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

  /**
   * Sets a timeout to navigate back to the home page after 15 seconds.
   * The timeout is cleared when the component unmounts.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate]);

  /**
   * Clears stored chat messages from local storage when the component mounts.
   */
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
