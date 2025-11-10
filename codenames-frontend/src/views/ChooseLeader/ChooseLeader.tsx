import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import settingsIcon from "../../assets/icons/settings.png";
import compassImg from "../../assets/images/compass.png";
import profilePicImg from "../../assets/images/profile-pic.png";

import "./ChooseLeader.css";

import { formatTime } from "../../shared/utils";
import { apiUrl, socketUrl } from "../../config/api.tsx";
import { getUserId } from "../../shared/utils.tsx";
import { io } from "socket.io-client";
import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";
import Profile from "../../components/Profile/Profile.tsx";

/**
 * Props for the ChooseLeader component.
 * @typedef {Object} ChooseLeaderProps
 * @property {function(number): void} setVolume - Function to set global volume.
 * @property {number} soundFXVolume - Current sound effects volume level.
 * @property {function(number): void} setSoundFXVolume - Function to set sound effects volume.
 */
interface ChooseLeaderProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
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
 * @property {string} id - The unique identifier of the user.
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
 * ChooseLeader Component
 *
 * This component allows users to vote for a team leader during a game session.
 * It includes a countdown timer, WebSocket communication for real-time updates,
 * and an interactive UI for selecting and voting for a leader.
 *
 * @param {ChooseLeaderProps} props - The component props.
 * @returns {JSX.Element} The ChooseLeader component.
 */
const ChooseLeader: React.FC<ChooseLeaderProps> = ({
                                                     setVolume,
                                                     soundFXVolume,
                                                     setSoundFXVolume,
                                                   }) => {
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<UserRoomLobbyDTO | null>(
    null
  );
  const timeForVoting = 120;
  const votingStartTime = Date.now();
  const [timeLeft, setTimeLeft] = useState(timeForVoting);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [myTeamPlayers, setMyTeamPlayers] = useState<UserRoomLobbyDTO[]>([]);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [isVoteCasted, setIsVoteCasted] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>();

  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  useEffect(() => {
    const storedGameId = sessionStorage.getItem("gameId");

    if (timeLeft <= 0) {
      endPool();
    }

    if (storedGameId) {
      fetch(`${apiUrl}/api/game-session/${storedGameId}`)
        .then((response) => response.json())
        .then(async (data: GameSessionRoomLobbyDTO) => {
          if (data.connectedUsers) {
            if (data.connectedUsers[0]?.some((user) => user.id === userId)) {
              setMyTeamPlayers(data.connectedUsers[0] || []);
              setMyTeam("red");
            } else {
              setMyTeamPlayers(data.connectedUsers[1] || []);
              setMyTeam("blue");
            }
          }
        })
        .catch((err) => console.error("Failed to load game session", err));
      fetch(`${apiUrl}/api/game-session/${storedGameId}/vote-state`)
        .then((response) => response.json())
        .then(async (data: { voteState: boolean }) => {
          if (data.voteState) {
            setTimeLeft(0);
          }
        })
        .catch((err) => console.error("Failed to load vote state", err));
    } else {
      navigate("/games");
    }

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      setTimeLeft(
        timeForVoting - Math.round((currentTime - votingStartTime) / 1000)
      );
    }, 1000);

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
          setMyTeamPlayers(updatedGameSession.connectedUsers[
            myTeam === "red" ? 0 : 1] || []);
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
      clearInterval(timer);
      gameSocket.disconnect();
    };
  }, [timeLeft, navigate]);

  /**
   * Effect that triggers the function to fetch user by user id.
   * when the component is mounted.
   */
  useEffect(() => {
    fetchUserId();
  }, []);

  /**
   * Fetches the user ID from the server.
   * Saves the fetched user ID in localStorage.
   */
  const fetchUserId = async () => {
    try {
      const id = await getUserId();

      if (id === null) {
        return;
      }

      localStorage.setItem("userId", id);
      setUserId(id);
    } catch (error) {
      console.error("Error fetching user ID", error);
    }
  };

  /**
   * Ends the voting phase and assigns leaders.
   * @async
   */
  const endPool = async () => {
    const storedGameId = sessionStorage.getItem("gameId");

    if (storedGameId) {
      await fetch(
        `${apiUrl}/api/game-session/${storedGameId}/assign-leaders?language=${
          localStorage.getItem("i18nextLng") || "en"
        }`,
        {
          method: "GET",
          credentials: "include",
        }
      );
    } else {
      console.error("Game ID is not stored in localStorage.");
    }

    navigate("/gameplay");
  };

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  /**
   * Handles the player selection for voting.
   * @param {User} player - The selected player.
   */
  const handlePlayerClick = (player: UserRoomLobbyDTO) => {
    setSelectedPlayer(player);
  };

  /**
   * Sends the vote for a selected player.
   * @async
   */
  const send_vote = async () => {
    const storedGameId = sessionStorage.getItem("gameId");

    if (storedGameId && selectedPlayer) {
      const voteRequest = {
        userId: userId,
        votedUserId: selectedPlayer.id,
      };

      const response = await fetch(
        `${apiUrl}/api/game-session/${storedGameId}/vote`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(voteRequest),
        }
      );

      if (response.ok) {
        setIsVoteCasted(true);
      }
    }
  };

  return (
    <>
      <BackgroundContainer>
        <GameTitleBar/>
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={toggleSettings}
        >
          <img src={settingsIcon} alt="Settings"/>
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
        <Profile soundFXVolume={soundFXVolume}/>
        <div className="content-container flex-start">
          <div className="timer-container">
            <div className="horizontal-gold-bar"></div>
            <span className="timer">{formatTime(timeLeft)}</span>
          </div>
          <div className="compass-container">
            {selectedPlayer ? (
              <>
                <img src={compassImg} alt="compass" className="Compass"/>
                <div className="center align-center">
                  <span className="choose-leader-label">{t("choosen")}</span>
                  <div className="selected-player-info">
                    <img
                      src={profilePicImg}
                      alt={selectedPlayer.username}
                      className="selected-profile-pic"
                    />
                    <span className="selected-username">
                      {selectedPlayer.username}
                    </span>
                  </div>
                  {isVoteCasted === false ? (
                    <Button
                      variant="room"
                      soundFXVolume={soundFXVolume}
                      onClick={send_vote}
                    >
                      <span className="button-text">{t("lockin")}</span>
                    </Button>
                  ) : (
                    <> </>
                  )}
                </div>
              </>
            ) : (
              <>
                <img src={compassImg} alt="compass" className="Compass"/>
                <span className="choose-leader-label center">
                  {t("choose-team-leader-1")}
                  <br/>
                  {t("choose-team-leader-2")}
                </span>
              </>
            )}
          </div>
          <div className="teams-container">
            <div className="team my-team">
              {myTeamPlayers.map((player, index) => (
                <div
                  key={index}
                  className={`player ${
                    selectedPlayer?.username === player.username
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handlePlayerClick(player)}
                >
                  <img
                    src={profilePicImg}
                    alt={player.username}
                    className="profile-pic"
                  />
                  <span className="username my-team">{player.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <UsernameContainer/>
      </BackgroundContainer>
    </>
  );
};

export default ChooseLeader;
