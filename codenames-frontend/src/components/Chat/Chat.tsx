import React, { useState, useEffect, useRef } from 'react';
import connect from '../../services/webSocketService.tsx';
import { Client } from '@stomp/stompjs';
import { t } from 'i18next';
import './Chat.css';

// Define the message type
interface Message {
    text: string;
    type: 'incoming' | 'outgoing';
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<Client | null>(null);

    // Connect to WebSocket
    useEffect(() => {
        const client = connect((msg) => {
            setMessages((prev) => [...prev, { text: msg.content, type: 'incoming' }]);
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

        addMessage(message.content, 'outgoing'); // Update local state
        setMessageText(''); // Clear input
    };

    // Add a message to the state
    const addMessage = (text: string, type: 'incoming' | 'outgoing') => {
        setMessages((prevMessages) => [...prevMessages, { text, type }]);
    };

    // Scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
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
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
        </div>
    );
};

export default Chat;
