import { Router } from "express"
import { SessionController } from "../controller/session.controller"

const router = Router()

// Create a new session
router.post("/", SessionController.createSession)

// Update a session
router.post("/update", SessionController.updateSession)

// Get All Sessions
router.get("/", SessionController.getSessions)

// Get sessions for a student
router.get("/student/:studentId", SessionController.getSessionsByStudentId)

// Get a session by ID
router.get("/:sessionId", SessionController.getSessionById)

export default router

