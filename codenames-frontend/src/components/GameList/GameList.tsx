
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";

import searchBarIcon from "../../assets/images/search_bar_background.png";
import searchIcon from "../../assets/icons/search-icon.png";
import lockIcon from "../../assets/icons/lock-solid.png";
import closeIcon from "../../assets/icons/close.png";
import backButtonIcon from "../../assets/icons/arrow-back.png";
import searchButtonIcon from "../../assets/images/search-button.png";

import "./GameList.css";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

/**
 * Props interface for GameList component.
 */
interface GameListProps {
  soundFXVolume: number;
  gameSessions: GameSession[];
  filteredSessions: GameSession[];
  setFilteredSessions: (sessions: GameSession[]) => void;
}

/**
 * Interface representing a user.
 */
interface User {
  userId: string;
  username: string;
}

/**
 * Enum representing session statuses.
 */
enum SessionStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Interface representing a game session.
 */
interface GameSession {
  status: SessionStatus; // Current status of the game session
  sessionId: string; // Unique session identifier
  gameName: string; // Name of the game session
  maxPlayers: number; // Maximum number of players
  password: string;
  durationOfTheRound: string; // Duration of each round
  timeForGuessing: string; // Time allocated for guessing
  timeForAHint: string; // Time allocated for hints
  numberOfRounds: number; // Total number of rounds in the game
  connectedUsers: User[][]; // Array of connected users
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPasswordOverlayOpen, setIsPasswordOverlayOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * useEffect hook for handling the automatic removal of error messages after a delay.
   *
   * - Adds a fade-out effect to the toast error before removal.
   * - Removes errors from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of error messages with unique IDs.
   */
  useEffect(() => {
    if (errors.length === 0) return;

    const timers: number[] = errors.map((error) => {
      const toastElement = document.getElementById(error.id);

      if (toastElement) {
        // Fade out the toast after 8 seconds
        const fadeOutTimer = setTimeout(() => {
          toastElement.classList.add("hide");
        }, 8000);

        // Remove the error from state after 8.5 seconds
        const removeTimer = setTimeout(() => {
          setErrors((prevErrors) =>
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, 8500);

        return removeTimer;
      } else {
        // Remove error if toast element is not found
        return setTimeout(() => {
          setErrors((prevErrors) =>
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, 8000);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [errors]);

  /**
   * Toggles the visibility of the search bar.
   */
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

  /**
   * Handles the search input change and filters game sessions accordingly.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = gameSessions.filter((game) =>
      game.gameName.toLowerCase().includes(value)
    );
    setFilteredSessions(filtered);
  };

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
   * Joins a specific game session and navigates to the game lobby.
   *
   * @param {string} sessionId - The session ID of the game to join
   */
  const joinSpecificGame = (sessionId: string) => {
    const selectedGame = filteredSessions.find(
      (session) => session.sessionId === sessionId
    );

    if (selectedGame?.password) {
      setSelectedSessionId(sessionId);
      setIsPasswordOverlayOpen(true);
    } else {
      localStorage.setItem("gameId", sessionId);
      navigate("/game-lobby");
    }
  };

  /**
   * Handles password submission
   * @async
   */
  const handleSubmit = async () => {
    if (!selectedSessionId) return;

    const newErrors: { id: string; message: string }[] = [];
    setErrors(newErrors);

    const response = await fetch(
      `http://localhost:8080/api/game-session/${selectedSessionId}/authenticate-password/${enteredPassword}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const result = await response.json();

    if (result) {
      localStorage.setItem("gameId", selectedSessionId);
      navigate("/game-lobby");
    } else {
      newErrors.push({
        id: generateId(),
        message: t("incorrect-password"),
      });

      setErrors([...newErrors]);
    }
  };

  /**
   * Closes currently shown modal.
   */
  const onClose = () => setIsPasswordOverlayOpen(!isPasswordOverlayOpen);

  return (
    <>
      {isSearchVisible && (
        <div
          className={`search-bar ${isAnimating ? "search-bar-animating" : ""}`}
        >
          <img
            src={searchBarIcon}
            alt="searchbar"
            className="search-bar-background"
          />
          <div className="search-bar-container">
            <div
              className={`search-input-container ${
                isAnimating ? "search-bar-visible" : ""
              }`}
            >
              <input
                className="input-field"
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Type to search..."
              />
            </div>
            <img
              src={searchIcon}
              alt="search"
              className={`search-icon ${
                isAnimating ? "search-bar-visible" : ""
              }`}
              onClick={toggleSearch}
            />
          </div>
        </div>
      )}

      <RoomMenu>
        <Button
          className="back-button"
          variant={"circle-back"}
          onClick={() => navigate("/games")}
          soundFXVolume={soundFXVolume}
        >
          <img src={backButtonIcon} alt="Back" className="btn-arrow-back" />
        </Button>

        <Button
          className="search-button"
          variant={"search"}
          onClick={toggleSearch}
          soundFXVolume={soundFXVolume}
        >
          <img src={searchButtonIcon} alt="Search" />
        </Button>
        <span className="room-form-label">{t("join-room-button")}</span>

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
                    {gameSession.connectedUsers[0].length +
                      gameSession.connectedUsers[1].length}
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
            <img src={closeIcon} onClick={onClose} alt="Close" />
          </Button>
          </div>
        </div>
      )}
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
    </>
  );
};

export default GameList;
