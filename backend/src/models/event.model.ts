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
    const { event_type, session_id, student_id, url, path, page_title, timestamp, details } = event

    const result = await pool.query(
      `INSERT INTO events 
       (event_type, session_id, student_id, url, path, page_title, timestamp, details) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [event_type, session_id, student_id, url, path, page_title, timestamp, details],
    )

    return result.rows[0]
  }

  static async findBySessionId(sessionId: string): Promise<Event[]> {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE session_id = $1 
       ORDER BY timestamp ASC`,
      [sessionId],
    )

    return result.rows
  }

  static async findByStudentId(studentId: string, limit = 100, offset = 0): Promise<Event[]> {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE student_id = $1 
       ORDER BY timestamp DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset],
    )

    return result.rows
  }

  static async bulkCreate(events: Event[]): Promise<number> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      for (const event of events) {
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
      }

      await client.query("COMMIT")
      return events.length
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  static async getEventCount(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) FROM events")
    return Number.parseInt(result.rows[0].count)
  }

  static async getEventsByTimeOfDay(): Promise<any[]> {
    const result = await pool.query(
      `SELECT EXTRACT(HOUR FROM timestamp) as hour,
              COUNT(*) as event_count
       FROM events
       GROUP BY hour
       ORDER BY hour`,
    )

    return result.rows
  }

  static async getRecentEventsCount(minutes: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM events 
       WHERE timestamp > NOW() - INTERVAL '${minutes} minutes'`,
    )
    return Number.parseInt(result.rows[0].count)
  }

  static async getRecentPageViewsCount(minutes: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM events 
       WHERE event_type = 'page_view' 
       AND timestamp > NOW() - INTERVAL '${minutes} minutes'`,
    )
    return Number.parseInt(result.rows[0].count)
  }

  static async getRecentEvents(minutes: number, limit = 100): Promise<Event[]> {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE timestamp > NOW() - INTERVAL '${minutes} minutes'
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit],
    )
    return result.rows
  }
}

