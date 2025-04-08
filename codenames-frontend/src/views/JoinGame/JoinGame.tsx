import React, { useState, useEffect } from "react"; // Hook for managing component state

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import GameList from "../../components/GameList/GameList";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import settingsIcon from "../../assets/icons/settings.png";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameSession[]>([]);

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

  return (
    <>
      <BackgroundContainer>
        {/* Settings button */}
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>

        {/* Settings modal */}
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
        <>
          <GameTitleBar></GameTitleBar>
          <GameList
            soundFXVolume={soundFXVolume}
            gameSessions={gameSessions}
            filteredSessions={filteredGames}
            setFilteredSessions={setFilteredGames}
          />
        </>
      </BackgroundContainer>
    </>
  );
};

export default JoinGame;
