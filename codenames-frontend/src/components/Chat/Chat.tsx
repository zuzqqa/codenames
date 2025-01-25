import React, { useState, useEffect, useRef } from 'react';
import connect from '../../services/webSocketService.tsx';
import { Client } from '@stomp/stompjs';
import { t } from 'i18next';
import '../../views/Gameplay/Gameplay.css';
import './Chat.css';
import { useCookies } from "react-cookie";

// Define the message type
interface Message {
    text: string;
    type: 'incoming' | 'outgoing';
    sender: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<Client | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [cookies] = useCookies(['authToken']);

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

    // Load messages from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages)); // Parse and set messages if they exist
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    // Connect to WebSocket
    useEffect(() => {
        const client = connect((msg) => {
            setMessages((prev) => [
                ...prev,
                {
                    text: msg.content,
                    type: msg.sender === playerName ? 'outgoing' : 'incoming',
                    sender: msg.sender
                }
            ]);
        });

        clientRef.current = client;

        return () => {
            client.deactivate(); // Cleanup connection
        };
    }, [playerName]);

    // Send message to WebSocket
    const sendMessage = () => {
        const client = clientRef.current;
        if (!client || !messageText.trim()) return;
        const message = { sender: playerName, content: messageText.trim() };
        client.publish({
            destination: '/chat/send', // Matches @MessageMapping in the backend
            body: JSON.stringify(message),
        });
        setMessageText(''); // Clear input
    };

    // Scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleInputFocus = () => setIsInputFocused(true);
    const handleInputBlur = () => setIsInputFocused(false);

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