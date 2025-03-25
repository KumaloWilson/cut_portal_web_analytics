import { type Event, EventModel } from "../models/event.model"
import { AnalyticsModel } from "../models/analytics.model"
import { SessionService } from "./session.service"
import { WebSocketService } from "./socket.service"

export class EventService {
  static async createEvent(event: Event): Promise<Event> {
    try {
      // Ensure we have a valid session before creating the event
      if (!event.session_id) {
        // Generate a UUID for the session_id if none exists
        const { v4: uuidv4 } = require("uuid")
        event.session_id = uuidv4()

        // Create a new session with the generated UUID
        await SessionService.createSession({
          session_id: event.session_id,
          student_id: event.student_id,
          start_time: new Date(event.timestamp),
          user_agent: event.details?.userAgent || null,
        })
      } else {
        // Check if the session exists, create if not
        try {
          await SessionService.getOrCreateSession(event.session_id, event.student_id, new Date(event.timestamp))
        } catch (sessionError) {
          console.error(`Error ensuring session exists for event: ${sessionError}`)
          // Continue with event creation even if session creation fails
        }
      }

      // Create the event
      const createdEvent = await EventModel.create(event)

      // Broadcast the event via WebSocket
      WebSocketService.broadcastEvent(createdEvent)

      // Update analytics data
      if (event.event_type === "page_view") {
        await AnalyticsModel.updatePageView(event.path, event.page_title || null)

        // Update student activity for page views
        if (event.student_id) {
          const date = new Date(event.timestamp).toISOString().split("T")[0]
          await AnalyticsModel.updateStudentActivity(
            event.student_id,
            date,
            0, // session count
            0, // time spent
            1, // page views
            0, // interactions
          )
        }
      } else {
        // Update student activity for interactions
        if (event.student_id) {
          const date = new Date(event.timestamp).toISOString().split("T")[0]
          await AnalyticsModel.updateStudentActivity(
            event.student_id,
            date,
            0, // session count
            0, // time spent
            0, // page views
            1, // interactions
          )
        }
      }

      return createdEvent
    } catch (error) {
      console.error(`Error in createEvent for session_id ${event.session_id}:`, error)
      throw error
    }
  }

  static async getEventsBySessionId(sessionId: string): Promise<Event[]> {
    return EventModel.findBySessionId(sessionId)
  }

  static async getEventsByStudentId(studentId: string, limit = 100, offset = 0): Promise<Event[]> {
    return EventModel.findByStudentId(studentId, limit, offset)
  }

  static async bulkCreateEvents(events: Event[]): Promise<number> {
    try {
      // Ensure all sessions exist before creating events
      const sessionIds = new Set(events.map((event) => event.session_id))

      for (const sessionId of sessionIds) {
        try {
          // Find the first event for this session to get timestamp and student_id
          const firstEvent = events.find((e) => e.session_id === sessionId)
          if (firstEvent) {
            await SessionService.getOrCreateSession(sessionId, firstEvent.student_id, new Date(firstEvent.timestamp))
          }
        } catch (sessionError) {
          console.error(`Error ensuring session ${sessionId} exists: ${sessionError}`)
          // Continue with other sessions even if one fails
        }
      }

      const count = await EventModel.bulkCreate(events)

      // Broadcast analytics update after bulk event creation
      WebSocketService.broadcastAnalyticsUpdate("events-bulk", { count })

      return count
    } catch (error) {
      console.error("Error in bulkCreateEvents:", error)
      throw error
    }
  }

  static async getEventCount(): Promise<number> {
    return EventModel.getEventCount()
  }

  static async getEventsByTimeOfDay(): Promise<any[]> {
    return EventModel.getEventsByTimeOfDay()
  }
}

