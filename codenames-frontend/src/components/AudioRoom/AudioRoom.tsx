import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, { MediaConnection } from "peerjs";
import Button from "../Button/Button.tsx";
import Mic from "../../assets/icons/mic.png";
import MicOff from "../../assets/icons/micOff.svg";
import "./AudioRoom.css";
import { peerUrl, socketUrl } from "../../config/api.tsx";

/**
 * Retrieves a unique game ID from local storage or generates a new one if it doesn't exist.
 * @returns A unique game ID from local storage or generates a new one if it doesn't exist.
 */
const getGameIDFromLocalStorage = () => {
  const gameId = localStorage.getItem("gameId");
  if (!gameId) {
    const newGameId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("gameId", newGameId);
    return newGameId;
  }
  return gameId;
};

/**
 * Retrieves the game ID from local storage.
 * @returns The game ID from local storage.
 */
const ROOM_ID = getGameIDFromLocalStorage();

/**
 * Initializes a Socket.IO connection to the server.
 * @returns A Socket.IO connection to the server.
 */
const chatNamespace = io(`${socketUrl}/voice`, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

/**
 * AudioRoom component for handling audio communication in a room.
 * @typedef {Object} AudioRoomProps
 * @property {number} soundFXVolume - The volume level for sound effects.
 */
interface AudioRoomProps {
  soundFXVolume: number;
}

/**
 * AudioRoom component for handling audio communication in a room.
 * @param param0 - The props for the AudioRoom component.
 * @returns The AudioRoom component.
 */
const AudioRoom: React.FC<AudioRoomProps> = ({ soundFXVolume }) => {
  const audioGridRef = useRef<HTMLDivElement>(null);
  const myPeerRef = useRef<Peer | null>(null);
  const myAudioRef = useRef(new Audio());
  const peers = useRef<{ [key: string]: MediaConnection }>({});
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Cleans up peer connections and removes audio elements from the DOM.
   * @returns {void}
   */
  const cleanupPeerConnections = () => {
    console.log("[VOICE] Cleaning up peer connections");

    Object.values(peers.current).forEach((call) => {
      if (call) call.close();
    });
    peers.current = {};

    if (myPeerRef.current) {
      myPeerRef.current.destroy();
      myPeerRef.current = null;
    }
  };

  /**
   * Sets up the user media stream and handles audio input/output.
   */
  useEffect(() => {
    if (isConnected && !userStream) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          console.log("[VOICE] User media stream received");
          setUserStream(stream);
          myAudioRef.current.srcObject = stream;
          myAudioRef.current.muted = true;
        })
        .catch((err) => {
          console.error("[VOICE] Error getting user media:", err);
          setIsConnected(false);
        });
    }

    return () => {
      if (userStream && !isConnected) {
        userStream.getTracks().forEach((track) => track.stop());
        setUserStream(null);
      }
    };
  }, [isConnected, userStream]);

  /**
   * Sets up the PeerJS connection and handles incoming/outgoing calls.
   */
  useEffect(() => {
    if (!isConnected || !userStream) return;

    console.log("[VOICE] Setting up PeerJS connection");

    // Generate a random ID for the peer connection
    const randomId =
      "user-" +
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Date.now().toString(36);
    const peer = new Peer(randomId, {
      host: `${peerUrl}`,
      secure: true,
      debug: 2,
    });

    myPeerRef.current = peer;

    // Handle PeerJS events
    peer.on("open", (id) => {
      console.log(`[VOICE] PeerJS connected with ID: ${id}`);

      // Join the room and emit the join-room event to the server
      chatNamespace.emit("join-room", ROOM_ID, id);

      // Listen for incoming calls
      peer.on("call", (call) => {
        console.log(`[VOICE] Incoming call from: ${call.peer}`);
        call.answer(userStream);

        const audio = new Audio();
        // Set the audio element to play the incoming stream
        call.on("stream", (remoteStream) => {
          console.log(`[VOICE] Received stream from: ${call.peer}`);
          audio.srcObject = remoteStream;
          audio.addEventListener("loadedmetadata", () => {
            audio.play().catch((e) => console.error("Audio play failed:", e));
          });
          audioGridRef.current?.appendChild(audio);
        });

        // Handle call close and error events
        call.on("close", () => {
          console.log(`[VOICE] Call closed from: ${call.peer}`);
          audio.remove();
        });

        // Handle call error events
        call.on("error", (err) => {
          console.error(`[VOICE] Call error from ${call.peer}:`, err);
          audio.remove();
        });

        peers.current[call.peer] = call;
      });

      // Listen for user connections and disconnections
      chatNamespace.on("user-connected", (userId) => {
        console.log(`[VOICE] User connected: ${userId}`);

        if (userId === id) return;

        const call = peer.call(userId, userStream);

        const audio = new Audio();
        // Set the audio element to play the incoming stream
        call.on("stream", (remoteStream) => {
          console.log(`[VOICE] Received stream from called user: ${userId}`);
          audio.srcObject = remoteStream;
          audio.addEventListener("loadedmetadata", () => {
            audio.play().catch((e) => console.error("Audio play failed:", e));
          });
          audioGridRef.current?.appendChild(audio);
        });

        // Handle call close and error events
        call.on("close", () => {
          console.log(`[VOICE] Call closed with: ${userId}`);
          audio.remove();
        });

        peers.current[userId] = call;
      });

      // Listen for user disconnections
      chatNamespace.on("user-disconnected", (userId) => {
        console.log(`[VOICE] User disconnected: ${userId}`);

        // Close the call and remove the audio element
        if (peers.current[userId]) {
          peers.current[userId].close();
          delete peers.current[userId];
        }
      });
    });

    // Handle PeerJS errors
    peer.on("error", (err) => {
      console.error("[VOICE] PeerJS error:", err);

      // Handle specific error types
      if (err.type === "network" || err.type === "disconnected") {
        console.log("[VOICE] Network error, trying to reconnect...");
        cleanupPeerConnections();
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    });

    // Handle PeerJS disconnection and close events
    peer.on("disconnected", () => {
      console.log("[VOICE] PeerJS disconnected");
    });

    // Handle PeerJS close event
    peer.on("close", () => {
      console.log("[VOICE] PeerJS connection closed");
    });

    return () => {
      console.log("[VOICE] Cleaning up PeerJS and Socket.IO connections");

      chatNamespace.off("user-connected");
      chatNamespace.off("user-disconnected");

      if (peer.id) {
        chatNamespace.emit("leave-room", ROOM_ID, peer.id);
      }

      cleanupPeerConnections();
    };
  }, [isConnected, userStream]);

  /**
   * Joins the audio room and sets up the necessary connections.
   */
  const joinRoom = () => {
    console.log("[VOICE] Joining audio room");
    setIsConnected(true);
  };

  /**
   * Leaves the audio room and cleans up connections.
   */
  const leaveRoom = () => {
    console.log("[VOICE] Leaving audio room");
    cleanupPeerConnections();

    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
    }

    setIsConnected(false);
  };

  return (
    <div id="audio-component">
      <div ref={audioGridRef} id="audio-grid"></div>
      {!isConnected ? (
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={joinRoom}
        >
          <img src={Mic} alt="Mic" style={{ width: "25px", height: "25px" }} />
        </Button>
      ) : (
        <Button
          variant="circle"
          soundFXVolume={soundFXVolume}
          onClick={leaveRoom}
        >
          <img
            src={MicOff}
            alt="MicOff"
            style={{ width: "25px", height: "25px" }}
          />
        </Button>
      )}
    </div>
  );
};

export default AudioRoom;
