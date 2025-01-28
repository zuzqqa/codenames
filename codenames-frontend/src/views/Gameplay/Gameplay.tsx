import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import settingsIcon from "../../assets/icons/settings.png";
import shelfImg from "../../assets/images/shelf.png";
import cardsStackImg from "../../assets/images/cards-stack.png";
import cardWhiteImg from "../../assets/images/card-white.png";
import cardBlackImg from "../../assets/images/card-black.png";
import cardRedImg from "../../assets/images/card-red.jpg";
import cardBlueImg from "../../assets/images/card-blue.jpg";
import polygon1Img from "../../assets/images/polygon1.png";
import polygon2Img from "../../assets/images/polygon2.png";
import { convertDurationToSeconds } from "../../shared/utils.tsx";
import cardSound from "../../assets/sounds/card-filp.mp3";

import "./Gameplay.css";
import Chat from "../../components/Chat/Chat.tsx";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../../shared/utils.tsx";
import { boolean } from "yup";
interface GameplayProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

interface User {
  id: string;
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
  timeForAHint: string;
  timeForGuessing: string;
  connectedUsers: User[][];
  gameState: GameState;
}

interface GameState {
  blueTeamLeader: User;
  redTeamLeader: User;
  blueTeamScore: number;
  redTeamScore: number;
  teamTurn: number;
  hint: string;
  cards: string[];
  cardsColors: number[];
  cardsChoosen: number[];
  hintTurn: boolean;
  guessingTurn: boolean;
}

const Gameplay: React.FC<GameplayProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [cardText, setCardText] = useState("");
  const [cardDisplayText, setCardDisplayText] = useState("");
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [redTeamPlayers, setRedTeamPlayers] = useState<User[]>([]);
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<User[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [cards, setCards] = useState<string[]>(
    new Array(25).fill(cardWhiteImg)
  );
  const [flipStates, setFlipStates] = useState<boolean[]>(
    new Array(25).fill(false)
  );
  const [amIRedTeamLeader, setAmIRedTeamLeader] = useState(false);
  const [amIBlueTeamLeader, setAmIBlueTeamLeader] = useState(false);
  const navigate = useNavigate();
  const [blueTeamScore, setBlueTeamScore] = useState(0);
  const [redTeamScore, setRedTeamScore] = useState(0);
  const [whosTurn, setWhosTurn] = useState<string>("red");
  const [isGuessingTime, setIsGuessingTime] = useState(false); // or true
  const [isHintTime, setIsHintTime] = useState(false); // or true
  const [remainingTime, setRemainingTime] = useState(0);
  const [winningTeam, setWinningTeam] = useState<string>("red");
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardsToReveal, setCardsToReveal] = useState<number[]>([]);
  const [hasEndRoundBeenCalled, setHasEndRoundBeenCalled] = useState(false);
  const clickAudio = new Audio(cardSound);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleCardImage = (index: number) => {
    if (amIRedTeamLeader || amIBlueTeamLeader || whosTurn !== myTeam) return;
    if (flipStates[index]) return;

    clickAudio.volume = soundFXVolume / 100;
    clickAudio.play();
    setFlipStates((prevFlipStates) => {
      const newFlipStates = [...prevFlipStates];
      newFlipStates[index] = !newFlipStates[index];
      return newFlipStates;
    });

    setTimeout(() => {
      setCards((prevCards) => {
        const newCards = [...prevCards];
        const cardColor = gameSession?.gameState.cardsColors[index];

        switch (cardColor) {
          case 0:
            newCards[index] = cardWhiteImg;
            break;
          case 1:
            newCards[index] = cardRedImg;
            break;
          case 2:
            newCards[index] = cardBlueImg;
            break;
          case 3:
            newCards[index] = cardBlackImg;
            break;
          default:
            newCards[index] = cardWhiteImg;
        }

        return newCards;
      });
    }, 170);
  };

  const handleCardSelection = (index: number) => {
    if (amIRedTeamLeader || amIBlueTeamLeader) return;

    setSelectedCards((prevSelectedCards) => {
      if (prevSelectedCards.includes(index)) {
        return prevSelectedCards.filter((cardIndex) => cardIndex !== index);
      } else {
        return [...prevSelectedCards, index];
      }
    });
  };

  const toggleBlackCardVisibility = () => {
    clickAudio.volume = soundFXVolume / 100;
    clickAudio.play();
    setIsCardVisible(true);
  };

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && cardText.trim()) {
      sendHint();
      setCardDisplayText(cardText);
      setIsCardVisible(false);
      setCardText("");
    }
    if (event.key === "Escape") {
      setIsCardVisible(false);
      setCardText("");
    }
  };

  const revealCardsVotedByTeam = () => {
    console.log("ZACZYNAM REVEALOWAC KARTY");
    console.log(cardsToReveal);
    if (!gameSession?.gameState || cardsToReveal.length === 0) return;

    setFlipStates((prevFlipStates) => {
      const newFlipStates = [...prevFlipStates];
      cardsToReveal.forEach((cardIndex) => {
        newFlipStates[cardIndex] = true;
      });
      return newFlipStates;
    });

    setCards((prevCards) => {
      const newCards = [...prevCards];
      cardsToReveal.forEach((cardIndex) => {
        const cardColor = gameSession.gameState.cardsColors[cardIndex];
        switch (cardColor) {
          case 1:
            newCards[cardIndex] = cardRedImg;
            break;
          case 2:
            newCards[cardIndex] = cardBlueImg;
            break;
          case 3:
            newCards[cardIndex] = cardBlackImg;
            break;
          default:
            newCards[cardIndex] = cardWhiteImg;
        }
      });
      return newCards;
    });
  };

  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");

    if (storedGameId) {
      fetch(`http://localhost:8080/api/game-session/${storedGameId}`)
        .then((response) => response.json())
        .then(async (data: GameSession) => {
          const hintTimeInSeconds = convertDurationToSeconds(data.timeForAHint);
          const guessingTimeInSeconds = convertDurationToSeconds(
            data.timeForGuessing
          );

          setGameSession({
            ...data,
            timeForAHint: hintTimeInSeconds.toString(),
            timeForGuessing: guessingTimeInSeconds.toString(),
          });

          if (data.connectedUsers) {
            setRedTeamPlayers(data.connectedUsers[0] || []);
            setBlueTeamPlayers(data.connectedUsers[1] || []);
          }

          const getIdResponse = await fetch(
            "http://localhost:8080/api/users/getId",
            {
              method: "GET",
              credentials: "include",
            }
          );
          const userId = await getIdResponse.text();

          if (data.connectedUsers[0]?.some((user) => user.id === userId)) {
            setMyTeam("red");
          } else if (
            data.connectedUsers[1]?.some((user) => user.id === userId)
          ) {
            setMyTeam("blue");
          } else {
            setMyTeam(null);
          }

          if (data.gameState?.blueTeamLeader?.id === userId) {
            setAmIBlueTeamLeader(true);
          } else if (data.gameState?.redTeamLeader?.id === userId) {
            setAmIRedTeamLeader(true);
          }
          setBlueTeamScore(data.gameState?.blueTeamScore || 0);
          setRedTeamScore(data.gameState?.redTeamScore || 0);
          setIsHintTime(data.gameState?.hintTurn);
          setIsGuessingTime(data.gameState?.guessingTurn);
          setCardsToReveal(data.gameState?.cardsChoosen || []);
        })
        .catch((err) => console.error("Failed to load game session", err));
    } else {
      navigate("/games");
    }

    // WebSocket connection using SockJS and STOMP
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        // Subscribe to the game session updates
        stompClient.subscribe(`/game/${storedGameId}/timer`, (message) => {
          const updatedGameSession = JSON.parse(message.body);
          if (updatedGameSession) {
            setRedTeamPlayers(updatedGameSession.connectedUsers[0] || []);
            setBlueTeamPlayers(updatedGameSession.connectedUsers[1] || []);
            setWhosTurn(
              updatedGameSession.gameState?.teamTurn === 0 ? "red" : "blue"
            );
            setIsHintTime(updatedGameSession.gameState?.hintTurn);
            setIsGuessingTime(updatedGameSession.gameState?.guessingTurn);
            setCardsToReveal(updatedGameSession.gameState?.cardsChoosen || []);
            if (
              updatedGameSession.gameState?.hint !==
              gameSession?.gameState?.hint
            ) {
              setGameSession((prevState) => {
                if (!prevState) {
                  return updatedGameSession;
                }
                return {
                  ...prevState,
                  gameState: {
                    ...prevState.gameState,
                    hint: updatedGameSession.gameState.hint,
                  },
                };
              });
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });
    stompClient.activate();
    revealCardsVotedByTeam();

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [cardText, navigate, cardsToReveal, isHintTime, isGuessingTime]);

  const sendHint = () => {
    if (!cardText.trim()) return;
    const storedGameId = localStorage.getItem("gameId");

    if (!amIRedTeamLeader && !amIBlueTeamLeader) return;

    fetch(`http://localhost:8080/api/game-session/${storedGameId}/send-hint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({ hint: cardText }),
    });

    setCardText(""); 
  };

  const submitVotes = () => {
    const storedGameId = localStorage.getItem("gameId");

    fetch(`http://localhost:8080/api/game-state/${storedGameId}/vote`, {
      method: "POST",
      body: JSON.stringify({ selectedCards }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((text) => {
        if (text === "Votes submitted successfully") {
          console.log("Votes submitted successfully");
        } else {
          console.error("Unexpected server response:", text);
        }
      })
      .catch((error) => {
        console.error("Error submitting votes:", error);
      });
  };

  // const endGameIfFinished = () => {
  //   const maxScore = 6;

  //   if (blueTeamScore >= maxScore || myTeam === "blue") {
  //     if (myTeam === "blue")
  //       navigate("/win-loss", { state: { result: "Victory" } });
  //     else navigate("/win-loss", { state: { result: "Loss" } });
  //   } else if (redTeamScore >= maxScore) {
  //     if (myTeam === "red")
  //       navigate("/win-loss", { state: { result: "Victory" } });
  //     else navigate("/win-loss", { state: { result: "Loss" } });
  //   }
  // };

  // const terminateGameBcOfBlackCard = () => {
  //   if (myTeam === whosTurn) {
  //     navigate("/win-loss", { state: { result: "Loss" } });
  //   } else {
  //     navigate("/win-loss", { state: { result: "Victory" } });
  //   }
  // };

  return (
    <>
      <BackgroundContainer>
        <span className="below timer">
          {(() => {
            if (
              (amIBlueTeamLeader || amIRedTeamLeader) &&
              isHintTime &&
              whosTurn === myTeam
            ) {
              return "Podaj podpowiedz";
            } else if (
              (amIBlueTeamLeader || amIRedTeamLeader) &&
              isGuessingTime &&
              whosTurn === myTeam
            ) {
              return "Twoja druzyna zgaduje";
            } else if (
              !amIBlueTeamLeader &&
              !amIRedTeamLeader &&
              isHintTime &&
              whosTurn === myTeam
            ) {
              return "Lider wybiera podpowiedz";
            } else if (isHintTime && whosTurn !== myTeam) {
              return "Podpowiedz druzyny przeciwnej";
            } else if (
              !amIBlueTeamLeader &&
              !amIRedTeamLeader &&
              isGuessingTime &&
              whosTurn === myTeam
            ) {
              return "Zgadujesz";
            } else if (isGuessingTime && whosTurn !== myTeam) {
              return "Zgaduje druzyna przeciwna";
            }
          })()}
        </span>

        {/* Settings button */}
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>

        {/* Settings modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          musicVolume={musicVolume}
          soundFXVolume={soundFXVolume}
          setMusicVolume={(volume) => {
            setMusicVolume(volume); // Update local music volume
            setVolume(volume / 100); // Update global volume
          }}
          setSoundFXVolume={setSoundFXVolume}
        />

        <img className="polygon1" src={polygon1Img} />
        <img className="polygon2" src={polygon2Img} />
        <div className="timer points-red">{redTeamScore}</div>
        <div className="timer points-blue">{blueTeamScore}</div>
        <Chat />
        <div className="content-container">
          <div className="timer-container">
            <div className="horizontal-gold-bar"></div>
            <span className="timer">
              {formatTime(
                isHintTime
                  ? Number(gameSession?.timeForAHint)
                  : Number(gameSession?.timeForGuessing)
              )}
            </span>
          </div>
          <div className="cards-section">
            {cards.map((cardImage, index) => (
              <div
                key={index}
                className={`card-container ${
                  selectedCards.includes(index) ? "selected-card" : ""
                } ${amIRedTeamLeader || amIBlueTeamLeader ? "disabled" : ""}`}
                onClick={() => handleCardSelection(index)}
              >
                <img
                  className={`card ${
                    flipStates[index] || (amIRedTeamLeader && amIBlueTeamLeader)
                      ? "flip"
                      : ""
                  }`}
                  src={
                    amIRedTeamLeader || amIBlueTeamLeader
                      ? (() => {
                          const cardColor =
                            gameSession?.gameState.cardsColors[index];
                          switch (cardColor) {
                            case 1:
                              return cardRedImg;
                            case 2:
                              return cardBlueImg;
                            case 3:
                              return cardBlackImg;
                            default:
                              return cardWhiteImg;
                          }
                        })()
                      : cardImage
                  }
                  alt={`card-${index}`}
                />
                {!flipStates[index] && (
                  <span
                    className={`card-text ${
                      gameSession?.gameState.cardsColors[index] != 0 &&
                      (amIRedTeamLeader || amIBlueTeamLeader)
                        ? "gold-text"
                        : ""
                    }`}
                  >
                    {gameSession?.gameState.cards[index]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="bottom-section">
            <div className="item">
              <img className="shelf" src={shelfImg} />
            </div>
            <div className="item">
              <Button
                variant="room"
                soundFXVolume={soundFXVolume}
                className={
                  ((amIBlueTeamLeader || amIRedTeamLeader) &&
                    isHintTime &&
                    whosTurn !== myTeam) ||
                  ((amIBlueTeamLeader || amIRedTeamLeader) && isGuessingTime) ||
                  (!amIBlueTeamLeader && !amIRedTeamLeader && isHintTime) ||
                  (!amIBlueTeamLeader &&
                    !amIRedTeamLeader &&
                    isGuessingTime &&
                    whosTurn !== myTeam)
                    ? "hidden"
                    : ""
                }
              >
                <span className="button-text">{t("end-round")}</span>
              </Button>
              <Button
                variant="room"
                soundFXVolume={soundFXVolume}
                onClick={submitVotes}
                className={
                  amIBlueTeamLeader ||
                  amIRedTeamLeader ||
                  (isHintTime && whosTurn === myTeam) ||
                  whosTurn !== myTeam
                    ? "hidden"
                    : ""
                }
              >
                <span className="button-text">Lock in</span>
              </Button>
              <div className="horizontal-gold-bar" />
            </div>
            <div className="item">
              <img className="card-stack" src={cardsStackImg} />
              <div
                className="codename-card-container"
                onClick={toggleBlackCardVisibility}
              >
                <span className="codename-card-text">
                  {gameSession?.gameState.hint || ""}
                </span>
                <img className="codename-card" src={cardBlackImg} />
              </div>
            </div>
          </div>
        </div>
        {isCardVisible && (
          <div className="card-black-overlay">
            <img
              className="card-black-img"
              src={cardBlackImg}
              alt="Black Card"
            />
            <input
              type="text"
              placeholder={t("enter-the-codename")}
              className="codename-input"
              value={cardText}
              onChange={(e) => setCardText(e.target.value)}
              disabled={
                (!amIRedTeamLeader && !amIBlueTeamLeader) || whosTurn !== myTeam
              }
            />
          </div>
        )}
      </BackgroundContainer>
    </>
  );
};

export default Gameplay;
