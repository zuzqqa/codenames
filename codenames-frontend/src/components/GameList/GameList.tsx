import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button.tsx";
import searchBar from "../../assets/images/search_bar_background.png";
import searchIcon from "../../assets/icons/search-icon.png";

import "./GameList.css";

import backButton from "../../assets/icons/arrow-back.png";
import searchButton from "../../assets/images/search-button.png";

import { useState } from "react";

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

  const { t } = useTranslation();
  const navigate = useNavigate();

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
   * Joins a specific game session and navigates to the game lobby.
   *
   * @param {string} sessionId - The session ID of the game to join
   */
  const join_specific_game = (sessionId: string) => {
    localStorage.setItem("gameId", sessionId);
    navigate("/game-lobby");
  };

  return (
    <>
      {isSearchVisible && (
        <div
          className={`search-bar ${isAnimating ? "search-bar-animating" : ""}`}
        >
          <img
            src={searchBar}
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
          <img src={backButton} alt="Back" className="btn-arrow-back" />
        </Button>

        <Button
          className="search-button"
          variant={"search"}
          onClick={toggleSearch}
          soundFXVolume={soundFXVolume}
        >
          <img src={searchButton} alt="Search" />
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
                onClick={() => join_specific_game(gameSession.sessionId)}
              >
                <div className="room-info">
                  <div className="room-name">{gameSession.gameName}</div>
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
      </RoomMenu>
    </>
  );
};

export default GameList;
