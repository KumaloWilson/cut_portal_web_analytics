import type { Request, Response } from "express"
import { EventService } from "../services/eventService"
import { io } from "../index"

export class EventController {
    private readonly eventService: EventService

    constructor() {
        this.eventService = new EventService()
    }

    // Track a single event
    trackEvent = async (req: Request, res: Response): Promise<void> => {
        try {
            const event = req.body
            const result = await this.eventService.createEvent(event)

            // Emit real-time update via Socket.IO
            io.emit("newEvent", event)

            res.status(201).json(result)
        } catch (error) {
            console.error("Error tracking event:", error)
            res.status(500).json({ error: "Failed to track event" })
        }
    }

    // Track multiple events in batch
    trackBatchEvents = async (req: Request, res: Response): Promise<void> => {
        try {
            const { events } = req.body

            if (!Array.isArray(events)) {
                res.status(400).json({ error: "Events must be an array" })
                return
            }

            const results = await this.eventService.createBatchEvents(events)

            // Emit real-time updates via Socket.IO
            events.forEach((event) => {
                io.emit("newEvent", event)
            })

            res.status(201).json(results)
        } catch (error) {
            console.error("Error tracking batch events:", error)
            res.status(500).json({ error: "Failed to track batch events" })
        }
    }

    // Get all events with pagination and filtering
    getEvents = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = "1", limit = "50", startDate, endDate, eventType } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            if (eventType) {
                filters.eventType = eventType
            }

            const { events, total } = await this.eventService.getEvents(pageNum, limitNum, filters)

            res.status(200).json({
                events,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting events:", error)
            res.status(500).json({ error: "Failed to get events" })
        }
    }

    // Get events by user ID
    getEventsByUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const { page = "1", limit = "50" } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const { events, total } = await this.eventService.getEventsByUser(userId, pageNum, limitNum)

            res.status(200).json({
                events,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting events by user:", error)
            res.status(500).json({ error: "Failed to get events by user" })
        }
    }

    // Get events by type
    getEventsByType = async (req: Request, res: Response): Promise<void> => {
        try {
            const { eventType } = req.params
            const { page = "1", limit = "50" } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const { events, total } = await this.eventService.getEventsByType(eventType as string, pageNum, limitNum)

            res.status(200).json({
                events,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting events by type:", error)
            res.status(500).json({ error: "Failed to get events by type" })
        }
    }
}

