import {useNavigate, useParams} from "react-router-dom";
import Subtitle from "../Subtitle/Subtitle.tsx";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import React, {useState} from "react";
import "./RoomLobby.css";

interface Player {
    name: string;
}

interface GameSession {
    id: string;
    name: string;
    players: number;
    maxPlayers: number;
    roundDuration: number;
    hintTime: number;
    playersList: Player[];
}

interface RoomLobbyProps {
    soundFXVolume: number;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({soundFXVolume}) => {

    const navigate = useNavigate()
    const {gameId} = useParams();
    // gameSession = api.get(`/game/${gameId}`)
    // Game Session should be read via API call, for development purposes it is hardcoded
    const [gameSession] = useState<GameSession>({
        id: gameId || '',
        name: "Game 1",
        players: 2,
        maxPlayers: 4,
        roundDuration: 60,
        hintTime: 30,
        playersList: [{name: "Player 1"}, {name: "Player 2"}, {name: "Player 3"}, {name: "Player 4"}]
    });


    return (
        <>
            <Subtitle variant={"room"}>Room Lobby</Subtitle>
            <RoomMenu>
                <Button variant={"circle-back"} soundFXVolume={soundFXVolume} onClick={() => navigate('/games')}>
                    <img src={backButton} alt="Back" className="btn-arrow-back"/>
                </Button>
                <div className="background" style={{gridColumn: "2", gridRow: "2"}}>
                    {gameSession && (
                        <div className="content">
                            <div className="game-name">{gameSession.name}</div>
                            <div className="div-id">ID: {gameSession.id}</div>
                            <div>Slots: {gameSession.players}/{gameSession.maxPlayers}</div>
                            <div>Duration of the round:</div>
                            <div>{gameSession.roundDuration} s</div>
                            <div>Time for a hint:</div>
                            <div>{gameSession.hintTime} s</div>
                            <div className="lobby-players">
                                {gameSession.playersList.map((player, index) =>
                                    <div key={index} className="player">
                                        {player.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <Button variant={"room"} soundFXVolume={soundFXVolume} className="room-btn">Start</Button>
                </div>

            </RoomMenu>
        </>
    );
}

export default RoomLobby;