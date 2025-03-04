"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

// Create context
const SocketContext = createContext<Socket | null>(null)

// Custom hook to use socket
export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
    children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        // Connect to the socket server
        const socketInstance = io("http://localhost:3000", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        // Set socket in state
        setSocket(socketInstance)

        // Log connection status
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id)
        })

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected")
        })

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
        })

        // Clean up on unmount
        return () => {
            socketInstance.disconnect()
        }
    }, [])

    return <SocketContext.Provider value={ socket }> { children } </SocketContext.Provider>
}

