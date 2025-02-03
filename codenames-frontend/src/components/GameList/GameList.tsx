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

interface GameListProps {
  soundFXVolume: number;
  gameSessions: GameSession[];
  filteredSessions: GameSession[];
  setFilteredSessions: (sessions: GameSession[]) => void;
}

interface User {
  userId: string;
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
  timeForGuessing: string;
  timeForAHint: string;
  numberOfRounds: number;
  connectedUsers: User[][];
}

const GameList: React.FC<GameListProps> = ({
  soundFXVolume,
  gameSessions,
  filteredSessions,
  setFilteredSessions,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { t } = useTranslation();
  const navigate = useNavigate();

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
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

  const join_specific_game = (sessionId: string) => {
    localStorage.setItem("gameId", sessionId);
    navigate("/game-lobby");
  };

  return (
    <>
      {isSearchVisible && (
        <div
          className={`search-bar ${
            isSearchVisible ? "search-bar-visible" : ""
          }`}
        >
          <img
            src={searchBar}
            alt="searchbar"
            className="search-bar-background"
          />
          <div className="search-bar-container">
            <div className="search-input-container">
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
              className="search-icon"
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
