import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";

import backButton from "../../assets/icons/arrow-back.png";

import "./RoomLobby.css";

import { apiUrl, socketUrl } from "../../config/api.tsx";
import { getUserId } from "../../shared/utils.tsx";
import { io } from "socket.io-client";

/**
 * Properties for the RoomLobby component.
 * @typedef {Object} RoomLobbyProps
 * @property {number} soundFXVolume - The volume of sound effects.
 */
interface RoomLobbyProps {
  soundFXVolume: number;
}

/**
 * Enum for user status.
 * @enum {string}
 * @property {string} INACTIVE - The user is inactive.
 * @property {string} ACTIVE - The user is active.
 */
enum UserStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
}

/**
 * Represents a user in the game session.
 * @typedef {Object} UserRoomLobbyDTO
 * @property {string} id - The unique identifier of the user.
 * @property {string} username - The username of the player.
 * @property {number} profilePic - The profile picture ID of the player.
 * @property {UserStatus} status - The status of the player (active/inactive).
 */
interface UserRoomLobbyDTO {
  id: string;
  username: string;
  profilePic: number;
  status: UserStatus;
}

/**
 * Enum for session status.
 * @enum {string}
 * @property {string} CREATED - The session is created.
 * @property {string} LEADER_SELECTION - The session is in leader selection phase.
 * @property {string} IN_PROGRESS - The session is in progress.
 * @property {string} FINISHED - The session is finished.
 */
enum SessionStatus {
  CREATED = "CREATED",
  LEADER_SELECTION = "LEADER_SELECTION",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Represents a game session.
 * @typedef {Object} GameSessionRoomLobbyDTO
 * @property {SessionStatus} status - The current status of the session.
 * @property {string} gameName - The name of the game.
 * @property {number} maxPlayers - The maximum number of players allowed.
 * @property {UserRoomLobbyDTO[][]} connectedUsers - List of users in each team.
 */
interface GameSessionRoomLobbyDTO {
  status: SessionStatus;
  gameName: string;
  maxPlayers: number;
  connectedUsers: UserRoomLobbyDTO[][];
}

/**
 * RoomLobby component.
 *
 * @param {RoomLobbyProps} props - The properties for the RoomLobby component.
 * @returns {JSX.Element} The RoomLobby component.
 */
const RoomLobby: React.FC<RoomLobbyProps> = ({ soundFXVolume }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [gameSession, setGameSession] =
    useState<GameSessionRoomLobbyDTO | null>(null);
  const [redTeamPlayers, setRedTeamPlayers] = useState<UserRoomLobbyDTO[]>([]);
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<UserRoomLobbyDTO[]>(
    []
  );

  /**
   * Initializes the WebSocket connection and fetches the game session data.
   */
  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");

    if (storedGameId) {
      fetch(`${apiUrl}/api/game-session/${storedGameId}`)
        .then((response) => response.json())
        .then((data: GameSessionRoomLobbyDTO) => {
          setGameSession({
            ...data,
          });

          if (data.connectedUsers) {
            setRedTeamPlayers(data.connectedUsers[0] || []);
            setBlueTeamPlayers(data.connectedUsers[1] || []);
          }
        })
        .catch((err) => console.error("Failed to load game session", err));
    } else {
      navigate("/join-game");
    }

    const gameSocket = io(`${socketUrl}/game`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    gameSocket.on("connect", () => {
      if (storedGameId) {
        gameSocket.emit("joinGame", storedGameId);
      }
    });

    gameSocket.on(
      "gameSessionUpdate",
      (updatedGameSessionJson: string) => {
        try {
          const updatedGameSession: GameSessionRoomLobbyDTO = JSON.parse(updatedGameSessionJson);
          

          if(updatedGameSession.connectedUsers) {
            setRedTeamPlayers(updatedGameSession.connectedUsers[0] || []);
            setBlueTeamPlayers(updatedGameSession.connectedUsers[1] || []);
          }

          if (updatedGameSession.status === "LEADER_SELECTION") {
            navigate("/choose-leader");
          }
        } catch (err) {
          console.error("Error parsing gameSessionsList JSON:", err);
        }
      }
    );

    gameSocket.on("connect_error", (error) => {
      console.error("Game socket connection error:", error);
    });

    return () => {
      gameSocket.disconnect();
    };
  }, [navigate]);

  /**
   * Adds the current player to the red team.
   */
  const addPlayerToRedTeam = async () => {
    // Fetch player ID, then add to red team via REST API
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    const userId = await getUserId();

    if (userId === null) {
      return;
    }

    const response = await fetch(
      `${apiUrl}/api/game-session/${storedGameId}/connect?userId=${userId}&teamIndex=0`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (response.ok) {
    } else {
      console.error("Failed to add player to red team");
    }
  };

  /**
   * Adds the current player to the blue team.
   */
  const addPlayerToBlueTeam = async () => {
    // Fetch player ID, then add to blue team via REST API
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    const userId = await getUserId();

    if (userId === null) {
      return;
    }

    const response = await fetch(
      `${apiUrl}/api/game-session/${storedGameId}/connect?userId=${userId}&teamIndex=1`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (response.ok) {
    } else {
      console.error("Failed to add player to blue team");
    }
  };

  /**
   * Removes the current player from the game session.
   */
  const removePlayer = async () => {
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    const userId = await getUserId();

    if (userId === null) {
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/game-session/${storedGameId}/disconnect?userId=${userId}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!response.ok) {
        console.error("Failed to remove player");
      }
    } catch (error) {
      console.error("Error removing player", error);
    }

    localStorage.removeItem("gameId");
    navigate("/games");
  };

  /**
   * Starts the game session.
   */
  const start_game = async () => {
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/game-session/${storedGameId}/start`,
        { method: "POST" }
      );
      if (response.ok) {
        navigate("/choose-leader");
      } else {
        console.error("Failed to start the game");
      }
    } catch (error) {
      console.error("Error starting the game", error);
    }
  };

  return (
    <>
      <RoomMenu>
        <Button
          className="back-button"
          variant={"circle-back"}
          soundFXVolume={soundFXVolume}
          onClick={removePlayer}
        >
          <img src={backButton} alt="Back" className="btn-arrow-back" />
        </Button>
        <span className="room-form-label">{t("game-lobby")}</span>
        <div className="background" style={{ gridColumn: "2", gridRow: "2" }}>
          {gameSession && (
            <div className="content">
              <div className="game-name">{gameSession.gameName}</div>
              <div className="div-slots">
                {t("slots")}{" "}
                {gameSession.connectedUsers
                  ? blueTeamPlayers.length + redTeamPlayers.length
                  : 0}
                /{gameSession.maxPlayers}
              </div>
              <div className="lobby-players">
                <Button
                  variant={"room"}
                  soundFXVolume={soundFXVolume}
                  className="room-btn"
                  onClick={start_game}
                >
                  <span className="button-text">Start</span>
                </Button>
                <div className="players-container">
                  <div className="team">
                    <Button
                      className="join-button"
                      variant={"join-team"}
                      soundFXVolume={soundFXVolume}
                      onClick={addPlayerToRedTeam}
                    >
                      +
                    </Button>
                    {redTeamPlayers.map((player, index) => (
                      <div
                        key={index}
                        className="player-container player-container-red"
                      >
                        <img
                          src={`/images/profile-pic-${player.profilePic}.png`}
                          alt="Player"
                          className="player-icon"
                        />
                        {player.username}
                      </div>
                    ))}
                  </div>
                  <div className="team">
                    <Button
                      className="join-button"
                      variant={"join-team"}
                      soundFXVolume={soundFXVolume}
                      onClick={addPlayerToBlueTeam}
                    >
                      +
                    </Button>
                    {blueTeamPlayers.map((player, index) => (
                      <div
                        key={index}
                        className="player-container player-container-blue"
                      >
                        <img
                          src={`/images/profile-pic-${player.profilePic}.png`}
                          alt="Player"
                          className="player-icon"
                        />
                        {player.username}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </RoomMenu>
    </>
  );
};

export default RoomLobby;
