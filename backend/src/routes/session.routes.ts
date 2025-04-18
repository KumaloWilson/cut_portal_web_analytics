import { Router } from "express"
import { SessionController } from "../controllers/session.controller"

const router = Router()

// Create a new session
router.post("/", SessionController.createSession)

// Update a session
router.post("/update", SessionController.updateSession)

// Get all sessions
router.get("/", SessionController.getAllSessions)

// Get active sessions
router.get("/active", SessionController.getActiveSessions)

// Get sessions for a student
router.get("/student/:studentId", SessionController.getSessionsByStudentId)

// Get a session by ID
router.get("/:sessionId", SessionController.getSessionById)

export default router