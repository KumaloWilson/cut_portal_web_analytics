import type { Request, Response } from "express"
import { StudentService } from "../services/student.service"

export class StudentController {
  static async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params
      const student = await StudentService.getStudentById(studentId)

      if (!student) {
        res.status(404).json({ error: "Student not found" })
        return
      }

      res.status(200).json(student)
    } catch (error) {
      console.error("Error fetching student:", error)
      res.status(500).json({ error: "Failed to fetch student" })
    }
  }

  static async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const students = await StudentService.getAllStudents()
      res.status(200).json(students)
    } catch (error) {
      console.error("Error fetching students:", error)
      res.status(500).json({ error: "Failed to fetch students" })
    }
  }

  static async createOrUpdateStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = req.body

      // Validate required fields
      if (!student.student_id) {
        res.status(400).json({ error: "Student ID is required" })
        return
      }

      const result = await StudentService.createOrUpdateStudent(student)
      res.status(201).json(result)
    } catch (error) {
      console.error("Error creating/updating student:", error)
      res.status(500).json({ error: "Failed to create/update student" })
    }
  }

  static async addModulesToStudent(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params
      const { modules, period_id } = req.body

      if (!Array.isArray(modules) || modules.length === 0) {
        res.status(400).json({ error: "Invalid modules data" })
        return
      }

      await StudentService.addModulesToStudent(studentId, modules, period_id)
      res.status(201).json({ message: `${modules.length} modules added for student ${studentId}` })
    } catch (error) {
      console.error("Error adding modules for student:", error)
      res.status(500).json({ error: "Failed to add modules" })
    }
  }

  static async getStudentModules(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params
      const modules = await StudentService.getStudentModules(studentId)
      res.status(200).json(modules)
    } catch (error) {
      console.error("Error fetching student modules:", error)
      res.status(500).json({ error: "Failed to fetch student modules" })
    }
  }
}
