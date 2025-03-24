import { type Event, EventModel } from "../models/event.model"
import { AnalyticsModel } from "../models/analytics.model"
import { WebSocketService } from "./socket.service"

export class EventService {
  static async createEvent(event: Event): Promise<Event> {
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
  }

  static async getEventsBySessionId(sessionId: string): Promise<Event[]> {
    return EventModel.findBySessionId(sessionId)
  }

  static async getEventsByStudentId(studentId: string, limit = 100, offset = 0): Promise<Event[]> {
    return EventModel.findByStudentId(studentId, limit, offset)
  }

  static async bulkCreateEvents(events: Event[]): Promise<number> {
    const count = await EventModel.bulkCreate(events)

    // Broadcast analytics update after bulk event creation
    WebSocketService.broadcastAnalyticsUpdate("events-bulk", { count })

    return count
  }

  static async getEventCount(): Promise<number> {
    return EventModel.getEventCount()
  }

  static async getEventsByTimeOfDay(): Promise<any[]> {
    return EventModel.getEventsByTimeOfDay()
  }
}

