import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";

import backButton from "../../assets/icons/arrow-back.png";
import linkIcon from "../../assets/icons/link.svg";
import messageIcon from "../../assets/icons/message.svg";

import "./RoomLobby.css";

import { apiUrl, frontendUrl, socketUrl } from "../../config/api.tsx";
import { getCookie, getUserId } from "../../shared/utils.tsx";
import { io } from "socket.io-client";
import { useToast } from "../Toast/ToastContext.tsx";

/**
 * @returns {string} - The URL of the API.
 */
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

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
  const { addToast } = useToast();
  const [gameSession, setGameSession] =
    useState<GameSessionRoomLobbyDTO | null>(null);
  const [redTeamPlayers, setRedTeamPlayers] = useState<UserRoomLobbyDTO[]>([]);
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<UserRoomLobbyDTO[]>(
    []
  );
  const [isJoined, setIsJoined] = useState(false);
  const [isJoinedRed, setIsJoinedRed] = useState(false);
  const [isJoinedBlue, setIsJoinedBlue] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
  const [lobbyLink, setLobbyLink] = useState<string>("");
  const [isLinkIsleExpanded, setIsLinkIsleExpanded] = useState(false);
  const exampleLink = `${frontendUrl}/invite/${sessionStorage.getItem(
    "gameId"
  )}`;

  /**
   * Initializes the WebSocket connection and fetches the game session data.
   */
  useEffect(() => {
    const storedGameId = sessionStorage.getItem("gameId");

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
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    gameSocket.on("connect", () => {
      if (storedGameId) {
        gameSocket.emit("joinGame", storedGameId);
      }
    });

    gameSocket.on("gameSessionUpdate", (updatedGameSessionJson: string) => {
      try {
        const updatedGameSession: GameSessionRoomLobbyDTO = JSON.parse(
          updatedGameSessionJson
        );

        if (updatedGameSession.connectedUsers) {
          setRedTeamPlayers(updatedGameSession.connectedUsers[0] || []);
          setBlueTeamPlayers(updatedGameSession.connectedUsers[1] || []);
        }

        if (updatedGameSession.status === "LEADER_SELECTION") {
          navigate("/choose-leader");
        }
      } catch (err) {
        console.error("Error parsing gameSessionsList JSON:", err);
      }
    });

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
    if (isJoined) {
      removePlayerFromTeam();
    }

    // Fetch player ID, then add to red team via REST API
    const storedGameId = sessionStorage.getItem("gameId");
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
      setIsJoined(true);
      setIsJoinedRed(true);
    } else {
      console.error("Failed to add player to red team");
    }
  };

  /**
   * Adds the current player to the blue team.
   */
  const addPlayerToBlueTeam = async () => {
    if (isJoined) {
      removePlayerFromTeam();
    }

    // Fetch player ID, then add to blue team via REST API
    const storedGameId = sessionStorage.getItem("gameId");
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
      setIsJoined(true);
      setIsJoinedBlue(true);
    } else {
      console.error("Failed to add player to blue team");
    }
  };

  /**
   * Removes the current player from the specified team.
   * @param {number} teamIndex - The index of the team to remove the player from (0 for red, 1 for blue).
   */
  const removePlayerFromTeam = async () => {
    const storedGameId = sessionStorage.getItem("gameId");
    if (!storedGameId) return;

    const token = getCookie("authToken");

    const getIdResponse = await fetch(`${apiUrl}/api/users/get-id`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
      credentials: "include",
    });
    const userId = await getIdResponse.text();

    try {
      const response = await fetch(
        `${apiUrl}/api/game-session/${storedGameId}/disconnect?userId=${userId}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!response.ok) {
        console.error("Failed to remove player from team");
      }
      setIsJoined(false);

      if (isJoinedRed) setIsJoinedRed(false);
      else if (isJoinedBlue) setIsJoinedBlue(false);
    } catch (error) {
      console.error("Error removing player from team", error);
    }
  };

  /**
   * Removes the current player from the game session.
   */
  const removePlayer = async () => {
    if (isJoined) {
      removePlayerFromTeam();
    }

    sessionStorage.removeItem("gameId");
    navigate("/games");
  };

  /**
   * Starts the game session.
   */
  const startGame = async () => {

    const storedGameId = sessionStorage.getItem("gameId");
    if (!storedGameId) return;

    if (redTeamPlayers.length < 2 || redTeamPlayers.length < 2) {
      addToast(t("too-few-players"), "error");
      return;
    }
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

  /**
   * Generates a lobby link and copies it to the clipboard.
   */
  const generateLobbyLink = () => {
    const storedGameId = sessionStorage.getItem("gameId");
    if (!storedGameId) return;

    const tempLobbyLink = `${frontendUrl}/invite/${storedGameId}`;
    setLobbyLink(tempLobbyLink);
    navigator.clipboard.writeText(tempLobbyLink).then(() => {
      console.log("Lobby link copied to clipboard:", tempLobbyLink);
    });

    addToast(t("link-copied"), "notification");
  };

  /**
   * Handles manual closing of a toast notification.
   *
   * - Fades out the toast visually before removing it from the state.
   *
   * @param {string} id - The unique identifier of the notification toast to be closed.
   */
  const handleCloseNotificationToast = (id: string) => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.classList.add("hide");

      setTimeout(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== id)
        );
      }, 500);
    }
  };

  const handleLobbyLinkIsleUnroll = () => {
    setIsLinkIsleExpanded((prev) => !prev);
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
          <img src={backButton} alt="Back" className="btn-arrow-back"/>
        </Button>
        <span className="room-form-label">{t("game-lobby")}</span>
        <div className="room-lobby-divider">
          <span className="room-lobby-divider-title">Codenames</span>
        </div>
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
              <div
                className={
                  isLinkIsleExpanded
                    ? "lobby-link-switch disable"
                    : "lobby-link-switch"
                }
              >
                <img
                  src={linkIcon}
                  alt="Link"
                  className="link-icon"
                  onClick={handleLobbyLinkIsleUnroll}
                />
              </div>
              <div
                className={`lobby-link-isle ${
                  isLinkIsleExpanded ? "disable" : "expanded"
                }`}
                onClick={handleLobbyLinkIsleUnroll}
              >
                <img src={messageIcon} alt="Link" className="isle-image"/>
                <p className="isle-title">{t("invite-friends")}</p>
                <p className="isle-text">{t("invite-friends-text")}</p>
                <p className="isle-fields">
                  <input
                    type="text"
                    className="lobby-link-textbox"
                    value={exampleLink}
                    readOnly
                  />
                  <Button
                    variant={"primary-1"}
                    soundFXVolume={soundFXVolume}
                    className="link-btn"
                    onClick={generateLobbyLink}
                  >
                    <span className="button-text">{t("copy")}</span>
                  </Button>
                </p>
              </div>
              <div className="lobby-players">
                <Button
                  variant={"room"}
                  soundFXVolume={soundFXVolume}
                  className="room-btn"
                  onClick={startGame}
                >
                  <span className="button-text">Start</span>
                </Button>
                <div className="players-container">
                  <div className="team">
                    <Button
                      className="join-button btn-red"
                      variant={"join-team"}
                      soundFXVolume={soundFXVolume}
                      onClick={
                        isJoinedRed ? removePlayerFromTeam : addPlayerToRedTeam
                      }
                    >
                      {isJoinedRed ? "-" : "+"}
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
                        <span className="player-username">
                          {player.username}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="team">
                    <Button
                      className="join-button btn-blue"
                      variant={"join-team"}
                      soundFXVolume={soundFXVolume}
                      onClick={
                        isJoinedBlue
                          ? removePlayerFromTeam
                          : addPlayerToBlueTeam
                      }
                    >
                      {isJoinedBlue ? "-" : "+"}
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
                        <span className="player-username">
                          {player.username}
                        </span>
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
