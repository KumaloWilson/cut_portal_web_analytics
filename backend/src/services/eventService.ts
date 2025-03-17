import { query } from "../configs/postgres"
import { transaction } from "../configs/postgres"
import type { TrackingEvent } from "../types/events"

export class EventService {
  // Create a single event
  async createEvent(event: TrackingEvent): Promise<any> {
    return transaction(async (client) => {
      // First, ensure the user exists
      if (event.userId) {
        await this.ensureUserExists(event.userId, client)
      }

      // Then, ensure the session exists
      if (event.sessionId) {
        await this.ensureSessionExists(event.sessionId, event.userId, event.deviceInfo, event.browserInfo, client)
      }

      // If this is a resource access event, ensure the resource exists
      if (event.eventType === "resource_access" && event.details?.resourceId) {
        await this.ensureResourceExists(
          event.details.resourceId,
          event.details.resourceTitle,
          event.details.resourceType,
          event.details.courseId,
          client,
        )
      }

      // If this is a quiz attempt event, ensure the quiz exists
      if (event.eventType === "quiz_attempt" && event.details?.quizId) {
        await this.ensureQuizExists(event.details.quizId, event.details.quizTitle, event.details.courseId, client)
      }

      // Insert the event
      const result = await client.query(
        `INSERT INTO events (
          event_type, user_id, url, path, details, timestamp, 
          session_id, device_info, browser_info, ip_address, 
          referrer, duration
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING *`,
        [
          event.eventType,
          event.userId,
          event.url,
          event.path,
          event.details,
          event.timestamp,
          event.sessionId,
          event.deviceInfo,
          event.browserInfo,
          event.ipAddress,
          event.referrer,
          event.duration,
        ],
      )

      return result.rows[0]
    })
  }

  // Ensure user exists in the database
  private async ensureUserExists(userId: string, client: any): Promise<void> {
    // Check if user exists
    const existingUser = await client.query("SELECT user_id FROM users WHERE user_id = $1", [userId])

    if (existingUser.rows.length === 0) {
      // Create new user
      await client.query("INSERT INTO users (user_id, last_active_at) VALUES ($1, $2)", [userId, new Date()])
    } else {
      // Update last active time
      await client.query("UPDATE users SET last_active_at = $1 WHERE user_id = $2", [new Date(), userId])
    }
  }

  // Ensure session exists in the database
  private async ensureSessionExists(
    sessionId: string,
    userId: string | null,
    deviceInfo?: any,
    browserInfo?: any,
    client?: any,
  ): Promise<void> {
    // Check if session exists
    const existingSession = await client.query("SELECT session_id FROM sessions WHERE session_id = $1", [sessionId])

    if (existingSession.rows.length === 0) {
      // Create new session
      await client.query(
        `INSERT INTO sessions (
          session_id, user_id, start_time, device_info, browser_info
        ) VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, userId, new Date(), deviceInfo, browserInfo],
      )
    }
  }

  // Ensure resource exists in the database
  private async ensureResourceExists(
    resourceId: string,
    title: string,
    type: string,
    courseId?: string,
    client?: any,
  ): Promise<void> {
    // Check if resource exists
    const existingResource = await client.query("SELECT resource_id FROM resources WHERE resource_id = $1", [
      resourceId,
    ])

    if (existingResource.rows.length === 0) {
      // Create new resource
      await client.query(
        `INSERT INTO resources (
          resource_id, title, type, course_id, url
        ) VALUES ($1, $2, $3, $4, $5)`,
        [resourceId, title || resourceId, type || "unknown", courseId, resourceId],
      )
    }

    // Record resource interaction
    await client.query(
      `INSERT INTO resource_interactions (
        resource_id, user_id, interaction_type, timestamp
      ) VALUES ($1, $2, $3, $4)`,
      [resourceId, null, "access", new Date()],
    )
  }

  // Ensure quiz exists in the database
  private async ensureQuizExists(quizId: string, title: string, courseId?: string, client?: any): Promise<void> {
    // Check if quiz exists
    const existingQuiz = await client.query("SELECT quiz_id FROM quizzes WHERE quiz_id = $1", [quizId])

    if (existingQuiz.rows.length === 0) {
      // Create new quiz
      await client.query(
        `INSERT INTO quizzes (
          quiz_id, title, course_id, description
        ) VALUES ($1, $2, $3, $4)`,
        [quizId, title || quizId, courseId, ""],
      )
    }
  }

  // Create multiple events in batch
  async createBatchEvents(events: TrackingEvent[]): Promise<any> {
    return transaction(async (client) => {
      const results = []

      // Process each event
      for (const event of events) {
        // Ensure related entities exist
        if (event.userId) {
          await this.ensureUserExists(event.userId, client)
        }

        if (event.sessionId) {
          await this.ensureSessionExists(event.sessionId, event.userId, event.deviceInfo, event.browserInfo, client)
        }

        if (event.eventType === "resource_access" && event.details?.resourceId) {
          await this.ensureResourceExists(
            event.details.resourceId,
            event.details.resourceTitle,
            event.details.resourceType,
            event.details.courseId,
            client,
          )
        }

        if (event.eventType === "quiz_attempt" && event.details?.quizId) {
          await this.ensureQuizExists(event.details.quizId, event.details.quizTitle, event.details.courseId, client)
        }

        // Insert the event
        const result = await client.query(
          `INSERT INTO events (
            event_type, user_id, url, path, details, timestamp, 
            session_id, device_info, browser_info, ip_address, 
            referrer, duration
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
          RETURNING *`,
          [
            event.eventType,
            event.userId,
            event.url,
            event.path,
            event.details,
            event.timestamp,
            event.sessionId,
            event.deviceInfo,
            event.browserInfo,
            event.ipAddress,
            event.referrer,
            event.duration,
          ],
        )

        results.push(result.rows[0])
      }

      return results
    })
  }

  // Get events with pagination and filtering
  async getEvents(page: number, limit: number, filters: any): Promise<{ events: any[]; total: number }> {
    let queryText = "SELECT * FROM events"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`)
      queryParams.push(filters.startDate)
    }

    if (filters.endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`)
      queryParams.push(filters.endDate)
    }

    if (filters.eventType) {
      conditions.push(`event_type = $${paramIndex++}`)
      queryParams.push(filters.eventType)
    }

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`)
      queryParams.push(filters.userId)
    }

    if (filters.sessionId) {
      conditions.push(`session_id = $${paramIndex++}`)
      queryParams.push(filters.sessionId)
    }

    if (filters.path) {
      conditions.push(`path ILIKE $${paramIndex++}`)
      queryParams.push(`%${filters.path}%`)
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ")
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) AS count_query`, queryParams)
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Apply pagination
    const offset = (page - 1) * limit
    queryText += ` ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    queryParams.push(limit, offset)

    // Execute the query
    const result = await query(queryText, queryParams)

    return {
      events: result.rows,
      total,
    }
  }

  // Get events by user ID
  async getEventsByUser(userId: string, page: number, limit: number): Promise<{ events: any[]; total: number }> {
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query("SELECT COUNT(*) FROM events WHERE user_id = $1", [userId])
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Get events with pagination
    const result = await query("SELECT * FROM events WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3", [
      userId,
      limit,
      offset,
    ])

    return {
      events: result.rows,
      total,
    }
  }

  // Get events by type
  async getEventsByType(eventType: string, page: number, limit: number): Promise<{ events: any[]; total: number }> {
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query("SELECT COUNT(*) FROM events WHERE event_type = $1", [eventType])
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Get events with pagination
    const result = await query(
      "SELECT * FROM events WHERE event_type = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3",
      [eventType, limit, offset],
    )

    return {
      events: result.rows,
      total,
    }
  }

  // Get event count by type
  async getEventCountByType(eventType: string, startDate?: Date, endDate?: Date): Promise<number> {
    let queryText = "SELECT COUNT(*) FROM events"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    if (eventType) {
      conditions.push(`event_type = $${paramIndex++}`)
      queryParams.push(eventType)
    }

    if (startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`)
      queryParams.push(startDate)
    }

    if (endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`)
      queryParams.push(endDate)
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ")
    }

    const result = await query(queryText, queryParams)
    return Number.parseInt(result.rows[0].count, 10)
  }

  // Get events by date range
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await query(
      "SELECT * FROM events WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC",
      [startDate, endDate],
    )

    return result.rows
  }
}

