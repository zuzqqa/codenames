import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { t } from "i18next";
import "../../views/Gameplay/Gameplay.css";
import "./Chat.css";
import { useCookies } from "react-cookie";
import { apiUrl, socketUrl } from "../../config/api.tsx";

/**
 * Defines the message type structure.
 */
interface Message {
  text: string; // Message content
  type: "incoming" | "outgoing"; // Message direction
  sender: string; // Sender's name
  gameID: string; // Associated game ID
}

/**
 * Chat component for handling real-time messaging within a game session.
 * Connects to a WebSocket server, manages messages, and handles UI interactions.
 */
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Stores chat messages
  const [messageText, setMessageText] = useState(""); // Stores user input text
  const messagesEndRef = useRef<HTMLDivElement>(null); // Reference for automatic scrolling
  const socketRef = useRef<Socket | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null); // Stores the player's name
  const [cookies] = useCookies(["authToken"]); // Handles authentication token
  const [gameId, setGameId] = useState(""); // Stores the game ID

  /**
   * Fetches the player's username based on the authentication token.
   */
  useEffect(() => {
    const fetchPlayerName = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/users/username/` + cookies.authToken
        );
        if (!response.ok) {
          throw new Error("Failed to fetch player name");
        }
        const data = await response.json();
        setPlayerName(data.username);
      } catch (error) {
        console.error("Error fetching player name:", error);
      }
    };

    fetchPlayerName();
  }, [cookies.authToken]);

  /**
   * Initializes the game ID from local storage when the component mounts.
   */
  useEffect(() => {
    setGameId(localStorage.getItem("gameId") || "");
  }, []);

  /**
   * Establishes a WebSocket connection to the chat server when the player name and game ID are available.
   */
  useEffect(() => {
    if (!playerName || !gameId) return;

    const chatSocket = io(`${socketUrl}/chat`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = chatSocket;

    chatSocket.on("connect", () => {
      console.log("Connected to /chat:", chatSocket.id);
      chatSocket.emit("joinGame", gameId);
    });

    chatSocket.on(
      "chatMessage",
      (msg: { sender: string; content: string; gameID: string }) => {
        setMessages((prev) => [
          ...prev,
          {
            text: msg.content,
            type: msg.sender === playerName ? "outgoing" : "incoming",
            sender: msg.sender,
            gameID: msg.gameID,
          },
        ]);
      }
    );

    return () => {
      chatSocket.disconnect();
    };
  }, [playerName, gameId]);

  /**
   * Loads saved messages from local storage when the component mounts or the game ID changes.
   */
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      const gameMessages = JSON.parse(savedMessages).filter((msg: Message) => msg.gameID === gameId);
      setMessages(gameMessages);
    }
  }, [gameId]);

  /**
   * Saves messages to local storage whenever the messages state changes.
   */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  /**
   * Sends a chat message when the user presses Enter.
   * Validates the message and emits it to the server.
   */
  const sendMessage = () => {
    if (!socketRef.current || !messageText.trim()) return;

    const message = {
      sender: playerName,
      content: messageText.trim(),
      gameID: gameId,
    };

    socketRef.current.emit("chatMessage", message);

    setMessageText("");
  };

  /**
   * Automatically scrolls to the bottom of the chat messages when new messages are added.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [isInputFocused, setIsInputFocused] = useState(false);

  /**
   * Handles input focus and blur events to adjust the chat UI.
   */
  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  /**
   * Handles input blur event to reset the focused state.
   */
  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <div className={`chat-container ${isInputFocused ? "focused" : ""}`}>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="div-sender">{msg.sender}</div>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        placeholder={t("enter-the-message")}
        className="message-input"
        value={messageText}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
    </div>
  );
};

export default Chat;
