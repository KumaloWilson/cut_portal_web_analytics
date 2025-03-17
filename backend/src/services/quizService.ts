import { query } from "../db/postgres"

export class QuizService {
  // Get quizzes with pagination and filtering
  async getQuizzes(page: number, limit: number, filters: any): Promise<{ quizzes: any[]; total: number }> {
    let queryText = "SELECT * FROM quizzes"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.courseId) {
      conditions.push(`course_id = $${paramIndex++}`)
      queryParams.push(filters.courseId)
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
      quizzes: result.rows,
      total,
    }
  }

  // Get a quiz by ID
  async getQuizById(quizId: string): Promise<any> {
    const result = await query("SELECT * FROM quizzes WHERE quiz_id = $1", [quizId])

    return result.rows[0]
  }

  // Create a quiz
  async createQuiz(quiz: any): Promise<any> {
    const result = await query(
      `INSERT INTO quizzes (
        quiz_id, course_id, title, description, metadata
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [quiz.quiz_id, quiz.course_id, quiz.title, quiz.description, quiz.metadata || {}],
    )

    return result.rows[0]
  }

  // Update a quiz
  async updateQuiz(quizId: string, quizData: any): Promise<any> {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (quizData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(quizData.title)
    }

    if (quizData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(quizData.description)
    }

    if (quizData.course_id !== undefined) {
      updates.push(`course_id = $${paramIndex++}`)
      values.push(quizData.course_id)
    }

    if (quizData.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      values.push(quizData.metadata)
    }

    // If no updates, return the existing quiz
    if (updates.length === 0) {
      return this.getQuizById(quizId)
    }

    // Add the quizId to the values array
    values.push(quizId)

    const result = await query(
      `UPDATE quizzes SET ${updates.join(", ")} WHERE quiz_id = $${paramIndex} RETURNING *`,
      values,
    )

    return result.rows[0]
  }

  // Delete a quiz
  async deleteQuiz(quizId: string): Promise<boolean> {
    const result = await query("DELETE FROM quizzes WHERE quiz_id = $1 RETURNING *", [quizId])

    return result.rows.length > 0
  }

  // Get quiz attempts
  async getQuizAttempts(
    quizId: string,
    page: number,
    limit: number,
    filters: any,
  ): Promise<{ attempts: any[]; total: number }> {
    let queryText = "SELECT * FROM quiz_attempts WHERE quiz_id = $1"
    const queryParams: any[] = [quizId]
    let paramIndex = 2

    // Apply filters
    if (filters.userId) {
      queryText += ` AND user_id = $${paramIndex++}`
      queryParams.push(filters.userId)
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) AS count_query`, queryParams)
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Apply pagination
    const offset = (page - 1) * limit
    queryText += ` ORDER BY start_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    queryParams.push(limit, offset)

    // Execute the query
    const result = await query(queryText, queryParams)

    return {
      attempts: result.rows,
      total,
    }
  }

  // Create a quiz attempt
  async createQuizAttempt(attemptData: any): Promise<any> {
    const result = await query(
      `INSERT INTO quiz_attempts (
        quiz_id, user_id, start_time, end_time, score, max_score, duration, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        attemptData.quizId,
        attemptData.userId,
        attemptData.startTime || new Date(),
        attemptData.endTime,
        attemptData.score,
        attemptData.maxScore,
        attemptData.duration,
        attemptData.details || {},
      ],
    )

    return result.rows[0]
  }
}

