import { pool } from "./database"

export interface Module {
  id?: number
  module_id: string
  module_name: string
  module_code: string
  created_at?: Date
}

export class ModuleModel {
  static async findById(moduleId: string): Promise<Module | null> {
    const result = await pool.query("SELECT * FROM modules WHERE module_id = $1", [moduleId])

    return result?.rows && result.rows.length > 0 ? result.rows[0] : null
  }

  static async findAll(): Promise<Module[]> {
    const result = await pool.query("SELECT * FROM modules ORDER BY module_name")

    return result.rows
  }

  static async create(module: Module): Promise<Module> {
    const { module_id, module_name, module_code } = module

    const result = await pool.query(
      `INSERT INTO modules 
       (module_id, module_name, module_code) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [module_id, module_name, module_code],
    )

    return result.rows[0]
  }

  static async exists(moduleId: string): Promise<boolean> {
    const result = await pool.query("SELECT module_id FROM modules WHERE module_id = $1", [moduleId])

    return (result?.rowCount ?? 0) > 0
  }

  static async addStudentModule(studentId: string, moduleId: string, periodId: string): Promise<void> {
    await pool.query(
      `INSERT INTO student_modules 
       (student_id, module_id, period_id) 
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, module_id, period_id) DO NOTHING`,
      [studentId, moduleId, periodId],
    )
  }

  static async getStudentModules(studentId: string): Promise<Module[]> {
    const result = await pool.query(
      `SELECT m.* 
       FROM modules m
       JOIN student_modules sm ON m.module_id = sm.module_id
       WHERE sm.student_id = $1`,
      [studentId],
    )

    return result.rows
  }
}

