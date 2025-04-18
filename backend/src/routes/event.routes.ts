import { Router } from "express"
import { EventController } from "../controllers/event.controller"

const router = Router()

// Create a new event
router.post("/", EventController.createEvent)

// Get all events with pagination
router.get("/", EventController.getEvents)  // Add this line for the missing endpoint

// Get events for a session
router.get("/session/:sessionId", EventController.getEventsBySessionId)

// Get events for a student
router.get("/student/:studentId", EventController.getEventsByStudentId)

// Bulk insert events
router.post("/bulk", EventController.bulkCreateEvents)

// Get recent events
router.get("/recent", EventController.getRecentEvents)

export default router