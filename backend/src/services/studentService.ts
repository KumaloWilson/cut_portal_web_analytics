import { query, transaction } from "../configs/postgres";

export class StudentService {
  // Get students with pagination and filtering
  async getStudents(page: number, limit: number, filters: any): Promise<{ students: any[]; total: number }> {
    let queryText = "SELECT * FROM students"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.search) {
      conditions.push(`(
        student_id ILIKE $${paramIndex} OR 
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex}
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

    if (filters.level) {
      conditions.push(`level = $${paramIndex++}`)
      queryParams.push(filters.level)
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
      students: result.rows,
      total,
    }
  }

  // Get a student by ID
  async getStudentById(studentId: string): Promise<any> {
    const result = await query("SELECT * FROM students WHERE student_id = $1", [studentId])

    return result.rows[0]
  }

  // Create a student
  async createStudent(student: any): Promise<any> {
    const result = await query(
      `INSERT INTO students (
        student_id, first_name, last_name, email, phone, national_id, date_of_birth, 
        gender, program_code, program_name, faculty_code, faculty_name, level, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *`,
      [
        student.student_id,
        student.first_name,
        student.last_name,
        student.email,
        student.phone,
        student.national_id,
        student.date_of_birth,
        student.gender,
        student.program_code,
        student.program_name,
        student.faculty_code,
        student.faculty_name,
        student.level,
        student.metadata || {},
      ],
    )

    return result.rows[0]
  }

  // Update a student
  async updateStudent(studentId: string, studentData: any): Promise<any> {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (studentData.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`)
      values.push(studentData.first_name)
    }

    if (studentData.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`)
      values.push(studentData.last_name)
    }

    if (studentData.email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      values.push(studentData.email)
    }

    if (studentData.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`)
      values.push(studentData.phone)
    }

    if (studentData.national_id !== undefined) {
      updates.push(`national_id = $${paramIndex++}`)
      values.push(studentData.national_id)
    }

    if (studentData.date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramIndex++}`)
      values.push(studentData.date_of_birth)
    }

    if (studentData.gender !== undefined) {
      updates.push(`gender = $${paramIndex++}`)
      values.push(studentData.gender)
    }

    if (studentData.program_code !== undefined) {
      updates.push(`program_code = $${paramIndex++}`)
      values.push(studentData.program_code)
    }

    if (studentData.program_name !== undefined) {
      updates.push(`program_name = $${paramIndex++}`)
      values.push(studentData.program_name)
    }

    if (studentData.faculty_code !== undefined) {
      updates.push(`faculty_code = $${paramIndex++}`)
      values.push(studentData.faculty_code)
    }

    if (studentData.faculty_name !== undefined) {
      updates.push(`faculty_name = $${paramIndex++}`)
      values.push(studentData.faculty_name)
    }

    if (studentData.level !== undefined) {
      updates.push(`level = $${paramIndex++}`)
      values.push(studentData.level)
    }

    if (studentData.last_active_at !== undefined) {
      updates.push(`last_active_at = $${paramIndex++}`)
      values.push(studentData.last_active_at)
    }

    if (studentData.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      values.push(studentData.metadata)
    }

    // If no updates, return the existing student
    if (updates.length === 0) {
      return this.getStudentById(studentId)
    }

    // Add the studentId to the values array
    values.push(studentId)

    const result = await query(
      `UPDATE students SET ${updates.join(", ")} WHERE student_id = $${paramIndex} RETURNING *`,
      values,
    )

    return result.rows[0]
  }

  // Delete a student
  async deleteStudent(studentId: string): Promise<boolean> {
    const result = await query("DELETE FROM students WHERE student_id = $1 RETURNING *", [studentId])

    return result.rows.length > 0
  }

  // Get student activity
  async getStudentActivity(studentId: string, days: number): Promise<any> {
    // Get all events for the student in the specified time period
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const eventsResult = await query(
      `SELECT * FROM events 
       WHERE student_id = $1 
       AND timestamp >= $2 
       ORDER BY timestamp DESC`,
      [studentId, startDate],
    )

    // Count events by type
    const eventCounts: Record<string, number> = {}
    eventsResult.rows.forEach((event: { event_type: any; }) => {
      const eventType = event.event_type
      eventCounts[eventType] = (eventCounts[eventType] || 0) + 1
    })

    // Group events by day
    const eventsByDay: Record<string, number> = {}
    eventsResult.rows.forEach((event: { timestamp: string | number | Date; }) => {
      const day = new Date(event.timestamp).toISOString().split("T")[0]
      eventsByDay[day] = (eventsByDay[day] || 0) + 1
    })

    // Calculate time spent
    let totalTimeSpent = 0
    eventsResult.rows.forEach((event: { duration: number; }) => {
      if (event.duration) {
        totalTimeSpent += event.duration
      }
    })

    // Get module views
    const moduleViewsResult = await query(
      `SELECT COUNT(*) FROM events 
       WHERE student_id = $1 
       AND event_type = 'module_list_view' 
       AND timestamp >= $2`,
      [studentId, startDate],
    )
    const moduleViews = Number.parseInt(moduleViewsResult.rows[0].count, 10)

    // Get resource accesses
    const resourceAccessesResult = await query(
      `SELECT COUNT(*) FROM events 
       WHERE student_id = $1 
       AND event_type = 'resource_access' 
       AND timestamp >= $2`,
      [studentId, startDate],
    )
    const resourceAccesses = Number.parseInt(resourceAccessesResult.rows[0].count, 10)

    // Get past exam paper accesses
    const pastExamAccessesResult = await query(
      `SELECT COUNT(*) FROM events 
       WHERE student_id = $1 
       AND event_type = 'past_exam_access' 
       AND timestamp >= $2`,
      [studentId, startDate],
    )
    const pastExamAccesses = Number.parseInt(pastExamAccessesResult.rows[0].count, 10)

    return {
      totalEvents: eventsResult.rows.length,
      eventCounts,
      eventsByDay,
      totalTimeSpent,
      totalTimeSpentMinutes: Math.round(totalTimeSpent / 60000), // Convert to minutes
      moduleViews,
      resourceAccesses,
      pastExamAccesses,
    }
  }

  // Get student modules
  async getStudentModules(studentId: string): Promise<any[]> {
    const result = await query(
      `SELECT 
         me.role,
         me.enrolled_at,
         me.last_accessed_at,
         m.module_id,
         m.module_code,
         m.title,
         m.description,
         m.instructor_id,
         m.created_at,
         m.metadata
       FROM module_enrollments me
       JOIN modules m ON me.module_id = m.module_id
       WHERE me.student_id = $1`,
      [studentId],
    )

    return result.rows
  }

  // Update student modules
  async updateStudentModules(studentId: string, modules: any[]): Promise<any> {
    return transaction(async (client: { query: (arg0: string, arg1: any[]) => any; }) => {
      // First, check if the student exists
      const studentResult = await client.query("SELECT * FROM students WHERE student_id = $1", [studentId])

      if (studentResult.rows.length === 0) {
        throw new Error(`Student with ID ${studentId} not found`)
      }

      // Process each module
      for (const moduleData of modules) {
        // Check if module exists
        let moduleResult = await client.query("SELECT * FROM modules WHERE module_id = $1", [moduleData.module_id])

        // If module doesn't exist, create it
        if (moduleResult.rows.length === 0) {
          moduleResult = await client.query(
            `INSERT INTO modules (
              module_id, module_code, title, description, metadata
            ) VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [moduleData.module_id, moduleData.module_code, moduleData.module_name, "", moduleData],
          )
        }

        // Check if enrollment exists
        const enrollmentResult = await client.query(
          "SELECT * FROM module_enrollments WHERE module_id = $1 AND student_id = $2",
          [moduleData.module_id, studentId],
        )

        // If enrollment doesn't exist, create it
        if (enrollmentResult.rows.length === 0) {
          await client.query(
            `INSERT INTO module_enrollments (
              module_id, student_id, role, enrolled_at
            ) VALUES ($1, $2, $3, $4)`,
            [moduleData.module_id, studentId, "student", new Date()],
          )
        }

        // Process past exam papers if available
        if (moduleData.past_exam_papers && Array.isArray(moduleData.past_exam_papers)) {
          for (const paper of moduleData.past_exam_papers) {
            // Check if paper exists
            const paperResult = await client.query("SELECT * FROM past_exam_papers WHERE paper_id = $1", [
              paper.past_exam_paper_id,
            ])

            // If paper doesn't exist, create it
            if (paperResult.rows.length === 0) {
              await client.query(
                `INSERT INTO past_exam_papers (
                  paper_id, module_id, year, description, document_path, document_size, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  paper.past_exam_paper_id,
                  moduleData.module_id,
                  paper.year,
                  paper.description,
                  paper.document_path,
                  paper.document_size,
                  paper,
                ],
              )
            }
          }
        }
      }

      // Return updated modules
      return this.getStudentModules(studentId)
    })
  }

  // Get student past exam paper accesses
  async getStudentPastExamPapers(studentId: string): Promise<any[]> {
    const result = await query(
      `SELECT 
         pea.timestamp,
         pep.paper_id,
         pep.module_id,
         pep.year,
         pep.description,
         pep.document_path,
         m.title as module_title,
         m.module_code
       FROM past_exam_accesses pea
       JOIN past_exam_papers pep ON pea.paper_id = pep.paper_id
       JOIN modules m ON pep.module_id = m.module_id
       WHERE pea.student_id = $1
       ORDER BY pea.timestamp DESC`,
      [studentId],
    )

    return result.rows
  }

  // Get student faculty statistics
  async getStudentFacultyStats(studentId: string): Promise<any> {
    // Get student's faculty
    const studentResult = await query("SELECT faculty_code, faculty_name FROM students WHERE student_id = $1", [
      studentId,
    ])

    if (studentResult.rows.length === 0) {
      throw new Error(`Student with ID ${studentId} not found`)
    }

    const facultyCode = studentResult.rows[0].faculty_code
    const facultyName = studentResult.rows[0].faculty_name

    // Get total students in the faculty
    const totalStudentsResult = await query("SELECT COUNT(*) FROM students WHERE faculty_code = $1", [facultyCode])
    const totalStudents = Number.parseInt(totalStudentsResult.rows[0].count, 10)

    // Get average activity in the faculty
    const avgActivityResult = await query(
      `SELECT 
         AVG(event_count) as avg_events,
         MAX(event_count) as max_events,
         MIN(event_count) as min_events
       FROM (
         SELECT 
           s.student_id,
           COUNT(e.id) as event_count
         FROM students s
         LEFT JOIN events e ON s.student_id = e.student_id
         WHERE s.faculty_code = $1
         GROUP BY s.student_id
       ) as student_events`,
      [facultyCode],
    )

    // Get student's activity rank in faculty
    const studentRankResult = await query(
      `SELECT student_rank
       FROM (
         SELECT 
           student_id,
           RANK() OVER (ORDER BY COUNT(e.id) DESC) as student_rank
         FROM students s
         LEFT JOIN events e ON s.student_id = e.student_id
         WHERE s.faculty_code = $1
         GROUP BY s.student_id
       ) as student_ranks
       WHERE student_id = $2`,
      [facultyCode, studentId],
    )

    return {
      facultyCode,
      facultyName,
      totalStudents,
      averageEvents: Number.parseFloat(avgActivityResult.rows[0].avg_events) || 0,
      maxEvents: Number.parseInt(avgActivityResult.rows[0].max_events, 10) || 0,
      minEvents: Number.parseInt(avgActivityResult.rows[0].min_events, 10) || 0,
      studentRank:
        studentRankResult.rows.length > 0 ? Number.parseInt(studentRankResult.rows[0].student_rank, 10) : null,
    }
  }

  // Get student program statistics
  async getStudentProgramStats(studentId: string): Promise<any> {
    // Get student's program
    const studentResult = await query("SELECT program_code, program_name, level FROM students WHERE student_id = $1", [
      studentId,
    ])

    if (studentResult.rows.length === 0) {
      throw new Error(`Student with ID ${studentId} not found`)
    }

    const programCode = studentResult.rows[0].program_code
    const programName = studentResult.rows[0].program_name
    const level = studentResult.rows[0].level

    // Get total students in the program
    const totalStudentsResult = await query("SELECT COUNT(*) FROM students WHERE program_code = $1", [programCode])
    const totalStudents = Number.parseInt(totalStudentsResult.rows[0].count, 10)

    // Get total students in the same level
    const sameLevelStudentsResult = await query(
      "SELECT COUNT(*) FROM students WHERE program_code = $1 AND level = $2",
      [programCode, level],
    )
    const sameLevelStudents = Number.parseInt(sameLevelStudentsResult.rows[0].count, 10)

    // Get average activity in the program
    const avgActivityResult = await query(
      `SELECT 
         AVG(event_count) as avg_events,
         MAX(event_count) as max_events,
         MIN(event_count) as min_events
       FROM (
         SELECT 
           s.student_id,
           COUNT(e.id) as event_count
         FROM students s
         LEFT JOIN events e ON s.student_id = e.student_id
         WHERE s.program_code = $1
         GROUP BY s.student_id
       ) as student_events`,
      [programCode],
    )

    // Get student's activity rank in program
    const studentRankResult = await query(
      `SELECT student_rank
       FROM (
         SELECT 
           student_id,
           RANK() OVER (ORDER BY COUNT(e.id) DESC) as student_rank
         FROM students s
         LEFT JOIN events e ON s.student_id = e.student_id
         WHERE s.program_code = $1
         GROUP BY s.student_id
       ) as student_ranks
       WHERE student_id = $2`,
      [programCode, studentId],
    )

    return {
      programCode,
      programName,
      level,
      totalStudents,
      sameLevelStudents,
      averageEvents: Number.parseFloat(avgActivityResult.rows[0].avg_events) || 0,
      maxEvents: Number.parseInt(avgActivityResult.rows[0].max_events, 10) || 0,
      minEvents: Number.parseInt(avgActivityResult.rows[0].min_events, 10) || 0,
      studentRank:
        studentRankResult.rows.length > 0 ? Number.parseInt(studentRankResult.rows[0].student_rank, 10) : null,
    }
  }
}

