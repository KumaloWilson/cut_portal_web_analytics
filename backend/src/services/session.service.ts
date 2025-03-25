import { type Session, SessionModel } from "../models/session.model"
import { StudentModel } from "../models/student.model"
import { AnalyticsModel } from "../models/analytics.model"
import { WebSocketService } from "./socket.service"

export class SessionService {
  static async createSession(session: Session): Promise<Session> {
    try {
      // Check if session already exists
      const existingSession = await SessionModel.findById(session.session_id)
      if (existingSession) {
        console.log(`Session ${session.session_id} already exists, updating instead of creating`)
        const updatedSession = await this.updateSession(session)
        if (!updatedSession) {
          throw new Error(`Failed to update session ${session.session_id}`)
        }
        return updatedSession
      }

      // If session_id is null or empty, generate a UUID
      if (!session.session_id) {
        const { v4: uuidv4 } = require("uuid")
        session.session_id = uuidv4()
      }

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
    } catch (error) {
      console.error(`Error in createSession for session_id ${session.session_id}:`, error)
      throw error
    }
  }

  static async updateSession(session: Session): Promise<Session | null> {
    try {
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
    } catch (error) {
      console.error(`Error in updateSession for session_id ${session.session_id}:`, error)
      throw error
    }
  }

  static async getOrCreateSession(sessionId: string, studentId?: string, startTime?: Date): Promise<Session> {
    try {
      // Check if session exists
      const existingSession = await SessionModel.findById(sessionId)
      if (existingSession) {
        return existingSession
      }

      // Create new session if it doesn't exist
      const newSession: Session = {
        session_id: sessionId,
        student_id: studentId,
        start_time: startTime || new Date(),
      }

      return await this.createSession(newSession)
    } catch (error) {
      console.error(`Error in getOrCreateSession for session_id ${sessionId}:`, error)
      throw error
    }
  }

  static async getSessionsByStudentId(studentId: string): Promise<Session[]> {
    return SessionModel.findByStudentId(studentId)
  }

  static async getSessions(): Promise<Session[]> {
    const sessions = await SessionModel.findAll()
    return Array.isArray(sessions) ? sessions : ([sessions].filter((s): s is Session => s !== null))
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

