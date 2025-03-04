import express from "express"
import cors from "cors"
import http from "http"
import { Server as SocketIOServer } from "socket.io"
import dotenv from "dotenv"
import { eventRoutes } from "./routes/eventRoutes"
import { analyticsRoutes } from "./routes/analyticsRoutes"
import { statsRoutes } from "./routes/statsRoutes"
import { setupSocketHandlers } from "./services/socketService"
import { errorHandler } from "./middleware/errorHandler"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const server = http.createServer(app)

// Set up Socket.IO for real-time updates
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

// Middleware
app.use(cors())
app.use(express.json())

// Set up socket handlers
setupSocketHandlers(io)

// Routes
app.use("/api/events", eventRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/stats", statsRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// Export for testing
export { app, server, io }

