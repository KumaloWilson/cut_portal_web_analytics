"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import toast from "react-hot-toast"

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
        // Connect to the socket server with error handling
        const socketInstance = io("http://localhost:3000", {
            transports: ["websocket", "polling"], // Try both WebSocket and polling
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000, // Increase timeout
        })

        // Set socket in state
        setSocket(socketInstance)

        // Log connection status
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id)
            toast.success("Connected to server")
        })

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected")
            toast.error("Disconnected from server")
        })

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
            toast.error("Failed to connect to server. Please make sure the backend is running.")
        })

        // Clean up on unmount
        return () => {
            socketInstance.disconnect()
        }
    }, [])

    // Show a message if socket is not connected
    if (!socket) {
        return (
            <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg">
                <p className="font-bold">Connecting to server...</p>
                <p>Please make sure the backend server is running on port 3000.</p>
            </div>
        )
    }

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

