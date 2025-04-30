import React, { useState, useEffect } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
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
  currentSelectionLeader: User;
  blueTeamScore: number;
  redTeamScore: number;
  teamTurn: number;
  hint: string;
  hintNumber: string;
  cards: string[];
  cardsColors: number[];
  cardsChosen: number[];
  hintTurn: boolean;
  guessingTurn: boolean;
  selectionTurn: boolean;
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
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [cards, setCards] = useState<string[]>(
    new Array(25).fill(cardWhiteImg)
  );
  const [flipStates, setFlipStates] = useState<boolean[]>(
    new Array(25).fill(false)
  );
  const [amIRedTeamLeader, setAmIRedTeamLeader] = useState(false);
  const [amIBlueTeamLeader, setAmIBlueTeamLeader] = useState(false);
  const [amICurrentLeader, setAmICurrentLeader] = useState(false);
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
  const clickAudio = new Audio(cardSound);
  const [votedCards, setVotedCards] = useState<number[]>([]);
  const [userId, setUserId] = useState<string | null>();

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

  /**
   * Handles card selection by the player.
   * Prevents leaders from selecting cards.
   * Sends selection to the server and updates the local selection state.
   *
   * @param {number} index - The index of the card being selected.
   */
  const handleCardSelection = (index: number) => {
    if (flipStates[index]) return;

    if (amIRedTeamLeader || amIBlueTeamLeader) return;

    if (amICurrentLeader) {
      revealCard(index);
    } else {
      const isAddingVote = selectedCards.includes(index) ? false : true;

      sendCardSelection(index, isAddingVote);

      setSelectedCards((prevSelectedCards) =>
        isAddingVote
          ? [...prevSelectedCards, index]
          : prevSelectedCards.filter((c) => c !== index)
      );
    }
  };

  /**
   * Sends the player's card selection to the server.
   *
   * @param {number} cardIndex - The index of the selected card.
   * @param {boolean} isAddingVote - Whether the player is adding or removing their vote.
   */
  const sendCardSelection = async (
    cardIndex: number,
    isAddingVote: boolean
  ) => {
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/game-session/${storedGameId}/voteCards`,
        {
          method: "POST",
          body: JSON.stringify({
            addingVote: isAddingVote,
            cardIndex: cardIndex,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();

      if (text !== "Vote submitted successfully") {
        console.error("Unexpected server response:", text);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  /**
   * Sends current's leader card selection to the server.
   *
   * @param {number} cardIndex - The index of the selected card.
   */
  const revealCard = (cardIndex: number) => {
    const storedGameId = localStorage.getItem("gameId");
    if (!storedGameId) return;

    try {
      const response = fetch(
        `http://localhost:8080/api/game-session/${storedGameId}/reveal-card`,
        {
          method: "POST",
          body: String(cardIndex),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  /**
   * Effect that triggers the function to fetch user by user id.
   *  when the component is mounted.
   */
  useEffect(() => {
    fetchUserId();
  }, []);

  /**
   * Fetches the user ID from the server.
   * Saves the fetched user ID in localStorage.
   */
  const fetchUserId = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/getId", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user ID");

      const id = await response.text();
      localStorage.setItem("userId", id);
      setUserId(id);
    } catch (error) {
      console.error("Error fetching user ID", error);
    }
  };

  /**
   * Toggles the visibility of the black card.
   * Adjusts the volume and plays a click sound.
   */
  const toggleBlackCardVisibility = () => {
    clickAudio.volume = soundFXVolume / 100;
    clickAudio.play();
    setIsCardVisible(true);
  };

  /**
   * Effect that loads the game session and sets the game state when the component is mounted.
   * If there is no stored game ID, the user is redirected to the "/games" page.
   *
   * Fetches the game session data, user ID, and updates various states such as:
   * - Team leaders (blue/red)
   * - Current selection leader
   * - Game session details (score, turn, etc.)
   * - Players in each team
   * - The current player's team
   * - Cards chosen for revealing
   *
   * @returns {void} Updates the game session state and various other states based on fetched data.
   */
  useEffect(() => {
    if (!storedGameId) {
      navigate("/games");
      return;
    }

    /**
     * Fetches the game session data, then sets various states related to the game session.
     * Handles errors if fetching fails.
     *
     * @returns {void} Updates the component's states based on the fetched data.
     */
    const fetchGameSession = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/game-session/${storedGameId}`
        );
        if (!response.ok) throw new Error("Failed to fetch game session");
        const data = await response.json();
        
        setAmIBlueTeamLeader(data.gameState.blueTeamLeader.id === userId);
        setAmIRedTeamLeader(data.gameState.redTeamLeader.id === userId);
        setAmICurrentLeader(
          data.gameState.currentSelectionLeader.id === userId
        );
        setGameSession(data);
        setRedTeamPlayers(data.connectedUsers[0] || []);
        setBlueTeamPlayers(data.connectedUsers[1] || []);
        setWhosTurn(data.gameState?.teamTurn === 0 ? "red" : "blue");
        setIsHintTime(data.gameState?.hintTurn);
        setIsGuessingTime(data.gameState?.guessingTurn);
        setCardsToReveal(data.gameState?.cardsChosen || []);
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
  }, []);

  /**
   * Effect that triggers the function to reveal cards voted by the team
   * whenever the `cardsToReveal` state changes.
   */
  useEffect(() => {
    setCardsToReveal(gameSession?.gameState?.cardsChosen || []);
    revealCardsVotedByTeam();
  }, [gameSession?.gameState?.cardsChosen]);

  /**
   * Effect that loads the game session when the component is mounted or when the `storedGameId` changes.
   * If there is no stored game ID, the user is redirected to the "/games" page.
   *
   * Fetches the game session data and user ID, then updates various states such as:
   * - Team leaders (blue/red)
   * - Current leader of the game
   * - Game session details (score, turn, etc.)
   * - Players in each team
   * - The current player's team
   * - Cards chosen for revealing
   *
   * @returns {void} Updates the game session state and various other states based on fetched data.
   */
  useEffect(() => {
    if (!storedGameId) {
      navigate("/games");
      return;
    }

    /**
     * Fetches the game session data and user ID, then sets various states related to the game session.
     * Handles errors if fetching fails.
     *
     * @returns {void} Updates the component's states based on the fetched data.
     */
    const fetchGameSession = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/game-session/${storedGameId}`
        );
        if (!response.ok) throw new Error("Failed to fetch game session");
        const data = await response.json();

        setAmIBlueTeamLeader(data.gameState.blueTeamLeader.id === userId);
        setAmIRedTeamLeader(data.gameState.redTeamLeader.id === userId);
        setAmICurrentLeader(data.gameState.currentSelectionLeader.id === userId);
        setGameSession(data);
        setRedTeamPlayers(data.connectedUsers[0] || []);
        setBlueTeamPlayers(data.connectedUsers[1] || []);
        setWhosTurn(data.gameState?.teamTurn === 0 ? "red" : "blue");
        setIsHintTime(data.gameState?.hintTurn);
        setIsGuessingTime(data.gameState?.guessingTurn);
        setCardsToReveal(data.gameState?.cardsChosen || []);
        setMyTeam(
          data.connectedUsers[0].find((user: User) => user.id === userId)
            ? "red"
            : "blue"
        );
      } catch (err) {
        console.error("Failed to load game session", err);
      }
    };

    fetchGameSession();
  }, [storedGameId, navigate]);

  /**
   * Effect that checks if the turn has changed, and if so, updates the `whosTurn` state.
   * Also resets the selected cards when the turn changes.
   *
   * @returns {void} Updates the current turn and resets selected cards when necessary.
   */
  useEffect(() => {
    if (
      whosTurn !== (gameSession?.gameState?.teamTurn === 0 ? "red" : "blue")
    ) {
      setWhosTurn(gameSession?.gameState?.teamTurn === 0 ? "red" : "blue");
      setSelectedCards([]);
    }
  }, [gameSession?.gameState?.teamTurn]);

  /**
   * Effect that updates the game session, isGuessingTime, isHintTime, cardsToReveal, redTeamScore, blueTeamScore state whenever the `gameSessionData` state changes
   * and calls revealCardsVotedByTeam().
   *
   * @returns {void} Updates the `gameSession`, `isGuessingTime`, `isHintTime`, `cardsToReveal`, `redTeamScore`, `blueTeamScore` state.
   */
  useEffect(() => {
    setGameSession(gameSessionData);
    setIsGuessingTime(gameSession?.gameState?.guessingTurn);
    setIsHintTime(gameSession?.gameState?.hintTurn);
    setCardsToReveal(gameSession?.gameState?.cardsChosen || []);
    setRedTeamScore(gameSession?.gameState?.redTeamScore || 0);
    setBlueTeamScore(gameSession?.gameState?.blueTeamScore || 0);
    revealCardsVotedByTeam();
  }, [gameSessionData]);

  /**
   * Effect that updates the game session state whenever the `gameSession` state changes.
   *
   * @returns {void} Updates the `gameSession` state.
   */
  useEffect(() => {
    setGameSession(gameSession);
  }, [gameSession]);

  /**
   * Effect that sets the `isGuessingTime` state based on the `guessingTurn` value from the game session state.
   *
   * @returns {void} Updates the `isGuessingTime` state when the guessing turn changes.
   */
  useEffect(() => {
    setIsGuessingTime(gameSession?.gameState?.guessingTurn);
  }, [gameSession?.gameState?.guessingTurn]);

  /**
   * Effect that sets the `isHintTime` state based on the `hintTurn` value from the game session state.
   *
   * @returns {void} Updates the `isHintTime` state when the hint turn changes.
   */
  useEffect(() => {
    setIsHintTime(gameSession?.gameState?.hintTurn);
  }, [gameSession?.gameState?.hintTurn]);

  /**
   * Effect that triggers the `revealCardsVotedByTeam` function when the `whosTurn`, `isHintTime`, or `isGuessingTime` states change.
   *
   * @returns {void} Reveals the cards voted by the team based on the updated states.
   */
  useEffect(() => {
    revealCardsVotedByTeam();
  }, [whosTurn, isHintTime, isGuessingTime]);

  /**
   * Effect that updates the `votedCards` state whenever the `cardsVotes` from the game session state change.
   *
   * @returns {void} Updates the `votedCards` state with the latest votes from the game session.
   */
  useEffect(() => {
    if (gameSession?.gameState?.cardsVotes) {
      setVotedCards(gameSession.gameState.cardsVotes);
    }
  }, [gameSession?.gameState?.cardsVotes]);

  /**
   * Effect that updates the `redTeamScore` state whenever the `redTeamScore` value from the game session state changes.
   * If no value is available, it defaults to 0.
   *
   * @returns {void} Updates the `redTeamScore` state with the latest score.
   */
  useEffect(() => {
    setRedTeamScore(gameSession?.gameState.redTeamScore || 0);
  }, [gameSession?.gameState.redTeamScore]);

  /**
   * Effect that updates the `blueTeamScore` state whenever the `blueTeamScore` value from the game session state changes.
   * If no value is available, it defaults to 0.
   *
   * @returns {void} Updates the `blueTeamScore` state with the latest score.
   */
  useEffect(() => {
    setBlueTeamScore(gameSession?.gameState.blueTeamScore || 0);
  }, [gameSession?.gameState.blueTeamScore]);

  /**
   * Effect that updates the `amICurrentLeader` state based on the `currentSelectionLeader` from the game session state.
   * If there is no current leader, it sets the state to false.
   *
   * @returns {void} Updates the `amICurrentLeader` state based on the current selection leader's ID.
   */
  useEffect(() => {
    if (gameSession?.gameState?.currentSelectionLeader?.id) {
      setAmICurrentLeader(
        gameSession.gameState.currentSelectionLeader.id === userId
      );
    } else {
      setAmICurrentLeader(false);
    }
  }, [gameSession?.gameState?.currentSelectionLeader]);

  /**
   * Effect that logs the updated value of `amICurrentLeader` whenever it changes.
   *
   * @returns {void} Logs the updated state of `amICurrentLeader`.
   */
  useEffect(() => {
    console.log("Updated amICurrentLeader:", amICurrentLeader);
  }, [amICurrentLeader]);

  /**
   * Effect that checks the game scores after every update to the `redTeamScore` or `blueTeamScore`.
   * If the red team score reaches 9 or the blue team score reaches 8, it sets the winning team,
   * reveals the cards voted by the team, and navigates to the win/loss page after a 3-second delay.
   *
   * @returns {void} Cleanup function clears the timeout on component unmount.
   */
  useEffect(() => {
    if (redTeamScore >= 9 || blueTeamScore >= 8) {
      setWinningTeam(redTeamScore >= blueTeamScore ? "red" : "blue");
      revealCardsVotedByTeam();

      const timeoutId = setTimeout(() => {
        navigate("/win-loss", {
          state: { result: winningTeam === myTeam ? "Victory" : "Loss" },
        });
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [redTeamScore, blueTeamScore]);

  /**
   * Reveals the cards voted by the team based on the `cardsToReveal` state.
   * It updates the `flipStates` to show the flipped cards and updates the card images
   * according to their respective colors (red, blue, black, or white).
   *
   * @returns {void} Updates the state variables for flipped cards and card images.
   */
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
        const cardColor = gameSession?.gameState?.cardsColors?.[cardIndex];
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

  /**
   * Effect that triggers the function to reveal cards voted by the team
   * whenever the `cardsToReveal` state changes.
   */
  useEffect(() => {
    revealCardsVotedByTeam();
  }, [cardsToReveal]);

  /**
   * Sends a request to the backend to change the turn of the game.
   * Retrieves the game ID from local storage and sends a GET request.
   */
  const changeTurn = () => {
    if (isHintTime && gameSession?.gameState?.hintNumber == "0") {
      const newErrors: { id: string; message: string }[] = [];

      newErrors.push({
        id: generateId(),
        message: t("hint-zero"),
      });
  
      setErrors(newErrors);
      return;
    }

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

  /**
   * Sends a hint to the backend if the user is a team leader.
   * Retrieves the game ID from local storage and sends a POST request with the hint data.
   *
   * @returns {void} If the card text is empty or the user is not a team leader, the function exits early.
   */
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
      body: JSON.stringify({ hint: cardText, hintNumber: cardNumber }),
    });

    setCardText("");
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
  };

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
              !amICurrentLeader &&
              isGuessingTime &&
              whosTurn === myTeam
            ) {
              return t("voting-time");
            } else if (amICurrentLeader && isGuessingTime) {
              return t("select-cards");
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
        <div className="timer points-red">{redTeamScore} / 9</div>
        <div className="timer points-blue">{blueTeamScore} / 8</div>
        <div className="banner-container">
          <img src={getBanner()} />
        </div>
        <div className="audio-room">
          <AudioRoom soundFXVolume={soundFXVolume} />
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
                    <span className="corner-text">{votedCards[index]}</span>
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
                  (!amIBlueTeamLeader && !amIRedTeamLeader && !amICurrentLeader && isGuessingTime) ||
                  (!amIBlueTeamLeader && !amIRedTeamLeader && isHintTime) ||
                  (!amIBlueTeamLeader &&
                    !amIRedTeamLeader &&
                    isGuessingTime &&
                    whosTurn !== myTeam)
                    ? "hidden"
                    : ""
                }
                onClick={changeTurn}
              >
                <span className="button-text">{amICurrentLeader ? t("pass-round") : t("end-round")}</span>
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
                  {(gameSession?.gameState.hint || "HINT") +
                    " " +
                    (gameSession?.gameState.hintNumber === "0"
                      ? ""
                      : gameSession?.gameState.hintNumber)}
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
                  (!amIRedTeamLeader && !amIBlueTeamLeader) ||
                  whosTurn !== myTeam
                }
              />
              <input
                type="range"
                min={1}
                max={whosTurn === "blue" ? (8 - blueTeamScore) : (9 - redTeamScore)}
                className="codename-slider"
                value={cardNumber}
                onChange={(e) => setCardNumber(+e.target.value)}
                disabled={
                  (!amIRedTeamLeader && !amIBlueTeamLeader) ||
                  whosTurn !== myTeam
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
