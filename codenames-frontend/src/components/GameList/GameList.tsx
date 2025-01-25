import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button.tsx";
import searchBar from "../../assets/images/search-bar.png";
import searchIcon from "../../assets/icons/search-icon.png";

import "./GameList.css";

import backButton from "../../assets/icons/arrow-back.png";
import searchButton from "../../assets/images/search-button.png";

import { useState, useEffect } from "react";

interface GameListProps {
  soundFXVolume: number;
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
  connectedUsers: User[][]; // A table of two arrays representing teams
}

const GameList: React.FC<GameListProps> = ({ soundFXVolume }) => {
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameSession[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/game-session/all")
      .then((response) => response.json())
      .then((data) => {
        // Filter games with status 'CREATED'
        const createdGames = data.filter((game: GameSession) => game.status === SessionStatus.CREATED);
        setGameSessions(createdGames);
        setFilteredGames(createdGames);
      })
      .catch((error) => {
        console.error("Error fetching game sessions:", error);
      });
  }, []);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    setSearchTerm("");
    setFilteredGames(gameSessions); // Reset filter when search is closed
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = gameSessions.filter((game) =>
      game.gameName.toLowerCase().includes(value)
    );
    setFilteredGames(filtered);
  };

  const join_specific_game = (sessionId: string) => {
    localStorage.setItem('gameId', sessionId);
    navigate('/game-lobby');
  };

  return (
    <>
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

        {isSearchVisible && (
          <div className="search-bar">
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
                  placeholder="Search games..."
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

        <div
          className="list-container"
          style={{ gridColumn: "2", gridRow: "2" }}
        >
          <ul className="list-content">
            {filteredGames.map((gameSession) => (
              <li
                key={gameSession.sessionId}
                onClick={() => join_specific_game(gameSession.sessionId)}
              >
                <div className="room-info">
                  <div className="room-name">{gameSession.gameName}</div>
                  <div className="room-players">
                    Slots: {gameSession.connectedUsers[0].length + gameSession.connectedUsers[1].length}/{gameSession.maxPlayers}
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
