import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";

import backButton from "../../assets/icons/arrow-back.png";
import linkIcon from "../../assets/icons/link.svg";
import messageIcon from "../../assets/icons/message.svg";


import "./RoomLobby.css";

import { apiUrl, frontendUrl, socketUrl } from "../../config/api.tsx";
import { getUserId } from "../../shared/utils.tsx";
import { io } from "socket.io-client";

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

  const [gameSession, setGameSession] =
    useState<GameSessionRoomLobbyDTO | null>(null);
  const [redTeamPlayers, setRedTeamPlayers] = useState<UserRoomLobbyDTO[]>([]);
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<UserRoomLobbyDTO[]>(
    []
  );
  const [isJoined, setIsJoined] = useState(false);
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
  const [lobbyLink, setLobbyLink] = useState<string>("");
  const [isLinkIsleExpanded, setIsLinkIsleExpanded] = useState(false);
  const exampleLink = `${frontendUrl}/invite/${localStorage.getItem("gameId")}`;

  /**
   * Handles manual closing of a toast error.
   *
   * - Fades out the toast visually before removing it from the state.
   *
   * @param {string} id - The unique identifier of the error toast to be closed.
   */
  const handleCloseErrorToast = (id: string) => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.classList.add("hide");

      setTimeout(() => {
        setErrors((prevErrors) =>
          prevErrors.filter((error) => error.id !== id)
        );
      }, 500);
    }
  };

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
      setIsJoined(true);
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
      setIsJoined(true);
    } else {
      console.error("Failed to add player to blue team");
    }
  };

  /**
   * Removes the current player from the specified team.
   * @param {number} teamIndex - The index of the team to remove the player from (0 for red, 1 for blue).
   */
  const removePlayerFromTeam = async () => {
    setIsJoined(false);
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    const getIdResponse = await fetch(`${apiUrl}/api/users/get-id`, {
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
    } catch (error) {
      console.error("Error removing player from team", error);
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
    const newErrors: { id: string; message: string }[] = [];
    setErrors(newErrors);

    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    if (redTeamPlayers.length < 2 || redTeamPlayers.length < 2) {
      newErrors.push({
        id: generateId(),
        message: t("too-few-players"),
      });
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
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    const tempLobbyLink = `${frontendUrl}/invite/${storedGameId}`;
    setLobbyLink(tempLobbyLink);
    navigator.clipboard.writeText(tempLobbyLink).then(() => {
      console.log("Lobby link copied to clipboard:", tempLobbyLink);
    });
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

  /**
   * useEffect hook for handling the automatic removal of notification messages after a delay.
   *
   * - Adds a fade-out effect to the toast notification before removal.
   * - Removes notifications from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of notification messages with unique IDs.
   */
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers: number[] = notifications.map((notification) => {
      const toastElement = document.getElementById(notification.id);

      if (toastElement) {
        // Fade out the toast after 8 seconds
        const fadeOutTimer = setTimeout(() => {
          toastElement.classList.add("hide");
        }, 8000);

        // Remove the message from state after 8.5 seconds
        const removeTimer = setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notification.id)
          );
        }, 8500);

        return removeTimer;
      } else {
        // Remove message if toast element is not found
        return setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notification.id)
          );
        }, 8000);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  /**
   * useEffect hook for handling the copying of the lobby link to the clipboard.
   *
   * - Displays a notification message when the link is copied.
   * - Clears the lobby link state after displaying the notification.
   *
   * @param {string} lobbyLink - The generated lobby link to be copied.
   */
  useEffect(() => {
    if (lobbyLink) {
      setNotifications((prevNotifications) => {
        const notificationExists = prevNotifications.some(
          (n) => n.message === t("link-copied")
        );

        if (!notificationExists) {
          setLobbyLink("");
          return [
            ...prevNotifications,
            { id: generateId(), message: t("link-copied") },
          ];
        }
        setLobbyLink("");
        return prevNotifications;
      });
    }
  }, [lobbyLink]);

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
                <div className="lobby-link-switch">
                  <img
                    src={linkIcon}
                    alt="Link"
                    className="link-icon"
                    onClick={handleLobbyLinkIsleUnroll}
                  />
                </div>
                                {/*<Button*/}
                {/*    variant={"primary-1"}*/}
                {/*    soundFXVolume={soundFXVolume}*/}
                {/*    className="link-btn"*/}
                {/*    onClick={generateLobbyLink}*/}
                {/*>*/}
                {/*  <span className="button-text">Link</span>*/}
                {/*</Button>*/}
                <div
                  className={`lobby-link-isle ${
                    isLinkIsleExpanded ? "expanded" : ""
                  }`}
                >
                  <img src={messageIcon} alt="Link" className="isle-image" />
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
                {/*{(isJoined) ? (
                <Button
                    variant={"primary-1"}
                    soundFXVolume={soundFXVolume}
                    className="leave-btn"
                    onClick={removePlayerFromTeam}
                >
                    <span className="button-text">{t("leave")}</span>
                </Button>
                ) : ("")}*/}
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
                        <span className="player-username">{player.username}</span>
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
        {errors.length > 0 && (
          <div className="toast-container">
            {errors.map((error) => (
              <div id={error.id} key={error.id} className="toast active">
                <div className="toast-content">
                  <i
                    className="fa fa-exclamation-circle fa-3x"
                    style={{ color: "#561723" }}
                    aria-hidden="true"
                  ></i>
                  <div className="message">
                    <span className="text text-1">Error</span>
                    <span className="text text-2">{error.message}</span>
                  </div>
                </div>
                <i
                  className="fa-solid fa-xmark close"
                  onClick={() => handleCloseErrorToast(error.id)}
                ></i>
                <div className="progress active"></div>
              </div>
            ))}
          </div>
        )}
        {notifications.length > 0 && (
          <div className="toast-container">
            {notifications.map((notification) => (
              <div
                id={notification.id}
                key={notification.id}
                className="toast active"
              >
                <div className="toast-content">
                  <i
                    className="fa fa-info-circle fa-3x"
                    style={{ color: "#1B74BB" }}
                    aria-hidden="true"
                  ></i>
                  <div className="message">
                    <span className="text text-1">Notification</span>
                    <span className="text text-2">{notification.message}</span>
                  </div>
                </div>
                <i
                  className="fa-solid fa-xmark close"
                  onClick={() => handleCloseNotificationToast(notification.id)}
                ></i>
                <div className="progress active notification"></div>
              </div>
            ))}
          </div>
        )}
      </RoomMenu>
    </>
  );
};

export default RoomLobby;
