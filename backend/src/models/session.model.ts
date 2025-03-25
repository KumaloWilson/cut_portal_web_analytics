import { pool } from "./database"

export interface Session {
  id?: number
  session_id: string
  student_id?: string
  start_time: Date
  end_time?: Date
  total_time_spent?: number
  pages_visited?: number
  user_agent?: string
  created_at?: Date
}

export class SessionModel {
  static async findById(sessionId: string): Promise<Session | null> {
    try {
      const result = await pool.query("SELECT * FROM sessions WHERE session_id = $1", [sessionId])
      return result?.rows && result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error(`Error in findById for session_id ${sessionId}:`, error)
      throw error
    }
  }

  static async findByStudentId(studentId: string): Promise<Session[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM sessions 
         WHERE student_id = $1 
         ORDER BY start_time DESC`,
        [studentId],
      )
      return result.rows
    } catch (error) {
      console.error(`Error in findByStudentId for student_id ${studentId}:`, error)
      throw error
    }
  }

  static async create(session: Session): Promise<Session> {
    try {
      // Check if session already exists
      const existingSession = await this.findById(session.session_id)
      if (existingSession) {
        // If session exists, update it instead
        const updatedSession = await this.update({
          ...session,
          // Keep existing values if not provided in the update
          end_time: session.end_time || existingSession.end_time,
          total_time_spent: session.total_time_spent || existingSession.total_time_spent,
          pages_visited: session.pages_visited || existingSession.pages_visited,
        })
        if (!updatedSession) {
          throw new Error(`Failed to update session ${session.session_id}`)
        }
        return updatedSession
      }

      const { session_id, student_id, start_time, user_agent } = session

      const result = await pool.query(
        `INSERT INTO sessions 
         (session_id, student_id, start_time, user_agent) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (session_id) DO UPDATE
         SET student_id = EXCLUDED.student_id,
             start_time = EXCLUDED.start_time,
             user_agent = EXCLUDED.user_agent
         RETURNING *`,
        [session_id, student_id, start_time, user_agent],
      )

      return result.rows[0]
    } catch (error) {
      console.error(`Error in create for session_id ${session.session_id}:`, error)
      throw error
    }
  }

  static async update(session: Session): Promise<Session | null> {
    try {
      const { session_id, end_time, total_time_spent, pages_visited } = session

      const result = await pool.query(
        `UPDATE sessions 
         SET end_time = $1, 
             total_time_spent = $2, 
             pages_visited = $3 
         WHERE session_id = $4 
         RETURNING *`,
        [end_time, total_time_spent, pages_visited, session_id],
      )

      return result?.rows && result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error(`Error in update for session_id ${session.session_id}:`, error)
      throw error
    }
  }

  static async getSessionCount(): Promise<number> {
    try {
      const result = await pool.query("SELECT COUNT(*) FROM sessions")
      return Number.parseInt(result.rows[0].count)
    } catch (error) {
      console.error("Error in getSessionCount:", error)
      throw error
    }
  }

  static async getAverageSessionTime(): Promise<number> {
    try {
      const result = await pool.query("SELECT AVG(total_time_spent) FROM sessions WHERE total_time_spent IS NOT NULL")
      return Number.parseFloat(result.rows[0].avg || 0)
    } catch (error) {
      console.error("Error in getAverageSessionTime:", error)
      throw error
    }
  }

  static async getActiveSessionsCount(): Promise<number> {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM sessions 
         WHERE end_time IS NULL 
         AND start_time > NOW() - INTERVAL '30 minutes'`,
      )
      return Number.parseInt(result.rows[0].count)
    } catch (error) {
      console.error("Error in getActiveSessionsCount:", error)
      throw error
    }
  }

  static async getActiveSessions(): Promise<Session[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM sessions 
         WHERE end_time IS NULL 
         AND start_time > NOW() - INTERVAL '30 minutes'
         ORDER BY start_time DESC`,
      )
      return result.rows
    } catch (error) {
      console.error("Error in getActiveSessions:", error)
      throw error
    }
  }
}

