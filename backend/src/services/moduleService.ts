import { query, transaction } from "../configs/postgres";

export class ModuleService {
  // Get modules with pagination and filtering
  async getModules(page: number, limit: number, filters: any): Promise<{ modules: any[]; total: number }> {
    let queryText = "SELECT * FROM modules"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.search) {
      conditions.push(`(
        module_id ILIKE $${paramIndex} OR 
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${filters.search}%`)
      paramIndex++
    }

    if (filters.facultyCode) {
      conditions.push(`faculty_code = $${paramIndex++}`)
      queryParams.push(filters.facultyCode)
    }

    if (filters.programCode) {
      conditions.push(`program_code = $${paramIndex++}`)
      queryParams.push(filters.programCode)
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
      modules: result.rows,
      total,
    }
  }

  // Get a module by ID
  async getModuleById(moduleId: string): Promise<any> {
    const result = await query("SELECT * FROM modules WHERE module_id = $1", [moduleId])

    return result.rows[0]
  }

  // Create a module
  async createModule(module: any): Promise<any> {
    const result = await query(
      `INSERT INTO modules (
        module_id, module_code, title, description, instructor_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [
        module.module_id,
        module.module_code,
        module.title,
        module.description,
        module.instructor_id,
        module.metadata || {},
      ],
    )

    return result.rows[0]
  }

  // Update a module
  async updateModule(moduleId: string, moduleData: any): Promise<any> {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (moduleData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(moduleData.title)
    }

    if (moduleData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(moduleData.description)
    }

    if (moduleData.instructor_id !== undefined) {
      updates.push(`instructor_id = $${paramIndex++}`)
      values.push(moduleData.instructor_id)
    }

    if (moduleData.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      values.push(moduleData.metadata)
    }

    // If no updates, return the existing module
    if (updates.length === 0) {
      return this.getModuleById(moduleId)
    }

    // Add the moduleId to the values array
    values.push(moduleId)

    const result = await query(
      `UPDATE modules SET ${updates.join(", ")} WHERE module_id = $${paramIndex} RETURNING *`,
      values,
    )

    return result.rows[0]
  }

  // Delete a module
  async deleteModule(moduleId: string): Promise<boolean> {
    const result = await query("DELETE FROM modules WHERE module_id = $1 RETURNING *", [moduleId])

    return result.rows.length > 0
  }

  // Get module activity
  async getModuleActivity(moduleId: string, days: number): Promise<any> {
    const result = await query("", []) // TODO: Implement this function
    return result.rows
  }

  // Get module users
  async getModuleUsers(
    moduleId: string,
    page: number,
    limit: number,
    filters: any,
  ): Promise<{ users: any[]; total: number }> {
    const result = await query("", []) // TODO: Implement this function
    return { users: [], total: 0 }
  }

  // Get module resources
  async getModuleResources(moduleId: string): Promise<any[]> {
    const result = await query("SELECT * FROM resources WHERE module_id = $1 ORDER BY created_at DESC", [moduleId])

    return result.rows
  }

  // Get module quizzes
  async getModuleQuizzes(moduleId: string): Promise<any[]> {
    const result = await query("SELECT * FROM quizzes WHERE module_id = $1 ORDER BY created_at DESC", [moduleId])

    return result.rows
  }

  // Get module past exam papers
  async getModulePastExamPapers(moduleId: string): Promise<any[]> {
    const result = await query("SELECT * FROM past_exam_papers WHERE module_id = $1 ORDER BY created_at DESC", [
      moduleId,
    ])

    return result.rows
  }
}

