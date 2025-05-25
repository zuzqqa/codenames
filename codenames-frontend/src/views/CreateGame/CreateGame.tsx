import { useState, useEffect } from "react"; // Hook for managing component state
import { useTranslation } from "react-i18next";

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import CreateGameForm from "../../components/CreateGameForm/CreateGameForm";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../../components/UserProfileOverlay/ProfileModal";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";
import logoutButton from "../../assets/icons/logout.svg";

import "../../styles/App.css";
import "../SelectGame/SelectGame.css";
import "./CreateGame.css";

import { getCookie, logout } from "../../shared/utils.tsx";
import { apiUrl } from "../../config/api.tsx";

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
  setSoundFXVolume: (volume: number) => void;
}

/**
 * CreateGame component allows users to create a new game session.
 * It includes settings management and user logout functionality.
 *
 * @component
 * @param {CreateGameProps} props - Component properties
 * @returns {JSX.Element} The rendered CreateGame component
 */
const CreateGame: React.FC<CreateGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Tracks if the profile modal is open
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const { t } = useTranslation(); 

    useEffect(() => {
      const fetchGuestStatus = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/users/isGuest", {
            method: "GET",
            credentials: "include",
          });
    
          if (response.ok) {
            const guestStatus = await response.json();
            setIsGuest(guestStatus);
          } else {
            console.error("Falied to fetch guest status.");
          }
        } catch (error) {
          console.error("Error while fetching guest status.", error);
        }
      };
    
      fetchGuestStatus();
    }, []);

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/users/is-guest`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const guestStatus = await response.json();
          setIsGuest(guestStatus);
        } else {
          console.error("Failed to retrieve guest status.");
        }
<<<<<<< HEAD
      } catch (error) {
        console.error("Error retrieving guest status: ", error);
      }
    };

    fetchGuestStatus();
  }, []);
=======
      };
  
      fetchUsername();
    }, []);
  
  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);
>>>>>>> 3951e6c9a3072ad1556f45819d1b2be2dc9f3828

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  /**
   * Toggles the profile modal visibility.
   */
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume} onClick={toggleSettings}>
          <img src={settingsIcon} alt="Settings" />
        </Button>
        {isGuest === false && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}

        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button variant="logout" soundFXVolume={soundFXVolume} onClick={logout}>
            <img src={logoutButton} alt="Logout" />
          </Button>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          musicVolume={musicVolume}
          soundFXVolume={soundFXVolume}
          setMusicVolume={(volume) => {
            setMusicVolume(volume); 
            setVolume(volume / 100); 
          }}
          setSoundFXVolume={setSoundFXVolume}
        />
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={toggleProfile}
          soundFXVolume={soundFXVolume}
        />
        <>
          <GameTitleBar></GameTitleBar>
          <CreateGameForm soundFXVolume={soundFXVolume} />
        </>
        {username && (
          <div className="logged-in-user gold-text">
            { t('logged-in-as') } {username}
          </div>
        )}
      </BackgroundContainer>
    </>
  );
};

export default CreateGame;
