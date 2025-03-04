import express from "express"
import cors from "cors"
import http from "http"
import { Server as SocketIOServer } from "socket.io"
import dotenv from "dotenv"
import { eventRoutes } from "./routes/eventRoutes"
import { analyticsRoutes } from "./routes/analyticsRoutes"
import { statsRoutes } from "./routes/statsRoutes"
import { userRoutes } from "./routes/userRoutes"
import { courseRoutes } from "./routes/courseRoutes"
import { resourceRoutes } from "./routes/resourceRoutes"
import { quizRoutes } from "./routes/quizRoutes"
import { setupSocketHandlers } from "./services/socketService"
import { errorHandler } from "./middleware/errorHandler"
import { runMigrations } from "./db/migrations"

// Load environment variables
dotenv.config()

// Run database migrations
async function initializeDatabase() {
    try {
        await runMigrations()
        console.log("Database migrations completed successfully")
    } catch (error) {
        console.error("Error running database migrations:", error)
        process.exit(1)
    }
}

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
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/quizzes", quizRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3000

// Initialize database and start server
initializeDatabase().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})

// Export for testing
export { app, server, io }

