import { type Session, SessionModel } from "../models/session.model"
import { StudentModel } from "../models/student.model"
import { AnalyticsModel } from "../models/analytics.model"
import { WebSocketService } from "./socket.service"

export class SessionService {
  static async createSession(session: Session): Promise<Session> {
    // Check if student exists, create if not
    if (session.student_id) {
      const studentExists = await StudentModel.exists(session.student_id)
      if (!studentExists) {
        await StudentModel.create({ student_id: session.student_id })
      }
    }

    const createdSession = await SessionModel.create(session)

    // Broadcast the session via WebSocket
    WebSocketService.broadcastSessionUpdate(createdSession)

    return createdSession
  }

  static async updateSession(session: Session): Promise<Session | null> {
    const updatedSession = await SessionModel.update(session)

    if (updatedSession && updatedSession.student_id) {
      // Update student activity
      const date = new Date(updatedSession.start_time).toISOString().split("T")[0]

      await AnalyticsModel.updateStudentActivity(
        updatedSession.student_id,
        date,
        1, // session count
        session.total_time_spent || 0,
        session.pages_visited || 0,
        0, // interactions
      )

      // Broadcast the session update via WebSocket
      WebSocketService.broadcastSessionUpdate(updatedSession)
    }

    return updatedSession
  }

  static async getSessionsByStudentId(studentId: string): Promise<Session[]> {
    return SessionModel.findByStudentId(studentId)
  }

  static async getSessionById(sessionId: string): Promise<Session | null> {
    return SessionModel.findById(sessionId)
  }

  static async getSessionStats(): Promise<{ count: number; avgTime: number }> {
    const count = await SessionModel.getSessionCount()
    const avgTime = await SessionModel.getAverageSessionTime()

    return { count, avgTime }
  }
}

