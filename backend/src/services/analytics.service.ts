import { AnalyticsModel } from "../models/analytics.model"
import { StudentModel } from "../models/student.model"
import { SessionModel } from "../models/session.model"
import { EventModel } from "../models/event.model"

export class AnalyticsService {
  static async getOverview(): Promise<any> {
    const studentCount = (await StudentModel.findAll()).length
    const sessionStats = await SessionModel.getSessionCount()
    const eventCount = await EventModel.getEventCount()
    const avgSessionTime = await SessionModel.getAverageSessionTime()
    const topPages = await AnalyticsModel.getTopPages(10)

    return {
      total_students: studentCount,
      total_sessions: sessionStats,
      total_events: eventCount,
      avg_session_time: avgSessionTime,
      top_pages: topPages,
    }
  }

  static async getActivityOverTime(days = 30): Promise<any[]> {
    return AnalyticsModel.getActivityOverTime(days)
  }

  static async getTopPages(limit = 10): Promise<any[]> {
    return AnalyticsModel.getTopPages(limit)
  }

  static async getStudentEngagement(): Promise<any[]> {
    return AnalyticsModel.getStudentEngagement()
  }

  static async getModuleEngagement(): Promise<any[]> {
    return AnalyticsModel.getModuleEngagement()
  }

  static async getTimeOfDayActivity(): Promise<any[]> {
    return EventModel.getEventsByTimeOfDay()
  }
}

