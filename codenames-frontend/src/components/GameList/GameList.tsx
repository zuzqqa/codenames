import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";
import lockIcon from "../../assets/icons/lock-solid.png";
import closeIcon from "../../assets/icons/close.png";
import backButtonIcon from "../../assets/icons/arrow-back.png";

import "./GameList.css";

import { apiUrl } from "../../config/api.tsx";
import { useToast } from "../Toast/ToastContext.tsx";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

/**
 * Props interface for GameList component.
 */
interface GameListProps {
  soundFXVolume: number;
  gameSessions: GameSessionJoinGameDTO[];
  filteredSessions: GameSessionJoinGameDTO[];
  setFilteredSessions: (sessions: GameSessionJoinGameDTO[]) => void;
}

/**
 * Enumeration of possible game session statuses.
 */
enum SessionStatus {
  CREATED = "CREATED",
  LEADER_SELECTION = "LEADER_SELECTION",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Represents a simplified game session (used in JoinGame list).
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
 * GameList component that displays a list of available game sessions.
 * Users can search for a specific game session and join it.
 *
 * @component
 * @param {GameListProps} props - The component props
 * @returns {JSX.Element} The rendered GameList component
 */
const GameList: React.FC<GameListProps> = ({
                                             soundFXVolume,
                                             gameSessions,
                                             filteredSessions,
                                             setFilteredSessions,
                                           }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPasswordOverlayOpen, setIsPasswordOverlayOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleSearch = () => {
    if (!isSearchVisible) {
      setIsSearchVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setTimeout(() => setIsAnimating(false), 500);
      setIsSearchVisible(false);
    }
    setSearchTerm("");
    setFilteredSessions(gameSessions);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = gameSessions.filter((game) =>
      game.gameName.toLowerCase().includes(value)
    );
    setFilteredSessions(filtered);
  };

  const joinSpecificGame = (sessionId: string) => {
    const selectedGame = filteredSessions.find(
      (session) => session.sessionId === sessionId
    );

    if (selectedGame?.password) {
      setSelectedSessionId(sessionId);
      setIsPasswordOverlayOpen(true);
    } else {
      sessionStorage.setItem("gameId", sessionId);
      navigate("/game-lobby");
    }
  };

  const handleSubmit = async () => {
    if (!selectedSessionId) return;

    const response = await fetch(
      `${apiUrl}/api/game-session/${selectedSessionId}/authenticate-password/${enteredPassword}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const result = await response.json();

    if (result) {
      sessionStorage.setItem("gameId", selectedSessionId);
      navigate("/game-lobby");
    } else {
      addToast(t("incorrect-password"), "error");
    }
  };

  const onClose = () => setIsPasswordOverlayOpen(!isPasswordOverlayOpen);

  return (
    <>
      <RoomMenu>
        <Button
          className="back-button"
          variant={"circle-back"}
          onClick={() => navigate("/games")}
          soundFXVolume={soundFXVolume}
        >
          <img src={backButtonIcon} alt="Back" className="btn-arrow-back"/>
        </Button>
        <span className="room-form-label">{t("join-room-button")}</span>

        <div className="simple-search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div
          className="list-container"
          style={{ gridColumn: "2", gridRow: "2" }}
        >
          <ul className="list-content">
            {filteredSessions.map((gameSession) => (
              <li
                key={gameSession.sessionId}
                onClick={() => joinSpecificGame(gameSession.sessionId)}
              >
                <div className="room-info">
                  <div className="room-name">{gameSession.gameName}</div>
                  {gameSession.password !== "" && (
                    <img
                      src={lockIcon}
                      className="password-overlay small-lock-icon"
                    ></img>
                  )}
                  <div className="room-players">
                    Slots:{" "}
                    {gameSession.currentRedTeamPlayers +
                      gameSession.currentBlueTeamPlayers}
                    /{gameSession.maxPlayers}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="list-background"
          style={{ gridColumn: "2", gridRow: "2" }}
        ></div>

      </RoomMenu>
      {isPasswordOverlayOpen && (
        <div className="overlay-backdrop">
          <div className="pass-overlay">
            <span className="room-form-label pass-overlay-label">
              {t("pass-overlay-label")}
            </span>
            <div className="password-input-overlay">
              <input
                type="password"
                placeholder={t("PASSWORD")}
                name="password"
                className="input-box password-overlay"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
              />
            </div>
            <Button
              variant="primary-1"
              soundFXVolume={soundFXVolume}
              onClick={handleSubmit}
              className="sbmit"
            >
              <span>{t("submit-button")}</span>
            </Button>
            <Button variant="circle" soundFXVolume={soundFXVolume}>
              <img src={closeIcon} onClick={onClose} alt="Close"/>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameList;
