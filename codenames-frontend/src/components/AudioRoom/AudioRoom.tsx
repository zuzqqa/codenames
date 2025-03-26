import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, {MediaConnection} from "peerjs";

const socket = io("http://localhost:3000");
const ROOM_ID = "room1"; // Adjust as needed

const AudioRoom: React.FC = () => {
    const audioGridRef = useRef<HTMLDivElement>(null);
    const myPeer = useRef(new Peer({ host: "localhost", port: 3001 }));
    const myAudioRef = useRef(new Audio());
    const peers = useRef<{ [key: string]: MediaConnection }>({});
    const [stream, setStream] = useState<MediaStream | null>(null);

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
        <div>
            <div ref={audioGridRef} id="audio-grid"></div>
            <button onClick={() => socket.emit("join-room", ROOM_ID, myPeer.current.id)}>Connect</button>
            <button onClick={leaveRoom}>Disconnect</button>
        </div>
    );
};

export default AudioRoom;
