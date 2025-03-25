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
    const result = await pool.query("SELECT * FROM sessions WHERE session_id = $1", [sessionId])


    return result?.rows && result.rows.length > 0 ? result.rows[0] : null
  }

  static async findByStudentId(studentId: string): Promise<Session[]> {
    const result = await pool.query(
      `SELECT * FROM sessions 
       WHERE student_id = $1 
       ORDER BY start_time DESC`,
      [studentId],
    )

    return result.rows
  }

  static async create(session: Session): Promise<Session> {
    const { session_id, student_id, start_time, user_agent } = session

    const result = await pool.query(
      `INSERT INTO sessions 
       (session_id, student_id, start_time, user_agent) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [session_id, student_id, start_time, user_agent],
    )

    return result.rows[0]
  }

  static async update(session: Session): Promise<Session | null> {
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

  }

  static async getSessionCount(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) FROM sessions")
    return Number.parseInt(result.rows[0].count)
  }

  static async getAverageSessionTime(): Promise<number> {
    const result = await pool.query("SELECT AVG(total_time_spent) FROM sessions WHERE total_time_spent IS NOT NULL")
    return Number.parseFloat(result.rows[0].avg || 0)
  }

  static async getActiveSessionsCount(): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM sessions 
       WHERE end_time IS NULL 
       AND start_time > NOW() - INTERVAL '30 minutes'`,
    )
    return Number.parseInt(result.rows[0].count)
  }

  static async getActiveSessions(): Promise<Session[]> {
    const result = await pool.query(
      `SELECT * FROM sessions 
       WHERE end_time IS NULL 
       AND start_time > NOW() - INTERVAL '30 minutes'
       ORDER BY start_time DESC`,
    )
    return result.rows
  }
}

