import type { Server as SocketIOServer } from "socket.io"

export function setupSocketHandlers(io: SocketIOServer): void {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id)

        // Handle client joining analytics room
        socket.on("joinAnalytics", () => {
            socket.join("analytics")
            console.log(`Client ${socket.id} joined analytics room`)
        })

        // Handle client disconnection
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id)
        })
    })
}

