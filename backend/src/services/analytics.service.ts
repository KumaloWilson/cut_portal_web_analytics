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
    const activeSessions = await SessionModel.getActiveSessions()

    return {
      total_students: studentCount,
      total_sessions: sessionStats,
      total_events: eventCount,
      avg_session_time: avgSessionTime,
      top_pages: topPages,
      active_sessions: activeSessions.length,
      recent_events: await EventModel.getRecentEventsCount(30), // Last 30 minutes
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

  static async getDailyVisitors(): Promise<any> {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    const todayVisits = await AnalyticsModel.getDailyVisitorCount(today)
    const yesterdayVisits = await AnalyticsModel.getDailyVisitorCount(yesterday)

    const weeklyData = await AnalyticsModel.getActivityOverTime(7)
    const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.sessions, 0)
    const weeklyAverage = Math.round(weeklyTotal / weeklyData.length)

    const trend = yesterdayVisits > 0 ? ((todayVisits - yesterdayVisits) / yesterdayVisits) * 100 : 0

    return {
      today: todayVisits,
      yesterday: yesterdayVisits,
      trend,
      weekly_total: weeklyTotal,
      weekly_average: weeklyAverage,
    }
  }
}
