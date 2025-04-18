import { pool } from "./database"
import bcrypt from "bcrypt"

export interface Admin {
  id?: number
  username: string
  email: string
  password: string
  created_at?: Date
  updated_at?: Date
}

export class AdminModel {
  static async findById(id: number): Promise<Admin | null> {
    const result = await pool.query("SELECT * FROM admins WHERE id = $1", [id])
    return result.rows[0] || null
  }

  static async findByEmail(email: string): Promise<Admin | null> {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email])
    return result.rows[0] || null
  }

  static async findByUsername(username: string): Promise<Admin | null> {
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username])
    return result.rows[0] || null
  }

  static async create(admin: Admin): Promise<Admin> {
    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(admin.password, saltRounds)

    const result = await pool.query(
      `INSERT INTO admins (username, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [admin.username, admin.email, hashedPassword],
    )

    return result.rows[0]
  }

  static async update(id: number, admin: Partial<Admin>): Promise<Admin | null> {
    // Start building the query
    let query = "UPDATE admins SET "
    const values: any[] = []
    const updateFields: string[] = []
    let paramIndex = 1

    // Add fields to update
    if (admin.username) {
      updateFields.push(`username = $${paramIndex++}`)
      values.push(admin.username)
    }

    if (admin.email) {
      updateFields.push(`email = $${paramIndex++}`)
      values.push(admin.email)
    }

    if (admin.password) {
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(admin.password, saltRounds)
      updateFields.push(`password = $${paramIndex++}`)
      values.push(hashedPassword)
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    // Complete the query
    query += updateFields.join(", ")
    query += ` WHERE id = $${paramIndex} RETURNING *`
    values.push(id)

    const result = await pool.query(query, values)
    return result.rows[0] || null
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM admins WHERE id = $1", [id])
    return result.rowCount > 0
  }

  static async validatePassword(admin: Admin, password: string): Promise<boolean> {
    return bcrypt.compare(password, admin.password)
  }
}
