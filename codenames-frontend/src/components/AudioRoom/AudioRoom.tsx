import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, { MediaConnection } from "peerjs";
import Cookies from "js-cookie";

import Button from "../Button/Button.tsx";

import { apiUrl, peerUrl, socketUrl } from "../../config/api.tsx";

import callIcon from "../../assets/icons/call.svg";
import callEndIcon from "../../assets/icons/end-call.svg";
import Mic from "../../assets/icons/mic.png";
import MicOff from "../../assets/icons/micOff.svg";

import "./AudioRoom.css";
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

// ...
const AudioRoom: React.FC<AudioRoomProps> = ({ soundFXVolume }) => {
  const audioGridRef = useRef<HTMLDivElement>(null);
  const myPeerRef = useRef<Peer | null>(null);
  const myAudioRef = useRef(new Audio());
  const peers = useRef<{ [key: string]: MediaConnection }>({});
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const stopLedAnimation = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

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

  const fetchUsername = async (): Promise<string> => {
    try {
      console.log("Fetching username from server...");
      const token = Cookies.get("authToken");

      if (!token) return "";

      const response = await fetch(`${apiUrl}/api/users/getUsername`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch username");

      const name = await response.text();
      console.log("Fetched username:", name);
      return name === "null" ? "" : name;
    } catch (err) {
      console.error("Error fetching username:", err);
      return "";
    }
  };

  useEffect(() => {
    if (!isConnected || !userStream) return;

    console.log("[VOICE] Setting up PeerJS connection");

    const randomId =
      "user-" +
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Date.now().toString(36);
    const peer = new Peer(randomId, {
      host: `${peerUrl}`,
      secure: true,
      debug: 3,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay1.expressturn.com:3478",
            username: "efWL5HTQ6ZG17APRCZ",
            credential: "unrYr5wHzYu7qDNF",
          },
        ],
      },
    });

    myPeerRef.current = peer;

    peer.on("open", (id) => {
      console.log(`[VOICE] PeerJS connected with ID: ${id}`);
      chatNamespace.emit("join-room", ROOM_ID, id);

      peer.on("call", (call) => {
        console.log(`[VOICE] Incoming call from: ${call.peer}`);
        call.answer(userStream);

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.autoplay = true;
        audio.muted = false;

        call.on("stream", (remoteStream) => {
          const audio = document.createElement("audio");
          audio.controls = true;
          audio.autoplay = true;
          audio.muted = false;
          audio.srcObject = remoteStream;

          const led = document.getElementById("mic-led");
          if (led) {
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(remoteStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);

            const updateLed = () => {
              if (stopLedAnimation.current) {
                led.style.backgroundColor = "red";
                return;
              }

              analyser.getByteFrequencyData(dataArray);
              const avg =
                dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
              const norm = Math.min(avg / 128, 1); 

              const green = Math.floor(100 + norm * 155); 
              led.style.backgroundColor = `rgb(0, ${green}, 0)`; 

              requestAnimationFrame(updateLed);
            };

            updateLed();
          }
        });

        call.on("close", () => {
          console.log(`[VOICE] Call closed from: ${call.peer}`);
          audio.remove();
        });

        call.on("error", (err) => {
          console.error(`[VOICE] Call error from ${call.peer}:`, err);
          audio.remove();
        });

        peers.current[call.peer] = call;
      });

      chatNamespace.on("user-connected", (userId) => {
        console.log(`[VOICE] User connected: ${userId}`);
        if (userId === id) return;

        const call = peer.call(userId, userStream);

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.autoplay = true;
        audio.muted = false;

        call.on("stream", (remoteStream) => {
          console.log(`[VOICE] Received stream from called user: ${userId}`);
          console.log("Remote tracks:", remoteStream.getTracks());
          if (remoteStream.getAudioTracks().length === 0) {
            console.error("No audio tracks in remote stream!");
          }
          console.log("Audio tracks:", remoteStream.getAudioTracks());

          audio.srcObject = remoteStream;
          audio.addEventListener("loadedmetadata", () => {
            audio.play().catch((e) => console.error("Audio play failed:", e));
          });
          audioGridRef.current?.appendChild(audio);
        });

        call.on("close", () => {
          console.log(`[VOICE] Call closed with: ${userId}`);
          audio.remove();
        });

        peers.current[userId] = call;
      });

      chatNamespace.on("user-disconnected", (userId) => {
        console.log(`[VOICE] User disconnected: ${userId}`);
        if (peers.current[userId]) {
          peers.current[userId].close();
          delete peers.current[userId];
        }
      });
    });
    soundFXVolume = Math.max(0, Math.min(1, soundFXVolume));

    peer.on("error", (err) => {
      console.error("[VOICE] PeerJS error:", err);
      if (err.type === "network" || err.type === "disconnected") {
        console.log("[VOICE] Network error, trying to reconnect...");
        cleanupPeerConnections();
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    });

    peer.on("disconnected", () => {
      console.log("[VOICE] PeerJS disconnected");
    });

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

  const joinRoom = async () => {
    console.log("[VOICE] Joining audio room");

    const fetchedName = await fetchUsername();
    setUsername(fetchedName);

    setIsConnected(true);
  };

  const leaveRoom = () => {
    console.log("[VOICE] Leaving audio room");
    cleanupPeerConnections();

    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
    }

    stopLedAnimation.current = true;

    setIsConnected(false);
  };

  return (
    <div className="audio-room-container">
      <div className="audio-room-header">
        <Button
          variant="circle"
          className="audio-room-join-room"
          soundFXVolume={soundFXVolume}
          onClick={joinRoom}
        >
          <img className="button-icon" src={callIcon} />
        </Button>
        <Button
          variant="circle"
          className="audio-room-leave-room"
          soundFXVolume={soundFXVolume}
          onClick={leaveRoom}
        >
          <img className="button-icon" src={callEndIcon} />
        </Button>
      </div>
      <div>
        <p className="audio-room-username">{username}</p>
      </div>
      <div
        id="mic-led"
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "red",
          marginTop: "10px",
          transition: "background-color 0.3s ease",
        }}
      ></div>
      <div ref={audioGridRef}></div>
    </div>
  );
};

export default AudioRoom;
