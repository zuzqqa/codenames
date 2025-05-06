import React, { useState, useEffect } from "react"; // Hook for managing component state
import { useTranslation } from "react-i18next"; // Importing the useTranslation hook from react-i18next

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import GameList from "../../components/GameList/GameList";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../../components/UserProfileOverlay/ProfileModal";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {logout} from "../../shared/utils.tsx";
import logoutButton from "../../assets/icons/logout.svg";

/**
 * Props type definition for the JoinGame component.
 */
interface JoinGameProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

/**
 * Represents a user in a game session.
 */
interface User {
  userId: string;
  username: string;
}

/**
 * Enumeration of possible game session statuses.
 */
enum SessionStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Represents a game session.
 */
interface GameSession {
  status: SessionStatus;
  sessionId: string;
  gameName: string;
  maxPlayers: number;
  password: string;
  durationOfTheRound: string;
  timeForGuessing: string;
  timeForAHint: string;
  numberOfRounds: number;
  connectedUsers: User[][]; 
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
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Tracks if the profile modal is open
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameSession[]>([]);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const { t } = useTranslation(); // Hook for translations
  
  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  /**
   * Fetches the list of available game sessions on component mount.
   * Also establishes a WebSocket connection for real-time updates.
   */
  useEffect(() => {
    getGames();

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe("/game/all", (message) => {
          const updatedGameSessionsList = JSON.parse(message.body);
          if (updatedGameSessionsList) {
            const filteredUpdatedGames = updatedGameSessionsList.filter(
              (game: GameSession) => game.status === "CREATED"
            );
            setGameSessions(filteredUpdatedGames);
            setFilteredGames(filteredUpdatedGames);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate(); 
    };
  }, []);

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
          console.error("Nie udało się pobrać statusu gościa");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania statusu gościa", error);
      }
    };
  
    fetchGuestStatus();
  }, []);

    useEffect(() => {
      const fetchUsername = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/users/getUsername", {
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
    fetch("http://localhost:8080/api/game-session/all")
      .then((response) => response.json())
      .then((data) => {
        const createdGames = data.filter(
          (game: GameSession) => game.status === "CREATED"
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
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>

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
        {/* Profile button */}
        {isGuest === false && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}

        {/* Profie modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={toggleProfile}
          soundFXVolume={soundFXVolume}
        />
        {document.cookie.split('; ').find(cookie => cookie.startsWith('loggedIn=')) && (
          <Button variant="logout" soundFXVolume={soundFXVolume}>
            <img
              src={logoutButton}
              onClick={logout}
              alt="Logout"
            />
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
