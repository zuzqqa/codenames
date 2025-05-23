import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, { MediaConnection } from "peerjs";
import Cookies from "js-cookie";

import Button from "../Button/Button.tsx";

import { apiUrl, peerUrl, socketUrl } from "../../config/api.tsx";

import callIcon from "../../assets/icons/call.svg";
import callEndIcon from "../../assets/icons/end-call.svg";
import micIcon from "../../assets/icons/mic.svg";
import micOffIcon from "../../assets/icons/micOff.svg";
import volumeIcon from "../../assets/icons/volume.svg";

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
  return localStorage.getItem("gameId");
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
  const [iConnected, setiConnected] = useState(false);
  const [ownUsername, setOwnUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [connectedUsers, setConnectedUsers] = useState<UserRoomLobbyDTO[][]>();
  const [userMicStates, setUserMicStates] = useState<{
    [username: string]: boolean;
  }>({});
  const micActivityFrameRef = useRef<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [userVolumes, setUserVolumes] = useState({});

  /**
   * Effect to fetch connected users and username when the component mounts.
   * It retrieves the game ID from local storage and fetches the connected users
   * from the server. It also fetches the username of the current user.
   * @returns {void}
   */
  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");
    const token = Cookies.get("authToken");
    if (storedGameId) {
      fetch(`${apiUrl}/api/game-session/${storedGameId}/get-connected-users`)
        .then((response) => response.json())
        .then((data: UserRoomLobbyDTO[][]) => {
          setConnectedUsers(data);
        })
        .catch((err) => console.error("Failed to load game session", err));
    } else {
      console.error("No game ID found in local storage");
    }

    if (token) {
      fetch(`${apiUrl}/api/users/get-username`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.text())
        .then((name) => {
          if (name !== "null") {
            setOwnUsername(name);
          }
        })
        .catch((err) => console.error("Failed to fetch username", err));
    } else {
      console.warn("No auth token found");
    }
  }, []);

  /**
   * Effect to clean up the audio stream and peer connections when the component unmounts.
   * It stops all tracks of the user stream and closes all peer connections.
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
   * Resets all microphone states to false (red).
   * It sets the microphone state of all connected users to false (red).
   * @returns {void}
   */
  const resetAllMicStates = () => {
    if (connectedUsers) {
      const allUsers = connectedUsers.flat();
      const resetStates: { [username: string]: boolean } = {};

      allUsers.forEach((user) => {
        resetStates[user.username] = false;
      });

      resetStates[ownUsername] = false;

      setUserMicStates(resetStates);
    } else {
      setUserMicStates((prev) => ({ ...prev, [ownUsername]: false }));
    }
  };

  /**
   * Effect to set up the user media stream when the component mounts.
   * It requests the user's audio stream and sets it to the audio element.
   * It also handles the cleanup of the user stream when the component unmounts.
   * @returns {void}
   */
  useEffect(() => {
    if (iConnected && !userStream) {
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
          setiConnected(false);
        });
    }

    return () => {
      if (userStream && !iConnected) {
        userStream.getTracks().forEach((track) => track.stop());
        setUserStream(null);
      }
    };
  }, [iConnected, userStream]);

  const handleVolumeChange = (username: string, volume: number) => {
  console.log(`Changing volume for ${username} to`, volume);

  setUserVolumes((prevVolumes) => ({
    ...prevVolumes,
    [username]: volume,
  }));

  const audios = audioGridRef.current?.getElementsByTagName("audio");
  if (audios) {
    Array.from(audios).forEach((audio) => {
      const dataUser = audio.getAttribute("data-username");
      audioGridRef.current?.appendChild(audio);
      if (dataUser === username) {
        audio.volume = volume;
      }
    });
  }
};


  /**
   * Effect to set up the PeerJS connection and handle incoming/outgoing calls.
   * It listens for user connections and disconnections, and manages the audio streams.
   * It also handles microphone activity detection and updates the microphone states.
   * @returns {void}
   */
  useEffect(() => {
    if (!iConnected || !userStream) return;

    console.log("[VOICE] Setting up PeerJS connection");

    const randomId =
      "user-" +
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Date.now().toString(36);

    console.log(peerUrl, "peerUrl");

    const peer = new Peer(randomId, {
      host: `${peerUrl}`,
      secure: false,
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
      chatNamespace.emit("join-room", ROOM_ID, id, ownUsername);

      peer.on("call", (call) => {
        const callerUsername = call.metadata?.username || "Nieznany użytkownik";

        console.log(`[VOICE] Incoming call from ${callerUsername} (${call.peer})`);

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
          audio.setAttribute("data-username", call.peer);
          
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

          chatNamespace.on("userMicActivity", ({ username, isSpeaking }) => {
            setUserMicStates((prev) => {
              if (prev[username] === isSpeaking) return prev;
              return { ...prev, [username]: isSpeaking };
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

      chatNamespace.on("user-connected", ({ id, username }) => {
        console.log(`[VOICE] User connected: ${username}`);
        if (username === ownUsername) return;

        const call = peer.call(id, userStream, {
          metadata: {
            username: username, 
          },
        });

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.autoplay = true;
        audio.muted = false;

        call.on("stream", (remoteStream) => {
          console.log(`[VOICE] Received stream from called user: ${username}`);
          console.log("Remote tracks:", remoteStream.getTracks());
          if (remoteStream.getAudioTracks().length === 0) {
            console.error("No audio tracks in remote stream!");
          }
          console.log("Audio tracks:", remoteStream.getAudioTracks());

          audio.srcObject = remoteStream;
          audio.setAttribute("data-username", username);
          audio.addEventListener("loadedmetadata", () => {
            audio.play().catch((e) => console.error("Audio play failed:", e));
          });
        });

        call.on("close", () => {
          console.log(`[VOICE] Call closed with: ${username}`);
          audio.remove();
        });

        peers.current[username] = call;
      });

      chatNamespace.on("user-disconnected", (username) => {
        console.log(`[VOICE] User disconnected: ${username}`);
        if (peers.current[username]) {
          peers.current[username].close();
          delete peers.current[username];
        }
        setUserMicStates((prev) => ({ ...prev, [username]: false }));
      });
    });
    soundFXVolume = Math.max(0, Math.min(1, soundFXVolume));

    peer.on("error", (err) => {
      console.error("[VOICE] PeerJS error:", err);
      if (err.type === "network" || err.type === "disconnected") {
        console.log("[VOICE] Network error, trying to reconnect...");
        cleanupPeerConnections();
        setiConnected(false);
        setTimeout(() => setiConnected(true), 2000);
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
      if (!iConnected) {
        if (micActivityFrameRef.current) {
          cancelAnimationFrame(micActivityFrameRef.current);
          micActivityFrameRef.current = null;
        }
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const isSpeaking = sum > 1000;

      setUserMicStates((prevState) => {
        const currentSpeaking = prevState[ownUsername];
        if (currentSpeaking !== isSpeaking) {
          chatNamespace.emit("userMicActivity", {
            username: ownUsername,
            isSpeaking,
            roomId: ROOM_ID,
          });

          return {
            ...prevState,
            [ownUsername]: isSpeaking,
          };
        }
        return prevState;
      });

      micActivityFrameRef.current = requestAnimationFrame(checkMicActivity);
    };

    micActivityFrameRef.current = requestAnimationFrame(checkMicActivity);

    return () => {
      console.log("[VOICE] Cleaning up PeerJS and Socket.IO connections");

      chatNamespace.off("user-connected");
      chatNamespace.off("user-disconnected");
      chatNamespace.off("userMicActivity");

      if (peer.id) {
        chatNamespace.emit("leave-room", ROOM_ID, peer.id);
      }

      if (micActivityFrameRef.current) {
        cancelAnimationFrame(micActivityFrameRef.current);
        micActivityFrameRef.current = null;
      }

      resetAllMicStates();

      cleanupPeerConnections();
    };
  }, [iConnected, userStream, ownUsername]);

  /**
   * Toggles the mute state of the user.
   */
  const mute = () => {
    setMuted((prevMuted) => {
      const newMuted = !prevMuted;

      if (userStream) {
        userStream.getAudioTracks().forEach((track) => {
          track.enabled = !newMuted;
        });
      }

      const led = document.querySelector(".mic-led-own") as HTMLElement;
      if (led) {
        led.style.backgroundColor = newMuted ? "red" : "green";
      }

      return newMuted;
    });
  };

  /**
   * Joins the audio room by connecting to the Socket.IO server.
   * It emits a "join-room" event with the room ID and the user's ID.
   * @returns {Promise<void>} - A promise that resolves when the user has joined the room.
   */
  const joinRoom = () => {
    console.log("[VOICE] Joining audio room");
    setiConnected(true);

    return chatNamespace.connect();
  };

  /**
   * Leaves the audio room by disconnecting from the Socket.IO server.
   * It emits a "leave-room" event with the room ID and the user's ID.
   * @returns {void}
   */
  const leaveRoom = () => {
    console.log("[VOICE] Leaving audio room");

    if (micActivityFrameRef.current) {
      cancelAnimationFrame(micActivityFrameRef.current);
      micActivityFrameRef.current = null;
    }

    resetAllMicStates();

    cleanupPeerConnections();

    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
      setUserStream(null);
    }

    setiConnected(false);
    setMuted(false);
    const led = document.querySelector(".mic-led-own") as HTMLElement;
    if (led) {
      led.style.backgroundColor = "red";
    }

    chatNamespace.emit(
      "userMicActivity",
      {
        username: ownUsername,
        isSpeaking: false,
        roomId: ROOM_ID,
      },
      () => {
        chatNamespace.disconnect();
      }
    );
  };

  return (
    <div className="audio-room-container">
      <div className="audio-room-header">
        <div className="audio-room-buttons">
          <Button
            onClick={iConnected ? leaveRoom : joinRoom}
            className="audio-room-button"
            variant="transparent"
            soundFXVolume={soundFXVolume}
          >
            <img
              className="button-icon"
              src={iConnected ? callIcon : callEndIcon}
              onClick={iConnected ? leaveRoom : joinRoom}
              style={{
                width: iConnected ? "29px" : "37px",
                height: "29px",
              }}
            />
          </Button>
          <Button
            onClick={mute}
            disabled={!iConnected}
            className="audio-room-button"
            variant="transparent"
            soundFXVolume={soundFXVolume}
          >
            <img
              className="button-icon"
              src={muted ? micOffIcon : micIcon}
              style={{
                height: "29px",
                opacity: iConnected ? 1 : 0.5,
              }}
            />
          </Button>
          <div
            className="mic-led-own"
            style={{
              backgroundColor:
                userMicStates[ownUsername] && iConnected ? "green" : "red",
            }}
          />
        </div>
        <div className="audio-room-status">
          <div className="audio-room-status-1">Status:</div>
          <div className="audio-room-status-2">
            {iConnected ? "connected" : "disconnected"}
          </div>
        </div>
      </div>
      <div className="audio-room-users">
        <div className="user-cards">
        {connectedUsers?.flat().map((user) =>
          user.username !== ownUsername ? (
            <div key={user.id} className="user-card">
              <div className="user-card-left">
              <div className="user-name">{user.username}</div>
              <div className="volume-control">
                <img src={volumeIcon} alt="Volume Icon" className="volume-icon" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={userVolumes[user.username] || 0.5}
                  onChange={(e) =>
                    handleVolumeChange(user.username, parseFloat(e.target.value))
                  }
                  className="volume-slider"
                />
              </div>
              </div>
              <div
                className="mic-led"
                style={{
                  backgroundColor:
                    userMicStates[user.username] && iConnected ? "green" : "red",
                }}
              />
            </div>
          ) : null
        )}
        </div>
        <div ref={audioGridRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default AudioRoom;
