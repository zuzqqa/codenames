import React, { useState, useEffect } from "react";
import {data, useNavigate} from "react-router-dom"; // Hook for programmatic navigation
import { useTranslation } from "react-i18next"; // Hook for translations

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import settingsIcon from "../../assets/icons/settings.png";
import compassImg from "../../assets/images/compass.png";
import profilePicImg from "../../assets/images/profile-pic.png";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { formatTime } from "../../shared/utils";
import "./ChooseLeader.css";

// Define the type for props passed to the Gameplay component
interface ChooseLeaderProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

interface User {
  id: string;
  username: string;
}

enum SessionStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

interface GameSession {
  status: SessionStatus;
  sessionId: string;
  gameName: string;
  maxPlayers: number;
  durationOfTheRound: string;
  timeForAHint: string;
  timeForGuessing: string;
  connectedUsers: User[][];
  votingStartTime: number;
}

// Main component definition
const ChooseLeader: React.FC<ChooseLeaderProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const timeForVoting = 30 // Time for voting in seconds
  const [votingStartTime, setVotingStartTime] = useState<number>(Date.now()); // Voting start time
  const [timeLeft, setTimeLeft] = useState(timeForVoting); // Timer state (2 minutes = 120 seconds)
  const navigate = useNavigate(); // Hook for navigation
  const { t } = useTranslation(); // Hook for translations
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [redTeamPlayers, setRedTeamPlayers] = useState<User[]>([]);
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<User[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [isVoteCasted, setIsVoteCasted] = useState<boolean>(false);

  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");

    if (timeLeft <= 0) {
      endPool();
    }

    if (storedGameId) {
      fetch(`http://localhost:8080/api/game-session/${storedGameId}`)
        .then((response) => response.json())
        .then(async (data: GameSession) => {
          if (data.connectedUsers) {
            setRedTeamPlayers(data.connectedUsers[0] || []);
            setBlueTeamPlayers(data.connectedUsers[1] || []);
          }

          const getIdResponse = await fetch(
            "http://localhost:8080/api/users/getId",
            {
              method: "GET",
              credentials: "include",
            }
          );
          const userId = await getIdResponse.text();

          if (data.connectedUsers[0]?.some((user) => user.id === userId)) {
            setMyTeam("red");
          } else if (
            data.connectedUsers[1]?.some((user) => user.id === userId)
          ) {
            setMyTeam("blue");
          } else {
            setMyTeam(null);
          }
          setVotingStartTime(data.votingStartTime);
        })
        .catch((err) => console.error("Failed to load game session", err));
    } else {
      navigate("/games");
    }

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      setTimeLeft(timeForVoting - Math.round((currentTime - votingStartTime)/1000))
    }, 1000);

    // WebSocket connection using SockJS and STOMP
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        // Subscribe to the game session updates
        stompClient.subscribe(`/game/${storedGameId}`, (message) => {
          const updatedGameSession = JSON.parse(message.body);
          if (updatedGameSession) {
            setRedTeamPlayers(updatedGameSession.connectedUsers[0] || []);
            setBlueTeamPlayers(updatedGameSession.connectedUsers[1] || []);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClient.activate();

    // Cleanup function to deactivate WebSocket connection
    return () => {
      clearInterval(timer); // Clear the timer when component unmounts
    };
  }, [timeLeft, navigate]);

  const endPool = async () => {
    const storedGameId = localStorage.getItem("gameId");

    if (storedGameId) {
      // Upewniamy się, że mamy zapisany gameId
      const getIdResponse = await fetch(
        `http://localhost:8080/api/game-session/${storedGameId}/assign-leaders`,
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

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handlePlayerClick = (player: User) => {
    if (myTeam === "red" && redTeamPlayers.includes(player))
      setSelectedPlayer(player);
    else if (myTeam === "blue" && blueTeamPlayers.includes(player))
      setSelectedPlayer(player);
    return;
  };

  const send_vote = async () => {
    const storedGameId = localStorage.getItem("gameId");

    if (storedGameId && selectedPlayer) {
      const getIdResponse = await fetch(
        "http://localhost:8080/api/users/getId",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const userId = await getIdResponse.text();

      const voteRequest = {
        userId: selectedPlayer.id,
        votedUserId: userId,
      };

      const response = await fetch(
        `http://localhost:8080/api/game-session/${storedGameId}/vote`,
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
        <GameTitleBar />
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
        <div className="content-container flex-start">
          <div className="timer-container">
            <div className="horizontal-gold-bar"></div>
            <span className="timer">{formatTime(timeLeft)}</span>
          </div>
          <div className="compass-container">
            {selectedPlayer ? (
              <>
                <img src={compassImg} alt="compass" className="Compass" />
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
                <img src={compassImg} alt="compass" className="Compass" />
                <span className="choose-leader-label center">
                  {t("choose-team-leader-1")}
                  <br />
                  {t("choose-team-leader-2")}
                </span>
              </>
            )}
          </div>
          <div className="teams-container">
            <div className="team my-team">
              {redTeamPlayers.map((player, index) => (
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

            <div className="team opposing-team">
              {blueTeamPlayers.map((player, index) => (
                <div
                  key={index}
                  className={`player ${
                    selectedPlayer?.username === player.username
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handlePlayerClick(player)}
                >
                  <span className="username opposing-team">
                    {player.username}
                  </span>
                  <img
                    src={profilePicImg}
                    alt={player.username}
                    className="profile-pic"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </BackgroundContainer>
    </>
  );
};

export default ChooseLeader;
