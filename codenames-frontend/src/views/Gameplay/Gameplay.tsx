import React, {useState, useEffect, useRef} from "react";
import { useTranslation } from "react-i18next";

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";

import bannerBlue from "../../assets/images/banner-blue.png";
import bannerBlueLeader from "../../assets/images/banner-blue-leader.png";
import bannerRed from "../../assets/images/banner-red.png";
import bannerRedLeader from "../../assets/images/banner-red-leader.png";
import settingsIcon from "../../assets/icons/settings.png";
import shelfImg from "../../assets/images/shelf.png";
import cardsStackImg from "../../assets/images/cards-stack.png";
import cardWhiteImg from "../../assets/images/card-white.png";
import cardBlackImg from "../../assets/images/card-black.png";
import cardRedImg from "../../assets/images/card-red.jpg";
import cardBlueImg from "../../assets/images/card-blue.jpg";
import polygon1Img from "../../assets/images/Polygon1.png";
import polygon2Img from "../../assets/images/Polygon2.png";
import cardSound from "../../assets/sounds/card-filp.mp3";
import votingLabel from "../../assets/images/medieval-label.png";

import "./Gameplay.css";
import Chat from "../../components/Chat/Chat.tsx";
import { Client } from "@stomp/stompjs";
import {useLocation, useNavigate} from "react-router-dom";
import { useWebSocket } from "./useWebSocket";
import AudioRoom from "../../components/AudioRoom/AudioRoom.tsx";

/**
 * Represents properties for controlling gameplay-related settings, such as volume levels.
 */
interface GameplayProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * Represents a user in the game session.
 */
interface User {
  id: string;
  username: string;
}

/**
 * Enumeration of possible game session statuses.
 */
enum SessionStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

/**
 * Represents a game session with its properties and state.
 */
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

/**
 * Represents a game state with its properties.
 */
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
  cardsVotes: number[];
}

const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
/**
 * React functional component responsible for handling gameplay-related settings,
 * such as volume adjustments.
 *
 * @param {Object} props - The component props.
 * @param {function(number): void} props.setVolume - Function to update the overall game volume.
 * @param {number} props.soundFXVolume - The current volume level for sound effects.
 * @param {function(number): void} props.setSoundFXVolume - Function to update the sound effects volume.
 *  * @returns {JSX.Element} The rendered GameLobby component
 */
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
  const [cardNumber, setCardNumber] = useState(1);
  const storedGameId = localStorage.getItem("gameId");
  const gameSessionData = useWebSocket(storedGameId);
  const [gameSession, setGameSession] = useState<GameSession>();

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
  const [whosTurn, setWhosTurn] = useState<string>("blue");
  const [isGuessingTime, setIsGuessingTime] = useState<boolean>();
  const [isHintTime, setIsHintTime] = useState<boolean>();
  const [winningTeam, setWinningTeam] = useState<string>("blue");
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardsToReveal, setCardsToReveal] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [hasEndRoundBeenCalled, setHasEndRoundBeenCalled] = useState(false);
  const clickAudio = new Audio(cardSound);
  const [votedCards, setVotedCards] = useState<number[]>([]);
  const [isVoteSubmitted, setIsVoteSubmitted] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  /**
   * This function returns the appropriate banner based on whether the user is a team leader
   * and the team the user belongs to (blue or red).
   */
  const getBanner = () => {
    if (amIBlueTeamLeader) {
      return bannerBlueLeader;
    } else if (amIRedTeamLeader) {
      return bannerRedLeader;
    } else {
      return myTeam === "blue" ? bannerBlue : bannerRed;
    }
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

  useEffect(() => {
    if (!storedGameId) {
      navigate("/games");
      return;
    }

    const fetchGameSession = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/game-session/${storedGameId}`
        );
        if (!response.ok) throw new Error("Failed to fetch game session");
        const data = await response.json();

        const getIdResponse = await fetch(
          "http://localhost:8080/api/users/getId",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!getIdResponse.ok) throw new Error("Failed to fetch user ID");

        const userId = await getIdResponse.text();

        setAmIBlueTeamLeader(data.gameState.blueTeamLeader.id === userId);
        setAmIRedTeamLeader(data.gameState.redTeamLeader.id === userId);
        setGameSession(data);
        setRedTeamPlayers(data.connectedUsers[0] || []);
        setBlueTeamPlayers(data.connectedUsers[1] || []);
        setWhosTurn(data.gameState?.teamTurn === 0 ? "red" : "blue");
        setIsHintTime(data.gameState?.hintTurn);
        setIsGuessingTime(data.gameState?.guessingTurn);
        setCardsToReveal(data.gameState?.cardsChoosen || []);
        setMyTeam(
          data.connectedUsers[0].find((user: User) => user.id === userId)
            ? "red"
            : "blue"
        );
        setVotedCards(data.gameState?.cardsVotes || []);
      } catch (err) {
        console.error("Failed to load game session", err);
      }
    };

    setIsVoteSubmitted(
      JSON.parse(localStorage.getItem("vote submitted") ?? "false")
    );

    fetchGameSession();
  }, []);

  useEffect(() => {
    if (!storedGameId) {
      navigate("/games");
      return;
    }

    const fetchGameSession = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/game-session/${storedGameId}`
        );
        if (!response.ok) throw new Error("Failed to fetch game session");
        const data = await response.json();

        const getIdResponse = await fetch(
          "http://localhost:8080/api/users/getId",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!getIdResponse.ok) throw new Error("Failed to fetch user ID");

        const userId = await getIdResponse.text();

        setAmIBlueTeamLeader(data.gameState.blueTeamLeader.id === userId);
        setAmIRedTeamLeader(data.gameState.redTeamLeader.id === userId);
        setGameSession(data);
        setRedTeamPlayers(data.connectedUsers[0] || []);
        setBlueTeamPlayers(data.connectedUsers[1] || []);
        setWhosTurn(data.gameState?.teamTurn === 0 ? "red" : "blue");
        setIsHintTime(data.gameState?.hintTurn);
        setIsGuessingTime(data.gameState?.guessingTurn);
        setCardsToReveal(data.gameState?.cardsChoosen || []);
        setMyTeam(
          data.connectedUsers[0].find((user: User) => user.id === userId)
            ? "red"
            : "blue"
        );
        setVotedCards(data.gameState?.cardsVotes || []);
      } catch (err) {
        console.error("Failed to load game session", err);
      }
    };

    fetchGameSession();
  }, [storedGameId, navigate]);

  useEffect(() => {
    if (
      whosTurn !== (gameSession?.gameState?.teamTurn === 0 ? "red" : "blue")
    ) {
      setWhosTurn(gameSession?.gameState?.teamTurn === 0 ? "red" : "blue");
      setIsVoteSubmitted(false);
      localStorage.setItem("vote submitted", JSON.stringify(isVoteSubmitted));
      setSelectedCards([]);
    }
  }, [gameSession?.gameState?.teamTurn]);

  useEffect(() => {
    setGameSession(gameSessionData);
    setIsGuessingTime(gameSession?.gameState?.guessingTurn);
    setIsHintTime(gameSession?.gameState?.hintTurn);
    setCardsToReveal(gameSession?.gameState?.cardsChoosen || []);
    setRedTeamScore(gameSession?.gameState?.redTeamScore || 0);
    setBlueTeamScore(gameSession?.gameState?.blueTeamScore || 0);
    setVotedCards(gameSession?.gameState?.cardsVotes || []);
  }, [gameSessionData]);

  useEffect(() => {
    setGameSession(gameSession);
    setIsGuessingTime(gameSession?.gameState?.guessingTurn);
    setIsHintTime(gameSession?.gameState?.hintTurn);
    setCardsToReveal(gameSession?.gameState?.cardsChoosen || []);
    setVotedCards(gameSession?.gameState?.cardsVotes || []);
    revealCardsVotedByTeam();
  }, [gameSession, whosTurn, isHintTime, isGuessingTime]);

  // Checking the end of game condition
  useEffect(() => {
    if (redTeamScore >= 5 || blueTeamScore >= 6) {
      setWinningTeam(redTeamScore >= blueTeamScore ? "red" : "blue");
      navigate("/win-loss", {
        state: { result: winningTeam === myTeam ? "Victory" : "Loss" },
      });
    }
  }, [redTeamScore, blueTeamScore]);

  const revealCardsVotedByTeam = () => {
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

  /**
   * useEffect hook for handling exiting and confirming inputting the hint.
   * - Listens for the "Enter" key to confirm the hint.
   * - Listens for the "Escape" key to exit the hint input.
   */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && cardText.trim()) {
        if (validateCardText(cardText)) {
          sendHint();
          setIsCardVisible(false);
          setCardText("");
          setCardNumber(1);
        }
      }
      if (event.key === "Escape") {
        setIsCardVisible(false);
        setCardText("");
        setCardNumber(1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cardText, cardNumber]);

  const change_turn = () => {
    const storedGameId = localStorage.getItem("gameId");

    fetch(
      `http://localhost:8080/api/game-session/${storedGameId}/change-turn`,
      {
        method: "GET",
        headers: {
          credentials: "include",
        },
      }
    );
  };

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
      body: JSON.stringify({ hint: cardText + " " + cardNumber }),
    });

    setCardText("");
  };

  const submitVotes = () => {
    const storedGameId = localStorage.getItem("gameId");

    fetch(`http://localhost:8080/api/game-session/${storedGameId}/voteCards`, {
      method: "POST",
      body: JSON.stringify({ selectedCards }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((text) => {
        if (text === "Votes submitted successfully") {
        } else {
          console.error("Unexpected server response:", text);
        }
      })
      .catch((error) => {
        console.error("Error submitting votes:", error);
      });

    setIsVoteSubmitted(true);
    localStorage.setItem("vote submitted", JSON.stringify(isVoteSubmitted));
  };

  /**
   * useEffect hook for handling the automatic removal of error messages after a delay.
   *
   * - Adds a fade-out effect to the toast notification before removal.
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
   * Validates the hint text to ensure it is a single word.
   * @param text - The hint text to validate.
   */
  const validateCardText = (text: string) => {
    const newErrors: { id: string; message: string }[] = [];
    if (text.split(" ").length == 1) {
        return true;
    }
    newErrors.push({
      id: generateId(),
      message: t("hint-one-word"),
    });

    setErrors(newErrors);
    if (newErrors.length > 0) return;
  }

  /**
   * Voice chat
   */

  // useEffect(() => {
  //   return () => {
  //     if (peerConnection) {
  //       peerConnection.close();
  //       setPeerConnection(null);
  //       setIsConnected(false);
  //     }
  //   };
  // }, [peerConnection]);

  // const joinVoiceChat = async () => {
  //   if (isConnected) {
  //     console.log("Already in a voice chat");
  //     return;
  //   }
  //
  //   try {
  //     const pc = new RTCPeerConnection({
  //       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  //     });
  //
  //     setPeerConnection(pc);
  //
  //     // Ensure WebSocket is properly opened before sending messages
  //     const socket = new WebSocket("ws://192.168.68.52:3000");    //change to wss when SSL is added
  //     socketRef.current = socket;
  //
  //     socket.onopen = () => {
  //       console.log("Connected to SFU server");
  //       setIsConnected(true);
  //     };
  //
  //     socket.onerror = (error) => {
  //       console.error("WebSocket error:", error);
  //     };
  //
  //     socket.onclose = () => {
  //       console.warn("WebSocket connection closed. Attempting to reconnect...");
  //       setIsConnected(false);
  //     };
  //
  //     // Request microphone access
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //
  //     if (pc.signalingState !== "closed") {
  //       stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  //     } else {
  //       console.error("RTCPeerConnection is closed. Cannot add tracks.");
  //       return;
  //     }
  //
  //     socket.onmessage = async (message) => {
  //       try {
  //         const data = JSON.parse(message.data);
  //
  //         if (data.sdp) {
  //           await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
  //           const answer = await pc.createAnswer();
  //           await pc.setLocalDescription(answer);
  //
  //           // Wait until WebSocket is open before sending
  //           if (socket.readyState === WebSocket.OPEN) {
  //             socket.send(JSON.stringify({ sdp: answer }));
  //           } else {
  //             console.warn("WebSocket not open. Answer not sent.");
  //           }
  //         }
  //
  //         if (data.candidate) {
  //           await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  //         }
  //       } catch (err) {
  //         console.error("Error handling WebSocket message:", err);
  //       }
  //     };
  //
  //     pc.onicecandidate = (event) => {
  //       if (event.candidate) {
  //         if (socket.readyState === WebSocket.OPEN) {
  //           socket.send(JSON.stringify({ candidate: event.candidate }));
  //           console.log("ICE candidate sent.");
  //         } else {
  //           console.warn("WebSocket not open. ICE candidate not sent.");
  //         }
  //       }
  //     };
  //
  //     pc.oniceconnectionstatechange = () => {
  //       console.log("ICE Connection State:", pc.iceConnectionState);
  //       if (pc.iceConnectionState === "failed") {
  //         console.error("ICE connection failed. Restarting connection...");
  //         pc.restartIce();
  //       }
  //     };
  //
  //     // Wait until WebSocket is open before creating an offer
  //     socket.onopen = async () => {
  //       console.log("Connected to SFU server");
  //
  //       const offer = await pc.createOffer();
  //       await pc.setLocalDescription(offer);
  //
  //       if (socket.readyState === WebSocket.OPEN) {
  //         socket.send(JSON.stringify({ sdp: offer }));
  //         console.log("Offer sent to SFU server.");
  //       } else {
  //         console.warn("WebSocket not open. Offer not sent.");
  //       }
  //     };
  //
  //   } catch (error) {
  //     console.error("Error joining voice chat:", error);
  //   }
  // };
  //
  //
  // /**
  //  * Disconnect from voice chat
  //  */
  //
  // const disconnectFromVoiceChat = () => {
  //   if (!isConnected) {
  //     console.log("Not connected to a voice chat.");
  //     return;
  //   }
  //
  //   try {
  //     // Access WebSocket from the ref
  //     const socket = socketRef.current;
  //
  //     // Close WebSocket if open
  //     if (socket && socket.readyState === WebSocket.OPEN) {
  //       socket.close();
  //       console.log("WebSocket connection closed.");
  //     }
  //
  //     // Stop all media tracks by iterating over the senders
  //     if (peerConnection) {
  //       const senders = peerConnection.getSenders();
  //       senders.forEach((sender) => {
  //         if (sender.track) {
  //           sender.track.stop(); // Stop the media track
  //           console.log(`Stopped track: ${sender.track.kind}`);
  //         }
  //       });
  //
  //       // Close the peer connection
  //       peerConnection.close();
  //       console.log("RTCPeerConnection closed.");
  //     }
  //
  //     // Reset the connection state
  //     setIsConnected(false);
  //     setPeerConnection(null);
  //     socketRef.current = null; // Reset the socket ref
  //     console.log("Disconnected from voice chat.");
  //   } catch (error) {
  //     console.error("Error disconnecting from voice chat:", error);
  //   }
  // };



  return (
    <>
      <BackgroundContainer>
        <span className={`below timer ${myTeam === "blue" ? "blue" : "red"}`}>
          {(() => {
            if (
              (amIBlueTeamLeader || amIRedTeamLeader) &&
              isHintTime &&
              whosTurn === myTeam
            ) {
              return t("give-hint");
            } else if (
              (amIBlueTeamLeader || amIRedTeamLeader) &&
              isGuessingTime &&
              whosTurn === myTeam
            ) {
              return t("team-guessing");
            } else if (
              !amIBlueTeamLeader &&
              !amIRedTeamLeader &&
              isHintTime &&
              whosTurn === myTeam
            ) {
              return t("leader-choosing-hint");
            } else if (isHintTime && whosTurn !== myTeam) {
              return t("opposing-team-hint");
            } else if (
              !amIBlueTeamLeader &&
              !amIRedTeamLeader &&
              isGuessingTime &&
              whosTurn === myTeam
            ) {
              return t("guessing");
            } else if (isGuessingTime && whosTurn !== myTeam) {
              return t("opposing-team-guessing");
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
        <div className="timer points-red">{redTeamScore} / 6</div>
        <div className="timer points-blue">{blueTeamScore} / 5</div>
        {/*<div className="banner-container"><img src={getBanner()} /></div>*/}
        <div className="banner-container">
          <img src={getBanner()} />
        </div>
        <Chat />
        <div className="content-container">
          <div className="timer-container">
            {/* <div className="horizontal-gold-bar"></div>
            <span className="timer">
            </span> */}
          </div>
          <div className="cards-section">
            {cards.map((cardImage, index) => (
              <div
                key={index}
                className={`card-container ${
                  selectedCards.includes(index) ? "selected-card" : ""
                } ${
                  amIRedTeamLeader || amIBlueTeamLeader || whosTurn != myTeam
                    ? "disabled"
                    : ""
                }`}
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
                {votedCards[index] > 0 && (
                  <div className="corner-icon-container">
                    <img
                      className="corner-icon"
                      src={votingLabel}
                      alt="corner icon"
                    />
                    <span className="corner-text">
                      {votedCards[index]}/
                      {whosTurn === "red"
                        ? redTeamPlayers.length - 1
                        : blueTeamPlayers.length - 1}
                    </span>
                  </div>
                )}

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
                  onClick={change_turn}
              >
                <span className="button-text">{t("end-round")}</span>
              </Button>
              <AudioRoom />
              {!isVoteSubmitted && (
                  <Button
                      variant="room"
                      soundFXVolume={soundFXVolume}
                      className={
                        amIBlueTeamLeader ||
                        amIRedTeamLeader ||
                        (isHintTime && whosTurn === myTeam) ||
                        whosTurn !== myTeam
                            ? "hidden"
                            : ""
                      }
                      onClick={submitVotes}
                  >
                    <span className="button-text">{t("lock-in")}</span>
                  </Button>
              )}
              <div className="horizontal-gold-bar"/>
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
              <div className="codename-input-container">
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
                <input
                    type="range"
                    min={1}
                    max={whosTurn === "blue" ? 5 : 6}
                    className="codename-slider"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(+e.target.value)}
                    disabled={
                        (!amIRedTeamLeader && !amIBlueTeamLeader) || whosTurn !== myTeam
                    }
                />
                <span className="slider-value">{cardNumber}</span>
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
      </BackgroundContainer>
    </>
  );
};

export default Gameplay;
