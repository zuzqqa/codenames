import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import "./RoomLobby.css";

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
    connectedUsers: User[];
}

interface RoomLobbyProps {
    soundFXVolume: number;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ soundFXVolume }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedGameId = localStorage.getItem('gameId');
    
        if (storedGameId) {
            fetch(`http://localhost:8080/api/game-session/${storedGameId}`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch game session data');
                    }
                })
                .then((data: GameSession) => {
                    const roundDurationInSeconds = convertDurationToSeconds(data.durationOfTheRound);
                    const hintTimeInSeconds = convertDurationToSeconds(data.timeForAHint);
                    const guessingTimeInSeconds = convertDurationToSeconds(data.timeForGuessing);

                    setGameSession({
                        ...data,
                        durationOfTheRound: roundDurationInSeconds.toString(), 
                        timeForAHint: hintTimeInSeconds.toString(),
                        timeForGuessing: guessingTimeInSeconds.toString()
                    });
                    
                })
                .catch(() => {
                    setError('Failed to load game session. Please try again.');
                });
        } else {
            navigate('/join-game');
        }
    }, [navigate]);
    

    function convertDurationToSeconds(duration: string | number): number {    
        if (typeof duration === 'string') {
            const regex = /^PT(\d+)([SMH])$/;
            const match = duration.match(regex);
    
            if (match) {
                const value = parseInt(match[1], 10);
                const unit = match[2];
    
                if (unit === 'S') {
                    return value; 
                } else if (unit === 'M') {
                    return value * 60;  
                } else if (unit === 'H') {
                    return value * 3600;  
                } else {
                    console.warn("Unhandled unit:", unit); 
                    return 0; 
                }
            } else {
                console.warn("Invalid duration format:", duration);  
            }
        }

        return typeof duration === 'number' ? duration : 0;
    }
    
    const start_game = async () => {
        const storedGameId = localStorage.getItem('gameId');

        if(!storedGameId) {
            setError('No game session found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/game-session/${storedGameId}/start`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: null,
            });
            
            if (!response.ok) {
                throw new Error('Failed to start the game');
            }

            navigate('/choose-leader');
        } catch (error) {
            setError('Failed to start the game. Please try again.');
        }
    }

    return (
        <>
            <RoomMenu>
                <Button
                    className="back-button"
                    variant={"circle-back"}
                    soundFXVolume={soundFXVolume}
                    onClick={() => navigate('/join-game')}
                >
                    <img src={backButton} alt="Back" className="btn-arrow-back" />
                </Button>
                <span className="room-form-label">{t('game-lobby')}</span>
                <div className="background" style={{ gridColumn: "2", gridRow: "2" }}>
                    {gameSession && (
                        <div className="content">
                            <div className="game-name">{gameSession.gameName}</div>
                            <div className="div-id">ID: {gameSession.sessionId}</div>
                            <div>{t('slots')} {gameSession.connectedUsers ? gameSession.connectedUsers.length : 0}/{gameSession.maxPlayers}</div>
                            <div>{t('duration')}</div>
                            <div>{gameSession.durationOfTheRound} s</div>
                            <div>{t('hint-duration')}</div>
                            <div>{gameSession.timeForAHint} s</div>
                            <div className="lobby-players">
                                <Button
                                    variant={"room"}
                                    soundFXVolume={soundFXVolume}
                                    className="room-btn"
                                    onClick={start_game}
                                >
                                    <span className="button-text">Start</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </RoomMenu>
        </>
    );
};

export default RoomLobby;
