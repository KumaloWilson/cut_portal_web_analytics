import { pool } from "./database"

export interface Student {
  id?: number
  student_id: string
  first_name?: string
  surname?: string
  email?: string
  programme_name?: string
  programme_code?: string
  faculty_name?: string
  level?: string
  created_at?: Date
  updated_at?: Date
}

export class StudentModel {
  static async findById(studentId: string): Promise<Student | null> {
    const result = await pool.query("SELECT * FROM students WHERE student_id = $1", [studentId])

    return (result?.rowCount ?? 0) > 0 ? result.rows[0] : null
  }

  static async findAll(): Promise<Student[]> {
    const result = await pool.query("SELECT * FROM students ORDER BY surname, first_name")

    return result.rows
  }

  static async create(student: Student): Promise<Student> {
    const { student_id, first_name, surname, email, programme_name, programme_code, faculty_name, level } = student

    const result = await pool.query(
      `INSERT INTO students 
       (student_id, first_name, surname, email, programme_name, programme_code, faculty_name, level) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [student_id, first_name, surname, email, programme_name, programme_code, faculty_name, level],
    )

    return result.rows[0]
  }

  static async update(student: Student): Promise<Student | null> {
    const { student_id, first_name, surname, email, programme_name, programme_code, faculty_name, level } = student

    const result = await pool.query(
      `UPDATE students 
       SET first_name = $2, 
           surname = $3, 
           email = $4, 
           programme_name = $5, 
           programme_code = $6, 
           faculty_name = $7, 
           level = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE student_id = $1 
       RETURNING *`,
      [student_id, first_name, surname, email, programme_name, programme_code, faculty_name, level],
    )

    return result?.rows && result.rows.length > 0 ? result.rows[0] : null
  }

  static async exists(studentId: string): Promise<boolean> {
    const result = await pool.query("SELECT student_id FROM students WHERE student_id = $1", [studentId])

    return (result?.rowCount ?? 0) > 0
  }
}
