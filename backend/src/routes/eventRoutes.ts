import { Router } from "express"
import { EventController } from "../controllers/eventController"
import { validateEvent } from "../middleware/validation"

const router = Router()
const eventController = new EventController()

// Route to track a single event
router.post("/", validateEvent, eventController.trackEvent)

// Route to track multiple events in batch
router.post("/batch", eventController.trackBatchEvents)

// Route to get all events (with pagination and filtering)
router.get("/", eventController.getEvents)

// Route to get events by user ID
router.get("/user/:userId", eventController.getEventsByUser)

// Route to get events by type
router.get("/type/:eventType", eventController.getEventsByType)

export const eventRoutes = router

