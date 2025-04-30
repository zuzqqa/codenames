import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * Custom React hook for handling WebSocket connections using STOMP.
 * 
 * @param {string | null} gameId - The unique identifier for the game session.
 * @returns {any} - The latest message received from the WebSocket connection.
 */
export const useWebSocket = (gameId: string | null) => {
  const [messages, setMessages] = useState<any>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe(`/game/${gameId}/timer`, (message) => {
          setMessages(JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [gameId]);

  return messages;
};
