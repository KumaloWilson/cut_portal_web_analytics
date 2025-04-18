import { pool } from "./database"

export interface Event {
  id?: number
  event_type: string
  session_id: string
  student_id?: string
  url: string
  path: string
  page_title?: string
  timestamp: Date
  details?: Record<string, any>
  created_at?: Date
}

export class EventModel {
  static async create(event: Event): Promise<Event> {
    try {
      const { event_type, session_id, student_id, url, path, page_title, timestamp, details } = event

      const result = await pool.query(
        `INSERT INTO events 
         (event_type, session_id, student_id, url, path, page_title, timestamp, details) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [event_type, session_id, student_id, url, path, page_title, timestamp, details],
      )

      return result.rows[0]
    } catch (error) {
      // If it's a foreign key violation, we'll handle it at the service level
      if ((error as { code: string; constraint: string }).code === "23503" && 
          (error as { code: string; constraint: string }).constraint === "events_session_id_fkey") {
        throw new Error(`Session with ID ${event.session_id} does not exist`)
      }
      console.error(`Error in create for event:`, error)
      throw error
    }
  }

  static async findBySessionId(sessionId: string): Promise<Event[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM events 
         WHERE session_id = $1 
         ORDER BY timestamp ASC`,
        [sessionId],
      )

      return result.rows
    } catch (error) {
      console.error(`Error in findBySessionId for session_id ${sessionId}:`, error)
      throw error
    }
  }

  static async findByStudentId(studentId: string, limit = 100, offset = 0): Promise<Event[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM events 
         WHERE student_id = $1 
         ORDER BY timestamp DESC
         LIMIT $2 OFFSET $3`,
        [studentId, limit, offset],
      )

      return result.rows
    } catch (error) {
      console.error(`Error in findByStudentId for student_id ${studentId}:`, error)
      throw error
    }
  }

  static async getEvents(limit = 100, offset = 0): Promise<Event[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM events 
         ORDER BY timestamp DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      )

      return result.rows
    } catch (error) {
      console.error(`Error in getEvents:`, error)
      throw error
    }
  }

  static async bulkCreate(events: Event[]): Promise<number> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      let successCount = 0
      for (const event of events) {
        try {
          await client.query(
            `INSERT INTO events 
             (event_type, session_id, student_id, url, path, page_title, timestamp, details) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              event.event_type,
              event.session_id,
              event.student_id,
              event.url,
              event.path,
              event.page_title,
              event.timestamp,
              event.details,
            ],
          )
          successCount++
        } catch (error) {
          console.error(`Error inserting event in bulkCreate: ${error instanceof Error ? error.message : 'Unknown error'}`)
          // Continue with other events even if one fails
        }
      }

      await client.query("COMMIT")
      return successCount
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("Error in bulkCreate:", error)
      throw error
    } finally {
      client.release()
    }
  }

  static async getEventCount(): Promise<number> {
    try {
      const result = await pool.query("SELECT COUNT(*) FROM events")
      return Number.parseInt(result.rows[0].count)
    } catch (error) {
      console.error("Error in getEventCount:", error)
      throw error
    }
  }

  static async getEventsByTimeOfDay(): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT EXTRACT(HOUR FROM timestamp) as hour,
                COUNT(*) as event_count
         FROM events
         GROUP BY hour
         ORDER BY hour`,
      )

      return result.rows
    } catch (error) {
      console.error("Error in getEventsByTimeOfDay:", error)
      throw error
    }
  }

  static async getRecentEventsCount(minutes: number): Promise<number> {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM events 
         WHERE timestamp > NOW() - INTERVAL '${minutes} minutes'`,
      )
      return Number.parseInt(result.rows[0].count)
    } catch (error) {
      console.error(`Error in getRecentEventsCount for minutes ${minutes}:`, error)
      throw error
    }
  }

  static async getRecentPageViewsCount(minutes: number): Promise<number> {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM events 
         WHERE event_type = 'page_view' 
         AND timestamp > NOW() - INTERVAL '${minutes} minutes'`,
      )
      return Number.parseInt(result.rows[0].count)
    } catch (error) {
      console.error(`Error in getRecentPageViewsCount for minutes ${minutes}:`, error)
      throw error
    }
  }

  static async getRecentEvents(minutes: number, limit = 100): Promise<Event[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM events 
         WHERE timestamp > NOW() - INTERVAL '${minutes} minutes'
         ORDER BY timestamp DESC
         LIMIT $1`,
        [limit],
      )
      return result.rows
    } catch (error) {
      console.error(`Error in getRecentEvents for minutes ${minutes}:`, error)
      throw error
    }
  }
}
