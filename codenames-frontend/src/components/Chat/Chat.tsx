import React, { useState, useEffect, useRef } from 'react';
import connect from '../../services/webSocketService.tsx';
import { Client } from '@stomp/stompjs';
import { t } from 'i18next';
import '../../views/Gameplay/Gameplay.css';
import './Chat.css';
import { useCookies } from "react-cookie";

/**
 * Defines the message type structure.
 */
interface Message {
    text: string; // Message content
    type: 'incoming' | 'outgoing'; // Message direction
    sender: string; // Sender's name
    gameID: string; // Associated game ID 
}

/**
 * Chat component for handling real-time messaging within a game session.
 * Connects to a WebSocket server, manages messages, and handles UI interactions.
 */
const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]); // Stores chat messages
    const [messageText, setMessageText] = useState(''); // Stores user input text
    const messagesEndRef = useRef<HTMLDivElement>(null); // Reference for automatic scrolling
    const clientRef = useRef<Client | null>(null); // WebSocket client reference
    const [playerName, setPlayerName] = useState<string | null>(null); // Stores the player's name
    const [cookies] = useCookies(['authToken']); // Handles authentication token
    const [gameId, setGameId] = useState(''); // Stores the game ID

    /**
     * Fetches the player's username based on the authentication token.
     */
    useEffect(() => {
        const fetchPlayerName = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/users/username/` + cookies.authToken
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch player name');
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
     * Loads stored messages from localStorage when the component mounts.
     */
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            let gameMessages = JSON.parse(savedMessages).filter((msg: Message) => msg.gameID === gameId);
            setMessages(gameMessages);
        }
    }, []);

    /**
     * Saves messages to localStorage whenever they change.
     */
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    /**
     * Connects to the WebSocket server and listens for incoming messages.
     */
    useEffect(() => {
        const client = connect((msg) => {
            setMessages((prev) => [
                ...prev,
                {
                    text: msg.content,
                    type: msg.sender === playerName ? 'outgoing' : 'incoming',
                    sender: msg.sender,
                    gameID: gameId
                }
            ]);
        }, gameId);

        clientRef.current = client;

        return () => {
            client.deactivate();  // Cleanup WebSocket connection on unmount
        };
    }, [playerName]);

    /**
     * Retrieves the game ID from localStorage on mount.
     */
    useEffect(() => {
        setGameId(localStorage.getItem('gameId') || '');
    }, []);

    /**
     * Sends a message to the WebSocket server.
     */
    const sendMessage = () => {
        const client = clientRef.current;
        if (!client || !messageText.trim()) return;
        const message = { sender: playerName, content: messageText.trim() };
        client.publish({
            destination: '/chat/send/' + gameId, // Matches @MessageMapping in the backend
            body: JSON.stringify(message),
        });
        setMessageText(''); // Clears input field
    };

    /**
     * Scrolls to the bottom when messages update.
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const [isInputFocused, setIsInputFocused] = useState(false); // Tracks input focus state

    const handleInputFocus = () => {
        setIsInputFocused(true);
        const audioRoom = document.getElementsByClassName("audio-room");
        if (audioRoom.length > 0) {
            audioRoom[0].setAttribute("style", "top: 32%; transition: top 0.4s;");
        }
    }
    const handleInputBlur = () => {
        setIsInputFocused(false);
        const audioRoom = document.getElementsByClassName("audio-room");
        if (audioRoom.length > 0) {
            audioRoom[0].setAttribute("style", "top: 52%; transition: top 0.4s;");
        }
    }

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
                placeholder={t('enter-the-message')}
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