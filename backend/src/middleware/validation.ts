import type { Request, Response, NextFunction } from "express"
import { EventType } from "../types/events"

// Validate event data
export const validateEvent = (req: Request, res: Response, next: NextFunction): void => {
    const event = req.body

    // Check if event has required fields
    if (!event.eventType || !event.url || !event.timestamp) {
        res.status(400).json({ error: "Missing required fields: eventType, url, timestamp" })
        return
    }

    // Check if event type is valid
    const validEventTypes = Object.values(EventType)
    if (!validEventTypes.includes(event.eventType)) {
        res.status(400).json({ error: `Invalid event type. Must be one of: ${validEventTypes.join(", ")}` })
        return
    }

    // Check if timestamp is valid
    if (isNaN(Date.parse(event.timestamp))) {
        res.status(400).json({ error: "Invalid timestamp format" })
        return
    }

    next()
}

