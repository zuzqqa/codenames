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
 * Enum for user status.
 * @enum {string}
 * @property {string} INACTIVE - The user is inactive.
 * @property {string} ACTIVE - The user is active.
 */
enum UserStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
}

/**
 * Represents a user in the game session.
 * @typedef {Object} UserRoomLobbyDTO
 * @property {string} id - The unique identifier of the user.
 * @property {string} username - The username of the player.
 * @property {number} profilePic - The profile picture ID of the player.
 * @property {UserStatus} status - The status of the player (active/inactive).
 */
interface UserRoomLobbyDTO {
  id: string;
  username: string;
  profilePic: number;
  status: UserStatus;
}

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
 * @param {AudioRoomProps} props - The props for the AudioRoom component.
 * @returns {JSX.Element} The rendered AudioRoom component.
 */
const AudioRoom: React.FC<AudioRoomProps> = ({ soundFXVolume }) => {
  const audioGridRef = useRef<HTMLDivElement>(null);
  const myPeerRef = useRef<Peer | null>(null);
  const myAudioRef = useRef(new Audio());
  const peers = useRef<{ [key: string]: MediaConnection }>({});
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [connectedUsers, setConnectedUsers] = useState<UserRoomLobbyDTO[][]>();
  const [userMicStates, setUserMicStates] = useState<{
    [userId: string]: boolean;
  }>({});

  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");
    const token = Cookies.get("authToken");
    if (storedGameId) {
      fetch(`${apiUrl}/api/game-session/${storedGameId}/getConnectedUsers`)
        .then((response) => response.json())
        .then((data: UserRoomLobbyDTO[][]) => {
          setConnectedUsers(data);
        })
        .catch((err) => console.error("Failed to load game session", err));
    } else {
      console.error("No game ID found in local storage");
    }

    if (token) {
      fetch(`${apiUrl}/api/users/getUsername`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.text())
        .then((name) => {
          if (name !== "null") {
            setUsername(name);
          }
        })
        .catch((err) => console.error("Failed to fetch username", err));
    } else {
      console.warn("No auth token found");
    }
  }, []);

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

          chatNamespace.on("userMicActivity", ({ userId, isSpeaking }) => {
            setUserMicStates((prev) => {
              if (prev[userId] === isSpeaking) return prev;
              return { ...prev, [userId]: isSpeaking };
            });
          });
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

    const audioContext = new (window.AudioContext || window.AudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(userStream!);
    microphone.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkMicActivity = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const isSpeaking = sum > 1000;

      if (isSpeaking !== userMicStates[username]) {
        setUserMicStates((prevState) => ({
          ...prevState,
          [username]: isSpeaking,
        }));

        chatNamespace.emit("userMicActivity", {
          userId: username,
          isSpeaking,
          roomId: ROOM_ID,
        });
      }

      requestAnimationFrame(checkMicActivity);
    };

    checkMicActivity();

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
    setIsConnected(true);
  };

  const leaveRoom = () => {
    console.log("[VOICE] Leaving audio room");
    cleanupPeerConnections();

    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
    }

    chatNamespace.emit("userMicActivity", {
      userId: username,
      isSpeaking: false,
      roomId: ROOM_ID,
    });
    
    setUserMicStates({});
    
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
      <div className="audio-room-user-container">
        <p className="audio-room-username">{username}</p>
        <div
          id="mic-led"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: userMicStates[username] ? "green" : "red",
            marginTop: "10px",
            transition: "background-color 0.3s ease",
          }}
        ></div>
        <Button
          variant="circle"
          className="audio-room-leave-room"
          soundFXVolume={soundFXVolume}
          onClick={leaveRoom}
        >
          <img className="button-icon" src={Mic} />
        </Button>
      </div>
      <div className="audio-room-leds">
        {connectedUsers?.flat().map((user) =>
          user.username !== username ? (
            <div key={user.id} className="user-led-container">
              <p>{user.username}</p>
              <div
                id={`mic-led-${user.id}`}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: userMicStates[user.username]
                    ? "green"
                    : "red",
                  marginBottom: "10px",
                  transition: "background-color 0.3s ease",
                }}
              ></div>
            </div>
          ) : null
        )}
      </div>
      <div ref={audioGridRef}></div>
    </div>
  );
};

export default AudioRoom;
