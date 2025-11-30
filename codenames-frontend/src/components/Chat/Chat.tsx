import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { t } from "i18next";
import "../../views/Gameplay/Gameplay.css";
import "./Chat.css";
import { useCookies } from "react-cookie";
import { apiUrl, socketUrl } from "../../config/api.tsx";

const SCROLL_DELAY_MS = 300;

/**
 * Defines the message type structure.
 */
interface Message {
  text: string;
  type: "incoming" | "outgoing";
  sender: string;
  gameID: string;
}

/**
 * Chat component for handling real-time messaging within a game session.
 * Connects to a WebSocket server, manages messages, and handles UI interactions.
 */
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [cookies] = useCookies(["authToken"]);
  const [gameId, setGameId] = useState("");
  const [animationDisabled, setAnimationDisabled] = useState(false);

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
    setGameId(sessionStorage.getItem("gameId") || "");
  }, []);

  /**
   * Establishes a WebSocket connection to the chat server when the player name and game ID are available.
   */
  useEffect(() => {
    if (!playerName || !gameId) return;

    const chatSocket = io(`${socketUrl}/chat`, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = chatSocket;

    chatSocket.on("connect", () => {
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
      const gameMessages = JSON.parse(savedMessages).filter(
        (msg: Message) => msg.gameID === gameId
      );
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
   * Scrolls the chat messages to the bottom smoothly.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setAnimationDisabled(true);
  };

  /**
   * Handles input blur event to reset the focused state.
   * Adds a slight delay before scrolling to the bottom to ensure the input is not focused.
   */
  const handleInputBlur = () => {
    setIsInputFocused(false);
    setTimeout(() => {
      scrollToBottom();
    }, SCROLL_DELAY_MS);
  };

  return (
    <div
      className={`chat-container 
        ${isInputFocused ? "focused" : ""} 
        ${animationDisabled ? "no-gold-animation" : ""}
      `}
    >
      <div className="messages">
        {messages.map((msg, index) => {
          const urlRegex = /(https?:\/\/[^\s]+)/g;

          const formattedText = msg.text.split(urlRegex).map((part, i) => {
            if (urlRegex.test(part)) {
              return (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-link"
                >
                  {part}
                </a>
              );
            }
            return part;
          });

          return (
            <div
              key={index}
              className={`message ${msg.type} ${
                msg.sender === "admin" ? "admin" : ""
              }`}
            >
              <div className="div-sender">{msg.sender}</div>
              <div className="message-text">{formattedText}</div>
            </div>
          );
        })}
        <div
          ref={messagesEndRef}
          className={!isInputFocused ? "spacer-end" : ""}
        />
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
