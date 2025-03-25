"use client"

import React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { toast } from "sonner"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Connect to the WebSocket server
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on("connect", () => {
      setIsConnected(true)
      toast("Connected to server",{
        description: "Real-time updates are now active",
      })

      // Join rooms for different data types
      socketInstance.emit("join", ["analytics", "students", "sessions", "events"])
    })

    socketInstance.on("disconnect", () => {
      setIsConnected(false)
      toast("Disconnected from server",{
        description: "Real-time updates are paused",
      })
    })

    socketInstance.on("connect_error", () => {
      toast("Connection error",{
        description: "Failed to connect to the server",
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [toast])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)


