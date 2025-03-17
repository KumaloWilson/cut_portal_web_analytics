import { query } from "../configs/postgres";

export class CourseService {
  // Get courses with pagination and filtering
  async getCourses(page: number, limit: number, filters: any): Promise<{ courses: any[]; total: number }> {
    let queryText = "SELECT * FROM courses"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.search) {
      conditions.push(`(
        course_id ILIKE $${paramIndex} OR 
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${filters.search}%`)
      paramIndex++
    }

    if (filters.instructorId) {
      conditions.push(`instructor_id = $${paramIndex++}`)
      queryParams.push(filters.instructorId)
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
      courses: result.rows,
      total,
    }
  }

  // Get a course by ID
  async getCourseById(courseId: string): Promise<any> {
    const result = await query("SELECT * FROM courses WHERE course_id = $1", [courseId])

    return result.rows[0]
  }

  // Create a course
  async createCourse(course: any): Promise<any> {
    const result = await query(
      `INSERT INTO courses (
        course_id, title, description, instructor_id, metadata
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [course.course_id, course.title, course.description, course.instructor_id, course.metadata || {}],
    )

    return result.rows[0]
  }

  // Update a course
  async updateCourse(courseId: string, courseData: any): Promise<any> {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (courseData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(courseData.title)
    }

    if (courseData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(courseData.description)
    }

    if (courseData.instructor_id !== undefined) {
      updates.push(`instructor_id = $${paramIndex++}`)
      values.push(courseData.instructor_id)
    }

    if (courseData.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      values.push(courseData.metadata)
    }

    // If no updates, return the existing course
    if (updates.length === 0) {
      return this.getCourseById(courseId)
    }

    // Add the courseId to the values array
    values.push(courseId)

    const result = await query(
      `UPDATE courses SET ${updates.join(", ")} WHERE course_id = $${paramIndex} RETURNING *`,
      values,
    )

    return result.rows[0]
  }

  // Delete a course
  async deleteCourse(courseId: string): Promise<boolean> {
    const result = await query("DELETE FROM courses WHERE course_id = $1 RETURNING *", [courseId])

    return result.rows.length > 0
  }

  // Get course activity
  async getCourseActivity(courseId: string, days: number): Promise<any> {
    const result = await query("SELECT * FROM get_course_activity_stats($1, $2)", [courseId, days])

    return result.rows
  }

  // Get course users
  async getCourseUsers(
    courseId: string,
    page: number,
    limit: number,
    filters: any,
  ): Promise<{ users: any[]; total: number }> {
    let queryText = `
      SELECT 
        ce.role,
        ce.enrolled_at,
        ce.last_accessed_at,
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role as user_role,
        u.last_active_at
      FROM course_enrollments ce
      JOIN users u ON ce.user_id = u.user_id
      WHERE ce.course_id = $1
    `

    const queryParams: any[] = [courseId]
    let paramIndex = 2

    // Apply filters
    if (filters.role) {
      queryText += ` AND ce.role = $${paramIndex++}`
      queryParams.push(filters.role)
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) AS count_query`, queryParams)
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Apply pagination
    const offset = (page - 1) * limit
    queryText += ` ORDER BY ce.enrolled_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    queryParams.push(limit, offset)

    // Execute the query
    const result = await query(queryText, queryParams)

    // Format the results
    const users = result.rows.map((row: { role: any; enrolled_at: any; last_accessed_at: any; user_id: any; first_name: any; last_name: any; email: any; user_role: any; last_active_at: any; }) => ({
      role: row.role,
      enrolled_at: row.enrolled_at,
      last_accessed_at: row.last_accessed_at,
      users: {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        role: row.user_role,
        last_active_at: row.last_active_at,
      },
    }))

    return {
      users,
      total,
    }
  }

  // Get course resources
  async getCourseResources(courseId: string): Promise<any[]> {
    const result = await query("SELECT * FROM resources WHERE course_id = $1 ORDER BY created_at DESC", [courseId])

    return result.rows
  }

  // Get course quizzes
  async getCourseQuizzes(courseId: string): Promise<any[]> {
    const result = await query("SELECT * FROM quizzes WHERE course_id = $1 ORDER BY created_at DESC", [courseId])

    return result.rows
  }
}

