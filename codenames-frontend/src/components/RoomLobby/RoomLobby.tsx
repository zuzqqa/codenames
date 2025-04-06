import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import playerIcon from "../../assets/images/player-icon.png";
import "./RoomLobby.css";
import { convertDurationToMMSS } from "../../shared/utils.tsx";

/**
 * Properties for the RoomLobby component.
 * @typedef {Object} RoomLobbyProps
 * @property {number} soundFXVolume - The volume of sound effects.
 */
interface RoomLobbyProps {
  soundFXVolume: number;
}

/**
 * Represents a user in the game session.
 * @typedef {Object} User
 * @property {string} userId - The unique ID of the user.
 * @property {string} username - The username of the player.
 */
interface User {
  userId: string;
  username: string;
}

/**
 * Enum for session status.
 * @readonly
 * @enum {string}
 */
enum SessionStatus {
  CREATED = "CREATED",
  LEADER_SELECTION = "LEADER_SELECTION",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Represents a game session.
 * @typedef {Object} GameSession
 * @property {SessionStatus} status - The current status of the session.
 * @property {string} sessionId - The unique ID of the session.
 * @property {string} gameName - The name of the game.
 * @property {number} maxPlayers - The maximum number of players allowed.
 * @property {string} timeForAHint - The time limit for hints.
 * @property {string} timeForGuessing - The time limit for guessing.
 * @property {User[][]} connectedUsers - List of users in each team.
 */
interface GameSession {
  status: SessionStatus;
  sessionId: string;
  gameName: string;
  maxPlayers: number;
  timeForAHint: string;
  timeForGuessing: string;
  connectedUsers: User[][];
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

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [redTeamPlayers, setRedTeamPlayers] = useState<User[]>([]);
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<User[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");

    if (storedGameId) {
      fetch(`http://localhost:8080/api/game-session/${storedGameId}`)
        .then((response) => response.json())
        .then((data: GameSession) => {
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

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe("/game/" + storedGameId, (message) => {
          const updatedGameSession = JSON.parse(message.body);
          if (updatedGameSession) {
            setRedTeamPlayers(updatedGameSession.connectedUsers[0] || []);
            setBlueTeamPlayers(updatedGameSession.connectedUsers[1] || []);

            if (updatedGameSession.status === SessionStatus.LEADER_SELECTION) {
              navigate("/choose-leader");
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [navigate]);

  /**
   * Adds the current player to the red team.
   */
  const addPlayerToRedTeam = async () => {
    // Fetch player ID, then add to red team via REST API
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    const getIdResponse = await fetch("http://localhost:8080/api/users/getId", {
      method: "GET",
      credentials: "include",
    });
    const userId = await getIdResponse.text();

    const response = await fetch(
      `http://localhost:8080/api/game-session/${storedGameId}/connect?userId=${userId}&teamIndex=0`,
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

    const getIdResponse = await fetch("http://localhost:8080/api/users/getId", {
      method: "GET",
      credentials: "include",
    });
    const userId = await getIdResponse.text();

    const response = await fetch(
      `http://localhost:8080/api/game-session/${storedGameId}/connect?userId=${userId}&teamIndex=1`,
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

    const getIdResponse = await fetch("http://localhost:8080/api/users/getId", {
      method: "GET",
      credentials: "include",
    });
    const userId = await getIdResponse.text();

    try {
      const response = await fetch(
        `http://localhost:8080/api/game-session/${storedGameId}/disconnect?userId=${userId}`,
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
        `http://localhost:8080/api/game-session/${storedGameId}/start`,
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
                  <div className="cloud-container">
                    <div className="cloud blue-cloud" />
                    <div className="cloud red-cloud" />
                  </div>
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
                      <div key={index} className="player-container">
                        <img
                          src={playerIcon}
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
                      <div key={index} className="player-container">
                        <img
                          src={playerIcon}
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
