import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {apiUrl, socketUrl} from "../../config/api";

interface FriendRequestsState {
  friends: string[];
  sentRequests: string[];
  receivedRequests: string[];
}

const useFriendRequestsSocketIO = (username: string) => {
  const [state, setState] = useState<FriendRequestsState>({
    friends: [],
    sentRequests: [],
    receivedRequests: [],
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!username) return;

    // Connect to /profile namespace
    const socket = io(`${socketUrl}/profile`, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[PROFILE] Connected to server as ${username}`);
      socket.emit("joinProfile", username);
    });

    // === Listen for server events ===

    socket.on("friendRequestReceived", ({ from }) => {
      console.log(`[PROFILE] Friend request received from ${from}`);
      setState((prev) => ({
        ...prev,
        receivedRequests: [...new Set([...prev.receivedRequests, from])],
      }));
    });

    socket.on("friendRequestAccepted", ({ by }) => {
      console.log(`[PROFILE] ${by} accepted your request`);
      setState((prev) => ({
        ...prev,
        sentRequests: prev.sentRequests.filter((u) => u !== by),
        friends: [...new Set([...prev.friends, by])],
      }));
    });

    socket.on("friendRequestDeclined", ({ by }) => {
      console.log(`[PROFILE] ${by} declined your request`);
      setState((prev) => ({
        ...prev,
        sentRequests: prev.sentRequests.filter((u) => u !== by),
      }));
    });

    socket.on("friendRemoved", ({ by }) => {
      console.log(`[PROFILE] You were removed by ${by}`);
      setState((prev) => ({
        ...prev,
        friends: prev.friends.filter((f) => f !== by),
      }));
    });

    // Clean up on unmount
    return () => {
      console.log("[PROFILE] Disconnecting socket...");
      socket.disconnect();
    };
  }, [username]);

  // === Functions to send events back to server ===
  const sendFriendRequest = (receiverUsername: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("sendFriendRequest", { from: username, to: receiverUsername });
    setState((prev) => ({
      ...prev,
      sentRequests: [...new Set([...prev.sentRequests, receiverUsername])],
    }));
  };

  const acceptFriendRequest = (senderUsername: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("acceptFriendRequest", { from: senderUsername, to: username });
  };

  const declineFriendRequest = (senderUsername: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("declineFriendRequest", { from: senderUsername, to: username });
  };

  const removeFriend = (friendUsername: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("removeFriend", { user: username, friend: friendUsername });
  };

  return {
    ...state,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  };
};

export default useFriendRequestsSocketIO;
