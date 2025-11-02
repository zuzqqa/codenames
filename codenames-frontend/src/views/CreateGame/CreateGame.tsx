import { useState, useEffect } from "react"; // Hook for managing component state
import { useTranslation } from "react-i18next";

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import CreateGameForm from "../../components/CreateGameForm/CreateGameForm";
import { useModal } from "../../providers/ModalProvider";

import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";
import logoutButton from "../../assets/icons/logout.svg";

import "../../styles/App.css";
import "../SelectGame/SelectGame.css";
import "./CreateGame.css";

import { getCookie, logout } from "../../shared/utils.tsx";
import { apiUrl } from "../../config/api.tsx";
import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";

/**
 * Props interface for CreateGame component.
 * @typedef {Object} CreateGameProps
 * @property {function(number): void} setVolume - Function to set global volume
 * @property {number} soundFXVolume - Current sound effects volume level
 * @property {function(number): void} setSoundFXVolume - Function to set sound effects volume
 */
interface CreateGameProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
}

/**
 * CreateGame component allows users to create a new game session.
 * It includes settings management and user logout functionality.
 *
 * @component
 * @param {CreateGameProps} props - Component properties
 * @returns {JSX.Element} The rendered CreateGame component
 */
const CreateGame: React.FC<CreateGameProps> = ({ soundFXVolume }) => {
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const { openSettings, openProfile, canOpenProfile } = useModal();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  /**
   * Effect to fetch guest status from the server.
   * It checks if the user is a guest and updates the state accordingly.
   */
  useEffect(() => {
    const fetchGuestStatus = async () => {
      const token = getCookie("authToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/users/is-guest`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const guestStatus = await response.json();
          setIsGuest(guestStatus);
        } else {
          console.error("Failed to retrieve guest status.");
        }
      } catch (error) {
        console.error("Error retrieving guest status: ", error);
      }
    };

    fetchGuestStatus();
  }, []);

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => openSettings();

  /**
   * Toggles the profile modal visibility.
   */
  const toggleProfile = () => openProfile();

  return (
    <>
      <BackgroundContainer>
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={toggleSettings}
        >
          <img src={settingsIcon} alt="Settings" />
        </Button>
        {canOpenProfile && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}

        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button
            variant="logout"
            soundFXVolume={soundFXVolume}
            onClick={logout}
          >
            <img src={logoutButton} alt="Logout" />
          </Button>
        )}
        {/* Modals are provided globally by ModalProvider */}
        <>
          <GameTitleBar></GameTitleBar>
          <CreateGameForm soundFXVolume={soundFXVolume} />
        </>
        <UsernameContainer />
      </BackgroundContainer>
    </>
  );
};

export default CreateGame;
