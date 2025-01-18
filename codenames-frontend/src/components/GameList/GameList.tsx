import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import {useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';

import Subtitle from "../Subtitle/Subtitle.tsx";
import Button from "../Button/Button.tsx";

import "./GameList.css";

import backButton from "../../assets/icons/arrow-back.png";
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
    const { t } = useTranslation();

    const navigate = useNavigate()
    return (
        <>
            <Subtitle variant={"room"}>{ t('join-room-button') }</Subtitle>
            <RoomMenu>
                <Button variant={"circle-back"} onClick={() => navigate('/games')} soundFXVolume={soundFXVolume}>
                    <img src={backButton} alt="Back" className="btn-arrow-back" />
                </Button>
                <div className={"list-content"} style={{"gridColumn":"2","gridRow":"2"}}>
                    {gameSessions.map((gameSession) => (
                        <Button key={gameSession.id} variant={"session"} onClick={() => navigate(`/game-lobby/${gameSession.id}`)} soundFXVolume={soundFXVolume}>
                            <div className={"room-info"}>
                                <div className={"room-name"}>{gameSession.name}</div>
                                <div className={"room-players"}>{gameSession.players}/{gameSession.maxPlayers}</div>
                            </div>
                        </Button>
                    ))
                    }
                </div>
            </RoomMenu>
        </>
    );
}

export default GameList;