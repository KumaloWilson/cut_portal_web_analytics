import { query } from "../configs/postgres";

export class UserService {
  // Get users with pagination and filtering
  async getUsers(page: number, limit: number, filters: any): Promise<{ users: any[]; total: number }> {
    let queryText = "SELECT * FROM users"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.search) {
      conditions.push(`(
        user_id ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${filters.search}%`)
      paramIndex++
    }

    if (filters.role) {
      conditions.push(`role = $${paramIndex++}`)
      queryParams.push(filters.role)
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
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    queryParams.push(limit, offset)

    // Execute the query
    const result = await query(queryText, queryParams)

    return {
      users: result.rows,
      total,
    }
  }

  // Get a user by ID
  async getUserById(userId: string): Promise<any> {
    const result = await query("SELECT * FROM users WHERE user_id = $1", [userId])

    return result.rows[0]
  }

  // Create a user
  async createUser(user: any): Promise<any> {
    const result = await query(
      `INSERT INTO users (
        user_id, email, first_name, last_name, role, last_active_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        user.user_id,
        user.email,
        user.first_name,
        user.last_name,
        user.role,
        user.last_active_at || new Date(),
        user.metadata || {},
      ],
    )

    return result.rows[0]
  }

  // Update a user
  async updateUser(userId: string, userData: any): Promise<any> {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (userData.email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      values.push(userData.email)
    }

    if (userData.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`)
      values.push(userData.first_name)
    }

    if (userData.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`)
      values.push(userData.last_name)
    }

    if (userData.role !== undefined) {
      updates.push(`role = $${paramIndex++}`)
      values.push(userData.role)
    }

    if (userData.last_active_at !== undefined) {
      updates.push(`last_active_at = $${paramIndex++}`)
      values.push(userData.last_active_at)
    }

    if (userData.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      values.push(userData.metadata)
    }

    // If no updates, return the existing user
    if (updates.length === 0) {
      return this.getUserById(userId)
    }

    // Add the userId to the values array
    values.push(userId)

    const result = await query(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = $${paramIndex} RETURNING *`,
      values,
    )

    return result.rows[0]
  }

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    const result = await query("DELETE FROM users WHERE user_id = $1 RETURNING *", [userId])

    return result.rows.length > 0
  }

  // Get user activity
  async getUserActivity(userId: string, days: number): Promise<any> {
    const result = await query("SELECT * FROM get_user_activity_stats($1, $2)", [userId, days])

    return result.rows
  }

  // Get user courses
  async getUserCourses(userId: string): Promise<any[]> {
    const result = await query(
      `
      SELECT 
        ce.role,
        ce.enrolled_at,
        ce.last_accessed_at,
        c.course_id,
        c.title,
        c.description,
        c.instructor_id,
        c.created_at,
        c.metadata
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.course_id
      WHERE ce.user_id = $1
    `,
      [userId],
    )

    return result.rows.map((row: { role: any; enrolled_at: any; last_accessed_at: any; course_id: any; title: any; description: any; instructor_id: any; created_at: any; metadata: any; }) => ({
      role: row.role,
      enrolled_at: row.enrolled_at,
      last_accessed_at: row.last_accessed_at,
      courses: {
        course_id: row.course_id,
        title: row.title,
        description: row.description,
        instructor_id: row.instructor_id,
        created_at: row.created_at,
        metadata: row.metadata,
      },
    }))
  }
}

