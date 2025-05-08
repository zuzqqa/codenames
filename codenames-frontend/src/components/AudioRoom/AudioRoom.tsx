import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, {MediaConnection} from "peerjs";
import Button from "../Button/Button.tsx";
import Mic from "../../assets/icons/mic.svg";
import MicOff from "../../assets/icons/micOff.svg";
import "./AudioRoom.css"

const getUserIdFromLocalStorage = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        const newUserId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("userId", newUserId);
        return newUserId;
    }
    return userId;
}

const getGameIDFromLocalStorage = () => {
    return localStorage.getItem("gameId");
}

const socket = io("http://localhost:3000");
const ROOM_ID = getGameIDFromLocalStorage();

interface AudioRoomProps {
    soundFXVolume: number;
}

const AudioRoom: React.FC<AudioRoomProps> = ({soundFXVolume}) => {
    const audioGridRef = useRef<HTMLDivElement>(null);
    const userId = useRef<string>(getUserIdFromLocalStorage());
    const myPeer = useRef(new Peer(userId.current, { host: "localhost", port: 3001 }));
    const myAudioRef = useRef(new Audio());
    const peers = useRef<{ [key: string]: MediaConnection }>({});
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        myAudioRef.current.muted = true;
        navigator.mediaDevices.getUserMedia({ audio: true }).then((userStream) => {
            setStream(userStream);
            addAudioStream(myAudioRef.current, userStream);

            myPeer.current.on("call", (call) => {
                call.answer(userStream);
                const audio = new Audio();
                call.on("stream", (userAudioStream) => addAudioStream(audio, userAudioStream));
            });

            socket.on("user-connected", (userId: string) => {
                connectToNewUser(userId, userStream);
            });
        });

        socket.on("user-disconnected", (userId: string) => {
            if (peers.current[userId]) peers.current[userId].close();
        });

        myPeer.current.on("open", (id) => {
            socket.emit("join-room", ROOM_ID, id);
        });

        return () => {
            socket.emit("leave-room", ROOM_ID, myPeer.current.id);
            Object.values(peers.current).forEach((peer) => peer.close());
        };
    }, []);

    const connectToNewUser = (userId: string, userStream: MediaStream) => {
        const call = myPeer.current.call(userId, userStream);
        const audio = new Audio();
        call.on("stream", (userAudioStream) => addAudioStream(audio, userAudioStream));
        call.on("close", () => audio.remove());
        peers.current[userId] = call;
    };

    const addAudioStream = (audio: HTMLAudioElement, stream: MediaStream) => {
        audio.srcObject = stream;
        audio.addEventListener("loadedmetadata", () => audio.play());
        audioGridRef.current?.append(audio);
    };

    const leaveRoom = () => {
        socket.emit("leave-room", ROOM_ID, myPeer.current.id);
        Object.values(peers.current).forEach((peer) => peer.close());
    }

    return (
        <div id="audio-component">
            <div ref={audioGridRef} id="audio-grid"></div>
            {!isConnected ? (
                <Button
                    variant="circle"
                    soundFXVolume={soundFXVolume}
                    onClick={() => {
                        socket.emit("join-room", ROOM_ID, myPeer.current.id)
                        setIsConnected(true);
                    }}
                >
                    <img src={Mic} alt="Mic" style={{width: "25px", height: "25px"}}/>
                </Button>
            ) : (
                <Button
                    variant="circle"
                    soundFXVolume={soundFXVolume}
                    onClick={() => {
                        leaveRoom()
                        setIsConnected(false);
                    }}
                >
                    <img src={MicOff} alt="MicOff" style={{width: "25px", height: "25px"}}/>
                </Button>
            )}
        </div>
    );
};

export default AudioRoom;
