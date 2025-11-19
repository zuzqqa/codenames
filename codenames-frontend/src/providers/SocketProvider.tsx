import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import {useToast} from "../components/Toast/ToastContext.tsx";
import {socketUrl} from "../config/api.tsx";

type SocketContextValue = {
    socket: Socket | null
    profileSocket: Socket | null
}

const SocketContext = createContext<SocketContextValue>({ socket: null, profileSocket: null })

type Props = {
    children: ReactNode
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null)
    const profileSocketRef = useRef<Socket | null>(null)
    const [socketState, setSocketState] = useState<Socket | null>(null)
    const [profileSocketState, setProfileSocketState] = useState<Socket | null>(null)
    const { addToast } = useToast();

    useEffect(() => {

        const socket = io(socketUrl, {
            autoConnect: true,
            withCredentials: true,
            transports: ['polling', 'websocket']
        })
        socketRef.current = socket
        setSocketState(socket)

        socket.on('connect', () => {
            console.info('Socket connected', socket.id)
        })

        socket.on('connect_error', (err: any) => {
            console.error('Socket connect error', err)
        })

        // Keep previous generic events if needed
        socket.on('friend:request', (payload: any) => {
            const name = payload?.fromName ?? 'Nowe zaproszenie'
            addToast(`${name} wysłał(a) zaproszenie do znajomych`, "notification")
        })

        socket.on('friend:accepted', (payload: any) => {
            const name = payload?.fromName ?? 'Ktoś'
            addToast(`${name} zaakceptował(a) zaproszenie`, "notification")
        })

        // Connect to profile namespace for persistent friend notifications
        const profileSocket = io(`${socketUrl}/profile`, {
            autoConnect: true,
            withCredentials: true,
            transports: ['polling', 'websocket']
        })
        profileSocketRef.current = profileSocket
        setProfileSocketState(profileSocket)

        profileSocket.on('connect', () => {
            console.info('Profile socket connected', profileSocket.id)
        })

        profileSocket.on('friendRequestReceived', (payload: any) => {
            const from = payload?.from ?? 'Ktoś'
            addToast(`${from} wysłał(a) zaproszenie do znajomych`, 'notification')
        })

        profileSocket.on('friendRequestAccepted', (payload: any) => {
            const by = payload?.by ?? 'Ktoś'
            addToast(`${by} zaakceptował(a) zaproszenie`, 'notification')
        })

        profileSocket.on('connect_error', (err: any) => {
            console.error('Profile socket connect error', err)
        })

        return () => {
            socket.removeAllListeners()
            socket.disconnect()
            socketRef.current = null
            setSocketState(null)

            profileSocket.removeAllListeners()
            profileSocket.disconnect()
            profileSocketRef.current = null
            setProfileSocketState(null)
        }
    }, [])

    return <SocketContext.Provider value={{ socket: socketState, profileSocket: profileSocketState }}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)