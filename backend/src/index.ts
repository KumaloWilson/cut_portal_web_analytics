import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { initializeDatabase } from "./models/database"
import routes from "./routes"
import { WebSocketService } from "./services/socket.service"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const port = process.env.PORT || 3000

// Create HTTP server
const server = http.createServer(app)

// Initialize WebSocket service
WebSocketService.initialize(server)

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow specific origins or all (*)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow cookies if needed
  })
)
app.use(express.json())

// Initialize database
initializeDatabase().catch((err) => {
  console.error("Error initializing database:", err)
  process.exit(1)
})

// Routes
app.use("/api", routes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

export default app
