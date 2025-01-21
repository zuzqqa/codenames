import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import {useNavigate} from "react-router-dom";
import Button from "../Button/Button.tsx";
import SearchModal from "../../components/SearchOverlay/SearchModal";

import "./GameList.css";

import backButton from "../../assets/icons/arrow-back.png";
import searchButton from "../../assets/images/search-button.png";

import {useState} from "react";

interface GameListProps {
    soundFXVolume: number;
}

interface GameSession {
    id: string;
    name: string;
    players: number;
    maxPlayers: number;
}

const GameList: React.FC<GameListProps> = ({soundFXVolume}) => {
    const [gameSessions] = useState<GameSession[]>([
        {id: "1", name: "Game 1", players: 2, maxPlayers: 4},
        {id: "2", name: "Game 2", players: 3, maxPlayers: 4},
        {id: "3", name: "Game 3", players: 4, maxPlayers: 4},
        {id: "4", name: "Game 4", players: 1, maxPlayers: 4},
        {id: "5", name: "Game 5", players: 2, maxPlayers: 4},
        {id: "6", name: "Game 6", players: 3, maxPlayers: 4},
        {id: "7", name: "Game 7", players: 4, maxPlayers: 4},
        {id: "8", name: "Game 8", players: 1, maxPlayers: 4},
        {id: "9", name: "Game 9", players: 2, maxPlayers: 4},
        {id: "10", name: "Game 10", players: 3, maxPlayers: 4},
    ]);

      const [isSearchbarOpen, setIsSearchbarOpen] = useState(false); // Tracks if the search modal is open
    const toggleSearch = () => {
        setIsSearchbarOpen(!isSearchbarOpen);
      };
    

    const navigate = useNavigate()
    return (
        <>
            <RoomMenu>
                <Button className="back-button" variant={"circle-back"} onClick={() => navigate('/games')} soundFXVolume={soundFXVolume}>
                    <img src={backButton} alt="Back" className="btn-arrow-back" />
                </Button>
                <Button className="search-button" variant={"search"}  onClick={toggleSearch} soundFXVolume={soundFXVolume}>
                    <img src={searchButton} alt="Search" />
                </Button>
                <span className="room-form-label">Join Room</span>
                <div className={"list-container"} style={{"gridColumn":"2","gridRow":"2"}}>
                    <ul className="list-content">
                    {gameSessions.map((gameSession) => (
                        <li onClick={() => navigate(`/game-lobby/${gameSession.id}`)}>
                            <div className={"room-info"}>
                                <div className={"room-name"}>{gameSession.name}</div>
                                <div className={"room-players"}>slots: {gameSession.players}/{gameSession.maxPlayers}</div>
                            </div>
                        </li>
                    ))
                    }
                    </ul>
                </div>
                {/* Settings modal */}
                <SearchModal
                isOpen={isSearchbarOpen}
                onClose={toggleSearch}
                soundFXVolume={soundFXVolume}
                />
            </RoomMenu>
        </>
    );
}

export default GameList;