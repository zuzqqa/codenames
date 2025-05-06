import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import apiUrl from "../../../api/api.ts";

interface FriendRequestsState {
  friends: string[];
  sentRequests: string[];
  receivedRequests: string[];
}

const useFriendRequestsWebSocket = (username: string) => {
  const [state, setState] = useState<FriendRequestsState>({
    friends: [],
    sentRequests: [],
    receivedRequests: [],
  });
  const stompClientRef = useRef<Client | null>(null);

  const fetchRequests = async () => {
    if (!username) return;
  
    try {
      const response = await fetch(apiUrl + `/api/users/${username}/friendRequests`);
      const responseText = await response.text();  // Przechwycimy odpowiedź jako tekst
  
      if (!response.ok) {
        console.error("Server Error: ", response.status, responseText);
        throw new Error(`Error: ${response.status} - ${responseText}`);
      }
  
      console.log("Response Text:", responseText);  // Logowanie surowej odpowiedzi
  
      // Spróbuj sparsować odpowiedź jako JSON
      const data = JSON.parse(responseText);  // Parsowanie ręcznie, żeby sprawdzić, czy odpowiedź to JSON
      setState({
        friends: data.friends || [],
        sentRequests: data.sentRequests || [],
        receivedRequests: data.receivedRequests || [],
      });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };
  

  useEffect(() => {
    fetchRequests(); // Początkowe pobranie danych

    const socket = new SockJS(apiUrl + "/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/${username}/friendRequests`, (message) => {
          const updatedState = JSON.parse(message.body);
          setState({
            friends: updatedState.friends || [],
            sentRequests: updatedState.sentRequests || [],
            receivedRequests: updatedState.receivedRequests || [],
          });
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [username]);

  const sendFriendRequest = async (receiverUsername: string) => {
    await fetch(apiUrl + `/api/users/sendRequest/${receiverUsername}?senderUsername=${username}`, {
      method: "POST",
    });
    fetchRequests(); // Aktualizacja stanu
  };

  const acceptFriendRequest = async (senderUsername: string) => {
    await fetch(apiUrl + `/api/users/acceptRequest/${senderUsername}?receiverUsername=${username}`, {
      method: "POST",
    });
    fetchRequests(); // Aktualizacja stanu
  };

  const declineFriendRequest = async (senderUsername: string) => {
    await fetch(apiUrl + `/api/users/declineRequest/${senderUsername}?receiverUsername=${username}`, {
      method: "POST",
    });
    fetchRequests(); // Aktualizacja stanu
  };

  const undoFriendRequest = async (senderUsername: string) => {
    await fetch(apiUrl + `/api/users/declineRequest/${username}?receiverUsername=${senderUsername}`, {
      method: "POST",
    });
    fetchRequests(); // Aktualizacja stanu
  };

  const removeFriend = async (friendUsername: string) => {
    await fetch(apiUrl + `/api/users/removeFriend/${friendUsername}?userUsername=${username}`, {
      method: "DELETE",
    });
    fetchRequests(); // Aktualizacja stanu
  };

  return {
    ...state,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    undoFriendRequest
  };
};

export default useFriendRequestsWebSocket;
