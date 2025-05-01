import React, { useState, useEffect } from "react"; // Hook for managing component state

import BackgroundContainer from "../../containers/Background/Background";

import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import GameList from "../../components/GameList/GameList";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal";
import ProfileModal from "../../components/UserProfileOverlay/ProfileModal";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getCookie, logout } from "../../shared/utils.tsx";
import logoutButton from "../../assets/icons/logout.svg";
import { apiUrl } from "../../config/api.tsx";

/**
 * Props type definition for the JoinGame component.
 */
interface JoinGameProps {
  setVolume: (volume: number) => void; // Function to set global volume
  soundFXVolume: number; // Current sound effects volume level
  setSoundFXVolume: (volume: number) => void; // Function to set sound effects volume
}

/**
 * Represents a user in a game session.
 */
interface User {
  userId: string;
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
 * Represents a game session.
 */
interface GameSession {
  status: SessionStatus;
  sessionId: string;
  gameName: string;
  maxPlayers: number;
  password: string;
  durationOfTheRound: string;
  timeForGuessing: string;
  timeForAHint: string;
  numberOfRounds: number;
  connectedUsers: User[][];
}

/**
 * JoinGame component that allows users to browse and join active game sessions.
 *
 * @param {JoinGameProps} props - Component props.
 * @returns {JSX.Element} The rendered JoinGame component.
 */
const JoinGame: React.FC<JoinGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Tracks if the profile modal is open
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameSession[]>([]);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  /**
   * Fetches the list of available game sessions on component mount.
   * Also establishes a WebSocket connection for real-time updates.
   */
// Zmodyfikuj ten kod w swoim komponencie frontendowym

useEffect(() => {
  // Najpierw pobierz dane przez standardowe REST API
  getGames();
  
  // Funkcja próbująca różnych metod połączenia
  const connectWithFallbacks = async () => {
    console.log("Próba połączenia z wykorzystaniem różnych metod...");
  
    
    // 2. Próba z pełnym URL i explicit protokołem (obejście niektórych problemów z proxy)
    try {
      const sockOptions = {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        debug: true
      };
      
      // Spróbuj z różnymi wersjami ścieżki
      const socketEndpoints = [
        'https://codenames-backend-co4i.onrender.com/ws',
        'https://codenames-backend-co4i.onrender.com/ws/',
        'wss://codenames-backend-co4i.onrender.com/ws'
      ];
      
      // Iteruj przez różne warianty endpointów
      for (const endpoint of socketEndpoints) {
        console.log(`Próba połączenia z: ${endpoint}`);
        
        try {
          const socket = new SockJS(endpoint, null, sockOptions);
          
          socket.onopen = () => {
            console.log(`Udane połączenie SockJS z: ${endpoint}`);
            initializeStomp(socket, endpoint);
          };
          
          socket.onerror = (error) => {
            console.error(`Błąd SockJS z ${endpoint}:`, error);
          };
          
          socket.onclose = (event) => {
            console.log(`SockJS zamknięty (${endpoint}):`, event);
          };
          
          // Daj trochę czasu na połączenie przed próbą następnego endpointu
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Jeśli socket nie jest otwarty po 3 sekundach, spróbuj następnego
          if (socket.readyState !== 1) {
            console.log(`Timeout dla ${endpoint}, próba następnego...`);
            socket.close();
          } else {
            // Połączenie udane, przerwij pętlę
            break;
          }
        } catch (sockError) {
          console.error(`Błąd tworzenia SockJS dla ${endpoint}:`, sockError);
        }
      }
    } catch (error) {
      console.error("Błąd podczas prób połączenia SockJS:", error);
    }
    
    // 3. Fallback do pollingu, jeśli wszystkie próby WebSocket zawiodły
    console.log("Przejście do fallbacku polling...");
    setupPolling();
  };
  
  // Zainicjuj połączenie STOMP
  function initializeStomp(socket: WebSocket, endpoint: string) {
    console.log(`Inicjalizacja STOMP dla ${endpoint}...`);
    
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("STOMP Debug:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame) => {
        console.log("STOMP połączony!", frame);
        
        // Subskrybuj z handlerem błędów
        try {
          stompClient.subscribe("/game/all", (message) => {
            console.log("Otrzymano wiadomość:", message);
            try {
              const data = JSON.parse(message.body);
              console.log("Przetworzono dane:", data);
              if (Array.isArray(data)) {
                const filteredGames = data.filter(game => game.status === "CREATED");
                setGameSessions(filteredGames);
                setFilteredGames(filteredGames);
              }
            } catch (error) {
              console.error("Błąd parsowania wiadomości:", error);
            }
          });
          
          // Wyślij wiadomość testową
          stompClient.publish({
            destination: "/chat/requestGames",
            body: JSON.stringify({ action: "getGames" })
          });
        } catch (subscribeError) {
          console.error("Błąd podczas subskrypcji:", subscribeError);
        }
      },
      
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
        setupPolling(); // Fallback do pollingu w przypadku błędu
      }
    });
    
    stompClient.activate();
    return stompClient;
  }
  
  // Fallback do regularnego pollingu
  function setupPolling() {
    console.log("Uruchamianie fallbacku polling...");
    // Ustaw interwał do pobierania danych
    const intervalId = setInterval(() => {
      console.log("Pobieranie danych przez polling...");
      getGames();
    }, 5000); // Co 5 sekund
    
    // Cleanup
    return () => clearInterval(intervalId);
  }
  
  // Rozpocznij próby połączenia
  connectWithFallbacks();
  
}, []);
  

  useEffect(() => {
    const fetchGuestStatus = async () => {
      const token = getCookie("authToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/users/isGuest`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const guestStatus = await response.json();
          setIsGuest(guestStatus);
        } else {
          console.error("Failed to retrieve guest status.");
        }
      } catch (error) {
        console.error("Error retrieving guest status: ", error);
      }
    };

    fetchGuestStatus();
  }, []);

  /**
   * Fetches all available game sessions from the backend.
   * Only sessions in the "CREATED" state are stored.
   */
  const getGames = () => {
    fetch(`${apiUrl}/api/game-session/all`)
      .then((response) => response.json())
      .then((data) => {
        const createdGames = data.filter(
          (game: GameSession) => game.status === "CREATED"
        );
        setGameSessions(createdGames);
        setFilteredGames(createdGames);
      })
      .catch((error) => {
        console.error("Error fetching game sessions:", error);
      });
  };

  /**
   * Toggles the visibility of the settings modal.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
        </Button>

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
        {/* Profile button */}
        {isGuest === false && (
          <Button variant="circle-profile" soundFXVolume={soundFXVolume}>
            <img src={profileIcon} onClick={toggleProfile} alt="Profile" />
          </Button>
        )}

        {/* Profie modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={toggleProfile}
          soundFXVolume={soundFXVolume}
        />
        {document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("loggedIn=")) && (
          <Button variant="logout" soundFXVolume={soundFXVolume}>
            <img src={logoutButton} onClick={logout} alt="Logout" />
          </Button>
        )}

        <>
          <GameTitleBar></GameTitleBar>
          <GameList
            soundFXVolume={soundFXVolume}
            gameSessions={gameSessions}
            filteredSessions={filteredGames}
            setFilteredSessions={setFilteredGames}
          />
        </>
      </BackgroundContainer>
    </>
  );
};

export default JoinGame;

