import type { Request, Response } from "express"
import { EventService } from "../services/event.service"

export class EventController {
  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body
      const result = await EventService.createEvent(event)
      res.status(201).json(result)
    } catch (error) {
      console.error("Error creating event:", error)
      res.status(500).json({ error: "Failed to create event" })
    }
  }

  static async getEventsBySessionId(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params
      const events = await EventService.getEventsBySessionId(sessionId)
      res.status(200).json(events)
    } catch (error) {
      console.error("Error fetching events:", error)
      res.status(500).json({ error: "Failed to fetch events" })
    }
  }

  static async getEventsByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 100
      const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : 0

      const events = await EventService.getEventsByStudentId(studentId, limit, offset)
      res.status(200).json(events)
    } catch (error) {
      console.error("Error fetching events:", error)
      res.status(500).json({ error: "Failed to fetch events" })
    }
  }

  static async bulkCreateEvents(req: Request, res: Response): Promise<void> {
    try {
      const { events } = req.body

      if (!Array.isArray(events) || events.length === 0) {
        res.status(400).json({ error: "Invalid events data" })
        return
      }

      const count = await EventService.bulkCreateEvents(events)
      res.status(201).json({ message: `${count} events created successfully` })
    } catch (error) {
      console.error("Error bulk inserting events:", error)
      res.status(500).json({ error: "Failed to insert events" })
    }
  }
}
