import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";

import "./RoomLobby.css";

import playerIcon from "../../assets/images/player-icon.png";

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
    const { t } = useTranslation();
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
        playersList: [{name: "Player 1"}, {name: "Player 2"}, {name: "Player 3"}, {name: "Player 4"}, {name: "Player 5"}, {name: "Player 6"}, {name: "Player 8"}]
    });


    return (
        <>
            <RoomMenu>
                <Button className="back-button" variant={"circle-back"} soundFXVolume={soundFXVolume} onClick={() => navigate('/join-game')}>
                    <img src={backButton} alt="Back" className="btn-arrow-back"/>
                </Button>
                <span className="room-form-label">{ t('game-lobby') }</span>
                <div className="background" style={{gridColumn: "2", gridRow: "2"}}>
                    {gameSession && (
                        <div className="content">
                            <div className="game-name">{gameSession.name}</div>
                            <div className="div-id">ID: {gameSession.id}</div>
                            <div>{ t('slots') } {gameSession.players}/{gameSession.maxPlayers}</div>
                            <div>{ t('duration') }</div>
                            <div>{gameSession.roundDuration} s</div>
                            <div>{ t('hint-duration') }</div>
                            <div>{gameSession.hintTime} s</div>
                            <div className="lobby-players">
                                <Button variant={"room"} soundFXVolume={soundFXVolume} className="room-btn">
                                    <span className="button-text">Start</span>
                                </Button>
                                <div className="players-container">
                                {gameSession.playersList.map((player, index) =>
                                    <div key={index} className="player-container">
                                        <img src={playerIcon} alt="Player" className="player-icon"/>
                                            {player.name}
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </RoomMenu>
        </>
    );
}

export default RoomLobby;