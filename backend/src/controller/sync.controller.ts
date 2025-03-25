import type { Request, Response } from "express"
import { StudentService } from "../services/student.service"
import { SessionService } from "../services/session.service"
import { EventService } from "../services/event.service"
import type { AnalyticsData } from "../types/analytics.types"

export class SyncController {
  static async syncData(req: Request, res: Response): Promise<void> {
    try {
      const analyticsData: AnalyticsData = req.body
      const results = {
        student: null as any,
        session: null as any,
        events: 0,
        modules: 0,
      }

      // Process student data if available
      if (analyticsData.student && analyticsData.student.student_id) {
        results.student = await StudentService.createOrUpdateStudent(analyticsData.student)
      }

      // Process session data
      if (analyticsData.current_session && analyticsData.current_session.session_id) {
        const sessionData = {
          session_id: analyticsData.current_session.session_id,
          student_id: analyticsData.student?.student_id,
          start_time: new Date(analyticsData.current_session.start_time),
          end_time: analyticsData.current_session.is_active
            ? undefined
            : new Date(analyticsData.current_session.last_activity),
          total_time_spent: analyticsData.current_session.total_time_spent,
          pages_visited: analyticsData.current_session.pages_visited,
        }

        // Check if session exists, create or update accordingly
        const existingSession = await SessionService.getSessionById(sessionData.session_id)
        if (existingSession) {
          results.session = await SessionService.updateSession(sessionData)
        } else {
          results.session = await SessionService.createSession(sessionData)
        }
      }

      // Process modules if available
      if (analyticsData.modules && analyticsData.modules.length > 0 && analyticsData.student?.student_id) {
        await StudentService.addModulesToStudent(
          analyticsData.student.student_id,
          analyticsData.modules,
          new Date().toISOString().split("T")[0], // Use current date as period ID
        )
        results.modules = analyticsData.modules.length
      }

      // Process events in bulk
      if (analyticsData.events && analyticsData.events.length > 0) {
        const events = analyticsData.events.map((event) => ({
          event_type: event.event_type,
          session_id: event.session_id,
          student_id: event.student_id,
          url: event.url,
          path: event.path,
          page_title: event.page_title,
          timestamp: new Date(event.timestamp),
          details: event.details,
        }))

        results.events = await EventService.bulkCreateEvents(events)
      }

      res.status(200).json({
        success: true,
        message: "Data synced successfully",
        results,
      })
    } catch (error) {
      console.error("Error syncing data:", error)
      res.status(500).json({ error: "Failed to sync data" })
    }
  }
}

