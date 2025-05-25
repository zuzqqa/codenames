import React, { useState, useEffect } from "react"; // Hook for managing component state
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next"; // Hook for translations

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import GameList from "../../components/GameList/GameList";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../../components/UserProfileOverlay/ProfileModal";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";
import logoutButton from "../../assets/icons/logout.svg";

import { getCookie, logout } from "../../shared/utils.tsx";
import { apiUrl, socketUrl } from "../../config/api.tsx";

/**
 * Props type definition for the JoinGame component.
 * @typedef {Object} JoinGameProps
 * @property {function} setVolume - Function to set global volume.
 * @property {number} soundFXVolume - Current sound effects volume level.
 * @property {function} setSoundFXVolume - Function to set sound effects volume.
 */
interface JoinGameProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

/**
 * Enumeration of possible game session statuses.
 * @enum {string}
 * @property {string} CREATED - Session is created but not started.
 * @property {string} LEADER_SELECTION - Session is in leader selection phase.
 * @property {string} IN_PROGRESS - Session is currently in progress.
 * @property {string} FINISHED - Session has finished.
 */
enum SessionStatus {
  CREATED = "CREATED",
  LEADER_SELECTION = "LEADER_SELECTION",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Represents a simplified game session (used in JoinGame list).
 * @typedef {Object} GameSessionJoinGameDTO
 * @property {SessionStatus} status - The current status of the game session.
 * @property {string} sessionId - Unique identifier for the game session.
 * @property {string} gameName - Name of the game session.
 * @property {number} maxPlayers - Maximum number of players allowed in the session.
 * @property {string} password - Password for joining the session (if any).
 * @property {number} currentRedTeamPlayers - Number of players in the red team.
 * @property {number} currentBlueTeamPlayers - Number of players in the blue team.
 */
interface GameSessionJoinGameDTO {
  status: SessionStatus;
  sessionId: string;
  gameName: string;
  maxPlayers: number;
  password: string;
  currentRedTeamPlayers: number;
  currentBlueTeamPlayers: number;
}

/**
 * JoinGame component that allows users to browse and join active game sessions.
 *
 * @param {JoinGameProps} props - Component props.
 * @returns {JSX.Element} The rendered JoinGame component.
 */
const JoinGame: React.FC<JoinGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Tracks if the profile modal is open
  const [gameSessions, setGameSessions] = useState<GameSessionJoinGameDTO[]>(
    []
  );
  const [filteredGames, setFilteredGames] = useState<GameSessionJoinGameDTO[]>(
    []
  );
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const { t } = useTranslation(); // Hook for translations
  
  /**
   * useEffect hook that establishes a Socket.IO connection to receive real-time game session updates.
   *
   * - Connects to the Socket.IO server on component mount.
   * - Listens for the 'gameSessionsList' event and filters sessions with status "CREATED".
   * - Updates local React state (`setGameSessions`, `setFilteredGames`) with the filtered list.
   */
  useEffect(() => {
    getGames();

    const gameSocket = io(`${socketUrl}/game`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    gameSocket.on("gameSessionsList", (updatedGameSessionsJson: string) => {
      try {
        const updatedGameSessionsList: GameSessionJoinGameDTO[] = JSON.parse(
          updatedGameSessionsJson
        );

        const filteredUpdatedGames = updatedGameSessionsList.filter(
          (game) => game.status === "CREATED"
        );

        setGameSessions(filteredUpdatedGames);
        setFilteredGames(filteredUpdatedGames);
      } catch (err) {
        console.error("Error parsing gameSessionsList JSON:", err);
      }
    });

    gameSocket.on("connect_error", (error) => {
      console.error("Game socket connection error.", error);
    });

    return () => {
      gameSocket.disconnect();
    };
  }, []);

  /**
   * useEffect hook that checks if the user is a guest by making an API call.
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

    useEffect(() => {
      const fetchUsername = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/users/getUsername`, {
            method: "GET",
            credentials: "include"
          });
  
          if (response.ok) {
            const text = await response.text();
            if (text !== "null") {
              setUsername(text);
            }
          } else {
            console.error("Failed to fetch username");
          }
        } catch (error) {
          console.error("Error fetching username", error);
        }
      };
  
      fetchUsername();
    }, []);

  /**
   * Fetches all available game sessions from the backend.
   * Only sessions in the "CREATED" state are stored.
   */
  const getGames = () => {
    fetch(`${apiUrl}/api/game-session/all`)
      .then((response) => response.json())
      .then((data) => {
        const createdGames = data.filter(
          (game: GameSessionJoinGameDTO) => game.status === "CREATED"
        );
        setGameSessions(createdGames);
        setFilteredGames(createdGames);
      })
      .catch((error) => {
        console.error("Error fetching game sessions:", error);
      });
  };

  /**
   * Toggles the visibility of the settings modal.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume} onClick={toggleSettings}>
          <img src={settingsIcon} alt="Settings" />
        </Button>

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
        {isGuest === false && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={toggleProfile}
          soundFXVolume={soundFXVolume}
        />
        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button variant="logout" soundFXVolume={soundFXVolume}>
            <img src={logoutButton} onClick={logout} alt="Logout" />
          </Button>
        )}

        <>
          <GameTitleBar></GameTitleBar>
          <GameList
            soundFXVolume={soundFXVolume}
            gameSessions={gameSessions}
            filteredSessions={filteredGames}
            setFilteredSessions={setFilteredGames}
          />
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

export default JoinGame;
