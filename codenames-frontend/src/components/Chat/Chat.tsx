import React, { useState, useEffect, useRef } from 'react';
import connect from '../../services/webSocketService.tsx';
import { Client } from '@stomp/stompjs';
import { t } from 'i18next';
import '../../views/Gameplay/Gameplay.css';
import './Chat.css';

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
    const playerName = 'Player1'; // TODO: Get player name from the backend
    // Connect to WebSocket
    useEffect(() => {
        const client = connect((msg) => {
            setMessages((prev) => [...prev, { text: msg.content, type: msg.sender === playerName ? 'outgoing' : 'incoming' , sender: msg.sender }]);
        });

        clientRef.current = client;

        return () => {
            client.deactivate(); // Cleanup connection
        };
    }, []);

    // Send message to WebSocket
    const sendMessage = () => {
        const client = clientRef.current;
        if (!client || !messageText.trim()) return;

        const message = { sender: 'Player1', content: messageText.trim() };
        client.publish({
            destination: '/chat/send', // Matches @MessageMapping in the backend
            body: JSON.stringify(message),
        });
        setMessageText(''); // Clear input
    };

    // Add a message to the state
    const addMessage = (text: string, type: 'incoming' | 'outgoing', sender: string) => {
        setMessages((prevMessages) => [...prevMessages, { text, type, sender }]);
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
                <div ref={messagesEndRef}/>
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
